const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { bookingValidation } = require('../validations');
const { bookingController } = require('../controllers');

router.post('/', protect, validate(bookingValidation.createBooking), bookingController.createBooking);
router.get('/', protect, bookingController.getBookings);
router.get('/:id', protect, bookingController.getBooking);
router.put('/:id', protect, validate(bookingValidation.updateBooking), bookingController.updateBooking);
router.delete('/:id', protect, bookingController.cancelBooking);

// Booking status updates
router.patch('/:id/status', protect, authorize('MANAGER', 'WORKER'), validate(bookingValidation.updateStatus), bookingController.updateStatus);

// Payment status updates
router.patch('/:id/payment', protect, validate(bookingValidation.updatePayment), bookingController.updatePayment);

module.exports = router;