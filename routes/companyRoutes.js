const express = require("express");
const companyController = require("../controllers/companyController");
const authController = require("../controllers/authController");

const router = express.Router();

// Send OTPs
router.post("/send-otps", authController.protect, companyController.sendOTPs);

// Verify OTPs and Register Company
router.post(
  "/verify-otps",
  authController.protect,
  companyController.verifyOTPsAndRegister
);

module.exports = router;
