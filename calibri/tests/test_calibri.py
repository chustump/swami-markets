"""CPU tests on a tiny, randomly initialised FLUX transformer.

These check the calibration mechanics and the search loop. They say nothing
about image quality on the real FLUX.1-dev weights, which needs a GPU.
"""

import json
import os

import numpy as np
import pytest
import torch

from calibri import CalibriTrainer, GateCalibrator, SearchConfig, load_solution

diffusers = pytest.importorskip("diffusers")

N_DOUBLE, N_SINGLE = 2, 3
REFERENCE_WEIGHTS = os.path.join(os.path.dirname(__file__), "..", "weights", "flux_gates.json")


def tiny_flux(seed=0):
    torch.manual_seed(seed)
    t = diffusers.FluxTransformer2DModel(
        patch_size=1, in_channels=4, num_layers=N_DOUBLE, num_single_layers=N_SINGLE,
        attention_head_dim=8, num_attention_heads=2, joint_attention_dim=16,
        pooled_projection_dim=8, guidance_embeds=True, axes_dims_rope=(2, 2, 4),
    ).eval()
    # diffusers zero-initialises the output projection; randomise it so outputs are non-trivial
    for p in t.parameters():
        if p.abs().sum() == 0:
            torch.nn.init.normal_(p, std=0.5)
    return t


def inputs(seed=1, batch=1):
    g = torch.Generator().manual_seed(seed)
    return dict(
        hidden_states=torch.randn(batch, 6, 4, generator=g),
        encoder_hidden_states=torch.randn(batch, 5, 16, generator=g),
        pooled_projections=torch.randn(batch, 8, generator=g),
        timestep=torch.full((batch,), 0.5),
        guidance=torch.full((batch,), 3.5),
        img_ids=torch.zeros(6, 3),
        txt_ids=torch.zeros(5, 3),
        return_dict=False,
    )


@torch.no_grad()
def run(t, **kw):
    return t(**inputs(**kw))[0]


@pytest.mark.parametrize("granularity,expected", [
    ("block", N_DOUBLE + N_SINGLE + 1),
    ("layer", 2 * N_DOUBLE + N_SINGLE + 1),
    ("gate", 4 * N_DOUBLE + N_SINGLE + 1),
])
def test_layout_size_and_identity(granularity, expected):
    t = tiny_flux()
    base = run(t)
    cal = GateCalibrator(t, granularity)
    assert cal.layout.total == expected == cal.get_coefficients().size
    assert torch.equal(run(t), base)


def test_real_flux_dimensions_match_paper():
    # FLUX.1-dev has 19 dual-stream and 38 single-stream blocks
    from calibri import CoefficientLayout
    sizes = {g: CoefficientLayout(g, 1, 19, 38).total for g in ("block", "layer", "gate")}
    assert sizes == {"block": 58, "layer": 77, "gate": 115}


def test_every_coefficient_changes_the_output():
    t = tiny_flux()
    cal = GateCalibrator(t, "gate")
    base = run(t)
    for i in range(cal.layout.total):
        x = cal.identity()
        x[i] = 1.7
        cal.set_coefficients(x)
        assert not torch.allclose(run(t), base, atol=1e-6), f"coefficient {i} has no effect"


def test_zero_gates_equal_skipping_the_layers():
    """With all gates at 0 the blocks are identity maps, whatever their weights."""
    a, b = tiny_flux(seed=0), tiny_flux(seed=0)
    for blocks in (b.transformer_blocks, b.single_transformer_blocks):
        for block in blocks:
            for name, p in block.named_parameters():
                if "attn" in name or "ff" in name or "proj_mlp" in name or "proj_out" in name:
                    torch.nn.init.normal_(p)
    assert not torch.allclose(run(a), run(b), atol=1e-5)

    for t in (a, b):
        cal = GateCalibrator(t, "block")
        x = np.zeros(cal.layout.total)
        x[-1] = 1.0
        cal.set_coefficients(x)
    assert torch.allclose(run(a), run(b), atol=1e-5)


