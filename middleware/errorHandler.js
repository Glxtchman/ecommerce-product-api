const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // SQLite unique constraint
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(400).json({ success: false, message: 'That email is already registered' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
