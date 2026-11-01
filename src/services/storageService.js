// Storage Service / Data Access Layer (DAL)
// Simulates relational database access using localStorage.
// All functions mirror prospective Flask REST API endpoints for Phase 2.

import {
  INITIAL_USERS,
  INITIAL_JOBS,
  INITIAL_SKILLS,
  INITIAL_APPLICATIONS
} from '../data/initialData';
import { calculateMatchScore } from './matchingService';

const STORAGE_KEYS = {
  USERS: 'mini_ats_users',
  JOBS: 'mini_ats_jobs',
  SKILLS: 'mini_ats_skills',
  APPLICATIONS: 'mini_ats_applications',
  ACTIVE_USER: 'mini_ats_active_user',
};

// Ensure database tables exist in localStorage
function initializeDatabase() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(INITIAL_JOBS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SKILLS)) {
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(INITIAL_SKILLS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
  }
}

// Auto-run on module load
initializeDatabase();

// --- USER OPERATIONS (Users & User_Skills tables) ---

export function getUsers() {
  initializeDatabase();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  } catch (err) {
    console.error('Error reading users from storage:', err);
    return [];
  }
}

export function getUserById(id) {
  const users = getUsers();
  return users.find(u => u.id === id) || null;
}

export function getUserByEmail(email) {
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim()) || null;
}

export function createUser(userData) {
  const users = getUsers();
  const existing = getUserByEmail(userData.email);
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: userData.name,
    email: userData.email.toLowerCase().trim(),
    password: userData.password, // In Phase 2: hashed password in MySQL
    role: userData.role || 'candidate',
    companyName: userData.companyName || '',
    phone: userData.phone || '',
    location: userData.location || '',
    education: userData.education || '',
    degree: userData.degree || '',
    graduationYear: userData.graduationYear || '',
    experienceYears: userData.experienceYears || 0,
    bio: userData.bio || '',
    skills: userData.skills || [],
    resumeFile: userData.resumeFile || null,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return newUser;
}

export function updateUser(id, updates) {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    throw new Error('User not found.');
  }

  users[index] = {
    ...users[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  // If this user is also logged in, update active session
  const activeUser = getActiveUser();
  if (activeUser && activeUser.id === id) {
    setActiveUser(users[index]);
  }

  // Also update candidate applications if candidate name or skills changed
  if (updates.skills || updates.name) {
    syncCandidateApplications(id, users[index]);
  }

  return users[index];
}

// Keep application records synchronized when a candidate updates their skills
function syncCandidateApplications(candidateId, updatedUser) {
  const apps = getApplications();
  const jobs = getJobs();
  let hasChanges = false;

  const updatedApps = apps.map(app => {
    if (app.candidateId === candidateId) {
      hasChanges = true;
      const job = jobs.find(j => j.id === app.jobId);
      if (job) {
        const matchResult = calculateMatchScore(updatedUser.skills || [], job.requiredSkills || []);
        return {
          ...app,
          candidateName: updatedUser.name || app.candidateName,
          matchScore: matchResult.score,
          matchedSkills: matchResult.matchedSkills,
          missingSkills: matchResult.missingSkills,
          // If candidate is not already manually changed, keep or update status
          status: matchResult.score >= (job.threshold || 80) ? 'Shortlisted' : app.status,
        };
      }
    }
    return app;
  });

  if (hasChanges) {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updatedApps));
  }
}

// --- ACTIVE SESSION OPERATIONS ---

export function getActiveUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function setActiveUser(user) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
  }
}

export function clearActiveUser() {
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
}

// --- SKILL OPERATIONS (Skills table) ---

export function getSkills() {
  initializeDatabase();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SKILLS)) || [];
  } catch (err) {
    return [];
  }
}

export function addCustomSkill(skillName, category = 'Custom') {
  if (!skillName || !skillName.trim()) return null;
  const skills = getSkills();
  const trimmed = skillName.trim();
  const exists = skills.find(s => s.name.toLowerCase() === trimmed.toLowerCase());
  if (exists) return exists;

  const newSkill = {
    id: `sk-${Date.now()}`,
    name: trimmed,
    category,
  };
  skills.push(newSkill);
  localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
  return newSkill;
}

// --- JOB OPERATIONS (Jobs & Job_Skills tables) ---

export function getJobs(filters = {}) {
  initializeDatabase();
  let jobs = [];
  try {
    jobs = JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBS)) || [];
  } catch (err) {
    return [];
  }

  if (filters.recruiterId) {
    jobs = jobs.filter(j => j.recruiterId === filters.recruiterId);
  }
  if (filters.status) {
    jobs = jobs.filter(j => j.status === filters.status);
  }
  if (filters.type && filters.type !== 'All') {
    jobs = jobs.filter(j => j.type.toLowerCase() === filters.type.toLowerCase());
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    jobs = jobs.filter(j =>
      j.title.toLowerCase().includes(q) ||
      j.companyName.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q) ||
      (j.requiredSkills || []).some(s => s.toLowerCase().includes(q))
    );
  }

  return jobs;
}

