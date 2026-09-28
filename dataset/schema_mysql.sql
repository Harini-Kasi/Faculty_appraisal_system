-- ============================================================
-- Faculty Performance Appraisal System (FPA) Schema (fpa_db)
-- Database Engine: MySQL / MariaDB (InnoDB)
-- ============================================================

CREATE DATABASE IF NOT EXISTS `fpa_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `fpa_db`;

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS `admins` (
  `username` VARCHAR(50) PRIMARY KEY,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Faculty Table
CREATE TABLE IF NOT EXISTS `faculty` (
  `username` VARCHAR(50) PRIMARY KEY,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `department` VARCHAR(50) NOT NULL,
  `designation` VARCHAR(50) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'faculty',
  `email` VARCHAR(100) DEFAULT '',
  `phone` VARCHAR(20) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Departments Table with Division Maximums
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `dept_code` VARCHAR(50) UNIQUE NOT NULL,
  `dept_name` VARCHAR(100) NOT NULL,
  `max_score` DOUBLE NOT NULL DEFAULT 445
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Designations Table
CREATE TABLE IF NOT EXISTS `designations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `desig_code` VARCHAR(50) UNIQUE NOT NULL,
  `desig_name` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Faculty Academic Details Table
CREATE TABLE IF NOT EXISTS `faculty_academic_details` (
  `username` VARCHAR(50) PRIMARY KEY,
  `area_of_specialization` VARCHAR(255) DEFAULT '',
  `teaching_experience` DOUBLE DEFAULT 0,
  `industry_experience` DOUBLE DEFAULT 0,
  `courses_taught_odd` TEXT,
  `courses_taught_even` TEXT,
  `ug_projects_guided` DOUBLE DEFAULT 0,
  `pg_projects_guided` DOUBLE DEFAULT 0,
  `tutorship` VARCHAR(255) DEFAULT '',
  `achievements` TEXT,
  `updated_at` VARCHAR(100),
  CONSTRAINT `fk_academic_faculty` FOREIGN KEY (`username`) REFERENCES `faculty` (`username`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Questions Table
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

-- 7. Options Table
CREATE TABLE IF NOT EXISTS `options` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `question_id` INT NOT NULL,
  `text` TEXT NOT NULL,
  `score` DOUBLE NOT NULL,
  `order_index` INT NOT NULL DEFAULT 0,
  CONSTRAINT `fk_options_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Submissions Table (Self Appraisal Submissions & Drafts)
CREATE TABLE IF NOT EXISTS `submissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL,
  `staff_name` VARCHAR(100) NOT NULL,
  `department` VARCHAR(50) NOT NULL,
  `designation` VARCHAR(50) NOT NULL,
  `total_score` DOUBLE NOT NULL DEFAULT 0,
  `max_score` DOUBLE NOT NULL DEFAULT 0,
  `api_score` DOUBLE NOT NULL DEFAULT 0,
  `answers_json` LONGTEXT NOT NULL,
  `submitted_at` VARCHAR(100) NOT NULL,
  `is_draft` INT NOT NULL DEFAULT 0,
  `is_submitted` INT NOT NULL DEFAULT 1,
  `is_verified` INT NOT NULL DEFAULT 0,
  `verified_by` VARCHAR(100) DEFAULT '',
  `verification_remarks` TEXT,
  `verified_at` VARCHAR(100) DEFAULT '',
  `area_of_specialization` VARCHAR(255) DEFAULT '',
  `teaching_experience` DOUBLE DEFAULT 0,
  `industry_experience` DOUBLE DEFAULT 0,
  `courses_taught_odd` TEXT,
  `courses_taught_even` TEXT,
  `ug_projects_guided` DOUBLE DEFAULT 0,
  `pg_projects_guided` DOUBLE DEFAULT 0,
  `tutorship` VARCHAR(255) DEFAULT '',
  CONSTRAINT `fk_submissions_faculty` FOREIGN KEY (`username`) REFERENCES `faculty` (`username`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. HOD Evaluations Table
CREATE TABLE IF NOT EXISTS `hod_evaluations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `evaluator_username` VARCHAR(50) NOT NULL,
  `h1` TEXT, `h2` TEXT, `h3` TEXT, `h4` TEXT, `h5` TEXT, `h6` TEXT,
  `h7` TEXT, `h8` TEXT, `h9` TEXT, `h10` TEXT, `h11` TEXT, `h12` TEXT, `h13` TEXT,
  `hpe` DOUBLE DEFAULT 0,
  `remarks` TEXT,
  `is_submitted` INT NOT NULL DEFAULT 0,
  `submitted_at` VARCHAR(100),
  `updated_at` VARCHAR(100),
  CONSTRAINT `fk_hod_faculty` FOREIGN KEY (`username`) REFERENCES `faculty` (`username`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Principal Evaluations Table
CREATE TABLE IF NOT EXISTS `principal_evaluations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `evaluator_username` VARCHAR(50) NOT NULL,
  `p1` TEXT, `p2` TEXT, `p3` TEXT, `p4` TEXT, `p5` TEXT,
  `p6` TEXT, `p7` TEXT, `p8` TEXT, `p9` TEXT, `p10` TEXT,
  `total_score` DOUBLE DEFAULT 0,
  `remarks` TEXT,
  `is_submitted` INT NOT NULL DEFAULT 0,
  `submitted_at` VARCHAR(100),
  `updated_at` VARCHAR(100),
  CONSTRAINT `fk_principal_faculty` FOREIGN KEY (`username`) REFERENCES `faculty` (`username`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Reviewer (RAdmin) Evaluations Table
CREATE TABLE IF NOT EXISTS `reviewer_evaluations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `evaluator_username` VARCHAR(50) NOT NULL,
  `r1` TEXT, `r2` TEXT, `r3` TEXT, `r4` TEXT, `r5` TEXT,
  `r6` TEXT, `r7` TEXT, `r8` TEXT, `r9` TEXT, `r10` TEXT,
  `total_score` DOUBLE DEFAULT 0,
  `remarks` TEXT,
  `is_submitted` INT NOT NULL DEFAULT 0,
  `submitted_at` VARCHAR(100),
  `updated_at` VARCHAR(100),
  CONSTRAINT `fk_reviewer_faculty` FOREIGN KEY (`username`) REFERENCES `faculty` (`username`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Dean (VAdmin) Verifications Table
CREATE TABLE IF NOT EXISTS `dean_verifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `verifier_username` VARCHAR(50) NOT NULL,
  `is_verified` INT NOT NULL DEFAULT 1,
  `remarks` TEXT,
  `verified_at` VARCHAR(100),
  CONSTRAINT `fk_dean_faculty` FOREIGN KEY (`username`) REFERENCES `faculty` (`username`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Department Appraisal Table (HOD Department Appraisal)
CREATE TABLE IF NOT EXISTS `department_appraisal` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL,
  `department` VARCHAR(50) NOT NULL,
  `faculty_info` TEXT,
  `form_data` LONGTEXT,
  `special_skills` TEXT,
  `sg1_total` DOUBLE DEFAULT 0,
  `sg2_total` DOUBLE DEFAULT 0,
  `sg3_total` DOUBLE DEFAULT 0,
  `sg4_total` DOUBLE DEFAULT 0,
  `sg5_total` DOUBLE DEFAULT 0,
  `sg6_total` DOUBLE DEFAULT 0,
  `total_score` DOUBLE DEFAULT 0,
  `normalized_score` DOUBLE DEFAULT 0,
  `department_max_score` DOUBLE DEFAULT 445,
  `is_draft` INT DEFAULT 0,
  `is_submitted` INT DEFAULT 0,
  `submitted_date` VARCHAR(100),
  `created_at` VARCHAR(100),
  `updated_at` VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
