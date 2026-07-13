const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['applied', 'viewed', 'shortlisted', 'interview', 'rejected', 'accepted'],
    default: 'applied',
  },
  coverLetter: String,
  resume: {
    url: String,
    filename: String,
  },
  matchScore: { type: Number, default: 0 },
  missingSkills: [String],
  matchedSkills: [String],
  notes: String, // recruiter notes
  timeline: [{
    status: String,
    date: { type: Date, default: Date.now },
    note: String,
  }],
  interviewDate: Date,
  salary: Number,
}, { timestamps: true });

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
