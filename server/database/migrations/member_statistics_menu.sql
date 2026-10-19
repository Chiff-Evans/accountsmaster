-- ============================================================
-- Stake-Holders > Statistics: per-member deposits, withdrawals,
-- balance and overpayment against the active target.
-- Permissions copied from the Members menu (id 17).
-- Not idempotent — run once.
-- ============================================================

INSERT INTO `menus` (`menu_name`, `parent_menu_id`, `level`, `view_path`, `menu_order`, `icon`, `description`, `is_visible`)
VALUES ('Statistics', 16, 2, '/members/statistics', 2, 'BarChartOutlined', 'Member contributions against the active target', 1);
SET @menu := LAST_INSERT_ID();

INSERT INTO `role_menu_access` (`role_id`, `menu_id`, `can_view`, `can_create`, `can_edit`, `can_delete`)
SELECT `role_id`, @menu, `can_view`, 0, 0, 0
FROM `role_menu_access` WHERE `menu_id` = 17;
