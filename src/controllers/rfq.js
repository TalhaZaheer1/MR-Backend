
const RFQ = require("../models/rfq");

// Create a new quotation
const createQuotation = async (req, res, next) => {
  try {
    const { supplier, dueDate, items, submittedBy } = req.body;

    if (!supplier || !dueDate || !items || !submittedBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newQuotation = await RFQ.create({
      supplier,
      dueDate,
      items,
      submittedBy,
    });

    res.status(201).json({ quotation: newQuotation });
  } catch (error) {
    next(error);
  }
};

const bulkCreateQuotation = async (req, res, next) => {
  try {
    const quotations = req.body.quotations;

    // Validate that we received an array of quotations
    if (!Array.isArray(quotations) || quotations.length === 0) {
      return res.status(400).json({ message: "Invalid input, expecting an array of quotations" });
    }

    // Validate that each quotation has the required fields
    const isValid = quotations.every((quotation) => 
      quotation.supplier && quotation.dueDate && quotation.items && quotation.submittedBy
    );

    if (!isValid) {
      return res.status(400).json({ message: "One or more quotations are missing required fields" });
    }

    // Create multiple quotations in bulk using insertMany for efficiency
    const newQuotations = await RFQ.insertMany(quotations);

    res.status(201).json({ quotations: newQuotations });
  } catch (error) {
    next(error);
  }
};

// Get all quotations created by current user (purchasing)
const getUserQuotations = async (req, res, next) => {
  try {
    const userId = req.userId;

    const quotations = await RFQ.find({ submittedBy: userId })
      .populate("supplier", "username email")
      .sort({ createdAt: -1 });

    res.json({ quotations });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuotation,
  getUserQuotations,
  bulkCreateQuotation
};
