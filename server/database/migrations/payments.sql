-- ============================================================
-- Adventure Management Transform — Payments feature
-- Run once against the venturebrite database.
-- BACK UP THE DATABASE BEFORE RUNNING THIS FILE.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Payments table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `file_no` VARCHAR(250) NULL DEFAULT NULL,
  `trip_id` INT NOT NULL DEFAULT '0',
  `client_id` INT NOT NULL DEFAULT '0',
  `currency_id` INT NULL DEFAULT NULL,
  `amount` INT NULL DEFAULT NULL,
  `reference` VARCHAR(250) NULL DEFAULT NULL,
  `payment_date` DATE NULL DEFAULT NULL,
  `received_by` INT NULL DEFAULT NULL,
  `comments` TEXT NULL DEFAULT NULL,
  `created_by` INT NULL DEFAULT NULL,
  `created_on` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` INT NULL DEFAULT NULL,
  `updated_on` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_paymentss_trips` (`trip_id`) USING BTREE,
  INDEX `FK_paymentss_clients` (`client_id`) USING BTREE,
  INDEX `FK_paymentss_parameter_values` (`currency_id`) USING BTREE,
  CONSTRAINT `FK_paymentss_clients` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT `FK_paymentss_parameter_values` FOREIGN KEY (`currency_id`) REFERENCES `parameter_values` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT `FK_paymentss_trips` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
) COMMENT='Payments'
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. Process type + ref numbering
--    Prefix uses a trailing slash ("ADV/PAY/") like ADV/TRP/,
--    ADV/PAT/, ADV/EXP/, so the shared refNumber.js separator
--    fix yields "ADV/PAY/0034" (matching the screenshot) instead
--    of "ADV/PAY-0034".
-- ------------------------------------------------------------
INSERT INTO process_types (process_type_name, description, data_table)
SELECT 'payment_creation', 'Trip/Event Payments', 'payments'
WHERE NOT EXISTS (SELECT 1 FROM process_types WHERE process_type_name = 'payment_creation');

INSERT INTO ref_numbering (process_type_id, prefix, initial_serial, next_serial, use_year, use_month, padding)
SELECT pt.id, 'ADV/PAY/', 1, 1, 0, 0, 4
FROM process_types pt
WHERE pt.process_type_name = 'payment_creation'
  AND NOT EXISTS (SELECT 1 FROM ref_numbering WHERE process_type_id = pt.id);

-- ------------------------------------------------------------
-- 3. Menus — the "Revenue" menu (id 11) was a Phase 2 cosmetic
--    rename of the old Categories screen with no real feature
--    behind it yet. Repoint it to the real Payments feature,
--    same treatment "Expenditure" got over the old Units screen.
-- ------------------------------------------------------------
UPDATE menus SET view_path = '/stock/payments', description = 'Trip/event payments'
WHERE id = 11 AND menu_name = 'Revenue';
