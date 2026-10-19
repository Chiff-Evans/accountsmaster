-- ============================================================
-- Advertiser Status-View Proof — a screenshot showing average
-- WhatsApp status views, collected at registration so staff can
-- verify the claimed avg_status_views figure before approving.
-- Idempotent — safe to re-run.
-- ============================================================
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'advertisers' AND COLUMN_NAME = 'status_proof_url');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `advertisers` ADD COLUMN `status_proof_url` VARCHAR(500) NULL DEFAULT NULL AFTER `profile_image`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
