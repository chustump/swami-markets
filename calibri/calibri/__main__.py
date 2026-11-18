"""Command line: ``python -m calibri train ...`` / ``python -m calibri generate ...``."""

from __future__ import annotations

import argparse
import os
import time

from .search import CalibriTrainer, SearchConfig, load_solution, read_prompts


def _add_model_args(p: argparse.ArgumentParser) -> None:
    p.add_argument("--model", default="black-forest-labs/FLUX.1-dev")
    p.add_argument("--granularity", choices=["block", "layer", "gate"], default="gate")
    p.add_argument("--num-models", type=int, default=1)
    p.add_argument("--device", default="cuda")
    p.add_argument("--dtype", choices=["fp32", "fp16", "bf16"], default="bf16")
    p.add_argument("--guidance-scale", type=float, default=3.5)
    p.add_argument("--image-size", type=int, default=512)
    p.add_argument("--steps", type=int, default=15, help="denoising steps")
    p.add_argument("--seed", type=int, default=42)


def _load_model(args):
    from .flux import CalibratedFlux

    return CalibratedFlux(args.model, args.granularity, args.num_models, args.device, args.dtype,
                          args.guidance_scale, args.image_size)


def train(args) -> None:
    from .rewards import build_reward

    model = _load_model(args)
    cfg = SearchConfig(
        seed=args.seed,
        initial_sigma=args.sigma,
        population_size=args.population,
        max_generations=args.generations,
        bucket_size=args.bucket_size,
        batch_size=args.batch_size,
        val_every=args.val_every,
        num_inference_steps=args.steps,
        num_inference_steps_val=args.steps,
    )
    logdir = os.path.join(args.logdir, f"flux_{args.granularity}_{time.strftime('%Y%m%d_%H%M%S')}")
    trainer = CalibriTrainer(
        model,
        build_reward(args.reward, args.device),
        read_prompts(args.train_prompts),
        cfg,
        val_prompts=read_prompts(args.val_prompts, args.val_limit) if args.val_prompts else None,
        eval_reward_fn=build_reward(args.eval_reward, args.device) if args.eval_reward else None,
        logdir=logdir,
        resume_state=args.resume,
    )
    trainer.train()
    print(f"best train reward {trainer.best_train:.4f}; checkpoints in {logdir}/checkpoints")


def generate(args) -> None:
    model = _load_model(args)
    if args.checkpoint:
        model.set_coefficients(load_solution(args.checkpoint))
    prompts = [args.prompt] if args.prompt else read_prompts(args.prompts)
    os.makedirs(args.out, exist_ok=True)
    for start in range(0, len(prompts), args.batch_size):
        batch = prompts[start:start + args.batch_size]
        for j, im in enumerate(model.generate(batch, seed=args.seed + start, num_inference_steps=args.steps)):
            path = os.path.join(args.out, f"{start + j:06d}.png")
            im.save(path)
            print(path)


def main() -> None:
    parser = argparse.ArgumentParser(prog="calibri")
    sub = parser.add_subparsers(dest="command", required=True)

    t = sub.add_parser("train", help="search for calibration coefficients with CMA-ES")
    _add_model_args(t)
    t.add_argument("--train-prompts", required=True, help="text file, one prompt per line")
    t.add_argument("--val-prompts")
    t.add_argument("--val-limit", type=int, default=-1)
    t.add_argument("--reward", default="pickscore", help='e.g. "pickscore" or "hpsv3_remote=1,pickscore=0.5"')
    t.add_argument("--eval-reward", help="reward for validation; defaults to --reward")
    t.add_argument("--sigma", type=float, default=0.25)
    t.add_argument("--population", type=int, default=None)
    t.add_argument("--generations", type=int, default=-1, help="-1 runs until CMA-ES converges")
    t.add_argument("--bucket-size", type=int, default=16)
    t.add_argument("--batch-size", type=int, default=4)
    t.add_argument("--val-every", type=int, default=10)
    t.add_argument("--logdir", default="logs")
    t.add_argument("--resume", help="path to a cmaes_state_*.pkl")
    t.set_defaults(func=train)

    g = sub.add_parser("generate", help="generate images, optionally with a calibration checkpoint")
    _add_model_args(g)
    g.add_argument("--checkpoint", help="checkpoint JSON; omit for the base model")
    src = g.add_mutually_exclusive_group(required=True)
    src.add_argument("--prompt")
    src.add_argument("--prompts", help="text file, one prompt per line")
    g.add_argument("--batch-size", type=int, default=4)
    g.add_argument("--out", default="outputs")
    g.set_defaults(func=generate)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
