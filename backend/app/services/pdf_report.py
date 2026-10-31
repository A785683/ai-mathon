import os
from pathlib import Path
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether, HRFlowable
)
from app.config import REPORT_DIR
from app.core.triage import get_triage_info

class PDFReportGenerator:
    """
    Medical-grade Bilingual (English & Hindi) PDF Screening Report Generator.
    Adheres to clinical documentation standards for retinal screening triage.
    """

    @classmethod
    def generate_report(
        cls,
        screening_data: dict,
        output_filename: str = None
    ) -> str:
        screening_id = screening_data.get("id", "SCREENING-001")
        if output_filename is None:
            output_filename = f"RetinaVision_Report_{screening_id}.pdf"

        pdf_path = REPORT_DIR / output_filename

        doc = SimpleDocTemplate(
            str(pdf_path),
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#0D9488"),
            fontName="Helvetica-Bold",
            alignment=0
        )

        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#475569"),
            fontName="Helvetica"
        )

        section_heading = ParagraphStyle(
            "SectionHeading",
            parent=styles["Heading2"],
            fontSize=11,
            leading=15,
            textColor=colors.HexColor("#0F172A"),
            fontName="Helvetica-Bold",
            spaceAfter=5
        )

        body_style = ParagraphStyle(
            "Body",
            parent=styles["Normal"],
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor("#1E293B"),
            fontName="Helvetica"
        )

        bold_style = ParagraphStyle(
            "BodyBold",
            parent=body_style,
            fontName="Helvetica-Bold"
        )

        disclaimer_style = ParagraphStyle(
            "Disclaimer",
            parent=styles["Normal"],
            fontSize=7.5,
            leading=10.5,
            textColor=colors.HexColor("#64748B"),
            fontName="Helvetica-Oblique",
            alignment=1
        )

        elements = []

        # 1. Header Banner
        header_table = Table([
            [
                Paragraph("<b>RetinaVision-AI</b>", title_style),
                Paragraph(f"<b>Screening ID:</b> {screening_id[:16]}<br/><b>Generated:</b> {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", subtitle_style)
            ],
            [
                Paragraph("AI-Assisted Retinal Microvasculature Diagnostics & Decision Support", subtitle_style),
                Paragraph("<b>Benchmark:</b> AI Manthan 2.0 (Problem Statement 14)", subtitle_style)
            ]
        ], colWidths=[340, 200])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ]))
        elements.append(header_table)
        elements.append(Spacer(1, 8))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0D9488"), spaceAfter=10))

        # 2. Patient & Screening Demographics
        patient = screening_data.get("patient", {})
        iqa = screening_data.get("iqa", {})
        patient_data = [
            [
                Paragraph(f"<b>Patient Name:</b> {patient.get('full_name', 'Anonymous')}", body_style),
                Paragraph(f"<b>Age / Sex:</b> {patient.get('age', 'N/A')} yrs / {patient.get('gender', 'N/A')}", body_style),
                Paragraph(f"<b>Eye Evaluated:</b> {screening_data.get('eye_side', 'RIGHT')} Eye", body_style)
            ],
            [
                Paragraph(f"<b>Diabetes History:</b> {patient.get('diabetes_history', 'Type 2 Diabetes')}", body_style),
                Paragraph(f"<b>IQA Quality Gate:</b> {'PASSED' if iqa.get('passed') else 'FAILED'}", body_style),
                Paragraph(f"<b>Sharpness / Luminance:</b> {iqa.get('blur_score', 0):.1f} / {iqa.get('illumination_score', 0):.1f}", body_style)
            ]
        ]
        patient_table = Table(patient_data, colWidths=[200, 170, 170])
        patient_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 7),
            ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ]))
        elements.append(patient_table)
        elements.append(Spacer(1, 10))

        # 3. Triage & Diagnosis Summary
        pred = screening_data.get("prediction", {})
        grade = pred.get("predicted_grade", 0)
        triage = get_triage_info(grade)

        urgency_colors = {
            "ROUTINE": colors.HexColor("#10B981"),
            "NON_URGENT": colors.HexColor("#F59E0B"),
            "URGENT": colors.HexColor("#EA580C"),
            "CRITICAL": colors.HexColor("#DC2626"),
            "RETAKE": colors.HexColor("#64748B")
        }
        urgency_color = urgency_colors.get(screening_data.get("referral_urgency", triage["urgency"]), colors.HexColor("#0D9488"))

        triage_box = [
            [
                Paragraph(f"<font color='white'><b>ICDR STAGE: {triage['grade_code']} — {triage['title_en'].upper()}</b></font>", ParagraphStyle("BadgeT", parent=bold_style, textColor=colors.white, fontSize=10.5)),
                Paragraph(f"<font color='white'><b>TRIAGE PROTOCOL: {triage['urgency_label_en'].upper()}</b></font>", ParagraphStyle("BadgeU", parent=bold_style, textColor=colors.white, alignment=2, fontSize=9.5))
            ]
        ]
        t_table = Table(triage_box, colWidths=[350, 190])
        t_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), urgency_color),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 7),
            ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ]))
        elements.append(t_table)

        # Bilingual findings
        findings_table = Table([
            [
                Paragraph("<b>Clinical Observations (English):</b><br/>" + triage["clinical_findings_en"], body_style),
                Paragraph("<b>नैदानिक विवरण (Hindi):</b><br/>" + triage["clinical_findings_hi"], body_style)
            ],
            [
                Paragraph("<b>Recommended Clinical Protocol:</b><br/>" + triage["action_en"], body_style),
                Paragraph("<b>अनुशंसित परामर्श (Hindi):</b><br/>" + triage["action_hi"], body_style)
            ]
        ], colWidths=[270, 270])
        findings_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 7),
            ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ]))
        elements.append(findings_table)
        elements.append(Spacer(1, 10))

        # 4. Multi-Modal Visual Evidence
        elements.append(Paragraph("Multi-Modal Diagnostic Imaging & Explainability Maps", section_heading))

        raw_path = screening_data.get("raw_image_path")
        prep_path = screening_data.get("preprocessed_image_path")
        gradcam_path = pred.get("gradcam_path")
        mask_path = screening_data.get("lesions", {}).get("mask_path")

        def safe_image(path_str):
            if path_str and Path(path_str).exists():
                return Image(str(path_str), width=125, height=125)
            return Paragraph("Image unavailable", body_style)

        row_images = [
            safe_image(raw_path),
            safe_image(prep_path),
            safe_image(gradcam_path),
            safe_image(mask_path)
        ]
        row_labels = [
            Paragraph("<div align='center'><b>1. Raw Fundus Photo</b></div>", body_style),
            Paragraph("<div align='center'><b>2. Ben Graham CLAHE</b></div>", body_style),
            Paragraph("<div align='center'><b>3. Grad-CAM Saliency</b></div>", body_style),
            Paragraph("<div align='center'><b>4. Lesion Candidate Mask</b></div>", body_style)
        ]

        img_table = Table([row_images, row_labels], colWidths=[135, 135, 135, 135])
        img_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 2),
            ('TOPPADDING', (0, 1), (-1, 1), 2),
        ]))
        elements.append(img_table)
        elements.append(Spacer(1, 8))

        # 5. Suspected Lesions & Uncertainty Metrics
        lesions = screening_data.get("lesions", {})
        probs = pred.get("class_probabilities", {})
        prob_str = " | ".join([f"{k}: {v*100:.1f}%" for k, v in probs.items()]) if probs else "N/A"

        ma_c = lesions.get("microaneurysm_count", lesions.get("microaneurysms", 0))
        he_c = lesions.get("hemorrhage_count", lesions.get("hemorrhages", 0))
        hard_ex_c = lesions.get("hard_exudate_count", lesions.get("hard_exudates", 0))
        soft_ex_c = lesions.get("soft_exudate_count", lesions.get("soft_exudates", 0))

        metrics_table = Table([
            [
                Paragraph("<b>Suspected Microvascular Biomarkers:</b>", bold_style),
                Paragraph(f"• Microaneurysms: <b>{ma_c}</b>  • Hemorrhages: <b>{he_c}</b>  • Hard Exudates: <b>{hard_ex_c}</b>  • Soft Exudates: <b>{soft_ex_c}</b>", body_style)
            ],
            [
                Paragraph("<b>5-Class ICDR Softmax Distribution:</b>", bold_style),
                Paragraph(prob_str, body_style)
            ],
            [
                Paragraph("<b>Model Provenance & Calibration:</b>", bold_style),
                Paragraph(f"{pred.get('model_provenance', 'Verified Model')} | Shannon Entropy: {pred.get('entropy', 0.0):.3f} | Temp: {pred.get('temperature', 1.0):.2f} (Inference: {pred.get('inference_time_ms', 0):.1f}ms)", body_style)
            ]
        ], colWidths=[180, 360])
        metrics_table.setStyle(TableStyle([
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        elements.append(metrics_table)
        elements.append(Spacer(1, 10))

        # 6. Doctor Review Section
        doctor = screening_data.get("doctor_review")
        doc_name = doctor.get("doctor_name", "Awaiting Clinician Review") if doctor else "Awaiting Clinician Review"
        doc_notes = doctor.get("clinical_notes", "No notes recorded yet.") if doctor else "Pending ophthalmologist review."
        doc_grade = f"Grade {doctor.get('confirmed_grade')}" if doctor else "Unconfirmed"

        doc_table = Table([
            [
                Paragraph(f"<b>Reviewing Clinician:</b> {doc_name}", body_style),
                Paragraph(f"<b>Confirmed Grade:</b> {doc_grade}", body_style),
                Paragraph("<b>Clinician Signature:</b> ________________", body_style)
            ],
            [
                Paragraph(f"<b>Clinical Notes / Plan:</b> {doc_notes}", body_style),
                Paragraph(f"<b>License #:</b> {doctor.get('doctor_license', 'N/A') if doctor else 'N/A'}", body_style),
                Paragraph(f"<b>Review Status:</b> {screening_data.get('status', 'ANALYZED')}", body_style)
            ]
        ], colWidths=[220, 150, 170])
        doc_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(doc_table)
        elements.append(Spacer(1, 10))

        # 7. Regulatory Disclaimer
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CBD5E1"), spaceAfter=5))
        elements.append(Paragraph(
            "<b>REGULATORY NOTICE & DISCLAIMER:</b> RetinaVision-AI is an investigational clinical decision-support research prototype "
            "engineered for early triage under AI Manthan 2.0 (Problem Statement 14). It is NOT certified as an autonomous medical diagnostic device. "
            "All findings, Grad-CAM heatmaps, and suspected lesion candidates must be clinically correlated and validated by a licensed ophthalmologist.",
            disclaimer_style
        ))

        doc.build(elements)
        return str(pdf_path)
