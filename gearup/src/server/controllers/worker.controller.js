const { StatusCodes } = require('http-status-codes');
const { AppError } = require('../middlewares/errorHandler');
const supabase = require('../services/supabase');

const getAllWorkers = async (req, res, next) => {
  try {
    let query = supabase
      .from('workers')
      .select(`
        *,
        users (id, email),
        garages (id, name, location)
      `);

    // Apply filters
    if (req.query.garage_id) {
      query = query.eq('garage_id', req.query.garage_id);
    }

    if (req.query.specialization) {
      query = query.contains('specialization', [req.query.specialization]);
    }

    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }

    // Apply sorting
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith('-') 
        ? req.query.sort.substring(1) 
        : req.query.sort;
      const sortOrder = req.query.sort.startsWith('-') ? 'desc' : 'asc';
      query = query.order(sortField, { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: workers, error } = await query;

    if (error) {
      throw new AppError('Error retrieving workers', StatusCodes.BAD_REQUEST);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      results: workers.length,
      data: {
        workers
      }
    });
  } catch (error) {
    next(error);
  }
};

const getWorker = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: worker, error } = await supabase
      .from('workers')
      .select(`
        *,
        users (id, email, profile_data),
        garages (id, name, location, services)
      `)
      .eq('id', id)
      .single();

    if (error || !worker) {
      throw new AppError('Worker not found', StatusCodes.NOT_FOUND);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        worker
      }
    });
  } catch (error) {
    next(error);
  }
};

