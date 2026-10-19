-- ============================================================
-- Adventure Management Transform — Phase 3
-- Participants + Expenditure features
-- Run once against the venturebrite database.
-- BACK UP THE DATABASE BEFORE RUNNING THIS FILE.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Participants table
--    NOTE: FK_participants_bookings references `orders`, not a
--    `bookings` table — "Bookings" is only the cosmetic label
--    (Phase 1) for the real `orders` table; there is no separate
--    `bookings` table in this database.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `participants` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `file_no` VARCHAR(250) NULL DEFAULT NULL,
  `trip_id` INT NOT NULL DEFAULT '0',
  `client_id` INT NOT NULL DEFAULT '0',
  `status_id` INT NULL DEFAULT NULL,
  `booking_id` INT NULL DEFAULT NULL,
  `no_of_adults` INT NULL DEFAULT '1',
  `no_of_kids` INT NULL DEFAULT '0',
  `discount` INT NULL DEFAULT '0',
  `comments` TEXT NULL DEFAULT NULL,
  `created_by` INT NULL DEFAULT NULL,
  `created_on` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` INT NULL DEFAULT NULL,
  `updated_on` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_participants_trips` (`trip_id`) USING BTREE,
  INDEX `FK_participants_clients` (`client_id`) USING BTREE,
  INDEX `FK_participants_parameter_values` (`status_id`) USING BTREE,
  INDEX `FK_participants_bookings` (`booking_id`) USING BTREE,
  CONSTRAINT `FK_participants_bookings` FOREIGN KEY (`booking_id`) REFERENCES `orders` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT `FK_participants_clients` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT `FK_participants_parameter_values` FOREIGN KEY (`status_id`) REFERENCES `parameter_values` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT `FK_participants_trips` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
) COMMENT='Trips and Events Participants Table'
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. Expenditure table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `expenditure` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `file_no` VARCHAR(250) NULL DEFAULT NULL,
  `trip_id` INT NOT NULL DEFAULT '0',
  `expenditure_type_id` INT NULL DEFAULT NULL,
  `currency_id` INT NULL DEFAULT NULL,
  `amount` INT NULL DEFAULT NULL,
  `reference` VARCHAR(250) NULL DEFAULT NULL,
  `expenditure_date` DATE NULL DEFAULT NULL,
  `done_by` INT NULL DEFAULT NULL,
  `comments` TEXT NULL DEFAULT NULL,
  `created_by` INT NULL DEFAULT NULL,
  `created_on` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` INT NULL DEFAULT NULL,
  `updated_on` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_expenditure_trips` (`trip_id`) USING BTREE,
  INDEX `FK_expenditure_parameter_values` (`currency_id`) USING BTREE,
  INDEX `FK_expenditure_parameter_values_2` (`expenditure_type_id`) USING BTREE,
  CONSTRAINT `FK_expenditure_parameter_values` FOREIGN KEY (`currency_id`) REFERENCES `parameter_values` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT `FK_expenditure_parameter_values_2` FOREIGN KEY (`expenditure_type_id`) REFERENCES `parameter_values` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT `FK_expenditure_trips` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
) COMMENT='Expenditure'
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. Process types + ref numbering
-- ------------------------------------------------------------
INSERT INTO process_types (process_type_name, description, data_table)
SELECT 'participant_registration', 'Trip/Event Participants', 'participants'
WHERE NOT EXISTS (SELECT 1 FROM process_types WHERE process_type_name = 'participant_registration');

INSERT INTO process_types (process_type_name, description, data_table)
SELECT 'expenditure_creation', 'Trip/Event Expenditure', 'expenditure'
WHERE NOT EXISTS (SELECT 1 FROM process_types WHERE process_type_name = 'expenditure_creation');

INSERT INTO ref_numbering (process_type_id, prefix, initial_serial, next_serial, use_year, use_month, padding)
SELECT pt.id, 'ADV/PAT/', 1, 1, 0, 0, 4
FROM process_types pt
WHERE pt.process_type_name = 'participant_registration'
  AND NOT EXISTS (SELECT 1 FROM ref_numbering WHERE process_type_id = pt.id);

INSERT INTO ref_numbering (process_type_id, prefix, initial_serial, next_serial, use_year, use_month, padding)
SELECT pt.id, 'ADV/EXP/', 1, 1, 0, 0, 4
FROM process_types pt
WHERE pt.process_type_name = 'expenditure_creation'
  AND NOT EXISTS (SELECT 1 FROM ref_numbering WHERE process_type_id = pt.id);

-- ------------------------------------------------------------
-- 4. Menus — retire the old Units of Measure ("Expenditure"
--    label collision from Phase 2), add Participants + the
--    real Expenditure menu, both under Trips (id 10).
-- ------------------------------------------------------------
DELETE FROM menus WHERE id = 12;

INSERT INTO menus (menu_name, parent_menu_id, level, view_path, menu_order, icon, description, is_visible)
SELECT 'Participants',
       m.id,
       2,
       '/stock/participants',
       (SELECT COALESCE(MAX(menu_order), 0) + 1 FROM menus WHERE parent_menu_id = m.id),
       'TeamOutlined',
       'Trip/event participants',
       1
FROM   menus m
WHERE  m.id = 10
  AND  NOT EXISTS (SELECT 1 FROM menus WHERE view_path = '/stock/participants')
LIMIT 1;

INSERT INTO menus (menu_name, parent_menu_id, level, view_path, menu_order, icon, description, is_visible)
SELECT 'Expenditure',
       m.id,
       2,
       '/stock/expenditure',
       (SELECT COALESCE(MAX(menu_order), 0) + 1 FROM menus WHERE parent_menu_id = m.id),
       'WalletOutlined',
       'Trip/event expenditure',
       1
FROM   menus m
WHERE  m.id = 10
  AND  NOT EXISTS (SELECT 1 FROM menus WHERE view_path = '/stock/expenditure')
LIMIT 1;

-- Grant Super Admin + Admin full CRUD on both new menus.
INSERT INTO role_menu_access (role_id, menu_id, can_view, can_create, can_edit, can_delete)
SELECT r.id, m.id, 1, 1, 1, 1
FROM   roles r
JOIN   menus m ON m.view_path IN ('/stock/participants', '/stock/expenditure')
WHERE  r.id IN (1, 2)
  AND  NOT EXISTS (
         SELECT 1 FROM role_menu_access rma WHERE rma.role_id = r.id AND rma.menu_id = m.id
       );
