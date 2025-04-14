const { StatusCodes } = require('http-status-codes');
const { AppError } = require('../middlewares/errorHandler');
const supabase = require('../services/supabase');

const getAllGarages = async (req, res, next) => {
  try {
    let query = supabase.from('garages').select('*');

    // Apply filters
    if (req.query.search) {
      query = query.ilike('name', `%${req.query.search}%`);
    }

    // Apply sorting
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith('-') 
        ? req.query.sort.substring(1) 
        : req.query.sort;
      const sortOrder = req.query.sort.startsWith('-') ? 'desc' : 'asc';
      query = query.order(sortField, { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('name', { ascending: true });
    }

    const { data: garages, error } = await query;

    if (error) {
      throw new AppError('Error retrieving garages', StatusCodes.BAD_REQUEST);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      results: garages.length,
      data: {
        garages
      }
    });
  } catch (error) {
    next(error);
  }
};

const getGarage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: garage, error } = await supabase
      .from('garages')
      .select(`
        *,
        workers (id, user_id, specialization, availability)
      `)
      .eq('id', id)
      .single();

    if (error || !garage) {
      throw new AppError('Garage not found', StatusCodes.NOT_FOUND);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        garage
      }
    });
  } catch (error) {
    next(error);
  }
};

const createGarage = async (req, res, next) => {
  try {
    const { name, location, services, operating_hours, contact_info } = req.body;
    const manager_id = req.user.id;

    // Check if the user is allowed to be a manager
    if (req.user.role !== 'MANAGER' && req.user.role !== 'ADMIN') {
      throw new AppError('Only managers and admins can create garages', StatusCodes.FORBIDDEN);
    }

    // Create garage
    const { data: garage, error } = await supabase
      .from('garages')
      .insert([
        {
          name,
          location,
          services: services || [],
          manager_id,
          operating_hours: operating_hours || {},
          contact_info: contact_info || {}
        }
      ])
      .select();

    if (error) {
      throw new AppError('Error creating garage', error.message);
    }

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data: {
        garage: garage[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateGarage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, location, operating_hours, contact_info } = req.body;
    const user_id = req.user.id;

    // Check if garage exists
    const { data: existingGarage, error: garageError } = await supabase
      .from('garages')
      .select('*')
      .eq('id', id)
      .single();

    if (garageError || !existingGarage) {
      throw new AppError('Garage not found', StatusCodes.NOT_FOUND);
    }

    // Check if user is manager of this garage or admin
    if (existingGarage.manager_id !== user_id && req.user.role !== 'ADMIN') {
      throw new AppError('Not authorized to update this garage', StatusCodes.FORBIDDEN);
    }

    // Update garage
    const { data: garage, error } = await supabase
      .from('garages')
      .update({
        name,
        location,
        operating_hours,
        contact_info,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      throw new AppError('Error updating garage', StatusCodes.BAD_REQUEST);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        garage: garage[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteGarage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Only admin can delete garages
    if (req.user.role !== 'ADMIN') {
      throw new AppError('Only admins can delete garages', StatusCodes.FORBIDDEN);
    }

    // Check if garage exists
    const { data: existingGarage, error: garageError } = await supabase
      .from('garages')
      .select('id')
      .eq('id', id)
      .single();

    if (garageError || !existingGarage) {
      throw new AppError('Garage not found', StatusCodes.NOT_FOUND);
    }

    // Delete garage
    const { error } = await supabase
      .from('garages')
      .delete()
      .eq('id', id);

    if (error) {
      throw new AppError('Error deleting garage', StatusCodes.BAD_REQUEST);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

const addService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration } = req.body;
    const user_id = req.user.id;

    // Check if garage exists
    const { data: existingGarage, error: garageError } = await supabase
      .from('garages')
      .select('*')
      .eq('id', id)
      .single();

    if (garageError || !existingGarage) {
      throw new AppError('Garage not found', StatusCodes.NOT_FOUND);
    }

    // Check if user is manager of this garage or admin
    if (existingGarage.manager_id !== user_id && req.user.role !== 'ADMIN') {
      throw new AppError('Not authorized to add services to this garage', StatusCodes.FORBIDDEN);
    }

    // Get current services
    const currentServices = existingGarage.services || [];
    
    // Generate unique ID for the service
    const serviceId = Date.now().toString();

    // Add new service
    const newService = {
      id: serviceId,
      name,
      description,
      price,
      duration
    };

    currentServices.push(newService);

    // Update garage with new services
    const { data: garage, error } = await supabase
      .from('garages')
      .update({
        services: currentServices,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      throw new AppError('Error adding service', StatusCodes.BAD_REQUEST);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        service: newService,
        garage: garage[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

const removeService = async (req, res, next) => {
  try {
    const { id, serviceId } = req.params;
    const user_id = req.user.id;

    // Check if garage exists
    const { data: existingGarage, error: garageError } = await supabase
      .from('garages')
      .select('*')
      .eq('id', id)
      .single();

    if (garageError || !existingGarage) {
      throw new AppError('Garage not found', StatusCodes.NOT_FOUND);
    }

    // Check if user is manager of this garage or admin
    if (existingGarage.manager_id !== user_id && req.user.role !== 'ADMIN') {
      throw new AppError('Not authorized to remove services from this garage', StatusCodes.FORBIDDEN);
    }

    // Get current services and filter out the one to remove
    const currentServices = existingGarage.services || [];
    const updatedServices = currentServices.filter(service => service.id !== serviceId);

    // Check if service was found
    if (currentServices.length === updatedServices.length) {
      throw new AppError('Service not found', StatusCodes.NOT_FOUND);
    }

    // Update garage with updated services
    const { data: garage, error } = await supabase
      .from('garages')
      .update({
        services: updatedServices,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      throw new AppError('Error removing service', StatusCodes.BAD_REQUEST);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        garage: garage[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

const addRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const user_id = req.user.id;

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', StatusCodes.BAD_REQUEST);
    }

    // Check if garage exists
    const { data: existingGarage, error: garageError } = await supabase
      .from('garages')
      .select('*')
      .eq('id', id)
      .single();

    if (garageError || !existingGarage) {
      throw new AppError('Garage not found', StatusCodes.NOT_FOUND);
    }

    // Check if user has a completed booking with this garage
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('user_id', user_id)
      .eq('garage_id', id)
      .eq('status', 'COMPLETED')
      .limit(1);

    if (!bookings || bookings.length === 0) {
      throw new AppError('You can only rate garages after completing a service with them', StatusCodes.FORBIDDEN);
    }

    // Calculate new average rating
    const currentRating = existingGarage.ratings || 0;
    const totalRatings = existingGarage.total_ratings || 0;
    const newTotalRatings = totalRatings + 1;
    const newRating = ((currentRating * totalRatings) + rating) / newTotalRatings;

    // Update garage rating
    const { data: garage, error } = await supabase
      .from('garages')
      .update({
        ratings: newRating,
        total_ratings: newTotalRatings,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      throw new AppError('Error adding rating', StatusCodes.BAD_REQUEST);
    }

    // Notify garage manager
    if (existingGarage.manager_id) {
      await supabase
        .from('notifications')
        .insert([
          {
            recipient_id: existingGarage.manager_id,
            type: 'SYSTEM',
            content: {
              message: `New rating (${rating}/5) received for your garage`,
              garage_id: id
            }
          }
        ]);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        garage: garage[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllGarages,
  getGarage,
  createGarage,
  updateGarage,
  deleteGarage,
  addService,
  removeService,
  addRating
};