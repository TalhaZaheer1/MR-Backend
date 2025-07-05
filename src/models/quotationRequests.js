const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    maximoId:{
      type:String,
      ref:"Materials",
      required:true
    },
    quantity: { type: Number, required: true },
    specifications: { type: String },
    deliveryLocation: { type: String,  },
 },
  { _id: false },
);

const quotationRequestsSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },

    items: [itemSchema],

    currency: { type: String, default: "USD" },
    // validityDays: { type: Number, default: 30 },
    notes: { type: String },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },

    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    suppliers: {
      type: [mongoose.Schema.Types.ObjectId],
      required:true,
      ref:"Users"
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model("QuotationRequests", quotationRequestsSchema);
