const { StatusCodes } = require('http-status-codes');
const { AppError } = require('../middlewares/errorHandler');
const supabase = require('../services/supabase');

const getProfile = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, profile_data, created_at')
      .eq('id', user_id)
      .single();

    if (error || !user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    // If user is a worker, get their worker data
    let workerData = null;
    if (user.role === 'WORKER') {
      const { data: worker } = await supabase
        .from('workers')
        .select('*, garages(id, name)')
        .eq('user_id', user_id)
        .single();
      
      workerData = worker;
    }

    // If user is a manager, get their garage data
    let garageData = null;
    if (user.role === 'MANAGER') {
      const { data: garage } = await supabase
        .from('garages')
        .select('*')
        .eq('manager_id', user_id)
        .maybeSingle();
      
      garageData = garage;
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        user,
        worker: workerData,
        garage: garageData
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { email, profile_data } = req.body;

    // Prevent role updates through this endpoint
    if (req.body.role) {
      delete req.body.role;
    }

    // Check if email is unique if being updated
    if (email) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', user_id)
        .maybeSingle();

      if (existingUser) {
        throw new AppError('Email already in use', StatusCodes.BAD_REQUEST);
      }
    }

    // Update user
    const { data: user, error } = await supabase
      .from('users')
      .update({
        email: email || undefined,
        profile_data: profile_data || undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)
      .select('id, email, role, profile_data, created_at, updated_at');

    if (error) {
      throw new AppError('Error updating profile', StatusCodes.BAD_REQUEST);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        user: user[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    
    const query = supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', user_id);

    // Filter by read status if specified
    if (req.query.read !== undefined) {
      const readStatus = req.query.read === 'true';
      query.eq('read_status', readStatus);
    }

    // Apply sorting and pagination
    const { data: notifications, error } = await query
      .order('created_at', { ascending: false })
      .range(0, req.query.limit ? parseInt(req.query.limit) - 1 : 49);

    if (error) {
      throw new AppError('Error retrieving notifications', StatusCodes.BAD_REQUEST);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      results: notifications.length,
      data: {
        notifications
      }
    });
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if notification exists and belongs to user
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .eq('recipient_id', user_id)
      .single();

    if (notificationError || !notification) {
      throw new AppError('Notification not found', StatusCodes.NOT_FOUND);
    }

    // Update notification read status
    const { data: updatedNotification, error } = await supabase
      .from('notifications')
      .update({
        read_status: true
      })
      .eq('id', id)
      .select();

    if (error) {
      throw new AppError('Error updating notification', StatusCodes.BAD_REQUEST);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        notification: updatedNotification[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    // Only admins can access this endpoint
    if (req.user.role !== 'ADMIN') {
      throw new AppError('Not authorized to access this resource', StatusCodes.FORBIDDEN);
    }

    const query = supabase.from('users').select('id, email, role, created_at, updated_at');

    // Apply filters
    if (req.query.role) {
      query.eq('role', req.query.role);
    }

    if (req.query.email) {
      query.ilike('email', `%${req.query.email}%`);
    }

    // Apply sorting
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith('-') 
        ? req.query.sort.substring(1) 
        : req.query.sort;
      const sortOrder = req.query.sort.startsWith('-') ? 'desc' : 'asc';
      query.order(sortField, { ascending: sortOrder === 'asc' });
    } else {
      query.order('created_at', { ascending: false });
    }

    // Apply pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    const { data: users, error, count } = await query
      .range(startIndex, endIndex)
      .limit(limit);

    if (error) {
      throw new AppError('Error retrieving users', StatusCodes.BAD_REQUEST);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Only admins can access this endpoint
    if (req.user.role !== 'ADMIN') {
      throw new AppError('Not authorized to access this resource', StatusCodes.FORBIDDEN);
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, profile_data, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    // Get associated worker or garage data
    let workerData = null;
    let garageData = null;

    if (user.role === 'WORKER') {
      const { data: worker } = await supabase
        .from('workers')
        .select('*, garages(id, name)')
        .eq('user_id', id)
        .single();
      
      workerData = worker;
    } else if (user.role === 'MANAGER') {
      const { data: garage } = await supabase
        .from('garages')
        .select('*')
        .eq('manager_id', id)
        .maybeSingle();
      
      garageData = garage;
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        user,
        worker: workerData,
        garage: garageData
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, role, profile_data } = req.body;

    // Only admins can access this endpoint
    if (req.user.role !== 'ADMIN') {
      throw new AppError('Not authorized to access this resource', StatusCodes.FORBIDDEN);
    }

    // Check if user exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (userError || !existingUser) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    // Check if email is unique if being updated
    if (email && email !== existingUser.email) {
      const { data: duplicateUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', id)
        .maybeSingle();

      if (duplicateUser) {
        throw new AppError('Email already in use', StatusCodes.BAD_REQUEST);
      }
    }

    // Update user
    const { data: user, error } = await supabase
      .from('users')
      .update({
        email: email || undefined,
        role: role || undefined,
        profile_data: profile_data || undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, email, role, profile_data, created_at, updated_at');

    if (error) {
      throw new AppError('Error updating user', StatusCodes.BAD_REQUEST);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        user: user[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Only admins can access this endpoint
    if (req.user.role !== 'ADMIN') {
      throw new AppError('Not authorized to access this resource', StatusCodes.FORBIDDEN);
    }

    // Check if user exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (userError || !existingUser) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    // Cannot delete yourself
    if (id === req.user.id) {
      throw new AppError('Cannot delete your own account', StatusCodes.BAD_REQUEST);
    }

    // Delete user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new AppError('Error deleting user', StatusCodes.BAD_REQUEST);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getNotifications,
  markNotificationRead,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser
};