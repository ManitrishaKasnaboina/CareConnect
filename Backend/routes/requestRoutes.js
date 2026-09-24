const express = require('express');
const router = express.Router();
const {
  createRequest,
  getMyRequests,
  getAvailableRequests,
  updateRequestStatus
} = require('../controllers/requestController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorizeRoles('CUSTOMER'), createRequest);

router.route('/me')
  .get(protect, authorizeRoles('CUSTOMER'), getMyRequests);

router.route('/available')
  .get(protect, authorizeRoles('PROVIDER'), getAvailableRequests);

router.route('/:id/status')
  .put(protect, authorizeRoles('PROVIDER', 'ADMIN', 'OPS_MANAGER'), updateRequestStatus);

module.exports = router;
