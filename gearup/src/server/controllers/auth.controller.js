const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { AppError } = require('../middlewares/errorHandler');
const supabase = require('../services/supabase');
const config = require('../config');
const logger = require('../utils/logger');

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

const register = async (req, res, next) => {
  try {
    const { email, password, role, profile_data } = req.body;

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new AppError('User already exists', StatusCodes.BAD_REQUEST);
    }
    const {data:authuser,error:autherror} = await supabase.auth.signUp({
      email,
      password
    })
    if(autherror) throw new Error(autherror.message);
    const userid = authuser.user.id;
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          id:userid,
          email,
          password_hash: hashedPassword,
          role,
          profile_data
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Generate token
    const token = generateToken(newUser.id);

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          profile_data: newUser.profile_data
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (authError || !authData.user) {
      throw new Error('Invalid credentials');
    }
  
    const userId = authData.user.id;
  
   
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
  
    if (error || !user) {
      throw new Error('User profile not found');
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile_data: user.profile_data
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};
 //-----------------------------------------------------------------------------//
const logout = async (req, res) => {
  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Logged out successfully'
  });
};

const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new AppError('No refresh token provided', StatusCodes.BAD_REQUEST);
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const newToken = generateToken(decoded.id);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (error || !user) {
      // Don't reveal if user exists
      return res.status(StatusCodes.OK).json({
        status: 'success',
        message: 'If your email is registered, you will receive a password reset link'
      });
    }

    // Generate reset token
    const resetToken = generateToken(user.id);

    // TODO: Send email with reset token
    logger.info(`Reset token for ${email}: ${resetToken}`);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'If your email is registered, you will receive a password reset link'
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const decoded = jwt.verify(token, config.jwt.secret);

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password
    const { error } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', decoded.id);

    if (error) {
      throw new AppError('Error resetting password', StatusCodes.BAD_REQUEST);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword
};