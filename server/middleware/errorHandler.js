function errorHandler(err, req, res, next) {
  console.error('Unhandled Server Error:', err);

  // MySQL Duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({ error: 'A record with this information already exists.' });
  }

  // Joi/Validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred. Please try again later.' 
    : (err.message || 'Internal Server Error');

  res.status(statusCode).json({ error: message });
}

module.exports = errorHandler;
