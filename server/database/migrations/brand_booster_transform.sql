-- ============================================================
-- Brand Booster Transform
-- Adds Advertisers + Campaigns (advertising marketplace) on top
-- of the existing generic engine (Parameters, Process Types,
-- Ref Numbering, Workflow, Menus, Roles). Idempotent — safe to
-- re-run (INSERT IGNORE / NOT EXISTS guards throughout).
-- ============================================================

-- ------------------------------------------------------------
-- 1. New Parameters (all configurable via /config/parameters)
-- ------------------------------------------------------------
INSERT IGNORE INTO `parameters` (`id`, `parameter_name`, `text_id`, `description`, `is_active`) VALUES
  (14, 'Industries',        'industries',        'Business industry sectors',                 1),
  (15, 'Countries',         'countries',          NULL,                                          1),
  (16, 'Counties',          'counties',           NULL,                                          1),
  (17, 'Sub-Counties',      'subcounties',        NULL,                                          1),
  (18, 'Advertising Areas', 'advertising_areas',  'Areas an advertiser covers',                  1),
  (19, 'Campaign Types',    'campaign_types',     NULL,                                          1),
  (20, 'Duration Units',    'duration_units',     'Campaign duration units',                     1),
  (21, 'Target Audience',   'target_audience',    NULL,                                          1);

-- Add "Company" to the existing "Client Types" parameter (id 12) so it reads Company/Individual.
INSERT IGNORE INTO `parameter_values` (`id`, `parameter_id`, `paramater_value`, `description`, `is_active`) VALUES
  (100, 12, 'Company', '', 1);

INSERT IGNORE INTO `parameter_values` (`id`, `parameter_id`, `paramater_value`, `description`, `is_active`) VALUES
  -- Industries (14)
  (101, 14, 'Retail', '', 1),
  (102, 14, 'Hospitality', '', 1),
  (103, 14, 'Real Estate', '', 1),
  (104, 14, 'Technology', '', 1),
  (105, 14, 'Fashion', '', 1),
  (106, 14, 'Food & Beverage', '', 1),
  (107, 14, 'Automotive', '', 1),
  (108, 14, 'Finance & Banking', '', 1),
  (109, 14, 'Education', '', 1),
  (110, 14, 'Health & Wellness', '', 1),
  (111, 14, 'Entertainment & Media', '', 1),
  (112, 14, 'Religious / Non-profit', '', 1),
  (113, 14, 'Other', '', 1),
  -- Countries (15)
  (114, 15, 'Kenya', '', 1),
  (115, 15, 'Uganda', '', 1),
  (116, 15, 'Tanzania', '', 1),
  (117, 15, 'Rwanda', '', 1),
  -- Counties (16) — sample Kenyan counties, expandable via config
  (118, 16, 'Nairobi', '', 1),
  (119, 16, 'Mombasa', '', 1),
  (120, 16, 'Kisumu', '', 1),
  (121, 16, 'Nakuru', '', 1),
  (122, 16, 'Kiambu', '', 1),
  (123, 16, 'Uasin Gishu', '', 1),
  (124, 16, 'Machakos', '', 1),
  (125, 16, 'Kajiado', '', 1),
  -- Sub-Counties (17) — sample Nairobi sub-counties, expandable via config
  (126, 17, 'Westlands', '', 1),
  (127, 17, 'Dagoretti', '', 1),
  (128, 17, 'Langata', '', 1),
  (129, 17, 'Kasarani', '', 1),
  (130, 17, 'Embakasi', '', 1),
  (131, 17, 'Starehe', '', 1),
  (132, 17, 'Roysambu', '', 1),
  -- Advertising Areas (18)
  (133, 18, 'Nairobi CBD', '', 1),
  (134, 18, 'Westlands', '', 1),
  (135, 18, 'Kilimani', '', 1),
  (136, 18, 'Eastlands', '', 1),
  (137, 18, 'Mombasa Island', '', 1),
  (138, 18, 'Nakuru Town', '', 1),
  (139, 18, 'Kisumu Town', '', 1),
  (140, 18, 'Nationwide', '', 1),
  -- Campaign Types (19) — exactly as specified
  (141, 19, 'Product Promotion', '', 1),
  (142, 19, 'Brand Awareness', '', 1),
  (143, 19, 'Event Promotion', '', 1),
  (144, 19, 'Recruitment', '', 1),
  (145, 19, 'Real Estate', '', 1),
  (146, 19, 'Job Vacancy', '', 1),
  (147, 19, 'Hotel Promotion', '', 1),
  (148, 19, 'Church Event', '', 1),
  (149, 19, 'Political Campaign', '', 1),
  (150, 19, 'Music Release', '', 1),
  (151, 19, 'App Promotion', '', 1),
  -- Duration Units (20) — exactly as specified
  (152, 20, 'Years', '', 1),
  (153, 20, 'Months', '', 1),
  (154, 20, 'Weeks', '', 1),
  (155, 20, 'Days', '', 1),
  (156, 20, 'Hours', '', 1),
  -- Target Audience (21)
  (157, 21, 'Students', '', 1),
  (158, 21, 'Office Workers', '', 1),
  (159, 21, 'Families', '', 1),
  (160, 21, 'Youth', '', 1),
  (161, 21, 'Parents', '', 1),
  (162, 21, 'Business Owners', '', 1),
  (163, 21, 'Farmers', '', 1),
  (164, 21, 'Religious Community', '', 1),
  (165, 21, 'Job Seekers', '', 1),
  (166, 21, 'General Public', '', 1);

