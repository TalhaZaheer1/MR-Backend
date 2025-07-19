const router = require("express").Router();
const {  protectAdminAndPurchasing, protectDepartment, protect, protectStore, protectPurchasing, protectStoreAndInvoicing, protectStoreAndPurchasing } = require("../middlewares/auth.js");
const {
  changeStatusApproved,
  bulkCreateMaterialRequests,
  changeStatusRecieved,
  changeStatusRejected,
  getAllMaterialsRequests,
  getUserMaterialRequests,
  repairMaterialRequest,
  bulkCreateFromFile,
  changeStatusReserved,
  changeStatusDeliveryConfirmed,
  changeStatusDeliveryRejected,
  getStoreRequests,
  getMaterialRequestById
} = require("../controllers/materialRequest.js");

router.get("/",protect,getAllMaterialsRequests);
router.get("/by-id/:id",protectPurchasing, getMaterialRequestById);
router.get("/mine",protect,getUserMaterialRequests);
router.get("/store",protectStore,getStoreRequests);
router.post("/bulk-add",protectDepartment,bulkCreateMaterialRequests);
router.post("/bulk-from-file",protectDepartment,bulkCreateFromFile)
router.post("/approve-request",protectAdminAndPurchasing,changeStatusApproved);
router.post("/reject-request",protectStoreAndPurchasing,changeStatusRejected);
router.post("/recieve-request",protectDepartment,changeStatusRecieved);
router.post("/repair",protect,repairMaterialRequest)
router.post("/reserve-request",protectStore,changeStatusReserved);
router.post("/delivery-confirmed",protectStore,changeStatusDeliveryConfirmed);
router.post("/delivery-rejected",protectStore,changeStatusDeliveryRejected);


module.exports = router
