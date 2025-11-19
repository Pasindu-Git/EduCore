// routes/timetable.js
const express = require('express');
const { body, validationResult } = require('express-validator');

const controller = require('../Controllers/timetableController');

const router = express.Router();

// Validation result handler
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors || errors.isEmpty()) return next();
  return res.status(400).json({ errors: errors.array() });
};

// @route   GET /api/timetable
// @desc    Get timetable entries
// @access  Private
router.get('/', auth, controller.getTimetable);

// @route   GET /api/timetable/weekly
// @desc    Get weekly timetable
// @access  Private
router.get('/weekly', auth, controller.getWeeklyTimetable);

// @route   POST /api/timetable
// @desc    Create new timetable entry
// @access  Private/Admin
router.post(
  '/',
  auth,
  adminAuth,
  body('subject').notEmpty().withMessage('Subject is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').notEmpty().withMessage('Start time is required'),
  body('endTime').notEmpty().withMessage('End time is required'),
  body('venue').notEmpty().withMessage('Venue is required'),
  handleValidation,
  controller.createTimetable
);

// @route   PUT /api/timetable/:id
// @desc    Update timetable entry
// @access  Private/Admin
router.put(
  '/:id',
  auth,
  adminAuth,
  body('subject').optional().notEmpty().withMessage('Subject cannot be empty'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('startTime').optional().notEmpty().withMessage('Start time cannot be empty'),
  body('endTime').optional().notEmpty().withMessage('End time cannot be empty'),
  body('venue').optional().notEmpty().withMessage('Venue cannot be empty'),
  handleValidation,
  controller.updateTimetable
);

// @route   DELETE /api/timetable/:id
// @desc    Soft delete timetable entry
// @access  Private/Admin
router.delete('/:id', auth, adminAuth, controller.deleteTimetable);

// @route   GET /api/timetable/subjects
// @desc    Get all subjects
// @access  Private
router.get('/subjects', auth, controller.getSubjects);

module.exports = router;
