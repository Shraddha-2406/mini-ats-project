import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { createApplication } from '../../services/storageService';
import { calculateMatchScore } from '../../services/matchingService';
import MatchScoreRing from '../common/MatchScoreRing';
import SkillChip from '../common/SkillChip';
import { X, Briefcase, MapPin, CheckCircle, AlertTriangle, Send } from 'lucide-react';

export default function JobApplicationModal({ job, isOpen, onClose, onApplicationSuccess }) {
  const { currentUser } = useAuth();
  const { success, error } = useToast();
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !job) return null;

  const candidateSkills = currentUser?.skills || [];
  const requiredSkills = job.requiredSkills || [];
  const matchResult = calculateMatchScore(candidateSkills, requiredSkills);
  const threshold = job.threshold || 80;
  const isAboveThreshold = matchResult.score >= threshold;

  const handleApply = (e) => {
    e.preventDefault();
    if (!currentUser) {
      error('Please sign in as a candidate to apply.');
      return;
    }

    setSubmitting(true);
    try {
      createApplication({
        jobId: job.id,
        candidateId: currentUser.id,
        notes: notes.trim(),
      });
      success(`Application submitted for ${job.title} at ${job.companyName}!`);
      if (onApplicationSuccess) onApplicationSuccess();
      onClose();
    } catch (err) {
      error(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-elevated border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
              {job.companyInitials || 'TN'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span className="font-semibold text-slate-700">{job.companyName}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Skill Match Overview Card */}
          <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/60 rounded-2xl p-4 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <MatchScoreRing score={matchResult.score} size="md" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Skill Compatibility Score
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  You match <strong className="text-slate-800">{matchResult.matchedCount}</strong> out of <strong className="text-slate-800">{matchResult.totalRequired}</strong> required skills.
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  {isAboveThreshold ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Meets Shortlisting Threshold ({threshold}%)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      Below Shortlisting Threshold ({threshold}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Matched & Missing Skills Lists */}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Matched Skills ({matchResult.matchedSkills.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.matchedSkills.length > 0 ? (
                  matchResult.matchedSkills.map(skill => (
                    <SkillChip key={skill} name={skill} variant="matched" size="sm" />
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">None of the required skills match your current profile.</span>
                )}
              </div>
            </div>

            {matchResult.missingSkills.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Missing Skills ({matchResult.missingSkills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {matchResult.missingSkills.map(skill => (
                    <SkillChip key={skill} name={skill} variant="missing" size="sm" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Job Description Preview */}
          <div className="border-t border-slate-100 pt-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Role Description
            </h5>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {job.description}
            </p>
          </div>

          {/* Cover note / comments */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Application Note / Cover Note (Optional)
            </label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Highlight any additional experience, projects, or why you are excited about this role..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-200/50 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleApply}
            className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/25 transition active:scale-95 disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

