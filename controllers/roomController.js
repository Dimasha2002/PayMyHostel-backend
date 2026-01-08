const Room = require('../models/Room');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private
exports.getAllRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().populate('residents', 'fullName studentId');

    res.status(200).json({
      success: true,
      count: rooms.length,
      rooms
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available rooms
// @route   GET /api/rooms/available
// @access  Private
exports.getAvailableRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ status: 'available' });

    res.status(200).json({
      success: true,
      count: rooms.length,
      rooms
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a room (Admin only)
// @route   POST /api/rooms
// @access  Private/Admin
exports.createRoom = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a room (Admin only)
// @route   PUT /api/rooms/:id
// @access  Private/Admin
exports.updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      room
    });
  } catch (error) {
    next(error);
  }
};
