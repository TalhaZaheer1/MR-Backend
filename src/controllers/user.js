const { UserModel } = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const MaterialRequestModel = require("../models/materialRequest");
const MaterialModel = require("../models/material");
const QuotationRequestModel = require("../models/quotationRequests");
const QuotationModel = require("../models/quotation");
const { PurchaseOrderModel } = require("../models/purchaseOrder");
const fs = require("fs-extra");
const path = require("path");
const json2csv = require("json2csv");
const { exec } = require("child_process"); // For MongoDB dump command
const { promisify } = require("util");
const mongoose = require("mongoose");
require("dotenv");

const execPromise = promisify(exec);

async function getUser(req, res, next) {
  try {
    const user = await UserModel.findById(req.userId);
    user.password = "";
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const userId = req.params.id;

    const updates = { ...req.body };

    // Prevent password update via this route
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    //
    // // Optional: Prevent role change unless admin is updating
    // if (updates.role && req.userRole !== "admin") {
    //   return res.status(403).json({ message: "Only admin can change roles." });
    // }

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select("-password"); // Exclude password from result

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ user: updatedUser });
  } catch (error) {
    next(error);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const users = await UserModel.find({ role: { $ne: "admin" } }).populate(
      "department",
    );
    res.json({ users });
  } catch (error) {
    next(error);
  }
}

async function register(req, res, next) {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) throw new Error("Field missing.");
    console.log({ body: req.body });
    const hashedPass = await bcrypt.hash(password, 10);
    const userWithUsername = await UserModel.findOne({ username });
    if (userWithUsername)
      throw new Error("User with this username already exists.");
    const userWithEmail = await UserModel.findOne({ email });
    if (userWithEmail) throw new Error("User with this email already exists.");
    const newUser = await UserModel.create({
      ...req.body,
      password: hashedPass,
    });
    newUser.password = "";
    return res.json({ user: newUser });
  } catch (error) {
    next(error);
  }
}

async function registerSupplier(req, res, next) {
  const { username, email } = req.body;
  try {
    if (!username || !email) throw new Error("Field missing.");
    console.log({ body: req.body });
    const userWithUsername = await UserModel.findOne({ username });
    if (userWithUsername)
      throw new Error("User with this username already exists.");
    const userWithEmail = await UserModel.findOne({ email });
    if (userWithEmail) throw new Error("User with this email already exists.");
    const newUser = await UserModel.create({
      ...req.body,
      role:"supplier"
    });
    return res.json({ user: newUser });
  } catch (error) {
    next(error);
  }
}

async function registerBulk(req, res, next) {
  const users = req.body;

  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ message: "No users provided." });
  }

  try {
    const createdUsers = [];

    for (const user of users) {
      const { username, email, password } = user;

      if (!username || !email || !password) continue; // skip if missing required fields

      const existingUsername = await UserModel.findOne({ username });
      const existingEmail = await UserModel.findOne({ email });

      if (existingUsername || existingEmail) continue; // skip if user exists

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await UserModel.create({
        ...user,
        password: hashedPassword,
      });

      newUser.password = "";
      createdUsers.push(newUser);
    }

    res.json({ users: createdUsers });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  const { username, password } = req.body;
  try {
    if (!username || !password) throw new Error("Required Fields missing.");
    const user = await UserModel.findOne({ username });
    if (!user) throw new Error("Username not registered.");
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new Error("Please enter correct password.");
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    user.password = "";
    return res.json({ token, user });
  } catch (error) {
    next(error);
  }
}

async function getAllSuppliers(req, res, next) {
  try {
    const users = await UserModel.find({ role: "supplier" }).select(
      "username email",
    );
    res.json({ users });
  } catch (error) {
    next(error);
  }
}

async function getDashboardStats(req, res, next) {
  try {
    const user = await UserModel.findById(req.userId, { _id: 0, role: 1 });
    let stats = {};
    switch (user.role) {
      case "admin":
        stats = await getAdminStats();
        break;
      case "department":
        stats = await getDepartmentStats(req.userId);
        break;
      case "purchasing":
        stats = await getPurchasingStats(req.userId);
        break;
      case "invoicing":
        stats = await getInvoicingStats(req.userId);
        break;
      case "store":
        stats = await getStoreStats(req.userId);
        break;
      default:
        break;
    }

    res.json(stats);
  } catch (error) {
    next(error);
  }
}

