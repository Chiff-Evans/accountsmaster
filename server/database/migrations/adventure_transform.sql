-- ============================================================
-- Adventure Management Transform — Phase 1
-- Run once against the venturebrite database.
-- BACK UP THE DATABASE BEFORE RUNNING THIS FILE — it drops
-- tables and truncates data and is not reversible otherwise.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Parameters / Parameter Values (generic config lookups)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `parameters` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `parameter_name` VARCHAR(250) NOT NULL,
  `text_id` VARCHAR(250) NULL DEFAULT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `is_active` TINYINT NULL DEFAULT '1',
  `created_on` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `parameters` (`id`, `parameter_name`, `text_id`, `description`, `is_active`) VALUES
  (1, 'Client Statuses', 'client_statuses', '', 1),
  (2, 'Languages', 'languages', '', 1),
  (3, 'Genders/ Sex', 'genders', NULL, 1),
  (4, 'Identity Types', 'id_types', NULL, 1),
  (5, 'Occupations', 'occupations', NULL, 1),
  (6, 'Participation Statuses', 'participation_stutuses', NULL, 1),
  (7, 'Trip Statuses', 'trip_statuses', NULL, 1),
  (8, 'Currencies', 'currencies', NULL, 1),
  (9, 'Types of Expenditures', 'expenditure_types', NULL, 1),
  (10, 'Trip activities', 'trip_activities', 'Trip inclusions and exclusions', 1),
  (11, 'Client Categories', 'client_categories', NULL, 1),
  (12, 'Client Types', 'client_types', NULL, 1),
  (13, 'Onboarding Statuses', 'onboarding_statuses', NULL, 1);

