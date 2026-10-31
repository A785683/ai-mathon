import React from 'react';
import { Layers, Eye, Sliders, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Language, translations } from '../utils/language';

interface LayerControlsProps {
  lang: Language;
  showRaw: boolean;
  setShowRaw: (val: boolean) => void;
  showPrep: boolean;
  setShowPrep: (val: boolean) => void;
  showGradcam: boolean;
  setShowGradcam: (val: boolean) => void;
  showLesions: boolean;
  setShowLesions: (val: boolean) => void;
  gradcamOpacity: number;
  setGradcamOpacity: (val: number) => void;
  zoom: number;
  setZoom: (val: number) => void;
  resetView: () => void;
  hasLesions: boolean;
}

export const LayerControls: React.FC<LayerControlsProps> = ({
  lang,
  showRaw,
  setShowRaw,
  showPrep,
  setShowPrep,
  showGradcam,
  setShowGradcam,
  showLesions,
  setShowLesions,
  gradcamOpacity,
  setGradcamOpacity,
  zoom,
  setZoom,
  resetView,
  hasLesions
}) => {
  const t = translations[lang];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-white">
          <Layers className="w-4 h-4 text-brand-400" />
          <span>Diagnostic Layer Engine</span>
        </div>
        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 text-slate-400">
          <button
            onClick={() => setZoom(Math.max(1, zoom - 0.25))}
            className="p-1 hover:text-white hover:bg-slate-800 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono px-1">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
            className="p-1 hover:text-white hover:bg-slate-800 rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1 hover:text-white hover:bg-slate-800 rounded ml-1"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Layer Toggles */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <button
          onClick={() => {
            setShowRaw(!showRaw);
            if (!showRaw) setShowPrep(false);
          }}
          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all font-medium ${
            showRaw
              ? 'bg-brand-600/20 border-brand-500 text-brand-300'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>{t.layerRaw}</span>
          <Eye className={`w-3.5 h-3.5 ${showRaw ? 'text-brand-400' : 'text-slate-600'}`} />
        </button>

        <button
          onClick={() => {
            setShowPrep(!showPrep);
            if (!showPrep) setShowRaw(false);
          }}
          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all font-medium ${
            showPrep
              ? 'bg-brand-600/20 border-brand-500 text-brand-300'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>{t.layerPrep}</span>
          <Eye className={`w-3.5 h-3.5 ${showPrep ? 'text-brand-400' : 'text-slate-600'}`} />
        </button>

        <button
          onClick={() => setShowGradcam(!showGradcam)}
          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all font-medium ${
            showGradcam
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>{t.layerGradcam}</span>
          <Eye className={`w-3.5 h-3.5 ${showGradcam ? 'text-amber-400' : 'text-slate-600'}`} />
        </button>

        <button
          onClick={() => setShowLesions(!showLesions)}
          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all font-medium ${
            showLesions
              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>{t.layerLesions}</span>
          <Eye className={`w-3.5 h-3.5 ${showLesions ? 'text-cyan-400' : 'text-slate-600'}`} />
        </button>
      </div>

      {/* Grad-CAM Opacity Slider */}
      {showGradcam && (
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex justify-between text-[11px] font-medium text-slate-400">
            <span className="flex items-center space-x-1">
              <Sliders className="w-3 h-3 text-amber-400" />
              <span>{t.gradcamOpacity}</span>
            </span>
            <span className="font-mono text-amber-300">{Math.round(gradcamOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={gradcamOpacity}
            onChange={(e) => setGradcamOpacity(parseFloat(e.target.value))}
            className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      )}

      {/* Lesion Legend */}
      {hasLesions && showLesions && (
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1.5">
          <div className="font-semibold text-slate-300 mb-1">Microvasculature Biomarkers:</div>
          <div className="flex items-center space-x-2 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-white inline-block"></span>
            <span>Microaneurysms (MAs)</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white inline-block"></span>
            <span>Intraretinal Hemorrhages (HE)</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-white inline-block"></span>
            <span>Hard/Soft Exudates (EX)</span>
          </div>
        </div>
      )}
    </div>
  );
};

