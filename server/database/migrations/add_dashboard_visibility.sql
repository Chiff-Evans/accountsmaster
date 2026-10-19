USE salesmaster;

CREATE TABLE IF NOT EXISTS dashboard_visibility (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  section_key VARCHAR(50) NOT NULL,
  is_visible TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_role_section (role_id, section_key),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
