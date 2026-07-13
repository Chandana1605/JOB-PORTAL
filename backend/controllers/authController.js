const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { createNotification } = require('../utils/notifications');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, company } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const userData = { name, email, password, role: role || 'candidate' };
    if (role === 'recruiter' && company) userData.company = company;

    const user = await User.create(userData);
    user.profileCompletion = user.calculateProfileCompletion();
    await user.save();

    await createNotification({
      recipient: user._id,
      type: 'system',
      title: 'Welcome to JobPortal!',
      message: `Hi ${name}, your account has been created. Complete your profile to get started.`,
      link: '/profile',
    });

    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !await user.comparePassword(password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });

    user.lastSeen = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    const userObj = user.toJSON();
    res.json({ success: true, token, user: userObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).populate('savedJobs', 'title company location type salary status');
  res.json({ success: true, user });
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!await user.comparePassword(currentPassword)) {
      return res.status(400).json({ success: false, message: 'Current password incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
