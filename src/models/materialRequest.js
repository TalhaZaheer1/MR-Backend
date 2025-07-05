const { Schema, model, default: mongoose } = require("mongoose");

const materialRequestSchema = new Schema({
  materialMaximoId: {
    type: String,
    required: true,
    ref: "Materials",
  },
  description: {
    type: String,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: [
      "pending approval",
      "approved",
      "rejected",
      "partially supplied",
      "supplied",
      "delivered",
      "delivery rejected",
      "repair",
      "partially delivered",
      "recieved - confirmed quality",
      "recieved - rejected quality",
    ],
    required: true,
    default: "pending approval",
  },
  workOrders: {
    type: String,
  },
  sample: {
    type: Boolean,
  },
  purpose: String,
  reason: {
    type: String,
  },
  requestDate: {
    type: Date,
    required:true
  },
  actionTakerId:{
    type:Schema.Types.ObjectId,
    ref:"Users"
  },
  approvalDate: {
    type: Date,
  },
  requesterId: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
});

const MaterialRequestModel = model("MaterialRequests", materialRequestSchema);

module.exports = MaterialRequestModel;
