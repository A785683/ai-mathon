import React, { useState, useRef } from 'react';
import { Upload, Camera, AlertCircle, CheckCircle, RefreshCw, FileUp, Sparkles } from 'lucide-react';
import { Language, translations } from '../utils/language';
import { EyeSide, IqaResult } from '../types';
import { precheckIqa } from '../services/api';

interface ImageUploaderProps {
  lang: Language;
  onAnalyze: (formData: FormData) => void;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ lang, onAnalyze, isLoading }) => {
  const t = translations[lang];

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('Rajesh Sharma');
  const [patientAge, setPatientAge] = useState(58);
  const [patientGender, setPatientGender] = useState('Male');
  const [diabetesHistory, setDiabetesHistory] = useState('Type 2 Diabetes (7 yrs, HbA1c 7.9%)');
  const [eyeSide, setEyeSide] = useState<EyeSide>('RIGHT');

  const [iqaChecking, setIqaChecking] = useState(false);
  const [iqaResult, setIqaResult] = useState<IqaResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIqaResult(null);

    // Run quick live IQA pre-check
    setIqaChecking(true);
    try {
      const res = await precheckIqa(file);
      setIqaResult(res);
    } catch (e) {
      console.warn('IQA pre-check warning:', e);
    } finally {
      setIqaChecking(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = async (filename: string, defaultName: string, grade: number) => {
    try {
      // Fetch sample image from server
      const res = await fetch(`/api/v1/files/${filename}`);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: 'image/jpeg' });
      setPatientName(defaultName);
      setEyeSide(grade % 2 === 0 ? 'RIGHT' : 'LEFT');
      handleFileChange(file);
    } catch (e) {
      console.error('Failed to load sample image:', e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('patient_name', patientName);
    formData.append('age', patientAge.toString());
    formData.append('gender', patientGender);
    formData.append('diabetes_history', diabetesHistory);
    formData.append('eye_side', eyeSide);

    onAnalyze(formData);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Upload className="w-5 h-5 text-brand-400" />
          <span>{t.uploadTitle}</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">{t.uploadSubtitle}</p>
      </div>

      {/* Benchmark Sample Selector */}
      <div className="mb-6 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 mb-2.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{t.samplesTitle}:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleSelectSample('sample_normal_grade0.jpg', 'Rajesh Sharma', 0)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-600/40 text-slate-300 hover:text-emerald-300 transition-all text-left font-medium"
          >
            🟢 {t.grade0}
          </button>
          <button
            type="button"
            onClick={() => handleSelectSample('sample_mild_grade1.jpg', 'Sunita Verma', 1)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-lime-950/40 border border-slate-800 hover:border-lime-600/40 text-slate-300 hover:text-lime-300 transition-all text-left font-medium"
          >
            🟡 {t.grade1}
          </button>
          <button
            type="button"
            onClick={() => handleSelectSample('sample_moderate_grade2.jpg', 'Mohammad Ali', 2)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-600/40 text-slate-300 hover:text-amber-300 transition-all text-left font-medium"
          >
            🟠 {t.grade2}
          </button>
          <button
            type="button"
            onClick={() => handleSelectSample('sample_severe_grade3.jpg', 'Anita Devi', 3)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-orange-950/40 border border-slate-800 hover:border-orange-600/40 text-slate-300 hover:text-orange-300 transition-all text-left font-medium"
          >
            🔴 {t.grade3}
          </button>
          <button
            type="button"
            onClick={() => handleSelectSample('sample_proliferative_grade4.jpg', 'Kailash Chand', 4)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-600/40 text-slate-300 hover:text-rose-300 transition-all text-left font-medium"
          >
            🚨 {t.grade4}
          </button>
          <button
            type="button"
            onClick={() => handleSelectSample('sample_blurry_fail.jpg', 'Vikram Patel', 1)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-slate-200 transition-all text-left font-medium"
          >
            ⚠️ {t.gradeFail}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${previewUrl
              ? 'border-brand-500/50 bg-brand-500/5'
              : 'border-slate-700 hover:border-slate-600 bg-slate-950/50'
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
          />
          {previewUrl ? (
            <div className="flex flex-col items-center">
              <img
                src={previewUrl}
                alt="Retinal Preview"
                className="w-36 h-36 object-cover rounded-xl border border-slate-700 shadow-md mb-2"
              />
              <span className="text-xs text-brand-400 font-medium flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{selectedFile?.name} (Click to change)</span>
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                <FileUp className="w-6 h-6 text-brand-400" />
              </div>
              <p className="text-sm font-semibold text-slate-200">
                Click to browse or drag & drop fundus photo
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports DICOM exports, JPG, PNG, TIFF (Min. 512x512 recommended)
              </p>
            </div>
          )}
        </div>

        {/* Live IQA Pre-check Feedback */}
        {iqaChecking && (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center space-x-2 text-xs text-slate-400">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-400" />
            <span>Evaluating image clarity, illumination, and retinal aperture...</span>
          </div>
        )}

        {iqaResult && !iqaChecking && (
          <div
            className={`p-3.5 rounded-xl border text-xs ${iqaResult.passed
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
              }`}
          >
            <div className="flex items-center space-x-2 font-semibold flex-wrap gap-1">
              {iqaResult.passed ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>{iqaResult.passed ? t.iqaPassed : t.iqaFailed}</span>
              {iqaResult.error_codes?.map((code) => (
                <span key={code} className="px-1.5 py-0.5 rounded bg-rose-900/60 text-white font-mono text-[9px]">
                  {code}
                </span>
              ))}
            </div>
            <p className="text-[11px] mt-1.5 opacity-90">{iqaResult.feedback}</p>
            {iqaResult.recapture_instructions && !iqaResult.passed && (
              <p className="text-[10px] mt-1.5 text-rose-200 font-semibold bg-rose-900/40 p-2 rounded-lg border border-rose-800/40">
                <b>Recapture Guidance:</b> {iqaResult.recapture_instructions}
              </p>
            )}
            <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
              <div>Sharpness: {iqaResult.blur_score}</div>
              <div>Luminance: {iqaResult.illumination_score}</div>
              <div>Contrast: {iqaResult.contrast_score}</div>
            </div>
          </div>
        )}

        {/* Patient Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">{t.patientName}</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">{t.patientAge}</label>
              <input
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">{t.patientGender}</label>
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="Male">{t.male}</option>
                <option value="Female">{t.female}</option>
                <option value="Other">{t.other}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">{t.eyeSide}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEyeSide('RIGHT')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${eyeSide === 'RIGHT'
                    ? 'bg-brand-600/20 border-brand-500 text-brand-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
              >
                {t.rightEye}
              </button>
              <button
                type="button"
                onClick={() => setEyeSide('LEFT')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${eyeSide === 'LEFT'
                    ? 'bg-brand-600/20 border-brand-500 text-brand-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
              >
                {t.leftEye}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">{t.patientHistory}</label>
            <input
              type="text"
              value={diabetesHistory}
              onChange={(e) => setDiabetesHistory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedFile || isLoading}
          className={`w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg ${!selectedFile || isLoading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white shadow-brand-500/25 active:scale-[0.99]'
            }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{t.analyzing}</span>
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              <span>{t.analyzeBtn}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