const createWorker = async (req, res, next) => {
  try {
    const { user_id, garage_id, specialization, availability } = req.body;
    const requesting_user_id = req.user.id;

    // Verify authorization
    if (req.user.role !== 'ADMIN') {
      // Check if requester is the manager of the garage
      const { data: garage } = await supabase
        .from('garages')
        .select('manager_id')
        .eq('id', garage_id)
        .eq('manager_id', requesting_user_id)
        .single();

      if (!garage) {
        throw new AppError('Not authorized to add workers to this garage', StatusCodes.FORBIDDEN);
      }
    }

    // Check if user exists and is not already a worker
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    // Check if user is already a worker somewhere
    const { data: existingWorker } = await supabase
      .from('workers')
      .select('id')
      .eq('user_id', user_id)
      .maybeSingle();

    if (existingWorker) {
      throw new AppError('User is already a worker', StatusCodes.BAD_REQUEST);
    }

    // Update user role if not already 'WORKER'
    if (user.role !== 'WORKER') {
      await supabase
        .from('users')
        .update({ role: 'WORKER' })
        .eq('id', user_id);
    }

    // Create worker
    const { data: worker, error } = await supabase
      .from('workers')
      .insert([
        {
          user_id,
          garage_id,
          specialization: specialization || [],
          availability: availability || {},
          status: 'ACTIVE'
        }
      ])
      .select(`
        *,
        users (id, email),
        garages (id, name)
      `);

    if (error) {
      throw new AppError('Error creating worker', StatusCodes.BAD_REQUEST);
    }

    // Create notification for the user
    await supabase
      .from('notifications')
      .insert([
        {
          recipient_id: user_id,
          type: 'SYSTEM',
          content: {
            message: 'You have been assigned as a worker'
          }
        }
      ]);

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data: {
        worker: worker[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateWorker = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { specialization, availability, status } = req.body;
    const requesting_user_id = req.user.id;

    // Get worker details first
    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .select('*')
      .eq('id', id)
      .single();

    if (workerError || !worker) {
      throw new AppError('Worker not found', StatusCodes.NOT_FOUND);
    }

    // Check authorization
    let isAuthorized = false;

    if (req.user.role === 'ADMIN') {
      isAuthorized = true;
    } else if (req.user.role === 'MANAGER') {
      // Check if user is manager of this worker's garage
      const { data: garage } = await supabase
        .from('garages')
        .select('manager_id')
        .eq('id', worker.garage_id)
        .eq('manager_id', requesting_user_id)
        .single();

      isAuthorized = !!garage;
    } else if (req.user.role === 'WORKER') {
      // Workers can update their own profiles
      isAuthorized = worker.user_id === requesting_user_id;
      
      // But only certain fields
      if (isAuthorized && status && worker.user_id === requesting_user_id) {
        throw new AppError('Workers cannot update their own status', StatusCodes.FORBIDDEN);
      }
    }

    if (!isAuthorized) {
      throw new AppError('Not authorized to update this worker', StatusCodes.FORBIDDEN);
    }

    // Prepare update data
    const updateData = {};
    if (specialization !== undefined) updateData.specialization = specialization;
    if (availability !== undefined) updateData.availability = availability;
    if (status !== undefined) updateData.status = status;
    updateData.updated_at = new Date().toISOString();

    // Update worker
    const { data: updatedWorker, error } = await supabase
      .from('workers')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        users (id, email),
        garages (id, name)
      `);

    if (error) {
      throw new AppError('Error updating worker', StatusCodes.BAD_REQUEST);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        worker: updatedWorker[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteWorker = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requesting_user_id = req.user.id;

    // Get worker details first
    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .select('*')
      .eq('id', id)
      .single();

    if (workerError || !worker) {
      throw new AppError('Worker not found', StatusCodes.NOT_FOUND);
    }

    // Check authorization
    let isAuthorized = false;

    if (req.user.role === 'ADMIN') {
      isAuthorized = true;
    } else if (req.user.role === 'MANAGER') {
      // Check if user is manager of this worker's garage
      const { data: garage } = await supabase
        .from('garages')
        .select('manager_id')
        .eq('id', worker.garage_id)
        .eq('manager_id', requesting_user_id)
        .single();

      isAuthorized = !!garage;
    }

    if (!isAuthorized) {
      throw new AppError('Not authorized to delete this worker', StatusCodes.FORBIDDEN);
    }

    // Delete worker
    const { error } = await supabase
      .from('workers')
      .delete()
      .eq('id', id);

    if (error) {
      throw new AppError('Error deleting worker', StatusCodes.BAD_REQUEST);
    }

    // Create notification for the user
    await supabase
      .from('notifications')
      .insert([
        {
          recipient_id: worker.user_id,
          type: 'SYSTEM',
          content: {
            message: 'Your worker account has been removed'
          }
        }
      ]);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

const updateAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;
    const requesting_user_id = req.user.id;

    // Get worker details first
    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .select('*')
      .eq('id', id)
      .single();

    if (workerError || !worker) {
      throw new AppError('Worker not found', StatusCodes.NOT_FOUND);
    }

    // Workers can only update their own availability
    if (worker.user_id !== requesting_user_id) {
      throw new AppError('Not authorized to update this worker\'s availability', StatusCodes.FORBIDDEN);
    }

    // Update worker availability
    const { data: updatedWorker, error } = await supabase
      .from('workers')
      .update({
        availability,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      throw new AppError('Error updating worker availability', StatusCodes.BAD_REQUEST);
    }

    // Notify garage manager
    const { data: garage } = await supabase
      .from('garages')
      .select('manager_id')
      .eq('id', worker.garage_id)
      .single();

    if (garage && garage.manager_id) {
      await supabase
        .from('notifications')
        .insert([
          {
            recipient_id: garage.manager_id,
            type: 'UPDATE',
            content: {
              message: 'Worker updated their availability',
              worker_id: id
            }
          }
        ]);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        worker: updatedWorker[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAssignments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requesting_user_id = req.user.id;

    // Get worker details first
    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .select('*')
      .eq('id', id)
      .single();

    if (workerError || !worker) {
      throw new AppError('Worker not found', StatusCodes.NOT_FOUND);
    }

    // Workers can only view their own assignments
    if (worker.user_id !== requesting_user_id && req.user.role !== 'ADMIN') {
      throw new AppError('Not authorized to view this worker\'s assignments', StatusCodes.FORBIDDEN);
    }

    // Get bookings assigned to this worker
    let query = supabase
      .from('bookings')
      .select(`
        *,
        garages (id, name, location),
        users (id, email, profile_data)
      `)
      .eq('worker_id', id);

    // Apply filters
    if (req.query.status) {
      query = query.eq('status', req.query.status);
    } else {
      // By default, show only active bookings
      query = query.in('status', ['CONFIRMED', 'IN_PROGRESS']);
    }

    // Sort by scheduled time
    query = query.order('scheduled_time', { ascending: true });

    const { data: assignments, error } = await query;

    if (error) {
      throw new AppError('Error retrieving assignments', StatusCodes.BAD_REQUEST);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      results: assignments.length,
      data: {
        assignments
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllWorkers,
  getWorker,
  createWorker,
  updateWorker,
  deleteWorker,
  updateAvailability,
  getAssignments
};