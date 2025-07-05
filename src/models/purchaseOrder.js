const { Schema, model, default: mongoose } = require("mongoose");


const partiallyDeliveredItemsSchema = new mongoose.Schema(
  {
    maximoId: {
      type: String,
      ref: "Materials",
      required: true,
    },
    quantity: { type: Number, required: true },
    pricePerUnit:Number,
    totalAmount:Number
  },
  { _id: false },
);


const purchaseOrderSchema = new Schema({
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  quotationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotations', 
  },
 paymentTerms: {
    type: String,
    default: 'Net 30', // can be customized per supplier
  },
  expectedDeliveryDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending','recieved','not recieved','dispatched', 'dispatcing rejected', 'partially dispatched'],
    default: 'pending',
  },
  partiallyDeliveredItems:[partiallyDeliveredItemsSchema],
  rejectReason:String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', // The purchasing user who created it
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deliveryDate:{
    type:Date,
    default:null
  },
  rejectionReason:{
    type:String,
  },
  recievedDate:{
    type:Date,
    default:null
  },
  totalAmount:Number
});

const PurchaseOrderModel = model('PurchaseOrders', purchaseOrderSchema);

module.exports = {
  PurchaseOrderModel
}

