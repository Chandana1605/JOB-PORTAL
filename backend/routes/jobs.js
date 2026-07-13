const router = require('express').Router();
const { createJob, getJobs, getJob, updateJob, deleteJob, getRecommendedJobs, getRecruiterJobs, saveJob } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

const optionalAuth = (req, res, next) => {
  const auth = require('../middleware/auth');
  const token = req.headers.authorization?.split(' ')[1];
  if (token) return auth.protect(req, res, next);
  next();
};

router.get('/', optionalAuth, getJobs);
router.post('/', protect, authorize('recruiter', 'admin'), createJob);
router.get('/recommended', protect, authorize('candidate'), getRecommendedJobs);
router.get('/recruiter', protect, authorize('recruiter'), getRecruiterJobs);
router.get('/:id', optionalAuth, getJob);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);
router.post('/:id/save', protect, authorize('candidate'), saveJob);

module.exports = router;
