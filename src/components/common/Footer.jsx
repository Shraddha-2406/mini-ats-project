import React from 'react';
import { Layers, Database, ShieldCheck, Github, Code2, RefreshCw } from 'lucide-react';
import { resetToInitialData } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';

export default function Footer() {
  const { success } = useToast();

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to default state? This will restore original candidates, jobs, and applications.')) {
      resetToInitialData();
      success('Database restored to original demo seed data!');
      window.location.reload();
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900">
                Mini <span className="text-blue-600">ATS</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Intelligent Resume Screening & Candidate Ranking prototype designed for modern talent acquisition and academic DBMS demonstration.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetData}
                className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-blue-600 font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 transition"
                title="Reset demo data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>

          {/* Architecture info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Relational Schema (6 Tables)
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-blue-500" />
                <span>1. Users (Auth & Profiles)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-blue-500" />
                <span>2. Skills (Master Dictionary)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-blue-500" />
                <span>3. User_Skills (Candidate mapping)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-blue-500" />
                <span>4. Jobs (Postings & Criteria)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-blue-500" />
                <span>5. Job_Skills (Required skills)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-blue-500" />
                <span>6. Applications (Match & Status)</span>
              </li>
            </ul>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Core Modules
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>Candidate Skill Management</li>
              <li>Resume Upload Simulation</li>
              <li>Dynamic Job Discovery</li>
              <li>Deterministic Skill Match Engine</li>
              <li>Automated Shortlisting Threshold</li>
              <li>Recruiter ATS Screening & Ranking</li>
            </ul>
          </div>

          {/* Technical Specs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Technical Stack
            </h4>
            <p className="text-xs text-slate-500 mb-2">
              Phase 1: React, Vite, Tailwind CSS, LocalStorage Data Access Layer, Recharts.
            </p>
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-blue-900 space-y-1">
              <div className="font-semibold flex items-center space-x-1">
                <Code2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Phase 2 Ready</span>
              </div>
              <p className="text-blue-800/80">
                Data layer is fully prepared for Python Flask REST API & MySQL connector.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} Mini ATS — Third-Year Engineering DBMS Mini Project.</p>
          <p className="flex items-center space-x-2">
            <span>Client-side Prototype Persistence</span>
            <span>•</span>
            <span className="text-emerald-600 font-medium">Demo Mode Active</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

