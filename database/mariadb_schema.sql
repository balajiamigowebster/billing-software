-- --------------------------------------------------------
-- Dental Clinic Management Database Schema
-- Specifically formatted for MariaDB
-- --------------------------------------------------------

-- Create Database
CREATE DATABASE IF NOT EXISTS `dental_clinic_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dental_clinic_db`;

-- --------------------------------------------------------
-- Table: doctors
-- Holds practitioner profiles
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `doctors` (
  `id` INT AUTO_INCREMENT,
  `doctor_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `initials` VARCHAR(5) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
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
  `id` INT AUTO_INCREMENT,
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
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: visits
-- Holds clinical visit records and chief complaints
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `visits` (
  `id` INT AUTO_INCREMENT,
  `patient_id` INT NOT NULL,
  `doctor_id` INT NOT NULL,
  `chief_complaint` TEXT NOT NULL,
  `visit_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_visit_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_visit_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Seed Sample Data matching the UI Mockup
-- --------------------------------------------------------

-- 1. Insert Patient "Arjun Kumar"
INSERT INTO `patients` (`patient_id_seq`, `patient_name`, `mobile_number`, `age`, `gender`, `email`, `pincode`, `city`, `address`)
VALUES ('PAT-0001', 'Arjun Kumar', '9876543210', 30, 'male', 'patient@gmail.com', '600001', 'Chennai', 'Address');

-- 2. Insert Visit for "Arjun Kumar" (PAT-0001) visiting "Dr. Arjun Sharma"
INSERT INTO `visits` (`patient_id`, `doctor_id`, `chief_complaint`)
VALUES (
  (SELECT `id` FROM `patients` WHERE `patient_id_seq` = 'PAT-0001' LIMIT 1),
  (SELECT `id` FROM `doctors` WHERE `email` = 'arjun.sharma@dentalerp.com' LIMIT 1),
  'Tooth pain, swelling, sensitivity...'
);