def test_granularities_agree_when_coefficients_are_tied():
    rng = np.random.default_rng(0)
    d, s = rng.uniform(0.3, 1.8, N_DOUBLE), rng.uniform(0.3, 1.8, N_SINGLE)
    outs = []
    for g, reps in (("block", 1), ("layer", 2), ("gate", 4)):
        t = tiny_flux()
        cal = GateCalibrator(t, g)
        if g == "gate":   # main stream then context stream, (attn, mlp) per block
            doubles = np.tile(np.repeat(d, 2), 2)
        else:
            doubles = np.repeat(d, reps)
        cal.set_coefficients(np.concatenate([doubles, s, [1.0]]))
        outs.append(run(t))
    assert torch.allclose(outs[0], outs[1], atol=1e-6)
    assert torch.allclose(outs[0], outs[2], atol=1e-6)


def test_image_and_text_stream_gates_are_separate():
    t = tiny_flux()
    cal = GateCalibrator(t, "gate")
    x = cal.identity()
    x[2 * N_DOUBLE] = 0.2          # first text-stream attention gate
    cal.set_coefficients(x)
    d = cal.describe()
    assert d["double_text"][0][0] == [0.2, 1.0]
    assert d["double_image"][0][0] == [1.0, 1.0]


def test_model_ensemble_is_weighted_sum():
    rng = np.random.default_rng(1)
    w1, w2 = rng.uniform(0.3, 1.8, (2, N_DOUBLE + N_SINGLE))

    single = tiny_flux()
    cal = GateCalibrator(single, "block")
    outs = []
    for w in (w1, w2):
        cal.set_coefficients(np.concatenate([w, [1.0]]))
        outs.append(run(single))

    t = tiny_flux()
    ens = GateCalibrator(t, "block", num_models=2)
    x = np.concatenate([w1[:N_DOUBLE], w2[:N_DOUBLE], w1[N_DOUBLE:], w2[N_DOUBLE:], [4.0, -3.0]])
    ens.set_coefficients(x)
    assert torch.allclose(run(t), 4.0 * outs[0] - 3.0 * outs[1], atol=1e-5)

    # the default second model has weight 0, so the ensemble starts at the base model
    ens.set_coefficients(ens.identity())
    cal.set_coefficients(cal.identity())
    assert torch.allclose(run(t), run(single), atol=1e-6)


def test_remove_restores_base_model():
    t = tiny_flux()
    base = run(t)
    cal = GateCalibrator(t, "layer")
    cal.set_coefficients(cal.identity() * 0.5)
    assert not torch.allclose(run(t), base)
    cal.remove()
    assert torch.equal(run(t), base)
    GateCalibrator(t, "gate")  # can attach again


def test_wrong_vector_size_is_rejected():
    cal = GateCalibrator(tiny_flux(), "block")
    with pytest.raises(ValueError, match="expected 6 coefficients"):
        cal.set_coefficients(np.ones(5))


def test_reference_weights_have_gate_layout():
    if not os.path.exists(REFERENCE_WEIGHTS):
        pytest.skip("reference weights not present")
    x = load_solution(REFERENCE_WEIGHTS)
    assert x.size == 115
    assert -1.0 <= x[:-1].min() and x[:-1].max() <= 2.0


# ----------------------------------------------------------------- search loop

class TinyGenerator:
    """Stands in for a diffusion pipeline: the 'image' is the transformer output."""

    def __init__(self, granularity="block"):
        self.t = tiny_flux()
        self.cal = GateCalibrator(self.t, granularity)
        self.calls = []

    def get_coefficients(self):
        return self.cal.get_coefficients()

    def set_coefficients(self, x):
        self.cal.set_coefficients(x)

    def coefficient_shapes(self):
        return self.cal.layout.as_dict()

    def generate(self, prompts, seed, num_inference_steps):
        self.calls.append((tuple(prompts), seed))
        return list(run(self.t, seed=seed, batch=len(prompts)))


