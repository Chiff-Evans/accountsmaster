-- ============================================================
-- Adventure Management Transform — Phase 2
-- Trips table + Bookings/portal integration + config relabels
-- Run once against the venturebrite database.
-- BACK UP THE DATABASE BEFORE RUNNING THIS FILE.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Trips table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `trips` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `file_no` VARCHAR(250) NULL DEFAULT NULL,
  `name` VARCHAR(250) NOT NULL,
  `start_date` DATE NULL DEFAULT NULL,
  `end_date` DATE NULL DEFAULT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `event_fee` INT NULL DEFAULT NULL,
  `kids_fee` INT NULL DEFAULT NULL,
  `booking_fee` INT NULL DEFAULT NULL,
  `status_id` INT NULL DEFAULT NULL,
  `inclusions` JSON NULL DEFAULT NULL,
  `exclusions` JSON NULL DEFAULT NULL,
  `comments` TEXT NULL DEFAULT NULL,
  `img_url` VARCHAR(255) NULL DEFAULT NULL,
  `created_by` INT NULL DEFAULT NULL,
  `created_on` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` INT NULL DEFAULT NULL,
  `updated_on` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_trips_parameter_values` (`status_id`) USING BTREE,
  CONSTRAINT `FK_trips_parameter_values` FOREIGN KEY (`status_id`) REFERENCES `parameter_values` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
) COMMENT='Trips and Events Table'
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. Repoint Booking line items at trips instead of the legacy
--    items table (order_items is empty post-Phase-1, safe to alter).
-- ------------------------------------------------------------
ALTER TABLE order_items DROP FOREIGN KEY order_items_ibfk_2;
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_trip FOREIGN KEY (item_id) REFERENCES trips (id);

-- ------------------------------------------------------------
-- 3. Process type + ref numbering for Trip/Event creation
-- ------------------------------------------------------------
INSERT INTO process_types (process_type_name, description, data_table)
SELECT 'trip_event_Creation', 'Trip/events', 'trips'
WHERE NOT EXISTS (SELECT 1 FROM process_types WHERE process_type_name = 'trip_event_Creation');

INSERT INTO ref_numbering (process_type_id, prefix, initial_serial, next_serial, use_year, use_month, padding)
SELECT pt.id, 'ADV/TRP/', 1, 1, 0, 0, 4
FROM process_types pt
WHERE pt.process_type_name = 'trip_event_Creation'
  AND NOT EXISTS (SELECT 1 FROM ref_numbering WHERE process_type_id = pt.id);

-- ------------------------------------------------------------
-- 4. Menu relabels: Categories→Revenue, Units of Measure→Expenditure
--    (both under Trips), Shops→Companies (under Clients)
-- ------------------------------------------------------------
UPDATE menus SET menu_name = 'Revenue'     WHERE id = 11 AND menu_name = 'Categories';
UPDATE menus SET menu_name = 'Expenditure' WHERE id = 12 AND menu_name = 'Units of Measure';
UPDATE menus SET menu_name = 'Companies'   WHERE id = 18 AND menu_name = 'Shops';
