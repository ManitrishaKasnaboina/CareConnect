const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, updateBookingStatus, rateBooking, payBooking } = require('../controllers/bookingController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorizeRoles('CUSTOMER'), createBooking)
  .get(protect, authorizeRoles('CUSTOMER', 'PROVIDER'), getMyBookings);

router.route('/me')
  .get(protect, authorizeRoles('CUSTOMER', 'PROVIDER'), getMyBookings);

router.route('/provider')
  .get(protect, authorizeRoles('PROVIDER'), getMyBookings);

router.route('/:id/pay')
  .put(protect, authorizeRoles('CUSTOMER'), payBooking);

router.route('/:id/status')
  .put(protect, authorizeRoles('PROVIDER'), updateBookingStatus);

router.route('/:id/rating')
  .put(protect, authorizeRoles('CUSTOMER'), rateBooking);

module.exports = router;
