const express = require('express');
const router = express.Router();
const {
  submitPayment,
  getMyPayments,
  getAllPayments,
  getPendingPayments,
  updatePaymentStatus,
  getPaymentReceipt
} = require('../controllers/paymentController');
const { protect, authorize, studentOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, studentOnly, upload.single('bankSlip'), submitPayment);
router.get('/my-payments', protect, studentOnly, getMyPayments);
router.get('/pending', protect, authorize('admin'), getPendingPayments);
router.get('/:id/receipt', protect, getPaymentReceipt);
router.get('/', protect, authorize('admin'), getAllPayments);
router.put('/:id/status', protect, authorize('admin'), updatePaymentStatus);

module.exports = router;
