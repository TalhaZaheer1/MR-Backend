const router = require("express").Router();
const { protectAdmin, protect, protectPurchasing } = require("../middlewares/auth.js");
const { register, login, getUser, getAllUsers, updateUser, getAllSuppliers, getDashboardStats, registerBulk, adminBackup, registerSupplier } = require("../controllers/user.js");

router.post("/register", protectAdmin, register);
router.post("/register-bulk",protectAdmin,registerBulk);
router.post("/login", login);
router.get("/", protect, getUser);
router.get("/all",protectAdmin,getAllUsers);
router.post("/update/:id",protectAdmin,updateUser);
router.get("/suppliers", protectPurchasing, getAllSuppliers);
router.get("/dashboard",protect,getDashboardStats);
router.get("/backup",protectAdmin,adminBackup)
router.post("/register-supplier",protectPurchasing,registerSupplier)

module.exports = router;
