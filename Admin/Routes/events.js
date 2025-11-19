// Routes/events.js
const express = require('express');
const { body, validationResult } = require('express-validator');


const controller = require('../Controllers/eventController');


const router = express.Router();

// Centralized validation error handler
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors || errors.isEmpty()) return next();
  return res.status(400).json({ errors: errors.array() });
};

// @route   GET /api/events
// @desc    Get special events
// @access  Private
router.get('/', auth, controller.getEvents);

// @route   GET /api/events/upcoming
// @desc    Get upcoming events
// @access  Private
router.get('/upcoming', auth, controller.getUpcomingEvents);

// @route   POST /api/events
// @desc    Create new event
// @access  Private/Admin
router.post(
  '/',
  auth,
  adminAuth,
  body('title').notEmpty().withMessage('Title is required'),
  body('eventType')
    .isIn(['seminar', 'workshop', 'guest_lecture', 'conference', 'other'])
    .withMessage('Valid event type is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').notEmpty().withMessage('Start time is required'),
  body('endTime').notEmpty().withMessage('End time is required'),
  body('venue').notEmpty().withMessage('Venue is required'),
  handleValidation,
  controller.createEvent
);

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private/Admin
router.put(
  '/:id',
  auth,
  adminAuth,
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('eventType')
    .optional()
    .isIn(['seminar', 'workshop', 'guest_lecture', 'conference', 'other'])
    .withMessage('Valid event type is required'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('startTime').optional().notEmpty().withMessage('Start time cannot be empty'),
  body('endTime').optional().notEmpty().withMessage('End time cannot be empty'),
  body('venue').optional().notEmpty().withMessage('Venue cannot be empty'),
  handleValidation,
  controller.updateEvent
);

// @route   DELETE /api/events/:id
// @desc    Soft delete (isActive=false)
// @access  Private/Admin
router.delete('/:id', auth, adminAuth, controller.deleteEvent);

// @route   GET /api/events/calendar
// @desc    Get events for calendar view
// @access  Private
router.get('/calendar', auth, controller.getCalendarEvents);

module.exports = router;
