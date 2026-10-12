exports.notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
};

exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: Object.values(err.errors)
        .map(error => error.message)
        .join(', ')
    });
  }

  // Unexpected server error
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};