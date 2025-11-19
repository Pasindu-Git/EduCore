// controllers/examController.js
const Exam = require('../Model/Exam');

const isTrue = (v) => String(v).toLowerCase() === 'true';

exports.getExams = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      subject,
      examType,
      stream,
      batch,
      startDate,
      endDate,
      upcoming = false
    } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    let query = { isActive: true };

    // Students can see ALL active data (no stream/batch filtering)
    if ((req.user.role || '').toLowerCase() !== 'student') {
      if (stream) query.stream = stream;
      if (batch) query.batch = batch;
    }

    if (subject) query.subject = subject;
    if (examType) query.examType = examType;

    if (isTrue(upcoming)) {
      query.date = { $gte: new Date() };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const exams = await Exam.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: 1, startTime: 1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Exam.countDocuments(query);

    res.json({
      exams,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    });
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUpcomingExams = async (req, res) => {
  try {
    const limitNum = Number(req.query.limit) || 5;

    let query = {
      isActive: true,
      date: { $gte: new Date() }
    };

    if ((req.user.role || '').toLowerCase() !== 'student') {
      const { stream, batch } = req.query;
      if (stream) query.stream = stream;
      if (batch) query.batch = batch;
    }

    const exams = await Exam.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: 1, startTime: 1 })
      .limit(limitNum);

    res.json({ exams });
  } catch (error) {
    console.error('Get upcoming exams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createExam = async (req, res) => {
  try {
    const {
      subject,
      examType,
      date,
      startTime,
      endTime,
      venue,
      chapters,
      syllabus,
      stream,
      batch,
      totalMarks,
      duration,
      instructions
    } = req.body;

    const exam = new Exam({
      subject,
      examType,
      date,
      startTime,
      endTime,
      venue,
      chapters: chapters || [],
      syllabus,
      stream,
      batch,
      totalMarks: totalMarks ?? 100,
      duration,
      instructions,
      createdBy: req.user._id
    });

    await exam.save();
    await exam.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Exam schedule created successfully',
      exam
    });
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam || !exam.isActive) {
      return res.status(404).json({ message: 'Exam schedule not found' });
    }

    const {
      subject,
      examType,
      date,
      startTime,
      endTime,
      venue,
      chapters,
      syllabus,
      stream,
      batch,
      totalMarks,
      duration,
      instructions
    } = req.body;

    const updateData = {};
    if (subject !== undefined) updateData.subject = subject;
    if (examType !== undefined) updateData.examType = examType;
    if (date !== undefined) updateData.date = date;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (venue !== undefined) updateData.venue = venue;
    if (chapters !== undefined) updateData.chapters = chapters;
    if (syllabus !== undefined) updateData.syllabus = syllabus;
    if (stream !== undefined) updateData.stream = stream;
    if (batch !== undefined) updateData.batch = batch;
    if (totalMarks !== undefined) updateData.totalMarks = totalMarks;
    if (duration !== undefined) updateData.duration = duration;
    if (instructions !== undefined) updateData.instructions = instructions;

    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      message: 'Exam schedule updated successfully',
      exam: updatedExam
    });
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam schedule not found' });

    exam.isActive = false;
    await exam.save();

    res.json({ message: 'Exam schedule deleted successfully' });
  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSubjects = async (req, res) => {
  try {
    let query = { isActive: true };
    if ((req.user.role || '').toLowerCase() !== 'student') {
      const { stream, batch } = req.query;
      if (stream) query.stream = stream;
      if (batch) query.batch = batch;
    }

    const subjects = await Exam.distinct('subject', query);
    res.json({ subjects });
  } catch (error) {
    console.error('Get exam subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCalendarExams = async (req, res) => {
  try {
    const { startDate, endDate, stream, batch } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    let query = {
      isActive: true,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    };

    if ((req.user.role || '').toLowerCase() === 'student') {
      if (req.user.stream) query.stream = req.user.stream;
      if (req.user.batch) query.batch = req.user.batch;
    } else {
      if (stream) query.stream = stream;
      if (batch) query.batch = batch;
    }

    const exams = await Exam.find(query)
      .select('subject examType date startTime endTime venue totalMarks duration')
      .sort({ date: 1, startTime: 1 });

    res.json({ exams });
  } catch (error) {
    console.error('Get exam calendar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
