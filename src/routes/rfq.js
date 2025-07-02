const express = require("express");
const router = express.Router();
const {
  createQuotation,
  getUserQuotations,
  bulkCreateQuotation,
} = require("../controllers/rfq");
const { protectPurchasing } = require("../middlewares/auth");

router.post("/",protectPurchasing, createQuotation);
router.post("/bulk",protectPurchasing,bulkCreateQuotation)
router.get("/my", protectPurchasing, getUserQuotations);

module.exports = router;
