/**
 * Seed script - creates demo users, jobs, applications
 * Run: node seed.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Notification = require('./models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jobportal';

const SKILLS_POOL = [
  'React', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'Java', 'AWS',
  'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'GraphQL', 'REST API',
  'Machine Learning', 'Data Science', 'UI/UX Design', 'Figma', 'Vue.js',
  'Angular', 'Express.js', 'Redux', 'CI/CD', 'Git', 'Agile', 'Scrum',
];

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'remote', 'internship'];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // ── Create Admin ─────────────────────────────────────────
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'demo123',
    role: 'admin',
    phone: '+1-555-0001',
    location: 'San Francisco, CA',
    bio: 'Platform administrator.',
    isActive: true,
  });

  // ── Create Recruiters ────────────────────────────────────
  const recruiterData = [
    {
      name: 'Sarah Chen',
      email: 'recruiter@demo.com',
      password: 'demo123',
      role: 'recruiter',
      phone: '+1-555-0100',
      location: 'New York, NY',
      bio: 'Senior Technical Recruiter at TechCorp.',
      company: {
        name: 'TechCorp Inc.',
        description: 'A leading technology company building next-generation software solutions for enterprise clients worldwide.',
        website: 'https://techcorp.example.com',
        size: '1000+',
        industry: 'Technology',
        location: 'New York, NY',
      },
    },
    {
      name: 'James Miller',
      email: 'recruiter2@demo.com',
      password: 'demo123',
      role: 'recruiter',
      phone: '+1-555-0200',
      location: 'Austin, TX',
      bio: 'Head of Talent at StartupXYZ.',
      company: {
        name: 'StartupXYZ',
        description: 'Fast-growing startup disrupting the fintech space with AI-driven financial products.',
        website: 'https://startupxyz.example.com',
        size: '51-200',
        industry: 'Fintech',
        location: 'Austin, TX',
      },
    },
    {
      name: 'Priya Sharma',
      email: 'recruiter3@demo.com',
      password: 'demo123',
      role: 'recruiter',
      phone: '+1-555-0300',
      location: 'Bangalore, India',
      bio: 'Tech Recruiter at GlobalSoft.',
      company: {
        name: 'GlobalSoft Solutions',
        description: 'Global IT services and consulting company delivering digital transformation for Fortune 500 clients.',
        website: 'https://globalsoft.example.com',
        size: '1000+',
        industry: 'IT Services',
        location: 'Bangalore, India',
      },
    },
  ];
  const recruiters = await User.create(recruiterData);

  // ── Create Candidates ────────────────────────────────────
  const candidateData = [
    {
      name: 'Alex Johnson',
      email: 'candidate@demo.com',
      password: 'demo123',
      role: 'candidate',
      phone: '+1-555-1001',
      location: 'Seattle, WA',
      bio: 'Full-stack developer with 4 years of experience building scalable web applications. Passionate about clean code and great UX.',
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'Docker', 'GraphQL'],
      expectedSalary: 120000,
      jobType: 'full-time',
      experience: [
        {
          title: 'Senior Frontend Developer',
          company: 'WebAgency Co.',
          location: 'Seattle, WA',
          from: new Date('2021-06-01'),
          to: new Date('2024-01-01'),
          current: false,
          description: 'Led frontend development for 10+ client projects using React and TypeScript. Improved page load speed by 40%.',
        },
        {
          title: 'Junior Developer',
          company: 'CodeShop LLC',
          location: 'Remote',
          from: new Date('2020-01-01'),
          to: new Date('2021-05-30'),
          current: false,
          description: 'Developed RESTful APIs using Node.js and Express.',
        },
      ],
      education: [
        {
          institution: 'University of Washington',
          degree: 'B.Sc.',
          field: 'Computer Science',
          from: new Date('2016-09-01'),
          to: new Date('2020-05-30'),
          current: false,
        },
      ],
    },
    {
      name: 'Emily Rodriguez',
      email: 'candidate2@demo.com',
      password: 'demo123',
      role: 'candidate',
      phone: '+1-555-1002',
      location: 'Chicago, IL',
      bio: 'Data scientist specialising in ML pipelines and business analytics.',
      skills: ['Python', 'Machine Learning', 'Data Science', 'PostgreSQL', 'AWS', 'Docker'],
      expectedSalary: 110000,
      jobType: 'full-time',
      experience: [
        {
          title: 'Data Analyst',
          company: 'InsightLabs',
          location: 'Chicago, IL',
          from: new Date('2022-03-01'),
          to: null,
          current: true,
          description: 'Built ML models for customer churn prediction with 87% accuracy.',
        },
      ],
      education: [
        {
          institution: 'Northwestern University',
          degree: 'M.Sc.',
          field: 'Data Science',
          from: new Date('2020-09-01'),
          to: new Date('2022-05-30'),
          current: false,
        },
      ],
    },
    {
      name: 'Marcus Lee',
      email: 'candidate3@demo.com',
      password: 'demo123',
      role: 'candidate',
      phone: '+1-555-1003',
      location: 'Remote',
      bio: 'DevOps engineer with a passion for automation and cloud infrastructure.',
      skills: ['AWS', 'Kubernetes', 'Docker', 'CI/CD', 'Python', 'Terraform', 'Linux'],
      expectedSalary: 130000,
      jobType: 'remote',
    },
  ];
  const candidates = await User.create(candidateData);
  // Update profile completion for each
  for (const c of candidates) {
    c.profileCompletion = c.calculateProfileCompletion();
    await c.save({ validateBeforeSave: false });
  }
  for (const r of recruiters) {
    r.profileCompletion = r.calculateProfileCompletion();
    await r.save({ validateBeforeSave: false });
  }

  // ── Create Jobs ──────────────────────────────────────────
  const jobsData = [
    // TechCorp jobs
    {
      title: 'Senior React Developer',
      description: 'We are looking for a Senior React Developer to join our growing frontend team. You will be responsible for building high-quality, scalable web applications that serve millions of users.\n\nYou will collaborate closely with designers, product managers, and backend engineers to deliver exceptional user experiences.',
      requirements: ['5+ years React experience', 'Strong TypeScript skills', 'Experience with state management (Redux/Zustand)', 'Familiarity with testing frameworks (Jest, RTL)'],
      responsibilities: ['Develop new features and maintain existing codebase', 'Conduct code reviews', 'Mentor junior developers', 'Collaborate with product and design teams'],
      skills: ['React', 'TypeScript', 'Node.js', 'Redux', 'GraphQL', 'AWS'],
      location: 'New York, NY',
      type: 'full-time',
      experience: { min: 5, max: 8 },
      salary: { min: 130000, max: 160000, currency: 'USD', disclosed: true },
      recruiter: recruiters[0]._id,
      company: { name: 'TechCorp Inc.', industry: 'Technology', size: '1000+' },
      category: 'Engineering',
      status: 'active',
      featured: true,
    },
    {
      title: 'Full Stack Engineer',
      description: 'Join TechCorp as a Full Stack Engineer. Build end-to-end features using React and Node.js for our enterprise SaaS platform used by 500+ companies.',
      requirements: ['3+ years full stack experience', 'React and Node.js proficiency', 'REST API design knowledge', 'Database design (SQL and NoSQL)'],
      responsibilities: ['Build and maintain full stack features', 'Design and implement APIs', 'Write unit and integration tests', 'Participate in sprint planning'],
      skills: ['React', 'Node.js', 'MongoDB', 'PostgreSQL', 'Docker', 'JavaScript'],
      location: 'New York, NY',
      type: 'full-time',
      experience: { min: 3, max: 6 },
      salary: { min: 110000, max: 140000, currency: 'USD', disclosed: true },
      recruiter: recruiters[0]._id,
      company: { name: 'TechCorp Inc.', industry: 'Technology', size: '1000+' },
      category: 'Engineering',
      status: 'active',
    },
    {
      title: 'DevOps Engineer',
      description: 'Looking for an experienced DevOps Engineer to own our cloud infrastructure and help us scale to the next level. You will design and maintain CI/CD pipelines, manage Kubernetes clusters, and drive reliability engineering initiatives.',
      requirements: ['AWS certification preferred', 'Kubernetes experience', 'Infrastructure as Code (Terraform)', 'Strong scripting skills'],
      responsibilities: ['Manage cloud infrastructure on AWS', 'Build and maintain CI/CD pipelines', 'Monitor system performance and reliability', 'Implement security best practices'],
      skills: ['AWS', 'Kubernetes', 'Docker', 'CI/CD', 'Terraform', 'Python', 'Linux'],
      location: 'Remote',
      type: 'remote',
      experience: { min: 4, max: 7 },
      salary: { min: 120000, max: 150000, currency: 'USD', disclosed: true },
      recruiter: recruiters[0]._id,
      company: { name: 'TechCorp Inc.', industry: 'Technology', size: '1000+' },
      category: 'DevOps',
      status: 'active',
    },
    // StartupXYZ jobs
    {
      title: 'Machine Learning Engineer',
      description: 'StartupXYZ is hiring a Machine Learning Engineer to build AI-powered features for our fintech platform. You will work on real-time fraud detection, credit scoring, and personalized financial recommendations.',
      requirements: ['Strong Python skills', 'Experience with TensorFlow or PyTorch', 'Knowledge of MLOps', 'Statistics and mathematics background'],
      responsibilities: ['Design and train ML models', 'Deploy models to production', 'Monitor model performance', 'Collaborate with data engineers'],
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'AWS', 'Docker', 'Data Science', 'SQL'],
      location: 'Austin, TX',
      type: 'full-time',
      experience: { min: 3, max: 6 },
      salary: { min: 125000, max: 155000, currency: 'USD', disclosed: true },
      recruiter: recruiters[1]._id,
      company: { name: 'StartupXYZ', industry: 'Fintech', size: '51-200' },
      category: 'Data & AI',
      status: 'active',
      featured: true,
    },
    {
      title: 'Product Designer (UI/UX)',
      description: 'We need a talented Product Designer to create beautiful, intuitive experiences for our financial products. You will own the design process from research to high-fidelity prototypes.',
      requirements: ['Portfolio demonstrating UI/UX work', 'Proficiency in Figma', 'User research experience', 'Understanding of design systems'],
      responsibilities: ['Create wireframes and prototypes', 'Conduct user research and usability tests', 'Maintain design system', 'Work closely with engineering'],
      skills: ['UI/UX Design', 'Figma', 'Prototyping', 'User Research', 'Design Systems'],
      location: 'Austin, TX',
      type: 'full-time',
      experience: { min: 2, max: 5 },
      salary: { min: 90000, max: 120000, currency: 'USD', disclosed: true },
      recruiter: recruiters[1]._id,
      company: { name: 'StartupXYZ', industry: 'Fintech', size: '51-200' },
      category: 'Design',
      status: 'active',
    },
    {
      title: 'Backend Engineer (Node.js)',
      description: 'Join StartupXYZ's backend team to build the APIs powering our fintech platform. Experience with high-throughput, low-latency systems is a big plus.',
      requirements: ['3+ years Node.js', 'Experience with microservices', 'Knowledge of message queues (Kafka, RabbitMQ)', 'PostgreSQL expertise'],
      responsibilities: ['Build and scale backend microservices', 'Design database schemas', 'Implement payment integrations', 'Write comprehensive tests'],
      skills: ['Node.js', 'TypeScript', 'PostgreSQL', 'Kubernetes', 'Docker', 'REST API', 'GraphQL'],
      location: 'Remote',
      type: 'remote',
      experience: { min: 3, max: 7 },
      salary: { min: 115000, max: 145000, currency: 'USD', disclosed: true },
      recruiter: recruiters[1]._id,
      company: { name: 'StartupXYZ', industry: 'Fintech', size: '51-200' },
      category: 'Engineering',
      status: 'active',
    },
    // GlobalSoft jobs
    {
      title: 'Java Backend Developer',
      description: 'GlobalSoft is looking for an experienced Java developer to work on enterprise-grade applications for our banking clients.',
      requirements: ['5+ years Java experience', 'Spring Boot expertise', 'Microservices architecture', 'SQL proficiency'],
      responsibilities: ['Develop Java microservices', 'Integrate with third-party banking APIs', 'Perform code reviews', 'Write technical documentation'],
      skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Docker', 'REST API', 'Agile'],
      location: 'Bangalore, India',
      type: 'full-time',
      experience: { min: 5, max: 9 },
      salary: { min: 1800000, max: 2800000, currency: 'INR', disclosed: true },
      recruiter: recruiters[2]._id,
      company: { name: 'GlobalSoft Solutions', industry: 'IT Services', size: '1000+' },
      category: 'Engineering',
      status: 'active',
    },
    {
      title: 'React Developer (Contract)',
      description: 'We have an exciting 6-month contract opportunity for a skilled React developer to help modernize a legacy enterprise dashboard application.',
      requirements: ['3+ years React', 'Experience with large codebases', 'Strong CSS skills', 'REST API integration'],
      responsibilities: ['Migrate legacy UI to React', 'Implement responsive design', 'Integrate REST APIs', 'Write unit tests'],
      skills: ['React', 'JavaScript', 'CSS', 'REST API', 'Git', 'Agile'],
      location: 'Bangalore, India',
      type: 'contract',
      experience: { min: 3, max: 6 },
      salary: { min: 1200000, max: 1800000, currency: 'INR', disclosed: true },
      recruiter: recruiters[2]._id,
      company: { name: 'GlobalSoft Solutions', industry: 'IT Services', size: '1000+' },
      category: 'Engineering',
      status: 'active',
    },
    {
      title: 'Data Engineer (Intern)',
      description: 'Exciting internship opportunity for final-year students or recent graduates to work on real data pipeline projects.',
      requirements: ['Basic Python knowledge', 'Understanding of SQL', 'Familiarity with cloud concepts', 'Good communication skills'],
      responsibilities: ['Assist in building ETL pipelines', 'Write SQL queries and reports', 'Document data flows', 'Participate in team meetings'],
      skills: ['Python', 'SQL', 'Data Science', 'Git'],
      location: 'Bangalore, India',
      type: 'internship',
      experience: { min: 0, max: 1 },
      salary: { min: 300000, max: 500000, currency: 'INR', disclosed: true },
      recruiter: recruiters[2]._id,
      company: { name: 'GlobalSoft Solutions', industry: 'IT Services', size: '1000+' },
      category: 'Data & AI',
      status: 'active',
    },
  ];

  const jobs = await Job.create(jobsData);
  console.log(`✅ Created ${jobs.length} jobs`);

  // ── Create Applications ──────────────────────────────────
  const { calculateSkillMatch } = require('./utils/skillMatch');
  const appData = [];
  // candidate[0] (Alex - React/Node) applies to first 3 jobs
  for (const job of jobs.slice(0, 3)) {
    const { score, matched, missing } = calculateSkillMatch(candidates[0].skills, job.skills);
    appData.push({
      job: job._id,
      candidate: candidates[0]._id,
      recruiter: job.recruiter,
      status: ['applied', 'shortlisted', 'viewed'][Math.floor(Math.random() * 3)],
      coverLetter: `I am very excited about the ${job.title} role. With my background in ${candidates[0].skills.slice(0, 3).join(', ')}, I believe I'd be a great fit.`,
      matchScore: score,
      matchedSkills: matched,
      missingSkills: missing,
      timeline: [{ status: 'applied', date: new Date(), note: 'Application submitted' }],
    });
  }
  // candidate[1] (Emily - ML/Python) applies to ML job
  const mlJob = jobs[3];
  const { score: s2, matched: m2, missing: ms2 } = calculateSkillMatch(candidates[1].skills, mlJob.skills);
  appData.push({
    job: mlJob._id,
    candidate: candidates[1]._id,
    recruiter: mlJob.recruiter,
    status: 'shortlisted',
    matchScore: s2,
    matchedSkills: m2,
    missingSkills: ms2,
    timeline: [
      { status: 'applied', date: new Date(Date.now() - 7 * 86400000), note: 'Application submitted' },
      { status: 'shortlisted', date: new Date(), note: 'Great profile match!' },
    ],
  });
  // candidate[2] (Marcus - DevOps) applies to DevOps job
  const devopsJob = jobs[2];
  const { score: s3, matched: m3, missing: ms3 } = calculateSkillMatch(candidates[2].skills, devopsJob.skills);
  appData.push({
    job: devopsJob._id,
    candidate: candidates[2]._id,
    recruiter: devopsJob.recruiter,
    status: 'interview',
    matchScore: s3,
    matchedSkills: m3,
    missingSkills: ms3,
    interviewDate: new Date(Date.now() + 5 * 86400000),
    timeline: [
      { status: 'applied', date: new Date(Date.now() - 14 * 86400000), note: 'Application submitted' },
      { status: 'viewed', date: new Date(Date.now() - 10 * 86400000), note: 'Application reviewed' },
      { status: 'shortlisted', date: new Date(Date.now() - 5 * 86400000), note: 'Shortlisted for interview' },
      { status: 'interview', date: new Date(), note: 'Interview scheduled for next week' },
    ],
  });

  const applications = await Application.create(appData);
  // Link to jobs
  for (const app of applications) {
    await Job.findByIdAndUpdate(app.job, { $push: { applicants: app._id } });
  }
  console.log(`✅ Created ${applications.length} applications`);

  // ── Create Notifications ─────────────────────────────────
  await Notification.create([
    {
      recipient: candidates[0]._id,
      type: 'system',
      title: 'Welcome to JobPortal!',
      message: 'Complete your profile to improve your job match score.',
      link: '/candidate/profile',
      read: false,
    },
    {
      recipient: candidates[0]._id,
      sender: recruiters[0]._id,
      type: 'application_status',
      title: 'Application Shortlisted!',
      message: 'You have been shortlisted for Senior React Developer at TechCorp Inc.',
      link: '/candidate/applications',
      read: false,
    },
    {
      recipient: candidates[1]._id,
      type: 'system',
      title: 'Welcome to JobPortal!',
      message: 'Start browsing jobs matched to your skills.',
      link: '/jobs',
      read: false,
    },
    {
      recipient: recruiters[0]._id,
      sender: candidates[0]._id,
      type: 'application_received',
      title: 'New Application',
      message: `${candidates[0].name} applied for Senior React Developer`,
      link: '/recruiter/applications',
      read: false,
    },
  ]);
  console.log('✅ Created notifications');

  console.log('\n🎉 Seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Demo Accounts:');
  console.log('  Admin     → admin@demo.com      / demo123');
  console.log('  Recruiter → recruiter@demo.com  / demo123');
  console.log('  Candidate → candidate@demo.com  / demo123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
