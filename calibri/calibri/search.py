"""CMA-ES search over calibration coefficients.

Calibration is treated as black-box reward maximisation: each generation,
CMA-ES proposes a population of coefficient vectors, every candidate generates
images for the same prompt bucket with the same noise seed, a reward model
scores the images, and the mean reward is fed back as the fitness.

No gradients flow through the generator or the reward model.
"""

from __future__ import annotations

import json
import os
import pickle
import time
from dataclasses import asdict, dataclass
from typing import Callable, Dict, List, Optional, Protocol, Sequence

import cma
import numpy as np

VAL_SEED = 1234


class CalibratedGenerator(Protocol):
    """What the trainer needs from an image generator."""

    def get_coefficients(self) -> np.ndarray: ...
    def set_coefficients(self, x: Sequence[float]) -> None: ...
    def coefficient_shapes(self) -> Dict: ...
    def generate(self, prompts: List[str], seed: int, num_inference_steps: int) -> list: ...


# reward(images, prompts) -> {"avg": [score per image], ...other named scores}
RewardFn = Callable[[list, List[str]], Dict[str, Sequence[float]]]


@dataclass
class SearchConfig:
    seed: int = 42
    initial_sigma: float = 0.25
    population_size: Optional[int] = None  # None: CMA-ES default, 4 + 3*ln(dim)
    max_generations: int = -1              # -1: run until CMA-ES converges
    bucket_size: int = 16                  # prompts per generation
    batch_size: int = 4                    # prompts per generator call
    val_every: int = 10                    # generations between validations; 0 disables
    blocks_bound_low: float = -1.0
    blocks_bound_high: float = 2.0
    models_bound_low: float = -10.0
    models_bound_high: float = 10.0
    num_inference_steps: int = 15
    num_inference_steps_val: int = 15
    eval_base_model: bool = True


