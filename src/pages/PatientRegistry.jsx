import React, { useState, useEffect } from 'react';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import FormTextarea from '../components/FormTextarea';

export default function PatientRegistry({ onSaveSuccess }) {
  // Load saved patients to calculate the next sequential Patient ID
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('patients');
    return saved ? JSON.parse(saved) : [];
  });

  const getNextPatientId = (list) => {
    const nextNum = list.length + 1;
    return `PAT-${String(nextNum).padStart(4, '0')}`;
  };

  const initialFormState = {
    patientName: '',
    mobileNumber: '',
    age: '',
    gender: '',
    email: '',
    pincode: '',
    city: '',
    address: '',
    patientId: getNextPatientId(patients),
    doctorName: 'Dr. Arjun',
    chiefComplaint: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // Re-generate ID if patients list changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      patientId: getNextPatientId(patients)
    }));
  }, [patients]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error for this field
    if (errors[id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient Name is required';
    }
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile Number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber.trim())) {
      newErrors.mobileNumber = 'Enter a valid 10-digit mobile number';
    }
    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || Number(formData.age) <= 0) {
      newErrors.age = 'Enter a valid age';
    }
    if (!formData.gender) {
      newErrors.gender = 'Please select a gender';
    }
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }
    if (formData.pincode.trim() && !/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Enter a valid 6-digit pincode';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (validate()) {
      const updatedPatients = [...patients, formData];
      setPatients(updatedPatients);
      localStorage.setItem('patients', JSON.stringify(updatedPatients));
      
      onSaveSuccess(`Patient ${formData.patientName} registered successfully! ID: ${formData.patientId}`);
      
      // Reset form but with the updated sequential patient ID
      setFormData({
        ...initialFormState,
        patientId: getNextPatientId(updatedPatients)
      });
      setErrors({});
    }
  };

  const handleReset = () => {
    setFormData({
      ...initialFormState,
      patientId: getNextPatientId(patients)
    });
    setErrors({});
  };

  const genderOptions = [
    { value: '', label: 'Select Gender', disabled: true },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Patient Information Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Patient Information</h2>
          <p className="card-subtitle">Basic patient details.</p>
        </div>

        <div className="form-grid">
          <FormInput
            label="Patient Name"
            id="patientName"
            value={formData.patientName}
            onChange={handleChange}
            placeholder="Arjun Kumar"
            error={errors.patientName}
          />
          <FormInput
            label="Mobile Number"
            id="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            placeholder="9876543210"
            error={errors.mobileNumber}
            type="tel"
          />
          <FormInput
            label="Age"
            id="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="30"
            error={errors.age}
            type="number"
          />
          <FormSelect
            label="Gender"
            id="gender"
            value={formData.gender}
            onChange={handleChange}
            options={genderOptions}
            error={errors.gender}
          />
          <FormInput
            label="Email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="patient@gmail.com"
            error={errors.email}
            type="email"
          />
          <FormInput
            label="Pincode"
            id="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="600001"
            error={errors.pincode}
          />
          <FormInput
            label="City"
            id="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Chennai"
            error={errors.city}
          />
          <FormInput
            label="Address"
            id="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            error={errors.address}
          />
        </div>
      </div>

      {/* Visit Information Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Visit Information</h2>
          <p className="card-subtitle">Visit and doctor details.</p>
        </div>

        <div className="form-grid">
          <FormInput
            label="Patient ID"
            id="patientId"
            value={formData.patientId}
            readOnly
            disabled
          />
          <FormInput
            label="Doctor Name"
            id="doctorName"
            value={formData.doctorName}
            onChange={handleChange}
            placeholder="Dr. Arjun"
          />
          <FormTextarea
            label="Chief Complaint"
            id="chiefComplaint"
            value={formData.chiefComplaint}
            onChange={handleChange}
            placeholder="Tooth pain, swelling, sensitivity..."
            rows={4}
          />
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <button type="button" className="btn btn-secondary" onClick={handleReset}>
          Reset
        </button>
        <button type="submit" className="btn btn-primary">
          Save Patient
        </button>
      </div>
    </form>
  );
}
