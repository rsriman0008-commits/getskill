const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requester is required']
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  message: {
    type: String,
    maxlength: [500, 'Message must be less than 500 characters'],
    trim: true,
    default: ''
  },
  proposedTime: {
    type: Date,
    required: [true, 'Proposed time is required']
  },
  mode: {
    type: String,
    enum: ['Online', 'In-person'],
    required: [true, 'Mode is required']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
    default: 'pending'
  },
  requesterRating: {
    type: Number,
    min: 1,
    max: 5
  },
  recipientRating: {
    type: Number,
    min: 1,
    max: 5
  },
  requesterReview: {
    type: String,
    maxlength: [500, 'Review must be less than 500 characters']
  },
  recipientReview: {
    type: String,
    maxlength: [500, 'Review must be less than 500 characters']
  },
  acceptedAt: Date,
  completedAt: Date
}, { timestamps: true });

// Prevent self-exchange
sessionSchema.pre('save', async function(next) {
  if (this.requester.equals(this.recipient)) {
    return next(new Error('Cannot send session request to yourself'));
  }
  next();
});



// Populate related data
sessionSchema.pre(/^find/, function(next) {
  if (this.options._recursed) return next();
  
  this.populate([
    {
      path: 'requester',
      select: 'name email location -passwordHash'
    },
    {
      path: 'recipient',
      select: 'name email location -passwordHash'
    },
    {
      path: 'course',
      select: 'courseName category targetLevel overview'
    }
  ]);
  next();
});

// Index for queries
sessionSchema.index({ requester: 1, status: 1 });
sessionSchema.index({ recipient: 1, status: 1 });
sessionSchema.index({ createdAt: -1 });
sessionSchema.index({ status: 1 });

module.exports = mongoose.model('Session', sessionSchema);
