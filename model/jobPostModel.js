const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a job title"],
  },
  description: {
    type: String,
    required: [true, "Please provide a job description"],
  },
  experienceLevel: {
    type: String,
    enum: ["BEGINNER", "INTERMEDIATE", "EXPERT"], // Only allow these values
    required: [true, "Please provide the experience level"],
  },
  candidates: [
    {
      email: {
        type: String,
        required: [true, "Please provide a candidate email"],
      },
    },
  ],
  endDate: {
    type: Date,
    required: [true, "Please provide an end date for the job posting"],
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company", // Reference to the Company model
    required: [true, "Please provide the company ID"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Job", jobSchema);
