const { default: mongoose } = require("mongoose");
const { PurchaseOrderModel } = require("../models/purchaseOrder");
const MaterialModel = require("../models/material");
const MaterialRequestModel = require("../models/materialRequest");

async function sendPurchaseOrder(req, res, next) {
  const purchaseOrderId = req.body.purchaseOrderId;
  const updates = req.body.updates;
  try {
    if (!purchaseOrderId) throw new Error("Purchase order id required");
    await PurchaseOrderModel.findByIdAndUpdate(purchaseOrderId, {
      status: "pending",
      ...updates,
    });
    res.json({ message: "Purchase order sent" });
  } catch (error) {
    next(error);
  }
}

async function getPOByMatReqId(req, res, next) {
  const { materialRequestId } = req.params;

  try {
    if (!materialRequestId) {
      return res.status(400).json({ message: "materialRequestId is required" });
    }

    // Fetch the material request
    const materialRequest =
      await MaterialRequestModel.findById(materialRequestId);
    if (!materialRequest) {
      return res.status(404).json({ message: "Material Request not found" });
    }

    const purchaseOrderId = materialRequest.purchaseOrderId;
    if (!purchaseOrderId) {
      return res
        .status(404)
        .json({ message: "No Purchase Order linked to this material request" });
    }

    // Fetch the Purchase Order with nested population
    const purchaseOrder = await PurchaseOrderModel.findById(purchaseOrderId)
      .populate({
        path: "quotationRequestId",
        model: "QuotationRequests",
        select: "pricePerUnit totalPrice",
      })
      .populate({
        path: "supplierId",
        model: "Users",
        select: "username email",
      })
      .lean();

    if (!purchaseOrder) {
      return res.status(404).json({ message: "Purchase Order not found" });
    }

    console.log({ purchaseOrder });

    // Fetch material details
    const material = await MaterialModel.findOne({
      maximoId: materialRequest.materialMaximoId,
    });

    return res.json({
      materialRequest,
      ...purchaseOrder,
      material,
    });
  } catch (error) {
    next(error);
  }
}

async function getAllPos(req, res, next) {
  try {
    const purchaseOrders = await PurchaseOrderModel.find({})
      .populate({
        path: "quotationRequestId",
        model: "QuotationRequests",
        populate: {
          path: "materialRequestId",
          model: "MaterialRequests",
        },
      })
      .populate("createdBy", "username")
      .populate("supplierId", "username")
      .lean();

    // Collect all materialMaximoIds
    const maximoIds = purchaseOrders
      .map((po) => po.quotationRequestId?.materialRequestId?.materialMaximoId)
      .filter(Boolean);

    // Fetch materials in one query
    const materials = await MaterialModel.find({
      maximoId: { $in: maximoIds },
    }).lean();

    // Create lookup map
    const materialMap = {};
    materials.forEach((mat) => {
      materialMap[mat.maximoId] = mat;
    });

    // Attach materialDetails to each PO
    const enrichedPOs = purchaseOrders.map((po) => {
      const matReq = po.quotationRequestId?.materialRequestId;
      const material = matReq ? materialMap[matReq.materialMaximoId] : null;

      return {
        ...po,
        materialDetails: material
          ? {
            maximoId: material.maximoId,
            materialName: material.description,
            description: matReq?.description,
            quantity: matReq?.quantity,
            unit: material.unit,
          }
          : null,
      };
    });

    res.json({ purchaseOrders: enrichedPOs });
  } catch (error) {
    next(error);
  }
}

async function getPurchasingPurchaseOrders(req, res, next) {
   try {
    const purchaseOrders = await PurchaseOrderModel.find({
      createdBy: req.userId,
    })
      .populate({
        path: "quotationRequestId",
        model: "QuotationRequests",
        populate: {
          path: "materialRequestId",
          model: "MaterialRequests",
        },
      })
      .populate("createdBy", "username")
      .populate("supplierId", "username")
      .lean();

    // Collect all materialMaximoIds
    const maximoIds = purchaseOrders
      .map((po) => po.quotationRequestId?.materialRequestId?.materialMaximoId)
      .filter(Boolean);

    // Fetch materials in one query
    const materials = await MaterialModel.find({
      maximoId: { $in: maximoIds },
    }).lean();

    // Create lookup map
    const materialMap = {};
    materials.forEach((mat) => {
      materialMap[mat.maximoId] = mat;
    });

    // Attach materialDetails to each PO
    const enrichedPOs = purchaseOrders.map((po) => {
      const matReq = po.quotationRequestId?.materialRequestId;
      const material = matReq ? materialMap[matReq.materialMaximoId] : null;

      return {
        ...po,
        materialDetails: material
          ? {
            maximoId: material.maximoId,
            materialName: material.description,
            description: matReq?.description,
            quantity: matReq?.quantity,
            unit: material.unit,
          }
          : null,
      };
    });

    res.json({ purchaseOrders: enrichedPOs });
  } catch (error) {
    next(error);
  }
}

