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
    console.error('Error initializing database:', error);
    throw error;
  }
}

export function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializeDatabase first.');
  }
  return pool;
}
