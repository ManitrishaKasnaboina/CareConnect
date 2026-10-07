const mongoose = require('mongoose');

const providerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 80
  },
  headline: {
    type: String,
    trim: true,
    maxlength: 120
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  serviceCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory'
  }],
  skills: [{
    type: String,
    trim: true
  }],
  languages: [{
    type: String,
    trim: true
  }],
  experienceYears: {
    type: Number,
    default: 0,
    min: 0
  },
  serviceArea: {
    type: String,
    required: [true, 'Please provide a service area']
  },
  hourlyRate: {
    type: Number,
    default: 0,
    min: 0
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 1500
  },
  profileImage: {
    type: String,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);
