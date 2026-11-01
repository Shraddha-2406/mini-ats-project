// Core Skill Matching Algorithm & Analysis Service
// Designed for pure JavaScript execution now, easily migratable to SQL / Flask in Phase 2.

import { normalizeSkill } from '../utils/helpers';

/**
 * Calculates match score, matched skills, and missing skills between candidate skills and job requirements.
 * Formula: Match Score = (Number of Matched Required Skills / Total Required Skills) * 100
 * 
 * @param {Array<string>} candidateSkills 
 * @param {Array<string>} jobRequiredSkills 
 * @returns {Object} { score, matchedSkills, missingSkills, totalRequired, matchedCount }
 */
export function calculateMatchScore(candidateSkills = [], jobRequiredSkills = []) {
  if (!Array.isArray(jobRequiredSkills) || jobRequiredSkills.length === 0) {
    return {
      score: 100, // Safe default when no skills are strictly required
      matchedSkills: [],
      missingSkills: [],
      totalRequired: 0,
      matchedCount: 0,
    };
  }

  const normalizedCandidateSkills = (candidateSkills || []).map(normalizeSkill);
  
  const matchedSkills = [];
  const missingSkills = [];

  jobRequiredSkills.forEach(reqSkill => {
    const normReq = normalizeSkill(reqSkill);
    // Check if normalized candidate skills contain the required skill
    const isMatch = normalizedCandidateSkills.some(candSkill => {
      if (candSkill === normReq) return true;
      // Handle simple variations e.g. "react" & "react.js", "rest api" & "restful api"
      if (candSkill.includes(normReq) || normReq.includes(candSkill)) return true;
      return false;
    });

    if (isMatch) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const totalRequired = jobRequiredSkills.length;
  const matchedCount = matchedSkills.length;
  const rawScore = (matchedCount / totalRequired) * 100;
  const score = Math.round(rawScore);

  return {
    score,
    matchedSkills,
    missingSkills,
    totalRequired,
    matchedCount,
  };
}

/**
 * Identify missing skills that candidate should learn to qualify for the job.
 */
export function getMissingSkills(candidateSkills = [], jobRequiredSkills = []) {
  const result = calculateMatchScore(candidateSkills, jobRequiredSkills);
  return result.missingSkills;
}

/**
 * Check if a candidate meets the job's automated shortlisting threshold
 */
export function isEligibleForShortlist(matchScore, threshold = 80) {
  return matchScore >= threshold;
}

/**
 * Generates rule-based suggestions to help candidate bridge skill gaps.
 * Note: Clearly labeled as rule-based recommendations, NOT fake AI.
 */
export function generateSkillRecommendations(matchResult, jobTitle = 'this role') {
  const { matchedCount, totalRequired, missingSkills } = matchResult;

  if (totalRequired === 0) {
    return "This job has no specific technical skill requirements listed. Ensure your profile and resume are complete.";
  }

  if (missingSkills.length === 0) {
    return `Impressive! You match all ${totalRequired} required skills for ${jobTitle}. You have a very competitive profile for this position.`;
  }

  const missingListStr = missingSkills.slice(0, 3).join(', ');
  const extraCount = missingSkills.length > 3 ? ` and ${missingSkills.length - 3} more` : '';

  return `You match ${matchedCount} out of ${totalRequired} required skills. Learning ${missingListStr}${extraCount} could significantly improve your match score and shortlisting chances for ${jobTitle}.`;
}

