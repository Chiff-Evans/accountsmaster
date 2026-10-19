-- ============================================================
-- Configurations > Targets: financial targets (amount by a date).
-- Permissions copied from the Parameters menu (id 30).
-- Not idempotent — run once.
-- ============================================================

CREATE TABLE `targets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `target_amount` decimal(14,2) NOT NULL,
  `target_date` date NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_targets_date` (`target_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Financial targets';

INSERT INTO `menus` (`menu_name`, `parent_menu_id`, `level`, `view_path`, `menu_order`, `icon`, `description`, `is_visible`)
VALUES ('Targets', 2, 2, '/config/targets', 17, 'AimOutlined', 'Target amounts by date', 1);
SET @menu := LAST_INSERT_ID();

INSERT INTO `role_menu_access` (`role_id`, `menu_id`, `can_view`, `can_create`, `can_edit`, `can_delete`)
SELECT `role_id`, @menu, `can_view`, `can_create`, `can_edit`, `can_delete`
FROM `role_menu_access` WHERE `menu_id` = 30;
