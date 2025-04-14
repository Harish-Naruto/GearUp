const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const garageRoutes = require('./garage.routes');
const bookingRoutes = require('./booking.routes');
const workerRoutes = require('./worker.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/garages', garageRoutes);
router.use('/bookings', bookingRoutes);
router.use('/workers', workerRoutes);

module.exports = router;