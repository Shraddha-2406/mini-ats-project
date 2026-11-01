import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getJobs,
  getApplications
} from '../services/storageService';
import { calculateMatchScore } from '../services/matchingService';
import { calculateProfileCompletion, formatDate } from '../utils/helpers';
import StatCard from '../components/common/StatCard';
import MatchScoreRing from '../components/common/MatchScoreRing';
import SkillChip from '../components/common/SkillChip';
import StatusBadge from '../components/common/StatusBadge';
import ProfileEditorModal from '../components/candidate/ProfileEditorModal';
import {
  Briefcase,
  Send,
  CheckCircle2,
  Clock,
  FileText,
  ArrowRight,
  TrendingUp,
  PieChart,
  User,
  Plus,
  Eye,
  AlertCircle
} from 'lucide-react';

export default function CandidateDashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = () => {
    const allJobs = getJobs({ status: 'Active' });
    setJobs(allJobs);

    if (currentUser) {
      const apps = getApplications({ candidateId: currentUser.id });
      setMyApplications(apps);
    }
  };

  const profileCompletion = calculateProfileCompletion(currentUser);
  const candidateSkills = currentUser?.skills || [];

  // Recommended jobs sorted by match score
  const recommendedJobs = jobs
    .map(job => {
      const match = calculateMatchScore(candidateSkills, job.requiredSkills || []);
      return {
        ...job,
        matchScore: match.score,
        matchedCount: match.matchedCount,
        totalRequired: match.totalRequired,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  const shortlistedCount = myApplications.filter(a => a.status === 'Shortlisted').length;
  const pendingCount = myApplications.filter(a => a.status === 'Pending').length;

  return (
    <div className="space-y-8 pb-12">
      {/* WELCOME BANNER & PROFILE COMPLETION CIRCLE */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-blue-100 text-xs font-semibold">
            <span>Candidate Portal Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Candidate'}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Your candidate dashboard highlights top skill compatibility, application progress, and recommended openings.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <button
              onClick={() => setProfileModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white text-blue-700 font-bold text-xs shadow-sm hover:bg-blue-50 transition"
            >
              Complete Profile
            </button>
            <Link
              to="/candidate/resume"
              className="px-4 py-2 rounded-xl bg-white/15 text-white font-semibold text-xs border border-white/20 hover:bg-white/25 transition"
            >
              Upload Resume & Skills
            </Link>
            <Link
              to="/candidate/jobs"
              className="px-4 py-2 rounded-xl bg-white/15 text-white font-semibold text-xs border border-white/20 hover:bg-white/25 transition"
            >
              Browse Jobs
            </Link>
          </div>
        </div>

        {/* Circular Profile Completion Meter */}
        <div className="flex-shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center space-x-4">
          <div className="relative">
            <svg width={72} height={72} className="transform -rotate-90">
              <circle
                cx={36}
                cy={36}
                r={28}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={6}
                fill="transparent"
              />
              <circle
                cx={36}
                cy={36}
                r={28}
                stroke="#34D399"
                strokeWidth={6}
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={(2 * Math.PI * 28) * (1 - profileCompletion / 100)}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-white">
              {profileCompletion}%
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              Profile Completeness
            </p>
            <p className="text-[11px] text-blue-100 mt-0.5">
              {profileCompletion === 100 ? 'All profile fields completed!' : 'Add skills or resume to reach 100%'}
            </p>
          </div>
        </div>
      </div>

      {/* 4 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Profile Completion"
          value={`${profileCompletion}%`}
          subtitle="Candidate Profile Readiness"
          icon={User}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          trend={profileCompletion >= 80 ? 'Optimal' : 'Needs Update'}
          trendType={profileCompletion >= 80 ? 'up' : 'neutral'}
          onClick={() => setProfileModalOpen(true)}
        />
        <StatCard
          title="Available Jobs"
          value={jobs.length}
          subtitle="Active Openings Listed"
          icon={Briefcase}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          trend="Live database"
          trendType="up"
          onClick={() => navigate('/candidate/jobs')}
        />
        <StatCard
          title="Applied Jobs"
          value={myApplications.length}
          subtitle="Applications in Pipeline"
          icon={Send}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          trend={`${pendingCount} under review`}
          trendType="neutral"
        />
        <StatCard
          title="Shortlisted Applications"
          value={shortlistedCount}
          subtitle="Qualified by Threshold"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          trend="Eligible for interview"
          trendType="up"
        />
      </div>

      {/* TWO COLUMN GRID: RECOMMENDED JOBS & CANDIDATE SKILLS/RESUME */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: RECOMMENDED OPPORTUNITIES */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Recommended Opportunities
              </h3>
              <p className="text-xs text-slate-500">
                Jobs matching your technical skill profile
              </p>
            </div>
            <Link
              to="/candidate/jobs"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All ({jobs.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {recommendedJobs.map(job => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {job.companyInitials || 'TN'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{job.companyName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">{job.location}</span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 hover:text-blue-600 cursor-pointer">
                    {job.title}
                  </h4>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(job.requiredSkills || []).slice(0, 4).map(skill => {
                      const isMatch = candidateSkills.some(s => s.toLowerCase() === skill.toLowerCase());
                      return (
                        <SkillChip
                          key={skill}
                          name={skill}
                          variant={isMatch ? 'matched' : 'outline'}
                          size="sm"
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <MatchScoreRing score={job.matchScore} size="sm" showLabel={false} />
                  </div>
                  <Link
                    to={`/candidate/match-results?jobId=${job.id}`}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition"
                  >
                    <span>Analyze Match</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: SKILLS OVERVIEW & RESUME STATUS */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Skills Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Your Technical Skills ({candidateSkills.length})
                </h4>
                <p className="text-[11px] text-slate-500">
                  Used by algorithm to calculate matching score
                </p>
              </div>
              <Link
                to="/candidate/resume"
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Edit Skills
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {candidateSkills.length > 0 ? (
                candidateSkills.map(skill => (
                  <SkillChip key={skill} name={skill} variant="primary" />
                ))
              ) : (
                <div className="text-center py-4 w-full">
                  <p className="text-xs text-slate-400">No skills added yet.</p>
                  <Link
                    to="/candidate/resume"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 font-bold mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Technical Skills</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Active Resume Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900">
                Uploaded Resume
              </h4>
              <Link
                to="/candidate/resume"
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Manage
              </Link>
            </div>

            {currentUser?.resumeFile ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
                      {currentUser.resumeFile.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {currentUser.resumeFile.size} • PDF
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
            ) : (
              <div className="text-center py-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 mb-2">No resume uploaded to session.</p>
                <Link
                  to="/candidate/resume"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Upload Resume PDF</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RECENT APPLICATIONS TABLE / SECTION */}
      <div id="applications" className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Application Activity ({myApplications.length})
            </h3>
            <p className="text-xs text-slate-500">
              Real-time application pipeline and qualification results
            </p>
          </div>
          <Link
            to="/candidate/jobs"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Apply for New Role</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {myApplications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 pl-2">Job Title</th>
                  <th className="pb-3">Applied Date</th>
                  <th className="pb-3 text-center">Match Score</th>
                  <th className="pb-3">Matched Skills</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myApplications.map(app => {
                  const job = jobs.find(j => j.id === app.jobId) || {};
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 pl-2 font-bold text-slate-800">
                        {job.title || 'Job Opening'}
                        <span className="block text-[11px] font-normal text-slate-500">
                          {job.companyName || 'TechNova'}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-500">
                        {formatDate(app.appliedDate)}
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`inline-block font-extrabold px-2.5 py-0.5 rounded-full text-xs ${
                          app.matchScore >= 80 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {app.matchScore}%
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(app.matchedSkills || []).slice(0, 3).map(skill => (
                            <span key={skill} className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-100">
                              ✓ {skill}
                            </span>
                          ))}
                          {(app.matchedSkills || []).length > 3 && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              +{app.matchedSkills.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <Link
                          to={`/candidate/match-results?jobId=${app.jobId}`}
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Analysis</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500 mb-2">You haven't submitted any job applications yet.</p>
            <Link
              to="/candidate/jobs"
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Explore Available Jobs</span>
            </Link>
          </div>
        )}
      </div>

      <ProfileEditorModal
        isOpen={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          loadData();
        }}
      />
    </div>
  );
}

