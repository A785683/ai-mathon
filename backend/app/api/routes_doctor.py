from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.schema import Screening, DoctorReview, AuditLog, DoctorReviewCreate, DoctorReviewResponse
from app.services.pdf_report import PDFReportGenerator
from app.services.screening_service import ScreeningService

router = APIRouter(prefix="/screenings", tags=["Doctor Review"])

@router.post("/{screening_id}/doctor-review", response_model=DoctorReviewResponse)
def submit_doctor_review(
    screening_id: str,
    review_data: DoctorReviewCreate,
    db: Session = Depends(get_db)
):
    """
    Submits a clinician's expert evaluation, confirming or overriding
    the AI model's predicted grade, adding clinical notes and referral instructions.
    """
    screening = db.query(Screening).filter(Screening.id == screening_id).first()
    if not screening:
        raise HTTPException(status_code=404, detail="Screening record not found.")

    pred = screening.prediction
    was_overridden = False
    if pred and pred.predicted_grade != review_data.confirmed_grade:
        was_overridden = True

    # Check if a review already exists
    doctor_review = db.query(DoctorReview).filter(DoctorReview.screening_id == screening_id).first()
    if doctor_review:
        doctor_review.doctor_name = review_data.doctor_name
        doctor_review.doctor_license = review_data.doctor_license
        doctor_review.confirmed_grade = review_data.confirmed_grade
        doctor_review.was_overridden = was_overridden
        doctor_review.referral_recommendation = review_data.referral_recommendation
        doctor_review.clinical_notes = review_data.clinical_notes
        doctor_review.reviewed_at = datetime.utcnow()
    else:
        doctor_review = DoctorReview(
            screening_id=screening_id,
            doctor_name=review_data.doctor_name,
            doctor_license=review_data.doctor_license,
            confirmed_grade=review_data.confirmed_grade,
            was_overridden=was_overridden,
            referral_recommendation=review_data.referral_recommendation,
            clinical_notes=review_data.clinical_notes
        )
        db.add(doctor_review)

    # Update screening status
    screening.status = "REVIEWED"
    
    # Audit log
    audit = AuditLog(
        screening_id=screening_id,
        event_type="DOCTOR_REVIEW",
        details=f"Doctor {review_data.doctor_name} set confirmed grade to {review_data.confirmed_grade} (Overridden: {was_overridden})"
    )
    db.add(audit)

    db.commit()
    db.refresh(doctor_review)

    # Regenerate PDF report with doctor's clinical review included
    screening_dict = ScreeningService.get_screening_dict(db, screening_id)
    if screening_dict:
        pdf_filename = f"RetinaVision_Report_{screening_id}.pdf"
        PDFReportGenerator.generate_report(screening_dict, pdf_filename)

    return doctor_review

