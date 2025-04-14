const Joi = require('joi');

const updateProfile = Joi.object({
  profile_data: Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    phone: Joi.string(),
    address: Joi.string(),
    preferences: Joi.object()
  }).required()
});

const updateUser = Joi.object({
  role: Joi.string().valid('USER', 'MANAGER', 'WORKER', 'ADMIN'),
  profile_data: Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    phone: Joi.string(),
    address: Joi.string(),
    preferences: Joi.object()
  })
});

module.exports = {
  updateProfile,
  updateUser
};