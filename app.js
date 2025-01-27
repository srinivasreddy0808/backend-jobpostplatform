const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const userRouter = require("./routes/userRoutes");
const jobRouter = require("./routes/jobRoutes");
const companyRouter = require("./routes/companyRoutes");
const globalErrorHandler = require("./controllers/errorController");
const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/companies", companyRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
