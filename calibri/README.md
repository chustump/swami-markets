# Calibri

A reimplementation of [Calibri: Enhancing Diffusion Transformers via
Parameter-Efficient Calibration](https://github.com/v-gen-ai/Calibri) for
FLUX-style transformers.

This directory is a standalone Python package. It is not used by the Next.js
app in the rest of the repository.

## The method

Every weight of the image generator stays frozen. Each transformer block
adds its attention and MLP outputs to the residual stream through a gate:

    x = x + gate_attn * Attn(norm(x))
    x = x + gate_mlp  * MLP(norm(x))

Calibri multiplies those gates by learned scalars (1.0 = base model). Three
search spaces are available:

| Granularity | What gets its own scalar                         | FLUX.1-dev size |
|-------------|--------------------------------------------------|-----------------|
| `block`     | each block                                       | 58              |
| `layer`     | attention and MLP in dual-stream blocks          | 77              |
| `gate`      | as `layer`, split by image and text stream       | 115             |

The scalars are found with CMA-ES, a gradient-free evolutionary search. Each
generation, every candidate vector generates images for the same prompts
with the same noise, a human-preference model (PickScore, HPSv3, ImageReward)
scores them, and the mean score is the candidate's fitness.

With `--num-models N`, N coefficient sets are searched jointly and the
transformer outputs are combined as `sum_m s_m * f(x; w_m)`; the weights
`s_m` are part of the search vector.

## Layout

    calibri/scaling.py    GateCalibrator: hooks, coefficient vector layout, ensembling
    calibri/search.py     CalibriTrainer: CMA-ES loop, validation, checkpoints, resume
    calibri/rewards.py    PickScore, ImageReward, remote HPSv3, weighted combination
    calibri/flux.py       FLUX.1-dev wrapper
    calibri/__main__.py   command line
    weights/              FLUX gate-level coefficients published by the paper's authors (MIT)

## Install

    pip install -e ".[flux,rewards]"

## Use

Generate with the authors' published coefficients:

    python -m calibri generate --granularity gate \
        --checkpoint weights/flux_gates.json \
        --prompt "a futuristic city at sunset" --out outputs

Run a search (needs a GPU that fits FLUX.1-dev and access to its weights on
Hugging Face):

    python -m calibri train --granularity layer --reward pickscore \
        --train-prompts train.txt --val-prompts val.txt

Prompt files hold one prompt per line. The paper uses T2I-CompBench prompts,
available in the reference repository under `data/`. Checkpoints are written
to `logs/<run>/checkpoints/step_N/` as a JSON (the coefficients) and a pickle
(the CMA-ES state, for `--resume`).

In code, the calibrator works on any transformer shaped like diffusers'
`FluxTransformer2DModel`:

```python
from calibri import GateCalibrator, load_solution

cal = GateCalibrator(pipe.transformer, granularity="gate")
cal.set_coefficients(load_solution("weights/flux_gates.json"))
image = pipe("a futuristic city at sunset", num_inference_steps=15).images[0]
cal.remove()  # back to the base model
```

## Tests

    pip install -e ".[dev]"
    pytest

The tests run on CPU against a tiny randomly initialised FLUX transformer.
They cover the calibration mechanics and the search loop, not image quality.

## Differences from the reference implementation

- FLUX only. The SD3.5 and Qwen-Image variants, which fold classifier-free
  guidance into the model ensemble with custom sampling loops, are not ported.
- Single process. The reference shards candidates across GPUs with
  `accelerate`; here candidates are evaluated one after another.
- Rewards: PickScore, ImageReward and remote HPSv3. Q-Align and the other
  scorers are not ported.
- Coefficients are plain floats applied by persistent hooks, rather than
  `nn.Parameter`s recreated on every update. The coefficient vector layout and
  checkpoint JSON format are unchanged, so checkpoints are interchangeable.
- Each prompt batch within a bucket gets its own noise seed (still identical
  across candidates).
- Resuming restores the training history and prompt order.
