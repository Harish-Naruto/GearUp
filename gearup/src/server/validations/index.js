const authValidation = require('./auth.validation');
const userValidation = require('./user.validation');
const garageValidation = require('./garage.validation');
const bookingValidation = require('./booking.validation');
const workerValidation = require('./worker.validation');

module.exports = {
  authValidation,
  userValidation,
  garageValidation,
  bookingValidation,
  workerValidation
};