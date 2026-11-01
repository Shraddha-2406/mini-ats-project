import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJobs, getApplications } from '../services/storageService';
import { calculateMatchScore, generateSkillRecommendations } from '../services/matchingService';
import MatchScoreRing from '../components/common/MatchScoreRing';
import SkillChip from '../components/common/SkillChip';
import StatusBadge from '../components/common/StatusBadge';
import JobApplicationModal from '../components/candidate/JobApplicationModal';
import {
  PieChart,
  Briefcase,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ChevronDown,
  Layers,
  Sparkles,
  Send,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';

export default function MatchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(searchParams.get('jobId') || '');
  const [applications, setApplications] = useState([]);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  useEffect(() => {
    if (searchParams.get('jobId')) {
      setSelectedJobId(searchParams.get('jobId'));
    }
  }, [searchParams]);

  const loadData = () => {
    const allJobs = getJobs({ status: 'Active' });
    setJobs(allJobs);

    const initialId = searchParams.get('jobId') || allJobs[0]?.id || '';
    setSelectedJobId(initialId);

    if (currentUser) {
      const myApps = getApplications({ candidateId: currentUser.id });
      setApplications(myApps);
    }
  };

  const handleJobSelect = (e) => {
    const id = e.target.value;
    setSelectedJobId(id);
    setSearchParams({ jobId: id });
  };

  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0];
  const candidateSkills = currentUser?.skills || [];
  const requiredSkills = currentJob?.requiredSkills || [];

  const matchResult = calculateMatchScore(candidateSkills, requiredSkills);
  const recommendationsText = generateSkillRecommendations(matchResult, currentJob?.title);

  // Check application status for this job
  const existingApp = applications.find(a => a.jobId === currentJob?.id);
  const threshold = currentJob?.threshold || 80;
  const isEligible = matchResult.score >= threshold;

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <PieChart className="w-3.5 h-3.5" />
            <span>Deterministic Skill Match Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Your Job Match Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Detailed breakdown of matched skills, missing competencies, and threshold qualification.
          </p>
        </div>

        {/* Job selector dropdown */}
        <div className="w-full sm:w-72 bg-white rounded-2xl border border-blue-200 p-2 shadow-subtle self-start sm:self-auto">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-600 px-2 pt-1">
            Select Job Position
          </label>
          <div className="relative">
            <select
              value={selectedJobId}
              onChange={handleJobSelect}
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

      {currentJob ? (
        <div className="space-y-8">
          {/* JOB SUMMARY BANNER */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-md shadow-blue-500/20 flex-shrink-0">
                {currentJob.companyInitials || 'TN'}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {currentJob.type} Position
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  {currentJob.title}
                </h2>
                <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                  <span className="font-semibold text-slate-700">{currentJob.companyName}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" />{currentJob.location}</span>
                  <span>•</span>
                  <span>Min Exp: {currentJob.minExperience}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <Link
                to="/candidate/jobs"
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition text-center flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Jobs</span>
              </Link>

              {existingApp ? (
                <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Application Status</span>
                  <StatusBadge status={existingApp.status} />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/25 transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Apply for this Role</span>
                </button>
              )}
            </div>
          </div>

          {/* MAIN ANALYSIS HERO CARD */}
          <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50/40 rounded-3xl border border-slate-200/90 p-8 shadow-card grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Circular Ring Column */}
            <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-4">
              <MatchScoreRing score={matchResult.score} size="xl" />
              <div className="mt-4">
                <span className={`inline-block font-extrabold text-sm px-3 py-1 rounded-full ${
                  matchResult.score >= 80 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : matchResult.score >= 50
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {matchResult.score >= 80 ? 'High Compatibility Match' : matchResult.score >= 50 ? 'Moderate Compatibility' : 'Low Compatibility Match'}
                </span>
                <p className="text-xs text-slate-500 mt-1.5">
                  Formula: ({matchResult.matchedCount} Matched / {matchResult.totalRequired} Required) × 100
                </p>
              </div>
            </div>

            {/* Metrics Breakdown Column */}
            <div className="md:col-span-7 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Screening Compatibility Breakdown
              </h3>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-subtle">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Required</span>
                  <span className="text-2xl font-black text-slate-800">{matchResult.totalRequired}</span>
                  <span className="text-[10px] text-slate-500 block">Skills</span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-subtle">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Matched</span>
                  <span className="text-2xl font-black text-emerald-600">{matchResult.matchedCount}</span>
                  <span className="text-[10px] text-emerald-700 block">Skills</span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-amber-100 shadow-subtle">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">Missing</span>
                  <span className="text-2xl font-black text-amber-600">{matchResult.missingSkills.length}</span>
                  <span className="text-[10px] text-amber-700 block">Skills</span>
                </div>
              </div>

              {/* Threshold Comparison Banner */}
              <div className={`p-4 rounded-2xl border flex items-start space-x-3 text-xs leading-relaxed ${
                isEligible 
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                  : 'bg-amber-50/70 border-amber-200 text-amber-900'
              }`}>
                {isEligible ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">
                    {isEligible
                      ? `Eligible for Automated Shortlisting! (${matchResult.score}% ≥ ${threshold}% threshold)`
                      : `Below Shortlisting Threshold (${matchResult.score}% < ${threshold}% threshold)`}
                  </p>
                  <p className="text-[11px] mt-0.5 opacity-90">
                    {isEligible
                      ? 'Your skills satisfy the recruiter qualification criteria for this role.'
                      : 'You can still submit your application for manual recruiter evaluation.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SIDE-BY-SIDE SKILL COMPARISON */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Matched Skills ({matchResult.matchedSkills.length})
                  </h4>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Active in Profile
                </span>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[60px]">
                {matchResult.matchedSkills.length > 0 ? (
                  matchResult.matchedSkills.map(skill => (
                    <SkillChip key={skill} name={skill} variant="matched" />
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">None of the required skills match your current profile.</p>
                )}
              </div>
            </div>

            {/* Missing Skills Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Missing Required Skills ({matchResult.missingSkills.length})
                  </h4>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  Skill Gap
                </span>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[60px]">
                {matchResult.missingSkills.length > 0 ? (
                  matchResult.missingSkills.map(skill => (
                    <SkillChip key={skill} name={skill} variant="missing" />
                  ))
                ) : (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>No missing skills! You meet 100% of the role's required competencies.</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RULE-BASED RECOMMENDATIONS BOX */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-3">
            <div className="flex items-center space-x-2.5 text-blue-600">
              <Lightbulb className="w-5 h-5" />
              <h4 className="text-sm font-bold text-slate-900">
                Rule-Based Skill Gap Recommendation
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              {recommendationsText}
            </p>
            <p className="text-[11px] text-slate-400">
              * Note: Transparent rule-based algorithmic guidance generated from job qualification criteria.
            </p>
          </div>

          {/* FULL COMPARISON MATRIX */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Full Requirement vs Candidate Skill Matrix
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-2 pl-2">Required Job Skill</th>
                    <th className="pb-2">Candidate Status</th>
                    <th className="pb-2">Impact on Match Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requiredSkills.map(skill => {
                    const isMatch = matchResult.matchedSkills.includes(skill);
                    const weight = Math.round(100 / (requiredSkills.length || 1));
                    return (
                      <tr key={skill} className="hover:bg-slate-50/50">
                        <td className="py-2.5 pl-2 font-bold text-slate-800">{skill}</td>
                        <td className="py-2.5">
                          {isMatch ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Present in profile</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                              <span>Missing from profile</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-slate-500">
                          +{weight}% towards total score
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-card">
          <p className="text-xs text-slate-500">No active job selected.</p>
        </div>
      )}

      {/* Application Modal */}
      <JobApplicationModal
        job={currentJob}
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onApplicationSuccess={loadData}
      />
    </div>
  );
}

