const ServiceRequest = require('../models/ServiceRequest');
const ProviderProfile = require('../models/ProviderProfile');
const ServiceCategory = require('../models/ServiceCategory');
const aiService = require('../services/aiService');
const { getIO } = require('../config/socket');

// @desc    Create a service request
// @route   POST /api/requests
// @access  Private/Customer
exports.createRequest = async (req, res) => {
  try {
    const { description, location, locationCoordinates, images } = req.body;
    let { category } = req.body;

    // AI Classification based on free-text description
    const aiAnalysis = await aiService.analyzeServiceRequest(description);

    // Auto-match category if not provided by user
    if (category && typeof category === 'string' && !/^[0-9a-fA-F]{24}$/.test(category)) {
      const namedCategory = await ServiceCategory.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
      category = namedCategory?._id;
    }

    if (!category && aiAnalysis.category) {
      const matchedCategory = await ServiceCategory.findOne({ name: { $regex: new RegExp(`^${aiAnalysis.category}$`, 'i') } });
      if (matchedCategory) {
        category = matchedCategory._id;
      }
    }

    const request = await ServiceRequest.create({
      customer: req.user.id,
      category,
      description,
      location,
      locationCoordinates,
      images,
      aiMetadata: {
        categoryName: aiAnalysis.category,
        subCategory: aiAnalysis.subCategory,
        isEmergency: aiAnalysis.isEmergency,
        urgencyReason: aiAnalysis.reason,
        estimatedQuote: aiAnalysis.estimatedQuote,
        confidenceScore: aiAnalysis.confidenceScore
      }
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get customer's service requests
// @route   GET /api/requests/me
// @access  Private/Customer
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ customer: req.user.id })
      .populate('category', ['name', 'icon'])
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get available service requests for providers
// @route   GET /api/requests/available
// @access  Private/Provider
exports.getAvailableRequests = async (req, res) => {
  try {
    // Fetch the provider's profile to get their categories and availability
    const providerProfile = await ProviderProfile.findOne({ user: req.user.id });

    if (!providerProfile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    if (!providerProfile.isAvailable) {
      return res.json([]); // Return empty if provider is not available
    }

    // Providers without categories can see new jobs until they finish their profile.
    const query = {
      status: { $in: ['PENDING', 'QUOTED'] }
    };

    if (providerProfile.serviceCategories?.length) {
      query.$or = [
        { category: { $in: providerProfile.serviceCategories } },
        { category: { $exists: false } }
      ];
    }

    // "All areas" is the default and must not be treated as a literal location.
    if (providerProfile.serviceArea && providerProfile.serviceArea !== 'All areas') {
      query.location = { $regex: new RegExp(providerProfile.serviceArea, 'i') };
    }

    const requests = await ServiceRequest.find(query)
      .populate('category', ['name', 'icon'])
      .populate('customer', ['name']);
      
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a request status
// @route   PUT /api/requests/:id/status
// @access  Private
exports.updateRequestStatus = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const { status } = req.body;
    request.status = status;
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
