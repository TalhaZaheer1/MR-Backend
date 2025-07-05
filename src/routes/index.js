const indexRouter = require("express").Router();
const userRouter = require("./user.js");
const requestRouter = require("./materialRequest.js");
const departmentRouter = require("./department.js");
const materialRouter = require("./material.js");
const quotationRequestRouter = require("./quotationRequest.js");
const quotationRouter = require("./quotation.js");
const purchaseOrderRouter = require("./purchaseOrder.js");
const notificationRouter = require("./notification.js");

indexRouter.use("/user", userRouter);
indexRouter.use("/request", requestRouter);
indexRouter.use("/department", departmentRouter);
indexRouter.use("/material", materialRouter);
indexRouter.use("/quotation", quotationRouter);
indexRouter.use("/notification", notificationRouter);
indexRouter.use("/quotation-request",quotationRequestRouter);
indexRouter.use("/po",purchaseOrderRouter);

module.exports = indexRouter;
