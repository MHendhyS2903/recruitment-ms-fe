-- Recruitment application schema
-- Target: MySQL 8.0+
-- Charset: utf8mb4

SET NAMES utf8mb4;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  role ENUM('SUPER_ADMIN', 'RECRUITER', 'SALES', 'FINANCE') NOT NULL DEFAULT 'RECRUITER',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE document_category_ref (
  code VARCHAR(32) NOT NULL,
  name VARCHAR(64) NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE recruiter_stage_ref (
  code VARCHAR(32) NOT NULL,
  name VARCHAR(64) NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sales_stage_ref (
  code VARCHAR(32) NOT NULL,
  name VARCHAR(64) NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE candidates (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  candidate_code VARCHAR(32) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  applied_role VARCHAR(120) NOT NULL,
  email VARCHAR(191) NULL,
  phone VARCHAR(40) NULL,
  source_channel VARCHAR(100) NULL,
  current_location VARCHAR(120) NULL,
  expected_salary_amount DECIMAL(15,2) NULL,
  expected_salary_currency CHAR(3) NOT NULL DEFAULT 'IDR',
  date_of_join DATE NULL,
  profile_summary TEXT NULL,
  photo_original_name VARCHAR(255) NULL,
  photo_storage_path VARCHAR(500) NULL,
  created_by_user_id BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_candidates_candidate_code (candidate_code),
  KEY idx_candidates_full_name (full_name),
  KEY idx_candidates_email (email),
  KEY idx_candidates_phone (phone),
  KEY idx_candidates_source_channel (source_channel),
  CONSTRAINT fk_candidates_created_by
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE candidate_documents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  candidate_id BIGINT UNSIGNED NOT NULL,
  category_code VARCHAR(32) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(120) NULL,
  size_bytes BIGINT UNSIGNED NULL,
  uploaded_by_user_id BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_candidate_documents_candidate_id (candidate_id),
  KEY idx_candidate_documents_category_code (category_code),
  CONSTRAINT fk_candidate_documents_candidate
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_candidate_documents_category
    FOREIGN KEY (category_code) REFERENCES document_category_ref(code)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_candidate_documents_uploaded_by
    FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE recruiter_pipeline (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  candidate_id BIGINT UNSIGNED NOT NULL,
  stage_code VARCHAR(32) NOT NULL,
  assigned_user_id BIGINT UNSIGNED NULL,
  handoff_to_sales_at DATETIME NULL,
  locked_after_handoff TINYINT(1) NOT NULL DEFAULT 0,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_recruiter_pipeline_candidate_id (candidate_id),
  KEY idx_recruiter_pipeline_stage_code (stage_code),
  KEY idx_recruiter_pipeline_assigned_user_id (assigned_user_id),
  CONSTRAINT fk_recruiter_pipeline_candidate
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_recruiter_pipeline_stage
    FOREIGN KEY (stage_code) REFERENCES recruiter_stage_ref(code)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_recruiter_pipeline_assigned_user
    FOREIGN KEY (assigned_user_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sales_pipeline (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  candidate_id BIGINT UNSIGNED NOT NULL,
  recruiter_pipeline_id BIGINT UNSIGNED NOT NULL,
  stage_code VARCHAR(32) NOT NULL,
  assigned_user_id BIGINT UNSIGNED NULL,
  interview_schedule_at DATETIME NULL,
  interview_link VARCHAR(255) NULL,
  processed_at DATETIME NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sales_pipeline_candidate_id (candidate_id),
  UNIQUE KEY uq_sales_pipeline_recruiter_pipeline_id (recruiter_pipeline_id),
  KEY idx_sales_pipeline_stage_code (stage_code),
  KEY idx_sales_pipeline_assigned_user_id (assigned_user_id),
  KEY idx_sales_pipeline_interview_schedule_at (interview_schedule_at),
  CONSTRAINT fk_sales_pipeline_candidate
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_sales_pipeline_recruiter_pipeline
    FOREIGN KEY (recruiter_pipeline_id) REFERENCES recruiter_pipeline(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_sales_pipeline_stage
    FOREIGN KEY (stage_code) REFERENCES sales_stage_ref(code)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_sales_pipeline_assigned_user
    FOREIGN KEY (assigned_user_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE interviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  candidate_id BIGINT UNSIGNED NOT NULL,
  sales_pipeline_id BIGINT UNSIGNED NULL,
  interview_round SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  scheduled_at DATETIME NOT NULL,
  meeting_link VARCHAR(255) NOT NULL,
  owner_user_id BIGINT UNSIGNED NULL,
  owner_name_snapshot VARCHAR(120) NULL,
  host_user_id BIGINT UNSIGNED NULL,
  host_name_snapshot VARCHAR(120) NULL,
  candidate_status ENUM('INTERVIEW', 'BACKOUT', 'RESCHEDULE') NOT NULL DEFAULT 'INTERVIEW',
  interview_status ENUM('PROCESS', 'FAILED') NOT NULL DEFAULT 'PROCESS',
  notes TEXT NULL,
  created_by_user_id BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_interviews_candidate_id (candidate_id),
  KEY idx_interviews_sales_pipeline_id (sales_pipeline_id),
  KEY idx_interviews_scheduled_at (scheduled_at),
  KEY idx_interviews_owner_user_id (owner_user_id),
  KEY idx_interviews_host_user_id (host_user_id),
  KEY idx_interviews_candidate_status (candidate_status),
  KEY idx_interviews_interview_status (interview_status),
  CONSTRAINT fk_interviews_candidate
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_interviews_sales_pipeline
    FOREIGN KEY (sales_pipeline_id) REFERENCES sales_pipeline(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_interviews_owner_user
    FOREIGN KEY (owner_user_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_interviews_host_user
    FOREIGN KEY (host_user_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_interviews_created_by
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE candidate_stage_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  candidate_id BIGINT UNSIGNED NOT NULL,
  module_code VARCHAR(32) NOT NULL,
  from_stage_code VARCHAR(32) NULL,
  to_stage_code VARCHAR(32) NOT NULL,
  changed_by_user_id BIGINT UNSIGNED NULL,
  changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  remarks TEXT NULL,
  PRIMARY KEY (id),
  KEY idx_candidate_stage_history_candidate_id (candidate_id),
  KEY idx_candidate_stage_history_module_code (module_code),
  KEY idx_candidate_stage_history_changed_at (changed_at),
  CONSTRAINT fk_candidate_stage_history_candidate
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_candidate_stage_history_changed_by
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO document_category_ref (code, name, sort_order) VALUES
  ('CV', 'CV', 1),
  ('PORTOFOLIO', 'Portofolio', 2),
  ('SURAT_LAMARAN', 'Surat Lamaran', 3),
  ('LAMPIRAN', 'Lampiran', 4);

INSERT INTO recruiter_stage_ref (code, name, sort_order) VALUES
  ('TO_DO', 'TO DO', 1),
  ('READY_TO_INTERVIEW', 'READY TO INTERVIEW', 2),
  ('INTERVIEWING', 'INTERVIEWING', 3);

INSERT INTO sales_stage_ref (code, name, sort_order) VALUES
  ('TO_DO', 'TO DO', 1),
  ('INTERVIEWING', 'INTERVIEWING', 2);

