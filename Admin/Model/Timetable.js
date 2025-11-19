const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true,
    trim: true
  },
  stream: {
    type: String,
    trim: true
  },
  batch: {
    type: String,
    trim: true
  },
  instructor: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
timetableSchema.index({ subject: 1, date: 1 });
timetableSchema.index({ stream: 1, batch: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);
