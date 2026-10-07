const ProviderProfile = require('../models/ProviderProfile');

// @desc    Create or update provider profile
// @route   POST /api/providers/profile
// @access  Private/Provider
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const {
      displayName,
      headline,
      phone,
      serviceCategories,
      skills,
      languages,
      experienceYears,
      serviceArea,
      hourlyRate,
      bio,
      profileImage,
      isAvailable
    } = req.body;

    const profileFields = { user: req.user.id };

    if (displayName !== undefined) profileFields.displayName = String(displayName).trim();
    if (headline !== undefined) profileFields.headline = String(headline).trim();
    if (phone !== undefined) profileFields.phone = String(phone).trim();
    if (serviceArea !== undefined) profileFields.serviceArea = String(serviceArea).trim();
    if (hourlyRate !== undefined) profileFields.hourlyRate = Number(hourlyRate);
    if (experienceYears !== undefined) profileFields.experienceYears = Number(experienceYears);
    if (bio !== undefined) profileFields.bio = String(bio).trim();
    if (profileImage !== undefined) profileFields.profileImage = String(profileImage).trim();
    if (isAvailable !== undefined) profileFields.isAvailable = Boolean(isAvailable);

    if (serviceCategories !== undefined) {
      profileFields.serviceCategories = Array.isArray(serviceCategories)
        ? serviceCategories
        : String(serviceCategories).split(',').map(item => item.trim()).filter(Boolean);
    }

    if (skills !== undefined) {
      profileFields.skills = Array.isArray(skills)
        ? skills.map(item => String(item).trim()).filter(Boolean)
        : String(skills).split(',').map(item => item.trim()).filter(Boolean);
    }

    if (languages !== undefined) {
      profileFields.languages = Array.isArray(languages)
        ? languages.map(item => String(item).trim()).filter(Boolean)
        : String(languages).split(',').map(item => item.trim()).filter(Boolean);
    }

    let profile = await ProviderProfile.findOne({ user: req.user.id });

    if (profile) {
      profile = await ProviderProfile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }

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

// @desc    Get a specific provider profile
// @route   GET /api/providers/:id
// @access  Public
exports.getProviderById = async (req, res) => {
  try {
    const profile = await ProviderProfile.findById(req.params.id)
      .populate('user', ['name', 'email'])
      .populate('serviceCategories', ['name', 'icon']);

    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
