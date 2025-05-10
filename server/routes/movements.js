const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const movementController = require('../controllers/movementController');
const { authenticate, checkPermission } = require('../middleware/auth');

// @route   GET /api/movements
// @desc    Get all movements with pagination and filtering
// @access  Private
router.get('/', authenticate, checkPermission('canView'), movementController.getAllMovements);

// @route   GET /api/movements/recent
// @desc    Get recent movements (last 30 days)
// @access  Private
router.get('/recent', authenticate, checkPermission('canView'), movementController.getRecentMovements);

// @route   GET /api/movements/:id
// @desc    Get movement by ID
// @access  Private
router.get('/:id', authenticate, checkPermission('canView'), movementController.getMovementById);

// @route   GET /api/movements/car/:carCode
// @desc    Get movements by car code
// @access  Private
router.get('/car/:carCode', authenticate, checkPermission('canView'), movementController.getMovementsByCarCode);

// @route   GET /api/movements/driver/:driverName
// @desc    Get movements by driver name
// @access  Private
router.get('/driver/:driverName', authenticate, checkPermission('canView'), movementController.getMovementsByDriverName);

// @route   POST /api/movements
// @desc    Create a new movement
// @access  Private
router.post(
  '/',
  [
    authenticate,
    checkPermission('canEdit'),
    [
      check('carCode', 'Car code is required').not().isEmpty(),
      check('driverName', 'Driver name is required').not().isEmpty(),
      check('supervisorName', 'Supervisor name is required').not().isEmpty(),
      check('department', 'Department is required').not().isEmpty(),
      check('client', 'Client is required').not().isEmpty(),
      check('route', 'Route is required').not().isEmpty(),
      check('departureTime', 'Departure time is required').isISO8601(),
      check('arrivalTime', 'Arrival time is required').isISO8601(),
      check('odometerReading', 'Odometer reading is required').isNumeric(),
      check('fuelCost', 'Fuel cost is required').isNumeric()
    ]
  ],
  movementController.createMovement
);

// @route   PUT /api/movements/:id
// @desc    Update a movement
// @access  Private
router.put(
  '/:id',
  [
    authenticate,
    checkPermission('canEdit'),
    [
      check('carCode', 'Car code is required').not().isEmpty(),
      check('driverName', 'Driver name is required').not().isEmpty(),
      check('supervisorName', 'Supervisor name is required').not().isEmpty(),
      check('department', 'Department is required').not().isEmpty(),
      check('client', 'Client is required').not().isEmpty(),
      check('route', 'Route is required').not().isEmpty(),
      check('departureTime', 'Departure time is required').isISO8601(),
      check('arrivalTime', 'Arrival time is required').isISO8601(),
      check('odometerReading', 'Odometer reading is required').isNumeric(),
      check('fuelCost', 'Fuel cost is required').isNumeric()
    ]
  ],
  movementController.updateMovement
);

// @route   DELETE /api/movements/:id
// @desc    Delete a movement
// @access  Private
router.delete('/:id', authenticate, checkPermission('canEdit'), movementController.deleteMovement);

module.exports = router;
