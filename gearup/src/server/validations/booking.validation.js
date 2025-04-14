const Joi = require('joi');

const createBooking = Joi.object({
  garage_id: Joi.string().uuid().required(),
  service_type: Joi.string().required(),
  description: Joi.string(),
  scheduled_time: Joi.date().iso().required(),
  worker_id: Joi.string().uuid()
});

const updateBooking = Joi.object({
  service_type: Joi.string(),
  description: Joi.string(),
  scheduled_time: Joi.date().iso(),
  worker_id: Joi.string().uuid()
});

const updateStatus = Joi.object({
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').required()
});

const updatePayment = Joi.object({
  payment_status: Joi.string().valid('PENDING', 'PAID', 'REFUNDED', 'FAILED').required(),
  amount: Joi.number().positive()
});

module.exports = {
  createBooking,
  updateBooking,
  updateStatus,
  updatePayment
};