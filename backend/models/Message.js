const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: { type: String, required: true }, // sorted userId pair: "id1_id2"
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  type: { type: String, enum: ['text', 'file'], default: 'text' },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
