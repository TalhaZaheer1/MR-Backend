const MaterialModel = require("../models/material");




const getMaterialByMaximoId = async (req, res, next) => {
  const { maximoId } = req.params;

  try {
    const material = await MaterialModel.findOne({ maximoId });

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    res.json({ material });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMaterialByMaximoId };

async function createMaterial(req, res, next) {
  try {
    const { maximoId, description, itemType, unit, initialStock } = req.body;

    // Validate required fields
    if (!maximoId || !description || !itemType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check for duplicate maximoId
    const existing = await MaterialModel.findOne({ maximoId });
    if (existing) {
      return res.status(409).json({ message: "Maximo ID already exists" });
    }

    // Create the material
    const material = await MaterialModel.create({
      maximoId,
      description,
      itemType,
      unit: unit || "Pcs",
      initialStock: initialStock || 0,
      currentStock: initialStock || 0,
    });

    res.status(201).json({ material });
  } catch (error) {
    next(error);
  }
}


async function bulkCreateMaterials(req, res, next) {
  try {
    const materials = req.body.materials;

    if (!Array.isArray(materials) || materials.length === 0) {
      throw new Error({ message: "Materials array is required" });
    }

    // Validate and prepare data
    const validMaterials = [];
    const duplicateIds = [];

    for (const m of materials) {
      const { maximoId, description, itemType, unit, initialStock,lowStockValue } = m;

      if (!maximoId || !description || !itemType) {
        continue; // Skip invalid entries
      }

      const existing = await MaterialModel.findOne({ maximoId });
      if (existing) {
        duplicateIds.push(maximoId);
        continue; // Skip duplicates
      }

      validMaterials.push({
        maximoId,
        description,
        itemType,
        unit: unit || "Pcs",
        initialStock: initialStock || 0,
        currentStock: initialStock || 0,
        lowStockValue: lowStockValue || 25 
      });
    }

    if (validMaterials.length === 0) {
      throw new Error({ message: "No valid materials to import" });
    }

    const inserted = await MaterialModel.insertMany(validMaterials);
    res.status(201).json({ inserted, skipped: duplicateIds });
  } catch (error) {
    next(error);
  }
}


async function getAllMaterials(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;  // Default to page 1 if no page is provided
    const pageSize = parseInt(req.query.pageSize) || 10;  // Default to 10 items per page

    const skip = (page - 1) * pageSize;  // Calculate the number of items to skip

    // Fetch the materials with pagination
    const materials = await MaterialModel.find()
      .skip(skip)
      .limit(pageSize)
      .sort({ description: 1 });  // Sorting alphabetically by description

    // Get the total count of materials for pagination info
    const totalMaterials = await MaterialModel.countDocuments();

    res.status(200).json({
      materials,
      pagination: {
        page,
        pageSize,
        totalMaterials,
        totalPages: Math.ceil(totalMaterials / pageSize), // Calculate total number of pages
      },
    });
  } catch (error) {
    next(error);
  }
}


async function updateMaterial(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const mterial = await MaterialModel.findById(id);

    if (updates.currentStock && updates.currentStock < mterial.lowStockValue) {
      updates.lowStock = true;
    }

    const material = await MaterialModel.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    res.status(200).json({ material });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createMaterial,
  getAllMaterials,
  updateMaterial,
  bulkCreateMaterials,
  getMaterialByMaximoId
};
