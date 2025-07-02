const { Schema, model, default: mongoose } = require("mongoose");

const deliverySchema = new Schema({
  purchaseOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrders',
    required: true,
  },
  deliveredItems: [
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
      qualityStatus: {
        type: String,
        enum: ['accepted', 'rejected', 'partial'],
        default: 'accepted',
      },
      remarks: {
        type: String,
      },
    },
  ],
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', // Stores user who received it
    required: true,
  },
  receivedAt: {
    type: Date,
    default: Date.now,
  },
  deliveryStatus: {
    type: String,
    enum: ['delivered', 'partial', 'rejected'],
    default: 'delivered',
  },
});

const DeliveryModel = model('Deliveries', deliverySchema);

module.exports = {
  DeliveryModel
}
