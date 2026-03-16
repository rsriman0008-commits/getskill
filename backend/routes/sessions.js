const express = require('express');
const Session = require('../models/Session');
const Course = require('../models/Course');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * POST /api/sessions
 * Send a session request
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { recipientId, courseId, message, proposedTime, mode } = req.body;

    // Validate input
    if (!recipientId || !courseId || !proposedTime || !mode) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: 'Recipient not found'
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Prevent self-request
    if (req.userId.toString() === recipientId.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot send request to yourself'
      });
    }

    // Check if a pending session already exists
    const existingSession = await Session.findOne({
      requester: req.userId,
      recipient: recipientId,
      course: courseId,
      status: 'pending'
    });

    if (existingSession) {
      return res.status(400).json({
        success: false,
        error: 'You already have a pending request for this course'
      });
    }

    const newSession = new Session({
      requester: req.userId,
      recipient: recipientId,
      course: courseId,
      message: message || '',
      proposedTime: new Date(proposedTime),
      mode
    });

    await newSession.save();
    await newSession.populate([
      { path: 'requester', select: 'name email -passwordHash' },
      { path: 'recipient', select: 'name email -passwordHash' },
      { path: 'course', select: 'courseName category -passwordHash' }
    ]);

    // Emit socket event for real-time notification (handled by Socket.io in server.js)
    global.io?.to(recipientId.toString()).emit('new_request', {
      sessionId: newSession._id,
      requester: newSession.requester,
      course: newSession.course,
      message: newSession.message
    });

    res.status(201).json({
      success: true,
      message: 'Session request sent successfully',
      session: newSession
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/sessions/my
 * Get all sessions for current user (incoming + outgoing)
 */
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {
      $or: [
        { requester: req.userId },
        { recipient: req.userId }
      ]
    };

    if (status) query.status = status;

    const sessions = await Session.find(query)
      .populate('requester', 'name email location -passwordHash')
      .populate('recipient', 'name email location -passwordHash')
      .populate('course', 'courseName category targetLevel')
      .sort({ createdAt: -1 });

    // Separate into incoming and outgoing
    const incoming = sessions.filter(s => s.recipient._id.toString() === req.userId.toString());
    const outgoing = sessions.filter(s => s.requester._id.toString() === req.userId.toString());

    res.status(200).json({
      success: true,
      incoming,
      outgoing,
      total: sessions.length
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/sessions/:id/accept
 * Accept a session request
 */
router.put('/:id/accept', authMiddleware, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Check if user is the recipient
    if (session.recipient.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to accept this request'
      });
    }

    if (session.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Cannot accept a ${session.status} request`
      });
    }

    session.status = 'accepted';
    session.acceptedAt = new Date();
    await session.save();

    // Emit socket event
    global.io?.to(session.requester.toString()).emit('request_update', {
      sessionId: session._id,
      status: 'accepted',
      message: 'Your request has been accepted'
    });

    res.status(200).json({
      success: true,
      message: 'Session request accepted',
      session
    });
  } catch (error) {
    console.error('Error accepting session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/sessions/:id/decline
 * Decline a session request
 */
router.put('/:id/decline', authMiddleware, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Check if user is the recipient
    if (session.recipient.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to decline this request'
      });
    }

    if (session.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Cannot decline a ${session.status} request`
      });
    }

    session.status = 'declined';
    await session.save();

    // Emit socket event
    global.io?.to(session.requester.toString()).emit('request_update', {
      sessionId: session._id,
      status: 'declined',
      message: 'Your request has been declined'
    });

    res.status(200).json({
      success: true,
      message: 'Session request declined',
      session
    });
  } catch (error) {
    console.error('Error declining session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/sessions/:id/complete
 * Mark session as completed and add ratings
 */
router.put('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const { rating, review } = req.body;

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    if (session.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        error: 'Session must be accepted before completion'
      });
    }

    // Check if user is requester or recipient
    const isRequester = session.requester.toString() === req.userId.toString();
    const isRecipient = session.recipient.toString() === req.userId.toString();

    if (!isRequester && !isRecipient) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to complete this session'
      });
    }

    // Add rating based on who's submitting
    if (isRequester) {
      session.requesterRating = rating;
      session.requesterReview = review || '';
    } else {
      session.recipientRating = rating;
      session.recipientReview = review || '';
    }

    // Mark as completed if both parties have rated
    if (session.requesterRating && session.recipientRating) {
      session.status = 'completed';
      session.completedAt = new Date();

      // Update teacher rating in User model
      const course = await Course.findById(session.course);
      if (course) {
        const teacher = course.teacher;
        const skillIndex = (await User.findById(teacher)).skillsTeach.findIndex(
          s => s.title === course.courseName
        );

        if (skillIndex !== -1) {
          const user = await User.findById(teacher);
          user.skillsTeach[skillIndex].ratingCount += 1;
          user.skillsTeach[skillIndex].rating = 
            (user.skillsTeach[skillIndex].rating * (user.skillsTeach[skillIndex].ratingCount - 1) + session.recipientRating) /
            user.skillsTeach[skillIndex].ratingCount;
          await user.save();
        }

        // Update course rating
        course.ratingCount += 1;
        course.averageRating = 
          (course.averageRating * (course.ratingCount - 1) + session.recipientRating) / course.ratingCount;
        await course.save();
      }
    }

    await session.save();

    res.status(200).json({
      success: true,
      message: session.status === 'completed' ? 'Session completed' : 'Rating submitted',
      session
    });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
