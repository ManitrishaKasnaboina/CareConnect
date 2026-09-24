const express = require('express');
const router = express.Router();
const { 
  createOrUpdateProfile, 
  getMyProfile, 
  getAllProviders 
} = require('../controllers/providerController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAllProviders);

router.route('/profile')
  .post(protect, authorizeRoles('PROVIDER'), createOrUpdateProfile);

router.route('/profile/me')
  .get(protect, authorizeRoles('PROVIDER'), getMyProfile);

router.route('/me')
  .get(protect, authorizeRoles('PROVIDER'), getMyProfile)
  .put(protect, authorizeRoles('PROVIDER'), createOrUpdateProfile);

module.exports = router;