def make_problem():
    """Reward = closeness to the outputs of a hidden 'teacher' calibration."""
    gen = TinyGenerator("block")
    teacher = np.array([1.6, 0.4, 0.5, 1.5, 0.7, 1.0])

    def reward(images, prompts):
        student = torch.stack(images)
        current = gen.get_coefficients()
        gen.set_coefficients(teacher)
        target = run(gen.t, seed=gen.calls[-1][1], batch=len(prompts))
        gen.set_coefficients(current)
        return {"avg": (-(student - target).pow(2).mean(dim=(1, 2))).tolist()}

    return gen, reward, teacher


def test_cmaes_improves_reward_and_writes_checkpoints(tmp_path):
    gen, reward, teacher = make_problem()
    prompts = [f"prompt {i}" for i in range(8)]
    cfg = SearchConfig(seed=0, max_generations=40, bucket_size=4, batch_size=2, val_every=20)
    trainer = CalibriTrainer(gen, reward, prompts, cfg, val_prompts=prompts[:4],
                             logdir=str(tmp_path), log=lambda s: None)

    base_val = trainer.validate(gen.get_coefficients(), 0)["avg"]
    best = trainer.train()
    final_val = trainer.validate(best, 40)["avg"]

    assert final_val > base_val
    assert abs(final_val) < 0.1 * abs(base_val)        # >10x closer to the teacher
    assert np.all((best[:-1] >= -1.0) & (best[:-1] <= 2.0))
    assert np.allclose(gen.get_coefficients(), best)   # best solution left applied

    ckpt = tmp_path / "checkpoints" / "step_40" / "cmaes_step_0040.json"
    payload = json.loads(ckpt.read_text())
    assert payload["shapes"]["total"] == 6 and payload["val"] is not None
    assert np.allclose(load_solution(str(ckpt)), best)


def test_all_candidates_see_same_prompts_and_seed():
    gen, reward, _ = make_problem()
    cfg = SearchConfig(seed=3, max_generations=1, bucket_size=4, batch_size=4,
                       population_size=6, val_every=0)
    CalibriTrainer(gen, reward, [f"p{i}" for i in range(10)], cfg, log=lambda s: None).train()
    assert len(gen.calls) == 6
    assert len(set(gen.calls)) == 1


def test_first_generation_includes_base_model():
    gen, reward, _ = make_problem()
    seen = []
    original = gen.set_coefficients
    gen.set_coefficients = lambda x: (seen.append(np.asarray(x).copy()), original(x))[1]
    cfg = SearchConfig(seed=0, max_generations=1, val_every=0)
    CalibriTrainer(gen, reward, ["a", "b"], cfg, log=lambda s: None).train()
    assert any(np.allclose(x, gen.cal.identity()) for x in seen)


def test_resume_continues_from_saved_state(tmp_path):
    gen, reward, _ = make_problem()
    prompts = [f"prompt {i}" for i in range(8)]
    cfg = SearchConfig(seed=0, max_generations=10, bucket_size=4, val_every=10)
    first = CalibriTrainer(gen, reward, prompts, cfg, val_prompts=prompts[:2],
                           logdir=str(tmp_path), log=lambda s: None)
    first.train()

    state = tmp_path / "checkpoints" / "step_10" / "cmaes_state_0010.pkl"
    cfg2 = SearchConfig(seed=0, max_generations=15, bucket_size=4, val_every=0)
    resumed = CalibriTrainer(gen, reward, prompts, cfg2, resume_state=str(state), log=lambda s: None)
    assert resumed.generation == 10 and len(resumed.history) == 10
    resumed.train()
    assert resumed.generation == 15 and len(resumed.history) == 15
    assert resumed.best_train >= first.best_train


def test_weighted_reward():
    from calibri.rewards import weighted_reward
    fn = weighted_reward({"a": lambda im, p: [1.0, 2.0], "b": lambda im, p: [10.0, 20.0]},
                         {"a": 1.0, "b": 0.5})
    assert fn([None, None], ["x", "y"]) == {"a": [1.0, 2.0], "b": [10.0, 20.0], "avg": [6.0, 12.0]}
