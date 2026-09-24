const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: true
  },
  quote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Please provide a scheduled date']
  },
  timeSlot: {
    type: String, // E.g., "10:00 AM - 11:00 AM"
    required: [true, 'Please provide a time slot']
  },
  status: {
    type: String,
    enum: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'CONFIRMED'
  },
  customerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  customerReview: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
