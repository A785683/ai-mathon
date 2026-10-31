# RetinaVision-AI: AI-Assisted Diabetic Retinopathy Screening & Microvasculature Decision Support

**Hackathon Problem Statement**: Problem Statement 14 — *AI-Assisted Retinal Microvasculature Diagnostics and Diabetic Retinopathy Screening* (AI Manthan 2.0, Acropolis Institute of Technology and Research)  
**Primary Research Reference**: *DR Screen: Challenges, Real-World Impact and Why a Web/App Solution*  
**Clinical Protocol**: International Clinical Diabetic Retinopathy (ICDR) 5-Grade Scale (Grade 0 to Grade 4)  
**Safety Classification**: Research Prototype / Clinical Decision Support (CDS) — Not certified as an autonomous diagnostic device.

---

## 1. Executive Summary

Diabetic Retinopathy (DR) affects approximately 12–17% of India's 74+ million diabetic adult population. Early microvascular detection prevents permanent vision loss, but the primary bottleneck is access to specialist screening in rural Primary Health Centers (PHCs) and community screening camps.

**RetinaVision-AI** is a clinical-grade, full-stack decision-support platform that transforms raw retinal fundus photographs into explainable, triaged diagnostic outputs:
1. **Automated Image Quality Assessment (IQA)** via OpenCV before executing compute-intensive models.
2. **Ben Graham Color Equalization & CLAHE** to handle varied non-mydriatic camera lighting and ethnic pigmentation differences.
3. **5-Class ICDR Severity Grading** (No DR, Mild NPDR, Moderate NPDR, Severe NPDR, Proliferative DR) powered by PyTorch.
4. **Microvasculature Lesion Segmentation** quantifying Microaneurysms (MAs), Intraretinal Hemorrhages (HE), and Hard/Soft Exudates (EX).
5. **Grad-CAM Saliency Heatmaps** providing visual explainability directly overlaid with adjustable opacity.
6. **Bilingual Clinical PDF Reports** generated in **Hindi and English** with triage priority badges (Routine, Non-Urgent, Urgent, Critical Emergency).
7. **Doctor Review & Audit Interface** allowing ophthalmologists to confirm or override grades, record clinical observations, and sign off.

---

## 2. Technology Stack & Architecture

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts.
- **Backend**: Python 3.14, FastAPI, Uvicorn, SQLite, SQLAlchemy ORM.
- **Computer Vision**: OpenCV (Laplacian variance, morphology top/bottom-hat transforms, CLAHE).
- **Deep Learning**: PyTorch 2.15 (CPU-optimized edge deployment, EfficientNet-B0 backbone).
- **Reporting Engine**: ReportLab (bilingual medical PDF generation).

---

## 3. Core Features Implemented

| # | Feature | Implementation Details |
| :--- | :--- | :--- |
| **1** | **Retinal Fundus Image Upload** | Drag & drop, camera file intake, multi-format (JPG, PNG, TIFF) decoding. |
| **2** | **OpenCV Preprocessing** | Circular FOV cropping, Ben Graham local blur subtraction ($4 \times I - 4 \times \text{Blur} + 128$), CLAHE. |
| **3** | **Image Quality Assessment (IQA)** | Computes Laplacian blur variance ($\text{Var}(\nabla^2 I)$), luminance, and contrast; alerts user to retake blurry or washed-out images. |
| **4** | **5-Class Severity Classification** | ICDR scale (Grades 0 to 4) with calibrated softmax probability distribution. |
| **5** | **Microvascular Lesion Segmentation** | Automated morphology pipeline detecting and quantifying microaneurysms, blot hemorrhages, and exudates. |
| **6** | **Grad-CAM Explainability** | Jet colormap gradient backpropagation saliency heatmaps with dynamic opacity slider ($0 \dots 100\%$). |
| **7** | **Interactive Diagnostic Studio** | Zoomable canvas with toggleable layers (Raw, Preprocessed, Grad-CAM, Lesion masks). |
| **8** | **Patient Screening Registry** | Longitudinal database history with search, urgency filters, and diagnostic tracking. |
| **9** | **Downloadable Bilingual Reports** | Medical-grade PDF generation in English and Hindi with clinical findings and triage actions. |
| **10** | **Doctor Review Interface** | Clinician confirmation/override drawer with notes, license logging, and audit tracking. |

---

## 4. Benchmark Datasets Supported

- **APTOS 2019 Blindness Detection**: 3,662 labeled retinal images (Kaggle benchmark).
- **IDRiD (Indian Diabetic Retinopathy Image Dataset)**: Pixel-level microaneurysm and hemorrhage segmentation masks calibrated for Indian eyes.
- **Messidor-2**: 1,748 multi-center clinical validation images with diabetic macular edema risk.

---

## 5. Quickstart: Running the Application

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ and npm

### 5.1 Backend Execution
```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already installed)
python -m pip install -r requirements.txt

# Run FastAPI backend on port 8000
python run_backend.py
```
*Backend API Docs (Swagger):* `http://localhost:8000/docs`  
*API Health Endpoint:* `http://localhost:8000/api/v1/health`

### 5.2 Frontend Execution
```bash
# In a separate terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend URL:* `http://localhost:5173`

---

## 6. Strict Model Honesty Protocol

RetinaVision-AI explicitly rejects fake diagnostics:
- Every prediction exposes its **Provenance & Checkpoint Verification Status**.
- When deep learning weights are present, full convolution inference is executed.
- When unverified baseline weights are active, predictions are explicitly derived from quantified microvascular morphology under ICDR rules and clearly flagged in the UI.
- All reports feature an explicit medical disclaimer confirming this is a clinical decision-support research prototype.

