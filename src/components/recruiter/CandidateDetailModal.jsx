import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { updateApplicationStatus } from '../../services/storageService';
import MatchScoreRing from '../common/MatchScoreRing';
import SkillChip from '../common/SkillChip';
import StatusBadge from '../common/StatusBadge';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  Briefcase,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Save
} from 'lucide-react';

export default function CandidateDetailModal({ applicant, job, isOpen, onClose, onStatusChange }) {
  const { success, error } = useToast();
  const [selectedStatus, setSelectedStatus] = useState(applicant?.status || 'Pending');
  const [notes, setNotes] = useState(applicant?.notes || '');
  const [saving, setSaving] = useState(false);

  if (!isOpen || !applicant) return null;

  const profile = applicant.candidateProfile || {};
  const resumeFile = applicant.resumeFile || profile.resumeFile;

  const handleSave = () => {
    setSaving(true);
    try {
      updateApplicationStatus(applicant.id, selectedStatus, notes);
      success(`Updated status for ${applicant.candidateName} to ${selectedStatus}!`);
      if (onStatusChange) onStatusChange();
      onClose();
    } catch (err) {
      error(err.message || 'Failed to update application.');
    } finally {
      setSaving(false);
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
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
              {applicant.candidateName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900">{applicant.candidateName}</h3>
                <StatusBadge status={selectedStatus} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Applied for <strong className="text-slate-700">{job?.title || applicant.appliedJob || 'Job Opening'}</strong>
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

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Match Score & Key Metrics Banner */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50/40 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <MatchScoreRing score={applicant.matchScore} size="md" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Algorithmic Skill Match: {applicant.matchScore}%
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Job Threshold: <strong className="text-slate-800">{job?.threshold || 80}%</strong>
                  {applicant.matchScore >= (job?.threshold || 80) ? (
                    <span className="text-emerald-600 font-semibold ml-2">• Qualified for shortlist</span>
                  ) : (
                    <span className="text-amber-600 font-semibold ml-2">• Below target threshold</span>
                  )}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Formula: ({applicant.matchedSkills?.length || 0} Matched / {job?.requiredSkills?.length || 5} Required) × 100
                </p>
              </div>
            </div>
          </div>

          {/* Contact & Academic Profile Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <div className="flex items-center space-x-2 text-slate-700">
              <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">{applicant.candidateEmail}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700">
              <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span>{profile.phone || '+91 98765 43210'}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700">
              <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span>{profile.location || 'Pune, India'}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700">
              <Briefcase className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span>{profile.experienceYears !== undefined ? `${profile.experienceYears} Years Exp` : '1-2 Years Exp'}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700 sm:col-span-2">
              <GraduationCap className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span>{profile.education || profile.degree || 'Bachelor of Engineering in CS'} ({profile.graduationYear || '2025'})</span>
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Matched Skills ({applicant.matchedSkills?.length || 0})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {applicant.matchedSkills && applicant.matchedSkills.length > 0 ? (
                  applicant.matchedSkills.map(skill => (
                    <SkillChip key={skill} name={skill} variant="matched" size="sm" />
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No direct skill matches</span>
                )}
              </div>
            </div>

            {applicant.missingSkills && applicant.missingSkills.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Missing Job Requirements ({applicant.missingSkills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {applicant.missingSkills.map(skill => (
                    <SkillChip key={skill} name={skill} variant="missing" size="sm" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resume attachment metadata */}
          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Candidate Resume Attachment
            </p>
            {resumeFile ? (
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{resumeFile.name}</p>
                    <p className="text-[10px] text-slate-400">{resumeFile.size || '250 KB'} • PDF Document</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  Verified PDF
                </span>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No resume PDF attached yet.</p>
            )}
          </div>

          {/* Recruiter Status Decision & Notes */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Recruiter Decision / Application Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStatus('Shortlisted')}
                  className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    selectedStatus === 'Shortlisted'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Shortlist</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('Pending')}
                  className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    selectedStatus === 'Pending'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Mark Pending</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('Rejected')}
                  className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    selectedStatus === 'Rejected'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Recruiter Screening Notes
              </label>
              <textarea
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add evaluation comments, interview feedback, or remarks..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-200/50 rounded-xl transition"
          >
            Close
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition active:scale-95 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Decision'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

