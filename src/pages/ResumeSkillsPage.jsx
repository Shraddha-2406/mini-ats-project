import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getSkills, addCustomSkill } from '../services/storageService';
import { calculateProfileCompletion } from '../utils/helpers';
import ResumeUploadBox from '../components/candidate/ResumeUploadBox';
import SkillChip from '../components/common/SkillChip';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  Briefcase,
  Search,
  Plus,
  Save,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function ResumeSkillsPage() {
  const { currentUser, updateProfile } = useAuth();
  const { success, error, info } = useToast();

  // Personal Information state
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    phone: '',
    location: '',
    education: '',
    degree: '',
    graduationYear: '',
    experienceYears: 0,
    bio: '',
  });

  // Skills state
  const [candidateSkills, setCandidateSkills] = useState([]);
  const [allMasterSkills, setAllMasterSkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setPersonalInfo({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        location: currentUser.location || '',
        education: currentUser.education || '',
        degree: currentUser.degree || '',
        graduationYear: currentUser.graduationYear || '',
        experienceYears: currentUser.experienceYears ?? 0,
        bio: currentUser.bio || '',
      });
      setCandidateSkills(currentUser.skills || []);
      setResumeFile(currentUser.resumeFile || null);
    }
    setAllMasterSkills(getSkills());
  }, [currentUser]);

  // Handle adding skill from master list
  const toggleSkill = (skillName) => {
    const exists = candidateSkills.some(s => s.toLowerCase() === skillName.toLowerCase());
    if (exists) {
      setCandidateSkills(prev => prev.filter(s => s.toLowerCase() !== skillName.toLowerCase()));
    } else {
      setCandidateSkills(prev => [...prev, skillName]);
    }
  };

  const removeSkill = (skillName) => {
    setCandidateSkills(prev => prev.filter(s => s !== skillName));
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (!customSkillInput.trim()) return;

    const trimmed = customSkillInput.trim();
    // Add to master skills if not present
    const added = addCustomSkill(trimmed, 'Custom');
    if (added) {
      setAllMasterSkills(getSkills());
    }

    if (!candidateSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setCandidateSkills(prev => [...prev, trimmed]);
      info(`Added "${trimmed}" to your technical skills.`);
    } else {
      error(`"${trimmed}" is already in your skills.`);
    }
    setCustomSkillInput('');
  };

  const handleSaveAll = (e) => {
    e.preventDefault();
    if (!personalInfo.name.trim()) {
      error('Full Name is required.');
      return;
    }

    try {
      updateProfile({
        ...personalInfo,
        experienceYears: Number(personalInfo.experienceYears) || 0,
        skills: candidateSkills,
        resumeFile: resumeFile,
      });
      success('Candidate profile, resume, and technical skills saved successfully!');
    } catch (err) {
      error(err.message || 'Failed to save changes.');
    }
  };

  // Profile completion meter with current form data
  const dynamicUser = {
    ...currentUser,
    ...personalInfo,
    skills: candidateSkills,
    resumeFile: resumeFile,
  };
  const completionPercentage = calculateProfileCompletion(dynamicUser);

  // Filter master skills based on search input
  const filteredMasterSkills = allMasterSkills.filter(skill =>
    skill.name.toLowerCase().includes(skillSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      {/* PAGE HEADER & COMPLETION BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Resume & Technical Skills
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain your academic credentials, verified skills, and resume PDF metadata.
          </p>
        </div>

        {/* Dynamic Profile Completion Pill */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3 px-4 shadow-subtle flex items-center space-x-3 self-start md:self-auto">
          <div className="relative">
            <svg width={48} height={48} className="transform -rotate-90">
              <circle
                cx={24}
                cy={24}
                r={18}
                stroke="#E2E8F0"
                strokeWidth={4}
                fill="transparent"
              />
              <circle
                cx={24}
                cy={24}
                r={18}
                stroke="#10B981"
                strokeWidth={4}
                strokeDasharray={2 * Math.PI * 18}
                strokeDashoffset={(2 * Math.PI * 18) * (1 - completionPercentage / 100)}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-900">
              {completionPercentage}%
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Profile Readiness</p>
            <p className="text-[11px] text-slate-400">
              {completionPercentage >= 80 ? 'Optimal for ATS screening' : 'Fill missing items'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-8">
        {/* SECTION A: PERSONAL & ACADEMIC INFORMATION */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Section A: Personal & Academic Information
                </h3>
                <p className="text-xs text-slate-400">
                  Key profile metadata stored in the Users relational table
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={personalInfo.name}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Email (Read only) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || ''}
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={personalInfo.location}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                  placeholder="Pune, Maharashtra"
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Degree */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Degree / Qualification
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={personalInfo.degree}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, degree: e.target.value })}
                  placeholder="B.E. / B.Tech"
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Education / Major */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Education Field / Branch
              </label>
              <input
                type="text"
                value={personalInfo.education}
                onChange={(e) => setPersonalInfo({ ...personalInfo, education: e.target.value })}
                placeholder="Computer Science Engineering"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Graduation Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Graduation Year
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={personalInfo.graduationYear}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, graduationYear: e.target.value })}
                  placeholder="2025"
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Years of Experience
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={personalInfo.experienceYears}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, experienceYears: e.target.value })}
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION B: RESUME UPLOAD */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Section B: Resume Document Upload
              </h3>
              <p className="text-xs text-slate-400">
                Attach your verified resume PDF to include with your job applications
              </p>
            </div>
          </div>

          <ResumeUploadBox
            resumeFile={resumeFile}
            onResumeChange={(fileMeta) => setResumeFile(fileMeta)}
          />
        </div>

        {/* SECTION C: TECHNICAL SKILLS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Section C: Technical Skills Selection ({candidateSkills.length} Selected)
                </h3>
                <p className="text-xs text-slate-400">
                  Select your verified competencies. These directly determine your job match score.
                </p>
              </div>
            </div>
          </div>

          {/* Currently Selected Skills */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Your Active Skills (Click '✕' to remove)
            </label>
            <div className="min-h-[48px] p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap gap-2">
              {candidateSkills.length > 0 ? (
                candidateSkills.map(skill => (
                  <SkillChip
                    key={skill}
                    name={skill}
                    variant="selected"
                    onRemove={removeSkill}
                  />
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">
                  No skills selected yet. Choose from the master dictionary below or add custom skills.
                </span>
              )}
            </div>
          </div>

          {/* Search Master Skills & Add Custom */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
            <div className="md:col-span-7 relative">
              <input
                type="text"
                placeholder="Search master skills (e.g. Python, SQL, React)..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="md:col-span-5 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Add custom skill..."
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSkill(e);
                  }
                }}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Master Skill Chips Selection Grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Available Skills in System Dictionary (Click to Toggle)
            </label>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 rounded-xl border border-slate-100 bg-slate-50/50">
              {filteredMasterSkills.map(skill => {
                const isSelected = candidateSkills.some(s => s.toLowerCase() === skill.name.toLowerCase());
                return (
                  <SkillChip
                    key={skill.id}
                    name={skill.name}
                    variant={isSelected ? 'selected' : 'outline'}
                    onClick={() => toggleSkill(skill.name)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM FLOATING SAVE ACTION */}
        <div className="sticky bottom-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-4 shadow-elevated flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Changes persist to browser LocalStorage automatically</span>
          </div>

          <button
            type="submit"
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm shadow-blue-500/25 transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save All Profile Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}

