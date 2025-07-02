const router = require("express").Router();
const {  protectAdminAndPurchasing, protectDepartment, protect } = require("../middlewares/auth.js");
const {
  changeStatusApproved,
  bulkCreateMaterialRequests,
  changeStatusRecieved,
  changeStatusSupplied,
  changeStatusRejected,
  getAllMaterialsRequests,
  getUserMaterialRequests,
  repairMaterialRequest
} = require("../controllers/materialRequest.js");

router.get("/",protect,getAllMaterialsRequests);
router.get("/mine",protect,getUserMaterialRequests);
router.post("/bulk-add",bulkCreateMaterialRequests);
router.post("/approve-request",protectAdminAndPurchasing,changeStatusApproved);
router.post("/reject-request",protectAdminAndPurchasing,changeStatusRejected);
router.post("/recieve-request",protectDepartment,changeStatusRecieved);
router.post("/supply-request",protectAdminAndPurchasing,changeStatusSupplied);
router.post("/repair",protect,repairMaterialRequest)


module.exports = router
