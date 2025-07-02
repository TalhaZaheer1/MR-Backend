const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    maximoId:{
      type:String,
      ref:"Materials",
      required:true
    },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    specifications: { type: String },
    deliveryLocation: { type: String, required: true },
 },
  { _id: false },
);

const rfqSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },

    items: [itemSchema],

    currency: { type: String, default: "USD" },
    validityDays: { type: Number, default: 30 },
    notes: { type: String },
    status: {
      type: String,
      enum: ["pending", "sent", "received", "closed"],
      default: "pending",
    },

    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      required:true,
      ref:"Users"
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model("RFQs", rfqSchema);
