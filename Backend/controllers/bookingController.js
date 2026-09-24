const Booking = require('../models/Booking');
const Quote = require('../models/Quote');
const ServiceRequest = require('../models/ServiceRequest');
const ProviderProfile = require('../models/ProviderProfile');
const { getIO } = require('../config/socket');

const notifyUser = (userId, payload) => {
  try {
    getIO().to(`user_${userId}`).emit('bookingNotification', payload);
  } catch (error) {
    // Socket notifications are optional for API-only and test environments.
  }
};

// @desc    Create a booking from a quote
// @route   POST /api/bookings
// @access  Private/Customer
exports.createBooking = async (req, res) => {
  try {
    const { quoteId, scheduledDate, timeSlot } = req.body;

    if (!scheduledDate || !timeSlot) {
      return res.status(400).json({ message: 'Scheduled date and time slot are required' });
    }

    const quote = await Quote.findById(quoteId);
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    const svcRequest = await ServiceRequest.findById(quote.request);
    if (!svcRequest || svcRequest.customer.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Service request not found or unauthorized' });
    }

    if (svcRequest.status === 'BOOKED') {
      return res.status(400).json({ message: 'This service request is already booked' });
    }

    if (quote.status !== 'PENDING' && quote.status !== 'ACCEPTED') {
      return res.status(400).json({ message: 'This quote is no longer available' });
    }

    const booking = await Booking.create({
      request: svcRequest._id,
      quote: quote._id,
      customer: req.user.id,
      provider: quote.provider,
      scheduledDate,
      timeSlot
    });

    // Update statuses
    quote.status = 'ACCEPTED';
    await quote.save();

    svcRequest.status = 'BOOKED';
    await svcRequest.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('provider', ['name', 'email', 'role'])
      .populate('customer', ['name', 'email', 'role'])
      .populate('quote', ['amount', 'estimatedTime', 'status'])
      .populate('request', ['description', 'location', 'locationCoordinates', 'aiMetadata']);

    notifyUser(quote.provider, {
      type: 'BOOKING_CONFIRMED',
      booking: populatedBooking,
      message: `New confirmed booking from ${populatedBooking.customer.name}`
    });
    notifyUser(req.user.id, {
      type: 'BOOKING_CONFIRMED',
      booking: populatedBooking,
      message: `Your booking with ${populatedBooking.provider.name} is confirmed`
    });

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get bookings for logged-in user (Customer or Provider)
// @route   GET /api/bookings
// @access  Private (Customer/Provider)
exports.getMyBookings = async (req, res) => {
  try {
    const userRole = req.user.role;
    let query = {};

    if (userRole === 'CUSTOMER') {
      query = { customer: req.user.id };
    } else if (userRole === 'PROVIDER') {
      query = { provider: req.user.id };
    } else {
      return res.status(403).json({ message: 'Not authorized to view bookings in this context' });
    }

    const bookings = await Booking.find(query)
      .populate('provider', ['name', 'email', 'role'])
      .populate('customer', ['name', 'email', 'role'])
      .populate('quote', ['amount', 'estimatedTime', 'status'])
      .populate('request', ['description', 'location', 'locationCoordinates', 'aiMetadata'])
      .sort({ scheduledDate: 1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a provider booking's work status
// @route   PUT /api/bookings/:id/status
// @access  Private/Provider
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid booking status' });
    }

    const booking = await Booking.findOne({ _id: req.params.id, provider: req.user.id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or unauthorized' });
    }

    const validTransition = (booking.status === 'CONFIRMED' && status === 'IN_PROGRESS')
      || (booking.status === 'IN_PROGRESS' && status === 'COMPLETED');
    if (!validTransition) {
      return res.status(400).json({ message: `Cannot change booking from ${booking.status} to ${status}` });
    }

    booking.status = status;
    await booking.save();

    const requestStatus = status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'COMPLETED';
    await ServiceRequest.findByIdAndUpdate(booking.request, { status: requestStatus });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('provider', ['name', 'email', 'role'])
      .populate('customer', ['name', 'email', 'role'])
      .populate('quote', ['amount', 'estimatedTime', 'status'])
      .populate('request', ['description', 'location', 'locationCoordinates', 'aiMetadata']);
    notifyUser(booking.customer, {
      type: `BOOKING_${status}`,
      booking: populatedBooking,
      message: `Your booking is now ${status.replace('_', ' ').toLowerCase()}`
    });

    res.json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Rate a completed booking
// @route   PUT /api/bookings/:id/rating
// @access  Private/Customer
exports.rateBooking = async (req, res) => {
  try {
    const rating = Number(req.body.rating);
    const review = String(req.body.review || '').trim();
    const booking = await Booking.findOne({
      _id: req.params.id,
      customer: req.user.id,
      status: 'COMPLETED'
    });

    if (!booking) {
      return res.status(404).json({ message: 'Completed booking not found or unauthorized' });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be a whole number from 1 to 5' });
    }
    if (booking.customerRating) {
      return res.status(400).json({ message: 'This booking has already been rated' });
    }

    booking.customerRating = rating;
    booking.customerReview = review;
    await booking.save();

    const providerBookings = await Booking.find({
      provider: booking.provider,
      customerRating: { $exists: true, $ne: null }
    }).select('customerRating');
    const reviewCount = providerBookings.length;
    const averageRating = reviewCount
      ? providerBookings.reduce((sum, item) => sum + item.customerRating, 0) / reviewCount
      : 0;
    await ProviderProfile.findOneAndUpdate(
      { user: booking.provider },
      { rating: Number(averageRating.toFixed(1)), reviewCount },
      { upsert: true }
    );

    notifyUser(booking.provider, {
      type: 'BOOKING_RATED',
      bookingId: booking._id,
      message: `Your customer left a ${rating}/5 rating`
    });
    res.json({ rating: booking.customerRating, review: booking.customerReview });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
