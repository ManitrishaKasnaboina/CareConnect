const ProviderProfile = require('../models/ProviderProfile');

// @desc    Create or update provider profile
// @route   POST /api/providers/profile
// @access  Private/Provider
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const {
      serviceCategories,
      skills,
      experienceYears,
      serviceArea,
      bio,
      isAvailable
    } = req.body;

    const profileFields = { user: req.user.id };

    if (serviceArea !== undefined) profileFields.serviceArea = serviceArea;

    if (serviceCategories) profileFields.serviceCategories = serviceCategories;
    if (skills) profileFields.skills = skills;
    if (experienceYears !== undefined) profileFields.experienceYears = experienceYears;
    if (bio !== undefined) profileFields.bio = bio;
    if (isAvailable !== undefined) profileFields.isAvailable = isAvailable;

    let profile = await ProviderProfile.findOne({ user: req.user.id });

    if (profile) {
      // Update
      profile = await ProviderProfile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }

    // Create
    profile = await ProviderProfile.create(profileFields);
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current logged in provider profile
// @route   GET /api/providers/profile/me
// @access  Private/Provider
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOneAndUpdate(
      { user: req.user.id },
      { $setOnInsert: { user: req.user.id, serviceArea: 'All areas' } },
      { upsert: true, new: true }
    )
      .populate('user', ['name', 'email'])
      .populate('serviceCategories', ['name', 'icon']);

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all providers
// @route   GET /api/providers
// @access  Public
exports.getAllProviders = async (req, res) => {
  try {
    const profiles = await ProviderProfile.find()
      .populate('user', ['name'])
      .populate('serviceCategories', ['name', 'icon']);
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
