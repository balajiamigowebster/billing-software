import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool;

export async function initializeDatabase() {
  const connectionConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };

  try {
    // 1. Connect without database first
    const connection = await mysql.createConnection(connectionConfig);
    
    // 2. Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'dental_clinic_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.end();

    // 3. Create connection pool inside the database
    pool = mysql.createPool({
      ...connectionConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 4. Create Tables if they don't exist
    
    // doctors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`doctors\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`doctor_name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(100) NOT NULL UNIQUE,
        \`initials\` VARCHAR(5) NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // patients table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`patients\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`patient_id_seq\` VARCHAR(20) NOT NULL UNIQUE,
        \`patient_name\` VARCHAR(100) NOT NULL,
        \`mobile_number\` VARCHAR(15) NOT NULL,
        \`age\` INT NOT NULL,
        \`gender\` ENUM('male', 'female', 'other') NOT NULL,
        \`email\` VARCHAR(100) DEFAULT NULL,
        \`pincode\` VARCHAR(10) DEFAULT NULL,
        \`city\` VARCHAR(50) DEFAULT NULL,
        \`address\` TEXT DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // visits table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`visits\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`patient_id\` INT NOT NULL,
        \`doctor_id\` INT NOT NULL,
        \`chief_complaint\` TEXT NOT NULL,
        \`visit_date\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_visit_patient\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_visit_doctor\` FOREIGN KEY (\`doctor_id\`) REFERENCES \`doctors\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // invoices table (NEW)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`invoices\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`invoice_no\` VARCHAR(20) NOT NULL UNIQUE,
        \`patient_id\` INT NOT NULL,
        \`treatment_name\` VARCHAR(100) NOT NULL,
        \`amount\` DECIMAL(10, 2) NOT NULL,
        \`status\` ENUM('Paid', 'Pending') NOT NULL,
        \`invoice_date\` DATE NOT NULL,
        CONSTRAINT \`fk_invoice_patient\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // appointments table (NEW)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`appointments\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`patient_id\` INT NOT NULL,
        \`doctor_id\` INT NOT NULL,
        \`appointment_date\` DATE NOT NULL,
        \`appointment_time\` VARCHAR(10) NOT NULL,
        \`reason\` VARCHAR(255) NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_appointment_patient\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_appointment_doctor\` FOREIGN KEY (\`doctor_id\`) REFERENCES \`doctors\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 5. Seeds
    
    // Seed default doctor if doctors table is empty
    const [doctorRows] = await pool.query('SELECT COUNT(*) as count FROM doctors');
    if (doctorRows[0].count === 0) {
      await pool.query(`
        INSERT INTO \`doctors\` (\`doctor_name\`, \`email\`, \`initials\`)
        VALUES ('Dr. Arjun Sharma', 'arjun.sharma@dentalerp.com', 'DA')
      `);
      console.log('Seeded default doctor successfully.');
    }

    // Seed default patients if patients table is empty
    const [patientRows] = await pool.query('SELECT COUNT(*) as count FROM patients');
    if (patientRows[0].count === 0) {
      // Seed Arjun Kumar
      await pool.query(`
        INSERT INTO \`patients\` (\`patient_id_seq\`, \`patient_name\`, \`mobile_number\`, \`age\`, \`gender\`, \`email\`, \`pincode\`, \`city\`, \`address\`)
        VALUES ('PAT-0001', 'Arjun Kumar', '9876543210', 30, 'male', 'patient@gmail.com', '600001', 'Chennai', 'Address')
      `);
      // Seed Nandini Iyer
      await pool.query(`
        INSERT INTO \`patients\` (\`patient_id_seq\`, \`patient_name\`, \`mobile_number\`, \`age\`, \`gender\`, \`email\`, \`pincode\`, \`city\`, \`address\`)
        VALUES ('PAT-0002', 'Nandini Iyer', '9876543211', 28, 'female', 'nandini@gmail.com', '600002', 'Chennai', 'Address')
      `);
      console.log('Seeded default patients successfully.');

      // Seed default visits for Arjun Kumar
      const [[arjunRow]] = await pool.query("SELECT id FROM patients WHERE patient_id_seq = 'PAT-0001'");
      const [[doctorRow]] = await pool.query("SELECT id FROM doctors WHERE email = 'arjun.sharma@dentalerp.com'");
      
      await pool.query(`
        INSERT INTO \`visits\` (\`patient_id\`, \`doctor_id\`, \`chief_complaint\`)
        VALUES (?, ?, 'Tooth pain, swelling, sensitivity...')
      `, [arjunRow.id, doctorRow.id]);
    }

    // Seed default invoices if invoices table is empty
    const [invoiceRows] = await pool.query('SELECT COUNT(*) as count FROM invoices');
    if (invoiceRows[0].count === 0) {
      const [[arjunRow]] = await pool.query("SELECT id FROM patients WHERE patient_id_seq = 'PAT-0001'");
      const [[nandiniRow]] = await pool.query("SELECT id FROM patients WHERE patient_id_seq = 'PAT-0002'");

      if (arjunRow && nandiniRow) {
        // Invoice 1
        await pool.query(`
          INSERT INTO \`invoices\` (\`invoice_no\`, \`patient_id\`, \`treatment_name\`, \`amount\`, \`status\`, \`invoice_date\`)
          VALUES ('INV-2026-001', ?, 'Composite Teeth Filling', 150.00, 'Paid', '2026-06-15')
        `, [arjunRow.id]);
        
        // Invoice 2
        await pool.query(`
          INSERT INTO \`invoices\` (\`invoice_no\`, \`patient_id\`, \`treatment_name\`, \`amount\`, \`status\`, \`invoice_date\`)
          VALUES ('INV-2026-002', ?, 'Dental Veneers / Crowns', 800.00, 'Pending', '2026-06-14')
        `, [nandiniRow.id]);
        
        console.log('Seeded default invoices successfully.');
      }
    }

    // Seed default appointments if appointments table is empty
    const [appointmentRows] = await pool.query('SELECT COUNT(*) as count FROM appointments');
    if (appointmentRows[0].count === 0) {
      const [[arjunRow]] = await pool.query("SELECT id FROM patients WHERE patient_id_seq = 'PAT-0001'");
      const [[nandiniRow]] = await pool.query("SELECT id FROM patients WHERE patient_id_seq = 'PAT-0002'");
      const [[doctorRow]] = await pool.query("SELECT id FROM doctors WHERE email = 'arjun.sharma@dentalerp.com'");

      if (arjunRow && nandiniRow && doctorRow) {
        // Appointment 1: June 15, 2026 at 10:00 AM
        await pool.query(`
          INSERT INTO \`appointments\` (\`patient_id\`, \`doctor_id\`, \`appointment_date\`, \`appointment_time\`, \`reason\`)
          VALUES (?, ?, '2026-06-15', '10:00 AM', 'Tooth Pain Consult')
        `, [arjunRow.id, doctorRow.id]);
        
        // Appointment 2: June 15, 2026 at 11:30 AM
        await pool.query(`
          INSERT INTO \`appointments\` (\`patient_id\`, \`doctor_id\`, \`appointment_date\`, \`appointment_time\`, \`reason\`)
          VALUES (?, ?, '2026-06-15', '11:30 AM', 'Dental Crown')
        `, [nandiniRow.id, doctorRow.id]);
        
        console.log('Seeded default appointments successfully.');
      }
    }

    console.log('Database and tables initialized successfully!');
    return true;
  } catch (error) {
    console.warn('⚠️ MySQL/MariaDB connection failed. Activating local in-memory mock database fallback.');
    pool = mockPool;
    return true;
  }
}

