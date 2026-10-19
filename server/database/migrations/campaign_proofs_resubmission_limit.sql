-- ============================================================
-- Cap resubmissions after rejection — a configurable limit (0 = unlimited)
-- stored in advertiser_config, tracked per-proof via rejection_count.
-- Idempotent — safe to re-run.
-- ============================================================
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'advertiser_config' AND COLUMN_NAME = 'max_proof_resubmissions');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `advertiser_config` ADD COLUMN `max_proof_resubmissions` INT NOT NULL DEFAULT 3 AFTER `min_avg_status_views`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists2 := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'campaign_proofs' AND COLUMN_NAME = 'rejection_count');
SET @sql2 := IF(@col_exists2 = 0,
  'ALTER TABLE `campaign_proofs` ADD COLUMN `rejection_count` INT NOT NULL DEFAULT 0 AFTER `status`',
  'SELECT 1');
PREPARE stmt2 FROM @sql2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;
