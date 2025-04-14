const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { garageValidation } = require('../validations');
const { garageController } = require('../controllers');

router.get('/', protect, garageController.getAllGarages);
router.get('/:id', protect, garageController.getGarage);
router.post('/', protect, authorize('MANAGER', 'ADMIN'), validate(garageValidation.createGarage), garageController.createGarage);
router.put('/:id', protect, authorize('MANAGER', 'ADMIN'), validate(garageValidation.updateGarage), garageController.updateGarage);
router.delete('/:id', protect, authorize('ADMIN'), garageController.deleteGarage);

// Garage services
router.post('/:id/services', protect, authorize('MANAGER', 'ADMIN'), validate(garageValidation.addService), garageController.addService);
router.delete('/:id/services/:serviceId', protect, authorize('MANAGER', 'ADMIN'), garageController.removeService);

// Garage ratings
router.post('/:id/ratings', protect, validate(garageValidation.addRating), garageController.addRating);

module.exports = router;