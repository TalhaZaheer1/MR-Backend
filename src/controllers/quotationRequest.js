const MaterialModel = require("../models/material");
const MaterialRequestModel = require("../models/materialRequest");
const { PurchaseOrderModel } = require("../models/purchaseOrder");
const QuotationRequest = require("../models/quotationRequests");
const mongoose = require("mongoose");

// Create a new quotation
const createQuotationRequest = async (req, res, next) => {
  try {
    const { supplierId, dueDate, pricePerUnit, totalPrice, materialRequestId } =
      req.body;

    if (!supplierId || !dueDate || !materialRequestId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newQuotationRequest = await QuotationRequest.create({
      supplierId,
      dueDate,
      materialRequestId,
      submittedBy: req.userId,
      totalPrice: totalPrice || 0,
      pricePerUnit: pricePerUnit || 0,
    });

    res.status(201).json({ quotationRequest: newQuotationRequest });
  } catch (error) {
    next(error);
  }
};

const bulkCreateQuotation = async (req, res, next) => {
  try {
    const quotations = req.body.quotations;

    // Validate that we received an array of quotations
    if (!Array.isArray(quotations) || quotations.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid input, expecting an array of quotations" });
    }

    // Validate that each quotation has the required fields
    const isValid = quotations.every(
      (quotation) =>
        quotation.supplierId &&
        quotation.dueDate &&
        quotation.submittedBy &&
        quotation.materialRequestId,
    );

    if (!isValid) {
      return res.status(400).json({
        message: "One or more quotations are missing required fields",
      });
    }

    // Add conditional status assignment
    const preparedQuotations = quotations.map((q) => ({
      ...q,
      status:
        q.pricePerUnit > 0 && q.totalPrice > 0 ? "price added" : "pending",
    }));

    const newQuotations = await QuotationRequest.insertMany(preparedQuotations);
    await MaterialRequestModel.findByIdAndUpdate(quotations[0].materialRequestId,{status:"rfq generated"});

    res.status(201).json({ quotations: newQuotations });
  } catch (error) {
    next(error);
  }
};
// const getQuotationRequestDetails = async (req, res, next) => {
//   const quotationRequestId = req.params.id;
//   try {
//     const quotationRequest = await QuotationRequest.aggregate([
//       {
//         $match: {
//           _id: new mongoose.Types.ObjectId(quotationRequestId),
//         },
//       },
//       {
//         $unwind: "$items",
//       },
//       {
//         $lookup: {
//           from: "materials",
//           localField: "items.maximoId",
//           foreignField: "maximoId",
//           as: "items.material",
//         },
//       },
//       {
//         $unwind: { path: "$items.material", preserveNullAndEmptyArrays: true },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "suppliers",
//           foreignField: "_id",
//           as: "suppliersDetails",
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "submittedBy",
//           foreignField: "_id",
//           as: "submittedByDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$submittedByDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $group: {
//           _id: "$_id",
//           date: { $first: "$date" },
//           dueDate: { $first: "$dueDate" },
//           currency: { $first: "$currency" },
//           notes: { $first: "$notes" },
//           status: { $first: "$status" },
//           submittedBy: { $first: "$submittedByDetails" },
//           suppliers: { $first: "$suppliersDetails" },
//           items: { $push: "$items" },
//         },
//       },
//       {
//         $limit: 1,
//       },
//     ]);
//     res.json({ quotationRequest: quotationRequest[0] });
//   } catch (error) {
//     next(error);
//   }
// };
// Get all quotations created by current user (purchasing)
const getPurchasingQuotationRequests = async (req, res, next) => {
  try {
    const purchasingId = req.userId;

    const quotationRequests = await QuotationRequest.find({
      submittedBy: purchasingId,
    })
      .populate("submittedBy", "username email")
      .populate("suppliers", "username email")
      .sort({ createdAt: -1 });

    res.json({ quotationRequests });
  } catch (error) {
    next(error);
  }
};


const getSupplierQuotationRequests = async (req, res, next) => {
  try {
    const supplierId = req.userId;

    const quotationRequests = await QuotationRequest.find({
      supplierId: supplierId,
    })
      .populate("submittedBy", "username email")
      .populate("materialRequestId").populate("supplierId", "username")
      .sort({ createdAt: -1 });

    const materialMaximoIds = quotationRequests.map(
      (qr) => qr.materialRequestId?.materialMaximoId
    );

    const materials = await MaterialModel.find({
      maximoId: { $in: materialMaximoIds },
    });

    const materialMap = {};
    for (const mat of materials) {
      materialMap[mat.maximoId] = mat;
    }

    const enrichedRequests = quotationRequests.map((qr) => ({
      ...qr.toObject(),
      materialDetails: materialMap[qr.materialRequestId?.materialMaximoId] || null,
    }));

    res.json({ quotationRequests: enrichedRequests });
  } catch (error) {
    next(error);
  }
};

const addPrice = async (req, res, next) => {
  const { quotationRequestId, pricePerUnit, totalPrice } = req.body;

  try {
    const result = await QuotationRequest.findByIdAndUpdate(
      quotationRequestId,
      {
        pricePerUnit,
        totalPrice,
        status: "price added",
      },
    );
    console.log({ result });
    res.json({ message: "price added" });
  } catch (error) {
    next(error);
  }
};

const approveQuotationRequestAndCreateDraftPo = async (req, res, next) => {
  const materialRequestId = req.body.materialRequestId;
  const { paymentTerms, expectedDeliveryDate } = req.body;
  try {
    const minPriceQuotation = await QuotationRequest.findOne({
      materialRequestId,
      pricePerUnit: { $gt: 0 },
    })
      .sort({ pricePerUnit: 1 })
      .limit(1);

    const purchaseOrder = await PurchaseOrderModel.create({
      quotationRequestId: minPriceQuotation._id,
      expectedDeliveryDate,
      paymentTerms,
      supplierId: minPriceQuotation.supplierId,
      createdBy: req.userId,
    });

    minPriceQuotation.status = "approved";
    await QuotationRequest.updateMany(
      { materialRequestId, _id: { $ne: minPriceQuotation._id } },
      { status: "closed" },
    );
    await minPriceQuotation.save();
    await MaterialRequestModel.findByIdAndUpdate(materialRequestId, {
      purchaseOrderId: purchaseOrder._id,
      status:"PO generated"
    });
    res.json({ message: "Puchase Order Created" });
  } catch (error) {
    next(error);
  }
};

const getQuotationRequestsByMatRequest = async (req, res, next) => {
  const materialRequestId = req.body.materialRequestId;
  try {
    const requests = await QuotationRequest.find({
      materialRequestId,
    })
      .populate("materialRequestId")
      .populate("supplierId");
    res.json({ quotationRequests: requests });
  } catch (error) {
    next(error);
  }
};

const getAllQuotationRequests = async (req, res, next) => {
  try {
    const quotationRequests = await QuotationRequest.find({})
      .populate("submittedBy", "username email")
      .populate("suppliers", "username email")
      .sort({ createdAt: -1 });

    res.json({ quotationRequests });
  } catch (error) {
    next(error);
  }
};

const closeQuotationRequest = async (req, res, next) => {
  const quotationRequestId = req.params.id;
  try {
    await QuotationRequest.findByIdAndUpdate(quotationRequestId, {
      status: "closed",
    });
    res.json({ message: "Request closed" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuotationRequest,
  getPurchasingQuotationRequests,
  getSupplierQuotationRequests,
  // getQuotationRequestDetails,
  bulkCreateQuotation,
  getAllQuotationRequests,
  closeQuotationRequest,
  addPrice,
  approveQuotationRequestAndCreateDraftPo,
  getQuotationRequestsByMatRequest,
};
