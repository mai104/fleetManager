import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const VehicleList = () => {
  const { user } = useAuth();
  const canEdit = user && (user.role === 'admin' || user.permissions.canEdit);
  
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');
  
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilterValue, setStatusFilterValue] = useState(statusFilter || 'all');
  
  // Fetch vehicles data
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get('/api/vehicles');
        setVehicles(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        toast.error('Failed to load vehicles');
        setLoading(false);
      }
    };
    
    fetchVehicles();
  }, []);
  
  // Filter vehicles based on search term and status
  useEffect(() => {
    let filtered = [...vehicles];
    
    // Apply status filter
    if (statusFilterValue !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilterValue);
    }
    
    // Apply search term filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(vehicle => 
        vehicle.carCode.toLowerCase().includes(search) ||
        vehicle.plateNumber.toLowerCase().includes(search) ||
        vehicle.make.toLowerCase().includes(search) ||
        vehicle.model.toLowerCase().includes(search) ||
        vehicle.ownerName.toLowerCase().includes(search)
      );
    }
    
    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm, statusFilterValue]);
  
  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilterValue(status);
  };
  
  // Handle delete vehicle
  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await axios.delete(`/api/vehicles/${id}`);
        toast.success('Vehicle deleted successfully');
        
        // Update vehicles list
        setVehicles(vehicles.filter(vehicle => vehicle._id !== id));
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        toast.error(error.response?.data?.message || 'Failed to delete vehicle');
      }
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'badge-success';
      case 'maintenance':
        return 'badge-warning';
      case 'inactive':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };
  
  return (
    <div className="vehicle-list-container">
      <h1 className="page-title">Vehicles</h1>
      
      <div className="card mb-3">
        <div className="card-body">
          <div className="filters-row">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="status-filters">
              <button
                className={`btn ${statusFilterValue === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleStatusFilterChange('all')}
              >
                All
              </button>
              <button
                className={`btn ${statusFilterValue === 'active' ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => handleStatusFilterChange('active')}
              >
                Active
              </button>
              <button
                className={`btn ${statusFilterValue === 'maintenance' ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={() => handleStatusFilterChange('maintenance')}
              >
                Maintenance
              </button>
              <button
                className={`btn ${statusFilterValue === 'inactive' ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={() => handleStatusFilterChange('inactive')}
              >
                Inactive
              </button>
            </div>
            
            {canEdit && (
              <div className="add-vehicle">
                <Link to="/vehicles/add" className="btn btn-primary">
                  Add New Vehicle
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="vehicle-grid">
        {loading ? (
          <div className="loading">Loading vehicles...</div>
        ) : filteredVehicles.length === 0 ? (
          <div className="no-vehicles">
            <p>No vehicles found. Try changing your search or filters.</p>
            {canEdit && (
              <Link to="/vehicles/add" className="btn btn-primary">
                Add New Vehicle
              </Link>
            )}
          </div>
        ) : (
          filteredVehicles.map(vehicle => (
            <div key={vehicle._id} className="vehicle-card">
              <div className="vehicle-card-header">
                <h3>{vehicle.make} {vehicle.model}</h3>
                <span className={`status-badge ${getStatusBadgeClass(vehicle.status)}`}>
                  {vehicle.status}
                </span>
              </div>
              
              <div className="vehicle-card-body">
                <div className="vehicle-info">
                  <p><strong>Car Code:</strong> {vehicle.carCode}</p>
                  <p><strong>Plate Number:</strong> {vehicle.plateNumber}</p>
                  <p><strong>Year:</strong> {vehicle.year}</p>
                  <p><strong>Current Odometer:</strong> {vehicle.currentOdometer} km</p>
                  
                  {vehicle.needsOilChange && (
                    <div className="oil-change-alert mt-2">
                      <p>
                        <strong>Oil Change Needed!</strong> Last change at {vehicle.lastOilChangeOdometer} km
                        ({vehicle.distanceSinceLastOilChange} km ago)
                      </p>
                    </div>
                  )}
                  
                  <div className="expiry-dates">
                    <p>
                      <strong>License Expires:</strong> {formatDate(vehicle.licenseExpiryDate)}
                      {new Date(vehicle.licenseExpiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                        <span className="expiry-warning"> (Expiring soon)</span>
                      )}
                    </p>
                    <p>
                      <strong>Insurance Expires:</strong> {formatDate(vehicle.insuranceExpiryDate)}
                      {new Date(vehicle.insuranceExpiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                        <span className="expiry-warning"> (Expiring soon)</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="vehicle-actions">
                  <Link to={`/vehicles/${vehicle._id}`} className="btn btn-info">
                    View Details
                  </Link>
                  
                  {canEdit && (
                    <>
                      <Link to={`/vehicles/edit/${vehicle._id}`} className="btn btn-primary">
                        Edit
                      </Link>
                      
                      <button
                        onClick={() => handleDeleteVehicle(vehicle._id)}
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VehicleList;
