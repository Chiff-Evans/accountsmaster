-- ============================================================
-- Configurations > Contribution Rates: how much a member contributes per
-- time unit (Time Units parameter, text_id 'time-units') over a period.
-- Only one rate is active at a time — enforced by a unique index on a
-- generated column (1 for the active row, NULL otherwise), same as targets.
-- Permissions copied from the Targets menu.
-- Not idempotent — run once.
-- ============================================================

CREATE TABLE `contribution_rates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `time_unit_id` int NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `active_flag` tinyint GENERATED ALWAYS AS (IF(`is_active` = 1, 1, NULL)) STORED,
  `created_by` int DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_contribution_rates_single_active` (`active_flag`),
  KEY `FK_contribution_rates_time_unit` (`time_unit_id`),
  CONSTRAINT `FK_contribution_rates_time_unit` FOREIGN KEY (`time_unit_id`) REFERENCES `parameter_values` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_contribution_rates_dates` CHECK (`end_date` >= `start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Member contribution rates';

INSERT INTO `menus` (`menu_name`, `parent_menu_id`, `level`, `view_path`, `menu_order`, `icon`, `description`, `is_visible`)
VALUES ('Contribution Rates', 2, 2, '/config/contribution-rates', 18, 'CalculatorOutlined', 'Contribution amount per time unit', 1);
SET @menu := LAST_INSERT_ID();

INSERT INTO `role_menu_access` (`role_id`, `menu_id`, `can_view`, `can_create`, `can_edit`, `can_delete`)
SELECT rma.`role_id`, @menu, rma.`can_view`, rma.`can_create`, rma.`can_edit`, rma.`can_delete`
FROM `role_menu_access` rma
JOIN `menus` m ON m.id = rma.menu_id
WHERE m.view_path = '/config/targets';
