const express = require('express');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/users  -> admin only (protect first, then authorize)
router.get(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 }); // password is never selected
    res.json({ count: users.length, users });
  })
);

module.exports = router;
