import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  createJob,
  getJobById,
  updateJob,
  getSkills,
  addCustomSkill
} from '../services/storageService';
import SkillChip from '../components/common/SkillChip';
import JobPreviewModal from '../components/recruiter/JobPreviewModal';
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Search,
  Plus,
  Eye,
  Save,
  CheckCircle,
  X,
  Sparkles
} from 'lucide-react';

export default function PostJobPage() {
  const [searchParams] = useSearchParams();
  const editJobId = searchParams.get('jobId');
  const { currentUser } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    companyName: currentUser?.companyName || 'TechNova Solutions',
    description: '',
    location: 'Pune, India (Hybrid)',
    type: 'Full-Time',
    minExperience: '1-3 years',
    threshold: 80, // Default 80%
    deadline: '',
    salary: '₹6,00,000 - ₹9,50,000 P.A.',
  });

  const [requiredSkills, setRequiredSkills] = useState(['Python', 'SQL', 'Git']);
  const [allMasterSkills, setAllMasterSkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setAllMasterSkills(getSkills());

    if (editJobId) {
      const existing = getJobById(editJobId);
      if (existing) {
        setFormData({
          title: existing.title || '',
          companyName: existing.companyName || currentUser?.companyName || '',
          description: existing.description || '',
          location: existing.location || '',
          type: existing.type || 'Full-Time',
          minExperience: existing.minExperience || '1-3 years',
          threshold: existing.threshold ?? 80,
          deadline: existing.deadline || '',
          salary: existing.salary || '',
        });
        setRequiredSkills(existing.requiredSkills || []);
      }
    }
  }, [editJobId, currentUser]);

  const toggleSkill = (skillName) => {
    if (requiredSkills.some(s => s.toLowerCase() === skillName.toLowerCase())) {
      setRequiredSkills(prev => prev.filter(s => s.toLowerCase() !== skillName.toLowerCase()));
    } else {
      setRequiredSkills(prev => [...prev, skillName]);
    }
  };

  const removeSkill = (skillName) => {
    setRequiredSkills(prev => prev.filter(s => s !== skillName));
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (!customSkillInput.trim()) return;
    const trimmed = customSkillInput.trim();
    addCustomSkill(trimmed, 'Custom');
    setAllMasterSkills(getSkills());

    if (!requiredSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setRequiredSkills(prev => [...prev, trimmed]);
      info(`Added "${trimmed}" to job required skills.`);
    }
    setCustomSkillInput('');
  };

  const handleSave = (status = 'Active') => {
    if (!formData.title.trim()) {
      error('Job Title is required.');
      return;
    }
    if (!formData.companyName.trim()) {
      error('Company Name is required.');
      return;
    }
    if (!formData.description.trim()) {
      error('Job Description is required.');
      return;
    }
    if (requiredSkills.length === 0) {
      error('Please select at least 1 required technical skill for applicant screening.');
      return;
    }

    try {
      const jobPayload = {
        ...formData,
        recruiterId: currentUser?.id || 'usr-recruiter-1',
        requiredSkills,
        threshold: Number(formData.threshold),
        status,
      };

      if (editJobId) {
        updateJob(editJobId, jobPayload);
        success(`Job opening "${formData.title}" updated successfully!`);
      } else {
        createJob(jobPayload);
        success(
          status === 'Active'
            ? `Job opening "${formData.title}" published successfully!`
            : `Job draft saved successfully.`
        );
      }

      navigate('/recruiter/dashboard');
    } catch (err) {
      error(err.message || 'Failed to save job opening.');
    }
  };

  const filteredMasterSkills = allMasterSkills.filter(s =>
    s.name.toLowerCase().includes(skillSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="border-b border-slate-200/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recruiter Position Creator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {editJobId ? 'Edit Job Opening' : 'Post a New Job Opening'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Define requirements and qualification criteria. The matching engine evaluates applicants against this specification.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition self-start sm:self-auto"
        >
          <Eye className="w-4 h-4 text-slate-400" />
          <span>Preview Job</span>
        </button>
      </div>

      {/* FORM BODY */}
      <div className="space-y-6">
        {/* BASIC INFORMATION */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>Position Specifications</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Job Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Python Developer"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. TechNova Solutions"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Pune, India (Hybrid)"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            {/* Minimum Experience */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Minimum Experience *
              </label>
              <input
                type="text"
                value={formData.minExperience}
                onChange={(e) => setFormData({ ...formData, minExperience: e.target.value })}
                placeholder="e.g. 1-3 years"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Salary / Compensation Range
              </label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="e.g. ₹6,00,000 - ₹9,50,000 P.A."
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Application Deadline */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Application Deadline
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Description *
            </label>
            <textarea
              rows="4"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline role responsibilities, team structure, backend technologies, and qualification expectations..."
              className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* MATCHING THRESHOLD SLIDER */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Automated Shortlisting Threshold: {formData.threshold}%
                </h3>
                <p className="text-xs text-slate-400">
                  Candidates meeting or exceeding this skill match threshold are eligible for automatic shortlisting.
                </p>
              </div>
            </div>
            <span className="text-2xl font-black text-blue-600 bg-blue-50 px-3.5 py-1 rounded-xl">
              {formData.threshold}%
            </span>
          </div>

          {/* Interactive Range Slider */}
          <div className="space-y-2 pt-2">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.threshold}
              onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>0% (All Pass)</span>
              <span>50% (Moderate)</span>
              <span className="text-blue-600 font-bold">80% (Default ATS)</span>
              <span>100% (Strict Match)</span>
            </div>
          </div>
        </div>

        {/* REQUIRED TECHNICAL SKILLS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Required Technical Skills ({requiredSkills.length} Selected)
            </h3>
            <span className="text-xs text-slate-400">Used by match algorithm</span>
          </div>

          {/* Active Required Skills */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Current Job Requirements
            </label>
            <div className="min-h-[48px] p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-wrap gap-2">
              {requiredSkills.length > 0 ? (
                requiredSkills.map(skill => (
                  <SkillChip
                    key={skill}
                    name={skill}
                    variant="selected"
                    onRemove={removeSkill}
                  />
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No skills selected yet.</span>
              )}
            </div>
          </div>

          {/* Search Master Skills & Add Custom */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
            <div className="sm:col-span-7 relative">
              <input
                type="text"
                placeholder="Filter skill dictionary..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="sm:col-span-5 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Custom requirement..."
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSkill(e);
                  }
                }}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-1 flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Clickable Master Skills */}
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-100">
            {filteredMasterSkills.map(skill => {
              const isSelected = requiredSkills.some(s => s.toLowerCase() === skill.name.toLowerCase());
              return (
                <SkillChip
                  key={skill.id}
                  name={skill.name}
                  variant={isSelected ? 'selected' : 'outline'}
                  size="sm"
                  onClick={() => toggleSkill(skill.name)}
                />
              );
            })}
          </div>
        </div>

        {/* ACTIONS BAR */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/recruiter/dashboard')}
            className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => handleSave('Draft')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave('Active')}
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/25 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{editJobId ? 'Update & Publish' : 'Publish Job Opening'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <JobPreviewModal
        job={{
          ...formData,
          requiredSkills,
        }}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}

