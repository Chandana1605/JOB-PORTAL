const Notification = require('../models/Notification');

exports.createNotification = async ({ recipient, sender, type, title, message, link, data }) => {
  try {
    const notif = await Notification.create({ recipient, sender, type, title, message, link, data });
    return notif;
  } catch (err) {
    console.error('Notification error:', err);
  }
};

exports.sendSocketNotification = (io, connectedUsers, userId, notification) => {
  const socketId = connectedUsers[userId.toString()];
  if (socketId) {
    io.to(socketId).emit('new_notification', notification);
  }
};
