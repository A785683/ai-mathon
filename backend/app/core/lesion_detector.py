import cv2
import numpy as np
from typing import Dict, Any, Tuple

class MicrovasculatureLesionDetector:
    """
    Automated Retinal Microvasculature Analysis.
    Detects and quantifies suspected lesion candidates:
      - Suspected Microaneurysm Candidates (pinpoint dark red vascular dilatations)
      - Suspected Hemorrhage Candidates (flame & blot intraretinal blood lesions)
      - Suspected Hard Exudate Candidates (discrete yellow lipid deposits)
      - Suspected Soft Exudate Candidates (fluffy cotton-wool nerve fiber layer infarcts)
    
    IMPORTANT: Outputs are classified as 'suspected lesion candidates',
    not definitive clinical diagnoses, in strict compliance with the project guidelines.
    """

    @staticmethod
    def detect_lesions(image_bgr: np.ndarray) -> Tuple[Dict[str, Any], np.ndarray, np.ndarray]:
        if image_bgr is None or image_bgr.size == 0:
            empty_summary = {
                "microaneurysms": 0,
                "hemorrhages": 0,
                "hard_exudates": 0,
                "soft_exudates": 0,
                "classification_note": "Suspected lesion candidates (unverified segmentation weights)",
                "method": "OPENCV_MORPHOLOGICAL_FALLBACK",
                "is_verified_model": False
            }
            empty_overlay = np.zeros((512, 512, 4), dtype=np.uint8)
            empty_mask = np.zeros((512, 512), dtype=np.uint8)
            return empty_summary, empty_overlay, empty_mask

        h, w = image_bgr.shape[:2]

        # 1. Green channel (optimal optical absorption for hemoglobin)
        green = image_bgr[:, :, 1]

        # 2. Field-of-view inner mask
        _, fov_mask = cv2.threshold(green, 15, 255, cv2.THRESH_BINARY)
        kernel_fov = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
        fov_inner = cv2.erode(fov_mask, kernel_fov)

        # 3. CLAHE enhancement
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        g_clahe = clahe.apply(green)

        # 4. Optic disc localization & suppression (disc is naturally very bright)
        disc_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (45, 45))
        disc_candidate = cv2.morphologyEx(g_clahe, cv2.MORPH_CLOSE, disc_kernel)
        _, _, _, max_loc = cv2.minMaxLoc(disc_candidate, mask=fov_inner)
        
        optic_disc_mask = np.zeros((h, w), dtype=np.uint8)
        disc_radius = int(min(h, w) * 0.12)
        cv2.circle(optic_disc_mask, max_loc, disc_radius, 255, -1)

        # 5. Bright Lesions: Hard & Soft Exudates via Top-Hat Transform
        kernel_ex = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))
        tophat_ex = cv2.morphologyEx(g_clahe, cv2.MORPH_TOPHAT, kernel_ex)
        _, ex_thresh = cv2.threshold(tophat_ex, 28, 255, cv2.THRESH_BINARY)
        ex_mask = cv2.bitwise_and(ex_thresh, ex_thresh, mask=fov_inner)
        ex_mask = cv2.bitwise_and(ex_mask, cv2.bitwise_not(optic_disc_mask))

        contours_ex, _ = cv2.findContours(ex_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        hard_exudates = []
        soft_exudates = []
        for c in contours_ex:
            area = cv2.contourArea(c)
            if 6 < area < 80:
                hard_exudates.append(c)  # Discrete, pinpoint yellowish lipid
            elif 80 <= area < 1200:
                soft_exudates.append(c)  # Fluffy, larger cotton wool spot

        # 6. Major Vasculature Extraction
        kernel_vessel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 15))
        blackhat = cv2.morphologyEx(g_clahe, cv2.MORPH_BLACKHAT, kernel_vessel)
        vessels_bin = cv2.adaptiveThreshold(
            blackhat, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 15, -2
        )
        vessels_bin = cv2.bitwise_and(vessels_bin, vessels_bin, mask=fov_inner)

        # 7. Dark Pinpoint Lesions: Suspected Microaneurysms
        kernel_ma = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        blackhat_ma = cv2.morphologyEx(g_clahe, cv2.MORPH_BLACKHAT, kernel_ma)
        _, ma_thresh = cv2.threshold(blackhat_ma, 16, 255, cv2.THRESH_BINARY)
        ma_candidates = cv2.bitwise_and(ma_thresh, ma_thresh, mask=fov_inner)

        contours_ma, _ = cv2.findContours(ma_candidates, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        valid_ma = [c for c in contours_ma if 3 < cv2.contourArea(c) < 45]

        # 8. Dark Blot Lesions: Suspected Hemorrhages
        contours_he, _ = cv2.findContours(vessels_bin, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        valid_he = []
        for c in contours_he:
            area = cv2.contourArea(c)
            if 50 < area < 2500:
                p = cv2.arcLength(c, True)
                if p > 0:
                    circ = 4 * np.pi * (area / (p * p))
                    if circ > 0.15:  # Blot shape rather than linear vessel
                        valid_he.append(c)

        summary = {
            "microaneurysms": len(valid_ma),
            "hemorrhages": len(valid_he),
            "hard_exudates": len(hard_exudates),
            "soft_exudates": len(soft_exudates),
            "classification_note": "Suspected lesion candidates (unverified morphological detection)",
            "method": "OPENCV_MORPHOLOGICAL_FALLBACK",
            "is_verified_model": False
        }

        # 9. RGBA Layer Overlay for Frontend Studio
        overlay_bgra = np.zeros((h, w, 4), dtype=np.uint8)

        # Microaneurysms: Vivid Cyan
        for c in valid_ma:
            (x, y), r = cv2.minEnclosingCircle(c)
            center = (int(x), int(y))
            rad = max(3, int(r) + 2)
            cv2.circle(overlay_bgra, center, rad, (255, 220, 0, 230), -1)
            cv2.circle(overlay_bgra, center, rad + 1, (255, 255, 255, 255), 1)

        # Hemorrhages: Deep Crimson Red
        for c in valid_he:
            cv2.drawContours(overlay_bgra, [c], -1, (30, 20, 235, 200), -1)
            cv2.drawContours(overlay_bgra, [c], -1, (40, 30, 255, 255), 1)

        # Hard Exudates: Yellow
        for c in hard_exudates:
            cv2.drawContours(overlay_bgra, [c], -1, (0, 230, 255, 210), -1)

        # Soft Exudates: White-Amber / Soft Yellow
        for c in soft_exudates:
            cv2.drawContours(overlay_bgra, [c], -1, (180, 240, 255, 180), -1)

        combined_mask = np.zeros((h, w), dtype=np.uint8)
        if valid_ma:
            cv2.drawContours(combined_mask, valid_ma, -1, 255, -1)
        if valid_he:
            cv2.drawContours(combined_mask, valid_he, -1, 255, -1)
        if hard_exudates:
            cv2.drawContours(combined_mask, hard_exudates, -1, 255, -1)
        if soft_exudates:
            cv2.drawContours(combined_mask, soft_exudates, -1, 255, -1)

        return summary, overlay_bgra, combined_mask
