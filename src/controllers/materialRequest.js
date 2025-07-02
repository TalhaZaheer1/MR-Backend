const Material = require("../models/material");
const Request = require("../models/materialRequest");
const Notification = require("../models/notification.js");
const { createNotification } = require("../utils/notify.js");

const getAllMaterialsRequests = async (req, res, next) => {
  try {
    const requests = await Request.find({}).populate("requesterId");
    res.json({ requests });
  } catch (error) {
    next(error);
  }
};

const getUserMaterialRequests = async (req, res, next) => {
  const userId = req.userId;
  try {
    const requests = await Request.find({ requesterId: userId }).populate(
      "requesterId",
    );
    res.json({ requests });
  } catch (error) {
    next(error);
  }
};

async function repairMaterialRequest(req, res, next) {
  const { requestId, materialMaximoId, quantity, purpose } = req.body;

  try {
    if (!requestId) throw new Error("Missing required field: requestId");

    const updatePayload = {};
    if (materialMaximoId) updatePayload.materialMaximoId = materialMaximoId;
    if (typeof quantity === "number") updatePayload.quantity = quantity;
    if (purpose) updatePayload.purpose = purpose;
    updatePayload.status = "pending approval";
    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      updatePayload,
      { new: true },
    );

    if (!updatedRequest) {
      return res.status(404).json({ error: "Material request not found" });
    }

    res.json({ message: "Request updated successfully", data: updatedRequest });
  } catch (error) {
    next(error);
  }
}

const bulkCreateMaterialRequests = async (req, res,next) => {
  const requests = req.body.requests; // an array of request objects

  try {
    // Step 1: Extract all unique maximo_ids from the request payload
    const maximoIds = [...new Set(requests.map((r) => r.materialMaximoId))];
    console.log({maximoIds})
    // Step 2: Find existing maximo_ids in Material collection
    const existingMaterials = await Material.find({
      maximoId: { $in: maximoIds },
    }).select("maximoId");
    const existingMaximoIds = existingMaterials.map((m) => m.maximoId);
    console.log({existingMaximoIds})
    // Step 3: Filter out invalid ones
    const invalidRequests = requests.filter(
      (r) => !existingMaximoIds.includes(r.materialMaximoId.toString()),
    );

    if (invalidRequests.length > 0) {
      console.log({invalidRequests});
      throw new Error("Some referenced maximoId values are invalid.")
      // return res.status(400).json({
      //   error: "Some referenced maximoId values are invalid.",
      //   invalidEntries: invalidRequests,
      // });
    }

    // Step 4: All valid — insert
    const insertedRequests = await Request.insertMany(requests);
    res.status(201).json({ success: true, data: insertedRequests });
  } catch (err) {
    console.error("[❌ Bulk Insert Error]", err);
    next(err);
  }
};

async function changeStatusRejected(req, res, next) {
  const { requestId, reason } = req.body;
  try {
    if (!requestId || !reason) throw new Error("Missing required fields");
    const request = await Request.findByIdAndUpdate(requestId, {
      status: "rejected",
      reason,
    });
    await createNotification(
      request.requesterId,
      `Your request has been rejected. \nID:${request._id}`,
    );
    res.json({ message: "rejected successfully" });
  } catch (error) {
    next(error);
  }
}

async function changeStatusApproved(req, res, next) {
  const requestId = req.body.requestId;
  try {
    if (!requestId) throw new Error("Missing Required field: requestId");
    const materialRequest = await Request.findByIdAndUpdate(requestId, {
      status: "approved",
      approvalDate: Date.now(),
    });
    const notificationPayload = {
      for: materialRequest.requesterId,
      description: `Material Request Approved. RequestId:${materialRequest._id}`,
    };
    await Notification.create(notificationPayload);
    res.json({ message: "approved successfully" });
  } catch (error) {
    next(error);
  }
}

async function changeStatusSupplied(req, res, next) {
  const requestId = req.body.requestId;
  try {
    if (!requestId) throw new Error("Missing Required field: requestId");
    const materialRequest = await Request.findById(requestId);
    const requestedMaterial = await Material.findOne({
      maximoId: materialRequest.materialMaximoId,
    });
    console.log({ materialRequest, requestedMaterial });
    console.log({
      quantity: materialRequest.quantity,
      stock: requestedMaterial.currentStock,
    });
    console.log({
      condition: materialRequest.quantity < requestedMaterial.currentStock,
    });
    if (requestedMaterial.currentStock === 0) {
      throw new Error("Current stock 0, cannot supply the materials.");
    } else if (materialRequest.quantity === requestedMaterial.currentStock) {
      materialRequest.status = "supplied";
      requestedMaterial.currentStock = 0;
    } else if (materialRequest.quantity < requestedMaterial.currentStock) {
      materialRequest.status = "supplied";
      requestedMaterial.currentStock =
        requestedMaterial.currentStock - materialRequest.quantity;
      if (requestedMaterial.currentStock < requestedMaterial.lowStockValue)
        requestedMaterial.lowStock = true;
    } else {
      const newQuantity =
        materialRequest.quantity - requestedMaterial.currentStock;
      materialRequest.quantity = requestedMaterial.currentStock;
      requestedMaterial.currentStock = 0;
      requestedMaterial.lowStock = true;
      materialRequest.status = "partially supplied";
      const newMaterialRequest = {
        ...materialRequest.toObject(),
        quantity: newQuantity,
        status: "approved",
      };
      delete newMaterialRequest._id;
      console.log({ newMaterialRequest });
      await Request.create(newMaterialRequest);
    }
    await materialRequest.save();
    await requestedMaterial.save();
    // await Request.findByIdAndUpdate(requestId, { status: "supplied" });

    res.json({ message: "supplied successfully" });
  } catch (error) {
    next(error);
  }
}

async function changeStatusRecieved(req, res, next) {
  const requestId = req.body.requestId;
  const quality = req.body.quality;
  try {
    if (!requestId) throw new Error("Missing Required field: requestId");
    if (!quality) throw new Error("Missing Required field: requestId");
    if (quality === "confirmed")
      await Request.findByIdAndUpdate(requestId, {
        status: "recieved - confirmed quality",
      });
    else
      await Request.findByIdAndUpdate(requestId, {
        status: "recieved - rejected quality",
      });
    res.json({ message: "recieved successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  changeStatusApproved,
  bulkCreateMaterialRequests,
  changeStatusRecieved,
  changeStatusSupplied,
  changeStatusRejected,
  getUserMaterialRequests,
  getAllMaterialsRequests,
  repairMaterialRequest,
};
