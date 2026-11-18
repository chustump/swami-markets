"""FLUX.1-dev with Calibri coefficients attached."""

from __future__ import annotations

from typing import Dict, List, Sequence

import numpy as np
import torch

from .scaling import GateCalibrator

DTYPES = {"fp32": torch.float32, "fp16": torch.float16, "bf16": torch.bfloat16}


class CalibratedFlux:
    def __init__(
        self,
        model_name: str = "black-forest-labs/FLUX.1-dev",
        granularity: str = "gate",
        num_models: int = 1,
        device: str = "cuda",
        dtype: str = "bf16",
        guidance_scale: float = 3.5,
        image_size: int = 512,
    ):
        from diffusers import FluxPipeline

        self.pipeline = FluxPipeline.from_pretrained(model_name, torch_dtype=DTYPES[dtype]).to(device)
        self.pipeline.set_progress_bar_config(disable=True)
        self.calibrator = GateCalibrator(self.pipeline.transformer, granularity, num_models)
        self.guidance_scale = guidance_scale
        self.image_size = image_size

    def get_coefficients(self) -> np.ndarray:
        return self.calibrator.get_coefficients()

    def set_coefficients(self, x: Sequence[float]) -> None:
        self.calibrator.set_coefficients(x)

    def coefficient_shapes(self) -> Dict:
        return self.calibrator.layout.as_dict()

    @torch.inference_mode()
    def generate(self, prompts: List[str], seed: int, num_inference_steps: int = 15) -> list:
        # CPU generator: the same seed gives the same noise on any device
        generator = torch.Generator(device="cpu").manual_seed(int(seed))
        return self.pipeline(
            list(prompts),
            num_inference_steps=num_inference_steps,
            guidance_scale=self.guidance_scale,
            height=self.image_size,
            width=self.image_size,
            generator=generator,
        ).images
