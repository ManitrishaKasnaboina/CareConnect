const Quote = require('../models/Quote');
const ServiceRequest = require('../models/ServiceRequest');
const { getIO } = require('../config/socket');

const notifyUser = (userId, payload) => {
  try {
    getIO().to(`user_${userId}`).emit('bookingNotification', payload);
  } catch (error) {
    // Socket notifications are optional for API-only and test environments.
  }
};

// @desc    Get all quotes for the logged-in provider
// @route   GET /api/quotes/me
// @access  Private/Provider
exports.getMyQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find({ provider: req.user.id })
      .populate('request', ['description', 'status', 'location'])
      .sort({ createdAt: -1 });

    res.json(quotes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Submit a quote for a request
// @route   POST /api/quotes
// @access  Private/Provider
exports.submitQuote = async (req, res) => {
  try {
    const { request, amount, estimatedTime } = req.body;

    const svcRequest = await ServiceRequest.findById(request);
    if (!svcRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    // Ensure the provider hasn't already quoted for this request
    const existingQuote = await Quote.findOne({ request, provider: req.user.id });
    if (existingQuote) {
      return res.status(400).json({ message: 'You have already submitted a quote for this request' });
    }

    const quote = await Quote.create({
      request,
      provider: req.user.id,
      amount,
      estimatedTime
    });

    // Keep the request available for other providers until the customer books it.
    if (svcRequest.status === 'PENDING') {
      svcRequest.status = 'QUOTED';
      await svcRequest.save();
    }

    notifyUser(svcRequest.customer, {
      type: 'QUOTE_PENDING',
      message: `A provider submitted a pending quote of ₹${Number(amount).toLocaleString('en-IN')}`,
      quote
    });

    res.status(201).json(quote);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get quotes for a specific request
// @route   GET /api/quotes/request/:id
// @access  Private/Customer
exports.getQuotesForRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    
    // Ensure the request belongs to the customer
    const svcRequest = await ServiceRequest.findById(requestId);
    if (!svcRequest || svcRequest.customer.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Service request not found or unauthorized' });
    }

    const quotes = await Quote.find({ request: requestId })
      .populate('provider', ['name']); // We could also populate ProviderProfile to get rating/etc

    res.json(quotes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateQuoteStatus = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id).populate('request');
    if (!quote || quote.request.customer.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Quote not found or unauthorized' });
    }

    const { status } = req.body;
    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid quote status' });
    }
    if (quote.status !== 'PENDING') {
      return res.status(400).json({ message: 'This quote has already been decided' });
    }

    quote.status = status;
    await quote.save();
    if (status === 'ACCEPTED') {
      await Quote.updateMany({ request: quote.request._id, _id: { $ne: quote._id }, status: 'PENDING' }, { $set: { status: 'REJECTED' } });
      quote.request.status = 'QUOTED';
      await quote.request.save();
    }
    res.json(quote);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
