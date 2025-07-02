const Department = require("../models/departments.js");


async function getAllDepartments(req,res,next){
  try{
    const departments = await Department.find({});
    res.json({departments});
  }catch(error){
    next(error)
  }
}

module.exports = {
  getAllDepartments
}
