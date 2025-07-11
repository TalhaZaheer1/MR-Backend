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
  repairMaterialRequest,
  bulkCreateFromFile
} = require("../controllers/materialRequest.js");

router.get("/",protect,getAllMaterialsRequests);
router.get("/mine",protect,getUserMaterialRequests);
router.post("/bulk-add",protectDepartment,bulkCreateMaterialRequests);
router.post("/bulk-from-file",protectDepartment,bulkCreateFromFile)
router.post("/approve-request",protectAdminAndPurchasing,changeStatusApproved);
router.post("/reject-request",protectAdminAndPurchasing,changeStatusRejected);
router.post("/recieve-request",protectDepartment,changeStatusRecieved);
router.post("/supply-request",protectAdminAndPurchasing,changeStatusSupplied);
router.post("/repair",protect,repairMaterialRequest)


module.exports = router
