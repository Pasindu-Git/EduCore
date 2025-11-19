// controllers/timetableController.js
const Timetable = require('../Model/Timetable');

exports.getTimetable = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      subject,
      stream,
      batch,
      startDate,
      endDate
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

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const timetable = await Timetable.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: 1, startTime: 1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Timetable.countDocuments(query);

    res.json({
      timetable,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    });
  } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getWeeklyTimetable = async (req, res) => {
  try {
    const { weekStart, stream, batch } = req.query;
    if (!weekStart) {
      return res.status(400).json({ message: 'Week start date is required' });
    }

    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    let query = {
      isActive: true,
      date: { $gte: startDate, $lte: endDate }
    };

    // Students can see ALL active data (no stream/batch filtering)
    if ((req.user.role || '').toLowerCase() !== 'student') {
      if (stream) query.stream = stream;
      if (batch) query.batch = batch;
    }

    const timetable = await Timetable.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: 1, startTime: 1 });

    res.json({ timetable });
  } catch (error) {
    console.error('Get weekly timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createTimetable = async (req, res) => {
  try {
    const {
      subject,
      date,
      startTime,
      endTime,
      venue,
      stream,
      batch,
      instructor,
      description
    } = req.body;

    const timetable = new Timetable({
      subject,
      date,
      startTime,
      endTime,
      venue,
      stream,
      batch,
      instructor,
      description,
      createdBy: req.user._id
    });

    await timetable.save();
    await timetable.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Timetable entry created successfully',
      timetable
    });
  } catch (error) {
    console.error('Create timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTimetable = async (req, res) => {
  try {
    const existing = await Timetable.findById(req.params.id);
    if (!existing || !existing.isActive) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    const {
      subject,
      date,
      startTime,
      endTime,
      venue,
      stream,
      batch,
      instructor,
      description
    } = req.body;

    const updateData = {};
    if (subject !== undefined) updateData.subject = subject;
    if (date !== undefined) updateData.date = date;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (venue !== undefined) updateData.venue = venue;
    if (stream !== undefined) updateData.stream = stream;
    if (batch !== undefined) updateData.batch = batch;
    if (instructor !== undefined) updateData.instructor = instructor;
    if (description !== undefined) updateData.description = description;

    const updated = await Timetable.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      message: 'Timetable entry updated successfully',
      timetable: updated
    });
  } catch (error) {
    console.error('Update timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    timetable.isActive = false;
    await timetable.save();

    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    console.error('Delete timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSubjects = async (req, res) => {
  try {
    let query = { isActive: true };

    // Students can see ALL active data (no stream/batch filtering)
    if ((req.user.role || '').toLowerCase() !== 'student') {
      const { stream, batch } = req.query;
      if (stream) query.stream = stream;
      if (batch) query.batch = batch;
    }

    const subjects = await Timetable.distinct('subject', query);
    res.json({ subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
