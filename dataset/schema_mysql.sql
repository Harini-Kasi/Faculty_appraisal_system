-- MySQL Database Schema for Faculty Performance Appraisal System
-- Database: fpa_db

CREATE DATABASE IF NOT EXISTS `fpa_db`;
USE `fpa_db`;

-- Admins Table
CREATE TABLE IF NOT EXISTS `admins` (
  `username` VARCHAR(50) PRIMARY KEY,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Faculty Master Table
CREATE TABLE IF NOT EXISTS `faculty` (
  `username` VARCHAR(50) PRIMARY KEY,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `department` VARCHAR(50) NOT NULL,
  `designation` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Departments Master Table
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `dept_code` VARCHAR(50) UNIQUE NOT NULL,
  `dept_name` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Designations Master Table
CREATE TABLE IF NOT EXISTS `designations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `desig_code` VARCHAR(50) UNIQUE NOT NULL,
  `desig_name` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Questions Table
CREATE TABLE IF NOT EXISTS `questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `department` VARCHAR(50) NOT NULL,
  `designation` VARCHAR(50) NOT NULL,
  `section_code` VARCHAR(50),
  `section_label` VARCHAR(255),
  `subsection_code` VARCHAR(50),
  `subsection_label` VARCHAR(255),
  `group_code` VARCHAR(50),
  `group_label` VARCHAR(255),
  `text` TEXT NOT NULL,
  `weightage` DOUBLE NOT NULL DEFAULT 1,
  `order_index` INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Question Options Table
CREATE TABLE IF NOT EXISTS `options` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `question_id` INT NOT NULL,
  `text` TEXT NOT NULL,
  `score` DOUBLE NOT NULL,
  `order_index` INT NOT NULL DEFAULT 0,
  FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Self Appraisal Submissions Table
CREATE TABLE IF NOT EXISTS `submissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL,
  `staff_name` VARCHAR(100) NOT NULL,
  `department` VARCHAR(50) NOT NULL,
  `designation` VARCHAR(50) NOT NULL,
  `total_score` DOUBLE NOT NULL,
  `max_score` DOUBLE NOT NULL,
  `answers_json` LONGTEXT NOT NULL,
  `submitted_at` VARCHAR(100) NOT NULL,
  `area_of_specialization` VARCHAR(255),
  `teaching_experience` DOUBLE,
  `industry_experience` DOUBLE,
  `courses_taught_odd` TEXT,
  `courses_taught_even` TEXT,
  `ug_projects_guided` DOUBLE,
  `pg_projects_guided` DOUBLE,
  `tutorship` VARCHAR(255),
  FOREIGN KEY (`username`) REFERENCES `faculty`(`username`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
