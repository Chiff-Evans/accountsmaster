-- ============================================================
-- Campaign Discount — supports Balance = Budget - Discount - Paid
-- on the Campaigns grid. Idempotent — safe to re-run.
-- ============================================================
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'campaigns' AND COLUMN_NAME = 'discount');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `campaigns` ADD COLUMN `discount` INT NULL DEFAULT 0 AFTER `budget`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
