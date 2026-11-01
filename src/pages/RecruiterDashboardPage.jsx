import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getJobs,
  getApplications,
  getUsers,
  deleteJob
} from '../services/storageService';
import { formatDate } from '../utils/helpers';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import CandidateDetailModal from '../components/recruiter/CandidateDetailModal';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  PlusCircle,
  Eye,
  TrendingUp,
  BarChart2,
  Layers,
  ArrowRight,
  Filter,
  Trash2,
  PieChart as PieIcon,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

export default function RecruiterDashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = () => {
    // Only jobs associated with this recruiter or default to all for demo
    const allJobs = getJobs();
    const myJobs = currentUser ? allJobs.filter(j => j.recruiterId === currentUser.id || !j.recruiterId) : allJobs;
    setJobs(myJobs);

    const myJobIds = myJobs.map(j => j.id);
    const allApps = getApplications();
    const myApps = allApps.filter(a => myJobIds.includes(a.jobId));
    setApplications(myApps);
  };

  const activeJobsCount = jobs.filter(j => j.status === 'Active').length;
  const totalAppsCount = applications.length;
  const shortlistedCount = applications.filter(a => a.status === 'Shortlisted').length;
  const pendingCount = applications.filter(a => a.status === 'Pending').length;

  // CHART 1: Applications by Job
  const appsByJobData = jobs.map(job => {
    const count = applications.filter(a => a.jobId === job.id).length;
    return {
      name: job.title.length > 15 ? `${job.title.substring(0, 14)}…` : job.title,
      fullName: job.title,
      applications: count,
    };
  });

  // CHART 2: Match Score Distribution (80-100%, 50-79%, 0-49%)
  const scoreDistributionData = [
    { name: 'High Match (80-100%)', count: applications.filter(a => a.matchScore >= 80).length, color: '#10B981' },
    { name: 'Moderate (50-79%)', count: applications.filter(a => a.matchScore >= 50 && a.matchScore < 80).length, color: '#F59E0B' },
    { name: 'Low (<50%)', count: applications.filter(a => a.matchScore < 50).length, color: '#EF4444' },
  ];

  // CHART 3: Application Pipeline Status
  const statusPipelineData = [
    { name: 'Shortlisted', value: shortlistedCount, color: '#10B981' },
    { name: 'Under Review', value: pendingCount, color: '#F59E0B' },
    { name: 'Rejected', value: applications.filter(a => a.status === 'Rejected').length, color: '#EF4444' },
  ];

  // CHART 4: Activity Trend (Simulated daily submission progression)
  const activityTrendData = [
    { day: 'Mon', applications: 2, shortlisted: 1 },
    { day: 'Tue', applications: 4, shortlisted: 2 },
    { day: 'Wed', applications: 5, shortlisted: 3 },
    { day: 'Thu', applications: 8, shortlisted: 5 },
    { day: 'Fri', applications: 11, shortlisted: 7 },
    { day: 'Sat', applications: 12, shortlisted: 8 },
    { day: 'Sun', applications: applications.length, shortlisted: shortlistedCount },
  ];

  const handleOpenApplicant = (app) => {
    const job = jobs.find(j => j.id === app.jobId);
    setSelectedJob(job || null);
    setSelectedApplicant(app);
  };

  const handleDeleteJob = (jobId) => {
    if (window.confirm('Delete this job posting and its associated applications?')) {
      deleteJob(jobId);
      loadData();
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* RECRUITER WELCOME & QUICK ACTIONS BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold">
            <span>{currentUser?.companyName || 'TechNova Solutions'} ATS Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Recruiter'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Monitor applicant talent pipelines, calculate algorithmic match scores, and automate candidate shortlisting decisions.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/recruiter/post-job"
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Job</span>
          </Link>
          <Link
            to="/recruiter/screening"
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition active:scale-95"
          >
            <Users className="w-4 h-4" />
            <span>Screen Candidates</span>
          </Link>
        </div>
      </div>

      {/* 4 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Job Postings"
          value={activeJobsCount}
          subtitle="Currently Open Roles"
          icon={Briefcase}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          trend="Recruitment active"
          trendType="up"
          onClick={() => navigate('/recruiter/dashboard#manage-jobs')}
        />
        <StatCard
          title="Total Applications"
          value={totalAppsCount}
          subtitle="Candidates in ATS Pipeline"
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          trend="Across all jobs"
          trendType="up"
          onClick={() => navigate('/recruiter/screening')}
        />
        <StatCard
          title="Shortlisted Candidates"
          value={shortlistedCount}
          subtitle="Qualified by Threshold"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          trend={`${Math.round((shortlistedCount / (totalAppsCount || 1)) * 100)}% qualification rate`}
          trendType="up"
          onClick={() => navigate('/recruiter/screening')}
        />
        <StatCard
          title="Pending Reviews"
          value={pendingCount}
          subtitle="Under Evaluation"
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          trend="Awaiting recruiter action"
          trendType="neutral"
          onClick={() => navigate('/recruiter/screening')}
        />
      </div>

      {/* RECHARTS DATA VISUALIZATION SECTION */}
      <div id="analytics" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Applications by Job */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Applications by Job Opening
              </h3>
              <p className="text-[11px] text-slate-400">
                Total candidates attracted per active posting
              </p>
            </div>
            <BarChart2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appsByJobData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name, props) => [`${val} Applicants`, props.payload.fullName]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="applications" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Match Score Distribution */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Match Score Distribution
              </h3>
              <p className="text-[11px] text-slate-400">
                Applicant competency brackets
              </p>
            </div>
            <PieIcon className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {scoreDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} Candidates`, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECOND ROW OF CHARTS: Application Trend & Status Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Weekly Applicant Intake & Shortlist Velocity
              </h3>
              <p className="text-[11px] text-slate-400">
                Simulated 7-day ATS ingestion curve
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorShort" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Area type="monotone" dataKey="applications" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" name="Total Applicants" />
                <Area type="monotone" dataKey="shortlisted" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorShort)" name="Shortlisted" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shortlisted vs Pending vs Rejected Pipeline Pie */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Application Decision Funnel
              </h3>
              <p className="text-[11px] text-slate-400">
                Proportion of decisions made
              </p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPipelineData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusPipelineData.map((entry, index) => (
                    <Cell key={`pipe-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT APPLICANTS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Job Applicants ({applications.length})
            </h3>
            <p className="text-xs text-slate-500">
              Review and screen candidates matching your job postings
            </p>
          </div>
          <Link
            to="/recruiter/screening"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            <span>Full Screening Matrix</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">Candidate Name</th>
                <th className="pb-3">Applied Job</th>
                <th className="pb-3 text-center">Match Score</th>
                <th className="pb-3">Skills Matched</th>
                <th className="pb-3">Applied Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.slice(0, 6).map(app => {
                const job = jobs.find(j => j.id === app.jobId) || {};
                return (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 pl-2">
                      <div className="font-bold text-slate-900 flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                          {app.candidateName.charAt(0)}
                        </span>
                        <span>{app.candidateName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 pl-8">{app.candidateEmail}</span>
                    </td>
                    <td className="py-3.5 font-medium text-slate-700">
                      {job.title || 'Job Opening'}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`inline-block font-extrabold px-2.5 py-0.5 rounded-full text-xs ${
                        app.matchScore >= 80 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : app.matchScore >= 50
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
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
                            +{app.matchedSkills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-500">
                      {formatDate(app.appliedDate)}
                    </td>
                    <td className="py-3.5">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <button
                        type="button"
                        onClick={() => handleOpenApplicant(app)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MANAGE POSTED JOBS TABLE */}
      <div id="manage-jobs" className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Manage Posted Jobs ({jobs.length})
            </h3>
            <p className="text-xs text-slate-500">
              Update vacancies, edit shortlisting thresholds, or close positions
            </p>
          </div>
          <Link
            to="/recruiter/post-job"
            className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Post Another Job</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">Job Title</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">Threshold</th>
                <th className="pb-3 text-center">Applicants</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map(job => {
                const appCount = applications.filter(a => a.jobId === job.id).length;
                return (
                  <tr key={job.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 pl-2 font-bold text-slate-900">
                      {job.title}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {(job.requiredSkills || []).slice(0, 3).join(', ')}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-600">{job.type}</td>
                    <td className="py-3.5 text-slate-600">{job.location}</td>
                    <td className="py-3.5">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {job.threshold || 80}%
                      </span>
                    </td>
                    <td className="py-3.5 text-center font-bold text-slate-800">
                      {appCount}
                    </td>
                    <td className="py-3.5">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="py-3.5 text-right pr-2 space-x-2">
                      <Link
                        to={`/recruiter/screening?jobId=${job.id}`}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                      >
                        <span>Screen ({appCount})</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                        title="Delete job"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate detail modal */}
      <CandidateDetailModal
        applicant={selectedApplicant}
        job={selectedJob}
        isOpen={Boolean(selectedApplicant)}
        onClose={() => setSelectedApplicant(null)}
        onStatusChange={loadData}
      />
    </div>
  );
}

