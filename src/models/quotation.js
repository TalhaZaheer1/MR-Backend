const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    maximoId: {
      type: String,
      ref: "Materials",
      required: true,
    },
    quantity: { type: Number, required: true },
    pricePerUnit: Number,
    totalPrice: Number,
  },
  { _id: false },
);

const quotationSchema = new mongoose.Schema({
  quotationRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QuotationRequests",
    required: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  status: {
    type: String,
    enum: ["approved", "pending", "rejected"],
    default: "pending"
  },
  items: [itemSchema],
  date: {
    type: Date,
    default: Date.now
  },
  rejectionReason: String
});

module.exports = mongoose.model("Quotations", quotationSchema);
