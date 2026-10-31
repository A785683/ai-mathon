import React from 'react';
import { Eye, ShieldCheck, Activity, Globe, FileText, Stethoscope, Database } from 'lucide-react';
import { Language, translations } from '../utils/language';
import { SystemHealth } from '../types';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: 'studio' | 'history' | 'review' | 'system';
  onTabChange: (tab: 'studio' | 'history' | 'review' | 'system') => void;
  health: SystemHealth | null;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  activeTab,
  onTabChange,
  health
}) => {
  const t = translations[lang];

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('studio')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  {t.appTitle}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full">
                  PS-14 Benchmark
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => onTabChange('studio')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'studio'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>{t.navStudio}</span>
            </button>
            <button
              onClick={() => onTabChange('history')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'history'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{t.navHistory}</span>
            </button>
            <button
              onClick={() => onTabChange('review')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'review'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>{t.navClinician}</span>
            </button>
            <button
              onClick={() => onTabChange('system')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'system'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>{t.navBenchmarks}</span>
            </button>
          </nav>

          {/* Language Switcher & System Status */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onLanguageChange(lang === 'en' ? 'hi' : 'en')}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              title="Toggle English / हिंदी"
            >
              <Globe className="w-3.5 h-3.5 text-brand-400" />
              <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
            </button>

            <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-slate-800 text-xs">
              <span className={`w-2 h-2 rounded-full ${health ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-slate-400 font-mono text-[11px]">
                {health?.pytorch.backbone || 'PyTorch Edge'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

