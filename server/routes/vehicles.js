const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const vehicleController = require('../controllers/vehicleController');
const { authenticate, checkPermission } = require('../middleware/auth');

// @route   GET /api/vehicles
// @desc    Get all vehicles
// @access  Private
router.get('/', authenticate, checkPermission('canView'), vehicleController.getAllVehicles);

// @route   GET /api/vehicles/oil-change-needed
// @desc    Get vehicles needing oil change
// @access  Private
router.get('/oil-change-needed', authenticate, checkPermission('canView'), vehicleController.getVehiclesNeedingOilChange);

// @route   GET /api/vehicles/:id
// @desc    Get vehicle by ID
// @access  Private
router.get('/:id', authenticate, checkPermission('canView'), vehicleController.getVehicleById);

// @route   GET /api/vehicles/code/:carCode
// @desc    Get vehicle by car code
// @access  Private
router.get('/code/:carCode', authenticate, checkPermission('canView'), vehicleController.getVehicleByCarCode);

// @route   POST /api/vehicles
// @desc    Create a new vehicle
// @access  Private
router.post(
  '/',
  [
    authenticate,
    checkPermission('canEdit'),
    [
      check('carCode', 'Car code is required').not().isEmpty(),
      check('plateNumber', 'Plate number is required').not().isEmpty(),
      check('make', 'Make is required').not().isEmpty(),
      check('model', 'Model is required').not().isEmpty(),
      check('year', 'Year is required').isNumeric(),
      check('chassisNumber', 'Chassis number is required').not().isEmpty(),
      check('engineNumber', 'Engine number is required').not().isEmpty(),
      check('ownerName', 'Owner name is required').not().isEmpty(),
      check('licenseExpiryDate', 'License expiry date is required').isISO8601(),
      check('insuranceExpiryDate', 'Insurance expiry date is required').isISO8601(),
      check('lastOilChangeOdometer', 'Last oil change odometer reading is required').isNumeric(),
      check('currentOdometer', 'Current odometer reading is required').isNumeric()
    ]
  ],
  vehicleController.createVehicle
);

// @route   PUT /api/vehicles/:id
// @desc    Update a vehicle
// @access  Private
router.put(
  '/:id',
  [
    authenticate,
    checkPermission('canEdit'),
    [
      check('carCode', 'Car code is required').not().isEmpty(),
      check('plateNumber', 'Plate number is required').not().isEmpty(),
      check('make', 'Make is required').not().isEmpty(),
      check('model', 'Model is required').not().isEmpty(),
      check('year', 'Year is required').isNumeric(),
      check('chassisNumber', 'Chassis number is required').not().isEmpty(),
      check('engineNumber', 'Engine number is required').not().isEmpty(),
      check('ownerName', 'Owner name is required').not().isEmpty(),
      check('licenseExpiryDate', 'License expiry date is required').isISO8601(),
      check('insuranceExpiryDate', 'Insurance expiry date is required').isISO8601(),
      check('lastOilChangeOdometer', 'Last oil change odometer reading is required').isNumeric(),
      check('currentOdometer', 'Current odometer reading is required').isNumeric()
    ]
  ],
  vehicleController.updateVehicle
);

// @route   DELETE /api/vehicles/:id
// @desc    Delete a vehicle
// @access  Private
router.delete('/:id', authenticate, checkPermission('canEdit'), vehicleController.deleteVehicle);

// @route   POST /api/vehicles/:id/maintenance
// @desc    Add maintenance record to a vehicle
// @access  Private
router.post(
  '/:id/maintenance',
  [
    authenticate,
    checkPermission('canEdit'),
    [
      check('date', 'Date is required').isISO8601(),
      check('type', 'Type is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('cost', 'Cost is required').isNumeric(),
      check('location', 'Location is required').not().isEmpty(),
      check('odometerReading', 'Odometer reading is required').isNumeric(),
      check('performedBy', 'Performed by is required').not().isEmpty()
    ]
  ],
  vehicleController.addMaintenanceRecord
);

// @route   PUT /api/vehicles/:vehicleId/maintenance/:maintenanceId
// @desc    Update maintenance record
// @access  Private
router.put(
  '/:vehicleId/maintenance/:maintenanceId',
  [
    authenticate,
    checkPermission('canEdit'),
    [
      check('date', 'Date is required').isISO8601(),
      check('type', 'Type is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('cost', 'Cost is required').isNumeric(),
      check('location', 'Location is required').not().isEmpty(),
      check('odometerReading', 'Odometer reading is required').isNumeric(),
      check('performedBy', 'Performed by is required').not().isEmpty()
    ]
  ],
  vehicleController.updateMaintenanceRecord
);

// @route   DELETE /api/vehicles/:vehicleId/maintenance/:maintenanceId
// @desc    Remove maintenance record
// @access  Private
router.delete(
  '/:vehicleId/maintenance/:maintenanceId',
  authenticate,
  checkPermission('canEdit'),
  vehicleController.deleteMaintenanceRecord
);

module.exports = router;