// For getSupplierPurchaseOrders

async function getSupplierPurchaseOrders(req, res, next) {
  try {
    const purchaseOrders = await PurchaseOrderModel.find({
      supplierId: req.userId,
    })
      .populate({
        path: "quotationRequestId",
        model: "QuotationRequests",
        populate: {
          path: "materialRequestId",
          model: "MaterialRequests",
        },
      })
      .populate("createdBy", "username")
      .populate("supplierId", "username")
      .lean();

    // Collect all materialMaximoIds
    const maximoIds = purchaseOrders
      .map((po) => po.quotationRequestId?.materialRequestId?.materialMaximoId)
      .filter(Boolean);

    // Fetch materials in one query
    const materials = await MaterialModel.find({
      maximoId: { $in: maximoIds },
    }).lean();

    // Create lookup map
    const materialMap = {};
    materials.forEach((mat) => {
      materialMap[mat.maximoId] = mat;
    });

    // Attach materialDetails to each PO
    const enrichedPOs = purchaseOrders.map((po) => {
      const matReq = po.quotationRequestId?.materialRequestId;
      const material = matReq ? materialMap[matReq.materialMaximoId] : null;

      return {
        ...po,
        materialDetails: material
          ? {
            maximoId: material.maximoId,
            materialName: material.description,
            description: matReq?.description,
            quantity: matReq?.quantity,
            unit: material.unit,
          }
          : null,
      };
    });

    res.json({ purchaseOrders: enrichedPOs });
  } catch (error) {
    next(error);
  }
}

// For getAllRecievedPOs
async function getAllRecievedPOs(req, res, next) {
  try {
    const pos = await PurchaseOrderModel.aggregate([
      {
        $match: { status: "recieved" }, // Match only the received POs
      },
      {
        $lookup: {
          from: "quotations", // Lookup in the Quotations collection
          localField: "quotationId", // The field in PurchaseOrders to match
          foreignField: "_id", // The field in Quotations to match
          as: "quotationDetails", // Store the matched quotations in a new field
        },
      },
      {
        $unwind: {
          path: "$quotationDetails", // Unwind the quotation details (since it's an array)
          preserveNullAndEmptyArrays: true, // Allow empty quotes
        },
      },
      {
        $unwind: {
          path: "$quotationDetails.items", // Unwind the items array in the quotation
          preserveNullAndEmptyArrays: true, // Allow empty items
        },
      },
      {
        $lookup: {
          from: "materials", // Lookup in the Materials collection
          localField: "quotationDetails.items.maximoId", // Match maximoId in items
          foreignField: "maximoId", // Match the maximoId field in Materials collection
          as: "itemDetails", // Store the matched materials in a new field
        },
      },
      {
        $unwind: {
          path: "$itemDetails", // Unwind the item details
          preserveNullAndEmptyArrays: true, // Allow items with no match in the materials collection
        },
      },
      {
        $lookup: {
          from: "users", // Lookup in the Users collection for supplier details
          localField: "supplierId", // The field in PurchaseOrders to match supplierId
          foreignField: "_id", // The field in Users to match
          as: "supplierDetails", // Store the matched supplier data
        },
      },
      {
        $unwind: {
          path: "$supplierDetails", // Unwind supplier details so we can access them
          preserveNullAndEmptyArrays: true, // Allow cases where supplier details may be missing
        },
      },
      {
        $group: {
          _id: "$_id", // Group by Purchase Order _id to avoid duplication
          supplierId: { $first: "$supplierId" },
          quotationId: { $first: "$quotationId" },
          paymentTerms: { $first: "$paymentTerms" },
          expectedDeliveryDate: { $first: "$expectedDeliveryDate" },
          status: { $first: "$status" },
          partiallyDeliveredItems: { $first: "$partiallyDeliveredItems" },
          rejectReason: { $first: "$rejectReason" },
          createdBy: { $first: "$createdBy" },
          createdAt: { $first: "$createdAt" },
          deliveryDate: { $first: "$deliveryDate" },
          recievedDate: { $first: "$recievedDate" },
          totalAmount: { $first: "$totalAmount" },
          items: {
            $push: {
              materialName: "$itemDetails.description",
              maximoId: "$itemDetails.maximoId",
              pricePerUnit: "$quotationDetails.items.pricePerUnit", // Include pricePerUnit
              quantity: "$quotationDetails.items.quantity",
              totalAmount: {
                $multiply: [
                  "$quotationDetails.items.pricePerUnit",
                  "$quotationDetails.items.quantity",
                ], // Calculate totalAmount (pricePerUnit * quantity)
              },
            },
          },
          supplierUsername: { $first: "$supplierDetails.username" }, // Collect the supplier username
        },
      },
      {
        $project: {
          supplierId: 1,
          quotationId: 1,
          paymentTerms: 1,
          expectedDeliveryDate: 1,
          status: 1,
          partiallyDeliveredItems: 1,
          rejectReason: 1,
          createdBy: 1,
          createdAt: 1,
          deliveryDate: 1,
          recievedDate: 1,
          items: 1, // Now we have the items grouped back into an array with pricePerUnit and totalAmount
          supplierUsername: 1, // Supplier username
          totalAmount: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
          deliveryDate: -1,
          recievedDate: -1,
        },
      },
    ]);

    res.json({ purchaseOrders: pos });
  } catch (error) {
    next(error);
  }
}

