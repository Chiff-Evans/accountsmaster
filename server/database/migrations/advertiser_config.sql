-- ============================================================
-- Advertiser Settings — single-row config (same pattern as
-- loyalty_config) holding the minimum acceptable Average Status
-- Views figure an advertiser can register/save with.
-- Idempotent — safe to re-run.
-- ============================================================
CREATE TABLE IF NOT EXISTS `advertiser_config` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `min_avg_status_views` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `advertiser_config` (`id`, `min_avg_status_views`) VALUES (1, 0);

-- ------------------------------------------------------------
-- Menu — "Advertiser Settings" under Configurations
-- ------------------------------------------------------------
INSERT INTO `menus` (`menu_name`, `parent_menu_id`, `level`, `view_path`, `menu_order`, `icon`, `description`, `is_visible`)
SELECT 'Advertiser Settings', m.id, 2, '/config/advertiser-settings',
       (SELECT COALESCE(MAX(menu_order), 0) + 1 FROM menus WHERE parent_menu_id = m.id),
       'SolutionOutlined', 'Minimum average status views required to register as an advertiser', 1
FROM `menus` m
WHERE m.menu_name = 'Configurations' AND m.parent_menu_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM `menus` WHERE view_path = '/config/advertiser-settings')
LIMIT 1;

INSERT INTO `role_menu_access` (`role_id`, `menu_id`, `can_view`, `can_create`, `can_edit`, `can_delete`)
SELECT r.id, m.id, 1, 1, 1, 1
FROM `roles` r
JOIN `menus` m ON m.view_path = '/config/advertiser-settings'
WHERE r.id IN (1, 2)
  AND NOT EXISTS (SELECT 1 FROM `role_menu_access` rma WHERE rma.role_id = r.id AND rma.menu_id = m.id);