const statusMap = {
  "pending approval": "pendingApproval",
  approved: "approved",
  rejected: "rejected",
  "partially supplied": "partiallySupplied",
  supplied: "supplied",
  delivered: "delivered",
  "delivery rejected": "deliveryRejected",
  repair: "repair",
  "partially delivered": "partiallyDelivered",
  "recieved - confirmed quality": "recievedConfirmedQuality",
  "recieved - rejected quality": "recievedRejectedQuality",
};

async function getAdminStats() {
  const requestStatusStats = {
    total: 0,
    pendingApproval: 0,
    approved: 0,
    rejected: 0,
    partiallySupplied: 0,
    supplied: 0,
    delivered: 0,
    deliveryRejected: 0,
    repair: 0,
    partiallyDelivered: 0,
    recievedConfirmedQuality: 0,
    recievedRejectedQuality: 0,
  };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const aggregation = await MaterialRequestModel.aggregate([
    {
      $match: {
        requestDate: {
          $gte: startOfMonth,
          $lt: startOfNextMonth,
        },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  aggregation.forEach((item) => {
    const key = statusMap[item._id];
    if (key) {
      requestStatusStats[key] = item.count;
      requestStatusStats.total += item.count;
    }
  });

  const lowStockMaterials = await MaterialModel.find({ lowStock: true });

  return {
    requestStatusStats,
    lowStockMaterials,
  };
}

async function getDepartmentStats(userId) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const requestStatusStats = {
    total: 0,
    pendingApproval: 0,
    approved: 0,
    rejected: 0,
    partiallySupplied: 0,
    supplied: 0,
    delivered: 0,
    deliveryRejected: 0,
    repair: 0,
    partiallyDelivered: 0,
    recievedConfirmedQuality: 0,
    recievedRejectedQuality: 0,
  };

  const user = await UserModel.findById(userId, {
    _id: 0,
    department: 1,
  });
  const aggregation = await MaterialRequestModel.aggregate([
    {
      $match: {
        requestDate: {
          $gte: startOfMonth,
          $lt: startOfNextMonth,
        },
      },
    },

    {
      $lookup: {
        from: "Users",
        localField: "requesterId",
        foreignField: "_id",
        as: "requester",
      },
    },
    {
      $match: {
        "requester.department": user.department,
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Populate the stats object
  aggregation.forEach((item) => {
    const key = statusMap[item._id];
    if (key) {
      requestStatusStats[key] = item.count;
      requestStatusStats.total += item.count;
    }
  });

  return {
    requestStatusStats,
  };
}

async function getPurchasingStats(userId) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const quotationRequestStatsAggregation =
    await QuotationRequestModel.aggregate([
      {
        $match: {
          submittedBy: new mongoose.Types.ObjectId(userId),
          date: {
            $gte: startOfMonth,
            $lt: startOfNextMonth,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

  const poStatsAggregation = await PurchaseOrderModel.aggregate([
    {
      $match: {
        createdBy: new mongoose.Types.ObjectId(userId),
        createdAt: {
          $gte: startOfMonth,
          $lt: startOfNextMonth,
        },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const quotaionStatsAggregation = await QuotationModel.aggregate([
    {
      $match: {
        date: {
          $gte: startOfMonth,
          $lt: startOfNextMonth,
        },
      },
    },

    {
      $lookup: {
        from: "quotationrequests", // Lookup in the QuotationRequests collection
        localField: "quotationRequestId", // Field in QuotationModel to match
        foreignField: "_id", // Field in QuotationRequests to match
        as: "quotationRequestDetails", // Store result in "quotationRequestDetails"
      },
    },
    {
      $unwind: {
        path: "$quotationRequestDetails", // Unwind the array
        preserveNullAndEmptyArrays: true, // Allow the match to proceed even if no match is found
      },
    },
    {
      $match: {
        "quotationRequestDetails.submittedBy": new mongoose.Types.ObjectId(
          userId,
        ), // Match based on submittedBy
      },
    },
    {
      $group: {
        _id: "$status", // Group by status field from QuotationModel
        count: { $sum: 1 }, // Count the number of quotes per status
      },
    },
  ]);

  const quotationRequestStats = {};
  const poStats = {};
  const quotationStats = {};

  quotationRequestStatsAggregation.forEach((item) => {
    quotationRequestStats[item._id] = item.count;
  });
  poStatsAggregation.forEach((item) => (poStats[item._id] = item.count));
  quotaionStatsAggregation.forEach(
    (item) => (quotationStats[item._id] = item.count),
  );

  return {
    quotationRequestStats,
    purchaseOrderStats: poStats,
    quotationStats,
  };
}

async function getStoreStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // 1. Materials Inventory Stats
  const materialsStatsAggregation = await MaterialModel.aggregate([
    {
      $project: {
        maximoId: 1,
        description: 1,
        currentStock: 1,
        lowStock: 1, // Return the low stock status
      },
    },
  ]);

  // Calculate total low stock materials and total items in stock
  const materialsInventoryStats = {};
  materialsStatsAggregation.forEach(
    (item) =>
    (materialsInventoryStats[`${item.maximoId} - ${item.description}`] =
      item.currentStock),
  );

  // 2. Purchase Orders Stats
  const purchaseOrderStatsAggregation = await PurchaseOrderModel.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfMonth,
          $lt: startOfNextMonth,
        },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const purchaseOrdersStats = {};
  purchaseOrderStatsAggregation.forEach((item) => {
    purchaseOrdersStats[item._id] = item.count;
  });

  // 3. Material Requests Stats
  const materialRequestsStatsAggregation = await MaterialRequestModel.aggregate(
    [
      {
        $match: {
          requestDate: {
            $gte: startOfMonth,
            $lt: startOfNextMonth,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ],
  );

  const materialRequestsStats = {};
  materialRequestsStatsAggregation.forEach((item) => {
    materialRequestsStats[item._id] = item.count;
  });

  const lowStockMaterials = await MaterialModel.find({ lowStock: true });

  return {
    materialsInventoryStats,
    purchaseOrdersStats,
    materialRequestsStats,
    lowStockMaterials,
  };
}

async function getInvoicingStats() {
  return {};
}

// MongoDB backup using `mongodump` (MongoDB built-in tool for database dump)
async function adminBackup(req, res) {
  try {
    // Temporary folder to store the backup
    const backupFolder = path.join(__dirname, "backup");
    await fs.ensureDir(backupFolder);

    // Use the `mongodump` command to create a backup
    // Replace with your MongoDB URI if needed
    const mongoURI = process.env.MONGO_URI;

    // Backup the database using the `mongodump` command
    exec(
      `mongodump --uri="${mongoURI}" --out="${backupFolder}"`,
      (err, stdout, stderr) => {
        if (err) {
          console.error("Error executing mongodump:", err);
          return res.status(500).json({ message: "Error creating backup." });
        }

        console.log(stdout);
        console.error(stderr);

        // Zip the folder before sending the response (optional for large files)
        const zipFilePath = "backup.zip";

        // Assuming you have `archiver` or `zip` utility installed
        exec(`zip -r ${zipFilePath} ${backupFolder}`, (err, stdout, stderr) => {
          if (err) {
            console.error("Error zipping the backup:", err);
            return res.status(500).json({ message: "Error zipping backup." });
          }

          // Send the zip file for download
          res.download(zipFilePath, (err) => {
            if (err) {
              console.error("Error downloading the backup:", err);
            }
            // Clean up the backup files after sending
            fs.removeSync(backupFolder);
          });
        });
      },
    );
  } catch (error) {
    console.error("Error during backup:", error);
    res.status(500).json({ message: "Error during backup." });
  }
}

module.exports = {
  login,
  register,
  registerBulk,
  getUser,
  getAllUsers,
  updateUser,
  getAllSuppliers,
  getDashboardStats,
  adminBackup,
  registerSupplier,
};
