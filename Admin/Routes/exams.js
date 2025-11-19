// routes/exams.js
const express = require('express');
const { body, validationResult } = require('express-validator');

const controller = require('../Controllers/examController');

const router = express.Router();

// tiny helper to surface validation errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors || errors.isEmpty()) return next();
  return res.status(400).json({ errors: errors.array() });
};

// @route   GET /api/exams
// @desc    Get exam schedules
// @access  Private
router.get('/', auth, controller.getExams);

// @route   GET /api/exams/upcoming
// @desc    Get upcoming exams
// @access  Private
router.get('/upcoming', auth, controller.getUpcomingExams);

// @route   POST /api/exams
// @desc    Create new exam schedule
// @access  Private/Admin
router.post(
  '/',
  auth,
  adminAuth,
  body('subject').notEmpty().withMessage('Subject is required'),
  body('examType')
    .isIn(['midterm', 'final', 'quiz', 'assignment'])
    .withMessage('Valid exam type is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').notEmpty().withMessage('Start time is required'),
  body('endTime').notEmpty().withMessage('End time is required'),
  body('venue').notEmpty().withMessage('Venue is required'),
  body('duration').isNumeric().withMessage('Duration must be a number'),
  handleValidation,
  controller.createExam
);

// @route   PUT /api/exams/:id
// @desc    Update exam schedule
// @access  Private/Admin
router.put(
  '/:id',
  auth,
  adminAuth,
  body('subject').optional().notEmpty().withMessage('Subject cannot be empty'),
  body('examType')
    .optional()
    .isIn(['midterm', 'final', 'quiz', 'assignment'])
    .withMessage('Valid exam type is required'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('startTime').optional().notEmpty().withMessage('Start time cannot be empty'),
  body('endTime').optional().notEmpty().withMessage('End time cannot be empty'),
  body('venue').optional().notEmpty().withMessage('Venue cannot be empty'),
  body('duration').optional().isNumeric().withMessage('Duration must be a number'),
  handleValidation,
  controller.updateExam
);

// @route   DELETE /api/exams/:id
// @desc    Soft delete
// @access  Private/Admin
router.delete('/:id', auth, adminAuth, controller.deleteExam);

// @route   GET /api/exams/subjects
// @desc    Get all exam subjects
// @access  Private
router.get('/subjects', auth, controller.getSubjects);

// @route   GET /api/exams/calendar
// @desc    Get exams for calendar view
// @access  Private
router.get('/calendar', auth, controller.getCalendarExams);

module.exports = router;
