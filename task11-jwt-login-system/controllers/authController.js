const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Create a signed token: payload holds only non-secret data
const signToken = (user) =>
  jwt.sign({ sub: user._id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

// POST /api/auth/register
// Body: { name, email, password }  (role is NOT accepted from the client)
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};

  const user = await User.create({ name, email, password });

  res.status(201).json({
    message: 'User registered successfully',
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// POST /api/auth/login
// Body: { email, password }
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // password has select:false, so ask for it explicitly
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');

  // Same message for "no such user" and "wrong password" so attackers learn nothing
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  res.json({
    message: 'Login successful',
    token: signToken(user),
    expiresIn: config.jwtExpiresIn,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// GET /api/auth/me  (protected)
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
