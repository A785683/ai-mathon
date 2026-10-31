import cv2
import numpy as np
import torch
import torch.nn.functional as F
from typing import Tuple, Optional

class RealGradCAM:
    """
    Gradient-weighted Class Activation Mapping (Grad-CAM)
    Targeting EfficientNet-B0's final convolutional block (`model.backbone.blocks[-1]`).
    Reuses the validated hook implementation from the upstream repository.
    """

    def __init__(self, model: torch.nn.Module, target_layer: torch.nn.Module):
        self.model = model
        self.model.eval()
        self.gradients = None
        self.activations = None
        self._hooks = []

        h1 = target_layer.register_forward_hook(self._save_activation)
        h2 = target_layer.register_full_backward_hook(self._save_gradient)
        self._hooks.extend([h1, h2])

    def _save_activation(self, module, input, output):
        self.activations = output.detach()

    def _save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def generate(self, input_tensor: torch.Tensor, class_idx: Optional[int] = None) -> np.ndarray:
        """
        Computes the gradient of the predicted class score with respect to
        the target convolutional feature maps.
        Returns a normalized 2D CAM array in [0.0, 1.0].
        """
        output = self.model(input_tensor)

        if class_idx is None:
            class_idx = int(output.argmax(dim=1).item())

        self.model.zero_grad()
        one_hot = torch.zeros_like(output)
        one_hot[0, class_idx] = 1.0
        output.backward(gradient=one_hot)

        if self.gradients is None or self.activations is None:
            return np.zeros((input_tensor.shape[2], input_tensor.shape[3]), dtype=np.float32)

        # Global average pool gradients across spatial dimensions (1, C, 1, 1)
        weights = self.gradients.mean(dim=[2, 3], keepdim=True)
        # Weighted combination of forward activation maps
        cam = (weights * self.activations).sum(dim=1, keepdim=True)
        cam = F.relu(cam)
        cam = cam.squeeze().cpu().numpy()

        # Min-max normalization
        cam -= cam.min()
        if cam.max() > 0:
            cam /= cam.max()
        else:
            cam = np.zeros_like(cam)

        return cam

    def cleanup(self):
        for h in self._hooks:
            h.remove()
        self._hooks.clear()


def generate_gradcam_visuals(
    model: torch.nn.Module,
    image_rgb_160: np.ndarray,
    target_dim: Tuple[int, int] = (512, 512),
    class_idx: Optional[int] = None
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Executes Grad-CAM and returns:
      1. heatmap_rgb: 3-channel colorized Jet heatmap resized to target_dim
      2. overlay_rgb: 50% alpha blended overlay on original preprocessed retina
    """
    # 1. ImageNet normalize
    img_norm = image_rgb_160.astype(np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    img_norm = (img_norm - mean) / std

    device = next(model.parameters()).device
    tensor = torch.from_numpy(img_norm).permute(2, 0, 1).unsqueeze(0).float().to(device)

    # 2. Target layer: last block of EfficientNet-B0
    target_layer = model.backbone.blocks[-1]
    explainer = RealGradCAM(model, target_layer)

    try:
        cam_raw = explainer.generate(tensor, class_idx=class_idx)
    finally:
        explainer.cleanup()

    # 3. Resize CAM to high resolution target_dim
    cam_resized = cv2.resize(cam_raw, target_dim, interpolation=cv2.INTER_LINEAR)
    cam_u8 = np.uint8(255 * np.clip(cam_resized, 0, 1))

    # 4. Colorize with JET colormap
    heatmap_bgr = cv2.applyColorMap(cam_u8, cv2.COLORMAP_JET)
    heatmap_rgb = cv2.cvtColor(heatmap_bgr, cv2.COLOR_BGR2RGB)

    # 5. High-resolution base image for overlay
    base_resized = cv2.resize(image_rgb_160, target_dim)
    overlay_rgb = cv2.addWeighted(base_resized, 0.55, heatmap_rgb, 0.45, 0)

    return heatmap_rgb, overlay_rgb
