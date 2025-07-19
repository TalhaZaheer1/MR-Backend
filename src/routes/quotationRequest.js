const express = require("express");
const router = express.Router();
const {
  protectPurchasing,
  protectSupplier,
  protectSupplierAndPurchasing,
  protectAdmin,
} = require("../middlewares/auth");
const {
  createQuotationRequest,
  getPurchasingQuotationRequests,
  getSupplierQuotationRequests,
  // getQuotationRequestDetails,
  getAllQuotationRequests,
  closeQuotationRequest,
  addPrice,
  approveQuotationRequestAndCreateDraftPo,
  getQuotationRequestsByMatRequest,
  bulkCreateQuotation,
} = require("../controllers/quotationRequest");

router.post("/", protectPurchasing, createQuotationRequest);
router.post("/add-price",protectSupplierAndPurchasing,addPrice)
router.post("/approve-generate-po",protectPurchasing,approveQuotationRequestAndCreateDraftPo);
router.post("/by-mat-id",protectPurchasing,getQuotationRequestsByMatRequest);
router.post("/bulk",protectPurchasing,bulkCreateQuotation)
router.get("/purchasing", protectPurchasing, getPurchasingQuotationRequests);
router.get("/supplier", protectSupplier, getSupplierQuotationRequests);
// router.get("/details/:id", protectSupplierAndPurchasing, getQuotationRequestDetails);
router.get("/all", protectAdmin, getAllQuotationRequests);
router.get("/close/:id", protectPurchasing, closeQuotationRequest);

module.exports = router;
