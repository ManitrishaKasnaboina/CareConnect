const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    if (user) {
      if (user.role === 'PROVIDER') {
        await ProviderProfile.create({ user: user._id, serviceArea: 'All areas' });
      }
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Google OAuth login
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res) => {
  try {
    const { token, role } = req.body;

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({ message: 'Google sign-in is not configured on the server' });
    }

    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    const tokenInfo = await client.getTokenInfo(token);
    if (process.env.GOOGLE_CLIENT_ID && tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ message: 'Invalid Google token audience' });
    }

    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!profileResponse.ok) {
      return res.status(401).json({ message: 'Unable to read Google profile' });
    }

    const { name, email } = await profileResponse.json();
    if (!email) {
      return res.status(401).json({ message: 'Google account has no email address' });
    }
    
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create user if they don't exist
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
        role: role || 'CUSTOMER'
      });
    }

    if (user.role === 'PROVIDER') {
      await ProviderProfile.findOneAndUpdate(
        { user: user._id },
        { $setOnInsert: { user: user._id, serviceArea: 'All areas' } },
        { upsert: true, new: true }
      );
    }
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during Google Login', error: error.message });
  }
};
