const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { userValidation } = require('../validations');
const { userController } = require('../controllers');

router.get('/me', protect, userController.getProfile);
router.put('/me', protect, validate(userValidation.updateProfile), userController.updateProfile);
router.get('/notifications', protect, userController.getNotifications);
router.patch('/notifications/:id', protect, userController.markNotificationRead);

// Admin only routes
router.get('/', protect, authorize('ADMIN'), userController.getAllUsers);
router.get('/:id', protect, authorize('ADMIN'), userController.getUser);
router.put('/:id', protect, authorize('ADMIN'), validate(userValidation.updateUser), userController.updateUser);
router.delete('/:id', protect, authorize('ADMIN'), userController.deleteUser);

module.exports = router;