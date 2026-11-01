import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getJobs,
  getRankedCandidates,
  updateApplicationStatus
} from '../services/storageService';
import { getScoreColor } from '../utils/helpers';
import StatusBadge from '../components/common/StatusBadge';
import CandidateDetailModal from '../components/recruiter/CandidateDetailModal';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Award,
  ChevronDown,
  ArrowUpDown,
  ShieldCheck,
  AlertTriangle,
  Briefcase
} from 'lucide-react';

export default function CandidateScreeningPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(searchParams.get('jobId') || '');
  const [rankedApplicants, setRankedApplicants] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('All');
  const [scoreFilter, setScoreFilter] = useState('All');

  // Detail modal state
  const [activeApplicant, setActiveApplicant] = useState(null);

  useEffect(() => {
    const allJobs = getJobs();
    const myJobs = currentUser ? allJobs.filter(j => j.recruiterId === currentUser.id || !j.recruiterId) : allJobs;
    setJobs(myJobs);

    const initialJobId = searchParams.get('jobId') || (myJobs[0]?.id || '');
    setSelectedJobId(initialJobId);
  }, [currentUser]);

  useEffect(() => {
    if (selectedJobId) {
      loadRankings(selectedJobId);
    }
  }, [selectedJobId]);

  const loadRankings = (jobId) => {
    if (!jobId) return;
    const ranked = getRankedCandidates(jobId);
    setRankedApplicants(ranked);
  };

  const handleJobChange = (e) => {
    const newJobId = e.target.value;
    setSelectedJobId(newJobId);
    setSearchParams({ jobId: newJobId });
  };

  const currentJob = jobs.find(j => j.id === selectedJobId);

  // Quick manual status override directly from the table
  const handleQuickStatus = (appId, newStatus, candidateName) => {
    try {
      updateApplicationStatus(appId, newStatus);
      success(`Updated status for ${candidateName} to ${newStatus}.`);
      loadRankings(selectedJobId);
    } catch (err) {
      error(err.message || 'Status update failed.');
    }
  };

  // Filter candidates
  const filteredApplicants = rankedApplicants.filter(cand => {
    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = cand.candidateName.toLowerCase().includes(q);
      const matchEmail = cand.candidateEmail.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }

    // Status filter
    if (statusFilter !== 'All' && cand.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }

    // Score filter
    if (scoreFilter === 'high' && cand.matchScore < 80) return false;
    if (scoreFilter === 'moderate' && (cand.matchScore < 50 || cand.matchScore >= 80)) return false;
    if (scoreFilter === 'low' && cand.matchScore >= 50) return false;

    return true;
  });

  const totalApplicantsCount = rankedApplicants.length;
  const shortlistedCount = rankedApplicants.filter(a => a.status === 'Shortlisted').length;
  const pendingCount = rankedApplicants.filter(a => a.status === 'Pending').length;
  const rejectedCount = rankedApplicants.filter(a => a.status === 'Rejected').length;

  return (
    <div className="space-y-8 pb-16">
      {/* SCREENING HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Algorithmic ATS Applicant Screening Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Candidate Screening & Ranking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sort, filter, and review ranked applicants for each job based on normalized skill match scores.
          </p>
        </div>

        {/* JOB SELECTOR DROPDOWN */}
        <div className="w-full md:w-80 bg-white rounded-2xl border border-blue-200 p-2 shadow-subtle">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-600 px-2 pt-1">
            Select Job Opening to Screen
          </label>
          <div className="relative">
            <select
              value={selectedJobId}
              onChange={handleJobChange}
              className="w-full bg-transparent text-sm font-bold text-slate-900 py-1 px-2 pr-8 focus:outline-none cursor-pointer appearance-none"
            >
              {jobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.companyName})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-blue-500 absolute right-2 top-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* JOB SUMMARY & THRESHOLD BANNER */}
      {currentJob && (
        <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/60 rounded-2xl p-5 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
              {currentJob.companyInitials || 'TN'}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {currentJob.title} — Screening Active
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Required Skills: <strong className="text-slate-800">{(currentJob.requiredSkills || []).join(', ')}</strong> ({currentJob.requiredSkills?.length || 0} skills)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-center self-end md:self-auto">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-blue-100 shadow-subtle">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Job Threshold
              </span>
              <span className="text-lg font-black text-blue-600">
                {currentJob.threshold || 80}%
              </span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-blue-100 shadow-subtle">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Applicants
              </span>
              <span className="text-lg font-black text-slate-800">
                {totalApplicantsCount}
              </span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-emerald-100 shadow-subtle">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                Shortlisted
              </span>
              <span className="text-lg font-black text-emerald-600">
                {shortlistedCount}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FILTER CONTROLS & SEARCH */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search candidate name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Statuses ({totalApplicantsCount})</option>
            <option value="Shortlisted">Shortlisted ({shortlistedCount})</option>
            <option value="Pending">Under Review ({pendingCount})</option>
            <option value="Rejected">Rejected ({rejectedCount})</option>
          </select>

          {/* Score filter */}
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-700"
          >
            <option value="All">All Scores</option>
            <option value="high">High Match (≥ 80%)</option>
            <option value="moderate">Moderate Match (50–79%)</option>
            <option value="low">Low Match (&lt; 50%)</option>
          </select>
        </div>
      </div>

      {/* APPLICANT RANKING TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        {filteredApplicants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="py-3.5 pl-4 text-center w-14">Rank</th>
                  <th className="py-3.5 pl-2">Candidate Info</th>
                  <th className="py-3.5">Education & Exp</th>
                  <th className="py-3.5">Matched Skills</th>
                  <th className="py-3.5 text-center">Score Progress</th>
                  <th className="py-3.5">ATS Status</th>
                  <th className="py-3.5 text-right pr-4">Screening Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplicants.map((applicant) => {
                  const scoreConfig = getScoreColor(applicant.matchScore);
                  const isTopRanked = applicant.rank === 1;

                  return (
                    <tr
                      key={applicant.id}
                      className={`hover:bg-slate-50/80 transition-all ${
                        isTopRanked ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-4 pl-4 text-center">
                        <div
                          className={`w-7 h-7 mx-auto rounded-full font-black flex items-center justify-center text-xs shadow-subtle ${
                            applicant.rank === 1
                              ? 'bg-amber-400 text-slate-900 ring-2 ring-amber-300'
                              : applicant.rank === 2
                              ? 'bg-slate-300 text-slate-800'
                              : applicant.rank === 3
                              ? 'bg-amber-600/30 text-amber-900'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {applicant.rank}
                        </div>
                      </td>

                      {/* Candidate Name & Contact */}
                      <td className="py-4 pl-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-sm">
                            {applicant.candidateName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer" onClick={() => setActiveApplicant(applicant)}>
                              {applicant.candidateName}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {applicant.candidateEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Education & Experience */}
                      <td className="py-4 text-slate-600">
                        <p className="font-medium truncate max-w-[150px]">
                          {applicant.education || 'B.E. Computer Eng.'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {applicant.experienceYears} Years Exp
                        </p>
                      </td>

                      {/* Matched Skills */}
                      <td className="py-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(applicant.matchedSkills || []).slice(0, 3).map(skill => (
                              <span
                                key={skill}
                                className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold"
                              >
                                ✓ {skill}
                              </span>
                            ))}
                            {(applicant.matchedSkills || []).length > 3 && (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                +{applicant.matchedSkills.length - 3}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {applicant.matchedSkills?.length || 0} of {currentJob?.requiredSkills?.length || 5} required skills
                          </p>
                        </div>
                      </td>

                      {/* Match Score Bar */}
                      <td className="py-4 text-center min-w-[130px]">
                        <div className="space-y-1.5 px-2">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className={scoreConfig.text}>{applicant.matchScore}%</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              Threshold: {currentJob?.threshold || 80}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${scoreConfig.bar}`}
                              style={{ width: `${applicant.matchScore}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* ATS Status */}
                      <td className="py-4">
                        <StatusBadge status={applicant.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 text-right pr-4">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Quick Shortlist Button */}
                          <button
                            type="button"
                            onClick={() => handleQuickStatus(applicant.id, 'Shortlisted', applicant.candidateName)}
                            className={`p-1.5 rounded-lg transition ${
                              applicant.status === 'Shortlisted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title="Shortlist Candidate"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>

                          {/* Quick Mark Pending Button */}
                          <button
                            type="button"
                            onClick={() => handleQuickStatus(applicant.id, 'Pending', applicant.candidateName)}
                            className={`p-1.5 rounded-lg transition ${
                              applicant.status === 'Pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                            }`}
                            title="Mark Under Review"
                          >
                            <Clock className="w-4 h-4" />
                          </button>

                          {/* Quick Reject Button */}
                          <button
                            type="button"
                            onClick={() => handleQuickStatus(applicant.id, 'Rejected', applicant.candidateName)}
                            className={`p-1.5 rounded-lg transition ${
                              applicant.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title="Reject Candidate"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>

                          {/* Full Detail Modal */}
                          <button
                            type="button"
                            onClick={() => setActiveApplicant(applicant)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs ml-1 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No applicants found for this position
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No candidates have applied to this job yet or filters did not match any applicants.
            </p>
          </div>
        )}
      </div>

      {/* RECRUITER ETHICAL ATS NOTICE */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-800">Recruiter Governance Note:</strong> Candidate match scores are computed deterministically as the mathematical proportion of required skills satisfied. The initial qualification status is automatically suggested based on the position's shortlisting threshold ({currentJob?.threshold || 80}%), but recruiters maintain full discretion to override and update candidate status.
        </p>
      </div>

      {/* Candidate detail modal */}
      <CandidateDetailModal
        applicant={activeApplicant}
        job={currentJob}
        isOpen={Boolean(activeApplicant)}
        onClose={() => setActiveApplicant(null)}
        onStatusChange={() => loadRankings(selectedJobId)}
      />
    </div>
  );
}