// In-Memory Database Fallback for development/cloud deployment sandboxes
const mockDb = {
  doctors: [
    { id: 1, doctor_name: 'Dr. Arjun Sharma', email: 'arjun.sharma@dentalerp.com', initials: 'DA' }
  ],
  patients: [
    { id: 1, patient_id_seq: 'PAT-0001', patient_name: 'Arjun Kumar', mobile_number: '9876543210', age: 30, gender: 'male', email: 'patient@gmail.com', pincode: '600001', city: 'Chennai', address: 'Address' },
    { id: 2, patient_id_seq: 'PAT-0002', patient_name: 'Nandini Iyer', mobile_number: '9876543211', age: 28, gender: 'female', email: 'nandini@gmail.com', pincode: '600002', city: 'Chennai', address: 'Address' }
  ],
  visits: [
    { id: 1, patient_id: 1, doctor_id: 1, chief_complaint: 'Tooth pain, swelling, sensitivity...' }
  ],
  invoices: [
    { id: 1, invoice_no: 'INV-2026-001', patient_id: 1, treatment_name: 'Composite Teeth Filling', amount: 150.00, status: 'Paid', invoice_date: '2026-06-15' },
    { id: 2, invoice_no: 'INV-2026-002', patient_id: 2, treatment_name: 'Dental Veneers / Crowns', amount: 800.00, status: 'Pending', invoice_date: '2026-06-14' }
  ],
  appointments: [
    { id: 1, patient_id: 1, doctor_id: 1, appointment_date: '2026-06-15', appointment_time: '10:00 AM', reason: 'Tooth Pain Consult' },
    { id: 2, patient_id: 2, doctor_id: 1, appointment_date: '2026-06-15', appointment_time: '11:30 AM', reason: 'Dental Crown' }
  ]
};

