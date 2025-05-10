const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Get user by ID (admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error.message);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Update user permissions (admin only)
exports.updatePermissions = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { permissions } = req.body;
    
    // Find user by ID
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Cannot change permissions of an admin
    if (user.role === 'admin' && req.user.id !== user.id) {
      return res.status(403).json({ message: 'Cannot change permissions of an admin user' });
    }
    
    // Update permissions
    user.permissions = {
      ...user.permissions,
      ...permissions
    };
    
    await user.save();
    
    res.json(user);
  } catch (error) {
    console.error(error.message);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Cannot delete an admin user
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete an admin user' });
    }
    
    // Check if it's the only user left
    const userCount = await User.countDocuments({});
    if (userCount <= 1) {
      return res.status(400).json({ message: 'Cannot delete the only user in the system' });
    }
    
    await user.remove();
    
    res.json({ message: 'User removed' });
  } catch (error) {
    console.error(error.message);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Check if there are already 5 users (limit)
exports.checkUserLimit = async (req, res) => {
  try {
    const userCount = await User.countDocuments({});
    const isLimitReached = userCount >= 5;
    
    res.json({ isLimitReached });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};