-- ------------------------------------------------------------
-- 2. Extend `clients` (Business) with the requested fields
-- ------------------------------------------------------------
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clients' AND COLUMN_NAME = 'client_type_id');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `clients`
     ADD COLUMN `client_type_id` INT NULL DEFAULT NULL AFTER `client_ref_no`,
     ADD COLUMN `client_name` VARCHAR(250) NULL DEFAULT NULL AFTER `client_type_id`,
     ADD COLUMN `industry_id` INT NULL DEFAULT NULL AFTER `client_name`,
     ADD COLUMN `country_id` INT NULL DEFAULT NULL AFTER `industry_id`,
     ADD COLUMN `county_id` INT NULL DEFAULT NULL AFTER `country_id`,
     ADD COLUMN `subcounty_id` INT NULL DEFAULT NULL AFTER `county_id`,
     ADD COLUMN `logo_url` VARCHAR(500) NULL DEFAULT NULL AFTER `profile_image`,
     ADD COLUMN `workflow_id` INT NULL DEFAULT NULL,
     ADD COLUMN `workflow_stage_id` INT NULL DEFAULT NULL,
     ADD INDEX `FK_clients_client_type` (`client_type_id`),
     ADD INDEX `FK_clients_industry` (`industry_id`),
     ADD INDEX `FK_clients_country` (`country_id`),
     ADD INDEX `FK_clients_county` (`county_id`),
     ADD INDEX `FK_clients_subcounty` (`subcounty_id`),
     ADD INDEX `FK_clients_workflow` (`workflow_id`),
     ADD INDEX `FK_clients_workflow_stage` (`workflow_stage_id`),
     ADD CONSTRAINT `FK_clients_client_type` FOREIGN KEY (`client_type_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
     ADD CONSTRAINT `FK_clients_industry` FOREIGN KEY (`industry_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
     ADD CONSTRAINT `FK_clients_country` FOREIGN KEY (`country_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
     ADD CONSTRAINT `FK_clients_county` FOREIGN KEY (`county_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
     ADD CONSTRAINT `FK_clients_subcounty` FOREIGN KEY (`subcounty_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
     ADD CONSTRAINT `FK_clients_workflow` FOREIGN KEY (`workflow_id`) REFERENCES `workflows` (`id`) ON DELETE SET NULL,
     ADD CONSTRAINT `FK_clients_workflow_stage` FOREIGN KEY (`workflow_stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE SET NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------
-- 3. New `advertisers` table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `advertisers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `advertiser_ref_no` VARCHAR(50) DEFAULT NULL,
  `full_name` VARCHAR(250) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `country_id` INT DEFAULT NULL,
  `county_id` INT DEFAULT NULL,
  `subcounty_id` INT DEFAULT NULL,
  `avg_status_views` INT DEFAULT NULL,
  `profile_image` VARCHAR(500) DEFAULT NULL,
  `bio` TEXT,
  `areas_to_advertise` JSON DEFAULT NULL,
  `email` VARCHAR(200) DEFAULT NULL,
  `username` VARCHAR(100) DEFAULT NULL,
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('active','inactive','locked','suspended','revoked') DEFAULT 'inactive',
  `workflow_id` INT DEFAULT NULL,
  `workflow_stage_id` INT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `advertiser_ref_no` (`advertiser_ref_no`),
  UNIQUE KEY `username` (`username`),
  INDEX `FK_advertisers_country` (`country_id`),
  INDEX `FK_advertisers_county` (`county_id`),
  INDEX `FK_advertisers_subcounty` (`subcounty_id`),
  INDEX `FK_advertisers_workflow` (`workflow_id`),
  INDEX `FK_advertisers_workflow_stage` (`workflow_stage_id`),
  CONSTRAINT `FK_advertisers_country` FOREIGN KEY (`country_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_advertisers_county` FOREIGN KEY (`county_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_advertisers_subcounty` FOREIGN KEY (`subcounty_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_advertisers_workflow` FOREIGN KEY (`workflow_id`) REFERENCES `workflows` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_advertisers_workflow_stage` FOREIGN KEY (`workflow_stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='WhatsApp status advertisers';

-- ------------------------------------------------------------
-- 4. New `campaigns` table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `campaigns` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `file_no` VARCHAR(250) DEFAULT NULL,
  `client_id` INT NOT NULL,
  `campaign_title` VARCHAR(250) NOT NULL,
  `campaign_type_id` INT DEFAULT NULL,
  `description` TEXT,
  `posters` JSON DEFAULT NULL,
  `attachments` JSON DEFAULT NULL,
  `website_link` VARCHAR(500) DEFAULT NULL,
  `whatsapp_number` VARCHAR(50) DEFAULT NULL,
  `promo_code` VARCHAR(100) DEFAULT NULL,
  `duration_value` INT DEFAULT NULL,
  `duration_unit_id` INT DEFAULT NULL,
  `target_audience` JSON DEFAULT NULL,
  `target_country_id` INT DEFAULT NULL,
  `target_county_id` INT DEFAULT NULL,
  `target_subcounty_id` INT DEFAULT NULL,
  `budget` INT DEFAULT NULL,
  `workflow_id` INT DEFAULT NULL,
  `workflow_stage_id` INT DEFAULT NULL,
  `comments` TEXT,
  `created_by` INT DEFAULT NULL,
  `created_on` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` INT DEFAULT NULL,
  `updated_on` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `FK_campaigns_clients` (`client_id`),
  INDEX `FK_campaigns_campaign_type` (`campaign_type_id`),
  INDEX `FK_campaigns_duration_unit` (`duration_unit_id`),
  INDEX `FK_campaigns_target_country` (`target_country_id`),
  INDEX `FK_campaigns_target_county` (`target_county_id`),
  INDEX `FK_campaigns_target_subcounty` (`target_subcounty_id`),
  INDEX `FK_campaigns_workflow` (`workflow_id`),
  INDEX `FK_campaigns_workflow_stage` (`workflow_stage_id`),
  CONSTRAINT `FK_campaigns_clients` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_campaigns_campaign_type` FOREIGN KEY (`campaign_type_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_campaigns_duration_unit` FOREIGN KEY (`duration_unit_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_campaigns_target_country` FOREIGN KEY (`target_country_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_campaigns_target_county` FOREIGN KEY (`target_county_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_campaigns_target_subcounty` FOREIGN KEY (`target_subcounty_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_campaigns_workflow` FOREIGN KEY (`workflow_id`) REFERENCES `workflows` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_campaigns_workflow_stage` FOREIGN KEY (`workflow_stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Advertising campaigns';

-- ------------------------------------------------------------
-- 5. Process Types + Ref Numbering
-- ------------------------------------------------------------
INSERT IGNORE INTO `process_types` (`id`, `process_type_name`, `description`, `data_table`) VALUES
  (12, 'advertiser_registration', 'WhatsApp status advertiser registration', 'advertisers'),
  (13, 'campaign_creation', 'Advertising campaign creation', 'campaigns');

INSERT IGNORE INTO `ref_numbering` (`process_type_id`, `prefix`, `initial_serial`, `next_serial`, `use_year`, `use_month`, `padding`)
SELECT id, 'ADV/ADR', 1, 1, 0, 0, 4 FROM `process_types` WHERE `process_type_name` = 'advertiser_registration';
INSERT IGNORE INTO `ref_numbering` (`process_type_id`, `prefix`, `initial_serial`, `next_serial`, `use_year`, `use_month`, `padding`)
SELECT id, 'ADV/CMP', 1, 1, 0, 0, 4 FROM `process_types` WHERE `process_type_name` = 'campaign_creation';

-- ------------------------------------------------------------
-- 6. Workflows — Client Registration, Advertiser Registration, Campaign Approval
-- ------------------------------------------------------------

-- 6a. Client Registration Approval
INSERT IGNORE INTO `workflows` (`id`, `workflow_name`, `description`, `process_type_id`, `is_active`)
SELECT 2, 'Client Registration Approval', 'Approval flow for new business/client registrations', id, 1
FROM `process_types` WHERE `process_type_name` = 'client_registration';

INSERT IGNORE INTO `workflow_stages` (`id`, `workflow_id`, `stage_name`, `stage_order`, `is_initial`, `is_terminal`, `stage_color`) VALUES
  (101, 2, 'Submitted', 1, 1, 0, '#1677ff'),
  (102, 2, 'Under Review', 2, 0, 0, '#faad14'),
  (103, 2, 'Approved', 3, 0, 1, '#52c41a'),
  (104, 2, 'Rejected', 4, 0, 1, '#ff4d4f');

INSERT IGNORE INTO `workflow_transitions` (`id`, `workflow_id`, `from_stage_id`, `to_stage_id`, `action_label`) VALUES
  (101, 2, 101, 102, 'Start Review'),
  (102, 2, 102, 103, 'Approve'),
  (103, 2, 102, 104, 'Reject'),
  (104, 2, 101, 104, 'Reject');

-- 6b. Advertiser Registration Approval
INSERT IGNORE INTO `workflows` (`id`, `workflow_name`, `description`, `process_type_id`, `is_active`)
SELECT 3, 'Advertiser Registration Approval', 'Approval flow for new WhatsApp status advertiser registrations', id, 1
FROM `process_types` WHERE `process_type_name` = 'advertiser_registration';

INSERT IGNORE INTO `workflow_stages` (`id`, `workflow_id`, `stage_name`, `stage_order`, `is_initial`, `is_terminal`, `stage_color`) VALUES
  (105, 3, 'Submitted', 1, 1, 0, '#1677ff'),
  (106, 3, 'Under Review', 2, 0, 0, '#faad14'),
  (107, 3, 'Approved', 3, 0, 1, '#52c41a'),
  (108, 3, 'Rejected', 4, 0, 1, '#ff4d4f');

INSERT IGNORE INTO `workflow_transitions` (`id`, `workflow_id`, `from_stage_id`, `to_stage_id`, `action_label`) VALUES
  (105, 3, 105, 106, 'Start Review'),
  (106, 3, 106, 107, 'Approve'),
  (107, 3, 106, 108, 'Reject'),
  (108, 3, 105, 108, 'Reject');

-- 6c. Campaign Approval Workflow
INSERT IGNORE INTO `workflows` (`id`, `workflow_name`, `description`, `process_type_id`, `is_active`)
SELECT 4, 'Campaign Approval Workflow', 'Lifecycle for advertising campaigns from draft to completion', id, 1
FROM `process_types` WHERE `process_type_name` = 'campaign_creation';

INSERT IGNORE INTO `workflow_stages` (`id`, `workflow_id`, `stage_name`, `stage_order`, `is_initial`, `is_terminal`, `stage_color`) VALUES
  (109, 4, 'Draft', 0, 1, 0, '#8c8c8c'),
  (110, 4, 'Submitted for Review', 1, 0, 0, '#1677ff'),
  (111, 4, 'Approved', 2, 0, 0, '#13c2c2'),
  (112, 4, 'Active', 3, 0, 0, '#52c41a'),
  (113, 4, 'Completed', 4, 0, 1, '#2f54eb'),
  (114, 4, 'Rejected', 5, 0, 1, '#ff4d4f'),
  (115, 4, 'Cancelled', 6, 0, 1, '#d9d9d9');

INSERT IGNORE INTO `workflow_transitions` (`id`, `workflow_id`, `from_stage_id`, `to_stage_id`, `action_label`) VALUES
  (109, 4, 109, 110, 'Submit for Review'),
  (110, 4, 110, 111, 'Approve'),
  (111, 4, 110, 114, 'Reject'),
  (112, 4, 111, 112, 'Activate'),
  (113, 4, 112, 113, 'Complete'),
  (114, 4, 109, 115, 'Cancel'),
  (115, 4, 110, 115, 'Cancel'),
  (116, 4, 111, 115, 'Cancel'),
  (117, 4, 112, 115, 'Cancel');

-- ------------------------------------------------------------
-- 7. Menus — new top-level "Advertisers" and "Campaigns"
-- ------------------------------------------------------------
INSERT INTO `menus` (`menu_name`, `parent_menu_id`, `level`, `view_path`, `menu_order`, `icon`, `description`, `is_visible`)
SELECT 'Advertisers', NULL, 1, '/advertisers', 8, 'SolutionOutlined', 'WhatsApp status advertiser accounts', 1
WHERE NOT EXISTS (SELECT 1 FROM `menus` WHERE `view_path` = '/advertisers');

INSERT INTO `menus` (`menu_name`, `parent_menu_id`, `level`, `view_path`, `menu_order`, `icon`, `description`, `is_visible`)
SELECT 'Campaigns', NULL, 1, '/campaigns', 9, 'NotificationOutlined', 'Advertising campaigns', 1
WHERE NOT EXISTS (SELECT 1 FROM `menus` WHERE `view_path` = '/campaigns');

-- Grant Super Admin + Admin full CRUD on both new menus.
INSERT INTO `role_menu_access` (`role_id`, `menu_id`, `can_view`, `can_create`, `can_edit`, `can_delete`)
SELECT r.id, m.id, 1, 1, 1, 1
FROM `roles` r
JOIN `menus` m ON m.view_path IN ('/advertisers', '/campaigns')
WHERE r.id IN (1, 2)
  AND NOT EXISTS (SELECT 1 FROM `role_menu_access` rma WHERE rma.role_id = r.id AND rma.menu_id = m.id);
