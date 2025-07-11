const { Schema, model, default: mongoose } = require("mongoose");

const departmentSchema = new Schema({
  name:{
    type:String,
    required:true
  },
  code:{
    type:String,
    required:true
  },
  latestIndex:Number
});

const DepartmentModel = model("Departments",departmentSchema);

module.exports = DepartmentModel

