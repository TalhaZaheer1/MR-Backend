const { Schema, model, default: mongoose } = require("mongoose");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: { type: String, required: true,unique:true },
  role: {
    type: String,
    enum: [
      "admin",
      "department",
      "invoicing",
      "store",
      "purchasing",
      "supplier",
    ],
    required: true,
  },
  password: {
    type: String,
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: "Departments", 
  },
  isUser:{
    type:Boolean,
    default:false
  }
});

const UserModel = model("Users", userSchema);

module.exports = {
  UserModel,
};
