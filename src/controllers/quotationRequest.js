const QuotationRequest = require("../models/quotationRequests");
const mongoose = require("mongoose");

// Create a new quotation
const createQuotationRequest = async (req, res, next) => {
  try {
    const { suppliers, dueDate, items, submittedBy } = req.body;

    if (!suppliers || !dueDate || !items || !submittedBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newQuotationRequest = await QuotationRequest.create({
      suppliers,
      dueDate,
      items,
      submittedBy,
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
        quotation.supplier &&
        quotation.dueDate &&
        quotation.items &&
        quotation.submittedBy,
    );

    if (!isValid) {
      return res.status(400).json({
        message: "One or more quotations are missing required fields",
      });
    }

    // Create multiple quotations in bulk using insertMany for efficiency
    const newQuotations = await QuotationRequest.insertMany(quotations);

    res.status(201).json({ quotations: newQuotations });
  } catch (error) {
    next(error);
  }
};

const getQuotationRequestDetails = async (req, res, next) => {
  const quotationRequestId = req.params.id;
  try {
    const quotationRequest = await QuotationRequest.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(quotationRequestId),
        },
      },
      {
        $unwind: "$items",
      },
      {
        $lookup: {
          from: "materials",
          localField: "items.maximoId",
          foreignField: "maximoId",
          as: "items.material",
        },
      },
      {
        $unwind: { path: "$items.material", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "suppliers",
          foreignField: "_id",
          as: "suppliersDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "submittedBy",
          foreignField: "_id",
          as: "submittedByDetails",
        },
      },
      {
        $unwind: {
          path: "$submittedByDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          date: { $first: "$date" },
          dueDate: { $first: "$dueDate" },
          currency: { $first: "$currency" },
          notes: { $first: "$notes" },
          status: { $first: "$status" },
          submittedBy: { $first: "$submittedByDetails" },
          suppliers: { $first: "$suppliersDetails" },
          items: { $push: "$items" },
        },
      },
      {
        $limit: 1,
      },
    ]);
    res.json({ quotationRequest: quotationRequest[0] });
  } catch (error) {
    next(error);
  }
};
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

    const quotationRequests = await QuotationRequest.find(
      { suppliers: supplierId, status: "active" },
      { suppliers: 0 },
    )
      .populate("submittedBy", "username email")
      .sort({ createdAt: -1 });

    res.json({ quotationRequests });
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
  getQuotationRequestDetails,
  bulkCreateQuotation,
  getAllQuotationRequests,
  closeQuotationRequest,
};
