const { default: mongoose } = require("mongoose");
const { PurchaseOrderModel } = require("../models/purchaseOrder");
const MaterialModel = require("../models/material");

async function getAllQuotations(req, res, next) {
  try {
    const purchaseOrders = await PurchaseOrderModel.aggregate([
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
          localField: "supplierId", // Match the supplierId field in PurchaseOrders
          foreignField: "_id", // Match the _id field in the Users collection
          as: "supplierDetails", // Store the matched supplier details
        },
      },
      {
        $unwind: {
          path: "$supplierDetails", // Unwind the supplier details
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
          items: 1, // Now we have the items grouped back into an array
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

    res.json({ purchaseOrders });
  } catch (error) {
    next(error);
  }
}

async function getPurchasingPurchaseOrders(req, res, next) {
  try {
    const purchaseOrders = await PurchaseOrderModel.aggregate([
      {
        $match: { createdBy: new mongoose.Types.ObjectId(req.userId) }, // Match the purchase orders created by the user
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
          localField: "supplierId", // Match the supplierId field in PurchaseOrders
          foreignField: "_id", // Match the _id field in the Users collection
          as: "supplierDetails", // Store the matched supplier details
        },
      },
      {
        $unwind: {
          path: "$supplierDetails", // Unwind the supplier details
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
          items: 1, // Now we have the items grouped back into an array
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

    res.json({ purchaseOrders });
  } catch (error) {
    next(error);
  }
}

// For getSupplierPurchaseOrders
async function getSupplierPurchaseOrders(req, res, next) {
  try {
    const pos = await PurchaseOrderModel.aggregate([
      {
        $match: { supplierId: new mongoose.Types.ObjectId(req.userId) },
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
    await PurchaseOrderModel.findByIdAndUpdate(purchaseOrderId, {
      status: "dispatching rejected",
      reason: reason || "",
    });
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
      await PurchaseOrderModel.findByIdAndUpdate(purchaseOrderId, {
        status,
        deliveryDate: Date.now(),
      });
    } else if (status === "recieved") {
      // const purchaseOrders = await PurchaseOrderModel.aggregate([
      //   {
      //     $match: { _id: new mongoose.Types.ObjectId(purchaseOrderId) }, // Match the purchase order ID
      //   },
      //   {
      //     $lookup: {
      //       from: "quotations", // Lookup in the Quotations collection
      //       localField: "quotationId", // Field in PurchaseOrder to match
      //       foreignField: "_id", // Field in Quotation to match
      //       as: "quotationDetails", // Store result in "quotationDetails"
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: "$quotationDetails", // Unwind the array to access the first element
      //       preserveNullAndEmptyArrays: true, // Allow empty quotes
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: "$quotationDetails.items", // Unwind the items array in the quotation
      //       preserveNullAndEmptyArrays: true, // Allow empty items
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: "$_id", // Group by Purchase Order _id to avoid duplication
      //       supplierId: { $first: "$supplierId" },
      //       quotationId: { $first: "$quotationId" },
      //       paymentTerms: { $first: "$paymentTerms" },
      //       expectedDeliveryDate: { $first: "$expectedDeliveryDate" },
      //       status: { $first: "$status" },
      //       partiallyDeliveredItems: { $first: "$partiallyDeliveredItems" },
      //       rejectReason: { $first: "$rejectReason" },
      //       createdBy: { $first: "$createdBy" },
      //       createdAt: { $first: "$createdAt" },
      //       deliveryDate: { $first: "$deliveryDate" },
      //       recievedDate: { $first: "$recievedDate" },
      //       totalAmount: { $first: "$totalAmount" },
      //       items: {
      //         $push: {
      //           maximoId: "$quotationDetails.items.maximoId",
      //           pricePerUnit: "$quotationDetails.items.pricePerUnit",
      //           quantity: "$quotationDetails.items.quantity",
      //           totalAmount: {
      //             $multiply: [
      //               "$quotationDetails.items.pricePerUnit",
      //               "$quotationDetails.items.quantity",
      //             ], // Calculate totalAmount (pricePerUnit * quantity)
      //           },
      //         },
      //       },
      //     },
      //   },
      //   {
      //     $project: {
      //       status: 1,
      //       partiallyDeliveredItems: 1,
      //       items: 1,
      //     },
      //   },
      //   { $limit: 1 },
      // ]);
      //
      // if (purchaseOrders.length <= 0)
      //   throw new Error("No purchase order found with this ID");
      //
      // const po = purchaseOrders[0];
      const updates = {
        status,
        recievedDate: Date.now(), // Set the received date
      };
      //
      // // If the purchase order is partially dispatched, update materials based on the delivered items
      // if (
      //   po.status === "partially dispatched" &&
      //   po.partiallyDeliveredItems.length > 0
      // ) {
      //   po.partiallyDeliveredItems.forEach(async (item) => {
      //     await MaterialModel.findOneAndUpdate(
      //       { maximoId: item.maximoId },
      //       { $inc: { quantity: item.quantity } },
      //     );
      //   });
      // } else if (po.status === "dispatched" && po.items.length > 0) {
      //   // If the purchase order is fully dispatched, update materials based on the ordered items
      //   po.items.forEach(async (item) => {
      //     await MaterialModel.findOneAndUpdate(
      //       { maximoId: item.maximoId },
      //       { $inc: { quantity: item.quantity } },
      //     );
      //   });
      // } else {
      //   throw new Error("Cannot change status to 'recieved' at this point.");
      // }
      //
      // Ensure the status is updated in the database
      await PurchaseOrderModel.findByIdAndUpdate(purchaseOrderId, updates);
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
  getAllQuotations,
};
