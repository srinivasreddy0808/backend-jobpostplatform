const nodemailer = require("nodemailer");
const twilio = require("twilio");
const Company = require("../model/companyModel");

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Email
const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OTP for Company Registration",
    text: `Your OTP for company registration is ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};

// Send OTP via SMS using Twilio
const sendOTPSMS = async (mobile, otp) => {
  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  await twilioClient.messages.create({
    body: `Your OTP for company registration is ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: mobile,
  });
};

// Send OTPs to email and mobile
exports.sendOTPs = async (req, res) => {
  const { email, mobile } = req.body;

  try {
    // Check if company already exists
    const existingCompany = await Company.findOne({
      $or: [{ email }, { mobile }],
    });
    if (existingCompany) {
      return res
        .status(400)
        .json({ message: "Company with this email or mobile already exists" });
    }

    // Generate OTPs
    const emailOtp = generateOTP();
    const mobileOtp = generateOTP();

    // Create a new company with the OTPs (temporarily)
    const company = await Company.create({
      email,
      mobile,
      emailOtp,
      mobileOtp,
    });

    // Send OTPs
    await sendOTPEmail(email, emailOtp);
    await sendOTPSMS(mobile, mobileOtp);

    res.status(200).json({ message: "OTPs sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending OTPs", error: error.message });
  }
};

// Verify OTPs and Register Company
exports.verifyOTPsAndRegister = async (req, res) => {
  const { name, email, mobile, emailOtp, mobileOtp } = req.body;

  try {
    // Find the company by email and mobile
    const company = await Company.findOne({ email, mobile });

    if (!company) {
      return res.status(400).json({ message: "Company not found" });
    }

    // Verify email OTP
    if (company.emailOtp !== emailOtp) {
      return res.status(400).json({ message: "Invalid email OTP" });
    }

    // Verify mobile OTP
    if (company.mobileOtp !== mobileOtp) {
      return res.status(400).json({ message: "Invalid mobile OTP" });
    }

    // Update the company with the provided details and clear OTPs
    company.name = name;
    company.emailOtp = null; // Clear email OTP
    company.mobileOtp = null; // Clear mobile OTP
    await company.save();

    res
      .status(201)
      .json({ message: "Company registered successfully", company });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering company", error: error.message });
  }
};
