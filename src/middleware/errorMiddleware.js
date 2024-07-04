module.exports = (err, req, res, _next) => {
  console.log(err);
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    success: false,
    message: err.isOperational ? err.message : 'Something went wrong!',
  };

  if (process.env.NODE_ENV === 'development' && err.isOperational) {
    errorResponse.stack = err.stack;
  }

  return res.status(statusCode).json(errorResponse);
};
