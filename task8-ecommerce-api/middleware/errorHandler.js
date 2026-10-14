const errorHandler = (err, req, res, next) => {
  // Mongoose validation failed (required, min, etc.)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // Malformed ObjectId (e.g. /api/products/abc)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  // Duplicate key on a unique field
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({ message: `Duplicate value for ${field}` });
  }

  // Anything else is an unexpected server error
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
};

module.exports = errorHandler;