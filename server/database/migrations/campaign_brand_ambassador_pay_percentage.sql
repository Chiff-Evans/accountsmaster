-- Per-campaign override of brand_ambassador_config.brand_ambassador_pay_percentage.
-- NULL means "use the global default" — distinct from an explicit 0%.
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'campaigns' AND COLUMN_NAME = 'brand_ambassador_pay_percentage');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `campaigns` ADD COLUMN `brand_ambassador_pay_percentage` DECIMAL(5,2) NULL DEFAULT NULL AFTER `budget`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
