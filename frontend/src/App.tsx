import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { DiagnosticStudio } from './components/DiagnosticStudio';
import { PatientHistoryTable } from './components/PatientHistoryTable';
import { DoctorReviewModal } from './components/DoctorReviewModal';
import { ReportModal } from './components/ReportModal';
import { SystemInfoView } from './components/SystemInfoView';
import { Language } from './utils/language';
import { ScreeningDetail, ScreeningListItem, SystemHealth } from './types';
import { uploadAndAnalyzeScreening, listScreenings, getScreeningDetail, getSystemHealth } from './services/api';
import { Stethoscope, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export function App() {
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<'studio' | 'history' | 'review' | 'system'>('studio');
  const [health, setHealth] = useState<SystemHealth | null>(null);

  const [activeScreening, setActiveScreening] = useState<ScreeningDetail | null>(null);
  const [screeningsList, setScreeningsList] = useState<ScreeningListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Fetch initial health and screening list
  const loadInitialData = async () => {
    try {
      const h = await getSystemHealth();
      setHealth(h);
    } catch (e) {
      console.warn('Backend health check pending...');
    }

    try {
      const res = await listScreenings(1, 50);
      setScreeningsList(res.items);
      // Default to the first pre-seeded screening if available
      if (res.items.length > 0 && !activeScreening) {
        const detail = await getScreeningDetail(res.items[0].id);
        setActiveScreening(detail);
      }
    } catch (e) {
      console.warn('Initial screenings load notice:', e);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleAnalyze = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await uploadAndAnalyzeScreening(formData);
      setActiveScreening(result);
      setActiveTab('studio');
      // Refresh list
      const res = await listScreenings(1, 50);
      setScreeningsList(res.items);
    } catch (err: any) {
      setError(err.message || 'Screening analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectScreening = async (id: string) => {
    try {
      const detail = await getScreeningDetail(id);
      setActiveScreening(detail);
      setActiveTab('studio');
    } catch (e) {
      console.error('Failed to load screening:', e);
    }
  };

  const handleReviewSuccess = (updated: ScreeningDetail) => {
    setActiveScreening(updated);
    // Refresh history
    listScreenings(1, 50).then((res) => setScreeningsList(res.items));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <Header
        lang={lang}
        onLanguageChange={setLang}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        health={health}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="px-2 py-0.5 rounded bg-rose-900/40 hover:bg-rose-900 text-white font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Diagnostic Studio */}
        {activeTab === 'studio' && (
          <div className="space-y-8">
            {/* If no screening active or user wants to upload */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5">
                <ImageUploader
                  lang={lang}
                  onAnalyze={handleAnalyze}
                  isLoading={isLoading}
                />
              </div>

              <div className="lg:col-span-7">
                {activeScreening ? (
                  <DiagnosticStudio
                    screening={activeScreening}
                    lang={lang}
                    onOpenReview={() => setIsReviewOpen(true)}
                    onOpenReport={() => setIsReportOpen(true)}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center p-12 bg-slate-900/50 border border-slate-800 rounded-2xl text-center text-slate-500">
                    <p className="text-sm">
                      Upload a fundus image on the left or select a sample benchmark case to initialize the diagnostic studio.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Screening Registry & History */}
        {activeTab === 'history' && (
          <PatientHistoryTable
            screenings={screeningsList}
            lang={lang}
            onSelectScreening={handleSelectScreening}
          />
        )}

        {/* Tab 3: Clinician Review Queue */}
        {activeTab === 'review' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Doctor Review & Clinical Triage Queue</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ophthalmologist sign-off, AI grade confirmation/override, and clinical referral planning
                  </p>
                </div>
              </div>
            </div>

            <PatientHistoryTable
              screenings={screeningsList}
              lang={lang}
              onSelectScreening={(id) => {
                handleSelectScreening(id);
                setIsReviewOpen(true);
              }}
            />
          </div>
        )}

        {/* Tab 4: System Architecture & Integrity */}
        {activeTab === 'system' && (
          <SystemInfoView health={health} lang={lang} />
        )}

      </main>

      {/* Review Modal */}
      {isReviewOpen && activeScreening && (
        <DoctorReviewModal
          screening={activeScreening}
          lang={lang}
          onClose={() => setIsReviewOpen(false)}
          onSuccess={handleReviewSuccess}
        />
      )}

      {/* Report Modal */}
      {isReportOpen && activeScreening && (
        <ReportModal
          screening={activeScreening}
          lang={lang}
          onClose={() => setIsReportOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>RetinaVision-AI • AI Manthan 2.0 (Problem Statement 14)</span>
          <span>ICDR 5-Grade Standard • Bilingual Hindi/English Decision Support</span>
        </div>
      </footer>
    </div>
  );
}
export default App;

