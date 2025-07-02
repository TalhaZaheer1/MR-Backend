const { Schema, model, default: mongoose } = require("mongoose");


const purchaseOrderSchema = new Schema({
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaterialRequest', // Assuming you track the original request
  },
  items: [
    {
      material: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material',
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
    },
  ],
  paymentTerms: {
    type: String,
    default: 'Net 30', // can be customized per supplier
  },
  expectedDeliveryDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['issued', 'cancelled', 'completed'],
    default: 'issued',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', // The purchasing user who created it
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PurchaseOrderModel = model('PurchaseOrders', purchaseOrderSchema);

module.exports = {
  PurchaseOrderModel
}

