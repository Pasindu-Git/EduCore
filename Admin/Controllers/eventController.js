// controllers/eventController.js
const Event = require('../Model/Event');

// Helper: normalize bool query strings
const isTrue = (v) => String(v).toLowerCase() === 'true';

exports.getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      eventType,
      stream,
      batch,
      startDate,
      endDate,
      upcoming = false
    } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    let query = { isActive: true };

    // Students: show ALL active data (no stream/batch filter)
    if ((req.user.role || '').toLowerCase() === 'student') {
      // no stream/batch filter for list endpoint
    } else {
      if (stream) query.stream = stream;
      if (batch) query.batch = batch;
    }

    if (eventType) query.eventType = eventType;

    if (isTrue(upcoming)) {
      query.date = { $gte: new Date() };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: 1, startTime: 1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUpcomingEvents = async (req, res) => {
  try {
    const limitNum = Number(req.query.limit) || 5;

    let query = {
      isActive: true,
      date: { $gte: new Date() }
    };

    if ((req.user.role || '').toLowerCase() === 'student') {
      // students: still show all active upcoming (no stream/batch)
    } else {
      const { stream, batch } = req.query;
      if (stream) query.stream = stream;
      if (batch) query.batch = batch;
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: 1, startTime: 1 })
      .limit(limitNum);

    res.json({ events });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      eventType,
      date,
      startTime,
      endTime,
      venue,
      speaker,
      targetAudience,
      stream,
      batch,
      maxParticipants,
      registrationRequired,
      registrationDeadline
    } = req.body;

    const event = new Event({
      title,
      description,
      eventType,
      date,
      startTime,
      endTime,
      venue,
      speaker,
      targetAudience: targetAudience || [],
      stream,
      batch,
      maxParticipants,
      registrationRequired: registrationRequired || false,
      registrationDeadline,
      createdBy: req.user._id
    });

    await event.save();
    await event.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event || !event.isActive) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const {
      title,
      description,
      eventType,
      date,
      startTime,
      endTime,
      venue,
      speaker,
      targetAudience,
      stream,
      batch,
      maxParticipants,
      registrationRequired,
      registrationDeadline
    } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (eventType !== undefined) updateData.eventType = eventType;
    if (date !== undefined) updateData.date = date;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (venue !== undefined) updateData.venue = venue;
    if (speaker !== undefined) updateData.speaker = speaker;
    if (targetAudience !== undefined) updateData.targetAudience = targetAudience;
    if (stream !== undefined) updateData.stream = stream;
    if (batch !== undefined) updateData.batch = batch;
    if (maxParticipants !== undefined) updateData.maxParticipants = maxParticipants;
    if (registrationRequired !== undefined) updateData.registrationRequired = registrationRequired;
    if (registrationDeadline !== undefined) updateData.registrationDeadline = registrationDeadline;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.isActive = false;
    await event.save();

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCalendarEvents = async (req, res) => {
  try {
    const { startDate, endDate, stream, batch } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    let query = {
      isActive: true,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    };

    // Students: only their stream/batch for calendar view
    if ((req.user.role || '').toLowerCase() === 'student') {
      if (req.user.stream) query.stream = req.user.stream;
      if (req.user.batch) query.batch = req.user.batch;
    } else {
      if (stream) query.stream = stream;
      if (batch) query.batch = batch;
    }

    const events = await Event.find(query)
      .select('title eventType date startTime endTime venue speaker')
      .sort({ date: 1, startTime: 1 });

    res.json({ events });
  } catch (error) {
    console.error('Get event calendar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
