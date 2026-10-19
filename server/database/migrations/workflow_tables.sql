-- Workflow feature tables

CREATE TABLE IF NOT EXISTS workflows (
  id               INT PRIMARY KEY AUTO_INCREMENT,
  workflow_name    VARCHAR(100) NOT NULL,
  description      TEXT,
  process_type_id  INT,
  is_active        TINYINT(1) DEFAULT 1,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (process_type_id) REFERENCES process_types(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS workflow_stages (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  workflow_id       INT NOT NULL,
  stage_name        VARCHAR(100) NOT NULL,
  description       TEXT,
  responsible_group VARCHAR(100),
  workflow_status   VARCHAR(50),
  stage_order       INT DEFAULT 0,
  is_initial        TINYINT(1) DEFAULT 0,
  is_terminal       TINYINT(1) DEFAULT 0,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workflow_transitions (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  workflow_id    INT NOT NULL,
  from_stage_id  INT NOT NULL,
  to_stage_id    INT NOT NULL,
  action_label   VARCHAR(100) DEFAULT 'Move',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_transition (from_stage_id, to_stage_id),
  FOREIGN KEY (workflow_id)   REFERENCES workflows(id) ON DELETE CASCADE,
  FOREIGN KEY (from_stage_id) REFERENCES workflow_stages(id)   ON DELETE CASCADE,
  FOREIGN KEY (to_stage_id)   REFERENCES workflow_stages(id)   ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workflow_history (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  workflow_id  INT,
  entity_type  VARCHAR(50)  NOT NULL,
  entity_id    INT          NOT NULL,
  entity_ref   VARCHAR(100),
  from_status  VARCHAR(100),
  to_status    VARCHAR(100),
  moved_by     INT,
  notes        TEXT,
  moved_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE SET NULL,
  FOREIGN KEY (moved_by)    REFERENCES users(id)              ON DELETE SET NULL
);

-- Menu item: add Workflows under Configurations
-- Run after verifying the parent menu ID for "Configurations"
-- INSERT INTO menus (menu_name, parent_menu_id, view_path, icon, menu_order, is_visible)
-- SELECT 'Workflows', id, '/config/workflows', 'ApartmentOutlined', 70, 1
-- FROM menus WHERE view_path IS NULL AND menu_name LIKE '%Config%' LIMIT 1;
