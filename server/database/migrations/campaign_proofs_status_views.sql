-- ============================================================
-- Campaign Proofs — capture the day's status-view count alongside the
-- screenshot itself. Idempotent — safe to re-run.
-- ============================================================
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'campaign_proofs' AND COLUMN_NAME = 'status_views');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `campaign_proofs` ADD COLUMN `status_views` INT NULL DEFAULT NULL AFTER `image_path`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
