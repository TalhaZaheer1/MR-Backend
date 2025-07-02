const { Schema, model, default: mongoose, SchemaTypes } = require("mongoose");

const alertSchema = new Schema({
  title:{
    type:String,
    required:true
  },
  description: {
    type: String,
    require:true
  },
  userId:{
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  }
});

const AlertModel = model("Alerts",alertSchema);

module.exports = {
  AlertModel
}
