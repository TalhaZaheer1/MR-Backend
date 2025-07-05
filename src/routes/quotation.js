const express = require("express");
const router = express.Router();
const { protectPurchasing, protectSupplier, protectAdmin } = require("../middlewares/auth");
const {
  createQuotation,
  getQuotations,
  getSupplierQuotations,
  approveQuotation,
  rejectQuotation,
  getAllQuotations,
} = require("../controllers/quotation");

router.post("/", protectSupplier, createQuotation);
// router.post("/bulk",protectPurchasing,bulkCreateQuotation)
router.get("/",protectAdmin,getAllQuotations)
router.get("/purchasing/:id", protectPurchasing, getQuotations);
router.get("/supplier", protectSupplier, getSupplierQuotations);
router.post("/approve", protectPurchasing, approveQuotation);
router.post("/reject", protectPurchasing, rejectQuotation);

module.exports = router;
