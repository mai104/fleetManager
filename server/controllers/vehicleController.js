const Vehicle = require('../models/Vehicle');
const Movement = require('../models/Movement');
const { validationResult } = require('express-validator');

// Get all vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Get vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.json(vehicle);
  } catch (error) {
    console.error(error.message);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Get vehicle by car code
exports.getVehicleByCarCode = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ carCode: req.params.carCode });
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.json(vehicle);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Create a new vehicle
exports.createVehicle = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const {
    carCode,
    plateNumber,
    make,
    model,
    year,
    chassisNumber,
    engineNumber,
    simNumber,
    ownerName,
    licenseExpiryDate,
    insuranceExpiryDate,
    lastOilChangeOdometer,
    currentOdometer,
    status
  } = req.body;
  
  try {
    // Check if vehicle with car code already exists
    let vehicle = await Vehicle.findOne({ carCode });
    if (vehicle) {
      return res.status(400).json({ message: 'Vehicle with this car code already exists' });
    }
    
    // Check if vehicle with plate number already exists
    vehicle = await Vehicle.findOne({ plateNumber });
    if (vehicle) {
      return res.status(400).json({ message: 'Vehicle with this plate number already exists' });
    }
    
    // Create new vehicle
    vehicle = new Vehicle({
      carCode,
      plateNumber,
      make,
      model,
      year,
      chassisNumber,
      engineNumber,
      simNumber,
      ownerName,
      licenseExpiryDate,
      insuranceExpiryDate,
      lastOilChangeOdometer,
      currentOdometer,
      status
    });
    
    await vehicle.save();
    
    res.json(vehicle);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Update a vehicle
exports.updateVehicle = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const {
    carCode,
    plateNumber,
    make,
    model,
    year,
    chassisNumber,
    engineNumber,
    simNumber,
    ownerName,
    licenseExpiryDate,
    insuranceExpiryDate,
    lastOilChangeOdometer,
    currentOdometer,
    status
  } = req.body;
  
  try {
    // Find vehicle by ID
    let vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    // Check if car code is being changed and if new code already exists
    if (carCode !== vehicle.carCode) {
      const existingVehicle = await Vehicle.findOne({ carCode });
      if (existingVehicle) {
        return res.status(400).json({ message: 'Vehicle with this car code already exists' });
      }
    }
    
    // Check if plate number is being changed and if new plate already exists
    if (plateNumber !== vehicle.plateNumber) {
      const existingVehicle = await Vehicle.findOne({ plateNumber });
      if (existingVehicle) {
        return res.status(400).json({ message: 'Vehicle with this plate number already exists' });
      }
    }
    
    // Update vehicle fields
    vehicle.carCode = carCode;
    vehicle.plateNumber = plateNumber;
    vehicle.make = make;
    vehicle.model = model;
    vehicle.year = year;
    vehicle.chassisNumber = chassisNumber;
    vehicle.engineNumber = engineNumber;
    vehicle.simNumber = simNumber;
    vehicle.ownerName = ownerName;
    vehicle.licenseExpiryDate = licenseExpiryDate;
    vehicle.insuranceExpiryDate = insuranceExpiryDate;
    vehicle.lastOilChangeOdometer = lastOilChangeOdometer;
    vehicle.currentOdometer = currentOdometer;
    vehicle.status = status;
    vehicle.updatedAt = Date.now();
    
    await vehicle.save();
    
    res.json(vehicle);
  } catch (error) {
    console.error(error.message);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Delete a vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    // Check if there are any movements associated with this vehicle
    const movements = await Movement.findOne({ vehicle: req.params.id });
    
    if (movements) {
      return res.status(400).json({ 
        message: 'Cannot delete vehicle that has movement records. Update status to inactive instead.' 
      });
    }
    
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    await vehicle.remove();
    
    res.json({ message: 'Vehicle removed' });
  } catch (error) {
    console.error(error.message);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Add maintenance record to a vehicle
exports.addMaintenanceRecord = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const {
    date,
    type,
    description,
    cost,
    location,
    odometerReading,
    performedBy
  } = req.body;
  
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    const newMaintenance = {
      date,
      type,
      description,
      cost,
      location,
      odometerReading,
      performedBy
    };
    
    // If maintenance is oil change, update the lastOilChangeOdometer
    if (type.toLowerCase().includes('oil change')) {
      vehicle.lastOilChangeOdometer = odometerReading;
    }
    
    // Add maintenance record to the array
    vehicle.maintenance.unshift(newMaintenance);
    
    // Update currentOdometer if the maintenance odometer reading is higher
    if (odometerReading > vehicle.currentOdometer) {
      vehicle.currentOdometer = odometerReading;
    }
    
    await vehicle.save();
    
    res.json(vehicle);
  } catch (error) {
    console.error(error.message);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Update maintenance record
exports.updateMaintenanceRecord = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const {
    date,
    type,
    description,
    cost,
    location,
    odometerReading,
    performedBy
  } = req.body;
  
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    // Find the maintenance record
    const maintenanceIndex = vehicle.maintenance.findIndex(
      m => m._id.toString() === req.params.maintenanceId
    );
    
    if (maintenanceIndex === -1) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }
    
    // Update the maintenance record
    vehicle.maintenance[maintenanceIndex] = {
      ...vehicle.maintenance[maintenanceIndex].toObject(),
      date,
      type,
      description,
      cost,
      location,
      odometerReading,
      performedBy
    };
    
    // If maintenance is oil change, update the lastOilChangeOdometer
    if (type.toLowerCase().includes('oil change')) {
      vehicle.lastOilChangeOdometer = odometerReading;
    }
    
    await vehicle.save();
    
    res.json(vehicle);
  } catch (error) {
    console.error(error.message);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Vehicle or maintenance record not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Remove maintenance record
exports.deleteMaintenanceRecord = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    // Find the maintenance record
    const maintenanceIndex = vehicle.maintenance.findIndex(
      m => m._id.toString() === req.params.maintenanceId
    );
    
    if (maintenanceIndex === -1) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }
    
    // Check if it's an oil change record
    const isOilChange = vehicle.maintenance[maintenanceIndex].type.toLowerCase().includes('oil change');
    
    // Remove the maintenance record
    vehicle.maintenance.splice(maintenanceIndex, 1);
    
    // If it was an oil change, find the most recent oil change and update lastOilChangeOdometer
    if (isOilChange) {
      const latestOilChange = vehicle.maintenance
        .filter(m => m.type.toLowerCase().includes('oil change'))
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      
      if (latestOilChange) {
        vehicle.lastOilChangeOdometer = latestOilChange.odometerReading;
      }
    }
    
    await vehicle.save();
    
    res.json(vehicle);
  } catch (error) {
    console.error(error.message);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Vehicle or maintenance record not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Get vehicles needing oil change (odometer > 3500km since last oil change)
exports.getVehiclesNeedingOilChange = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    
    // Filter vehicles that need oil change
    const vehiclesNeedingOilChange = vehicles.filter(vehicle => {
      return vehicle.needsOilChange;
    });
    
    res.json(vehiclesNeedingOilChange);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};
