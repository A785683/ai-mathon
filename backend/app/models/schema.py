import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from pydantic import BaseModel, Field

from app.database import Base

# ==========================================
# SQLALCHEMY ORM MODELS
# ==========================================

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String(120), nullable=False, index=True)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    diabetes_history = Column(String(255), default="Type 2 Diabetes")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    screenings = relationship("Screening", back_populates="patient", cascade="all, delete-orphan")


class Screening(Base):
    __tablename__ = "screenings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False, index=True)
    eye_side = Column(String(10), nullable=False, default="RIGHT")  # LEFT or RIGHT
    raw_image_path = Column(String(500), nullable=False)
    preprocessed_image_path = Column(String(500), nullable=True)

    # IQA metrics & targeted error codes
    iqa_passed = Column(Boolean, default=False, index=True)
    iqa_error_codes = Column(JSON, default=list)  # e.g. ["IMAGE_TOO_BLURRY"]
    blur_score = Column(Float, default=0.0)
    illumination_score = Column(Float, default=0.0)
    contrast_score = Column(Float, default=0.0)
    fov_score = Column(Float, default=0.0)
    iqa_feedback = Column(String(500), default="")
    recapture_instructions = Column(String(500), default="")

    # Clinical Status & Referral Urgency
    referral_urgency = Column(String(50), default="ROUTINE", index=True)  # ROUTINE, NON_URGENT, URGENT, CRITICAL, RETAKE
    status = Column(String(50), default="ANALYZED", index=True)          # PENDING, ANALYZED, REVIEWED, IQA_RETAKE
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    patient = relationship("Patient", back_populates="screenings")
    prediction = relationship("Prediction", uselist=False, back_populates="screening", cascade="all, delete-orphan")
    lesion_summary = relationship("LesionSummary", uselist=False, back_populates="screening", cascade="all, delete-orphan")
    doctor_review = relationship("DoctorReview", uselist=False, back_populates="screening", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="screening", cascade="all, delete-orphan")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    screening_id = Column(String(36), ForeignKey("screenings.id"), nullable=False, unique=True)
    predicted_grade = Column(Integer, nullable=False, index=True)  # 0 to 4
    grade_name = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    class_probabilities = Column(JSON, nullable=False)  # Dict[str, float]
    entropy = Column(Float, default=0.0)
    confidence_interval = Column(JSON, nullable=True)   # null unless statistically justified method implemented
    inference_time_ms = Column(Float, default=0.0)
    temperature = Column(Float, default=1.0)
    gradcam_path = Column(String(500), nullable=True)
    model_status = Column(String(80), default="VERIFIED_TRAINED_CHECKPOINT")
    model_provenance = Column(String(200), default="EfficientNet-B0 (APTOS 2019 Checkpoint)")
    is_verified_checkpoint = Column(Boolean, default=True)

    screening = relationship("Screening", back_populates="prediction")


class LesionSummary(Base):
    __tablename__ = "lesion_summaries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    screening_id = Column(String(36), ForeignKey("screenings.id"), nullable=False, unique=True)
    microaneurysm_count = Column(Integer, default=0)
    hemorrhage_count = Column(Integer, default=0)
    hard_exudate_count = Column(Integer, default=0)
    soft_exudate_count = Column(Integer, default=0)
    mask_path = Column(String(500), nullable=True)
    classification_note = Column(String(255), default="Suspected lesion candidates")
    method = Column(String(80), default="OPENCV_MORPHOLOGICAL_FALLBACK")
    is_verified_model = Column(Boolean, default=False)

    screening = relationship("Screening", back_populates="lesion_summary")


class DoctorReview(Base):
    __tablename__ = "doctor_reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    screening_id = Column(String(36), ForeignKey("screenings.id"), nullable=False, unique=True)
    doctor_name = Column(String(120), nullable=False)
    doctor_license = Column(String(60), default="")
    confirmed_grade = Column(Integer, nullable=False)
    was_overridden = Column(Boolean, default=False)
    referral_recommendation = Column(String(255), default="")
    clinical_notes = Column(Text, default="")
    reviewed_at = Column(DateTime, default=datetime.utcnow)

    screening = relationship("Screening", back_populates="doctor_review")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    screening_id = Column(String(36), ForeignKey("screenings.id"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)
    details = Column(String(500), default="")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    screening = relationship("Screening", back_populates="audit_logs")


# ==========================================
# PYDANTIC SCHEMAS
# ==========================================

class PatientCreate(BaseModel):
    full_name: str
    age: int
    gender: str
    diabetes_history: Optional[str] = "Type 2 Diabetes"

class PatientResponse(PatientCreate):
    id: str
    created_at: datetime
    class Config:
        from_attributes = True

class IqaResult(BaseModel):
    passed: bool
    error_codes: List[str] = []
    blur_score: float
    illumination_score: float
    contrast_score: float
    fov_score: float
    feedback: str
    recapture_instructions: str

class PredictionResponse(BaseModel):
    predicted_grade: int
    grade_name: str
    confidence: float
    class_probabilities: Dict[str, float]
    entropy: float
    confidence_interval: Optional[Dict[str, float]] = None
    inference_time_ms: float
    temperature: float
    gradcam_url: Optional[str] = None
    model_status: str
    model_provenance: str
    is_verified_checkpoint: bool

class LesionResponse(BaseModel):
    microaneurysm_count: int
    hemorrhage_count: int
    hard_exudate_count: int
    soft_exudate_count: int
    mask_url: Optional[str] = None
    classification_note: str
    method: str
    is_verified_model: bool

class DoctorReviewCreate(BaseModel):
    doctor_name: str
    doctor_license: Optional[str] = "MCI-REG-AI"
    confirmed_grade: int
    referral_recommendation: Optional[str] = "Specialist ophthalmologist consultation"
    clinical_notes: Optional[str] = ""

class DoctorReviewResponse(DoctorReviewCreate):
    id: str
    was_overridden: bool
    reviewed_at: datetime
    class Config:
        from_attributes = True

class ScreeningDetailResponse(BaseModel):
    id: str
    patient: PatientResponse
    eye_side: str
    raw_image_url: str
    preprocessed_image_url: Optional[str] = None
    iqa: IqaResult
    prediction: Optional[PredictionResponse] = None
    lesions: Optional[LesionResponse] = None
    doctor_review: Optional[DoctorReviewResponse] = None
    referral_urgency: str
    status: str
    created_at: datetime
    report_pdf_url: Optional[str] = None
    class Config:
        from_attributes = True
