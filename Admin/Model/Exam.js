const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  examType: {
    type: String,
    enum: ['midterm', 'final', 'quiz', 'assignment'],
    required: true
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
  chapters: [{
    type: String,
    trim: true
  }],
  syllabus: {
    type: String,
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
  totalMarks: {
    type: Number,
    default: 100
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  instructions: {
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
examSchema.index({ subject: 1, date: 1 });
examSchema.index({ stream: 1, batch: 1 });

module.exports = mongoose.model('Exam', examSchema);
