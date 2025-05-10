const mongoose = require('mongoose');

const MovementSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  carCode: {
    type: String,
    required: true
  },
  plateNumber: {
    type: String,
    required: true
  },
  driverName: {
    type: String,
    required: true,
    trim: true
  },
  supervisorName: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  client: {
    type: String,
    required: true,
    trim: true
  },
  route: {
    type: String,
    required: true,
    trim: true
  },
  departureTime: {
    type: Date,
    required: true
  },
  arrivalTime: {
    type: Date,
    required: true
  },
  odometerReading: {
    type: Number,
    required: true
  },
  fuelCost: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Create index for efficient filtering and searching
MovementSchema.index({ carCode: 1 });
MovementSchema.index({ driverName: 1 });
MovementSchema.index({ supervisorName: 1 });
MovementSchema.index({ date: 1 });

module.exports = mongoose.model('Movement', MovementSchema);