CREATE TABLE IF NOT EXISTS `parameter_values` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `parameter_id` INT NULL DEFAULT NULL,
  `paramater_value` VARCHAR(250) NULL DEFAULT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `is_active` TINYINT NULL DEFAULT '1',
  `created_on` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_parameter_values_parameters` (`parameter_id`) USING BTREE,
  CONSTRAINT `FK_parameter_values_parameters` FOREIGN KEY (`parameter_id`) REFERENCES `parameters` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `parameter_values` (`id`, `parameter_id`, `paramater_value`, `description`, `is_active`) VALUES
  (1, 1, 'Active', '', 1),
  (2, 1, 'Inactive', '', 1),
  (3, 1, 'Suspended', '', 1),
  (4, 2, 'English', '', 1),
  (5, 4, 'National Identity Card', '', 1),
  (6, 4, 'Passport', NULL, 1),
  (7, 3, 'Male', NULL, 1),
  (8, 3, 'Female', NULL, 1),
  (9, 3, 'Others', NULL, 1),
  (10, 5, 'Software Developer', NULL, 1),
  (11, 5, 'System Administrator', NULL, 1),
  (12, 5, 'Business Administrator', NULL, 1),
  (13, 6, 'Booked', NULL, 1),
  (14, 6, 'Fully Paid', NULL, 1),
  (15, 6, 'Partially Paid', NULL, 1),
  (16, 2, 'Swahili', NULL, 1),
  (17, 7, 'Approved', NULL, 1),
  (18, 7, 'Cancelled', NULL, 1),
  (19, 8, 'KSH', '', 1),
  (22, 9, 'Transport', '', 1),
  (23, 9, 'Photography', '', 1),
  (24, 9, 'Entrance Fee', '', 1),
  (25, 9, 'Food and beverage ', '', 1),
  (26, 10, 'Transport ', '', 1),
  (27, 10, 'Lunch', '', 1),
  (28, 10, 'Proffesinal/Epic photography', '', 1),
  (29, 10, 'Mudfun', '', 1),
  (30, 10, 'Canopy walk', '', 1),
  (31, 10, 'Team building', '', 1),
  (32, 10, 'Zumba dance', '', 1),
  (33, 10, 'Ice breakers', '', 1),
  (34, 10, 'Guide fee', '', 1),
  (35, 10, 'Entrance fee', '', 1),
  (36, 10, 'Snacks', '', 1),
  (37, 10, 'Drinking Water', '', 1),
  (38, 10, 'Anything not in inclusives', '', 1),
  (39, 10, 'Swimming', '', 1),
  (40, 10, 'Meals on halfboard', '', 1),
  (41, 11, 'Adult', 'E.g. Over 12 years', 1),
  (42, 11, 'Kid', 'E.g. Under 12 years', 1),
  (43, 12, 'Individual', '', 1),
  (44, 12, 'Couple', '', 1),
  (45, 12, 'Corporate', '', 1),
  (46, 12, 'Kid', '', 1),
  (47, 8, 'USD', '', 1),
  (48, 13, 'Pending Review', 'Pending Review', 1),
  (49, 13, 'Approved', 'Approved', 1),
  (50, 13, 'Rejected', 'Rejected', 1),
  (51, 1, 'Revoked', 'Revoked', 1),
  (52, 10, 'Boat Riding', 'Boat Riding', 1),
  (53, 10, 'Rock climbing', 'Rock climbing', 1),
  (54, 10, 'Hiking', '', 1),
  (55, 10, 'Mental health Talk ', 'Mental health Talk ', 1),
  (56, 10, 'Fishing', 'Fishing', 1),
  (57, 10, 'Gamings', '', 1);

-- ------------------------------------------------------------
-- 2. Menus — relabel Orders→Bookings, Products→Trips,
--    drop menus for removed POS-only features, add Parameters.
-- ------------------------------------------------------------
UPDATE menus SET menu_name = 'Trips'             WHERE id = 10 AND menu_name = 'Products';
UPDATE menus SET menu_name = 'Trips Catalogue'   WHERE id = 13 AND menu_name = 'Products Catalogue';
UPDATE menus SET menu_name = 'Bookings'          WHERE id = 26 AND menu_name = 'Orders';
UPDATE menus SET menu_name = 'Bookings'          WHERE id = 21 AND menu_name = 'Orders';

-- Suppliers (parent+child), Stock Entry, Price Management, Daily Orders.
-- role_menu_access rows cascade-delete automatically (ON DELETE CASCADE on menu_id).
DELETE FROM menus WHERE id IN (14, 15, 19, 20, 25);

INSERT INTO menus (menu_name, parent_menu_id, level, view_path, menu_order, icon, description, is_visible)
SELECT 'Parameters',
       m.id,
       2,
       '/config/parameters',
       (SELECT COALESCE(MAX(menu_order), 0) + 1 FROM menus WHERE parent_menu_id = m.id),
       'ControlOutlined',
       'Generic configuration lookups (parameters and their values)',
       1
FROM   menus m
WHERE  m.menu_name = 'Configurations'
  AND  m.parent_menu_id IS NULL
  AND  NOT EXISTS (SELECT 1 FROM menus WHERE view_path = '/config/parameters')
LIMIT 1;

-- Grant Super Admin + Admin full CRUD on the new Parameters menu.
INSERT INTO role_menu_access (role_id, menu_id, can_view, can_create, can_edit, can_delete)
SELECT r.id, m.id, 1, 1, 1, 1
FROM   roles r
JOIN   menus m ON m.view_path = '/config/parameters'
WHERE  r.id IN (1, 2)
  AND  NOT EXISTS (
         SELECT 1 FROM role_menu_access rma WHERE rma.role_id = r.id AND rma.menu_id = m.id
       );

-- ------------------------------------------------------------
-- 3. Process types / ref numbering for removed features
-- ------------------------------------------------------------
DELETE FROM ref_numbering WHERE process_type_id IN (3, 5);
DELETE FROM process_types WHERE id IN (3, 5);

-- ------------------------------------------------------------
-- 4. Drop POS-only tables and clear grocery-era data.
--    Structures for items/categories/units/orders/order_items
--    are kept; clients/shops/business/users/roles are untouched.
-- ------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS supplier_items;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS stock;
DROP TABLE IF EXISTS prices;

TRUNCATE TABLE order_receipts;
TRUNCATE TABLE loyalty_points;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE items;
TRUNCATE TABLE categories;
TRUNCATE TABLE units;

SET FOREIGN_KEY_CHECKS = 1;
