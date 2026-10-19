-- Per-stage toggle: when off, records currently sitting in this stage are
-- hidden from the entity's grid by default (staff can still see them by
-- explicitly selecting this stage in the grid's stage filter).
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'workflow_stages' AND COLUMN_NAME = 'show_in_grid_default');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `workflow_stages` ADD COLUMN `show_in_grid_default` TINYINT(1) DEFAULT 1 AFTER `assign_ref_no`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
