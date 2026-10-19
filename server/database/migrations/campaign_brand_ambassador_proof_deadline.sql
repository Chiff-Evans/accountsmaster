-- Per-assignment override of the last date a brand ambassador may submit
-- posting proof for a campaign. NULL means "use the campaign's own end_date".
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'campaign_brand_ambassadors' AND COLUMN_NAME = 'proof_deadline');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `campaign_brand_ambassadors` ADD COLUMN `proof_deadline` DATE NULL DEFAULT NULL AFTER `assigned_on`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
