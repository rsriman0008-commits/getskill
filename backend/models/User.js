const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const skillsTeachSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['Technology', 'Music', 'Language', 'Art', 'Cooking', 'Fitness', 'Business', 'Other'],
    required: true
  },
  proficiency: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Expert'],
    required: true
  },
  description: String,
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0, min: 0 }
}, { _id: true });

const skillsLearnSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['Technology', 'Music', 'Language', 'Art', 'Cooking', 'Fitness', 'Business', 'Other'],
    required: true
  },
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio must be less than 500 characters'],
    default: ''
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  qualification: {
    type: String,
    enum: ['B.Tech', 'MBA', 'Self-taught', 'High School', 'Diploma', 'Other'],
    default: 'Other'
  },
  interestedFields: {
    type: [String],
    default: []
  },
  skillsTeach: {
    type: [skillsTeachSchema],
    default: []
  },
  skillsLearn: {
    type: [skillsLearnSchema],
    default: []
  },
  trustScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isOnboarded: {
    type: Boolean,
    default: false
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(plainPassword) {
  return await bcrypt.compare(plainPassword, this.passwordHash);
};

// Method to get public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function() {
  const { passwordHash, ...publicData } = this.toObject();
  return publicData;
};

// Index for email lookups
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
