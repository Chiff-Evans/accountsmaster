-- ============================================================
-- Configurations > Portal Settings: what members see on their portal Home.
--   show_total_balance       the group's total balance (all deposits minus
--                            all withdrawals, every account)
--   show_interest_deductions interest earned (deposits into internal
--                            accounts) and deductions/taxes (withdrawals
--                            from internal accounts)
-- Single-row table (id = 1). Both off by default — nothing new is shown to
-- members until staff switch it on. Permissions copied from Targets.
-- Not idempotent — run once.
-- ============================================================

CREATE TABLE `portal_settings` (
  `id` int NOT NULL,
  `show_total_balance` tinyint(1) NOT NULL DEFAULT 0,
  `show_interest_deductions` tinyint(1) NOT NULL DEFAULT 0,
  `updated_by` int DEFAULT NULL,
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Member portal visibility settings (single row)';

INSERT INTO `portal_settings` (`id`, `show_total_balance`, `show_interest_deductions`) VALUES (1, 0, 0);

INSERT INTO `menus` (`menu_name`, `parent_menu_id`, `level`, `view_path`, `menu_order`, `icon`, `description`, `is_visible`)
VALUES ('Portal Settings', 2, 2, '/config/portal-settings', 19, 'EyeOutlined', 'What members can see in the member portal', 1);
SET @menu := LAST_INSERT_ID();

INSERT INTO `role_menu_access` (`role_id`, `menu_id`, `can_view`, `can_create`, `can_edit`, `can_delete`)
SELECT rma.`role_id`, @menu, rma.`can_view`, rma.`can_create`, rma.`can_edit`, rma.`can_delete`
FROM `role_menu_access` rma
JOIN `menus` m ON m.id = rma.menu_id
WHERE m.view_path = '/config/targets';
