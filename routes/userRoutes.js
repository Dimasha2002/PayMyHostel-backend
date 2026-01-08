const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getStudents,
  getUser,
  updateUser,
  deleteUser,
  getRoommates
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/roommates', protect, getRoommates);
router.get('/students', protect, authorize('admin'), getStudents);
router.get('/:id', protect, authorize('admin'), getUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.get('/', protect, authorize('admin'), getAllUsers);

module.exports = router;
