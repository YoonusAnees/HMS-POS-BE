// src/middleware/error.middleware.js
module.exports = (err, req, res, next) => {
  console.error(err);
  const status = res.statusCode !== 200 ? res.statusCode : 400;
  res.status(status).json({
    message: err.message || 'Something went wrong',
  });
};
