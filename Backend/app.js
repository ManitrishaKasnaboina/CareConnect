const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const providerRoutes = require('./routes/providerRoutes');
const requestRoutes = require('./routes/requestRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/bookings', bookingRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('CareConnect API is running');
});

module.exports = app;
