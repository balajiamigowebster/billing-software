-- --------------------------------------------------------
-- Dental Clinic Management Database Schema
-- Compatible with MySQL / MariaDB
-- --------------------------------------------------------

-- Create Database
CREATE DATABASE IF NOT EXISTS `dental_clinic_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dental_clinic_db`;

-- --------------------------------------------------------
-- Table: doctors
-- Holds practitioner profiles
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `doctors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `doctor_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `initials` VARCHAR(5) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Doctor Data (matching profile in sidebar footer)
INSERT INTO `doctors` (`doctor_name`, `email`, `initials`)
VALUES ('Dr. Arjun Sharma', 'arjun.sharma@dentalerp.com', 'DA')
ON DUPLICATE KEY UPDATE `doctor_name` = VALUES(`doctor_name`);

-- --------------------------------------------------------
-- Table: patients
-- Holds basic patient information matching UI inputs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `patients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id_seq` VARCHAR(20) NOT NULL UNIQUE, -- Custom formatted sequence e.g. PAT-0001
  `patient_name` VARCHAR(100) NOT NULL,
  `mobile_number` VARCHAR(15) NOT NULL,
  `age` INT NOT NULL,
  `gender` ENUM('male', 'female', 'other') NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `pincode` VARCHAR(10) DEFAULT NULL,
  `city` VARCHAR(50) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: visits
-- Holds clinical visit records and chief complaints
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `visits` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `doctor_id` INT NOT NULL,
  `chief_complaint` TEXT NOT NULL,
  `visit_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_visit_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_visit_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: appointments
-- Holds calendar slots and followups
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `doctor_id` INT NOT NULL,
  `appointment_date` DATE NOT NULL,
  `appointment_time` VARCHAR(10) NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_appointment_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_appointment_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: invoices
-- Holds patient billing details
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `invoice_no` VARCHAR(20) NOT NULL UNIQUE,
  `patient_id` INT NOT NULL,
  `treatment_name` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('Paid', 'Pending') NOT NULL,
  `invoice_date` DATE NOT NULL,
  CONSTRAINT `fk_invoice_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: treatments
-- Holds clinic standard services list and costs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `treatments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `treatment_code` VARCHAR(20) NOT NULL UNIQUE,
  `treatment_name` VARCHAR(100) NOT NULL,
  `cost` DECIMAL(10, 2) NOT NULL,
  `duration` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Default Treatments
INSERT INTO `treatments` (`treatment_code`, `treatment_name`, `cost`, `duration`) VALUES
('T-101', 'Root Canal Therapy', 450.00, '60 mins'),
('T-102', 'Teeth Scaling & Polishing', 120.00, '30 mins'),
('T-103', 'Dental Veneers / Crowns', 800.00, '90 mins'),
('T-104', 'Composite Teeth Filling', 150.00, '40 mins'),
('T-105', 'Wisdom Tooth Extraction', 300.00, '60 mins')
ON DUPLICATE KEY UPDATE `treatment_name` = VALUES(`treatment_name`), `cost` = VALUES(`cost`), `duration` = VALUES(`duration`);

-- --------------------------------------------------------
-- Seed Sample Data matching the UI Mockup
-- --------------------------------------------------------

-- 1. Insert Patients
INSERT INTO `patients` (`id`, `patient_id_seq`, `patient_name`, `mobile_number`, `age`, `gender`, `email`, `pincode`, `city`, `address`)
VALUES 
(1, 'PAT-0001', 'Arjun Kumar', '9876543210', 30, 'male', 'patient@gmail.com', '600001', 'Chennai', 'Address'),
(2, 'PAT-0002', 'Nandini Iyer', '9876543211', 28, 'female', 'nandini@gmail.com', '600002', 'Chennai', 'Address')
ON DUPLICATE KEY UPDATE `patient_name` = VALUES(`patient_name`);

-- 2. Insert Visit for "Arjun Kumar" (PAT-0001) visiting "Dr. Arjun Sharma"
INSERT INTO `visits` (`id`, `patient_id`, `doctor_id`, `chief_complaint`)
VALUES (1, 1, 1, 'Tooth pain, swelling, sensitivity...')
ON DUPLICATE KEY UPDATE `chief_complaint` = VALUES(`chief_complaint`);

-- 3. Insert Invoices
INSERT INTO `invoices` (`id`, `invoice_no`, `patient_id`, `treatment_name`, `amount`, `status`, `invoice_date`)
VALUES 
(1, 'INV-2026-001', 1, 'Composite Teeth Filling', 150.00, 'Paid', '2026-06-15'),
(2, 'INV-2026-002', 2, 'Dental Veneers / Crowns', 800.00, 'Pending', '2026-06-14')
ON DUPLICATE KEY UPDATE `amount` = VALUES(`amount`);

-- 4. Insert Appointments
INSERT INTO `appointments` (`id`, `patient_id`, `doctor_id`, `appointment_date`, `appointment_time`, `reason`)
VALUES 
(1, 1, 1, '2026-06-15', '10:00 AM', 'Tooth Pain Consult'),
(2, 2, 1, '2026-06-15', '11:30 AM', 'Dental Crown')
ON DUPLICATE KEY UPDATE `reason` = VALUES(`reason`);
