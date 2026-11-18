"""Reward models used as the calibration objective.

A scorer is ``fn(images, prompts) -> sequence of floats`` (one per image).
``weighted_reward`` combines several into the dict the trainer expects, where
``"avg"`` is the weighted sum that CMA-ES maximises.

Heavy dependencies are imported lazily so the rest of the package works
without them.
"""

from __future__ import annotations

import io
import os
import pickle
from typing import Callable, Dict, List, Sequence

Scorer = Callable[[list, List[str]], Sequence[float]]


def weighted_reward(scorers: Dict[str, Scorer], weights: Dict[str, float]):
    missing = set(weights) - set(scorers)
    if missing:
        raise KeyError(f"no scorer for: {sorted(missing)}")

    def fn(images, prompts):
        out: Dict[str, List[float]] = {}
        total = [0.0] * len(prompts)
        for name, weight in weights.items():
            scores = [float(s) for s in scorers[name](images, prompts)]
            if len(scores) != len(prompts):
                raise ValueError(f"scorer {name!r} returned {len(scores)} scores for {len(prompts)} prompts")
            out[name] = scores
            total = [t + weight * s for t, s in zip(total, scores)]
        out["avg"] = total
        return out

    return fn


def pickscore(device: str = "cuda") -> Scorer:
    """PickScore v1 (CLIP-H fine-tuned on human image preferences)."""
    import torch
    from transformers import CLIPModel, CLIPProcessor

    processor = CLIPProcessor.from_pretrained("laion/CLIP-ViT-H-14-laion2B-s32B-b79K")
    model = CLIPModel.from_pretrained("yuvalkirstain/PickScore_v1").eval().to(device)

    @torch.no_grad()
    def fn(images, prompts):
        img = processor(images=images, return_tensors="pt").to(device)
        txt = processor(text=list(prompts), padding=True, truncation=True, max_length=77,
                        return_tensors="pt").to(device)
        img_emb = model.get_image_features(**img)
        txt_emb = model.get_text_features(**txt)
        img_emb = img_emb / img_emb.norm(dim=-1, keepdim=True)
        txt_emb = txt_emb / txt_emb.norm(dim=-1, keepdim=True)
        scores = model.logit_scale.exp() * (txt_emb * img_emb).sum(dim=-1)
        return (scores / 26).float().cpu().tolist()

    return fn


def imagereward(device: str = "cuda") -> Scorer:
    """ImageReward v1.0. Requires the ``image-reward`` package."""
    import ImageReward as RM

    model = RM.load("ImageReward-v1.0", device=device)

    def fn(images, prompts):
        return [float(model.score(p, [im])) for im, p in zip(images, prompts)]

    return fn


def hpsv3_remote(url: str | None = None, batch_size: int = 8) -> Scorer:
    """HPSv3 served by the reference repo's ``src/metrics/hpsv3_server.py``.

    The server speaks pickle over HTTP, so only point this at a server you run
    yourself: unpickling a response from an untrusted host can execute code.
    """
    import requests

    url = url or os.environ.get("HPSV3_URL", "http://127.0.0.1:18067")
    session = requests.Session()

    def fn(images, prompts):
        scores: List[float] = []
        for i in range(0, len(images), batch_size):
            jpegs = []
            for im in images[i:i + batch_size]:
                buf = io.BytesIO()
                im.save(buf, format="JPEG", quality=95)
                jpegs.append(buf.getvalue())
            payload = pickle.dumps({"images": jpegs, "prompts": list(prompts[i:i + batch_size])})
            resp = session.post(url, data=payload, timeout=600)
            if resp.status_code != 200:
                raise RuntimeError(f"HPSv3 server returned HTTP {resp.status_code}")
            scores.extend(float(s) for s in pickle.loads(resp.content)["scores"])
        return scores

    return fn


REGISTRY: Dict[str, Callable[[str], Scorer]] = {
    "pickscore": pickscore,
    "imagereward": imagereward,
    "hpsv3_remote": lambda device: hpsv3_remote(),
}


def build_reward(spec: str, device: str = "cuda"):
    """Build a reward from ``"name"`` or ``"name=weight,name=weight"``."""
    weights: Dict[str, float] = {}
    for part in spec.split(","):
        name, _, weight = part.strip().partition("=")
        if name not in REGISTRY:
            raise KeyError(f"unknown reward {name!r}; available: {sorted(REGISTRY)}")
        weights[name] = float(weight) if weight else 1.0
    return weighted_reward({name: REGISTRY[name](device) for name in weights}, weights)
