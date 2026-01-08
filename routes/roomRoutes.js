const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  getAvailableRooms,
  createRoom,
  updateRoom
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getAllRooms);
router.get('/available', protect, getAvailableRooms);
router.post('/', protect, authorize('admin'), createRoom);
router.put('/:id', protect, authorize('admin'), updateRoom);

module.exports = router;
