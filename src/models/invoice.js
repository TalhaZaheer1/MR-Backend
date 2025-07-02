const { Schema, model, default: mongoose } = require("mongoose");


const invoiceSchema = new Schema({
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  purchaseOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrders',
    required: true,
  },
  deliveries: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deliveries',
    },
  ],
  items: [
    {
      material: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Materials',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      unitPrice: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
        required: true,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  invoiceDate: {
    type: Date,
    default: Date.now,
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partially_paid', 'paid'],
    default: 'unpaid',
  },
  dueDate: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', // The Invoicing Role or Admin
  },
});

const InvoiceModel = mongoose.model('Invoices', invoiceSchema);

module.exports = {
  InvoiceModel
}
