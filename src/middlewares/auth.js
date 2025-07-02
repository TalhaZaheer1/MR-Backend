const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/user");


async function protect(req, res, next) {
  const tokWithbearer = req.headers["authorization"];
  const token = tokWithbearer.split("Bearer ")[1];
  if (!token)
    return res.status(404).json({ message: "User not authenticated" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
}

async function protectDepartment(req, res, next) {
  const tokWithbearer = req.headers["authorization"];
  const token = tokWithbearer.split("Bearer ")[1];
  if (!token)
    return res.status(404).json({ message: "User not authenticated" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId);
    if (!user || (user.role !== "admin" && user.role !== "department"))
      return res.status(404).json({ message: "User not authorized." });
    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(error);
  }
}

async function protectSupplier(req, res, next) {
  const tokWithbearer = req.headers["authorization"];
  const token = tokWithbearer.split("Bearer ")[1];
  if (!token)
    return res.status(404).json({ message: "User not authenticated" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId);
    if (!user || (user.role !== "admin" && user.role !== "supplier"))
      return res.status(404).json({ message: "User not authorized." });
    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(error);
  }
}

async function protectInvoicing(req, res, next) {
  const tokWithbearer = req.headers["authorization"];
  const token = tokWithbearer.split("Bearer ")[1];
  if (!token)
    return res.status(404).json({ message: "User not authenticated" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId);
    if (!user || (user.role !== "admin" && user.role !== "invoicing"))
      return res.status(404).json({ message: "User not authorized." });
    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(error);
  }
}

async function protectPurchasing(req, res, next) {
  const tokWithbearer = req.headers["authorization"];
  const token = tokWithbearer.split("Bearer ")[1];
  if (!token)
    return res.status(404).json({ message: "User not authenticated" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId);
    if (!user || user.role !== "purchasing")
      return res.status(404).json({ message: "User not authorized." });
    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(error);
  }
}

async function protectStore(req, res, next) {
  const tokWithbearer = req.headers["authorization"];
  const token = tokWithbearer.split("Bearer ")[1];
  if (!token)
    return res.status(404).json({ message: "User not authenticated" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId);
    if (!user || (user.role !== "admin" && user.role !== "store"))
      return res.status(404).json({ message: "User not authorized." });
    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(error);
  }
}

async function protectAdminAndPurchasing(req, res, next) {
  const tokWithbearer = req.headers["authorization"];
  const token = tokWithbearer.split("Bearer ")[1];
  if (!token)
    return res.status(404).json({ message: "User not authenticated" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId);
    if (!user || (user.role !== "admin" && user.role !== "purchasing"))
      return res.status(404).json({ message: "User not authorized." });
    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(error);
  }
}

async function protectAdmin(req, res, next) {
  const tokWithbearer = req.headers["authorization"];
  const token = tokWithbearer.split("Bearer ")[1];
  if (!token)
    return res.status(404).json({ message: "User not authenticated" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId);
    if (!user || user.role !== "admin")
      return res.status(404).json({ message: "User not authorized." });
    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  protect,
  protectAdmin,
  protectDepartment,
  protectStore,
  protectSupplier,
  protectInvoicing,
  protectPurchasing,
  protectAdminAndPurchasing
};
