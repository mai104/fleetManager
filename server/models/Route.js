const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  startLocation: {
    type: String,
    required: true,
    trim: true
  },
  endLocation: {
    type: String,
    required: true,
    trim: true
  },
  distance: {
    type: Number,
    required: true
  },
  estimatedTime: {
    type: Number, // in minutes
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Route', RouteSchema);
