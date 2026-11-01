import React from 'react';
import SkillChip from '../common/SkillChip';
import { X, Briefcase, MapPin, Clock, Calendar, ShieldCheck, CheckCircle } from 'lucide-react';

export default function JobPreviewModal({ job, isOpen, onClose }) {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-elevated border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Job Post Preview
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{job.title || 'Job Title'}</h3>
            <p className="text-xs text-slate-500">{job.companyName || 'Company Name'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Quick Badges */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {job.location || 'Location Not Specified'}
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
              <Briefcase className="w-3.5 h-3.5 text-slate-500" />
              {job.type || 'Full-Time'}
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {job.minExperience || '0-2 years'}
            </span>
            {job.deadline && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-3 py-1 rounded-xl border border-amber-200">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                Deadline: {job.deadline}
              </span>
            )}
          </div>

          {/* Shortlisting threshold banner */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 flex items-center space-x-3 text-xs text-blue-900">
            <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Automated Shortlisting Threshold: {job.threshold || 80}%</p>
              <p className="text-blue-700/80 mt-0.5">
                Applicants matching or exceeding {job.threshold || 80}% of the required skills will be automatically recommended for shortlisting.
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Job Description
            </h4>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">
              {job.description || 'No detailed job description provided.'}
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Required Technical Skills ({(job.requiredSkills || []).length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {(job.requiredSkills || []).length > 0 ? (
                job.requiredSkills.map(skill => (
                  <SkillChip key={skill} name={skill} variant="primary" />
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No specific skills configured.</span>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

