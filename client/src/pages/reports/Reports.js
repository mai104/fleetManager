import React, { useState } from 'react';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';

// Mock data for initial version until API is working
const mockVehicles = [
  { _id: '1', carCode: '123123', make: 'BMW', model: '3 Series', plateNumber: '123123', year: 2019 },
  { _id: '2', carCode: '11111', make: 'BMW', model: '5 Series', plateNumber: '000000', year: 2019 }
];

const mockDrivers = [
  { _id: '1', name: 'John Doe' },
  { _id: '2', name: 'Jane Smith' }
];

const mockSupervisors = [
  { _id: '1', name: 'Mike Johnson' },
  { _id: '2', name: 'Sarah Williams' }
];

const mockDepartments = [
  { _id: '1', name: 'Sales' },
  { _id: '2', name: 'Operations' }
];

const mockClients = [
  { _id: '1', name: 'ABC Corp' },
  { _id: '2', name: 'XYZ Inc' }
];

const Reports = () => {
  // Movement report filters
  const [movementFilters, setMovementFilters] = useState({
    carCode: '',
    driverName: '',
    supervisorName: '',
    department: '',
    client: '',
    startDate: null,
    endDate: null
  });
  
  // Selected vehicle for maintenance report
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  // Handle movement filter changes
  const handleMovementFilterChange = (name, value) => {
    setMovementFilters({
      ...movementFilters,
      [name]: value
    });
  };
  
  // Generate movement report
  const generateMovementReport = () => {
    // In real app, this would hit the API
    // For now, just show a toast
    toast.info('Generating movement report...');
    
    // Normally we would build the query params and open the report in a new tab
    // window.open(`/api/reports/movements?${params.toString()}`, '_blank');
    
    // For demo, just download a sample file
    const sampleFile = 'https://file-examples.com/storage/fe5947fd2362fc197a3be5d/2017/02/file_example_XLSX_10.xlsx';
    window.open(sampleFile, '_blank');
  };
  
  // Generate maintenance report
  const generateMaintenanceReport = () => {
    if (!selectedVehicle) {
      toast.error('Please select a vehicle');
      return;
    }
    
    toast.info('Generating maintenance report...');
    
    // For demo, just download a sample file
    const sampleFile = 'https://file-examples.com/storage/fe5947fd2362fc197a3be5d/2017/02/file_example_XLSX_10.xlsx';
    window.open(sampleFile, '_blank');
  };
  
  // Generate fleet status report
  const generateFleetStatusReport = () => {
    toast.info('Generating fleet status report...');
    
    // For demo, just download a sample file
    const sampleFile = 'https://file-examples.com/storage/fe5947fd2362fc197a3be5d/2017/02/file_example_XLSX_10.xlsx';
    window.open(sampleFile, '_blank');
  };
  
  // Format options for select inputs
  const vehicleOptions = [
    { value: '', label: 'All Vehicles' },
    ...mockVehicles.map(vehicle => ({
      value: vehicle.carCode,
      label: `${vehicle.carCode} - ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber})`
    }))
  ];
  
  const vehicleMaintenanceOptions = mockVehicles.map(vehicle => ({
    value: vehicle._id,
    label: `${vehicle.carCode} - ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber})`
  }));
  
  const driverOptions = [
    { value: '', label: 'All Drivers' },
    ...mockDrivers.map(driver => ({
      value: driver.name,
      label: driver.name
    }))
  ];
  
  const supervisorOptions = [
    { value: '', label: 'All Supervisors' },
    ...mockSupervisors.map(supervisor => ({
      value: supervisor.name,
      label: supervisor.name
    }))
  ];
  
  const departmentOptions = [
    { value: '', label: 'All Departments' },
    ...mockDepartments.map(dept => ({
      value: dept.name,
      label: dept.name
    }))
  ];
  
  const clientOptions = [
    { value: '', label: 'All Clients' },
    ...mockClients.map(client => ({
      value: client.name,
      label: client.name
    }))
  ];
  
  return (
    <div className="reports-container">
      <h1 className="page-title">Reports</h1>
      
      <div className="card mb-4">
        <div className="card-header">
          <h2>Movement Report</h2>
        </div>
        <div className="card-body">
          <p>Generate a report of vehicle movements. Filter by vehicle, driver, date range, and more.</p>
          
          <div className="filters-grid">
            <div className="form-group">
              <label>Vehicle</label>
              <Select
                options={vehicleOptions}
                value={vehicleOptions.find(option => option.value === movementFilters.carCode)}
                onChange={(option) => handleMovementFilterChange('carCode', option.value)}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
            
            <div className="form-group">
              <label>Driver</label>
              <Select
                options={driverOptions}
                value={driverOptions.find(option => option.value === movementFilters.driverName)}
                onChange={(option) => handleMovementFilterChange('driverName', option.value)}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
            
            <div className="form-group">
              <label>Supervisor</label>
              <Select
                options={supervisorOptions}
                value={supervisorOptions.find(option => option.value === movementFilters.supervisorName)}
                onChange={(option) => handleMovementFilterChange('supervisorName', option.value)}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
            
            <div className="form-group">
              <label>Department</label>
              <Select
                options={departmentOptions}
                value={departmentOptions.find(option => option.value === movementFilters.department)}
                onChange={(option) => handleMovementFilterChange('department', option.value)}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
            
            <div className="form-group">
              <label>Client</label>
              <Select
                options={clientOptions}
                value={clientOptions.find(option => option.value === movementFilters.client)}
                onChange={(option) => handleMovementFilterChange('client', option.value)}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
            
            <div className="form-group">
              <label>Start Date</label>
              <DatePicker
                selected={movementFilters.startDate}
                onChange={(date) => handleMovementFilterChange('startDate', date)}
                selectsStart
                startDate={movementFilters.startDate}
                endDate={movementFilters.endDate}
                dateFormat="yyyy-MM-dd"
                className="form-control"
                isClearable
              />
            </div>
            
            <div className="form-group">
              <label>End Date</label>
              <DatePicker
                selected={movementFilters.endDate}
                onChange={(date) => handleMovementFilterChange('endDate', date)}
                selectsEnd
                startDate={movementFilters.startDate}
                endDate={movementFilters.endDate}
                dateFormat="yyyy-MM-dd"
                className="form-control"
                isClearable
                minDate={movementFilters.startDate}
              />
            </div>
          </div>
          
          <div className="report-actions">
            <button onClick={generateMovementReport} className="btn btn-primary">
              Generate Movement Report
            </button>
          </div>
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-header">
          <h2>Maintenance Report</h2>
        </div>
        <div className="card-body">
          <p>Generate a detailed maintenance history report for a specific vehicle.</p>
          
          <div className="form-group">
            <label>Select Vehicle</label>
            <Select
              options={vehicleMaintenanceOptions}
              value={vehicleMaintenanceOptions.find(option => option.value === selectedVehicle)}
              onChange={(option) => setSelectedVehicle(option.value)}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select a vehicle"
            />
          </div>
          
          <div className="report-actions">
            <button 
              onClick={generateMaintenanceReport} 
              className="btn btn-primary"
              disabled={!selectedVehicle}
            >
              Generate Maintenance Report
            </button>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2>Fleet Status Report</h2>
        </div>
        <div className="card-body">
          <p>Generate a comprehensive status report for all vehicles in the fleet.</p>
          <p>The report includes vehicle details, odometer readings, oil change status, and expiry dates.</p>
          
          <div className="report-actions">
            <button onClick={generateFleetStatusReport} className="btn btn-primary">
              Generate Fleet Status Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
