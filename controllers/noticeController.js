const Notice = require('../models/Notice');

const formatNotice = (noticeDoc) => {
  if (!noticeDoc) return null;
  const notice = noticeDoc.toObject();
  notice.createdByName = typeof notice.createdBy === 'string'
    ? notice.createdBy
    : notice.createdBy?.fullName || 'Admin';
  return notice;
};

// @desc    Get all active notices
// @route   GET /api/notices
// @access  Private
exports.getNotices = async (req, res, next) => {
  try {
    const { type, priority } = req.query;
    const filter = { isActive: true };

    if (type) filter.type = type;
    if (priority) filter.priority = priority;

    const notices = await Notice.find(filter)
      .sort({ priority: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notices.length,
      notices: notices.map(formatNotice)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all notices (Admin - including inactive)
// @route   GET /api/notices/admin/all
// @access  Private/Admin
exports.getAllNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notices.length,
      notices: notices.map(formatNotice)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single notice
// @route   GET /api/notices/:id
// @access  Private
exports.getNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    res.status(200).json({
      success: true,
      notice: formatNotice(notice)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a notice (Admin only)
// @route   POST /api/notices
// @access  Private/Admin
exports.createNotice = async (req, res, next) => {
  try {
    const { title, content, type, priority, expiryDate } = req.body;

    const notice = await Notice.create({
      title,
      content,
      type,
      priority,
      expiryDate,
      createdBy: req.user.role === 'admin' ? 'admin' : req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Notice created successfully',
      notice
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a notice (Admin only)
// @route   PUT /api/notices/:id
// @access  Private/Admin
exports.updateNotice = async (req, res, next) => {
  try {
    const { title, content, type, priority, isActive, expiryDate } = req.body;

    let notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    notice.title = title || notice.title;
    notice.content = content || notice.content;
    notice.type = type || notice.type;
    notice.priority = priority || notice.priority;
    
    if (typeof isActive !== 'undefined') notice.isActive = isActive;
    if (expiryDate) notice.expiryDate = expiryDate;

    await notice.save();

    res.status(200).json({
      success: true,
      message: 'Notice updated successfully',
      notice
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a notice (Admin only)
// @route   DELETE /api/notices/:id
// @access  Private/Admin
exports.deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    await notice.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notice deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
