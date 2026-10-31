import React from 'react';
import { X, Download, FileText, CheckCircle, ExternalLink } from 'lucide-react';
import { ScreeningDetail } from '../types';
import { Language, translations } from '../utils/language';

interface ReportModalProps {
  screening: ScreeningDetail;
  lang: Language;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ screening, lang, onClose }) => {
  const t = translations[lang];
  const pdfUrl = `/api/v1/screenings/${screening.id}/report.pdf`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Bilingual Clinical Screening Report (द्विभाषी रिपोर्ट)
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {screening.patient.full_name} • {screening.eye_side} Eye
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={pdfUrl}
              download={`RetinaVision_Report_${screening.patient.full_name.replace(/\s+/g, '_')}.pdf`}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition shadow"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </a>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Iframe Viewer */}
        <div className="flex-1 bg-slate-950 p-2 overflow-hidden">
          <iframe
            src={pdfUrl}
            title="Screening Report"
            className="w-full h-full rounded-xl border border-slate-800"
          />
        </div>
      </div>
    </div>
  );
};

