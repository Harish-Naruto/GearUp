const { StatusCodes } = require('http-status-codes');

const notFoundHandler = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`
  });
};

module.exports = {
  notFoundHandler
};