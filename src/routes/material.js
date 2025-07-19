const express = require("express");
const router = express.Router();
const {
  createMaterial,
  getAllMaterials,
  updateMaterial,
  bulkCreateMaterials,
  getMaterialByMaximoId,
} = require("../controllers/material");

router.post("/", createMaterial);
router.post("/bulk",bulkCreateMaterials);
router.get("/", getAllMaterials);
router.post("/update/:id", updateMaterial); // or use PUT
router.get("/maximo/:maximoId", getMaterialByMaximoId);

module.exports = router;