async function changeStatusPartiallyDelivered(req, res, next) {
  const { purchaseOrderId, items } = req.body;
  try {
    if (!Array.isArray(items)) throw new Error("items must be an array");
    await PurchaseOrderModel.findByIdAndUpdate(purchaseOrderId, {
      status: "partially dispatched",
      partiallyDeliveredItems: items,
      deliveryDate: Date.now(),
      totalAmount: items.reduce((sum, item) => {
        return sum + item.totalAmount;
      }, 0),
    });
    res.json({ message: "Purchase Order status changed successfully" });
  } catch (error) {
    next(error);
  }
}

async function changeStatusRejected(req, res, next) {
  const { purchaseOrderId, reason } = req.body;
  try {
    if (!purchaseOrderId) throw new Error("Purchase order ID required");
    const purchaseOrder = await PurchaseOrderModel.findByIdAndUpdate(
      purchaseOrderId,
      {
        status: "rejected",
        reason: reason || "",
      },
    ).populate("quotationRequestId");
    console.log({ purchaseOrder });
    await MaterialRequestModel.findByIdAndUpdate(
      { _id: purchaseOrder.quotationRequestId.materialRequestId },
      { status: "dispatch rejected", reason: reason || "" },
    );
    res.json({ message: "Purchase order rejected" });
  } catch (error) {
    next(error);
  }
}

async function changeStatus(req, res, next) {
  const { purchaseOrderId, status } = req.body;
  try {
    if (!purchaseOrderId || !status)
      throw new Error("Missing required fields.");

    if (status === "dispatched") {
      // If status is 'dispatched', set the delivery date
      const purchaseOrder = await PurchaseOrderModel.findByIdAndUpdate(
        purchaseOrderId,
        {
          status,
          deliveryDate: Date.now(),
        },
      ).populate("quotationRequestId");
      await MaterialRequestModel.findByIdAndUpdate(
        { _id: purchaseOrder.quotationRequestId.materialRequestId },
        { status: "dispatched" },
      );
    } else {
      // For other status changes, update the status field
      await PurchaseOrderModel.findByIdAndUpdate(purchaseOrderId, { status });
    }

    res.json({ message: "PO status changed" });
  } catch (error) {
    next(error);
  }
}
module.exports = {
  getPurchasingPurchaseOrders,
  changeStatus,
  changeStatusRejected,
  changeStatusPartiallyDelivered,
  getSupplierPurchaseOrders,
  getAllRecievedPOs,
  getAllPos,
  sendPurchaseOrder,
  getPOByMatReqId,
};
