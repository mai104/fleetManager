import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { useAuth } from '../../context/AuthContext';

const MovementList = () => {
  const { user } = useAuth();
  const canEdit = user && (user.role === 'admin' || user.permissions.canEdit);
  
  const [loading, setLoading] = useState(true);
  const [movements, setMovements] = useState([]);
  const [pagination, setPagination] = useState({
    totalPages: 0,
    currentPage: 1,
    total: 0
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    carCode: '',
    driverName: '',
    supervisorName: '',
    department: '',
    client: '',
    startDate: null,
    endDate: null
  });
  
  // Reference data states
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [clients, setClients] = useState([]);
  
  // Fetch movements with pagination and filters
  const fetchMovements = async (page = 1) => {
    setLoading(true);
    try {
      // Build query parameters
      const params = { page, limit: 10 };
      
      if (filters.carCode) params.carCode = filters.carCode;
      if (filters.driverName) params.driverName = filters.driverName;
      if (filters.supervisorName) params.supervisorName = filters.supervisorName;
      if (filters.department) params.department = filters.department;
      if (filters.client) params.client = filters.client;
      if (filters.startDate) params.startDate = filters.startDate.toISOString();
      if (filters.endDate) params.endDate = filters.endDate.toISOString();
      
      const response = await axios.get('/api/movements', { params });
      
      setMovements(response.data.movements);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching movements:', error);
      toast.error('Failed to load movements');
      setLoading(false);
    }
  };
  
  // Fetch reference data for filters
  const fetchReferenceData = async () => {
    try {
      // Fetch vehicles
      const vehiclesRes = await axios.get('/api/vehicles');
      setVehicles(vehiclesRes.data);
      
      // Fetch drivers
      const driversRes = await axios.get('/api/drivers');
      setDrivers(driversRes.data);
      
      // Fetch supervisors
      const supervisorsRes = await axios.get('/api/supervisors');
      setSupervisors(supervisorsRes.data);
      
      // Fetch departments
      const departmentsRes = await axios.get('/api/departments');
      setDepartments(departmentsRes.data);
      
      // Fetch clients
      const clientsRes = await axios.get('/api/clients');
      setClients(clientsRes.data);
    } catch (error) {
      console.error('Error fetching reference data:', error);
      toast.error('Failed to load filter options');
    }
  };
  
  // Initial data load
  useEffect(() => {
    fetchMovements();
    fetchReferenceData();
  }, []);
  
  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  // Apply filters
  const applyFilters = () => {
    fetchMovements(1); // Reset to first page when applying filters
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      carCode: '',
      driverName: '',
      supervisorName: '',
      department: '',
      client: '',
      startDate: null,
      endDate: null
    });
    fetchMovements(1);
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    fetchMovements(page);
  };
  
  // Delete movement
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this movement record?')) {
      try {
        await axios.delete(`/api/movements/${id}`);
        toast.success('Movement deleted successfully');
        fetchMovements(pagination.currentPage);
      } catch (error) {
        console.error('Error deleting movement:', error);
        toast.error('Failed to delete movement');
      }
    }
  };
  
  // Format options for select inputs
  const vehicleOptions = [
    { value: '', label: 'All Vehicles' },
    ...vehicles.map(vehicle => ({
      value: vehicle.carCode,
      label: `${vehicle.carCode} - ${vehicle.plateNumber}`
    }))
  ];
  
  const driverOptions = [
    { value: '', label: 'All Drivers' },
    ...drivers.map(driver => ({
      value: driver.name,
      label: driver.name
    }))
  ];
  
  const supervisorOptions = [
    { value: '', label: 'All Supervisors' },
    ...supervisors.map(supervisor => ({
      value: supervisor.name,
      label: supervisor.name
    }))
  ];
  
  const departmentOptions = [
    { value: '', label: 'All Departments' },
    ...departments.map(dept => ({
      value: dept.name,
      label: dept.name
    }))
  ];
  
  const clientOptions = [
    { value: '', label: 'All Clients' },
    ...clients.map(client => ({
      value: client.name,
      label: client.name
    }))
  ];
  
  return (
    <div className="movement-list-container">
      <h1 className="page-title">Vehicle Movements</h1>
      
      <div className="card mb-3">
        <div className="card-header">
          <h3>Filters</h3>
        </div>
        <div className="card-body">
          <div className="filters-grid">
            <div className="form-group">
              <label>Vehicle</label>
              <Select
                options={vehicleOptions}
                value={vehicleOptions.find(option => option.value === filters.carCode)}
                onChange={(option) => handleFilterChange('carCode', option.value)}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
            
            <div className="form-group">
              <label>Driver</label>
              <Select
                options={driverOptions}
                value={driverOptions.find(option => option.value === filters.driverName)}
                onChange={(option) => handleFilterChange('driverName', option.value)}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
            
            <div className="form-group">
              <label>Supervisor</label>
              <Select
                options={supervisorOptions}
                value={supervisorOptions.find(option => option.value === filters.supervisorName)}
                onChange={(option) => handleFilterChange('supervisorName', option.value)}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
            
            <div className="form-group">
              <label>Department</label>
              <Select
                options={departmentOptions}
                value={departmentOptions.find(option => option.value === filters.department)}
                onChange={(option) => handleFilterChange('department', option.value)}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
            
            <div className="form-group">
              <label>Client</label>
              <Select
                options={clientOptions}
                value={clientOptions.find(option => option.value === filters.client)}
                onChange={(option) => handleFilterChange('client', option.value)}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
            
            <div className="form-group">
              <label>Start Date</label>
              <DatePicker
                selected={filters.startDate}
                onChange={(date) => handleFilterChange('startDate', date)}
                selectsStart
                startDate={filters.startDate}
                endDate={filters.endDate}
                dateFormat="yyyy-MM-dd"
                className="form-control"
                isClearable
              />
            </div>
            
            <div className="form-group">
              <label>End Date</label>
              <DatePicker
                selected={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                selectsEnd
                startDate={filters.startDate}
                endDate={filters.endDate}
                dateFormat="yyyy-MM-dd"
                className="form-control"
                isClearable
                minDate={filters.startDate}
              />
            </div>
          </div>
          
          <div className="filter-actions">
            <button onClick={applyFilters} className="btn btn-primary">
              Apply Filters
            </button>
            <button onClick={resetFilters} className="btn btn-secondary">
              Reset Filters
            </button>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <div className="flex-between">
            <h3>Movement Records</h3>
            {canEdit && (
              <Link to="/movements/add" className="btn btn-primary">
                Add New Movement
              </Link>
            )}
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : movements.length === 0 ? (
            <p>No movement records found. Try adjusting your filters or add a new movement.</p>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Car Code</th>
                      <th>Plate Number</th>
                      <th>Driver Name</th>
                      <th>Department</th>
                      <th>Client</th>
                      <th>Route</th>
                      <th>Odometer</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map(movement => (
                      <tr key={movement._id}>
                        <td>{new Date(movement.date).toLocaleDateString()}</td>
                        <td>{movement.carCode}</td>
                        <td>{movement.plateNumber}</td>
                        <td>{movement.driverName}</td>
                        <td>{movement.department}</td>
                        <td>{movement.client}</td>
                        <td>{movement.route}</td>
                        <td>{movement.odometerReading} km</td>
                        <td>
                          <div className="action-buttons">
                            <Link to={`/movements/${movement._id}`} className="btn btn-sm btn-info">
                              View
                            </Link>
                            {canEdit && (
                              <>
                                <Link to={`/movements/edit/${movement._id}`} className="btn btn-sm btn-primary">
                                  Edit
                                </Link>
                                <button
                                  onClick={() => handleDelete(movement._id)}
                                  className="btn btn-sm btn-danger"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="btn btn-sm btn-secondary"
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {pagination.currentPage} of {pagination.totalPages} ({pagination.total} total records)
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="btn btn-sm btn-secondary"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovementList;
