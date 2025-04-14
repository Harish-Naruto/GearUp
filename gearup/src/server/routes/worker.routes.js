const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { workerValidation } = require('../validations');
const { workerController } = require('../controllers');

router.get('/', protect, workerController.getAllWorkers);
router.get('/:id', protect, workerController.getWorker);
router.post('/', protect, authorize('MANAGER', 'ADMIN'), validate(workerValidation.createWorker), workerController.createWorker);
router.put('/:id', protect, authorize('MANAGER', 'ADMIN', 'WORKER'), validate(workerValidation.updateWorker), workerController.updateWorker);
router.delete('/:id', protect, authorize('MANAGER', 'ADMIN'), workerController.deleteWorker);

// Worker availability
router.put('/:id/availability', protect, authorize('WORKER'), validate(workerValidation.updateAvailability), workerController.updateAvailability);

// Worker assignments
router.get('/:id/assignments', protect, authorize('WORKER'), workerController.getAssignments);

module.exports = router;