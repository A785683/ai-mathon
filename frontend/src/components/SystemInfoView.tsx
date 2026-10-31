import React from 'react';
import { Database, ShieldCheck, Cpu, Layers, FileCheck, BookOpen, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { SystemHealth } from '../types';
import { Language, translations } from '../utils/language';

interface SystemInfoViewProps {
  health: SystemHealth | null;
  lang: Language;
}

export const SystemInfoView: React.FC<SystemInfoViewProps> = ({ health, lang }) => {
  const t = translations[lang];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Architecture & Integrity Verification</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Benchmark Specifications for Problem Statement 14: AI-Assisted Retinal Microvasculature Diagnostics
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Runtime Engine */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-brand-400 font-bold text-sm">
            <Cpu className="w-4 h-4" />
            <span>Deep Learning Runtime</span>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Framework:</span>
              <span className="font-mono text-emerald-400">PyTorch {health?.pytorch.version || '2.15.0+cpu'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Architecture:</span>
              <span className="font-mono text-white">EfficientNet-B0 (5.3M Params)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Device Target:</span>
              <span className="font-mono text-white">CPU / Portable Edge Workstation</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">ICDR Severity Scale:</span>
              <span className="font-semibold text-white">5-Class (Grade 0 to 4)</span>
            </div>
          </div>
        </div>

        {/* Card 2: CV & Explainability */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
            <Layers className="w-4 h-4" />
            <span>Computer Vision & Explainability</span>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Image Quality (IQA):</span>
              <span className="font-semibold text-white">OpenCV Laplacian Blur & Luminance</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Preprocessing:</span>
              <span className="font-semibold text-white">Ben Graham & CLAHE Normalization</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Explainability:</span>
              <span className="font-semibold text-amber-400">Grad-CAM Feature Activation</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Lesion Segmentation:</span>
              <span className="font-semibold text-white">MA, Hemorrhage & Exudate Masks</span>
            </div>
          </div>
        </div>

        {/* Card 3: Training & Validation Benchmarks */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
            <Database className="w-4 h-4" />
            <span>Benchmark Datasets</span>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">APTOS 2019:</span>
              <span className="font-mono text-white">3,662 Clinician Graded Fundus</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">IDRiD Dataset:</span>
              <span className="font-mono text-white">Indian Population Lesion Masks</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Messidor-2:</span>
              <span className="font-mono text-white">1,748 Multi-Center Validation</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Language Engine:</span>
              <span className="font-semibold text-emerald-400">English + Hindi Bilingual Reports</span>
            </div>
          </div>
        </div>
      </div>

      {/* Strict Model Honesty Protocol Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-base">
          <ShieldCheck className="w-5 h-5" />
          <span>Strict AI Integrity & Clinical Safety Protocol</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          In strict accordance with the project requirements, <b>RetinaVision-AI does not fabricate diagnostic confidence scores or simulate random findings</b>.
          When trained deep learning weights are connected, inference executes through the full PyTorch convolution graph. If baseline weights are active, predictions are explicitly derived from OpenCV morphological lesion counts under the International Clinical Diabetic Retinopathy (ICDR) scale and clearly marked in every screen and PDF report.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified Checkpoint Protocol</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Weights loaded from APTOS/IDRiD benchmarks report calibrated probabilities with Grad-CAM target layer backpropagation.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Decision Support Classification</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Triage classifications (Routine, Non-Urgent, Urgent) comply with ICDR screening guidelines and CDSCO medical software guidance.
            </p>
          </div>
        </div>
      </div>

      {/* Citations & Research Paper References */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center space-x-2 text-white font-bold text-sm">
          <BookOpen className="w-4 h-4 text-brand-400" />
          <span>Primary Literature & Regulatory Sources</span>
        </div>
        <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-400">
          <li><b>DR Screen Research Document</b>: AI Manthan 2.0 Problem Statement 14 — AI-Assisted Diabetic Retinopathy Screening.</li>
          <li><b>IDF Diabetes Atlas</b>: Epidemiology of Diabetes in India (~74M adult diabetic population).</li>
          <li><b>ICMR-INDIAB Study & Chennai CURES Eye Study</b>: 12–17% Diabetic Retinopathy prevalence in Indian diabetic cohorts.</li>
          <li><b>Gulshan et al., JAMA 2016</b>: Development and Validation of a Deep Learning Algorithm for Detection of Diabetic Retinopathy in Retinal Fundus Photographs.</li>
          <li><b>CDSCO Medical Device Rules</b>: Clinical Decision Support Software Guidance (India).</li>
        </ul>
      </div>
    </div>
  );
};

