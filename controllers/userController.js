const User = require('../models/User');
const Payment = require('../models/Payment');
const bcrypt = require('bcryptjs');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        fullName: user.fullName,
        studentId: user.studentId,
        email: user.email,
        phone: user.phone,
        hostelBlock: user.hostelBlock,
        roomNumber: user.roomNumber,
        checkInDate: user.checkInDate,
        lastPasswordChange: user.lastPasswordChange
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, email, phone, hostelBlock, roomNumber } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.hostelBlock = hostelBlock || user.hostelBlock;
    user.roomNumber = roomNumber || user.roomNumber;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        fullName: user.fullName,
        studentId: user.studentId,
        email: user.email,
        phone: user.phone,
        hostelBlock: user.hostelBlock,
        roomNumber: user.roomNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    user.lastPasswordChange = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, status, block, room } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (status) filter.isActive = status === 'active';
    if (block) filter.hostelBlock = block;
    if (room) filter.roomNumber = room;

    const users = await User.find(filter).select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get students only (Admin only)
// @route   GET /api/users/students
// @access  Private/Admin
exports.getStudents = async (req, res, next) => {
  try {
    const { block, room } = req.query;
    const filter = { role: 'student' };

    if (block) filter.hostelBlock = block;
    if (room) filter.roomNumber = room;

    const students = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const { fullName, email, phone, hostelBlock, roomNumber } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: req.params.id }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already registered'
        });
      }
    }

    // Update user fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email.toLowerCase();
    if (phone) user.phone = phone;
    if (hostelBlock) user.hostelBlock = hostelBlock;
    if (roomNumber) user.roomNumber = roomNumber;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        _id: user._id,
        fullName: user.fullName,
        studentId: user.studentId,
        email: user.email,
        phone: user.phone,
        hostelBlock: user.hostelBlock,
        roomNumber: user.roomNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get roommates
// @route   GET /api/users/roommates
// @access  Private
exports.getRoommates = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    if (!currentUser || !currentUser.hostelBlock || !currentUser.roomNumber) {
      return res.status(200).json({
        success: true,
        roommates: []
      });
    }

    // Find other students in the same room (same hostelBlock and roomNumber)
    const roommates = await User.find({
      _id: { $ne: req.user.id }, // Exclude current user
      hostelBlock: currentUser.hostelBlock,
      roomNumber: currentUser.roomNumber,
      role: 'student',
      isActive: true
    }).select('fullName phone email studentId');

    res.status(200).json({
      success: true,
      roommates
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await Payment.deleteMany({ user: user._id });
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
