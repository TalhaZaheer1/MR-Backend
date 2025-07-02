const router = require("express").Router();
const {getAllDepartments} = require("../controllers/department")

router.get("/",getAllDepartments);

module.exports = router;
