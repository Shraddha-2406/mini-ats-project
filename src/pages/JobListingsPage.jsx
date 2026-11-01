import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJobs, getApplications } from '../services/storageService';
import { calculateMatchScore } from '../services/matchingService';
import MatchScoreRing from '../components/common/MatchScoreRing';
import SkillChip from '../components/common/SkillChip';
import JobApplicationModal from '../components/candidate/JobApplicationModal';
import JobPreviewModal from '../components/recruiter/JobPreviewModal';
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Filter,
  CheckCircle,
  Eye,
  SlidersHorizontal,
  X,
  Sparkles
} from 'lucide-react';

export default function JobListingsPage() {
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState('All');
  const [experienceFilter, setExperienceFilter] = useState('All');
  const [sortOption, setSortOption] = useState('match'); // 'match' | 'recent' | 'title'

  // Modal states
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [selectedJobForView, setSelectedJobForView] = useState(null);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  useEffect(() => {
    if (searchParams.get('search')) {
      setSearchTerm(searchParams.get('search'));
    }
  }, [searchParams]);

  const loadData = () => {
    const allJobs = getJobs({ status: 'Active' });
    setJobs(allJobs);
    if (currentUser) {
      const myApps = getApplications({ candidateId: currentUser.id });
      setApplications(myApps);
    }
  };

  const candidateSkills = currentUser?.skills || [];

  // Filter & match calculation
  const filteredJobs = jobs
    .map(job => {
      const match = calculateMatchScore(candidateSkills, job.requiredSkills || []);
      const hasApplied = applications.some(a => a.jobId === job.id);
      return {
        ...job,
        matchScore: match.score,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills,
        hasApplied,
      };
    })
    .filter(job => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesCompany = job.companyName.toLowerCase().includes(q);
        const matchesLocation = job.location.toLowerCase().includes(q);
        const matchesSkill = (job.requiredSkills || []).some(s => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCompany && !matchesLocation && !matchesSkill) {
          return false;
        }
      }

      // Type filter
      if (typeFilter !== 'All' && job.type.toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }

      // Experience filter
      if (experienceFilter !== 'All') {
        if (experienceFilter === 'Internship' && job.type !== 'Internship') return false;
        if (experienceFilter === 'Entry' && !job.minExperience.includes('0') && !job.minExperience.includes('1')) return false;
        if (experienceFilter === 'Mid' && !job.minExperience.includes('2') && !job.minExperience.includes('3')) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOption === 'match') return b.matchScore - a.matchScore;
      if (sortOption === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="space-y-8 pb-16">
      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Opportunities Matched with Your Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse live vacancies, review skill alignment, and apply with instant qualification feedback.
          </p>
        </div>

        <div className="text-right self-start md:self-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Available Positions
          </span>
          <span className="text-2xl font-black text-blue-600">
            {filteredJobs.length}{' '}
            <span className="text-xs font-normal text-slate-500">of {jobs.length} total</span>
          </span>
        </div>
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Main search box */}
          <div className="md:col-span-6 relative">
            <input
              type="text"
              placeholder="Search by job title, company, or skills (e.g. Python, SQL)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs sm:text-sm pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Job Type Filter */}
          <div className="md:col-span-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full text-xs sm:text-sm py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="All">All Job Types</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Internship">Internship</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {/* Experience Filter */}
          <div className="md:col-span-2">
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="w-full text-xs sm:text-sm py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="All">All Experience</option>
              <option value="Internship">Internship (0 yrs)</option>
              <option value="Entry">Entry (0-2 yrs)</option>
              <option value="Mid">Mid (2-4+ yrs)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full text-xs sm:text-sm py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-blue-700"
            >
              <option value="match">Sort: Match Score (High to Low)</option>
              <option value="recent">Sort: Most Recent</option>
              <option value="title">Sort: Job Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* JOB LISTINGS CARDS GRID */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map(job => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-5"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                    {job.companyInitials || 'TN'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition">
                      {job.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {job.companyName}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {job.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        {job.type}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {job.minExperience}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Match Ring */}
                <div className="flex-shrink-0 text-center">
                  <MatchScoreRing score={job.matchScore} size="md" />
                </div>
              </div>

              {/* Description Preview */}
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {job.description}
              </p>

              {/* Required Skills Chips */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Required Competencies ({job.requiredSkills?.length || 0})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(job.requiredSkills || []).map(skill => {
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

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link
                  to={`/candidate/match-results?jobId=${job.id}`}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                >
                  Skill Gap Breakdown →
                </Link>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedJobForView(job)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    View Details
                  </button>

                  {job.hasApplied ? (
                    <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Applied</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedJobForApply(job)}
                      className="inline-flex items-center space-x-1 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
                    >
                      <span>Apply Now</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No matching job openings found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or resetting filter categories.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('All');
              setExperienceFilter('All');
            }}
            className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Application Modal */}
      <JobApplicationModal
        job={selectedJobForApply}
        isOpen={Boolean(selectedJobForApply)}
        onClose={() => setSelectedJobForApply(null)}
        onApplicationSuccess={loadData}
      />

      {/* Job Details Modal */}
      <JobPreviewModal
        job={selectedJobForView}
        isOpen={Boolean(selectedJobForView)}
        onClose={() => setSelectedJobForView(null)}
      />
    </div>
  );
}

