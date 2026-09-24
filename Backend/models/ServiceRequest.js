const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory',
    // Temporarily optional until AI classification is fully in place, but good to have
  },
  description: {
    type: String,
    required: [true, 'Please describe the problem']
  },
  location: {
    type: String,
    required: [true, 'Please provide a location']
  },
  locationCoordinates: {
    lat: { type: Number, min: -90, max: 90 },
    lng: { type: Number, min: -180, max: 180 }
  },
  images: [{
    type: String // Array of URLs for evidence photos
  }],
  aiMetadata: {
    categoryName: String,
    subCategory: String,
    isEmergency: Boolean,
    urgencyReason: String,
    estimatedQuote: {
      min: Number,
      max: Number,
      currency: String
    },
    confidenceScore: Number
  },
  status: {
    type: String,
    enum: ['PENDING', 'QUOTED', 'BOOKED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
