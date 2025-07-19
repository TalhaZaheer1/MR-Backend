const { Schema, model, default: mongoose } = require("mongoose");



const purchaseOrderSchema = new Schema({
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  quotationRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuotationRequests', 
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
    enum: ["draft",'pending','dispatched','rejected',"delivery confirmed","delivery rejected"],
    default: 'draft',
  },
  // partiallyDeliveredItems:[partiallyDeliveredItemsSchema],
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
});

const PurchaseOrderModel = model('PurchaseOrders', purchaseOrderSchema);

module.exports = {
  PurchaseOrderModel
}

