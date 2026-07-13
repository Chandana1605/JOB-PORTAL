exports.calculateSkillMatch = (candidateSkills, jobSkills) => {
  if (!jobSkills || jobSkills.length === 0) return { score: 100, matched: [], missing: [] };
  if (!candidateSkills || candidateSkills.length === 0) return { score: 0, matched: [], missing: jobSkills };

  const normalize = (s) => s.toLowerCase().trim();
  const candNorm = candidateSkills.map(normalize);
  const jobNorm = jobSkills.map(normalize);

  const matched = jobSkills.filter((s, i) => candNorm.includes(jobNorm[i]));
  const missing = jobSkills.filter((s, i) => !candNorm.includes(jobNorm[i]));
  const score = Math.round((matched.length / jobSkills.length) * 100);

  return { score, matched, missing };
};

exports.recommendJobs = async (candidate, jobs) => {
  const { calculateSkillMatch } = exports;
  return jobs
    .map(job => ({
      ...job.toObject(),
      matchScore: calculateSkillMatch(candidate.skills, job.skills).score,
    }))
    .filter(j => j.matchScore >= 30)
    .sort((a, b) => b.matchScore - a.matchScore);
};
