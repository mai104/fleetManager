const Movement = require('../models/Movement');
const Vehicle = require('../models/Vehicle');
const exceljs = require('exceljs');

// Generate movement report
exports.generateMovementReport = async (req, res) => {
  try {
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
    
    // Get movements based on filters
    const movements = await Movement.find(filter)
      .sort({ date: -1 })
      .populate('vehicle', 'carCode plateNumber make model year');
    
    // Create a new Excel workbook
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Vehicle Movements');
    
    // Add column headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Car Code', key: 'carCode', width: 12 },
      { header: 'Plate Number', key: 'plateNumber', width: 15 },
      { header: 'Driver Name', key: 'driverName', width: 20 },
      { header: 'Supervisor Name', key: 'supervisorName', width: 20 },
      { header: 'Department', key: 'department', width: 15 },
      { header: 'Client', key: 'client', width: 20 },
      { header: 'Route', key: 'route', width: 20 },
      { header: 'Departure Time', key: 'departureTime', width: 20 },
      { header: 'Arrival Time', key: 'arrivalTime', width: 20 },
      { header: 'Odometer Reading', key: 'odometerReading', width: 18 },
      { header: 'Fuel Cost', key: 'fuelCost', width: 15 },
      { header: 'Notes', key: 'notes', width: 30 }
    ];
    
    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Add movement data to worksheet
    movements.forEach(movement => {
      worksheet.addRow({
        date: movement.date ? new Date(movement.date).toLocaleDateString() : '',
        carCode: movement.carCode,
        plateNumber: movement.plateNumber,
        driverName: movement.driverName,
        supervisorName: movement.supervisorName,
        department: movement.department,
        client: movement.client,
        route: movement.route,
        departureTime: movement.departureTime ? new Date(movement.departureTime).toLocaleString() : '',
        arrivalTime: movement.arrivalTime ? new Date(movement.arrivalTime).toLocaleString() : '',
        odometerReading: movement.odometerReading,
        fuelCost: movement.fuelCost,
        notes: movement.notes || ''
      });
    });
    
    // Set content type and disposition
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=vehicle_movements_report.xlsx'
    );
    
    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Generate vehicle maintenance report
