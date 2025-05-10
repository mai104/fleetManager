const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, checkPermission } = require('../middleware/auth');

// @route   GET /api/reports/movements
// @desc    Generate movement report (Excel)
// @access  Private
router.get(
  '/movements',
  authenticate,
  checkPermission('canExport'),
  reportController.generateMovementReport
);

// @route   GET /api/reports/maintenance/:vehicleId
// @desc    Generate maintenance report for a vehicle (Excel)
// @access  Private
router.get(
  '/maintenance/:vehicleId',
  authenticate,
  checkPermission('canExport'),
  reportController.generateMaintenanceReport
);

// @route   GET /api/reports/fleet-status
// @desc    Generate fleet status report (Excel)
// @access  Private
router.get(
  '/fleet-status',
  authenticate,
  checkPermission('canExport'),
  reportController.generateFleetStatusReport
);

module.exports = router;
