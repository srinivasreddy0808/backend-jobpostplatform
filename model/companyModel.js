const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide company name"],
  },
  email: {
    type: String,
    required: [true, "Please provide email"],
    unique: true,
  },
  mobile: {
    type: String,
    required: [true, "Please provide mobile number"],
    unique: true,
  },
  emailOtp: {
    type: String,
    default: null, // OTP for email verification
  },
  mobileOtp: {
    type: String,
    default: null, // OTP for mobile verification
  },
});

module.exports = mongoose.model("Company", companySchema);
