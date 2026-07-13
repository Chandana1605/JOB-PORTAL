const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const educationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  field: String,
  from: Date,
  to: Date,
  current: { type: Boolean, default: false },
  description: String,
});

const experienceSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  from: Date,
  to: Date,
  current: { type: Boolean, default: false },
  description: String,
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['candidate', 'recruiter', 'admin'], default: 'candidate' },
  avatar: { type: String, default: '' },
  phone: String,
  location: String,
  bio: String,
  website: String,
  linkedin: String,
  github: String,

  // Candidate fields
  skills: [{ type: String }],
  resume: {
    url: String,
    filename: String,
    data: String, // base64 for built resumes
  },
  experience: [experienceSchema],
  education: [educationSchema],
  expectedSalary: Number,
  jobType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'] },
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  profileCompletion: { type: Number, default: 0 },

  // Recruiter fields
  company: {
    name: String,
    description: String,
    website: String,
    size: String,
    industry: String,
    logo: String,
    location: String,
    founded: Number,
  },

  isActive: { type: Boolean, default: true },
  lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.calculateProfileCompletion = function () {
  let score = 0;
  if (this.name) score += 10;
  if (this.email) score += 10;
  if (this.phone) score += 5;
  if (this.location) score += 5;
  if (this.bio) score += 10;
  if (this.avatar) score += 5;
  if (this.role === 'candidate') {
    if (this.skills.length > 0) score += 15;
    if (this.experience.length > 0) score += 15;
    if (this.education.length > 0) score += 15;
    if (this.resume?.url || this.resume?.data) score += 10;
  } else if (this.role === 'recruiter') {
    if (this.company?.name) score += 15;
    if (this.company?.description) score += 15;
    if (this.company?.logo) score += 10;
    if (this.company?.website) score += 10;
  }
  return Math.min(score, 100);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
