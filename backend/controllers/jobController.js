const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const { calculateSkillMatch, recommendJobs } = require('../utils/skillMatch');
const { createNotification, sendSocketNotification } = require('../utils/notifications');

exports.createJob = async (req, res) => {
  try {
    const recruiter = await User.findById(req.user.id);
    const job = await Job.create({
      ...req.body,
      recruiter: req.user.id,
      company: {
        name: recruiter.company?.name || req.body.company?.name,
        logo: recruiter.company?.logo,
        website: recruiter.company?.website,
        size: recruiter.company?.size,
        industry: recruiter.company?.industry,
      },
    });
    res.status(201).json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const { search, location, type, minSalary, maxSalary, minExp, maxExp, skills, category, page = 1, limit = 10 } = req.query;
    const query = { status: 'active' };

    if (search) query.$text = { $search: search };
    if (location) query.location = { $regex: location, $options: 'i' };
    if (type) query.type = type;
    if (category) query.category = category;
    if (minSalary) query['salary.min'] = { $gte: Number(minSalary) };
    if (maxSalary) query['salary.max'] = { $lte: Number(maxSalary) };
    if (minExp !== undefined) query['experience.min'] = { $gte: Number(minExp) };
    if (maxExp !== undefined) query['experience.max'] = { $lte: Number(maxExp) };
    if (skills) {
      const skillArr = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillArr.map(s => new RegExp(s, 'i')) };
    }

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('recruiter', 'name company avatar')
      .sort({ featured: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Add match score if candidate
    let enriched = jobs;
    if (req.user?.role === 'candidate') {
      const candidate = await User.findById(req.user.id);
      enriched = jobs.map(job => {
        const { score, matched, missing } = calculateSkillMatch(candidate.skills, job.skills);
        return { ...job.toObject(), matchScore: score, matchedSkills: matched, missingSkills: missing };
      });
    }

    res.json({ success: true, jobs: enriched, total, pages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiter', 'name company avatar email');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    job.views += 1;
    await job.save({ validateBeforeSave: false });

    let matchData = {};
    if (req.user?.role === 'candidate') {
      const candidate = await User.findById(req.user.id);
      matchData = calculateSkillMatch(candidate.skills, job.skills);
    }

    const applied = req.user ? await Application.findOne({ job: job._id, candidate: req.user.id }) : null;

    res.json({ success: true, job, ...matchData, applied: !!applied, applicationId: applied?._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await job.deleteOne();
    await Application.deleteMany({ job: req.params.id });
    res.json({ success: true, message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRecommendedJobs = async (req, res) => {
  try {
    const candidate = await User.findById(req.user.id);
    const jobs = await Job.find({ status: 'active' }).populate('recruiter', 'name company avatar');
    const recommended = await recommendJobs(candidate, jobs);
    res.json({ success: true, jobs: recommended.slice(0, 10) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id }).sort({ createdAt: -1 });
    const jobsWithStats = await Promise.all(jobs.map(async (job) => {
      const appCount = await Application.countDocuments({ job: job._id });
      return { ...job.toObject(), applicationCount: appCount };
    }));
    res.json({ success: true, jobs: jobsWithStats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.saveJob = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const jobId = req.params.id;
    const idx = user.savedJobs.indexOf(jobId);
    if (idx === -1) user.savedJobs.push(jobId);
    else user.savedJobs.splice(idx, 1);
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, saved: idx === -1, savedJobs: user.savedJobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
