const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const { AppError } = require('./errorHandler');
const config = require('../config');
const supabase = require('../services/supabase');

const protect = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', StatusCodes.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Check if user still exists
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      throw new AppError('User no longer exists', StatusCodes.UNAUTHORIZED);
    }

    // Grant access
    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Not authorized to access this route', StatusCodes.UNAUTHORIZED));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Not authorized to perform this action', StatusCodes.FORBIDDEN)
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};