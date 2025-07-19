const mongoose = require("mongoose");

// const itemSchema = new mongoose.Schema(
//   {
//     maximoId:{
//       type:String,
//       ref:"Materials",
//       required:true
//     },
//     quantity: { type: Number, required: true },
//     specifications: { type: String },
//     deliveryLocation: { type: String,  },
//  },
//   { _id: false },
// );

const quotationRequestsSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },

    materialRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MaterialRequests",
      required: true,
    },
    currency: { type: String, default: "USD" },
    // validityDays: { type: Number, default: 30 },
    notes: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "price added","closed"],
      default: "pending",
    },
    pricePerUnit: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },

    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("QuotationRequests", quotationRequestsSchema);
