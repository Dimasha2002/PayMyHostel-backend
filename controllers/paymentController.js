const Payment = require('../models/Payment');

// @desc    Submit a new payment
// @route   POST /api/payments
// @access  Private
exports.submitPayment = async (req, res, next) => {
  try {
    const { amount, description, paymentDate, month, year } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a bank slip'
      });
    }

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide payment month and year'
      });
    }

    const payment = await Payment.create({
      user: req.user.id,
      amount: amount || 20000,
      month,
      year,
      description: description || '',
      paymentDate,
      bankSlip: req.file.path,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Payment submitted successfully',
      payment: {
        id: payment._id,
        amount: payment.amount,
        month: payment.month,
        year: payment.year,
        reference: payment.reference,
        status: payment.status,
        date: payment.paymentDate
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's payment history
// @route   GET /api/payments/my-payments
// @access  Private
exports.getMyPayments = async (req, res, next) => {
  try {
    const { month, year, status } = req.query;
    const filter = { user: req.user.id };

    if (month) filter.month = month;
    if (year) filter.year = year;
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments: payments.map(p => ({
        id: p._id,
        amount: p.amount,
        month: p.month,
        year: p.year,
        method: p.method,
        status: p.status,
        reference: p.reference,
        description: p.description,
        date: p.paymentDate,
        createdAt: p.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments (Admin only)
// @route   GET /api/payments
// @access  Private/Admin
exports.getAllPayments = async (req, res, next) => {
  try {
    const { month, year, status } = req.query;
    const filter = {};

    if (month) filter.month = month;
    if (year) filter.year = year;
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .populate('user', 'fullName studentId email phone hostelBlock roomNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status (Admin only)
// @route   PUT /api/payments/:id/status
// @access  Private/Admin
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    payment.status = status;
    payment.adminNotes = adminNotes;
    payment.verifiedBy = req.user.id;
    payment.verifiedAt = Date.now();

    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending payments (Admin only)
// @route   GET /api/payments/pending
// @access  Private/Admin
exports.getPendingPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ status: 'pending' })
      .populate('user', 'fullName studentId email phone hostelBlock roomNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment receipt (Admin/Student)
// @route   GET /api/payments/:id/receipt
// @access  Private
exports.getPaymentReceipt = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'fullName studentId email phone hostelBlock roomNumber');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && payment.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this receipt'
      });
    }

    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    next(error);
  }
};
