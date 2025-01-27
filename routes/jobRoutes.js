const express = require("express");
const jobController = require("../controllers/jobPostController");
const authController = require("../controllers/authController");

const router = express.Router();

// Post a new job (authenticated route)
router.post(
  "/post-job",
  authController.protect,
  authController.jobPostMiddleware,
  jobController.postJob
);
router.get("/get-all-jobs", authController.protect, jobController.getAllJobs);
module.exports = router;
