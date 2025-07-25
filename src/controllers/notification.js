
const Notification = require("../models/notification");


async function createNotification(heading,userId,description){
  await Notification.create({heading,for:userId,description});
}

async function getUserNotifications(req, res, next) {
  try {
    const userId = req.userId;
    const notifications = await Notification.find({ for: userId }).sort({ _id: -1 });
    res.json({ notifications });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUserNotifications,
  createNotification
};
