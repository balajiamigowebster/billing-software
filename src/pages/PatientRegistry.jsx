import React, { useState, useEffect } from 'react';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import FormTextarea from '../components/FormTextarea';

export default function PatientRegistry({ onSaveSuccess, isModal = false, onCancel }) {
  const [patientId, setPatientId] = useState('Loading...');
  const [isLoadingId, setIsLoadingId] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState(null);

  const initialFormState = {
    patientName: '',
    mobileNumber: '',
    age: '',
    gender: '',
    email: '',
    pincode: '',
    city: '',
    address: '',
    doctorName: 'Dr. Arjun Sharma',
    chiefComplaint: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // Fetch the next sequential Patient ID from Express
  const fetchNextPatientId = async () => {
    setIsLoadingId(true);
    try {
      const response = await fetch('/api/patients/next-id');
      const data = await response.json();
      if (data.nextId) {
        setPatientId(data.nextId);
      } else {
        setPatientId('PAT-0001');
      }
    } catch (error) {
      console.error('Error fetching next ID:', error);
      setPatientId('PAT-ERR');
    } finally {
      setIsLoadingId(false);
    }
  };

  useEffect(() => {
    fetchNextPatientId();
  }, []);

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

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSaving || isLoadingId) return;

    if (validate()) {
      setIsSaving(true);
      setApiError(null);
      try {
        const payload = {
          ...formData,
          patientId // Use the state-fetched sequence ID
        };

        const response = await fetch('/api/patients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
          onSaveSuccess(`Patient ${formData.patientName} saved successfully! ID: ${patientId}`);
          setFormData(initialFormState);
          setErrors({});
          fetchNextPatientId(); // Fetch for next use
        } else {
          setApiError(data.error || 'Server error, database save failed.');
        }
      } catch (error) {
        console.error('Network error saving patient:', error);
        setApiError('Network connection failed. Make sure the database backend server is running!');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setErrors({});
    setApiError(null);
    fetchNextPatientId();
  };

  const genderOptions = [
    { value: '', label: 'Select Gender', disabled: true },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: isModal ? '20px' : '24px' }}>
      {apiError && (
        <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'hsl(0, 75%, 95%)', color: 'hsl(0, 75%, 45%)', fontWeight: 600, fontSize: '0.9rem', border: '1px solid hsl(0, 75%, 90%)' }}>
          {apiError}
        </div>
      )}

      {/* Patient Information Card */}
      <div className={isModal ? "" : "card"} style={isModal ? { display: 'flex', flexDirection: 'column', gap: '16px' } : {}}>
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
            disabled={isSaving}
          />
          <FormInput
            label="Mobile Number"
            id="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            placeholder="9876543210"
            error={errors.mobileNumber}
            type="tel"
            disabled={isSaving}
          />
          <FormInput
            label="Age"
            id="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="30"
            error={errors.age}
            type="number"
            disabled={isSaving}
          />
          <FormSelect
            label="Gender"
            id="gender"
            value={formData.gender}
            onChange={handleChange}
            options={genderOptions}
            error={errors.gender}
            disabled={isSaving}
          />
          <FormInput
            label="Email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="patient@gmail.com"
            error={errors.email}
            type="email"
            disabled={isSaving}
          />
          <FormInput
            label="Pincode"
            id="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="600001"
            error={errors.pincode}
            disabled={isSaving}
          />
          <FormInput
            label="City"
            id="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Chennai"
            error={errors.city}
            disabled={isSaving}
          />
          <FormInput
            label="Address"
            id="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            error={errors.address}
            disabled={isSaving}
          />
        </div>
      </div>

      {/* Visit Information Card */}
      <div className={isModal ? "" : "card"} style={isModal ? { display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' } : {}}>
        <div className="card-header">
          <h2 className="card-title">Visit Information</h2>
          <p className="card-subtitle">Visit and doctor details.</p>
        </div>

        <div className="form-grid">
          <FormInput
            label="Patient ID"
            id="patientId"
            value={patientId}
            readOnly
            disabled
          />
          <FormInput
            label="Doctor Name"
            id="doctorName"
            value={formData.doctorName}
            onChange={handleChange}
            placeholder="Dr. Arjun Sharma"
            disabled={isSaving}
          />
          <FormTextarea
            label="Chief Complaint"
            id="chiefComplaint"
            value={formData.chiefComplaint}
            onChange={handleChange}
            placeholder="Tooth pain, swelling, sensitivity..."
            rows={4}
            disabled={isSaving}
          />
        </div>
      </div>

      {/* Action Bar */}
      <div className={isModal ? "invoice-modal-footer" : "action-bar"} style={isModal ? { margin: '0 -24px -24px -24px', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' } : {}}>
        {isModal && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </button>
        )}
        <button type="button" className="btn btn-secondary" onClick={handleReset} disabled={isSaving}>
          Reset
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSaving || isLoadingId}>
          {isSaving ? 'Saving...' : 'Save Patient'}
        </button>
      </div>
    </form>
  );
}
