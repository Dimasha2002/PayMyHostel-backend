const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Notice = require('../models/Notice');
const Room = require('../models/Room');

// @desc    Admin login (hardcoded credentials)
// @route   POST /api/admin/login
// @access  Public
exports.adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Hardcoded admin credentials
    if (username !== 'Hostel' || password !== 'H123') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    const token = jwt.sign(
      { id: 'admin', role: 'admin', username: 'Hostel' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        username: 'Hostel',
        role: 'admin'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const approvedPayments = await Payment.countDocuments({ status: 'success' });
    const rejectedPayments = await Payment.countDocuments({ status: 'rejected' });
    const activeNotices = await Notice.countDocuments({ isActive: true });

    // Calculate total revenue (approved payments only)
    const revenueData = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Get room occupancy
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ currentOccupancy: { $gt: 0 } });

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        pendingPayments,
        approvedPayments,
        rejectedPayments,
        totalPayments: pendingPayments + approvedPayments + rejectedPayments,
        totalRevenue,
        activeNotices,
        totalRooms,
        occupiedRooms,
        vacantRooms: totalRooms - occupiedRooms
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get room occupancy details
// @route   GET /api/admin/rooms
// @access  Private/Admin
exports.getRoomOccupancy = async (req, res, next) => {
  try {
    const { block, room } = req.query;
    const filter = {};

    if (block) filter.hostelBlock = block;
    if (room) filter.roomNumber = room;

    const rooms = await Room.find(filter)
      .populate('residents', 'fullName studentId email phone')
      .sort({ hostelBlock: 1, roomNumber: 1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      rooms
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve payment
// @route   PUT /api/admin/payments/:id/approve
// @access  Private/Admin
exports.approvePayment = async (req, res, next) => {
  try {
    const { adminNotes } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    payment.status = 'success';
    payment.adminNotes = adminNotes || '';
    payment.verifiedBy = req.user.id;
    payment.verifiedAt = Date.now();

    await payment.save();
    await payment.populate('user', 'fullName studentId email');

    res.status(200).json({
      success: true,
      message: 'Payment approved successfully',
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject payment
// @route   PUT /api/admin/payments/:id/reject
// @access  Private/Admin
exports.rejectPayment = async (req, res, next) => {
  try {
    const { adminNotes } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    payment.status = 'rejected';
    payment.adminNotes = adminNotes || '';
    payment.verifiedBy = req.user.id;
    payment.verifiedAt = Date.now();

    await payment.save();
    await payment.populate('user', 'fullName studentId email');

    res.status(200).json({
      success: true,
      message: 'Payment rejected',
      payment
    });
  } catch (error) {
    next(error);
  }
};
