import React, { useState } from 'react';
import { X, Check, Stethoscope, AlertTriangle, UserCheck } from 'lucide-react';
import { ScreeningDetail } from '../types';
import { Language, translations } from '../utils/language';
import { submitDoctorReview } from '../services/api';

interface DoctorReviewModalProps {
  screening: ScreeningDetail;
  lang: Language;
  onClose: () => void;
  onSuccess: (updatedScreening: ScreeningDetail) => void;
}

export const DoctorReviewModal: React.FC<DoctorReviewModalProps> = ({
  screening,
  lang,
  onClose,
  onSuccess,
}) => {
  const t = translations[lang];

  const currentGrade = screening.doctor_review
    ? screening.doctor_review.confirmed_grade
    : (screening.prediction?.predicted_grade ?? 0);

  const [doctorName, setDoctorName] = useState(screening.doctor_review?.doctor_name || 'Dr. Sunita Kulkarni, MD');
  const [doctorLicense, setDoctorLicense] = useState(screening.doctor_review?.doctor_license || 'MCI-OPH-8842');
  const [selectedGrade, setSelectedGrade] = useState(currentGrade);
  const [referralAdvice, setReferralAdvice] = useState(
    screening.doctor_review?.referral_recommendation || 'Refer to vitreoretinal specialist for dilated biomicroscopy & OCT.'
  );
  const [clinicalNotes, setClinicalNotes] = useState(
    screening.doctor_review?.clinical_notes || 'Confirmed presence of multiple microaneurysms and hard exudates in temporal quadrant.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await submitDoctorReview(screening.id, {
        doctor_name: doctorName,
        doctor_license: doctorLicense,
        confirmed_grade: selectedGrade,
        referral_recommendation: referralAdvice,
        clinical_notes: clinicalNotes,
      });

      // Refetch updated record
      const res = await fetch(`/api/v1/screenings/${screening.id}`);
      const updated = await res.json();
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record doctor review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const grades = [
    { grade: 0, label: 'Grade 0: No DR' },
    { grade: 1, label: 'Grade 1: Mild NPDR' },
    { grade: 2, label: 'Grade 2: Moderate NPDR' },
    { grade: 3, label: 'Grade 3: Severe NPDR' },
    { grade: 4, label: 'Grade 4: Proliferative DR' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t.reviewDiagnosis}</h3>
              <p className="text-xs text-slate-400 font-mono">Patient: {screening.patient.full_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 text-rose-300 rounded-xl flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-400 mb-1">{t.doctorName}</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-400 mb-1">{t.doctorLicense}</label>
              <input
                type="text"
                value={doctorLicense}
                onChange={(e) => setDoctorLicense(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-400 mb-1.5">{t.confirmGrade}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {grades.map((item) => (
                <button
                  key={item.grade}
                  type="button"
                  onClick={() => setSelectedGrade(item.grade)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    selectedGrade === item.grade
                      ? 'bg-cyan-500/20 border-cyan-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{item.label}</span>
                  {selectedGrade === item.grade && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-400 mb-1">Referral Action / Advice</label>
            <input
              type="text"
              value={referralAdvice}
              onChange={(e) => setReferralAdvice(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-400 mb-1">{t.clinicalNotes}</label>
            <textarea
              rows={3}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Record retinal quadrant observations, macula status, or laser recommendations..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold transition shadow-lg shadow-cyan-500/20 flex items-center space-x-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording...' : t.submitReview}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

