CREATE TABLE IF NOT EXISTS receipt_config (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  config_name     VARCHAR(100) NOT NULL DEFAULT 'Default',
  payment_details VARCHAR(255) NULL,
  customer_care_no VARCHAR(50) NULL,
  email            VARCHAR(200) NULL,
  other_conditions LONGTEXT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by      INT NULL,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by      INT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

INSERT IGNORE INTO menus (menu_name, view_path, parent_menu_id, menu_order, level, icon, is_visible)
VALUES ('Receipt Setup', '/stock/receipt-config', 10, 5, 2, 'FileTextOutlined', 1);
