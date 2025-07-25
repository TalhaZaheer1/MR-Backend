const { Schema, model, default: mongoose } = require("mongoose");

const materialRequestSchema = new Schema({
  materialMaximoId: {
    type: String,
    required: true,
    ref: "Materials",
  },
  serial:{
    type:String,
    unique:true
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
      "partially approved",
      "rejected",
      "partially supplied",
      "pending rfq generation",
      "rfq generated",
      "PO generated",
      "reserved",
      "partially reserved",
      "dispatched",
      "dispatch rejected",
      "delivery confirmed",
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
  itemNumber:Number,
  materialDescription:String,
  priority: {
    type: String,
    enum: [
      "low",
      "medium",
      "high",
    ],
    required: true,
    default: "Low",
  },
  quotationRequestsIds:{
    type: Schema.Types.ObjectId,
    ref:"QuotationRequests",
  },
  purchaseOrderId:{
    type: Schema.Types.ObjectId,
    ref:"PurchaseOrders"
  },
  requesterId: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
});

const MaterialRequestModel = model("MaterialRequests", materialRequestSchema);

module.exports = MaterialRequestModel;
