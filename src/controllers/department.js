const Department = require("../models/departments.js");

async function getAllDepartments(req, res, next) {
  try {
    const departments = await Department.find({});
    res.json({ departments });
  } catch (error) {
    next(error);
  }
}

async function createDepartment(req, res, next) {
  const { name, code } = req.body;
  try {
    const newDepartment = await Department.create({ name, code });
    res.json({ newDepartment });
  } catch (error) {
    next(error);
  }
}

async function updateDepartment(req, res, next) {
  const departmentId = req.params.id;
  const updates = req.body;
  try {
    const department = await Department.findByIdAndUpdate(departmentId, updates,{new:true});
    res.json({ department });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllDepartments,
  createDepartment,
  updateDepartment
};
