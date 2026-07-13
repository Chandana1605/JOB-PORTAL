const User = require('../models/User');
const Job = require('../models/Job');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id || req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { password, role, ...updateData } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true });
    user.profileCompletion = user.calculateProfileCompletion();
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateResume = async (req, res) => {
  try {
    const { resume } = req.body; // { url, filename, data }
    const user = await User.findByIdAndUpdate(req.user.id, { resume }, { new: true });
    user.profileCompletion = user.calculateProfileCompletion();
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedJobs',
      populate: { path: 'recruiter', select: 'name company' },
    });
    res.json({ success: true, jobs: user.savedJobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.searchCandidates = async (req, res) => {
  try {
    const { skills, location, experience, page = 1, limit = 10 } = req.query;
    const query = { role: 'candidate', isActive: true };
    if (location) query.location = { $regex: location, $options: 'i' };
    if (skills) {
      const skillArr = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillArr.map(s => new RegExp(s, 'i')) };
    }

    const total = await User.countDocuments(query);
    const candidates = await User.find(query)
      .select('name avatar skills location experience education bio')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, candidates, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
