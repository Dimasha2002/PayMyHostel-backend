const express = require('express');
const router = express.Router();
const {
  getNotices,
  getAllNotices,
  getNotice,
  createNotice,
  updateNotice,
  deleteNotice
} = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getNotices);
router.get('/admin/all', protect, authorize('admin'), getAllNotices);
router.get('/:id', protect, getNotice);
router.post('/', protect, authorize('admin'), createNotice);
router.put('/:id', protect, authorize('admin'), updateNotice);
router.delete('/:id', protect, authorize('admin'), deleteNotice);

module.exports = router;
