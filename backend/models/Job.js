const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  requirements: [String],
  responsibilities: [String],
  skills: [{ type: String, required: true }],
  location: { type: String, required: true },
  type: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'], required: true },
  experience: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 10 },
  },
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' },
    disclosed: { type: Boolean, default: true },
  },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: {
    name: String,
    logo: String,
    website: String,
    size: String,
    industry: String,
  },
  category: String,
  tags: [String],
  status: { type: String, enum: ['active', 'paused', 'closed'], default: 'active' },
  featured: { type: Boolean, default: false },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
  views: { type: Number, default: 0 },
  deadline: Date,
}, { timestamps: true });

jobSchema.index({ title: 'text', description: 'text', skills: 'text', location: 'text' });

module.exports = mongoose.model('Job', jobSchema);
