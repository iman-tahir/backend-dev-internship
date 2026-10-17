const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// AUTHENTICATION: who are you? Verifies the Bearer token.
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('Not authenticated: no token provided', 401);
  }

  const token = header.split(' ')[1];

  let decoded;
  try {
    // Pin the algorithm so the "alg: none" trick is rejected
    decoded = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw new AppError('Token has expired, please log in again', 401);
    throw new AppError('Invalid token', 401);
  }

  // Make sure the user still exists
  const user = await User.findById(decoded.sub);
  if (!user) throw new AppError('The user for this token no longer exists', 401);

  req.user = { id: user._id, name: user.name, email: user.email, role: user.role };
  next();
});

// AUTHORIZATION: are you allowed? Must run after protect.
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Forbidden: you do not have permission for this action', 403));
  }
  next();
};

module.exports = { protect, authorize };
