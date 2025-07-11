const router = require("express").Router();
const {getAllDepartments, createDepartment, updateDepartment} = require("../controllers/department")
const {protectAdmin} = require("../middlewares/auth")

router.get("/",getAllDepartments);
router.post("/",protectAdmin,createDepartment);
router.post("/update/:id",protectAdmin,updateDepartment)

module.exports = router;
