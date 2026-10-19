-- ============================================================
-- Loyalty Points Feature Migration
-- Run once against the salesmaster database
-- ============================================================

-- 1. Loyalty configuration (single-row global settings)
CREATE TABLE IF NOT EXISTS loyalty_config (
  id               INT PRIMARY KEY AUTO_INCREMENT,
  min_sale_amount  DECIMAL(12,2) NOT NULL DEFAULT 500.00,
  amount_per_point DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  qualifying_stage_id INT NULL,
  is_active        TINYINT(1) NOT NULL DEFAULT 0,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_lc_stage FOREIGN KEY (qualifying_stage_id)
    REFERENCES workflow_stages(id) ON DELETE SET NULL
);

-- Seed the one config row (idempotent)
INSERT IGNORE INTO loyalty_config (id, min_sale_amount, amount_per_point, qualifying_stage_id, is_active)
VALUES (1, 500.00, 100.00, NULL, 0);

-- 2. Loyalty points transaction log (one row per qualifying order)
CREATE TABLE IF NOT EXISTS loyalty_points (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  client_id   INT NOT NULL,
  order_id    INT NOT NULL,
  points      INT NOT NULL DEFAULT 0,
  order_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_lp_order (order_id),
  CONSTRAINT fk_lp_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_lp_order  FOREIGN KEY (order_id)  REFERENCES orders(id)  ON DELETE CASCADE
);

-- 3. Add denormalised points balance to clients (fast portal read)
ALTER TABLE clients
  ADD COLUMN loyalty_points INT NOT NULL DEFAULT 0;

-- 4. Menu entry under Configurations (run only if the menu record does not yet exist)
--    Adjust the parent SELECT if your Configurations parent menu_name differs.
INSERT INTO menus (menu_name, parent_menu_id, level, view_path, menu_order, icon, is_visible)
SELECT 'Loyalty Points',
       m.id,
       2,
       '/config/loyalty',
       15,
       'TrophyOutlined',
       1
FROM   menus m
WHERE  m.menu_name = 'Configurations'
  AND  m.parent_menu_id IS NULL
  AND  NOT EXISTS (
         SELECT 1 FROM menus WHERE view_path = '/config/loyalty'
       )
LIMIT 1;
