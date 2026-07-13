const router = require('express').Router();
const { getDashboardStats, getUsers, toggleUserStatus, deleteUser, getAllJobs, toggleJobStatus, toggleFeatured } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/jobs', getAllJobs);
router.put('/jobs/:id/status', toggleJobStatus);
router.put('/jobs/:id/featured', toggleFeatured);

module.exports = router;
