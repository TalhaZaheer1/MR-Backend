const { Schema, model, default: mongoose } = require("mongoose");

const notificationSchema = new Schema({
  heading:String,
  for: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const NotificationModel = model("Notifications", notificationSchema);

module.exports = NotificationModel;
