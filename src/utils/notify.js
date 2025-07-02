const Notification = require("../models/notification");

async function createNotification(userId, description) {
  if (!userId || !description) throw new Error("Missing fields for notification");
  await Notification.create({ for: userId, description });
}

module.exports = { createNotification };
