const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required']
  },
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    minlength: [3, 'Course name must be at least 3 characters'],
    maxlength: [100, 'Course name must be less than 100 characters']
  },
  category: {
    type: String,
    enum: ['Technology', 'Music', 'Language', 'Art', 'Cooking', 'Fitness', 'Business', 'Other'],
    required: [true, 'Category is required']
  },
  qualification: {
    type: String,
    required: [true, 'Your qualification for this skill is required'],
    maxlength: [1000, 'Qualification description must be less than 1000 characters']
  },
  targetLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: [true, 'Target level is required']
  },
  whatYouLearn: {
    type: [String],
    required: [true, 'At least one learning outcome is required'],
    validate: {
      validator: function(arr) {
        return arr && arr.length > 0 && arr.length <= 10;
      },
      message: 'Please provide 1-10 learning outcomes'
    }
  },
  keyFeatures: {
    type: [String],
    validate: {
      validator: function(arr) {
        return arr.length <= 5;
      },
      message: 'Key features must be 5 or less'
    },
    default: []
  },
  overview: {
    type: String,
    required: [true, 'Course overview is required'],
    maxlength: [2000, 'Overview must be less than 2000 characters']
  },
  timePreference: {
    type: [String],
    enum: ['Morning', 'Afternoon', 'Evening', 'Weekends', 'Flexible'],
    validate: {
      validator: function(arr) {
        return arr && arr.length > 0;
      },
      message: 'At least one time preference is required'
    }
  },
  mode: {
    type: String,
    enum: ['Online', 'In-person', 'Both'],
    required: [true, 'Mode is required']
  },
  exchangeWanted: {
    type: String,
    maxlength: [500, 'Exchange wanted must be less than 500 characters'],
    default: ''
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for searches
courseSchema.index({ category: 1 });
courseSchema.index({ teacher: 1 });
courseSchema.index({ courseName: 'text', overview: 'text' });

// Update updatedAt before save
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Populate teacher details by default
courseSchema.pre(/^find/, function(next) {
  if (this.options._recursed) return next();
  
  this.populate({
    path: 'teacher',
    select: 'name email skillsTeach -passwordHash'
  });
  next();
});

module.exports = mongoose.model('Course', courseSchema);
