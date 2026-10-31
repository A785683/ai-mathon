import os
import sys
from pathlib import Path

# Add backend directory to path
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

import numpy as np
import cv2
from fastapi.testclient import TestClient
from app.main import app
from app.core.iqa import ImageQualityAssessor, IqaErrorCode
from app.core.classifier import DiabeticRetinopathyClassifier, ModelStatus
from app.core.lesion_detector import MicrovasculatureLesionDetector

client = TestClient(app)

def make_test_retina_image(blur=False, dark=False, non_retinal=False):
    """Creates synthetic image for testing."""
    h, w = 512, 512
    if non_retinal:
        # Blue non-retinal image (e.g. skin or photo of sky)
        img = np.zeros((h, w, 3), dtype=np.uint8)
        img[:, :] = (230, 120, 30) # Blue-dominant
        return img

    img = np.zeros((h, w, 3), dtype=np.uint8)
    # Retinal circle
    cv2.circle(img, (256, 256), 220, (15, 60, 180), -1)
    # Optic disc
    cv2.circle(img, (180, 256), 35, (120, 210, 245), -1)
    # Macula
    cv2.circle(img, (330, 260), 20, (10, 40, 130), -1)

    if blur:
        img = cv2.GaussianBlur(img, (35, 35), 0)
    if dark:
        img = (img * 0.3).astype(np.uint8)

    return img

def test_iqa_blur_detection():
    blurry_img = make_test_retina_image(blur=True)
    res = ImageQualityAssessor.assess_image(blurry_img)
    assert res["passed"] is False
    assert IqaErrorCode.IMAGE_TOO_BLURRY.value in res["error_codes"]
    assert "recapture_instructions" in res

def test_iqa_underexposure_detection():
    dark_img = make_test_retina_image(dark=True)
    res = ImageQualityAssessor.assess_image(dark_img)
    assert res["passed"] is False
    assert IqaErrorCode.IMAGE_UNDEREXPOSED.value in res["error_codes"]

def test_iqa_non_retinal_rejection():
    blue_img = make_test_retina_image(non_retinal=True)
    res = ImageQualityAssessor.assess_image(blue_img)
    assert res["passed"] is False
    assert IqaErrorCode.NON_RETINAL_IMAGE.value in res["error_codes"]

def test_classifier_trained_checkpoint_loading():
    classifier = DiabeticRetinopathyClassifier()
    assert classifier.model_status == ModelStatus.VERIFIED_TRAINED_CHECKPOINT
    assert classifier.temperature > 1.4  # T was fitted at 1.5000

    dummy_rgb_160 = np.random.randint(50, 200, (160, 160, 3), dtype=np.uint8)
    pred = classifier.predict(dummy_rgb_160)
    assert "predicted_grade" in pred
    assert 0 <= pred["predicted_grade"] <= 4
    assert pred["entropy"] > 0
    assert pred["confidence_interval"] is None
    assert pred["is_verified_checkpoint"] is True

def test_lesion_detection_candidate_labeling():
    img = make_test_retina_image()
    # Add tiny artificial red dots (suspected microaneurysms)
    cv2.circle(img, (280, 250), 3, (10, 15, 90), -1)
    cv2.circle(img, (300, 270), 3, (10, 15, 90), -1)

    lesions, overlay, mask = MicrovasculatureLesionDetector.detect_lesions(img)
    assert "microaneurysms" in lesions
    assert "hemorrhages" in lesions
    assert "hard_exudates" in lesions
    assert "soft_exudates" in lesions
    assert "suspected" in lesions["classification_note"].lower()
    assert lesions["is_verified_model"] is False

def test_health_endpoint():
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["pytorch"]["weights_found"] is True
    assert data["pytorch"]["model_status"] == "VERIFIED_TRAINED_CHECKPOINT"
    assert data["pytorch"]["calibrated_temperature"] >= 1.4

def test_screening_analyze_api_flow():
    img = make_test_retina_image()
    _, enc = cv2.imencode(".jpg", img)
    files = {"file": ("test_retina.jpg", enc.tobytes(), "image/jpeg")}
    data = {
        "patient_name": "Test Patient",
        "age": 60,
        "gender": "Male",
        "eye_side": "RIGHT",
        "diabetes_history": "Type 2 Diabetes (5 yrs)"
    }

    resp = client.post("/api/v1/screenings/analyze", files=files, data=data)
    assert resp.status_code == 201
    body = resp.json()
    assert body["iqa"]["passed"] is True
    assert body["prediction"]["is_verified_checkpoint"] is True
    assert "entropy" in body["prediction"]
    assert body["prediction"]["confidence_interval"] is None
    assert body["report_pdf_url"] is not None

def test_screening_iqa_rejection_api_flow():
    blurry_img = make_test_retina_image(blur=True)
    _, enc = cv2.imencode(".jpg", blurry_img)
    files = {"file": ("blurry.jpg", enc.tobytes(), "image/jpeg")}
    data = {
        "patient_name": "Blurry Test",
        "age": 50,
        "gender": "Female",
        "eye_side": "LEFT"
    }

    resp = client.post("/api/v1/screenings/analyze", files=files, data=data)
    assert resp.status_code == 201
    body = resp.json()
    assert body["iqa"]["passed"] is False
    assert "IMAGE_TOO_BLURRY" in body["iqa"]["error_codes"]
    assert body["referral_urgency"] == "RETAKE"
    assert body["status"] == "IQA_RETAKE"

if __name__ == "__main__":
    print("Running integration tests directly...")
    test_iqa_blur_detection()
    print("Passed: test_iqa_blur_detection")
    test_iqa_underexposure_detection()
    print("Passed: test_iqa_underexposure_detection")
    test_iqa_non_retinal_rejection()
    print("Passed: test_iqa_non_retinal_rejection")
    test_classifier_trained_checkpoint_loading()
    print("Passed: test_classifier_trained_checkpoint_loading")
    test_lesion_detection_candidate_labeling()
    print("Passed: test_lesion_detection_candidate_labeling")
    test_health_endpoint()
    print("Passed: test_health_endpoint")
    test_screening_analyze_api_flow()
    print("Passed: test_screening_analyze_api_flow")
    test_screening_iqa_rejection_api_flow()
    print("Passed: test_screening_iqa_rejection_api_flow")
    print("ALL INTEGRATION TESTS PASSED CLEANLY!")
