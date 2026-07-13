// routes/applications.js
const router = require('express').Router();
const { applyToJob, getCandidateApplications, getRecruiterApplications, updateApplicationStatus, getApplication, withdrawApplication } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/job/:jobId', protect, authorize('candidate'), applyToJob);
router.get('/candidate', protect, authorize('candidate'), getCandidateApplications);
router.get('/recruiter', protect, authorize('recruiter', 'admin'), getRecruiterApplications);
router.get('/:id', protect, getApplication);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);
router.delete('/:id', protect, authorize('candidate'), withdrawApplication);

module.exports = router;
