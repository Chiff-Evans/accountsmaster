-- ============================================================
-- Mode of Payment — new configurable parameter + column on `payments`.
-- Idempotent — safe to re-run.
-- ============================================================

INSERT IGNORE INTO `parameters` (`parameter_name`, `text_id`, `description`, `is_active`)
SELECT 'Payment Modes', 'payment_modes', NULL, 1
WHERE NOT EXISTS (SELECT 1 FROM `parameters` WHERE `text_id` = 'payment_modes');

INSERT IGNORE INTO `parameter_values` (`parameter_id`, `paramater_value`, `description`, `is_active`)
SELECT p.id, v.val, '', 1
FROM `parameters` p
JOIN (SELECT 'MPESA' AS val UNION ALL SELECT 'Cash' UNION ALL SELECT 'Bank') v
WHERE p.text_id = 'payment_modes'
  AND NOT EXISTS (
    SELECT 1 FROM `parameter_values` pv WHERE pv.parameter_id = p.id AND pv.paramater_value = v.val
  );

SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments' AND COLUMN_NAME = 'payment_mode_id');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `payments`
     ADD COLUMN `payment_mode_id` INT NULL DEFAULT NULL AFTER `currency_id`,
     ADD INDEX `FK_payments_payment_mode` (`payment_mode_id`),
     ADD CONSTRAINT `FK_payments_payment_mode` FOREIGN KEY (`payment_mode_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
