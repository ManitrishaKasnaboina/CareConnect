const express = require('express');
const router = express.Router();
const { getCategories, createCategory } = require('../controllers/serviceController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
  .get(getCategories)
  .post(protect, authorizeRoles('ADMIN', 'OPS_MANAGER', 'OPERATIONS_MANAGER'), createCategory);

module.exports = router;