class CalibriTrainer:
    def __init__(
        self,
        generator: CalibratedGenerator,
        reward_fn: RewardFn,
        train_prompts: Sequence[str],
        cfg: SearchConfig = SearchConfig(),
        val_prompts: Optional[Sequence[str]] = None,
        eval_reward_fn: Optional[RewardFn] = None,
        logdir: Optional[str] = None,
        resume_state: Optional[str] = None,
        log: Callable[[str], None] = print,
    ):
        if len(train_prompts) == 0:
            raise ValueError("train_prompts is empty")
        self.generator = generator
        self.reward_fn = reward_fn
        self.eval_reward_fn = eval_reward_fn or reward_fn
        self.train_prompts = list(train_prompts)
        self.val_prompts = list(val_prompts) if val_prompts else []
        self.cfg = cfg
        self.logdir = logdir
        self.log = log

        self.shapes = generator.coefficient_shapes()
        x0 = np.asarray(generator.get_coefficients(), dtype=np.float64)
        n_models = int(self.shapes["n_models"])
        n_blocks = x0.size - n_models

        self.generation = 0
        self.best_solution = x0.copy()
        self.best_train = -np.inf
        self.best_val = -np.inf
        self.history: List[Dict] = []
        self._prompt_rng = np.random.default_rng(cfg.seed)
        self._order: List[int] = []
        self._last_checkpoint = -1

        if resume_state:
            with open(resume_state, "rb") as f:
                st = pickle.load(f)
            self.es = st["es"]
            self.generation = st["generation"]
            self.best_solution = st["best_solution"]
            self.best_train = st["best_train"]
            self.best_val = st["best_val"]
            self.history = st["history"]
            self._prompt_rng = st["prompt_rng"]
            self._order = st["order"]
        else:
            opts = {
                "seed": cfg.seed,
                "verbose": -9,
                "bounds": [
                    [cfg.blocks_bound_low] * n_blocks + [cfg.models_bound_low] * n_models,
                    [cfg.blocks_bound_high] * n_blocks + [cfg.models_bound_high] * n_models,
                ],
            }
            if cfg.population_size:
                opts["popsize"] = int(cfg.population_size)
            self.es = cma.CMAEvolutionStrategy(x0, cfg.initial_sigma, opts)
            # make sure the uncalibrated model is among the first candidates
            self.es.inject([self.es.gp.geno(x0)], force=True)

    # -------------------------------------------------------------- evaluation

    def _next_bucket(self) -> List[str]:
        n = min(self.cfg.bucket_size, len(self.train_prompts))
        while len(self._order) < n:
            self._order.extend(self._prompt_rng.permutation(len(self.train_prompts)).tolist())
        idx, self._order = self._order[:n], self._order[n:]
        return [self.train_prompts[i] for i in idx]

    def _score(self, x, prompts: List[str], seed: int, steps: int, reward_fn: RewardFn,
               save_dir: Optional[str] = None) -> Dict[str, float]:
        """Mean reward of coefficient vector ``x`` over ``prompts``."""
        self.generator.set_coefficients(x)
        sums: Dict[str, float] = {}
        bs = max(1, self.cfg.batch_size)
        for start in range(0, len(prompts), bs):
            batch = prompts[start:start + bs]
            # a distinct seed per batch, identical across candidates
            images = self.generator.generate(batch, seed=seed * 100003 + start, num_inference_steps=steps)
            if save_dir is not None:
                os.makedirs(save_dir, exist_ok=True)
                for j, im in enumerate(images):
                    if hasattr(im, "save"):
                        im.save(os.path.join(save_dir, f"{start + j:06d}.png"))
            scores = reward_fn(images, batch)
            for name, vals in scores.items():
                sums[name] = sums.get(name, 0.0) + float(np.sum(np.asarray(vals, dtype=np.float64)))
        return {name: s / len(prompts) for name, s in sums.items()}

    def validate(self, x, step: int, save_images: bool = False) -> Optional[Dict[str, float]]:
        if not self.val_prompts:
            return None
        save_dir = None
        if save_images and self.logdir:
            save_dir = os.path.join(self.logdir, "eval", f"step_{step}")
        return self._score(x, self.val_prompts, VAL_SEED, self.cfg.num_inference_steps_val,
                           self.eval_reward_fn, save_dir)

    # ------------------------------------------------------------- checkpoints

    def _checkpoint(self, step: int, train_mean: float, val: Optional[float], x: np.ndarray) -> None:
        self._last_checkpoint = step
        if not self.logdir:
            return
        d = os.path.join(self.logdir, "checkpoints", f"step_{step}")
        os.makedirs(d, exist_ok=True)
        payload = {
            "step": int(step),
            "train_best": float(self.best_train),
            "train_mean": float(train_mean),
            "val": None if val is None else float(val),
            "solution": [float(v) for v in x],
            "shapes": self.shapes,
            "sigma": float(self.es.sigma),
            "timestamp": int(time.time()),
        }
        with open(os.path.join(d, f"cmaes_step_{step:04d}.json"), "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
        state = {
            "es": self.es,
            "generation": self.generation,
            "best_solution": self.best_solution,
            "best_train": self.best_train,
            "best_val": self.best_val,
            "history": self.history,
            "prompt_rng": self._prompt_rng,
            "order": self._order,
            "config": asdict(self.cfg),
        }
        with open(os.path.join(d, f"cmaes_state_{step:04d}.pkl"), "wb") as f:
            pickle.dump(state, f)

    # -------------------------------------------------------------------- loop

    def train(self) -> np.ndarray:
        cfg = self.cfg

        if cfg.eval_base_model and self.generation == 0 and self.val_prompts:
            val = self.validate(self.generator.get_coefficients(), 0)
            self.log(f"[gen 0] base model val: {_fmt(val)}")
            self._checkpoint(0, float("nan"), val["avg"], self.generator.get_coefficients())

        while not self.es.stop() and (cfg.max_generations < 0 or self.generation < cfg.max_generations):
            step = self.generation + 1
            bucket = self._next_bucket()
            candidates = self.es.ask()

            scores = [
                self._score(x, bucket, cfg.seed + self.generation, cfg.num_inference_steps, self.reward_fn)
                for x in candidates
            ]
            rewards = np.array([s["avg"] for s in scores])
            self.es.tell(candidates, (-rewards).tolist())  # CMA-ES minimises

            best_idx = int(np.argmax(rewards))
            if rewards[best_idx] > self.best_train:
                self.best_train = float(rewards[best_idx])
                self.best_solution = np.asarray(candidates[best_idx], dtype=np.float64).copy()
            self.generation = step

            record = {
                "step": step,
                "train_best": float(rewards[best_idx]),
                "train_mean": float(rewards.mean()),
                "sigma": float(self.es.sigma),
                "val": None,
            }
            self.log(f"[gen {step}] best {record['train_best']:.4f}  mean {record['train_mean']:.4f}  "
                     f"sigma {record['sigma']:.4f}  pop {len(candidates)}")

            if cfg.val_every > 0 and (step % cfg.val_every == 0 or step == cfg.max_generations):
                val = self.validate(self.best_solution, step)
                if val is not None:
                    record["val"] = val
                    self.best_val = max(self.best_val, val["avg"])
                    self.log(f"[gen {step}] val: {_fmt(val)}")
                self.history.append(record)
                self._checkpoint(step, record["train_mean"], val["avg"] if val else None, self.best_solution)
            else:
                self.history.append(record)

        # the last generation is already checkpointed if it ended on a validation step
        if self._last_checkpoint != self.generation:
            last_mean = self.history[-1]["train_mean"] if self.history else float("nan")
            self._checkpoint(self.generation, last_mean, None, self.best_solution)
        self.generator.set_coefficients(self.best_solution)
        return self.best_solution


def _fmt(scores: Optional[Dict[str, float]]) -> str:
    if not scores:
        return "n/a"
    return "  ".join(f"{k}={v:.4f}" for k, v in scores.items())


def load_solution(path: str) -> np.ndarray:
    """Read the coefficient vector from a checkpoint JSON (ours or the reference repo's)."""
    with open(path, "r", encoding="utf-8") as f:
        return np.asarray(json.load(f)["solution"], dtype=np.float64)


def read_prompts(path: str, limit: int = -1) -> List[str]:
    """One prompt per line; blank lines are skipped."""
    with open(path, "r", encoding="utf-8") as f:
        prompts = [line.strip() for line in f if line.strip()]
    return prompts[:limit] if limit and limit > 0 else prompts
