const { StatusCodes } = require('http-status-codes');
const { AppError } = require('../middlewares/errorHandler');
const supabase = require('../services/supabase');
const logger = require('../utils/logger');

const createBooking = async (req, res, next) => {
  try {
    const { garage_id, service_type, description, scheduled_time, estimated_duration } = req.body;
    const user_id = req.user.id;

    // Check if garage exists
    const { data: garage, error: garageError } = await supabase
      .from('garages')
      .select('id')
      .eq('id', garage_id)
      .single();

    if (garageError || !garage) {
      throw new AppError('Garage not found', StatusCodes.NOT_FOUND);
    }

    // Create booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([
        {
          user_id,
          garage_id,
          service_type,
          description,
          scheduled_time,
          estimated_duration,
          status: 'PENDING',
          payment_status: 'PENDING'
        }
      ])
      .select();

    if (error) {
      throw new AppError('Error creating booking', error.message);
    }

    // Create notification for garage manager
    const { data: garageData,error:gError } = await supabase
      .from('garages')
      .select('manager_id')
      .eq('id', garage_id)
      .single();

    if(gError) throw new Error(gError.message);
    
    if (garageData && garageData.manager_id) {
    const {data,error} =   await supabase
        .from('notifications')
        .insert([
          {
            recipient_id: garageData.manager_id,
            type: 'BOOKING',
            content: {
              message: 'New booking request',
              booking_id: booking[0].id
            }
          }
        ]);
      if(error) throw new Error(error.message);
    }

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data: {
        booking: booking[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const user_role = req.user.role;
    
    let query = supabase.from('bookings').select(`
      *,
      garages (id, name, location),
      workers (id, user_id, specialization)
    `);

    // Filter bookings based on user role
    if (user_role === 'USER') {
      query = query.eq('user_id', user_id);
    } else if (user_role === 'WORKER') {
      // Get worker's garage
      const { data: worker } = await supabase
        .from('workers')
        .select('garage_id, id')
        .eq('user_id', user_id)
        .single();

      if (worker) {
        query = query.eq('garage_id', worker.garage_id);
      }
    } else if (user_role === 'MANAGER') {
      // Get manager's garage
      const { data: garage } = await supabase
        .from('garages')
        .select('id')
        .eq('manager_id', user_id)
        .single();

      if (garage) {
        query = query.eq('garage_id', garage.id);
      }
    }

    // Apply filters from query parameters
    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }

    if (req.query.payment_status) {
      query = query.eq('payment_status', req.query.payment_status);
    }

    // Apply sorting
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith('-') 
        ? req.query.sort.substring(1) 
        : req.query.sort;
      const sortOrder = req.query.sort.startsWith('-') ? 'desc' : 'asc';
      query = query.order(sortField, { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('scheduled_time', { ascending: true });
    }

    const { data: bookings, error } = await query;

    if (error) {
      throw new AppError('Error retrieving bookings', StatusCodes.BAD_REQUEST);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings
      }
    });
  } catch (error) {
    next(error);
  }
};

const getBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const user_role = req.user.role;

    // Get booking with related data
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        garages (id, name, location, contact_info),
        workers (id, user_id, specialization)
      `)
      .eq('id', id)
      .single();

    if (error || !booking) {
      throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
    }

    // Check if user has access to this booking
    if (
      user_role !== 'ADMIN' && 
      booking.user_id !== user_id && 
      !(user_role === 'MANAGER' && await isGarageManager(user_id, booking.garage_id)) &&
      !(user_role === 'WORKER' && await isGarageWorker(user_id, booking.garage_id))
    ) {
      throw new AppError('Not authorized to access this booking', StatusCodes.FORBIDDEN);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { service_type, description, scheduled_time, estimated_duration } = req.body;
    const user_id = req.user.id;

    // Check if booking exists and belongs to user
    const { data: existingBooking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (bookingError || !existingBooking) {
      throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
    }

    // Only allow updates if booking is in PENDING status
    if (existingBooking.status !== 'PENDING') {
      throw new AppError('Cannot update a booking that is not in PENDING status', StatusCodes.BAD_REQUEST);
    }

    // Check user ownership or admin status
    if (existingBooking.user_id !== user_id && req.user.role !== 'ADMIN') {
      throw new AppError('Not authorized to update this booking', StatusCodes.FORBIDDEN);
    }

    // Update booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .update({
        service_type,
        description,
        scheduled_time,
        estimated_duration,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      throw new AppError('Error updating booking', StatusCodes.BAD_REQUEST);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        booking: booking[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if booking exists and belongs to user
    const { data: existingBooking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (bookingError || !existingBooking) {
      throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
    }

    // Check user ownership or admin status
    if (existingBooking.user_id !== user_id && req.user.role !== 'ADMIN') {
      throw new AppError('Not authorized to cancel this booking', StatusCodes.FORBIDDEN);
    }

    // Only allow cancellation if booking is not COMPLETED or already CANCELLED
    if (['COMPLETED', 'CANCELLED'].includes(existingBooking.status)) {
      throw new AppError(`Cannot cancel a ${existingBooking.status.toLowerCase()} booking`, StatusCodes.BAD_REQUEST);
    }

    // Update booking status
    const { data: booking, error } = await supabase
      .from('bookings')
      .update({
        status: 'CANCELLED',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      throw new AppError('Error cancelling booking', StatusCodes.BAD_REQUEST);
    }

    // Create notification for garage manager
    const { data: garageData } = await supabase
      .from('garages')
      .select('manager_id')
      .eq('id', existingBooking.garage_id)
      .single();

    if (garageData && garageData.manager_id) {
      await supabase
        .from('notifications')
        .insert([
          {
            recipient_id: garageData.manager_id,
            type: 'BOOKING',
            content: {
              message: 'Booking cancelled',
              booking_id: booking[0].id
            }
          }
        ]);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        booking: booking[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, worker_id } = req.body;
    const user_id = req.user.id;

    // Check if booking exists
    const { data: existingBooking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (bookingError || !existingBooking) {
      throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
    }

    // Verify user is authorized to update status
    let isAuthorized = false;
    
    if (req.user.role === 'ADMIN') {
      isAuthorized = true;
    } else if (req.user.role === 'MANAGER') {
      isAuthorized = await isGarageManager(user_id, existingBooking.garage_id);
    } else if (req.user.role === 'WORKER') {
      isAuthorized = await isGarageWorker(user_id, existingBooking.garage_id);
    }

    if (!isAuthorized) {
      throw new AppError('Not authorized to update this booking status', StatusCodes.FORBIDDEN);
    }

    // Validate status transition
    const validTransitions = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['IN_PROGRESS', 'CANCELLED'],
      'IN_PROGRESS': ['COMPLETED', 'CANCELLED']
    };

    if (!validTransitions[existingBooking.status] || !validTransitions[existingBooking.status].includes(status)) {
      throw new AppError(`Invalid status transition from ${existingBooking.status} to ${status}`, StatusCodes.BAD_REQUEST);
    }

    // Update booking
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    // Assign worker if provided
    if (worker_id) {
      // Verify worker belongs to garage
      const { data: worker } = await supabase
        .from('workers')
        .select('id')
        .eq('id', worker_id)
        .eq('garage_id', existingBooking.garage_id)
        .single();

      if (!worker) {
        throw new AppError('Worker not found or not associated with this garage', StatusCodes.BAD_REQUEST);
      }

      updateData.worker_id = worker_id;
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      throw new AppError('Error updating booking status', StatusCodes.BAD_REQUEST);
    }

    // Notify user of status change
    await supabase
      .from('notifications')
      .insert([
        {
          recipient_id: existingBooking.user_id,
          type: 'BOOKING',
          content: {
            message: `Booking status updated to ${status}`,
            booking_id: id
          }
        }
      ]);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        booking: booking[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

const updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { payment_status, amount } = req.body;
    const user_id = req.user.id;

    // Check if booking exists
    const { data: existingBooking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (bookingError || !existingBooking) {
      throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
    }

    // Check user ownership or admin status
    const isAdmin = req.user.role === 'ADMIN';
    const isManager = req.user.role === 'MANAGER' && await isGarageManager(user_id, existingBooking.garage_id);
    const isOwner = existingBooking.user_id === user_id;

    if (!isAdmin && !isManager && !isOwner) {
      throw new AppError('Not authorized to update payment status', StatusCodes.FORBIDDEN);
    }

    // Update payment status
    const updateData = {
      payment_status,
      updated_at: new Date().toISOString()
    };

    // Update amount if provided
    if (amount !== undefined) {
      updateData.amount = amount;
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      throw new AppError('Error updating payment status', StatusCodes.BAD_REQUEST);
    }

    // Notify user if not the one updating
    if (!isOwner) {
      await supabase
        .from('notifications')
        .insert([
          {
            recipient_id: existingBooking.user_id,
            type: 'PAYMENT',
            content: {
              message: `Payment status updated to ${payment_status}`,
              booking_id: id
            }
          }
        ]);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        booking: booking[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions
const isGarageManager = async (userId, garageId) => {
  const { data } = await supabase
    .from('garages')
    .select('id')
    .eq('id', garageId)
    .eq('manager_id', userId)
    .single();
  
  return !!data;
};

const isGarageWorker = async (userId, garageId) => {
  const { data } = await supabase
    .from('workers')
    .select('id')
    .eq('garage_id', garageId)
    .eq('user_id', userId)
    .single();
  
  return !!data;
};

module.exports = {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  updateStatus,
  updatePayment
};