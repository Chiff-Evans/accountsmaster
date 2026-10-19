-- ============================================================
-- Generic parent/child support for parameter_values — lets any
-- parameter value optionally reference a "parent" value (e.g. a
-- Sub-County pointing at its owning County), so forms can filter
-- child options down to whichever parent was picked.
-- Idempotent — safe to re-run.
-- ============================================================
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'parameter_values' AND COLUMN_NAME = 'parent_value_id');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `parameter_values`
     ADD COLUMN `parent_value_id` INT NULL DEFAULT NULL AFTER `parameter_id`,
     ADD INDEX `FK_parameter_values_parent` (`parent_value_id`),
     ADD CONSTRAINT `FK_parameter_values_parent` FOREIGN KEY (`parent_value_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
