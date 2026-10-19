-- ============================================================
-- Percentage of a campaign's budget set aside to pay the advertisers who
-- ran it, used to estimate each assigned advertiser's revenue share on the
-- Campaigns > Advertisers tab (split proportionally to accepted views).
-- Idempotent — safe to re-run.
-- ============================================================
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'advertiser_config' AND COLUMN_NAME = 'advertiser_pay_percentage');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `advertiser_config` ADD COLUMN `advertiser_pay_percentage` DECIMAL(5,2) NOT NULL DEFAULT 0 AFTER `max_proof_resubmissions`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
