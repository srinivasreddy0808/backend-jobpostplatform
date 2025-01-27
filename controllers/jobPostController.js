const Job = require("../model/jobPostModel");
const Company = require("../model/companyModel");
const nodemailer = require("nodemailer");

// Send email to candidates
const sendJobEmail = async (email, jobTitle, companyName) => {
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
    subject: `New Job Opportunity: ${jobTitle}`,
    text: `Hello,\n\nA new job opportunity "${jobTitle}" has been posted by ${companyName}. Apply now!\n\nBest regards,\nThe Job Portal Team`,
  };

  await transporter.sendMail(mailOptions);
};

// Post a new job
exports.postJob = async (req, res) => {
  const { title, description, experienceLevel, candidates, endDate } = req.body;
  const companyId = req.company._id; // Assuming company ID is available in the request (from authentication middleware)

  try {
    // Create the job
    const job = await Job.create({
      title,
      description,
      experienceLevel,
      candidates: candidates.map((email) => ({ email })), // Convert email array to candidate objects
      endDate,
      company: companyId,
    });

    // Get company details
    const company = await Company.findById(companyId);

    // Send emails to candidates
    for (const candidate of job.candidates) {
      await sendJobEmail(candidate.email, job.title, company.name);
    }

    res.status(201).json({ message: "Job posted successfully", job });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error posting job", error: error.message });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ company: req.company._id }); // Assuming company ID is available in the request (from authentication middleware)
    res.status(200).json({ jobs });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching jobs", error: error.message });
  }
};
