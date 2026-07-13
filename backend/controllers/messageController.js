const Message = require('../models/Message');
const User = require('../models/User');

const getConversationId = (id1, id2) => [id1, id2].sort().join('_');

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await Message.aggregate([
      { $match: { $or: [{ sender: require('mongoose').Types.ObjectId.createFromHexString(userId) }, { receiver: require('mongoose').Types.ObjectId.createFromHexString(userId) }] } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$conversation', lastMessage: { $first: '$$ROOT' } } },
    ]);

    const conversations = await Promise.all(messages.map(async (m) => {
      const ids = m._id.split('_');
      const otherId = ids.find(id => id !== userId);
      const other = await User.findById(otherId).select('name avatar role company lastSeen');
      const unread = await Message.countDocuments({ conversation: m._id, receiver: userId, read: false });
      return { conversationId: m._id, other, lastMessage: m.lastMessage, unreadCount: unread };
    }));

    res.json({ success: true, conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const conversationId = getConversationId(req.user.id, req.params.userId);
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    await Message.updateMany({ conversation: conversationId, receiver: req.user.id }, { read: true });
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const conversationId = getConversationId(req.user.id, req.params.userId);
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      receiver: req.params.userId,
      content,
    });
    await message.populate('sender', 'name avatar');

    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    const receiverSocket = connectedUsers[req.params.userId];
    if (receiverSocket) {
      io.to(receiverSocket).emit('receive_message', message);
    }

    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
