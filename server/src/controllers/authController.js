import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

export const register = async (req, res) => {
  try {
    const { email, password, businessName, businessAddress, businessPhone, gstNumber, businessType } = req.body;

    if (!email || !password || !businessName) {
      return res.status(400).json({ success: false, message: 'Email, password, and business name are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address (e.g. name@domain.com)' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const apiKey = `sc_${uuidv4().replace(/-/g, '')}`;

    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      businessName,
      businessAddress: businessAddress || '',
      businessPhone: businessPhone || '',
      gstNumber: gstNumber || '',
      businessType: businessType || 'Retail Store',
      apiKey
    });

    await user.save();

    const userId = user._id ? user._id.toString() : user.id;
    const token = generateToken(userId);

    const userObj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: 'Business account created successfully',
      token,
      user: userObj
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const userId = user._id ? user._id.toString() : user.id;
    const token = generateToken(userId);

    const userObj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete userObj.password;

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: userObj
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userObj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete userObj.password;

    res.json({ success: true, user: userObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { businessName, businessAddress, businessPhone, gstNumber, businessType } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.userId },
      {
        businessName,
        businessAddress,
        businessPhone,
        gstNumber,
        businessType
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userObj = typeof updatedUser.toObject === 'function' ? updatedUser.toObject() : { ...updatedUser };
    delete userObj.password;

    res.json({
      success: true,
      message: 'Business profile updated successfully',
      user: userObj
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const regenerateApiKey = async (req, res) => {
  try {
    const newApiKey = `sc_${uuidv4().replace(/-/g, '')}`;

    const user = await User.findOneAndUpdate(
      { _id: req.userId },
      { apiKey: newApiKey },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'POS API Key regenerated successfully',
      apiKey: newApiKey
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
