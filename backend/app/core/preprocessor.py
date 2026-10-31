import cv2
import numpy as np
from typing import Tuple
from app.config import IMAGE_SIZE

class RetinalPreprocessor:
    """
    Standard Retinal Fundus Preprocessing Pipeline matching the upstream repository:
      1. Circular Retinal FOV Detection & Cropping
      2. Ben Graham's Illumination Subtraction: 4*img - 4*GaussianBlur + 128
      3. Green-Channel CLAHE (Contrast-Limited Adaptive Histogram Equalization)
    """

    @staticmethod
    def crop_retina_circle(image_bgr: np.ndarray, tolerance: int = 15) -> np.ndarray:
        """Crops black background borders around the circular fundus region."""
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        mask = gray > tolerance

        if not np.any(mask):
            return image_bgr

        row_sums = np.sum(mask, axis=1)
        col_sums = np.sum(mask, axis=0)
        
        valid_rows = np.where(row_sums > 0)[0]
        valid_cols = np.where(col_sums > 0)[0]

        if len(valid_rows) == 0 or len(valid_cols) == 0:
            return image_bgr

        y_min, y_max = valid_rows[0], valid_rows[-1]
        x_min, x_max = valid_cols[0], valid_cols[-1]

        h, w = image_bgr.shape[:2]
        margin_y = int((y_max - y_min) * 0.02)
        margin_x = int((x_max - x_min) * 0.02)

        y_min = max(0, y_min - margin_y)
        y_max = min(h, y_max + margin_y)
        x_min = max(0, x_min - margin_x)
        x_max = min(w, x_max + margin_x)

        return image_bgr[y_min:y_max, x_min:x_max]

    @staticmethod
    def ben_graham_normalization(image_bgr: np.ndarray, img_size: int = 512) -> np.ndarray:
        """
        Ben Graham local contrast normalization:
        Subtracts local Gaussian blur to highlight microaneurysms, hemorrhages, and exudates.
        """
        resized = cv2.resize(image_bgr, (img_size, img_size), interpolation=cv2.INTER_AREA)
        sigma = img_size / 30.0
        blurred = cv2.GaussianBlur(resized, (0, 0), sigmaX=sigma)
        enhanced = cv2.addWeighted(resized, 4.0, blurred, -4.0, 128)

        # Retinal circular aperture mask
        mask = np.zeros((img_size, img_size), dtype=np.uint8)
        cx, cy = img_size // 2, img_size // 2
        radius = int(img_size * 0.45)
        cv2.circle(mask, (cx, cy), radius, 255, -1)

        mask_blurred = cv2.GaussianBlur(mask, (15, 15), 0).astype(np.float32) / 255.0
        result = (enhanced.astype(np.float32) * mask_blurred[:, :, np.newaxis] +
                  128 * (1.0 - mask_blurred[:, :, np.newaxis]))

        return np.clip(result, 0, 255).astype(np.uint8)

    @classmethod
    def process_for_display(cls, image_bgr: np.ndarray, target_size=(512, 512)) -> np.ndarray:
        """High-resolution preprocessed fundus image for frontend display and lesion mapping."""
        cropped = cls.crop_retina_circle(image_bgr)
        return cls.ben_graham_normalization(cropped, img_size=target_size[0])

    @classmethod
    def process_for_model(cls, image_bgr: np.ndarray, target_size=(160, 160)) -> np.ndarray:
        """
        Exact preprocessing resolution (160x160 RGB) required by the trained
        EfficientNet-B0 checkpoint from the upstream repository.
        """
        cropped = cls.crop_retina_circle(image_bgr)
        norm_bgr = cls.ben_graham_normalization(cropped, img_size=target_size[0])
        # Return RGB uint8
        return cv2.cvtColor(norm_bgr, cv2.COLOR_BGR2RGB)

    @classmethod
    def process(cls, image_bgr: np.ndarray, target_size=IMAGE_SIZE) -> np.ndarray:
        return cls.process_for_display(image_bgr, target_size=target_size)
