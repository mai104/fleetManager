import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user && (user.role === 'admin' || user.permissions.canEdit);
  const canExport = user && (user.role === 'admin' || user.permissions.canExport);
  
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState(null);
  const [movements, setMovements] = useState([]);
  const [movementsLoading, setMovementsLoading] = useState(true);
  
  // Fetch vehicle data
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await axios.get(`/api/vehicles/${id}`);
        setVehicle(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching vehicle:', error);
        toast.error('Failed to load vehicle details');
        setLoading(false);
        navigate('/vehicles');
      }
    };
    
    fetchVehicle();
  }, [id, navigate]);
  
  // Fetch vehicle movements
  useEffect(() => {
    const fetchMovements = async () => {
      if (vehicle) {
        try {
          const response = await axios.get(`/api/movements/car/${vehicle.carCode}`);
          setMovements(response.data);
          setMovementsLoading(false);
        } catch (error) {
          console.error('Error fetching movements:', error);
          toast.error('Failed to load vehicle movements');
          setMovementsLoading(false);
        }
      }
    };
    
    if (vehicle) {
      fetchMovements();
    }
  }, [vehicle]);
  
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
  
  // Handle delete maintenance record
  const handleDeleteMaintenance = async (maintenanceId) => {
    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      try {
        await axios.delete(`/api/vehicles/${id}/maintenance/${maintenanceId}`);
        toast.success('Maintenance record deleted successfully');
        
        // Update vehicle data
        const response = await axios.get(`/api/vehicles/${id}`);
        setVehicle(response.data);
      } catch (error) {
        console.error('Error deleting maintenance record:', error);
        toast.error('Failed to delete maintenance record');
      }
    }
  };
  
  // Export maintenance report
  const exportMaintenanceReport = () => {
    window.open(`/api/reports/maintenance/${id}`, '_blank');
  };
  
  if (loading) {
    return <div className="loading">Loading vehicle details...</div>;
  }
  
  if (!vehicle) {
    return <div className="error">Vehicle not found</div>;
  }
  
  return (
    <div className="vehicle-detail-container">
      <div className="detail-header">
        <h1 className="page-title">{vehicle.make} {vehicle.model} Details</h1>
        
        <div className="detail-actions">
          <Link to="/vehicles" className="btn btn-secondary">
            Back to Vehicles
          </Link>
          
          {canEdit && (
            <Link to={`/vehicles/edit/${id}`} className="btn btn-primary">
              Edit Vehicle
            </Link>
          )}
          
          {canExport && (
            <button onClick={exportMaintenanceReport} className="btn btn-success">
              Export Maintenance Report
            </button>
          )}
        </div>
      </div>
      
      {/* Vehicle Info */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="flex-between">
            <h2>Vehicle Information</h2>
            <span className={`status-badge ${getStatusBadgeClass(vehicle.status)}`}>
              {vehicle.status}
            </span>
          </div>
        </div>
        <div className="card-body">
          <div className="info-grid">
            <div className="info-section">
              <h3>Basic Information</h3>
              <div className="info-row">
                <div className="info-label">Car Code</div>
                <div className="info-value">{vehicle.carCode}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Plate Number</div>
                <div className="info-value">{vehicle.plateNumber}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Make</div>
                <div className="info-value">{vehicle.make}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Model</div>
                <div className="info-value">{vehicle.model}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Year</div>
                <div className="info-value">{vehicle.year}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Owner</div>
                <div className="info-value">{vehicle.ownerName}</div>
              </div>
            </div>
            
            <div className="info-section">
              <h3>Technical Details</h3>
              <div className="info-row">
                <div className="info-label">Chassis Number</div>
                <div className="info-value">{vehicle.chassisNumber}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Engine Number</div>
                <div className="info-value">{vehicle.engineNumber}</div>
              </div>
              <div className="info-row">
                <div className="info-label">SIM Number</div>
                <div className="info-value">{vehicle.simNumber || 'N/A'}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Current Odometer</div>
                <div className="info-value">{vehicle.currentOdometer} km</div>
              </div>
              <div className="info-row">
                <div className="info-label">Last Oil Change</div>
                <div className="info-value">{vehicle.lastOilChangeOdometer} km</div>
              </div>
              <div className="info-row">
                <div className="info-label">Distance Since Last Oil Change</div>
                <div className={`info-value ${vehicle.needsOilChange ? 'text-danger' : ''}`}>
                  {vehicle.distanceSinceLastOilChange} km
                  {vehicle.needsOilChange && ' (Oil change needed)'}
                </div>
              </div>
            </div>
            
            <div className="info-section">
              <h3>Expiry Dates</h3>
              <div className="info-row">
                <div className="info-label">License Expiry</div>
                <div className={`info-value ${new Date(vehicle.licenseExpiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'text-danger' : ''}`}>
                  {formatDate(vehicle.licenseExpiryDate)}
                  {new Date(vehicle.licenseExpiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && ' (Expiring soon)'}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">Insurance Expiry</div>
                <div className={`info-value ${new Date(vehicle.insuranceExpiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'text-danger' : ''}`}>
                  {formatDate(vehicle.insuranceExpiryDate)}
                  {new Date(vehicle.insuranceExpiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && ' (Expiring soon)'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Maintenance History */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="flex-between">
            <h2>Maintenance History</h2>
            {canEdit && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate(`/vehicles/${id}/maintenance/add`)}
              >
                Add Maintenance Record
              </button>
            )}
          </div>
        </div>
        <div className="card-body">
          {vehicle.maintenance && vehicle.maintenance.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Cost</th>
                    <th>Location</th>
                    <th>Odometer</th>
                    <th>Performed By</th>
                    {canEdit && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {vehicle.maintenance.sort((a, b) => new Date(b.date) - new Date(a.date)).map((record) => (
                    <tr key={record._id}>
                      <td>{formatDate(record.date)}</td>
                      <td>{record.type}</td>
                      <td>{record.description}</td>
                      <td>${record.cost.toFixed(2)}</td>
                      <td>{record.location}</td>
                      <td>{record.odometerReading} km</td>
                      <td>{record.performedBy}</td>
                      {canEdit && (
                        <td>
                          <div className="action-buttons">
                            <Link
                              to={`/vehicles/${id}/maintenance/edit/${record._id}`}
                              className="btn btn-sm btn-primary"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteMaintenance(record._id)}
                              className="btn btn-sm btn-danger"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No maintenance records found for this vehicle.</p>
          )}
        </div>
      </div>
      
      {/* Recent Movements */}
      <div className="card">
        <div className="card-header">
          <div className="flex-between">
            <h2>Recent Movements</h2>
            <Link to={`/movements?carCode=${vehicle.carCode}`} className="btn btn-primary">
              View All Movements
            </Link>
          </div>
        </div>
        <div className="card-body">
          {movementsLoading ? (
            <div className="loading">Loading movements...</div>
          ) : movements.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Driver</th>
                    <th>Route</th>
                    <th>Departure</th>
                    <th>Arrival</th>
                    <th>Odometer</th>
                    <th>Fuel Cost</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.slice(0, 5).map((movement) => (
                    <tr key={movement._id}>
                      <td>{formatDate(movement.date)}</td>
                      <td>{movement.driverName}</td>
                      <td>{movement.route}</td>
                      <td>{new Date(movement.departureTime).toLocaleTimeString()}</td>
                      <td>{new Date(movement.arrivalTime).toLocaleTimeString()}</td>
                      <td>{movement.odometerReading} km</td>
                      <td>${movement.fuelCost.toFixed(2)}</td>
                      <td>
                        <Link to={`/movements/${movement._id}`} className="btn btn-sm btn-info">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No movement records found for this vehicle.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