export function getJobById(id) {
  const jobs = getJobs();
  return jobs.find(j => j.id === id) || null;
}

export function createJob(jobData) {
  const jobs = getJobs();
  const initials = (jobData.companyName || 'CO')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const newJob = {
    id: `job-${Date.now()}`,
    recruiterId: jobData.recruiterId || 'usr-recruiter-1',
    companyName: jobData.companyName,
    companyInitials: initials,
    title: jobData.title,
    location: jobData.location,
    type: jobData.type || 'Full-Time',
    minExperience: jobData.minExperience || '0-2 years',
    description: jobData.description,
    requiredSkills: jobData.requiredSkills || [],
    threshold: Number(jobData.threshold) || 80,
    deadline: jobData.deadline || '',
    salary: jobData.salary || 'Best in Industry',
    status: jobData.status || 'Active', // 'Active', 'Draft', 'Closed'
    createdAt: new Date().toISOString(),
  };

  jobs.unshift(newJob);
  localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  return newJob;
}

export function updateJob(id, updates) {
  const jobs = getJobs();
  const index = jobs.findIndex(j => j.id === id);
  if (index === -1) {
    throw new Error('Job not found.');
  }

  jobs[index] = {
    ...jobs[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  return jobs[index];
}

export function deleteJob(id) {
  const jobs = getJobs();
  const filtered = jobs.filter(j => j.id !== id);
  localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(filtered));

  // Also remove applications for this job
  const apps = getApplications();
  const remainingApps = apps.filter(a => a.jobId !== id);
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(remainingApps));
}

// --- APPLICATION OPERATIONS (Applications table) ---

export function getApplications(filters = {}) {
  initializeDatabase();
  let apps = [];
  try {
    apps = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) || [];
  } catch (err) {
    return [];
  }

  if (filters.jobId) {
    apps = apps.filter(a => a.jobId === filters.jobId);
  }
  if (filters.candidateId) {
    apps = apps.filter(a => a.candidateId === filters.candidateId);
  }
  if (filters.status && filters.status !== 'All') {
    apps = apps.filter(a => a.status.toLowerCase() === filters.status.toLowerCase());
  }

  return apps;
}

export function getApplicationById(id) {
  const apps = getApplications();
  return apps.find(a => a.id === id) || null;
}

export function createApplication({ jobId, candidateId, notes = '' }) {
  const existing = getApplications().find(
    a => a.jobId === jobId && a.candidateId === candidateId
  );
  if (existing) {
    throw new Error('You have already submitted an application for this position.');
  }

  const job = getJobById(jobId);
  const candidate = getUserById(candidateId);
  if (!job || !candidate) {
    throw new Error('Invalid job or candidate reference.');
  }

  const matchResult = calculateMatchScore(candidate.skills || [], job.requiredSkills || []);
  const initialStatus = matchResult.score >= (job.threshold || 80) ? 'Shortlisted' : 'Pending';

  const newApp = {
    id: `app-${Date.now()}`,
    jobId: job.id,
    candidateId: candidate.id,
    candidateName: candidate.name,
    candidateEmail: candidate.email,
    appliedDate: new Date().toISOString(),
    status: initialStatus,
    matchScore: matchResult.score,
    matchedSkills: matchResult.matchedSkills,
    missingSkills: matchResult.missingSkills,
    notes: notes || '',
  };

  const apps = getApplications();
  apps.unshift(newApp);
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
  return newApp;
}

export function updateApplicationStatus(id, newStatus, notes) {
  const apps = getApplications();
  const index = apps.findIndex(a => a.id === id);
  if (index === -1) {
    throw new Error('Application not found.');
  }

  apps[index] = {
    ...apps[index],
    status: newStatus,
    notes: notes !== undefined ? notes : apps[index].notes,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
  return apps[index];
}

/**
 * Returns ranked applicants for a given job sorted in descending order by matchScore.
 */
export function getRankedCandidates(jobId) {
  const apps = getApplications({ jobId });
  const users = getUsers();

  // Combine application info with candidate profile details
  const ranked = apps.map(app => {
    const candidate = users.find(u => u.id === app.candidateId) || {};
    return {
      ...app,
      candidateProfile: candidate,
      education: candidate.education || 'N/A',
      experienceYears: candidate.experienceYears || 0,
      skills: candidate.skills || [],
      phone: candidate.phone || '',
      resumeFile: candidate.resumeFile || null,
    };
  });

  // Sort by match score descending, then by appliedDate descending
  ranked.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return new Date(b.appliedDate) - new Date(a.appliedDate);
  });

  // Assign ranking numbers 1, 2, 3...
  return ranked.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
}

// Reset localStorage back to pristine demo data
export function resetToInitialData() {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(INITIAL_JOBS));
  localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(INITIAL_SKILLS));
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
  return true;
}

