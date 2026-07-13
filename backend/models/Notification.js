const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: ['application_received', 'application_status', 'job_match', 'message', 'job_update', 'profile_view', 'system'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: String,
  read: { type: Boolean, default: false },
  data: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
