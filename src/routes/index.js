const indexRouter = require("express").Router();
const userRouter = require("./user.js");
const requestRouter = require("./materialRequest.js")
const departmentRouter = require("./department.js")
const materialRouter = require("./material.js")
const rfqRouter = require("./rfq.js")
const notificationRouter = require("./notification.js")

indexRouter.use("/user",userRouter);
indexRouter.use("/request",requestRouter);
indexRouter.use("/department",departmentRouter);
indexRouter.use("/material",materialRouter);
indexRouter.use("/rfq",rfqRouter);
indexRouter.use("/notification",notificationRouter);

module.exports = indexRouter;
