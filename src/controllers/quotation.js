const { default: mongoose } = require("mongoose");
const { PurchaseOrderModel } = require("../models/purchaseOrder");
const Quotation = require("../models/quotation");
const { sendEmail } = require("../utils/email");
const {
  generatePurchaseOrderEmailTemplate,
} = require("../utils/emailTemplates");
const { createNotification } = require("./notification");

async function createQuotation(req, res, next) {
  const { quotationRequestId, items } = req.body;
  try {
    if (!quotationRequestId || !items)
      throw new Error("Missing required fields");
    const payload = {
      quotationRequestId,
      items,
      supplierId: req.userId,
    };
    const quotation = await Quotation.create(payload);
    res.json({ quotation });
  } catch (error) {
    next(error);
  }
}

async function getAllQuotations(req, res, next) {
  try {
    const quotations = await Quotation.find({}).populate(
      "supplierId",
      "username",
    );
    res.json({ quotations });
  } catch (error) {
    next(error);
  }
}

async function getQuotations(req, res, next) {
  const quotationRequestId = req.params.id;
  try {
    if (!quotationRequestId) throw new Error("Quotation Request ID required");
    const quotations = await Quotation.find({ quotationRequestId }).populate(
      "supplierId",
      "username email",
    );
    res.json({ quotations });
  } catch (error) {
    next(error);
  }
}

async function approveQuotation(req, res, next) {
  const { quotationId, expectedDeliveryDate, paymentTerms } = req.body;
  try {
    const quotationAggregation = await Quotation.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId("686925e37c8b319e9dca729d"),
        },
      },
      {
        $unwind: "$items",
      },
      {
        $lookup: {
          from: "materials", // Lookup in the Quotations collection
          localField: "items.maximoId", // The field in PurchaseOrders to match
          foreignField: "maximoId", // The field in Quotations to match
          as: "items.material", // Store the matched quotations in a new field
        },
      },
      {
        $unwind: { path: "$items.material", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "supplierId",
          foreignField: "_id",
          as: "supplierDetails",
        },
      },
      {
        $unwind: { path: "$supplierDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: "$_id",
          supplierDetails: { $first: "$supplierDetails" },
          items: { $push: "$items" },
        },
      },
      {
        $limit: 1,
      },
    ]);
    const quotation = quotationAggregation[0];
    await Quotation.findByIdAndUpdate(quotationId, {
      status: "approved",
    });

    console.log({ quotation });

    const payload = {
      quotationId,
      expectedDeliveryDate,
      paymentTerms,
      createdBy: req.userId,
      supplierId: quotation.supplierDetails._id,
      totalAmount: quotation.items.reduce(
        (sum, item) => sum + item.totalPrice,
        0,
      ),
    };

    const purchaseOrder = await PurchaseOrderModel.create(payload);

    const emailContent = generatePurchaseOrderEmailTemplate({
      ...purchaseOrder.toObject(),
      items: quotation.items,
      supplierUsername: quotation.supplierDetails.username,
    });

    // Send the email to the supplier
    await sendEmail(
      quotation.supplierDetails.email, // Supplier's email address
      "Purchase Order Created", // Subject
      emailContent, // Email body (HTML)
    );

    await createNotification(
      "Quotation Approved And PO Created!",
      quotation.supplierDetails._id,
      `Quotation Id: ${quotation._id}\n Purchase Order Id: ${purchaseOrder._id}`,
    );
    res.json({ purchaseOrder });
  } catch (error) {
    next(error);
  }
}

async function rejectQuotation(req, res, next) {
  const { quotationId, reason } = req.body;
  try {
    if (!quotationId || !reason) throw new Error("Missing required fields");
    const quotation = await Quotation.findByIdAndUpdate(quotationId, {
      status: "rejected",
      rejectionReason: reason,
    });
    console.log(req.body);
    console.log("chala");
    console.log({ quotation });
    res.json({ message: "Quotation rejected successfully" });
  } catch (error) {
    next(error);
  }
}

async function getSupplierQuotations(req, res, next) {
  try {
    const quotations = await Quotation.find({
      supplierId: req.userId,
    }).populate("supplierId", "username");
    res.json({ quotations });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createQuotation,
  getQuotations,
  approveQuotation,
  rejectQuotation,
  getSupplierQuotations,
  getAllQuotations,
};
