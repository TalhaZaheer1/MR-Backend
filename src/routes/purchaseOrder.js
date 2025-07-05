const {
  getPurchasingPurchaseOrders,
  getSupplierPurchaseOrders,
  changeStatusRejected,
  changeStatusPartiallyDelivered,
  changeStatus,
  getAllRecievedPOs,
  getAllQuotations,
} = require("../controllers/purchaseOrder");
const { protectPurchasing, protectSupplier, protectSupplierAndPurchasing, protectStoreAndInvoicing, protectAdmin } = require("../middlewares/auth");

const router = require("express").Router();

router.get("/",protectAdmin,getAllQuotations);
router.get("/purchasing", protectPurchasing, getPurchasingPurchaseOrders);
router.get("/supplier", protectSupplier, getSupplierPurchaseOrders);
router.post("/reject-delivery",protectSupplier,changeStatusRejected);
router.post("/partially-deliver",protectSupplier,changeStatusPartiallyDelivered); 
router.post("/change-status",protectSupplierAndPurchasing,changeStatus);
router.get("/recieved",protectStoreAndInvoicing,getAllRecievedPOs)

module.exports = router;

