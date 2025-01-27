const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  console.log("signup reached");
  const newUser = await User.create({
    email: req.body.email,
    userName: req.body.userName,
    password: req.body.password,
  });

  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  console.log("login reached");
  const { email, password } = req.body;
  // check  if email and password is exists
  if (!email || !password) {
    next(new AppError("please provide userName and password ", 400));
  }
  // check if user exists and password is correct
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("incorrect email or password ", 401));
  }
  // if every thing is ok send token to the client as http only cookie
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // getting token and check if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("you are not logged in please login to get access", 401)
    );
  }
  // verification by the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // finding user exists or not
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("the usr belog to the token does no longer exist", 401)
    );
  }

  // access granted for protected route
  req.user = currentUser;
  next();
});

exports.jobPostMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization").replace("Bearer ", "");

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find company by ID
    const company = await Company.findOne({ _id: decoded._id });

    if (!company) {
      throw new Error("Company not found");
    }

    // Attach company to request
    req.company = company;
    next();
  } catch (error) {
    res.status(401).json({ message: "Please authenticate" });
  }
};