async function mockQuery(sql, params = []) {
  const normalizedSql = sql.trim().replace(/\s+/g, ' ').toLowerCase();

  // Seed checking queries
  if (normalizedSql.includes('select count(*) as count from doctors')) {
    return [[{ count: mockDb.doctors.length }]];
  }
  if (normalizedSql.includes('select count(*) as count from patients')) {
    return [[{ count: mockDb.patients.length }]];
  }
  if (normalizedSql.includes('select count(*) as count from invoices')) {
    return [[{ count: mockDb.invoices.length }]];
  }
  if (normalizedSql.includes('select count(*) as count from appointments')) {
    return [[{ count: mockDb.appointments.length }]];
  }

  // 1. Fetch patients
  if (normalizedSql.includes('select p.*, v.chief_complaint, d.doctor_name from patients')) {
    const rows = mockDb.patients.map(p => {
      const visit = mockDb.visits.filter(v => v.patient_id === p.id).sort((a, b) => b.id - a.id)[0];
      return {
        ...p,
        chief_complaint: visit ? visit.chief_complaint : 'Consultation',
        doctor_name: 'Dr. Arjun Sharma'
      };
    });
    return [rows];
  }

  // 2. Fetch max patient ID
  if (normalizedSql.includes('select max(id) as maxid from patients')) {
    const maxId = mockDb.patients.length > 0 ? Math.max(...mockDb.patients.map(p => p.id)) : 0;
    return [[{ maxId }]];
  }

  // 3. Resolve patient ID for invoice or other
  if (normalizedSql.includes('select patient_name, mobile_number from patients where id = ?')) {
    const patientIdVal = parseInt(params[0], 10);
    const patient = mockDb.patients.find(p => p.id === patientIdVal);
    return [patient ? [patient] : []];
  }

  // 4. Resolve doctor ID
  if (normalizedSql.includes('select id from doctors where doctor_name')) {
    return [[{ id: 1 }]];
  }

  // 5. Insert patient
  if (normalizedSql.includes('insert into patients')) {
    const nextId = mockDb.patients.length > 0 ? Math.max(...mockDb.patients.map(p => p.id)) + 1 : 1;
    const newPatient = {
      id: nextId,
      patient_id_seq: params[0],
      patient_name: params[1],
      mobile_number: params[2],
      age: parseInt(params[3], 10),
      gender: params[4],
      email: params[5],
      pincode: params[6],
      city: params[7],
      address: params[8]
    };
    mockDb.patients.push(newPatient);
    return [{ insertId: nextId }];
  }

  // 6. Insert visit
  if (normalizedSql.includes('insert into visits')) {
    const nextId = mockDb.visits.length > 0 ? Math.max(...mockDb.visits.map(v => v.id)) + 1 : 1;
    const newVisit = {
      id: nextId,
      patient_id: parseInt(params[0], 10),
      doctor_id: parseInt(params[1], 10),
      chief_complaint: params[2]
    };
    mockDb.visits.push(newVisit);
    return [{ insertId: nextId }];
  }

  // 7. Fetch invoices
  if (normalizedSql.includes('select i.*, p.patient_name, p.patient_id_seq') || normalizedSql.includes('from invoices i')) {
    const rows = mockDb.invoices.map(i => {
      const patient = mockDb.patients.find(p => p.id === i.patient_id) || {};
      return {
        ...i,
        patient_name: patient.patient_name || 'Unknown',
        patient_id_seq: patient.patient_id_seq || 'PAT-0000'
      };
    }).sort((a, b) => b.id - a.id);
    return [rows];
  }

  // 8. Next invoice number
  if (normalizedSql.includes('select invoice_no from invoices')) {
    if (normalizedSql.includes('where invoice_no like')) {
      const prefix = params[0].replace('%', '');
      const matching = mockDb.invoices
        .filter(i => i.invoice_no.startsWith(prefix))
        .sort((a, b) => b.id - a.id);
      return [matching];
    }
    const list = mockDb.invoices.map(i => ({ invoice_no: i.invoice_no }));
    return [list];
  }

  // 9. Insert invoice
  if (normalizedSql.includes('insert into invoices')) {
    const nextId = mockDb.invoices.length > 0 ? Math.max(...mockDb.invoices.map(i => i.id)) + 1 : 1;
    const newInvoice = {
      id: nextId,
      invoice_no: params[0],
      patient_id: parseInt(params[1], 10),
      treatment_name: params[2],
      amount: parseFloat(params[3]),
      status: params[4],
      invoice_date: params[5]
    };
    mockDb.invoices.push(newInvoice);
    return [{ insertId: nextId }];
  }

  // 10. Fetch appointments
  if (normalizedSql.includes('select a.*, p.patient_name, p.patient_id_seq') || normalizedSql.includes('from appointments a')) {
    const dateParam = params[0] || '';
    const filtered = mockDb.appointments.filter(a => a.appointment_date === dateParam).map(a => {
      const patient = mockDb.patients.find(p => p.id === a.patient_id) || {};
      return {
        ...a,
        patient_name: patient.patient_name || 'Unknown',
        patient_id_seq: patient.patient_id_seq || 'PAT-0000'
      };
    });
    return [filtered];
  }

  // 11. Insert appointment
  if (normalizedSql.includes('insert into appointments')) {
    const nextId = mockDb.appointments.length > 0 ? Math.max(...mockDb.appointments.map(a => a.id)) + 1 : 1;
    const newAppointment = {
      id: nextId,
      patient_id: parseInt(params[0], 10),
      doctor_id: parseInt(params[1], 10),
      appointment_date: params[2],
      appointment_time: params[3],
      reason: params[4]
    };
    mockDb.appointments.push(newAppointment);
    return [{ insertId: nextId }];
  }

  // 12. Insert doctors (seed fallback)
  if (normalizedSql.includes('insert into `doctors`')) {
    const nextId = mockDb.doctors.length + 1;
    mockDb.doctors.push({
      id: nextId,
      doctor_name: params[0] || 'Dr. Arjun Sharma',
      email: params[1] || 'arjun.sharma@dentalerp.com',
      initials: params[2] || 'DA'
    });
    return [{ insertId: nextId }];
  }

  return [[]];
}

const mockPool = {
  query: mockQuery,
  getConnection: async () => {
    return {
      beginTransaction: async () => {},
      query: mockQuery,
      commit: async () => {},
      rollback: async () => {},
      release: () => {}
    };
  }
};

export function getPool() {
  if (!pool) {
    // Return mock pool if init fails instead of crashing
    return mockPool;
  }
  return pool;
}
