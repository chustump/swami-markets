"""Gate calibration for FLUX-style diffusion transformers.

Calibri leaves every weight of the transformer frozen and learns only a
handful of scalars. Each transformer block computes

    x = x + gate_attn * Attn(norm(x))
    x = x + gate_mlp  * MLP(norm(x))

where the gates come out of the block's AdaLayerNormZero. A calibration
coefficient ``w`` multiplies a gate, so ``w = 1`` reproduces the base model,
``w = 0`` switches the layer off and ``w > 1`` amplifies it.

Three search spaces are supported, from coarse to fine:

``block``  one scalar per block, shared by attention and MLP
``layer``  separate scalars for attention and MLP in dual-stream blocks
``gate``   as ``layer``, plus separate scalars for the image and text streams

Several coefficient sets ("models") can be ensembled: the transformer is run
once per set and the outputs are combined with learned weights
``sum_m s_m * f(x; w_m)``. The weights ``s_m`` are part of the search vector.

The flat vector layout is the one used by the reference implementation
(https://github.com/v-gen-ai/Calibri), so its published ``weights/*.json``
files for FLUX load unchanged.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Sequence

import numpy as np
import torch

GRANULARITIES = ("block", "layer", "gate")

# Positions of the gates in the tuples returned by diffusers' norm layers:
# AdaLayerNormZero -> (x, gate_msa, shift_mlp, scale_mlp, gate_mlp)
# AdaLayerNormZeroSingle -> (x, gate)
_ATTN_GATE, _MLP_GATE, _SINGLE_GATE = 1, 4, 1


@dataclass(frozen=True)
class CoefficientLayout:
    granularity: str
    n_models: int
    n_double: int
    n_single: int

    @property
    def per_double(self) -> int:
        """Scalars per dual-stream block, per stream group."""
        return 1 if self.granularity == "block" else 2

    @property
    def doubles_main(self) -> int:
        return self.n_models * self.n_double * self.per_double

    @property
    def doubles_ctx(self) -> int:
        return self.doubles_main if self.granularity == "gate" else 0

    @property
    def singles(self) -> int:
        return self.n_models * self.n_single

    @property
    def total(self) -> int:
        return self.doubles_main + self.doubles_ctx + self.singles + self.n_models

    def as_dict(self) -> Dict[str, int | str]:
        return {
            "total": self.total,
            "n_models": self.n_models,
            "doubles_main": self.doubles_main,
            "doubles_ctx": self.doubles_ctx,
            "singles": self.singles,
            "n_double": self.n_double,
            "n_single": self.n_single,
            "granularity": self.granularity,
        }


class GateCalibrator:
    """Attach calibration coefficients to a FLUX-style transformer.

    The transformer must expose ``transformer_blocks`` (dual-stream blocks with
    ``norm1`` and, optionally, ``norm1_context``) and
    ``single_transformer_blocks`` (blocks with ``norm``), as diffusers'
    ``FluxTransformer2DModel`` does.
    """

    def __init__(self, transformer, granularity: str = "gate", num_models: int = 1):
        if granularity not in GRANULARITIES:
            raise ValueError(f"granularity must be one of {GRANULARITIES}, got {granularity!r}")
        if num_models < 1:
            raise ValueError("num_models must be >= 1")
        if getattr(transformer, "_calibri_attached", False):
            raise RuntimeError("this transformer already has a GateCalibrator attached")

        self.transformer = transformer
        self.layout = CoefficientLayout(
            granularity=granularity,
            n_models=num_models,
            n_double=len(transformer.transformer_blocks),
            n_single=len(getattr(transformer, "single_transformer_blocks", [])),
        )
        self._active = 0
        self._hooks: List = []
        self._original_forward = transformer.forward

        for p in transformer.parameters():
            p.requires_grad_(False)

        self.set_coefficients(self.identity())
        self._attach()

    # ------------------------------------------------------------------ vector

    def identity(self) -> np.ndarray:
        """The vector that reproduces the uncalibrated model."""
        x = np.ones(self.layout.total, dtype=np.float64)
        x[-self.layout.n_models:] = 0.0
        x[-self.layout.n_models] = 1.0
        return x

    def get_coefficients(self) -> np.ndarray:
        return self._x.copy()

    def set_coefficients(self, x: Sequence[float]) -> None:
        x = np.asarray(x, dtype=np.float64).ravel()
        lay = self.layout
        if x.size != lay.total:
            raise ValueError(
                f"expected {lay.total} coefficients for granularity={lay.granularity!r}, "
                f"{lay.n_double} dual + {lay.n_single} single blocks, {lay.n_models} model(s); "
                f"got {x.size}"
            )
        self._x = x.copy()

        off = 0
        main = x[off:off + lay.doubles_main].reshape(lay.n_models, lay.n_double, lay.per_double)
        off += lay.doubles_main
        if lay.granularity == "gate":
            ctx = x[off:off + lay.doubles_ctx].reshape(lay.n_models, lay.n_double, 2)
            off += lay.doubles_ctx
        else:
            ctx = main
        single = x[off:off + lay.singles].reshape(lay.n_models, lay.n_single)

        # [model, block, (attn, mlp)]; a "block" scalar is used for both layers
        self._main = np.repeat(main, 2, axis=2) if lay.per_double == 1 else main
        self._ctx = np.repeat(ctx, 2, axis=2) if lay.per_double == 1 else ctx
        self._single = single
        self._model_scales = x[-lay.n_models:]

    def describe(self) -> Dict[str, list]:
        """Coefficients as a readable structure (per model, per block)."""
        out = {
            "double_image": self._main.tolist(),
            "single": self._single.tolist(),
            "model_scales": self._model_scales.tolist(),
        }
        if self.layout.granularity == "gate":
            out["double_text"] = self._ctx.tolist()
        return out

    # ------------------------------------------------------------------- hooks

    def _double_hook(self, block_idx: int, table_name: str):
        def hook(module, args, output):
            if not isinstance(output, (tuple, list)) or len(output) <= _MLP_GATE:
                return output
            w_attn, w_mlp = getattr(self, table_name)[self._active, block_idx]
            out = list(output)
            out[_ATTN_GATE] = out[_ATTN_GATE] * float(w_attn)
            out[_MLP_GATE] = out[_MLP_GATE] * float(w_mlp)
            return tuple(out)
        return hook

    def _single_hook(self, block_idx: int):
        def hook(module, args, output):
            if not isinstance(output, (tuple, list)) or len(output) <= _SINGLE_GATE:
                return output
            out = list(output)
            out[_SINGLE_GATE] = out[_SINGLE_GATE] * float(self._single[self._active, block_idx])
            return tuple(out)
        return hook

    def _attach(self) -> None:
        t = self.transformer
        for i, block in enumerate(t.transformer_blocks):
            self._hooks.append(block.norm1.register_forward_hook(self._double_hook(i, "_main")))
            ctx_norm = getattr(block, "norm1_context", None)
            if ctx_norm is not None:
                self._hooks.append(ctx_norm.register_forward_hook(self._double_hook(i, "_ctx")))
        for i, block in enumerate(getattr(t, "single_transformer_blocks", [])):
            self._hooks.append(block.norm.register_forward_hook(self._single_hook(i)))

        t.forward = self._forward
        t._calibri_attached = True

    def _forward(self, *args, **kwargs):
        result = None
        try:
            for m, scale in enumerate(self._model_scales):
                self._active = m
                out = self._original_forward(*args, **kwargs)
                result = _accumulate(result, out, float(scale))
        finally:
            self._active = 0
        return result

    def remove(self) -> None:
        """Detach from the transformer, restoring the base model."""
        for h in self._hooks:
            h.remove()
        self._hooks = []
        # forward was shadowed on the instance; drop the shadow
        self.transformer.__dict__.pop("forward", None)
        self.transformer._calibri_attached = False


def _accumulate(total, out, scale: float):
    """total + scale * out, for tensors, tuples and diffusers output objects."""
    if torch.is_tensor(out):
        return out * scale if total is None else total + out * scale
    if isinstance(out, tuple):
        scaled = tuple(o * scale if torch.is_tensor(o) else o for o in out)
        if total is None:
            return scaled
        return tuple(t + s if torch.is_tensor(t) else t for t, s in zip(total, scaled))
    if hasattr(out, "sample"):  # e.g. Transformer2DModelOutput
        out.sample = out.sample * scale if total is None else total.sample + out.sample * scale
        return out
    raise TypeError(f"unsupported transformer output type: {type(out).__name__}")
