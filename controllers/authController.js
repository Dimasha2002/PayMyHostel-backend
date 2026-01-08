const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../utils/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { fullName, studentId, email, password, phone, hostelBlock, roomNumber } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { studentId }] });
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or student ID already exists'
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      studentId,
      email,
      password,
      phone,
      hostelBlock,
      roomNumber
    });

    // Generate token
    const token = generateToken(user._id);

    // Send welcome email (async, don't wait for it)
    sendWelcomeEmail({
      fullName: user.fullName,
      studentId: user.studentId,
      email: user.email,
      hostelBlock: user.hostelBlock,
      roomNumber: user.roomNumber
    }).catch(err => console.error('Failed to send welcome email:', err));

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        studentId: user.studentId,
        email: user.email,
        phone: user.phone,
        hostelBlock: user.hostelBlock,
        roomNumber: user.roomNumber,
        role: user.role,
        lastPasswordChange: user.lastPasswordChange
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact admin.'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        studentId: user.studentId,
        email: user.email,
        phone: user.phone,
        hostelBlock: user.hostelBlock,
        roomNumber: user.roomNumber,
        role: user.role,
        lastPasswordChange: user.lastPasswordChange
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        studentId: user.studentId,
        email: user.email,
        phone: user.phone,
        hostelBlock: user.hostelBlock,
        roomNumber: user.roomNumber,
        role: user.role,
        checkInDate: user.checkInDate,
        lastPasswordChange: user.lastPasswordChange
      }
    });
  } catch (error) {
    next(error);
  }
};
