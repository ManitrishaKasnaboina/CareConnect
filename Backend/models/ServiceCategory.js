const mongoose = require('mongoose');

const serviceCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  icon: {
    type: String,
    default: 'default-icon.png',
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema);
