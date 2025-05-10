import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    inMaintenanceVehicles: 0,
    inactiveVehicles: 0,
    vehiclesNeedingOilChange: []
  });
  const [recentMovements, setRecentMovements] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get vehicles data for stats
        const vehiclesRes = await axios.get('/api/vehicles');
        const vehicles = vehiclesRes.data;
        
        // Get vehicles needing oil change
        const oilChangeRes = await axios.get('/api/vehicles/oil-change-needed');
        const vehiclesNeedingOilChange = oilChangeRes.data;
        
        // Get recent movements (last 5)
        const movementsRes = await axios.get('/api/movements/recent?limit=5');
        const recentMovements = movementsRes.data.movements || [];
        
        // Calculate stats
        const activeVehicles = vehicles.filter(v => v.status === 'active').length;
        const inMaintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
        const inactiveVehicles = vehicles.filter(v => v.status === 'inactive').length;
        
        setStats({
          totalVehicles: vehicles.length,
          activeVehicles,
          inMaintenanceVehicles,
          inactiveVehicles,
          vehiclesNeedingOilChange
        });
        
        setRecentMovements(recentMovements);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }
  
  return (
    <div className="dashboard-container">
      <h1 className="page-title">Dashboard</h1>
      
      {/* Oil Change Alerts */}
      {stats.vehiclesNeedingOilChange.length > 0 && (
        <div className="oil-change-alerts mb-3">
          <h2>Oil Change Alerts</h2>
          {stats.vehiclesNeedingOilChange.map(vehicle => (
            <div key={vehicle._id} className="oil-change-alert">
              <h3>Oil Change Needed</h3>
              <p>
                Vehicle <strong>{vehicle.carCode}</strong> ({vehicle.make} {vehicle.model}) 
                needs an oil change. Last oil change was at {vehicle.lastOilChangeOdometer} km, 
                current reading is {vehicle.currentOdometer} km 
                ({vehicle.distanceSinceLastOilChange} km since last oil change).
              </p>
              <div className="mt-2">
                <Link to={`/vehicles/${vehicle._id}`} className="btn btn-sm btn-primary">
                  View Vehicle
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Vehicle Stats */}
      <div className="dashboard-grid mb-4">
        <div className="dashboard-widget">
          <div className="widget-header">
            <h3 className="widget-title">Total Vehicles</h3>
          </div>
          <div className="widget-value">{stats.totalVehicles}</div>
          <Link to="/vehicles" className="btn btn-sm btn-primary">View All</Link>
        </div>
        
        <div className="dashboard-widget">
          <div className="widget-header">
            <h3 className="widget-title">Active Vehicles</h3>
          </div>
          <div className="widget-value">{stats.activeVehicles}</div>
          <Link to="/vehicles?status=active" className="btn btn-sm btn-primary">View Active</Link>
        </div>
        
        <div className="dashboard-widget">
          <div className="widget-header">
            <h3 className="widget-title">In Maintenance</h3>
          </div>
          <div className="widget-value">{stats.inMaintenanceVehicles}</div>
          <Link to="/vehicles?status=maintenance" className="btn btn-sm btn-primary">View In Maintenance</Link>
        </div>
        
        <div className="dashboard-widget">
          <div className="widget-header">
            <h3 className="widget-title">Inactive Vehicles</h3>
          </div>
          <div className="widget-value">{stats.inactiveVehicles}</div>
          <Link to="/vehicles?status=inactive" className="btn btn-sm btn-primary">View Inactive</Link>
        </div>
      </div>
      
      {/* Recent Movements */}
      <div className="recent-movements">
        <div className="flex-between mb-2">
          <h2>Recent Movements</h2>
          <Link to="/movements" className="btn btn-sm btn-primary">View All</Link>
        </div>
        
        {recentMovements.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Car Code</th>
                  <th>Driver</th>
                  <th>Route</th>
                  <th>Departure</th>
                  <th>Arrival</th>
                  <th>Odometer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentMovements.map(movement => (
                  <tr key={movement._id}>
                    <td>{new Date(movement.date).toLocaleDateString()}</td>
                    <td>{movement.carCode}</td>
                    <td>{movement.driverName}</td>
                    <td>{movement.route}</td>
                    <td>{new Date(movement.departureTime).toLocaleTimeString()}</td>
                    <td>{new Date(movement.arrivalTime).toLocaleTimeString()}</td>
                    <td>{movement.odometerReading} km</td>
                    <td>
                      <Link to={`/movements/${movement._id}`} className="btn btn-sm btn-primary">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No recent movements found.</p>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="quick-actions mt-4">
        <h2>Quick Actions</h2>
        <div className="dashboard-grid">
          <Link to="/movements/add" className="dashboard-widget">
            <div className="widget-header">
              <h3 className="widget-title">New Movement</h3>
            </div>
            <p>Record a new vehicle movement</p>
          </Link>
          
          <Link to="/vehicles/add" className="dashboard-widget">
            <div className="widget-header">
              <h3 className="widget-title">Add Vehicle</h3>
            </div>
            <p>Register a new vehicle in the system</p>
          </Link>
          
          <Link to="/reports" className="dashboard-widget">
            <div className="widget-header">
              <h3 className="widget-title">Generate Reports</h3>
            </div>
            <p>Create and export reports</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
