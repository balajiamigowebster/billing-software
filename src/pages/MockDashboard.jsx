import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import { 
  Users, 
  Calendar, 
  IndianRupee, 
  Activity, 
  Plus, 
  Search,
  FileText,
  Clock,
  Printer,
  X,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';

const TREATMENTS = [
  { id: 'T-101', name: 'Root Canal Therapy', cost: 450 },
  { id: 'T-102', name: 'Teeth Scaling & Polishing', cost: 120 },
  { id: 'T-103', name: 'Dental Veneers / Crowns', cost: 800 },
  { id: 'T-104', name: 'Composite Teeth Filling', cost: 150 },
  { id: 'T-105', name: 'Wisdom Tooth Extraction', cost: 300 }
];

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[monthIdx]} ${day}, ${year}`;
};

export default function MockDashboard({ tab, onNavigate, onPrintInvoice, showToast }) {
  const [patients, setPatients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [nextInvoiceNo, setNextInvoiceNo] = useState('');
  
  // Create Invoice Form State
  const [formPatientId, setFormPatientId] = useState('');
  const [formTreatment, setFormTreatment] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formStatus, setFormStatus] = useState('Paid');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Appointments State
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [selectedDate, setSelectedDate] = useState('2026-06-15');
  const [showBookModal, setShowBookModal] = useState(false);
  
  // Book Appointment Form State
  const [bookPatientId, setBookPatientId] = useState('');
  const [bookTimeSlot, setBookTimeSlot] = useState('09:00 AM');
  const [bookReason, setBookReason] = useState('');
  const [bookError, setBookError] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // Billing Search, Pagination & Edit State
  const [billingSearchTerm, setBillingSearchTerm] = useState('');
  const [billingCurrentPage, setBillingCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  
  // Edit Invoice Form State
  const [editFormTreatment, setEditFormTreatment] = useState('');
  const [editFormAmount, setEditFormAmount] = useState('');
  const [editFormStatus, setEditFormStatus] = useState('Paid');
  const [editFormDate, setEditFormDate] = useState('');
  const [editFormError, setEditFormError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Treatments Database States
  const [treatments, setTreatments] = useState([]);
  const [treatmentsSearchTerm, setTreatmentsSearchTerm] = useState('');
  const [treatmentsCurrentPage, setTreatmentsCurrentPage] = useState(1);
  const [showAddTreatmentModal, setShowAddTreatmentModal] = useState(false);
  const [showEditTreatmentModal, setShowEditTreatmentModal] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(null);

  // Add Treatment Form State
  const [addFormCode, setAddFormCode] = useState('');
  const [addFormName, setAddFormName] = useState('');
  const [addFormCost, setAddFormCost] = useState('');
  const [addFormDuration, setAddFormDuration] = useState('30 mins');
  const [addFormError, setAddFormError] = useState('');
  const [isAddingTreatment, setIsAddingTreatment] = useState(false);

  // Edit Treatment Form State
  const [editFormTreatmentName, setEditFormTreatmentName] = useState('');
  const [editFormTreatmentCost, setEditFormTreatmentCost] = useState('');
  const [editFormTreatmentDuration, setEditFormTreatmentDuration] = useState('');
  const [editFormTreatmentError, setEditFormTreatmentError] = useState('');
  const [isUpdatingTreatment, setIsUpdatingTreatment] = useState(false);

  // Delete Treatment Confirmation States
  const [showDeleteTreatmentModal, setShowDeleteTreatmentModal] = useState(false);
  const [deletingTreatment, setDeletingTreatment] = useState(null);
  const [deleteTreatmentError, setDeleteTreatmentError] = useState('');
  const [isDeletingTreatment, setIsDeletingTreatment] = useState(false);

  // Delete Invoice Confirmation States
  const [showDeleteInvoiceModal, setShowDeleteInvoiceModal] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState(null);
  const [deleteInvoiceError, setDeleteInvoiceError] = useState('');
  const [isDeletingInvoice, setIsDeletingInvoice] = useState(false);

  // Visitor Passes & Categories States
  const [visitorPasses, setVisitorPasses] = useState([]);
  const [visitorCategories, setVisitorCategories] = useState([]);
  const [visitorSearch, setVisitorSearch] = useState('');
  const [selectedVisitorCategory, setSelectedVisitorCategory] = useState('');
  
  // Category management modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState('');
  const [categoryModalError, setCategoryModalError] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Issue Entry Pass Modal
  const [showIssuePassModal, setShowIssuePassModal] = useState(false);
  const [nextPassCode, setNextPassCode] = useState('');
  const [passVisitorName, setPassVisitorName] = useState('');
  const [passMobileNumber, setPassMobileNumber] = useState('');
  const [passCategory, setPassCategory] = useState('Entry Pass');
  const [passAdultsCount, setPassAdultsCount] = useState(1);
  const [passChildrenCount, setPassChildrenCount] = useState(0);
  const [passAmount, setPassAmount] = useState(375);
  const [passCafeCoupon, setPassCafeCoupon] = useState('None');
  const [passStatus, setPassStatus] = useState('Checked In');
  const [passIssuedDate, setPassIssuedDate] = useState(new Date().toISOString().split('T')[0]);
  const [issuePassError, setIssuePassError] = useState('');
  const [isIssuingPass, setIsIssuingPass] = useState(false);

  // Edit Visitor Pass Modal
  const [showEditPassModal, setShowEditPassModal] = useState(false);
  const [editingPass, setEditingPass] = useState(null);
  const [editPassVisitorName, setEditPassVisitorName] = useState('');
  const [editPassMobileNumber, setEditPassMobileNumber] = useState('');
  const [editPassCategory, setEditPassCategory] = useState('');
  const [editPassAdultsCount, setEditPassAdultsCount] = useState(1);
  const [editPassChildrenCount, setEditPassChildrenCount] = useState(0);
  const [editPassAmount, setEditPassAmount] = useState(0);
  const [editPassCafeCoupon, setEditPassCafeCoupon] = useState('None');
  const [editPassStatus, setEditPassStatus] = useState('Checked In');
  const [editPassIssuedDate, setEditPassIssuedDate] = useState('');
  const [editPassError, setEditPassError] = useState('');
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  // Delete Pass Confirmation Modal
  const [showDeletePassModal, setShowDeletePassModal] = useState(false);
  const [deletingPass, setDeletingPass] = useState(null);
  const [deletePassError, setDeletePassError] = useState('');
  const [isDeletingPass, setIsDeletingPass] = useState(false);

  // QR Code / Printable Pass Preview Popup
  const [showPassPrintModal, setShowPassPrintModal] = useState(false);
  const [printingPass, setPrintingPass] = useState(null);

  const fetchTreatments = () => {
    fetch(`${API_BASE}/api/treatments`)
      .then((res) => res.json())
      .then((data) => setTreatments(data))
      .catch((err) => console.error('Error loading treatments:', err));
  };

  const fetchVisitorCategories = () => {
    fetch(`${API_BASE}/api/visitors/categories`)
      .then((res) => res.json())
      .then((data) => setVisitorCategories(data))
      .catch((err) => console.error('Error loading visitor categories:', err));
  };

  const fetchVisitorPasses = () => {
    fetch(`${API_BASE}/api/visitors/passes`)
      .then((res) => res.json())
      .then((data) => setVisitorPasses(data))
      .catch((err) => console.error('Error loading visitor passes:', err));
  };

  const fetchNextPassCode = () => {
    fetch(`${API_BASE}/api/visitors/passes/next-code`)
      .then((res) => res.json())
      .then((data) => setNextPassCode(data.nextCode))
      .catch((err) => console.error('Error loading next pass code:', err));
  };

  const fetchInvoices = () => {
    fetch(`${API_BASE}/api/invoices`)
      .then((res) => res.json())
      .then((data) => setInvoices(data))
      .catch((err) => console.error('Error loading invoices:', err));
  };

  const fetchAppointments = (date) => {
    fetch(`${API_BASE}/api/appointments?date=${date}`)
      .then((res) => res.json())
      .then((data) => setAppointmentsList(data))
      .catch((err) => console.error('Error loading appointments:', err));
  };

  useEffect(() => {
    fetchTreatments();

    if (tab === 'dashboard') {
      fetch(`${API_BASE}/api/patients`)
        .then((res) => res.json())
        .then((data) => setPatients(data))
        .catch((err) => console.error('Error loading dashboard patients:', err));
    } else if (tab === 'billing') {
      fetchInvoices();
    } else if (tab === 'appointments') {
      fetchAppointments(selectedDate);
    } else if (tab === 'visitors') {
      fetchVisitorCategories();
      fetchVisitorPasses();
      fetchNextPassCode();
    }
  }, [tab, selectedDate]);

  const handleOpenCreateModal = async () => {
    setFormPatientId('');
    setFormTreatment('');
    setFormAmount('');
    setFormStatus('Paid');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormError('');
    setShowCreateModal(true);

    try {
      const patientsRes = await fetch(`${API_BASE}/api/patients`);
      const patientsData = await patientsRes.json();
      setPatientsList(patientsData);

      const nextNoRes = await fetch(`${API_BASE}/api/invoices/next-no`);
      const nextNoData = await nextNoRes.json();
      setNextInvoiceNo(nextNoData.nextNo);
    } catch (err) {
      console.error('Error opening create invoice modal:', err);
      setFormError('Failed to load required invoice data.');
    }
  };

  const handleTreatmentChange = (e) => {
    const value = e.target.value;
    setFormTreatment(value);
    const selected = treatments.find(t => t.treatment_name === value);
    if (selected) {
      setFormAmount(selected.cost);
    } else {
      setFormAmount('');
    }
  };

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    if (!formPatientId || !formTreatment || !formAmount || !formStatus || !formDate) {
      setFormError('All fields are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const response = await fetch(`${API_BASE}/api/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNo: nextInvoiceNo,
          patientId: formPatientId,
          treatmentName: formTreatment,
          amount: parseFloat(formAmount),
          status: formStatus,
          invoiceDate: formDate
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save invoice.');
      }

      setShowCreateModal(false);
      fetchInvoices();
      if (showToast) showToast('Invoice created successfully!');
    } catch (err) {
      console.error('Error saving invoice:', err);
      setFormError('Failed to save invoice to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (invoice) => {
    setEditingInvoice(invoice);
    setEditFormTreatment(invoice.treatment_name || '');
    setEditFormAmount(invoice.amount || '');
    setEditFormStatus(invoice.status || 'Paid');
    setEditFormDate(invoice.invoice_date || '');
    setEditFormError('');
    setShowEditModal(true);
  };

  const handleEditTreatmentChange = (e) => {
    const value = e.target.value;
    setEditFormTreatment(value);
    const selected = treatments.find(t => t.treatment_name === value);
    if (selected) {
      setEditFormAmount(selected.cost);
    } else {
      setEditFormAmount('');
    }
  };

  const handleUpdateInvoice = async (e) => {
    e.preventDefault();
    if (!editFormTreatment || editFormAmount === '' || !editFormStatus || !editFormDate) {
      setEditFormError('All fields are required.');
      return;
    }

    setIsUpdating(true);
    setEditFormError('');

    try {
      const response = await fetch(`${API_BASE}/api/invoices/${editingInvoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treatmentName: editFormTreatment,
          amount: parseFloat(editFormAmount),
          status: editFormStatus,
          invoiceDate: editFormDate
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update invoice.');
      }

      setShowEditModal(false);
      fetchInvoices();
      if (showToast) showToast('Invoice updated successfully!');
    } catch (err) {
      console.error('Error updating invoice:', err);
      setEditFormError('Failed to update invoice in database.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenAddTreatmentModal = () => {
    let nextNum = 101;
    if (treatments.length > 0) {
      const nums = treatments
        .map(t => {
          const parts = (t.treatment_code || '').split('-');
          return parts.length === 2 ? parseInt(parts[1], 10) : null;
        })
        .filter(n => n !== null && !isNaN(n));
      if (nums.length > 0) {
        nextNum = Math.max(...nums) + 1;
      }
    }
    setAddFormCode(`T-${nextNum}`);
    setAddFormName('');
    setAddFormCost('');
    setAddFormDuration('30 mins');
    setAddFormError('');
    setShowAddTreatmentModal(true);
  };

  const handleSaveTreatment = async (e) => {
    e.preventDefault();
    if (!addFormName || addFormCost === '' || !addFormDuration) {
      setAddFormError('Name, Cost, and Duration are required.');
      return;
    }
    setIsAddingTreatment(true);
    setAddFormError('');
    try {
      const response = await fetch(`${API_BASE}/api/treatments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treatmentCode: addFormCode || null,
          treatmentName: addFormName,
          cost: parseFloat(addFormCost),
          duration: addFormDuration
        })
      });
      if (!response.ok) {
        throw new Error('Failed to save treatment.');
      }
      setShowAddTreatmentModal(false);
      fetchTreatments();
      if (showToast) showToast('Treatment added successfully!');
    } catch (err) {
      console.error('Error saving treatment:', err);
      setAddFormError('Failed to save treatment to database.');
    } finally {
      setIsAddingTreatment(false);
    }
  };

  const handleOpenEditTreatmentModal = (treatment) => {
    setEditingTreatment(treatment);
    setEditFormTreatmentName(treatment.treatment_name || '');
    setEditFormTreatmentCost(treatment.cost || '');
    setEditFormTreatmentDuration(treatment.duration || '30 mins');
    setEditFormTreatmentError('');
    setShowEditTreatmentModal(true);
  };

  const handleUpdateTreatment = async (e) => {
    e.preventDefault();
    if (!editFormTreatmentName || editFormTreatmentCost === '' || !editFormTreatmentDuration) {
      setEditFormTreatmentError('Name, Cost, and Duration are required.');
      return;
    }
    setIsUpdatingTreatment(true);
    setEditFormTreatmentError('');
    try {
      const response = await fetch(`${API_BASE}/api/treatments/${editingTreatment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treatmentName: editFormTreatmentName,
          cost: parseFloat(editFormTreatmentCost),
          duration: editFormTreatmentDuration
        })
      });
      if (!response.ok) {
        throw new Error('Failed to update treatment.');
      }
      setShowEditTreatmentModal(false);
      fetchTreatments();
      if (showToast) showToast('Treatment updated successfully!');
    } catch (err) {
      console.error('Error updating treatment:', err);
      setEditFormTreatmentError('Failed to update treatment in database.');
    } finally {
      setIsUpdatingTreatment(false);
    }
  };

  const handleOpenDeleteTreatmentModal = (treatment) => {
    setDeletingTreatment(treatment);
    setDeleteTreatmentError('');
    setShowDeleteTreatmentModal(true);
  };

  const handleConfirmDeleteTreatment = async () => {
    if (!deletingTreatment) return;
    setIsDeletingTreatment(true);
    setDeleteTreatmentError('');
    try {
      const response = await fetch(`${API_BASE}/api/treatments/${deletingTreatment.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete treatment.');
      }
      setShowDeleteTreatmentModal(false);
      setDeletingTreatment(null);
      fetchTreatments();
      if (showToast) showToast('Treatment deleted successfully!');
    } catch (err) {
      console.error('Error deleting treatment:', err);
      setDeleteTreatmentError('Failed to delete treatment from database.');
    } finally {
      setIsDeletingTreatment(false);
    }
  };

  const handleOpenDeleteInvoiceModal = (invoice) => {
    setDeletingInvoice(invoice);
    setDeleteInvoiceError('');
    setShowDeleteInvoiceModal(true);
  };

  const handleConfirmDeleteInvoice = async () => {
    if (!deletingInvoice) return;
    setIsDeletingInvoice(true);
    setDeleteInvoiceError('');

    try {
      const response = await fetch(`${API_BASE}/api/invoices/${deletingInvoice.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete invoice.');
      }

      setShowDeleteInvoiceModal(false);
      fetchInvoices();
      if (showToast) {
        showToast(`Invoice ${deletingInvoice.invoice_no} deleted successfully!`);
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      setDeleteInvoiceError('Failed to delete invoice from database.');
    } finally {
      setIsDeletingInvoice(false);
    }
  };

  // --- Visitor Categories Handlers ---
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsSavingCategory(true);
    setCategoryModalError('');
    try {
      const res = await fetch(`${API_BASE}/api/visitors/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryName: newCategoryName, defaultAmount: newCategoryAmount })
      });
      if (!res.ok) throw new Error('Failed to save category');
      setNewCategoryName('');
      setNewCategoryAmount('');
      fetchVisitorCategories();
      if (showToast) showToast('Visitor category added successfully!');
    } catch (err) {
      console.error(err);
      setCategoryModalError('Failed to save category.');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/visitors/categories/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete category');
      fetchVisitorCategories();
      if (showToast) showToast('Visitor category deleted successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to delete category.');
    }
  };

  // --- Visitor Passes Handlers ---
  const handleOpenIssuePassModal = () => {
    setPassVisitorName('');
    setPassMobileNumber('');
    setPassCategory('Entry Pass');
    setPassAdultsCount(1);
    setPassChildrenCount(0);
    setPassAmount(375);
    setPassCafeCoupon('None');
    setPassStatus('Checked In');
    setPassIssuedDate(new Date().toISOString().split('T')[0]);
    setIssuePassError('');
    setShowIssuePassModal(true);
    fetchNextPassCode();
  };

  const handleConfirmIssuePass = async (e) => {
    e.preventDefault();
    if (!passVisitorName.trim() || !passMobileNumber.trim()) {
      setIssuePassError('Please fill out all fields.');
      return;
    }
    setIsIssuingPass(true);
    setIssuePassError('');
    try {
      const res = await fetch(`${API_BASE}/api/visitors/passes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorName: passVisitorName,
          mobileNumber: passMobileNumber,
          categoryName: passCategory,
          adultsCount: passAdultsCount,
          childrenCount: passChildrenCount,
          passAmount: passAmount,
          cafeCoupon: passCafeCoupon,
          status: passStatus,
          issuedDate: passIssuedDate
        })
      });
      if (!res.ok) throw new Error('Failed to issue pass');
      setShowIssuePassModal(false);
      fetchVisitorPasses();
      if (showToast) showToast('Visitor pass issued successfully!');
    } catch (err) {
      console.error(err);
      setIssuePassError('Failed to issue entry pass.');
    } finally {
      setIsIssuingPass(false);
    }
  };

  const handleOpenEditPassModal = (pass) => {
    setEditingPass(pass);
    setEditPassVisitorName(pass.visitor_name);
    setEditPassMobileNumber(pass.mobile_number);
    setEditPassCategory(pass.category_name);
    setEditPassAdultsCount(pass.adults_count);
    setEditPassChildrenCount(pass.children_count);
    setEditPassAmount(pass.pass_amount);
    setEditPassCafeCoupon(pass.cafe_coupon);
    setEditPassStatus(pass.status);
    setEditPassIssuedDate(pass.issued_date.substring(0, 10));
    setEditPassError('');
    setShowEditPassModal(true);
  };

  const handleConfirmEditPass = async (e) => {
    e.preventDefault();
    if (!editPassVisitorName.trim() || !editPassMobileNumber.trim()) {
      setEditPassError('Please fill out all fields.');
      return;
    }
    setIsUpdatingPass(true);
    setEditPassError('');
    try {
      const res = await fetch(`${API_BASE}/api/visitors/passes/${editingPass.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorName: editPassVisitorName,
          mobileNumber: editPassMobileNumber,
          categoryName: editPassCategory,
          adultsCount: editPassAdultsCount,
          childrenCount: editPassChildrenCount,
          passAmount: editPassAmount,
          cafeCoupon: editPassCafeCoupon,
          status: editPassStatus,
          issuedDate: editPassIssuedDate
        })
      });
      if (!res.ok) throw new Error('Failed to update pass');
      setShowEditPassModal(false);
      fetchVisitorPasses();
      if (showToast) showToast('Visitor pass updated successfully!');
    } catch (err) {
      console.error(err);
      setEditPassError('Failed to update visitor pass.');
    } finally {
      setIsUpdatingPass(false);
    }
  };

  const handleTogglePassStatus = async (pass) => {
    const nextStatus = pass.status === 'Checked In' ? 'Checked Out' : 'Checked In';
    try {
      const res = await fetch(`${API_BASE}/api/visitors/passes/${pass.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchVisitorPasses();
      if (showToast) showToast(`Visitor successfully ${nextStatus === 'Checked In' ? 'Checked In' : 'Checked Out'}!`);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to update visitor status.');
    }
  };

  const handleOpenDeletePassModal = (pass) => {
    setDeletingPass(pass);
    setDeletePassError('');
    setShowDeletePassModal(true);
  };

  const handleConfirmDeletePass = async () => {
    if (!deletingPass) return;
    setIsDeletingPass(true);
    setDeletePassError('');
    try {
      const res = await fetch(`${API_BASE}/api/visitors/passes/${deletingPass.id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete pass');
      setShowDeletePassModal(false);
      fetchVisitorPasses();
      if (showToast) showToast('Visitor pass deleted successfully!');
    } catch (err) {
      console.error(err);
      setDeletePassError('Failed to delete visitor pass.');
    } finally {
      setIsDeletingPass(false);
    }
  };

  const handleOpenBookModal = async () => {
    setBookPatientId('');
    setBookTimeSlot('09:00 AM');
    setBookReason('');
    setBookError('');
    setShowBookModal(true);

    try {
      const patientsRes = await fetch(`${API_BASE}/api/patients`);
      const patientsData = await patientsRes.json();
      setPatientsList(patientsData);
    } catch (err) {
      console.error('Error loading patients list for booking:', err);
      setBookError('Failed to load registered patient records.');
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!bookPatientId || !bookReason || !bookTimeSlot || !selectedDate) {
      setBookError('All fields are required.');
      return;
    }

    setIsBooking(true);
    setBookError('');

    try {
      const response = await fetch(`${API_BASE}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: bookPatientId,
          appointmentDate: selectedDate,
          appointmentTime: bookTimeSlot,
          reason: bookReason,
          doctorName: 'Dr.Arun , MDS'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save appointment.');
      }

      setShowBookModal(false);
      fetchAppointments(selectedDate);
      if (showToast) showToast('Appointment scheduled successfully!');
    } catch (err) {
      console.error('Error booking appointment:', err);
      setBookError('Failed to save appointment to database.');
    } finally {
      setIsBooking(false);
    }
  };

  // Render Dashboard View
  if (tab === 'dashboard') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Metric Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div className="card" style={{ padding: '20px', gap: '16px', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Patients</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '2px' }}>{patients.length}</h3>
            </div>
          </div>
          <div className="card" style={{ padding: '20px', gap: '16px', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'hsl(142, 70%, 95%)', color: 'hsl(142, 70%, 40%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Appointments Today</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '2px' }}>8</h3>
            </div>
          </div>
          <div className="card" style={{ padding: '20px', gap: '16px', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'hsl(36, 100%, 95%)', color: 'hsl(36, 100%, 45%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Today's Revenue</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '2px' }}>₹1,240</h3>
            </div>
          </div>
          <div className="card" style={{ padding: '20px', gap: '16px', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'hsl(325, 75%, 95%)', color: 'hsl(325, 75%, 45%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Treatments Active</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '2px' }}>14</h3>
            </div>
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="dashboard-grid">
          {/* Recent Patients */}
          <div className="card" style={{ gap: '16px' }}>
            <div className="card-header-flex">
              <div>
                <h3 className="card-title">Recent Patients</h3>
                <p className="card-subtitle">List of newly registered clinic patients.</p>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => onNavigate('patient-registry')}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <Plus size={16} /> Add Patient
              </button>
            </div>

            {patients.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <Users size={40} style={{ opacity: 0.3 }} />
                <p>No patients registered yet.</p>
              </div>
            ) : (
              <div className="table-responsive-container" style={{ border: 'none' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <th style={{ padding: '12px 8px', fontWeight: 600 }}>ID</th>
                      <th style={{ padding: '12px 8px', fontWeight: 600 }}>Name</th>
                      <th style={{ padding: '12px 8px', fontWeight: 600 }}>Mobile</th>
                      <th style={{ padding: '12px 8px', fontWeight: 600 }}>City</th>
                      <th style={{ padding: '12px 8px', fontWeight: 600 }}>Chief Complaint</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.slice(0, 5).map((patient, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--primary)' }}>{patient.patient_id_seq}</td>
                        <td style={{ padding: '12px 8px', fontWeight: 500 }}>{patient.patient_name}</td>
                        <td style={{ padding: '12px 8px' }}>{patient.mobile_number}</td>
                        <td style={{ padding: '12px 8px' }}>{patient.city || '—'}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {patient.chief_complaint || 'No complaints recorded'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Today's Queue */}
          <div className="card" style={{ gap: '16px' }}>
            <h3 className="card-title">Doctor's Schedule</h3>
            <p className="card-subtitle">Upcoming appointments for Dr.Arun , MDS.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-input)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'var(--primary)', color: 'white', padding: '4px 8px', borderRadius: '6px' }}>09:30 AM</div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Amit Patel</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Teeth Cleaning</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-input)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'var(--primary)', color: 'white', padding: '4px 8px', borderRadius: '6px' }}>11:00 AM</div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Sara Khan</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Root Canal Checkup</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-input)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'var(--primary)', color: 'white', padding: '4px 8px', borderRadius: '6px' }}>02:15 PM</div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>John Doe</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Filling Placement</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Appointments View
  if (tab === 'appointments') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', flexDirection: 'row' }}>
            <div>
              <h2 className="card-title">Appointments</h2>
              <p className="card-subtitle">Manage patient visit slots and schedules.</p>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={handleOpenBookModal}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <Plus size={16} /> Book Appointment
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Calendar simulation */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
              <h4 style={{ marginBottom: '16px', fontWeight: 600 }}>June 2026</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontSize: '0.85rem' }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{d}</div>
                ))}
                {Array.from({ length: 30 }, (_, i) => {
                  const day = i + 1;
                  const dayStr = `2026-06-${String(day).padStart(2, '0')}`;
                  const isSelected = selectedDate === dayStr;
                  return (
                    <div 
                      key={day} 
                      onClick={() => setSelectedDate(dayStr)}
                      style={{ 
                        padding: '8px', 
                        borderRadius: '8px', 
                        backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                        color: isSelected ? 'white' : 'var(--text-primary)',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                      className={!isSelected ? "table-row-hover" : ""}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontWeight: 600 }}>Active Appointments: {formatDate(selectedDate)}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {appointmentsList.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '10px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={32} style={{ opacity: 0.3 }} />
                    <p style={{ fontSize: '0.9rem' }}>No appointments scheduled for this date.</p>
                  </div>
                ) : (
                  appointmentsList.map((app) => (
                    <div key={app.id} style={{ border: '1px solid var(--border-color)', padding: '14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h5 style={{ fontWeight: 600, fontSize: '0.9rem' }}>{app.patient_name}</h5>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reason: {app.reason}</p>
                      </div>
                      <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '20px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}>
                        {app.appointment_time}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Book Appointment Modal Overlay */}
        {showBookModal && (
          <div className="modal-backdrop" onClick={() => setShowBookModal(false)}>
            <div className="invoice-modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
              <div className="invoice-modal-header">
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem' }}>Book New Appointment</h3>
                <button 
                  onClick={() => setShowBookModal(false)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleBookAppointment}>
                <div className="invoice-modal-body" style={{ gap: '16px' }}>
                  {bookError && (
                    <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'hsl(0, 75%, 95%)', color: 'hsl(0, 75%, 45%)', fontSize: '0.85rem', fontWeight: 500 }}>
                      {bookError}
                    </div>
                  )}

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Select Patient</label>
                    <div className="select-wrapper">
                      <select 
                        className="form-select" 
                        value={bookPatientId} 
                        onChange={(e) => setBookPatientId(e.target.value)}
                        required
                      >
                        <option value="">Choose Patient...</option>
                        {patientsList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.patient_name} ({p.patient_id_seq})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Appointment Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={selectedDate} 
                      onChange={(e) => setSelectedDate(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Time Slot</label>
                    <div className="select-wrapper">
                      <select 
                        className="form-select" 
                        value={bookTimeSlot} 
                        onChange={(e) => setBookTimeSlot(e.target.value)}
                        required
                      >
                        {['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'].map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Reason for Visit</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g., Routine Checkup, Tooth Pain"
                      value={bookReason} 
                      onChange={(e) => setBookReason(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div className="invoice-modal-footer">
                  <button type="button" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setShowBookModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} disabled={isBooking}>
                    {isBooking ? 'Booking...' : 'Confirm Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Treatments View
  if (tab === 'treatments') {
    const filteredTreatments = treatments.filter((t) => {
      const term = treatmentsSearchTerm.toLowerCase();
      return (
        (t.treatment_code || '').toLowerCase().includes(term) ||
        (t.treatment_name || '').toLowerCase().includes(term) ||
        (t.cost || '').toString().includes(term) ||
        (t.duration || '').toLowerCase().includes(term)
      );
    });

    const itemsPerPage = 8;
    const totalPages = Math.ceil(filteredTreatments.length / itemsPerPage);
    const startIndex = (treatmentsCurrentPage - 1) * itemsPerPage;
    const paginatedTreatments = filteredTreatments.slice(startIndex, startIndex + itemsPerPage);
    const totalEntries = filteredTreatments.length;
    const displayStart = totalEntries === 0 ? 0 : startIndex + 1;
    const displayEnd = Math.min(startIndex + itemsPerPage, totalEntries);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card">
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">Treatments & Services</h2>
              <p className="card-subtitle">Manage service list, pricing, and treatment duration.</p>
            </div>
            <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="search-input-wrapper" style={{ position: 'relative', minWidth: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search treatments..." 
                  value={treatmentsSearchTerm}
                  onChange={(e) => {
                    setTreatmentsSearchTerm(e.target.value);
                    setTreatmentsCurrentPage(1);
                  }}
                  style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
                />
              </div>
              <button 
                className="btn btn-primary" 
                onClick={handleOpenAddTreatmentModal}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem', height: '38px' }}
              >
                <Plus size={16} /> Add Treatment
              </button>
            </div>
          </div>

          <div className="table-responsive-container" style={{ border: 'none' }}>
            {filteredTreatments.length === 0 ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <Activity size={40} style={{ opacity: 0.3 }} />
                <p>No treatments found.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Code</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Treatment Name</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Cost</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Duration</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTreatments.map((tr) => (
                    <tr key={tr.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--primary)' }}>{tr.treatment_code}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 500 }}>{tr.treatment_name}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 600 }}>₹{parseFloat(tr.cost).toFixed(2)}</td>
                      <td style={{ padding: '12px 8px' }}>{tr.duration}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleOpenEditTreatmentModal(tr)}
                          >
                            <Pencil size={12} /> Edit
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'hsl(0, 75%, 45%)' }}
                            onClick={() => handleOpenDeleteTreatmentModal(tr)}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Showing {displayStart} to {displayEnd} of {totalEntries} entries
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setTreatmentsCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={treatmentsCurrentPage === 1}
                  style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setTreatmentsCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={treatmentsCurrentPage === totalPages}
                  style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Treatment Modal Overlay */}
        {showAddTreatmentModal && (
          <div className="modal-backdrop" onClick={() => setShowAddTreatmentModal(false)}>
            <div className="invoice-modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
              <div className="invoice-modal-header">
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem' }}>Add New Treatment</h3>
                <button 
                  onClick={() => setShowAddTreatmentModal(false)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveTreatment}>
                <div className="invoice-modal-body" style={{ gap: '16px' }}>
                  {addFormError && (
                    <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'hsl(0, 75%, 95%)', color: 'hsl(0, 75%, 45%)', fontSize: '0.85rem', fontWeight: 500 }}>
                      {addFormError}
                    </div>
                  )}

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Treatment Code</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={addFormCode} 
                      readOnly
                      disabled
                    />
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Treatment Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Teeth Whitening"
                      value={addFormName} 
                      onChange={(e) => setAddFormName(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Cost (₹)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="form-input" 
                      placeholder="0.00"
                      value={addFormCost} 
                      onChange={(e) => setAddFormCost(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Duration</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 30 mins"
                      value={addFormDuration} 
                      onChange={(e) => setAddFormDuration(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div className="invoice-modal-footer">
                  <button type="button" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setShowAddTreatmentModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} disabled={isAddingTreatment}>
                    {isAddingTreatment ? 'Saving...' : 'Add Treatment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Treatment Modal Overlay */}
        {showEditTreatmentModal && editingTreatment && (
          <div className="modal-backdrop" onClick={() => setShowEditTreatmentModal(false)}>
            <div className="invoice-modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
              <div className="invoice-modal-header">
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem' }}>Edit Treatment - {editingTreatment.treatment_code}</h3>
                <button 
                  onClick={() => setShowEditTreatmentModal(false)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdateTreatment}>
                <div className="invoice-modal-body" style={{ gap: '16px' }}>
                  {editFormTreatmentError && (
                    <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'hsl(0, 75%, 95%)', color: 'hsl(0, 75%, 45%)', fontSize: '0.85rem', fontWeight: 500 }}>
                      {editFormTreatmentError}
                    </div>
                  )}

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Treatment Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editFormTreatmentName} 
                      onChange={(e) => setEditFormTreatmentName(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Cost (₹)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="form-input" 
                      value={editFormTreatmentCost} 
                      onChange={(e) => setEditFormTreatmentCost(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Duration</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editFormTreatmentDuration} 
                      onChange={(e) => setEditFormTreatmentDuration(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div className="invoice-modal-footer">
                  <button type="button" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setShowEditTreatmentModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} disabled={isUpdatingTreatment}>
                    {isUpdatingTreatment ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Treatment Confirmation Modal Overlay */}
        {showDeleteTreatmentModal && deletingTreatment && (
          <div className="modal-backdrop" onClick={() => setShowDeleteTreatmentModal(false)}>
            <div className="invoice-modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
              <div className="invoice-modal-header" style={{ borderBottom: 'none', padding: '24px 24px 8px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'hsl(0, 100%, 96%)',
                    color: 'hsl(0, 84%, 60%)'
                  }}>
                    <Trash2 size={20} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Delete Treatment?</h3>
                </div>
                <button 
                  onClick={() => setShowDeleteTreatmentModal(false)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="invoice-modal-body" style={{ gap: '12px', padding: '8px 24px 24px 24px', overflowY: 'visible' }}>
                {deleteTreatmentError && (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'hsl(0, 75%, 95%)', color: 'hsl(0, 75%, 45%)', fontSize: '0.85rem', fontWeight: 500 }}>
                    {deleteTreatmentError}
                  </div>
                )}
                <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                  Are you sure you want to delete the treatment <strong style={{ color: 'var(--text-primary)' }}>{deletingTreatment.treatment_name}</strong> (<span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{deletingTreatment.treatment_code}</span>)? This action cannot be undone.
                </p>
              </div>

              <div className="invoice-modal-footer" style={{ borderTop: 'none', padding: '16px 24px 24px 24px', backgroundColor: 'transparent' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }} 
                  onClick={() => setShowDeleteTreatmentModal(false)}
                  disabled={isDeletingTreatment}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }} 
                  onClick={handleConfirmDeleteTreatment}
                  disabled={isDeletingTreatment}
                >
                  {isDeletingTreatment ? 'Deleting...' : 'Delete Treatment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Billing View
  if (tab === 'billing') {
    const filteredInvoices = invoices.filter((inv) => {
      const term = billingSearchTerm.toLowerCase();
      return (
        (inv.invoice_no || '').toLowerCase().includes(term) ||
        (inv.patient_name || '').toLowerCase().includes(term) ||
        (inv.treatment_name || '').toLowerCase().includes(term) ||
        (inv.status || '').toLowerCase().includes(term)
      );
    });

    const itemsPerPage = 8;
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const startIndex = (billingCurrentPage - 1) * itemsPerPage;
    const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);
    const totalEntries = filteredInvoices.length;
    const displayStart = totalEntries === 0 ? 0 : startIndex + 1;
    const displayEnd = Math.min(startIndex + itemsPerPage, totalEntries);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card">
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">Billing & Invoices</h2>
              <p className="card-subtitle">Manage billing accounts, pending balances, and printed invoices.</p>
            </div>
            <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="search-input-wrapper" style={{ position: 'relative', minWidth: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search invoices..." 
                  value={billingSearchTerm}
                  onChange={(e) => {
                    setBillingSearchTerm(e.target.value);
                    setBillingCurrentPage(1);
                  }}
                  style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
                />
              </div>
              <button 
                className="btn btn-primary" 
                onClick={handleOpenCreateModal}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem', height: '38px' }}
              >
                <Plus size={16} /> Create Invoice
              </button>
            </div>
          </div>

          <div className="table-responsive-container" style={{ border: 'none' }}>
            {filteredInvoices.length === 0 ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <FileText size={40} style={{ opacity: 0.3 }} />
                <p>No invoices found.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Invoice No</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Patient</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Total Amount</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedInvoices.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 600 }}>{inv.invoice_no}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 500 }}>{inv.patient_name}</td>
                      <td style={{ padding: '12px 8px' }}>{formatDate(inv.invoice_date)}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 600 }}>₹{parseFloat(inv.amount).toFixed(2)}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span 
                          style={{ 
                            backgroundColor: inv.status === 'Paid' ? 'hsl(142, 70%, 95%)' : 'hsl(36, 100%, 95%)', 
                            color: inv.status === 'Paid' ? 'hsl(142, 70%, 40%)' : 'hsl(36, 100%, 45%)', 
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontSize: '0.75rem', 
                            fontWeight: 600 
                          }}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleOpenEditModal(inv)}
                          >
                            <Pencil size={12} /> Edit
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => onPrintInvoice && onPrintInvoice({
                              invoiceNo: inv.invoice_no,
                              patient: inv.patient_name,
                              patientId: inv.patient_id_seq,
                              date: formatDate(inv.invoice_date),
                              amount: `₹${parseFloat(inv.amount).toFixed(2)}`,
                              status: inv.status,
                              description: inv.treatment_name,
                              doctor: 'Dr.Arun , MDS',
                              age: inv.age,
                              gender: inv.gender
                            })}
                          >
                            <Printer size={12} /> Print
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleOpenDeleteInvoiceModal(inv)}
                          >
                            <Trash2 size={12} style={{ color: 'hsl(0, 84%, 60%)' }} /> <span style={{ color: 'hsl(0, 84%, 60%)' }}>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Showing {displayStart} to {displayEnd} of {totalEntries} entries
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setBillingCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={billingCurrentPage === 1}
                  style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setBillingCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={billingCurrentPage === totalPages}
                  style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create Invoice Modal Overlay */}
        {showCreateModal && (
          <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
            <div className="invoice-modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
              <div className="invoice-modal-header">
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem' }}>Create New Invoice</h3>
                <button 
                  onClick={() => setShowCreateModal(false)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveInvoice}>
                <div className="invoice-modal-body" style={{ gap: '16px' }}>
                  {formError && (
                    <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'hsl(0, 75%, 95%)', color: 'hsl(0, 75%, 45%)', fontSize: '0.85rem', fontWeight: 500 }}>
                      {formError}
                    </div>
                  )}

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Invoice Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={nextInvoiceNo} 
                      readOnly 
                      disabled 
                    />
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Select Patient</label>
                    <div className="select-wrapper">
                      <select 
                        className="form-select" 
                        value={formPatientId} 
                        onChange={(e) => setFormPatientId(e.target.value)}
                        required
                      >
                        <option value="">Choose Patient...</option>
                        {patientsList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.patient_name} ({p.patient_id_seq})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Treatment / Service</label>
                    <div className="select-wrapper">
                      <select 
                        className="form-select" 
                        value={formTreatment} 
                        onChange={handleTreatmentChange}
                        required
                      >
                        <option value="">Choose Treatment...</option>
                        {treatments.map((t) => (
                          <option key={t.id} value={t.treatment_name}>
                            {t.treatment_name} (₹{parseFloat(t.cost).toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Amount (₹)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="form-input" 
                      placeholder="0.00"
                      value={formAmount} 
                      onChange={(e) => setFormAmount(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Payment Status</label>
                    <div className="select-wrapper">
                      <select 
                        className="form-select" 
                        value={formStatus} 
                        onChange={(e) => setFormStatus(e.target.value)}
                        required
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Invoice Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={formDate} 
                      onChange={(e) => setFormDate(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div className="invoice-modal-footer">
                  <button type="button" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Invoice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Invoice Modal Overlay */}
        {showEditModal && editingInvoice && (
          <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
            <div className="invoice-modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
              <div className="invoice-modal-header">
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem' }}>Edit Invoice - {editingInvoice.invoice_no}</h3>
                <button 
                  onClick={() => setShowEditModal(false)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdateInvoice}>
                <div className="invoice-modal-body" style={{ gap: '16px' }}>
                  {editFormError && (
                    <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'hsl(0, 75%, 95%)', color: 'hsl(0, 75%, 45%)', fontSize: '0.85rem', fontWeight: 500 }}>
                      {editFormError}
                    </div>
                  )}

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Patient</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={`${editingInvoice.patient_name} (${editingInvoice.patient_id_seq})`} 
                      disabled 
                      readOnly
                    />
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Treatment / Service</label>
                    <div className="select-wrapper">
                      <select 
                        className="form-select" 
                        value={editFormTreatment} 
                        onChange={handleEditTreatmentChange}
                        required
                      >
                        <option value="">Choose Treatment...</option>
                        {treatments.map((t) => (
                          <option key={t.id} value={t.treatment_name}>
                            {t.treatment_name} (₹{parseFloat(t.cost).toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Amount (₹)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="form-input" 
                      placeholder="0.00"
                      value={editFormAmount} 
                      onChange={(e) => setEditFormAmount(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Payment Status</label>
                    <div className="select-wrapper">
                      <select 
                        className="form-select" 
                        value={editFormStatus} 
                        onChange={(e) => setEditFormStatus(e.target.value)}
                        required
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Invoice Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={editFormDate} 
                      onChange={(e) => setEditFormDate(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div className="invoice-modal-footer">
                  <button type="button" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} disabled={isUpdating}>
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Invoice Confirmation Modal Overlay */}
        {showDeleteInvoiceModal && deletingInvoice && (
          <div className="modal-backdrop" onClick={() => setShowDeleteInvoiceModal(false)}>
            <div className="invoice-modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
              <div className="invoice-modal-header" style={{ borderBottom: 'none', padding: '24px 24px 8px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'hsl(0, 100%, 96%)',
                    color: 'hsl(0, 84%, 60%)'
                  }}>
                    <Trash2 size={20} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Delete Invoice?</h3>
                </div>
                <button 
                  onClick={() => setShowDeleteInvoiceModal(false)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="invoice-modal-body" style={{ gap: '12px', padding: '8px 24px 24px 24px', overflowY: 'visible' }}>
                {deleteInvoiceError && (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'hsl(0, 75%, 95%)', color: 'hsl(0, 75%, 45%)', fontSize: '0.85rem', fontWeight: 500 }}>
                    {deleteInvoiceError}
                  </div>
                )}
                <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                  Are you sure you want to delete invoice <strong style={{ color: 'var(--text-primary)' }}>{deletingInvoice.invoice_no}</strong> for patient <strong style={{ color: 'var(--text-primary)' }}>{deletingInvoice.patient_name}</strong>? This action cannot be undone.
                </p>
              </div>

              <div className="invoice-modal-footer" style={{ borderTop: 'none', padding: '16px 24px 24px 24px', backgroundColor: 'transparent' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }} 
                  onClick={() => setShowDeleteInvoiceModal(false)}
                  disabled={isDeletingInvoice}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }} 
                  onClick={handleConfirmDeleteInvoice}
                  disabled={isDeletingInvoice}
                >
                  {isDeletingInvoice ? 'Deleting...' : 'Delete Invoice'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (tab === 'visitors') {
    const filteredPasses = visitorPasses.filter((pass) => {
      const matchesSearch = 
        pass.visitor_name.toLowerCase().includes(visitorSearch.toLowerCase()) ||
        pass.mobile_number.includes(visitorSearch) ||
        pass.pass_code.toLowerCase().includes(visitorSearch.toLowerCase()) ||
        pass.category_name.toLowerCase().includes(visitorSearch.toLowerCase());
      
      const matchesCategory = !selectedVisitorCategory || pass.category_name === selectedVisitorCategory;

      return matchesSearch && matchesCategory;
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const todayPasses = visitorPasses.filter(p => p.issued_date.substring(0,10) === todayStr);
    const todayRevenue = todayPasses.reduce((acc, p) => acc + parseFloat(p.pass_amount || 0), 0);
    const insideToday = visitorPasses
      .filter(p => p.status === 'Checked In')
      .reduce((acc, p) => acc + parseInt(p.adults_count || 0) + parseInt(p.children_count || 0), 0);

    const totalIssuedToday = todayPasses.length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Header Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '20px' }}
            onClick={() => onNavigate('dashboard')}
          >
            ← Back to Dashboard
          </button>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(142, 70%, 35%)', textTransform: 'uppercase', backgroundColor: 'hsl(142, 70%, 95%)', padding: '4px 12px', borderRadius: '12px' }}>
            MODULE: VISITORS
          </span>
        </div>

        {/* Top metrics row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {/* Revenue */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0' }}>ENTRY PASS REVENUE TODAY</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>₹{todayRevenue.toLocaleString('en-IN')}</h3>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'hsl(142, 70%, 95%)', color: 'hsl(142, 70%, 40%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
              ₹
            </div>
          </div>

          {/* Pax inside */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0' }}>VISITORS INSIDE TODAY</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{insideToday} Pax In-Site</h3>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'hsl(266, 70%, 95%)', color: 'hsl(266, 70%, 60%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} />
            </div>
          </div>

          {/* Issued count */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0' }}>ENTRY PASSES ISSUED</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{totalIssuedToday} Issued</h3>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'hsl(200, 70%, 95%)', color: 'hsl(200, 70%, 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ticket size={24} />
            </div>
          </div>
        </div>

        {/* Heading Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Entry Pass 🎫
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Issue entry passes, customize & delete pass categories, edit pricing, and track visitor metrics
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '10px 18px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setShowCategoryModal(true)}
            >
              Manage Categories
            </button>
            <button 
              className="btn btn-primary" 
              style={{ padding: '10px 18px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'hsl(142, 70%, 35%)', borderColor: 'hsl(142, 70%, 35%)' }}
              onClick={handleOpenIssuePassModal}
            >
              + Issue Entry Pass
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search entry passes by name, phone, category..." 
              className="form-input" 
              style={{ paddingLeft: '44px', width: '100%' }}
              value={visitorSearch}
              onChange={(e) => setVisitorSearch(e.target.value)}
            />
          </div>
          <select 
            className="form-select" 
            style={{ width: '220px', minWidth: '200px' }}
            value={selectedVisitorCategory}
            onChange={(e) => setSelectedVisitorCategory(e.target.value)}
          >
            <option value="">All Entry Pass Categories</option>
            {visitorCategories.map(cat => (
              <option key={cat.id} value={cat.category_name}>{cat.category_name}</option>
            ))}
          </select>
        </div>

        {/* Table List */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {filteredPasses.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              No entry passes found matching criteria.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)' }}>
                    <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Pass ID / Category</th>
                    <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Visitor Details</th>
                    <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Head Count</th>
                    <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Pass Amount</th>
                    <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Cafe Coupon</th>
                    <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPasses.map((pass) => (
                    <tr key={pass.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{pass.category_name}</div>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)', marginTop: '2px' }}>{pass.pass_code}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Issued: {pass.issued_date.substring(0, 10)}</div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{pass.visitor_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{pass.mobile_number}</div>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 600 }}>
                        {pass.adults_count} Adult{pass.adults_count > 1 ? 's' : ''}, {pass.children_count} Child{pass.children_count > 1 ? 'ren' : ''}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: 'hsl(142, 70%, 40%)' }}>
                        ₹{parseFloat(pass.pass_amount).toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                        {pass.cafe_coupon}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <button
                          style={{
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: pass.status === 'Checked In' ? 'hsl(142, 70%, 95%)' : 'hsl(0, 80%, 96%)',
                            color: pass.status === 'Checked In' ? 'hsl(142, 70%, 35%)' : 'hsl(0, 80%, 45%)',
                            padding: '6px 12px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onClick={() => handleTogglePassStatus(pass)}
                          title="Click to toggle check-in status"
                        >
                          ● {pass.status}
                        </button>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleOpenEditPassModal(pass)}
                          >
                            <Pencil size={12} /> Edit
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => {
                              setPrintingPass(pass);
                              setShowPassPrintModal(true);
                            }}
                          >
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <rect width="14" height="14" x="5" y="5" rx="2" />
                              <rect width="4" height="4" x="9" y="9" />
                              <path d="M9 15h1M15 9h1M15 15h1" />
                            </svg> Pass
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'hsl(0, 84%, 60%)' }}
                            onClick={() => handleOpenDeletePassModal(pass)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- MODALS --- */}

        {/* 1. Manage Categories Modal */}
        {showCategoryModal && (
          <div className="modal-backdrop" onClick={() => setShowCategoryModal(false)}>
            <div className="invoice-modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
              <div className="invoice-modal-header">
                <h3 style={{ fontWeight: 800 }}>Manage Entry Pass Categories</h3>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setShowCategoryModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="invoice-modal-body" style={{ gap: '16px', maxHeight: '70vh' }}>
                {categoryModalError && (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'hsl(0, 75%, 95%)', color: 'hsl(0, 75%, 45%)', fontSize: '0.85rem' }}>
                    {categoryModalError}
                  </div>
                )}
                
                <form onSubmit={handleSaveCategory} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                  <div style={{ flex: 2, minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Category Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Guest Pass" 
                      className="form-input"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '100px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Default Amount (₹)</label>
                    <input 
                      type="number" 
                      placeholder="375" 
                      className="form-input"
                      value={newCategoryAmount}
                      onChange={(e) => setNewCategoryAmount(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }} disabled={isSavingCategory}>
                    Add
                  </button>
                </form>

                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0 0 12px 0' }}>Existing Categories</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {visitorCategories.map(cat => (
                      <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-input)' }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem' }}>{cat.category_name}</strong>
                          <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Default: ₹{parseFloat(cat.default_amount).toFixed(2)}</span>
                        </div>
                        {cat.id > 4 && (
                          <button 
                            style={{ border: 'none', background: 'none', color: 'hsl(0, 84%, 60%)', cursor: 'pointer' }}
                            onClick={() => handleDeleteCategory(cat.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="invoice-modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCategoryModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Issue Entry Pass Modal */}
        {showIssuePassModal && (
          <div className="modal-backdrop" onClick={() => setShowIssuePassModal(false)}>
            <div className="invoice-modal" style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
              <div className="invoice-modal-header">
                <h3 style={{ fontWeight: 800 }}>Issue New Entry Pass</h3>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setShowIssuePassModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleConfirmIssuePass}>
                <div className="invoice-modal-body" style={{ gap: '16px' }}>
                  {issuePassError && (
                    <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'hsl(0, 75%, 95%)', color: 'hsl(0, 75%, 45%)', fontSize: '0.85rem' }}>
                      {issuePassError}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="form-label">Pass Code</label>
                      <input type="text" className="form-input" value={nextPassCode} disabled style={{ backgroundColor: 'var(--bg-input)', fontFamily: 'monospace', fontWeight: 600 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="form-label">Category</label>
                      <select 
                        className="form-select"
                        value={passCategory}
                        onChange={(e) => {
                          const catName = e.target.value;
                          setPassCategory(catName);
                          const matchingCat = visitorCategories.find(c => c.category_name === catName);
                          if (matchingCat) setPassAmount(parseFloat(matchingCat.default_amount));
                        }}
                      >
                        {visitorCategories.map(cat => (
                          <option key={cat.id} value={cat.category_name}>{cat.category_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="form-label">Visitor Name</label>
                      <input 
                        type="text" 
                        placeholder="Rakesh Juneja" 
                        className="form-input"
                        value={passVisitorName}
                        onChange={(e) => setPassVisitorName(e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="form-label">Mobile Number</label>
                      <input 
                        type="tel" 
                        placeholder="9898989898" 
                        className="form-input"
                        value={passMobileNumber}
                        onChange={(e) => setPassMobileNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '120px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="form-label">Adults Count</label>
                      <input 
                        type="number" 
                        className="form-input"
                        min="1"
                        value={passAdultsCount}
                        onChange={(e) => setPassAdultsCount(parseInt(e.target.value, 10))}
                        required
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: '120px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="form-label">Children Count</label>
                      <input 
                        type="number" 
                        className="form-input"
                        min="0"
                        value={passChildrenCount}
                        onChange={(e) => setPassChildrenCount(parseInt(e.target.value, 10))}
                        required
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: '120px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="form-label">Amount (₹)</label>
                      <input 
                        type="number" 
                        className="form-input"
                        value={passAmount}
                        onChange={(e) => setPassAmount(parseFloat(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="form-label">Cafe Coupon</label>
                      <select className="form-select" value={passCafeCoupon} onChange={(e) => setPassCafeCoupon(e.target.value)}>
                        <option value="None">None</option>
                        <option value="₹50 Discount">₹50 Discount Coupon</option>
                        <option value="Free Tea/Coffee">Free Tea/Coffee Coupon</option>
                      </select>
                    </div>
                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="form-label">Issued Date</label>
                      <input type="date" className="form-input" value={passIssuedDate} onChange={(e) => setPassIssuedDate(e.target.value)} required />
                    </div>
                  </div>
                </div>
                <div className="invoice-modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowIssuePassModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'hsl(142, 70%, 35%)', borderColor: 'hsl(142, 70%, 35%)' }} disabled={isIssuingPass}>
                    {isIssuingPass ? 'Issuing...' : 'Issue Pass'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. Edit Entry Pass Modal */}
        {showEditPassModal && editingPass && (
          <div className="modal-backdrop" onClick={() => setShowEditPassModal(false)}>
            <div className="invoice-modal" style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
              <div className="invoice-modal-header">
                <h3 style={{ fontWeight: 800 }}>Edit Entry Pass Details</h3>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setShowEditPassModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleConfirmEditPass}>
                <div className="invoice-modal-body" style={{ gap: '16px' }}>
                  {editPassError && (
                    <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'hsl(0, 75%, 95%)', color: 'hsl(0, 75%, 45%)', fontSize: '0.85rem' }}>
                      {editPassError}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="form-label">Pass Code</label>
                      <input type="text" className="form-input" value={editingPass.pass_code} disabled style={{ backgroundColor: 'var(--bg-input)', fontFamily: 'monospace', fontWeight: 600 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="form-label">Category</label>
                      <select 
                        className="form-select"
                        value={editPassCategory}
                        onChange={(e) => {
                          const catName = e.target.value;
                          setEditPassCategory(catName);
                          const matchingCat = visitorCategories.find(c => c.category_name === catName);
                          if (matchingCat) setEditPassAmount(parseFloat(matchingCat.default_amount));
                        }}
                      >
                        {visitorCategories.map(cat => (
                          <option key={cat.id} value={cat.category_name}>{cat.category_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="form-label">Visitor Name</label>
                      <input 
                        type="text" 
                        className="form-input"
                        value={editPassVisitorName}
                        onChange={(e) => setEditPassVisitorName(e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="form-label">Mobile Number</label>
                      <input 
                        type="tel" 
                        className="form-input"
                        value={editPassMobileNumber}
                        onChange={(e) => setEditPassMobileNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '120px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="form-label">Adults Count</label>
                      <input 
                        type="number" 
                        className="form-input"
                        min="1"
                        value={editPassAdultsCount}
                        onChange={(e) => setEditPassAdultsCount(parseInt(e.target.value, 10))}
                        required
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: '120px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="form-label">Children Count</label>
                      <input 
                        type="number" 
                        className="form-input"
                        min="0"
                        value={editPassChildrenCount}
                        onChange={(e) => setEditPassChildrenCount(parseInt(e.target.value, 10))}
                        required
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: '120px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="form-label">Amount (₹)</label>
                      <input 
                        type="number" 
                        className="form-input"
                        value={editPassAmount}
                        onChange={(e) => setEditPassAmount(parseFloat(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="form-label">Cafe Coupon</label>
                      <select className="form-select" value={editPassCafeCoupon} onChange={(e) => setEditPassCafeCoupon(e.target.value)}>
                        <option value="None">None</option>
                        <option value="₹50 Discount">₹50 Discount Coupon</option>
                        <option value="Free Tea/Coffee">Free Tea/Coffee Coupon</option>
                      </select>
                    </div>
                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="form-label">Issued Date</label>
                      <input type="date" className="form-input" value={editPassIssuedDate} onChange={(e) => setEditPassIssuedDate(e.target.value)} required />
                    </div>
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label">Status</label>
                    <select className="form-select" value={editPassStatus} onChange={(e) => setEditPassStatus(e.target.value)}>
                      <option value="Checked In">Checked In</option>
                      <option value="Checked Out">Checked Out</option>
                    </select>
                  </div>
                </div>
                <div className="invoice-modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditPassModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isUpdatingPass}>
                    {isUpdatingPass ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 4. Delete Pass Confirmation Modal */}
        {showDeletePassModal && deletingPass && (
          <div className="modal-backdrop" onClick={() => setShowDeletePassModal(false)}>
            <div className="invoice-modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
              <div className="invoice-modal-header" style={{ borderBottom: 'none', padding: '24px 24px 8px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'hsl(0, 100%, 96%)',
                    color: 'hsl(0, 84%, 60%)'
                  }}>
                    <Trash2 size={20} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Delete Pass?</h3>
                </div>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setShowDeletePassModal(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="invoice-modal-body" style={{ gap: '12px', padding: '8px 24px 24px 24px' }}>
                {deletePassError && (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'hsl(0, 75%, 95%)', color: 'hsl(0, 75%, 45%)', fontSize: '0.85rem' }}>
                    {deletePassError}
                  </div>
                )}
                <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                  Are you sure you want to delete visitor pass <strong style={{ color: 'var(--text-primary)' }}>{deletingPass.pass_code}</strong> for <strong style={{ color: 'var(--text-primary)' }}>{deletingPass.visitor_name}</strong>? This action cannot be undone.
                </p>
              </div>

              <div className="invoice-modal-footer" style={{ borderTop: 'none', padding: '16px 24px 24px 24px', backgroundColor: 'transparent' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeletePassModal(false)} disabled={isDeletingPass}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={handleConfirmDeletePass} disabled={isDeletingPass}>
                  {isDeletingPass ? 'Deleting...' : 'Delete Pass'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. Pass Printable Pass Preview popup */}
        {showPassPrintModal && printingPass && (
          <div className="modal-backdrop" onClick={() => setShowPassPrintModal(false)}>
            <div className="invoice-modal" style={{ maxWidth: '400px', padding: '20px' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Ticket size={20} color="var(--primary)" />
                  <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Ranga's Entry Pass</span>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setShowPassPrintModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ border: '2px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', background: 'var(--bg-input)' }}>
                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-secondary)' }}>{printingPass.category_name.toUpperCase()}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '1px' }}>{printingPass.pass_code}</div>
                
                <div style={{ width: '130px', height: '130px', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${printingPass.pass_code}%7C${printingPass.visitor_name}%7C${printingPass.mobile_number}`}
                    alt="QR Code"
                    style={{ width: '120px', height: '120px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                <div style={{ width: '100%', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Visitor:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{printingPass.visitor_name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Mobile:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{printingPass.mobile_number}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Head Count:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{printingPass.adults_count} A, {printingPass.children_count} C</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Paid Amount:</span>
                    <strong style={{ color: 'hsl(142, 70%, 40%)' }}>₹{parseFloat(printingPass.pass_amount).toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Cafe Coupon:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{printingPass.cafe_coupon}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Issued:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{printingPass.issued_date.substring(0, 10)}</strong>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowPassPrintModal(false)}>Close</button>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, backgroundColor: 'hsl(142, 70%, 35%)', borderColor: 'hsl(142, 70%, 35%)' }}
                  onClick={() => window.print()}
                >
                  Print Pass
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // Render Prescriptions & Reports Default Fallback
  return (
    <div className="card" style={{ alignItems: 'center', padding: '60px 20px', gap: '16px' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifycontent: 'center', justifyContent: 'center' }}>
        <FileText size={32} />
      </div>
      <h2 style={{ textTransform: 'capitalize', fontSize: '1.4rem', fontWeight: 600 }}>{tab} Panel</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', textAlign: 'center', fontSize: '0.9rem' }}>
        This module is fully integrated with your core database. Real-time patient information updates will propagate here automatically.
      </p>
    </div>
  );
}
