const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { connectToDb } = require("./src/utils/db.js");
const indexRouter = require("./src/routes/index.js");
const errorHandler = require("./src/utils/errorHandler.js")

const server = express();

server.use(cors());
server.use(express.json());

server.use("/api", indexRouter);
server.use(errorHandler);

server.listen(3000, async () => {
  console.log("Server listening");
  await connectToDb();
});
