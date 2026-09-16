exports.notFound = (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
};

exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
};