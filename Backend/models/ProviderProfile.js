const mongoose = require('mongoose');

const providerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  serviceCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory'
  }],
  skills: [{
    type: String
  }],
  experienceYears: {
    type: Number,
    default: 0
  },
  serviceArea: {
    type: String, // E.g., "New York", "10001"
    required: [true, 'Please provide a service area']
  },
  bio: {
    type: String
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
