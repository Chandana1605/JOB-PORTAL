const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { calculateSkillMatch } = require('../utils/skillMatch');
const { createNotification, sendSocketNotification } = require('../utils/notifications');

exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.status !== 'active') return res.status(400).json({ success: false, message: 'Job is no longer active' });

    const exists = await Application.findOne({ job: jobId, candidate: req.user.id });
    if (exists) return res.status(400).json({ success: false, message: 'Already applied' });

    const candidate = await User.findById(req.user.id);
    const { score, matched, missing } = calculateSkillMatch(candidate.skills, job.skills);

    const application = await Application.create({
      job: jobId,
      candidate: req.user.id,
      recruiter: job.recruiter,
      coverLetter,
      resume: candidate.resume,
      matchScore: score,
      matchedSkills: matched,
      missingSkills: missing,
      timeline: [{ status: 'applied', date: new Date(), note: 'Application submitted' }],
    });

    job.applicants.push(application._id);
    await job.save({ validateBeforeSave: false });

    // Notify recruiter
    const notif = await createNotification({
      recipient: job.recruiter,
      sender: req.user.id,
      type: 'application_received',
      title: 'New Application',
      message: `${candidate.name} applied for ${job.title}`,
      link: `/recruiter/applications/${application._id}`,
    });

    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    sendSocketNotification(io, connectedUsers, job.recruiter, notif);

    res.status(201).json({ success: true, application });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Already applied' });
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCandidateApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate('job', 'title company location type salary status skills')
      .populate('recruiter', 'name company')
      .sort({ createdAt: -1 });
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRecruiterApplications = async (req, res) => {
  try {
    const { jobId, status } = req.query;
    const query = { recruiter: req.user.id };
    if (jobId) query.job = jobId;
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('candidate', 'name email avatar skills experience education location phone')
      .populate('job', 'title skills')
      .sort({ createdAt: -1 });
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, note, interviewDate } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('job', 'title')
      .populate('candidate', 'name');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.status = status;
    if (interviewDate) application.interviewDate = interviewDate;
    application.timeline.push({ status, date: new Date(), note });
    await application.save();

    const statusMessages = {
      shortlisted: `Congratulations! You've been shortlisted for ${application.job.title}`,
      interview: `You have an interview scheduled for ${application.job.title}`,
      rejected: `Your application for ${application.job.title} was not successful`,
      accepted: `Congratulations! Your application for ${application.job.title} has been accepted!`,
      viewed: `Your application for ${application.job.title} has been viewed`,
    };

    if (statusMessages[status]) {
      const notif = await createNotification({
        recipient: application.candidate._id,
        sender: req.user.id,
        type: 'application_status',
        title: 'Application Update',
        message: statusMessages[status],
        link: `/candidate/applications`,
        data: { applicationId: application._id, status },
      });
      const io = req.app.get('io');
      const connectedUsers = req.app.get('connectedUsers');
      sendSocketNotification(io, connectedUsers, application.candidate._id, notif);
    }

    res.json({ success: true, application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('candidate', 'name email avatar skills experience education phone location resume')
      .populate('job', 'title skills description company')
      .populate('recruiter', 'name company');
    if (!application) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Not found' });
    if (application.candidate.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await application.deleteOne();
    res.json({ success: true, message: 'Application withdrawn' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
