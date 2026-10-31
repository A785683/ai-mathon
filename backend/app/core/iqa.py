import cv2
import numpy as np
from typing import Dict, Any, List, Optional
from enum import Enum

class IqaErrorCode(str, Enum):
    IMAGE_TOO_BLURRY = "IMAGE_TOO_BLURRY"
    IMAGE_UNDEREXPOSED = "IMAGE_UNDEREXPOSED"
    IMAGE_OVEREXPOSED = "IMAGE_OVEREXPOSED"
    LOW_CONTRAST = "LOW_CONTRAST"
    INVALID_IMAGE = "INVALID_IMAGE"
    NON_RETINAL_IMAGE = "NON_RETINAL_IMAGE"

class ImageQualityAssessor:
    """
    OpenCV-based Image Quality Assessment (IQA) for Retinal Fundus Photographs.
    Evaluates:
      1. Structural Validity (Decodability & Min Dimensions)
      2. Colorimetry & Retinal Domain Verification (Red/Green Dominance, FOV)
      3. Sharpness / Motion Blur (Laplacian Variance)
      4. Exposure / Illumination (Mean Luminance in active tissue)
      5. Retinal Contrast (Standard Deviation)
    """

    BLUR_THRESHOLD = 80.0
    MIN_LUMINANCE = 30.0
    MAX_LUMINANCE = 225.0
    MIN_CONTRAST = 18.0

    @classmethod
    def assess_image(cls, image_bgr: np.ndarray) -> Dict[str, Any]:
        if image_bgr is None or image_bgr.size == 0:
            return {
                "passed": False,
                "error_codes": [IqaErrorCode.INVALID_IMAGE.value],
                "blur_score": 0.0,
                "illumination_score": 0.0,
                "contrast_score": 0.0,
                "fov_score": 0.0,
                "feedback": "Unable to decode image. Ensure the file is a valid JPG, PNG, or TIFF fundus photo.",
                "recapture_instructions": "Check file integrity and re-upload an uncorrupted image."
            }

        h, w = image_bgr.shape[:2]
        if h < 120 or w < 120:
            return {
                "passed": False,
                "error_codes": [IqaErrorCode.INVALID_IMAGE.value],
                "blur_score": 0.0,
                "illumination_score": 0.0,
                "contrast_score": 0.0,
                "fov_score": 0.0,
                "feedback": f"Image resolution ({w}x{h}) is too low for clinical evaluation. Minimum recommended is 512x512.",
                "recapture_instructions": "Capture photograph at higher camera resolution."
            }

        # 1. Non-Retinal Image Rejection
        # Retinal fundus photos are physiologically dominated by hemoglobin & melanin (High Red, Moderate Green, Low Blue)
        mean_b = float(np.mean(image_bgr[:, :, 0]))
        mean_g = float(np.mean(image_bgr[:, :, 1]))
        mean_r = float(np.mean(image_bgr[:, :, 2]))

        # In fundus photos: Red channel mean is significantly higher than Blue channel
        is_blue_dominated = mean_b > (mean_r * 1.15) and mean_b > 40.0
        
        # Check retinal circular aperture
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 15, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        fov_ratio = 0.0
        mask = np.zeros_like(gray)
        if contours:
            largest_c = max(contours, key=cv2.contourArea)
            cv2.drawContours(mask, [largest_c], -1, 255, -1)
            fov_area = cv2.contourArea(largest_c)
            total_area = h * w
            fov_ratio = (fov_area / total_area) * 100.0

        if is_blue_dominated or (mean_r < 15.0 and mean_g < 15.0 and mean_b < 15.0 and fov_ratio < 5.0):
            return {
                "passed": False,
                "error_codes": [IqaErrorCode.NON_RETINAL_IMAGE.value],
                "blur_score": 0.0,
                "illumination_score": 0.0,
                "contrast_score": 0.0,
                "fov_score": round(fov_ratio, 2),
                "feedback": "Image does not appear to be a retinal fundus photograph. Optical spectrum and colorimetry mismatch.",
                "recapture_instructions": "Please provide an authentic non-mydriatic or dilated retinal fundus photograph."
            }

        # Active retinal pixels
        if fov_ratio < 20.0:
            active_pixels = gray
        else:
            active_pixels = gray[mask == 255]

        # 2. Blur Assessment: Variance of Laplacian
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        blur_score = float(laplacian.var())

        # 3. Illumination Assessment: Mean luminance of active tissue
        illumination_score = float(np.mean(active_pixels)) if len(active_pixels) > 0 else 0.0

        # 4. Contrast Assessment: Standard deviation of pixel intensities
        contrast_score = float(np.std(active_pixels)) if len(active_pixels) > 0 else 0.0

        error_codes: List[str] = []
        instructions: List[str] = []

        if blur_score < cls.BLUR_THRESHOLD:
            error_codes.append(IqaErrorCode.IMAGE_TOO_BLURRY.value)
            instructions.append("Excessive motion or optical blur detected. Ensure the patient maintains eye fixation and lock camera focus onto the retinal plane.")

        if illumination_score < cls.MIN_LUMINANCE:
            error_codes.append(IqaErrorCode.IMAGE_UNDEREXPOSED.value)
            instructions.append("Severe underexposure. Increase illumination light source or camera flash power.")
        elif illumination_score > cls.MAX_LUMINANCE:
            error_codes.append(IqaErrorCode.IMAGE_OVEREXPOSED.value)
            instructions.append("Flash washout / overexposure detected. Reduce camera flash intensity or adjust aperture.")

        if contrast_score < cls.MIN_CONTRAST:
            error_codes.append(IqaErrorCode.LOW_CONTRAST.value)
            instructions.append("Low retinal tissue contrast. Verify adequate pupil dilation (mydriasis) before retaking.")

        passed = len(error_codes) == 0
        if passed:
            feedback = "Image quality meets clinical standards for automated AI screening."
            recapture = "None required."
        else:
            feedback = f"Quality gate failed with codes: {', '.join(error_codes)}."
            recapture = " ".join(instructions)

        return {
            "passed": passed,
            "error_codes": error_codes,
            "blur_score": round(blur_score, 2),
            "illumination_score": round(illumination_score, 2),
            "contrast_score": round(contrast_score, 2),
            "fov_score": round(fov_ratio, 2),
            "feedback": feedback,
            "recapture_instructions": recapture
        }
