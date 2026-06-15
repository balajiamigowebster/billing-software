import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, getPool } from './db.js';
import { sendWhatsAppNotification } from './whatsapp.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// 1. GET: Fetch all patients with their latest visit complaint and doctor
app.get('/api/patients', async (req, res) => {
  try {
    const pool = getPool();
    // Query joins patients with their latest visit details and doctor names
    const query = `
      SELECT p.*, v.chief_complaint, d.doctor_name
      FROM patients p
      LEFT JOIN (
        SELECT v1.patient_id, v1.chief_complaint, v1.doctor_id
        FROM visits v1
        INNER JOIN (
          SELECT patient_id, MAX(id) as max_visit_id
          FROM visits
          GROUP BY patient_id
        ) v2 ON v1.id = v2.max_visit_id
      ) v ON p.id = v.patient_id
      LEFT JOIN doctors d ON v.doctor_id = d.id
      ORDER BY p.id DESC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients database records' });
  }
});

// 2. GET: Calculate the next sequential Patient ID based on max ID
app.get('/api/patients/next-id', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT MAX(id) as maxId FROM patients');
    const nextNum = (rows[0].maxId || 0) + 1;
    const nextId = `PAT-${String(nextNum).padStart(4, '0')}`;
    res.json({ nextId });
  } catch (error) {
    console.error('Error calculating next patient ID:', error);
    res.status(500).json({ error: 'Failed to generate patient sequence ID' });
  }
});

// 3. POST: Create a new patient and record their initial visit complaint in a SQL Transaction
app.post('/api/patients', async (req, res) => {
  const {
    patientName,
    mobileNumber,
    age,
    gender,
    email,
    pincode,
    city,
    address,
    patientId,
    doctorName,
    chiefComplaint
  } = req.body;

  // Simple validation
  if (!patientName || !mobileNumber || !age || !gender || !patientId) {
    return res.status(400).json({ error: 'Missing mandatory patient fields' });
  }

  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    // Start SQL Transaction
    await connection.beginTransaction();

    // 1. Insert patient profile
    const insertPatientQuery = `
      INSERT INTO patients (patient_id_seq, patient_name, mobile_number, age, gender, email, pincode, city, address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [patientResult] = await connection.query(insertPatientQuery, [
      patientId,
      patientName,
      mobileNumber,
      parseInt(age),
      gender,
      email || null,
      pincode || null,
      city || null,
      address || null
    ]);

    const patientTableId = patientResult.insertId;

    // 2. Resolve Doctor ID (default to Dr. Arjun Sharma if not found)
    const [doctorRows] = await connection.query(
      'SELECT id FROM doctors WHERE doctor_name LIKE ? OR email = ? LIMIT 1',
      [`%${doctorName}%`, 'arjun.sharma@dentalerp.com']
    );

    let doctorTableId = 1; // Fallback default
    if (doctorRows.length > 0) {
      doctorTableId = doctorRows[0].id;
    }

    // 3. Insert Visit/Complaint Record
    const insertVisitQuery = `
      INSERT INTO visits (patient_id, doctor_id, chief_complaint)
      VALUES (?, ?, ?)
    `;
    await connection.query(insertVisitQuery, [
      patientTableId,
      doctorTableId,
      chiefComplaint || 'Consultation'
    ]);

    // Commit SQL Transaction
    await connection.commit();
    res.status(201).json({ success: true, message: 'Patient and visit registered successfully!' });

  } catch (error) {
    // Rollback SQL Transaction on Failure
    await connection.rollback();
    console.error('Transaction failed, rolled back:', error);
    res.status(500).json({ error: 'Database transaction failed' });
  } finally {
    connection.release();
  }
});

// 4. GET: Fetch all invoices joined with patient name and sequence ID
app.get('/api/invoices', async (req, res) => {
  try {
    const pool = getPool();
    const query = `
      SELECT i.id, i.invoice_no, i.treatment_name, i.amount, i.status, 
             DATE_FORMAT(i.invoice_date, '%Y-%m-%d') as invoice_date,
             p.patient_name, p.patient_id_seq, p.id AS patient_table_id
      FROM invoices i
      JOIN patients p ON i.patient_id = p.id
      ORDER BY i.id DESC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// 5. GET: Generate next sequential invoice number based on current year
app.get('/api/invoices/next-no', async (req, res) => {
  try {
    const pool = getPool();
    const currentYear = new Date().getFullYear();
    const prefix = `INV-${currentYear}-`;
    const [rows] = await pool.query(
      'SELECT invoice_no FROM invoices WHERE invoice_no LIKE ? ORDER BY id DESC LIMIT 1',
      [`${prefix}%`]
    );
    let nextNum = 1;
    if (rows.length > 0) {
      const lastNo = rows[0].invoice_no;
      const parts = lastNo.split('-');
      const lastNumStr = parts[parts.length - 1];
      nextNum = parseInt(lastNumStr, 10) + 1;
    }
    const nextNo = `${prefix}${String(nextNum).padStart(3, '0')}`;
    res.json({ nextNo });
  } catch (error) {
    console.error('Error generating next invoice number:', error);
    res.status(500).json({ error: 'Failed to generate next invoice number' });
  }
});

// 6. POST: Create a new invoice
app.post('/api/invoices', async (req, res) => {
  const { patientId, treatmentName, amount, status, invoiceDate, invoiceNo } = req.body;
  if (!patientId || !treatmentName || amount === undefined || !status || !invoiceDate) {
    return res.status(400).json({ error: 'Missing mandatory invoice fields' });
  }
  try {
    const pool = getPool();
    
    // Resolve next invoice number if not provided
    let finalInvoiceNo = invoiceNo;
    if (!finalInvoiceNo) {
      const currentYear = new Date().getFullYear();
      const prefix = `INV-${currentYear}-`;
      const [rows] = await pool.query(
        'SELECT invoice_no FROM invoices WHERE invoice_no LIKE ? ORDER BY id DESC LIMIT 1',
        [`${prefix}%`]
      );
      let nextNum = 1;
      if (rows.length > 0) {
        const lastNo = rows[0].invoice_no;
        const parts = lastNo.split('-');
        const lastNumStr = parts[parts.length - 1];
        nextNum = parseInt(lastNumStr, 10) + 1;
      }
      finalInvoiceNo = `${prefix}${String(nextNum).padStart(3, '0')}`;
    }

    const query = `
      INSERT INTO invoices (invoice_no, patient_id, treatment_name, amount, status, invoice_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await pool.query(query, [
      finalInvoiceNo,
      parseInt(patientId, 10),
      treatmentName,
      parseFloat(amount),
      status,
      invoiceDate
    ]);
    res.status(201).json({ success: true, message: 'Invoice created successfully!' });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// 7. GET: Fetch all appointments for a specific date
app.get('/api/appointments', async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Missing date parameter' });
  }
  try {
    const pool = getPool();
    const query = `
      SELECT a.id, a.appointment_time, a.reason, DATE_FORMAT(a.appointment_date, '%Y-%m-%d') as appointment_date,
             p.patient_name, p.patient_id_seq, p.id AS patient_table_id,
             d.doctor_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.appointment_date = ?
      ORDER BY STR_TO_DATE(a.appointment_time, '%r') ASC, a.id ASC
    `;
    const [rows] = await pool.query(query, [date]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// 8. POST: Create/Book a new appointment
app.post('/api/appointments', async (req, res) => {
  const { patientId, appointmentDate, appointmentTime, reason, doctorName } = req.body;
  if (!patientId || !appointmentDate || !appointmentTime || !reason) {
    return res.status(400).json({ error: 'Missing mandatory appointment fields' });
  }
  try {
    const pool = getPool();

    // Resolve Doctor ID (default to Dr. Arjun Sharma if not found)
    const [doctorRows] = await pool.query(
      'SELECT id FROM doctors WHERE doctor_name LIKE ? OR email = ? LIMIT 1',
      [`%${doctorName}%`, 'arjun.sharma@dentalerp.com']
    );

    let doctorTableId = 1; // Fallback default
    if (doctorRows.length > 0) {
      doctorTableId = doctorRows[0].id;
    }

    const query = `
      INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason)
      VALUES (?, ?, ?, ?, ?)
    `;
    await pool.query(query, [
      parseInt(patientId, 10),
      doctorTableId,
      appointmentDate,
      appointmentTime,
      reason
    ]);

    // Retrieve patient name and mobile number to trigger WhatsApp alert
    const [[patientRows]] = await pool.query(
      'SELECT patient_name, mobile_number FROM patients WHERE id = ?',
      [parseInt(patientId, 10)]
    );

    let whatsappResult = null;
    if (patientRows) {
      whatsappResult = await sendWhatsAppNotification(
        patientRows.patient_name,
        patientRows.mobile_number,
        appointmentDate,
        appointmentTime,
        reason
      );
    }

    res.status(201).json({ 
      success: true, 
      message: 'Appointment booked successfully!',
      whatsapp: whatsappResult 
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// Boot Server after DB self-setup completes
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running in development mode on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server due to database error:', error);
    process.exit(1);
  }
}

export default app;

if (process.env.VERCEL !== '1') {
  startServer();
} else {
  initializeDatabase().catch((err) => {
    console.error('Failed to initialize database on Vercel boot:', err);
  });
}
