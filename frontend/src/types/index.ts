export type EyeSide = 'LEFT' | 'RIGHT';

export type ReferralUrgency = 'ROUTINE' | 'NON_URGENT' | 'URGENT' | 'CRITICAL' | 'RETAKE';

export interface Patient {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  diabetes_history: string;
  created_at: string;
}

export interface IqaResult {
  passed: boolean;
  error_codes: string[];
  blur_score: number;
  illumination_score: number;
  contrast_score: number;
  fov_score?: number;
  feedback: string;
  recapture_instructions: string;
}

export interface Prediction {
  predicted_grade: number;
  grade_name: string;
  confidence: number;
  class_probabilities: Record<string, number>;
  entropy: number;
  confidence_interval?: Record<string, number> | null;
  inference_time_ms: number;
  temperature: number;
  gradcam_url?: string;
  model_status: string;
  model_provenance: string;
  is_verified_checkpoint: boolean;
}

export interface LesionSummary {
  microaneurysm_count: number;
  hemorrhage_count: number;
  hard_exudate_count: number;
  soft_exudate_count: number;
  mask_url?: string;
  classification_note: string;
  method: string;
  is_verified_model: boolean;
}

export interface DoctorReview {
  id: string;
  doctor_name: string;
  doctor_license?: string;
  confirmed_grade: number;
  was_overridden: boolean;
  referral_recommendation?: string;
  clinical_notes?: string;
  reviewed_at: string;
}

export interface ScreeningDetail {
  id: string;
  patient: Patient;
  eye_side: EyeSide;
  raw_image_url: string;
  preprocessed_image_url?: string;
  iqa: IqaResult;
  prediction?: Prediction;
  lesions?: LesionSummary;
  doctor_review?: DoctorReview;
  referral_urgency: ReferralUrgency;
  status: string;
  created_at: string;
  report_pdf_url?: string;
}

export interface ScreeningListItem {
  id: string;
  patient_name: string;
  age: number;
  gender: string;
  eye_side: EyeSide;
  iqa_passed: boolean;
  predicted_grade: number;
  grade_name: string;
  confidence: number;
  referral_urgency: ReferralUrgency;
  status: string;
  confirmed_grade?: number;
  created_at: string;
}

export interface SystemHealth {
  status: string;
  service: string;
  version: string;
  pytorch: {
    installed: boolean;
    version: string;
    device: string;
    backbone: string;
    weights_found: boolean;
    model_status: string;
    calibrated_temperature: number;
  };
  datasets_supported: string[];
  compliance: string;
}
