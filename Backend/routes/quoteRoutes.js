const express = require('express');
const router = express.Router();
const { submitQuote, getQuotesForRequest, getMyQuotes, updateQuoteStatus } = require('../controllers/quoteController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorizeRoles('PROVIDER'), submitQuote);

router.route('/me')
  .get(protect, authorizeRoles('PROVIDER'), getMyQuotes);

router.route('/request/:id')
  .get(protect, authorizeRoles('CUSTOMER'), getQuotesForRequest);

router.route('/:id/status')
  .put(protect, authorizeRoles('CUSTOMER'), updateQuoteStatus);

module.exports = router;
