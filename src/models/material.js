const { Schema, model, default: mongoose } = require("mongoose");

const materialSchema = new Schema({
  maximoId: {
    type: String,
    require: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  itemType: {
    type: String,
    enum: ["consumable", "spare-part"],
    require: true,
  },
  unit: {
    type: String,
    default: "Pcs",
  },
  initialStock: {
    type: Number,
    default: 0,
  },
  currentStock: {
    type: Number,
    defaut: 0,
  },
  lowStockValue:{
    type:Number
  },
  lowStock: Boolean,
});

const MaterialModel = model("Materials", materialSchema);

module.exports = MaterialModel;
