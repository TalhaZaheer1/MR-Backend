const { Schema, model, default: mongoose } = require("mongoose");

const nonMaximoMaterialSchema = Schema({
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
});

const NonMaximoMaterialModel = model(
  "NonMaximoMaterials",
  nonMaximoMaterialSchema,
);

module.exports = {
  NonMaximoMaterialModel,
};
