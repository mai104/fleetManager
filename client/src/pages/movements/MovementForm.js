import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';

const MovementForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(true);
  const [movement, setMovement] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [clients, setClients] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all vehicles for selection
        const vehiclesRes = await axios.get('/api/vehicles');
        const activeVehicles = vehiclesRes.data.filter(v => v.status === 'active');
        setVehicles(activeVehicles);
        
        // Fetch all drivers
        const driversRes = await axios.get('/api/drivers');
        setDrivers(driversRes.data);
        
        // Fetch all supervisors
        const supervisorsRes = await axios.get('/api/supervisors');
        setSupervisors(supervisorsRes.data);
        
        // Fetch all departments
        const departmentsRes = await axios.get('/api/departments');
        setDepartments(departmentsRes.data);
        
        // Fetch all clients
        const clientsRes = await axios.get('/api/clients');
        setClients(clientsRes.data);
        
        // Fetch all routes
        const routesRes = await axios.get('/api/routes');
        setRoutes(routesRes.data);
        
        // If editing, fetch movement data
        if (isEditMode) {
          const movementRes = await axios.get(`/api/movements/${id}`);
          setMovement(movementRes.data);
          
          // Find selected vehicle
          const vehicle = activeVehicles.find(v => v.carCode === movementRes.data.carCode);
          setSelectedVehicle(vehicle);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load required data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditMode]);
  
  // Format options for select inputs
  const vehicleOptions = vehicles.map(vehicle => ({
    value: vehicle.carCode,
    label: `${vehicle.carCode} - ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber})`,
    vehicle
  }));
  
  const driverOptions = drivers.map(driver => ({
    value: driver.name,
    label: driver.name
  }));
  
  const supervisorOptions = supervisors.map(supervisor => ({
    value: supervisor.name,
    label: supervisor.name
  }));
  
  const departmentOptions = departments.map(dept => ({
    value: dept.name,
    label: dept.name
  }));
  
  const clientOptions = clients.map(client => ({
    value: client.name,
    label: client.name
  }));
  
  const routeOptions = routes.map(route => ({
    value: route.name,
    label: route.name
  }));
  
  // Validation schema
  const validationSchema = Yup.object().shape({
    carCode: Yup.string().required('Car code is required'),
    driverName: Yup.string().required('Driver name is required'),
    supervisorName: Yup.string().required('Supervisor name is required'),
    department: Yup.string().required('Department is required'),
    client: Yup.string().required('Client is required'),
    route: Yup.string().required('Route is required'),
    departureTime: Yup.date().required('Departure time is required'),
    arrivalTime: Yup.date().required('Arrival time is required')
      .min(
        Yup.ref('departureTime'),
        'Arrival time must be after departure time'
      ),
    odometerReading: Yup.number()
      .required('Odometer reading is required')
      .positive('Odometer reading must be positive'),
    fuelCost: Yup.number()
      .required('Fuel cost is required')
      .min(0, 'Fuel cost cannot be negative'),
    notes: Yup.string()
  });
  
  // Handle vehicle selection
  const handleVehicleChange = (selectedOption) => {
    setSelectedVehicle(selectedOption.vehicle);
  };
  
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        // Update existing movement
        await axios.put(`/api/movements/${id}`, values);
        toast.success('Movement updated successfully');
      } else {
        // Create new movement
        await axios.post('/api/movements', values);
        toast.success('Movement created successfully');
      }
      
      navigate('/movements');
    } catch (error) {
      console.error('Error saving movement:', error);
      toast.error(error.response?.data?.message || 'Failed to save movement');
    }
    
    setSubmitting(false);
  };
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  // Initial values for the form
  const initialValues = isEditMode && movement
    ? {
        carCode: movement.carCode,
        driverName: movement.driverName,
        supervisorName: movement.supervisorName,
        department: movement.department,
        client: movement.client,
        route: movement.route,
        departureTime: new Date(movement.departureTime),
        arrivalTime: new Date(movement.arrivalTime),
        odometerReading: movement.odometerReading,
        fuelCost: movement.fuelCost,
        notes: movement.notes || ''
      }
    : {
        carCode: '',
        driverName: '',
        supervisorName: '',
        department: '',
        client: '',
        route: '',
        departureTime: new Date(),
        arrivalTime: new Date(new Date().getTime() + 30 * 60000), // 30 minutes later
        odometerReading: selectedVehicle ? selectedVehicle.currentOdometer : '',
        fuelCost: 0,
        notes: ''
      };
  
  return (
    <div className="movement-form-container">
      <h1 className="page-title">
        {isEditMode ? 'Edit Movement' : 'Record New Movement'}
      </h1>
      
      <div className="card">
        <div className="card-body">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue, isSubmitting, touched, errors }) => (
              <Form>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="carCode">Vehicle</label>
                    <Select
                      options={vehicleOptions}
                      onChange={(option) => {
                        setFieldValue('carCode', option.value);
                        handleVehicleChange(option);
                      }}
                      value={vehicleOptions.find(option => option.value === values.carCode)}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                    {touched.carCode && errors.carCode && (
                      <div className="text-danger">{errors.carCode}</div>
                    )}
                  </div>
                  
                  {selectedVehicle && (
                    <div className="vehicle-info alert alert-info">
                      <p><strong>Plate Number:</strong> {selectedVehicle.plateNumber}</p>
                      <p><strong>Current Odometer:</strong> {selectedVehicle.currentOdometer} km</p>
                      {selectedVehicle.needsOilChange && (
                        <p className="text-danger">
                          <strong>Warning:</strong> This vehicle needs an oil change.
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="driverName">Driver</label>
                    <Select
                      options={driverOptions}
                      onChange={(option) => setFieldValue('driverName', option.value)}
                      value={driverOptions.find(option => option.value === values.driverName)}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                    {touched.driverName && errors.driverName && (
                      <div className="text-danger">{errors.driverName}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="supervisorName">Supervisor</label>
                    <Select
                      options={supervisorOptions}
                      onChange={(option) => setFieldValue('supervisorName', option.value)}
                      value={supervisorOptions.find(option => option.value === values.supervisorName)}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                    {touched.supervisorName && errors.supervisorName && (
                      <div className="text-danger">{errors.supervisorName}</div>
                    )}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="department">Department</label>
                    <Select
                      options={departmentOptions}
                      onChange={(option) => setFieldValue('department', option.value)}
                      value={departmentOptions.find(option => option.value === values.department)}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                    {touched.department && errors.department && (
                      <div className="text-danger">{errors.department}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="client">Client</label>
                    <Select
                      options={clientOptions}
                      onChange={(option) => setFieldValue('client', option.value)}
                      value={clientOptions.find(option => option.value === values.client)}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                    {touched.client && errors.client && (
                      <div className="text-danger">{errors.client}</div>
                    )}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="route">Route</label>
                    <Select
                      options={routeOptions}
                      onChange={(option) => setFieldValue('route', option.value)}
                      value={routeOptions.find(option => option.value === values.route)}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                    {touched.route && errors.route && (
                      <div className="text-danger">{errors.route}</div>
                    )}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="departureTime">Departure Time</label>
                    <DatePicker
                      selected={values.departureTime}
                      onChange={(date) => setFieldValue('departureTime', date)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="form-control"
                    />
                    {touched.departureTime && errors.departureTime && (
                      <div className="text-danger">{errors.departureTime}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="arrivalTime">Arrival Time</label>
                    <DatePicker
                      selected={values.arrivalTime}
                      onChange={(date) => setFieldValue('arrivalTime', date)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="form-control"
                    />
                    {touched.arrivalTime && errors.arrivalTime && (
                      <div className="text-danger">{errors.arrivalTime}</div>
                    )}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="odometerReading">Odometer Reading (km)</label>
                    <Field
                      type="number"
                      name="odometerReading"
                      className="form-control"
                      min={selectedVehicle ? selectedVehicle.currentOdometer : 0}
                    />
                    {touched.odometerReading && errors.odometerReading && (
                      <div className="text-danger">{errors.odometerReading}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="fuelCost">Fuel Cost</label>
                    <Field
                      type="number"
                      name="fuelCost"
                      className="form-control"
                      min="0"
                      step="0.01"
                    />
                    {touched.fuelCost && errors.fuelCost && (
                      <div className="text-danger">{errors.fuelCost}</div>
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes">Notes</label>
                  <Field
                    as="textarea"
                    name="notes"
                    className="form-control"
                    rows="3"
                  />
                </div>
                
                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : isEditMode ? 'Update Movement' : 'Record Movement'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/movements')}
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default MovementForm;
