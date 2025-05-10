const Movement = require('../models/Movement');
const Vehicle = require('../models/Vehicle');
const { validationResult } = require('express-validator');

// Get all movements with pagination
exports.getAllMovements = async (req, res) => {
  // Set up pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  
  // Set up filtering
  const filter = {};
  
  if (req.query.carCode) {
    filter.carCode = req.query.carCode;
  }
  
  if (req.query.driverName) {
    filter.driverName = { $regex: req.query.driverName, $options: 'i' };
  }
  
  if (req.query.supervisorName) {
    filter.supervisorName = { $regex: req.query.supervisorName, $options: 'i' };
  }
  
  if (req.query.department) {
    filter.department = req.query.department;
  }
  
  if (req.query.client) {
    filter.client = req.query.client;
  }
  
  if (req.query.startDate && req.query.endDate) {
    filter.date = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  } else if (req.query.startDate) {
    filter.date = { $gte: new Date(req.query.startDate) };
  } else if (req.query.endDate) {
    filter.date = { $lte: new Date(req.query.endDate) };
  }
  
  try {
    // Get total count for pagination
    const total = await Movement.countDocuments(filter);
    
    // Get movements with pagination and sorting
    const movements = await Movement.find(filter)
      .sort({ date: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('vehicle', 'carCode plateNumber make model year');
    
    // Pagination info
    const pagination = {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    };
    
    res.json({
      movements,
      pagination
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Get movement by ID
exports.getMovementById = async (req, res) => {
  try {
    const movement = await Movement.findById(req.params.id)
      .populate('vehicle', 'carCode plateNumber make model year');
    
    if (!movement) {
      return res.status(404).json({ message: 'Movement record not found' });
    }
    
    res.json(movement);
  } catch (error) {
    console.error(error.message);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Movement record not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Create a new movement
exports.createMovement = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const {
    carCode,
    driverName,
    supervisorName,
    department,
    client,
    route,
    departureTime,
    arrivalTime,
    odometerReading,
    fuelCost,
    notes
  } = req.body;
  
  try {
    // Find vehicle by car code
    const vehicle = await Vehicle.findOne({ carCode });
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found with the provided car code' });
    }
    
    // Check if vehicle is active
    if (vehicle.status !== 'active') {
      return res.status(400).json({ message: `Vehicle is currently ${vehicle.status} and cannot be used` });
    }
    
    // Create new movement
    const newMovement = new Movement({
      vehicle: vehicle._id,
      carCode,
      plateNumber: vehicle.plateNumber,
      driverName,
      supervisorName,
      department,
      client,
      route,
      departureTime,
      arrivalTime,
      odometerReading,
      fuelCost,
      notes,
      createdBy: req.user.id
    });
    
    // Update vehicle's current odometer if this reading is higher
    if (odometerReading > vehicle.currentOdometer) {
      vehicle.currentOdometer = odometerReading;
      await vehicle.save();
    }
    
    await newMovement.save();
    
    res.json(newMovement);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Update a movement
exports.updateMovement = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const {
    carCode,
    driverName,
    supervisorName,
    department,
    client,
    route,
    departureTime,
    arrivalTime,
    odometerReading,
    fuelCost,
    notes
  } = req.body;
  
  try {
    // Find movement by ID
    const movement = await Movement.findById(req.params.id);
    
    if (!movement) {
      return res.status(404).json({ message: 'Movement record not found' });
    }
    
    // If car code is changed, find the new vehicle
    let vehicle;
    if (carCode !== movement.carCode) {
      vehicle = await Vehicle.findOne({ carCode });
      
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found with the provided car code' });
      }
      
      // Check if vehicle is active
      if (vehicle.status !== 'active') {
        return res.status(400).json({ message: `Vehicle is currently ${vehicle.status} and cannot be used` });
      }
      
      movement.vehicle = vehicle._id;
      movement.plateNumber = vehicle.plateNumber;
    } else {
      vehicle = await Vehicle.findById(movement.vehicle);
    }
    
    // Update movement fields
    movement.carCode = carCode;
    movement.driverName = driverName;
    movement.supervisorName = supervisorName;
    movement.department = department;
    movement.client = client;
    movement.route = route;
    movement.departureTime = departureTime;
    movement.arrivalTime = arrivalTime;
    movement.odometerReading = odometerReading;
    movement.fuelCost = fuelCost;
    movement.notes = notes;
    
    // Update vehicle's current odometer if this reading is higher
    if (odometerReading > vehicle.currentOdometer) {
      vehicle.currentOdometer = odometerReading;
      await vehicle.save();
    }
    
    await movement.save();
    
    res.json(movement);
  } catch (error) {
    console.error(error.message);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Movement record not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Delete a movement
exports.deleteMovement = async (req, res) => {
  try {
    const movement = await Movement.findById(req.params.id);
    
    if (!movement) {
      return res.status(404).json({ message: 'Movement record not found' });
    }
    
    await movement.remove();
    
    res.json({ message: 'Movement record removed' });
  } catch (error) {
    console.error(error.message);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Movement record not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Get movements by car code
exports.getMovementsByCarCode = async (req, res) => {
  try {
    const movements = await Movement.find({ carCode: req.params.carCode })
      .sort({ date: -1 })
      .populate('vehicle', 'carCode plateNumber make model year');
    
    res.json(movements);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Get movements by driver name
exports.getMovementsByDriverName = async (req, res) => {
  try {
    const movements = await Movement.find({ 
      driverName: { $regex: req.params.driverName, $options: 'i' } 
    })
      .sort({ date: -1 })
      .populate('vehicle', 'carCode plateNumber make model year');
    
    res.json(movements);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Get all recent movements (last 30 days)
exports.getRecentMovements = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const movements = await Movement.find({ date: { $gte: thirtyDaysAgo } })
      .sort({ date: -1 })
      .populate('vehicle', 'carCode plateNumber make model year');
    
    res.json(movements);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};
