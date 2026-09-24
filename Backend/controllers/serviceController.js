const ServiceCategory = require('../models/ServiceCategory');

// @desc    Get all active service categories
// @route   GET /api/services
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find({ isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new service category
// @route   POST /api/services
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    const categoryExists = await ServiceCategory.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await ServiceCategory.create({
      name,
      description,
      icon
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
