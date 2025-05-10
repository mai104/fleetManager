const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  odometerReading: {
    type: Number,
    required: true
  },
  performedBy: {
    type: String,
    required: true
  }
}, { timestamps: true });

const VehicleSchema = new mongoose.Schema({
  carCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  plateNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true
  },
  chassisNumber: {
    type: String,
    required: true,
    trim: true
  },
  engineNumber: {
    type: String,
    required: true,
    trim: true
  },
  simNumber: {
    type: String,
    trim: true
  },
  ownerName: {
    type: String,
    required: true,
    trim: true
  },
  licenseExpiryDate: {
    type: Date,
    required: true
  },
  insuranceExpiryDate: {
    type: Date,
    required: true
  },
  lastOilChangeOdometer: {
    type: Number,
    required: true
  },
  currentOdometer: {
    type: Number,
    required: true
  },
  maintenance: [MaintenanceSchema],
  status: {
    type: String,
    enum: ['active', 'maintenance', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual field to calculate distance since last oil change
VehicleSchema.virtual('distanceSinceLastOilChange').get(function() {
  return this.currentOdometer - this.lastOilChangeOdometer;
});

// Virtual field to check if oil change is needed
VehicleSchema.virtual('needsOilChange').get(function() {
  return this.distanceSinceLastOilChange >= 3500;
});

// Set toJSON option to include virtuals
VehicleSchema.set('toJSON', { virtuals: true });
VehicleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Vehicle', VehicleSchema);
