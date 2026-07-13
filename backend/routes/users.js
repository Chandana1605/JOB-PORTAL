// routes/users.js
const router = require('express').Router();
const { getProfile, updateProfile, updateResume, getSavedJobs, searchCandidates } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/profile/:id?', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/resume', protect, authorize('candidate'), updateResume);
router.get('/saved-jobs', protect, authorize('candidate'), getSavedJobs);
router.get('/candidates', protect, authorize('recruiter', 'admin'), searchCandidates);

module.exports = router;