exports.generateMaintenanceReport = async (req, res) => {
  try {
    // Get vehicle ID from query params
    const vehicleId = req.params.vehicleId;
    
    // Find vehicle with maintenance history
    const vehicle = await Vehicle.findById(vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    // Create a new Excel workbook
    const workbook = new exceljs.Workbook();
    
    // Add vehicle info worksheet
    const infoWorksheet = workbook.addWorksheet('Vehicle Information');
    
    // Add vehicle info
    infoWorksheet.columns = [
      { header: 'Property', key: 'property', width: 25 },
      { header: 'Value', key: 'value', width: 35 }
    ];
    
    // Style the header row
    infoWorksheet.getRow(1).font = { bold: true };
    infoWorksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Add vehicle data
    const vehicleInfo = [
      { property: 'Car Code', value: vehicle.carCode },
      { property: 'Plate Number', value: vehicle.plateNumber },
      { property: 'Make', value: vehicle.make },
      { property: 'Model', value: vehicle.model },
      { property: 'Year', value: vehicle.year },
      { property: 'Chassis Number', value: vehicle.chassisNumber },
      { property: 'Engine Number', value: vehicle.engineNumber },
      { property: 'SIM Number', value: vehicle.simNumber || 'N/A' },
      { property: 'Owner Name', value: vehicle.ownerName },
      { property: 'License Expiry Date', value: new Date(vehicle.licenseExpiryDate).toLocaleDateString() },
      { property: 'Insurance Expiry Date', value: new Date(vehicle.insuranceExpiryDate).toLocaleDateString() },
      { property: 'Last Oil Change Odometer', value: vehicle.lastOilChangeOdometer },
      { property: 'Current Odometer', value: vehicle.currentOdometer },
      { property: 'Distance Since Last Oil Change', value: vehicle.distanceSinceLastOilChange },
      { property: 'Oil Change Needed', value: vehicle.needsOilChange ? 'YES' : 'No' },
      { property: 'Status', value: vehicle.status }
    ];
    
    vehicleInfo.forEach(info => {
      infoWorksheet.addRow(info);
    });
    
    // Add maintenance history worksheet
    const maintenanceWorksheet = workbook.addWorksheet('Maintenance History');
    
    // Add maintenance columns
    maintenanceWorksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Type', key: 'type', width: 20 },
      { header: 'Description', key: 'description', width: 35 },
      { header: 'Cost', key: 'cost', width: 15 },
      { header: 'Location', key: 'location', width: 25 },
      { header: 'Odometer Reading', key: 'odometerReading', width: 18 },
      { header: 'Performed By', key: 'performedBy', width: 20 }
    ];
    
    // Style the header row
    maintenanceWorksheet.getRow(1).font = { bold: true };
    maintenanceWorksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Add maintenance data
    if (vehicle.maintenance && vehicle.maintenance.length > 0) {
      // Sort maintenance records by date (newest first)
      const sortedMaintenance = [...vehicle.maintenance].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      
      sortedMaintenance.forEach(record => {
        maintenanceWorksheet.addRow({
          date: new Date(record.date).toLocaleDateString(),
          type: record.type,
          description: record.description,
          cost: record.cost,
          location: record.location,
          odometerReading: record.odometerReading,
          performedBy: record.performedBy
        });
      });
    } else {
      maintenanceWorksheet.addRow({ description: 'No maintenance records found' });
    }
    
    // Add summary worksheet
    const summaryWorksheet = workbook.addWorksheet('Maintenance Summary');
    
    // Add summary columns
    summaryWorksheet.columns = [
      { header: 'Category', key: 'category', width: 25 },
      { header: 'Total Cost', key: 'totalCost', width: 15 },
      { header: 'Count', key: 'count', width: 10 }
    ];
    
    // Style the header row
    summaryWorksheet.getRow(1).font = { bold: true };
    summaryWorksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Calculate maintenance summary
    const maintenanceSummary = {};
    let totalMaintenanceCost = 0;
    
    if (vehicle.maintenance && vehicle.maintenance.length > 0) {
      vehicle.maintenance.forEach(record => {
        const type = record.type;
        const cost = record.cost;
        
        totalMaintenanceCost += cost;
        
        if (!maintenanceSummary[type]) {
          maintenanceSummary[type] = {
            cost: 0,
            count: 0
          };
        }
        
        maintenanceSummary[type].cost += cost;
        maintenanceSummary[type].count += 1;
      });
      
      // Add summary data
      Object.keys(maintenanceSummary).forEach(type => {
        summaryWorksheet.addRow({
          category: type,
          totalCost: maintenanceSummary[type].cost.toFixed(2),
          count: maintenanceSummary[type].count
        });
      });
      
      // Add total row
      summaryWorksheet.addRow({
        category: 'TOTAL MAINTENANCE COST',
        totalCost: totalMaintenanceCost.toFixed(2),
        count: vehicle.maintenance.length
      });
      
      // Style the total row
      const totalRow = summaryWorksheet.lastRow;
      totalRow.font = { bold: true };
      totalRow.getCell('totalCost').font = { bold: true, color: { argb: 'FF0000' } };
    } else {
      summaryWorksheet.addRow({ category: 'No maintenance records found' });
    }
    
    // Set content type and disposition
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=vehicle_${vehicle.carCode}_maintenance_report.xlsx`
    );
    
    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error.message);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Generate fleet status report
exports.generateFleetStatusReport = async (req, res) => {
  try {
    // Get all vehicles
    const vehicles = await Vehicle.find().sort({ carCode: 1 });
    
    // Create a new Excel workbook
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Fleet Status');
    
    // Add column headers
    worksheet.columns = [
      { header: 'Car Code', key: 'carCode', width: 12 },
      { header: 'Plate Number', key: 'plateNumber', width: 15 },
      { header: 'Make & Model', key: 'makeModel', width: 20 },
      { header: 'Year', key: 'year', width: 8 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Current Odometer', key: 'currentOdometer', width: 18 },
      { header: 'Last Oil Change', key: 'lastOilChangeOdometer', width: 18 },
      { header: 'Since Last Oil Change', key: 'sinceLast', width: 20 },
      { header: 'Oil Change Needed', key: 'needsOilChange', width: 18 },
      { header: 'License Expiry', key: 'licenseExpiry', width: 15 },
      { header: 'Insurance Expiry', key: 'insuranceExpiry', width: 15 },
      { header: 'Owner', key: 'owner', width: 20 }
    ];
    
    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Add vehicle data to worksheet
    vehicles.forEach(vehicle => {
      const row = worksheet.addRow({
        carCode: vehicle.carCode,
        plateNumber: vehicle.plateNumber,
        makeModel: `${vehicle.make} ${vehicle.model}`,
        year: vehicle.year,
        status: vehicle.status,
        currentOdometer: vehicle.currentOdometer,
        lastOilChangeOdometer: vehicle.lastOilChangeOdometer,
        sinceLast: vehicle.distanceSinceLastOilChange,
        needsOilChange: vehicle.needsOilChange ? 'YES' : 'No',
        licenseExpiry: new Date(vehicle.licenseExpiryDate).toLocaleDateString(),
        insuranceExpiry: new Date(vehicle.insuranceExpiryDate).toLocaleDateString(),
        owner: vehicle.ownerName
      });
      
      // Highlight vehicles needing oil change
      if (vehicle.needsOilChange) {
        row.getCell('needsOilChange').font = { color: { argb: 'FF0000' }, bold: true };
      }
      
      // Highlight expiring licenses (within 30 days)
      const licenseExpiryDate = new Date(vehicle.licenseExpiryDate);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      if (licenseExpiryDate <= thirtyDaysFromNow) {
        row.getCell('licenseExpiry').font = { color: { argb: 'FF0000' }, bold: true };
      }
      
      // Highlight expiring insurance (within 30 days)
      const insuranceExpiryDate = new Date(vehicle.insuranceExpiryDate);
      
      if (insuranceExpiryDate <= thirtyDaysFromNow) {
        row.getCell('insuranceExpiry').font = { color: { argb: 'FF0000' }, bold: true };
      }
    });
    
    // Set content type and disposition
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=fleet_status_report.xlsx'
    );
    
    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};
