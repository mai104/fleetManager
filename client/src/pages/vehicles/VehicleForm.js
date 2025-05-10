import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';

const VehicleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(isEditMode);
  const [vehicle, setVehicle] = useState(null);
  
  // Fetch vehicle data if in edit mode
  useEffect(() => {
    const fetchVehicle = async () => {
      if (isEditMode) {
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
      }
    };
    
    fetchVehicle();
  }, [id, isEditMode, navigate]);
  
  // Validation schema
  const validationSchema = Yup.object().shape({
    carCode: Yup.string()
      .required('Car code is required')
      .min(2, 'Car code must be at least 2 characters'),
    plateNumber: Yup.string()
      .required('Plate number is required')
      .min(2, 'Plate number must be at least 2 characters'),
    make: Yup.string()
      .required('Make is required'),
    model: Yup.string()
      .required('Model is required'),
    year: Yup.number()
      .required('Year is required')
      .integer('Year must be a whole number')
      .min(1900, 'Year cannot be before 1900')
      .max(new Date().getFullYear() + 1, `Year cannot be later than ${new Date().getFullYear() + 1}`),
    chassisNumber: Yup.string()
      .required('Chassis number is required'),
    engineNumber: Yup.string()
      .required('Engine number is required'),
    simNumber: Yup.string(),
    ownerName: Yup.string()
      .required('Owner name is required'),
    licenseExpiryDate: Yup.date()
      .required('License expiry date is required'),
    insuranceExpiryDate: Yup.date()
      .required('Insurance expiry date is required'),
    lastOilChangeOdometer: Yup.number()
      .required('Last oil change odometer reading is required')
      .integer('Odometer reading must be a whole number')
      .min(0, 'Odometer reading cannot be negative'),
    currentOdometer: Yup.number()
      .required('Current odometer reading is required')
      .integer('Odometer reading must be a whole number')
      .min(Yup.ref('lastOilChangeOdometer'), 'Current odometer cannot be less than last oil change odometer'),
    status: Yup.string()
      .required('Status is required')
      .oneOf(['active', 'maintenance', 'inactive'], 'Invalid status')
  });
  
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        // Update existing vehicle
        await axios.put(`/api/vehicles/${id}`, values);
        toast.success('Vehicle updated successfully');
      } else {
        // Create new vehicle
        await axios.post('/api/vehicles', values);
        toast.success('Vehicle created successfully');
      }
      
      navigate('/vehicles');
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error(error.response?.data?.message || 'Failed to save vehicle');
    }
    
    setSubmitting(false);
  };
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  // Initial values for the form
  const initialValues = isEditMode && vehicle
    ? {
        carCode: vehicle.carCode,
        plateNumber: vehicle.plateNumber,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        chassisNumber: vehicle.chassisNumber,
        engineNumber: vehicle.engineNumber,
        simNumber: vehicle.simNumber || '',
        ownerName: vehicle.ownerName,
        licenseExpiryDate: new Date(vehicle.licenseExpiryDate),
        insuranceExpiryDate: new Date(vehicle.insuranceExpiryDate),
        lastOilChangeOdometer: vehicle.lastOilChangeOdometer,
        currentOdometer: vehicle.currentOdometer,
        status: vehicle.status
      }
    : {
        carCode: '',
        plateNumber: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        chassisNumber: '',
        engineNumber: '',
        simNumber: '',
        ownerName: '',
        licenseExpiryDate: new Date(new Date().setMonth(new Date().getMonth() + 12)), // Default 1 year from now
        insuranceExpiryDate: new Date(new Date().setMonth(new Date().getMonth() + 12)), // Default 1 year from now
        lastOilChangeOdometer: 0,
        currentOdometer: 0,
        status: 'active'
      };
  
  return (
    <div className="vehicle-form-container">
      <h1 className="page-title">
        {isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}
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
                <div className="form-section">
                  <h3>Basic Information</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="carCode">Car Code</label>
                      <Field
                        type="text"
                        name="carCode"
                        className="form-control"
                        disabled={isEditMode} // Cannot change car code in edit mode
                      />
                      {touched.carCode && errors.carCode && (
                        <div className="text-danger">{errors.carCode}</div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="plateNumber">Plate Number</label>
                      <Field
                        type="text"
                        name="plateNumber"
                        className="form-control"
                        disabled={isEditMode} // Cannot change plate number in edit mode
                      />
                      {touched.plateNumber && errors.plateNumber && (
                        <div className="text-danger">{errors.plateNumber}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="make">Make</label>
                      <Field
                        type="text"
                        name="make"
                        className="form-control"
                      />
                      {touched.make && errors.make && (
                        <div className="text-danger">{errors.make}</div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="model">Model</label>
                      <Field
                        type="text"
                        name="model"
                        className="form-control"
                      />
                      {touched.model && errors.model && (
                        <div className="text-danger">{errors.model}</div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="year">Year</label>
                      <Field
                        type="number"
                        name="year"
                        className="form-control"
                      />
                      {touched.year && errors.year && (
                        <div className="text-danger">{errors.year}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="ownerName">Owner Name</label>
                      <Field
                        type="text"
                        name="ownerName"
                        className="form-control"
                      />
                      {touched.ownerName && errors.ownerName && (
                        <div className="text-danger">{errors.ownerName}</div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="status">Status</label>
                      <Field
                        as="select"
                        name="status"
                        className="form-control"
                      >
                        <option value="active">Active</option>
                        <option value="maintenance">In Maintenance</option>
                        <option value="inactive">Inactive</option>
                      </Field>
                      {touched.status && errors.status && (
                        <div className="text-danger">{errors.status}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h3>Technical Details</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="chassisNumber">Chassis Number</label>
                      <Field
                        type="text"
                        name="chassisNumber"
                        className="form-control"
                      />
                      {touched.chassisNumber && errors.chassisNumber && (
                        <div className="text-danger">{errors.chassisNumber}</div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="engineNumber">Engine Number</label>
                      <Field
                        type="text"
                        name="engineNumber"
                        className="form-control"
                      />
                      {touched.engineNumber && errors.engineNumber && (
                        <div className="text-danger">{errors.engineNumber}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="simNumber">SIM Number (Optional)</label>
                      <Field
                        type="text"
                        name="simNumber"
                        className="form-control"
                      />
                      {touched.simNumber && errors.simNumber && (
                        <div className="text-danger">{errors.simNumber}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="lastOilChangeOdometer">Last Oil Change Odometer (km)</label>
                      <Field
                        type="number"
                        name="lastOilChangeOdometer"
                        className="form-control"
                      />
                      {touched.lastOilChangeOdometer && errors.lastOilChangeOdometer && (
                        <div className="text-danger">{errors.lastOilChangeOdometer}</div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="currentOdometer">Current Odometer (km)</label>
                      <Field
                        type="number"
                        name="currentOdometer"
                        className="form-control"
                      />
                      {touched.currentOdometer && errors.currentOdometer && (
                        <div className="text-danger">{errors.currentOdometer}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h3>License & Insurance</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="licenseExpiryDate">License Expiry Date</label>
                      <DatePicker
                        selected={values.licenseExpiryDate}
                        onChange={(date) => setFieldValue('licenseExpiryDate', date)}
                        dateFormat="yyyy-MM-dd"
                        className="form-control"
                      />
                      {touched.licenseExpiryDate && errors.licenseExpiryDate && (
                        <div className="text-danger">{errors.licenseExpiryDate}</div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="insuranceExpiryDate">Insurance Expiry Date</label>
                      <DatePicker
                        selected={values.insuranceExpiryDate}
                        onChange={(date) => setFieldValue('insuranceExpiryDate', date)}
                        dateFormat="yyyy-MM-dd"
                        className="form-control"
                      />
                      {touched.insuranceExpiryDate && errors.insuranceExpiryDate && (
                        <div className="text-danger">{errors.insuranceExpiryDate}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : isEditMode ? 'Update Vehicle' : 'Add Vehicle'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/vehicles')}
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

export default VehicleForm;
