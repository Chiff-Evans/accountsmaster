-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.26 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.17.0.7270
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table accountsmaster.business
CREATE TABLE IF NOT EXISTS `business` (
  `id` int NOT NULL AUTO_INCREMENT,
  `business_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `incorporation_date` date DEFAULT NULL,
  `logo` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table accountsmaster.business: ~0 rows (approximately)
INSERT INTO `business` (`id`, `business_name`, `owner_name`, `email`, `phone`, `location`, `incorporation_date`, `logo`, `created_at`, `updated_at`) VALUES
	(1, 'MB Alumni', 'Evanson Muchai', 'arapchiff@gmail.com', '+254746210500', NULL, '2026-09-01', NULL, '2026-05-06 12:29:31', '2026-10-21 09:43:19');

-- Dumping structure for table accountsmaster.business_shareholders
CREATE TABLE IF NOT EXISTS `business_shareholders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `business_id` int NOT NULL,
  `shareholder_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shares_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `shares_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_sh_business` (`business_id`),
  CONSTRAINT `fk_sh_business` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table accountsmaster.business_shareholders: ~1 rows (approximately)
INSERT INTO `business_shareholders` (`id`, `business_id`, `shareholder_name`, `role`, `id_number`, `phone`, `email`, `shares_percent`, `shares_amount`, `created_at`) VALUES
	(1, 1, 'Shareholder\'s One Name', 'Owner', '000000000', '0746210500', NULL, 100.00, 300000.00, '2026-06-24 17:05:12');

-- Dumping structure for table accountsmaster.contribution_rates
CREATE TABLE IF NOT EXISTS `contribution_rates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `time_unit_id` int NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `active_flag` tinyint GENERATED ALWAYS AS (if((`is_active` = 1),1,NULL)) STORED,
  `created_by` int DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_contribution_rates_single_active` (`active_flag`),
  KEY `FK_contribution_rates_time_unit` (`time_unit_id`),
  CONSTRAINT `FK_contribution_rates_time_unit` FOREIGN KEY (`time_unit_id`) REFERENCES `parameter_values` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_contribution_rates_dates` CHECK (((`end_date` is null) or (`end_date` >= `start_date`)))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Member contribution rates';

-- Dumping data for table accountsmaster.contribution_rates: ~2 rows (approximately)
INSERT INTO `contribution_rates` (`id`, `time_unit_id`, `amount`, `start_date`, `end_date`, `is_active`, `created_by`, `created_on`, `updated_by`, `updated_on`) VALUES
	(3, 23, 750.00, '2024-04-01', '2026-12-31', 0, 1, '2026-10-22 14:44:32', NULL, '2026-10-22 14:57:59'),
	(7, 23, 1000.00, '2026-10-22', NULL, 1, 1, '2026-10-22 14:57:59', 1, '2026-10-22 16:27:07'),
	(8, 22, 2000.00, '2026-10-22', NULL, 0, 1, '2026-10-22 16:25:51', NULL, '2026-10-22 16:27:07');

-- Dumping structure for table accountsmaster.dashboard_visibility
CREATE TABLE IF NOT EXISTS `dashboard_visibility` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `section_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_visible` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_role_section` (`role_id`,`section_key`),
  CONSTRAINT `dashboard_visibility_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=210 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table accountsmaster.dashboard_visibility: ~4 rows (approximately)
INSERT INTO `dashboard_visibility` (`id`, `role_id`, `section_key`, `is_visible`) VALUES
	(113, 2, 'stat_members', 1),
	(117, 2, 'chart_trend', 1),
	(135, 1, 'stat_members', 1),
	(139, 1, 'chart_trend', 1);

-- Dumping structure for table accountsmaster.email_verification_codes
CREATE TABLE IF NOT EXISTS `email_verification_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `audience` enum('brand_ambassador','member') COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` int NOT NULL DEFAULT '0',
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `expires_at` timestamp NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email_verification_lookup` (`audience`,`email`,`created_on`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table accountsmaster.email_verification_codes: ~5 rows (approximately)
INSERT INTO `email_verification_codes` (`id`, `audience`, `email`, `code`, `attempts`, `verified`, `expires_at`, `created_on`) VALUES
	(3, 'brand_ambassador', 'evansarapchiff254@gmail.com', '203651', 1, 0, '2026-09-25 16:11:28', '2026-09-25 16:01:28'),
	(4, 'brand_ambassador', 'evansonmuchai2016@gmail.com', '512769', 1, 0, '2026-09-25 16:17:51', '2026-09-25 16:07:51'),
	(5, 'brand_ambassador', 'arapchiff@gmail.com', '470526', 0, 0, '2026-09-25 16:40:51', '2026-09-25 16:25:51'),
	(6, 'brand_ambassador', 'evansonmuchai2016@gmail.com', '741028', 0, 1, '2026-09-29 12:24:16', '2026-09-29 12:09:16'),
	(7, 'brand_ambassador', 'evansarapchiff254@gmail.com', '451429', 0, 0, '2026-10-01 15:18:47', '2026-10-01 15:03:47');

-- Dumping structure for table accountsmaster.expenditure
CREATE TABLE IF NOT EXISTS `expenditure` (
  `id` int NOT NULL AUTO_INCREMENT,
  `file_no` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `campaign_id` int DEFAULT NULL,
  `expenditure_type_id` int DEFAULT NULL,
  `currency_id` int DEFAULT NULL,
  `amount` int DEFAULT NULL,
  `reference` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expenditure_date` date DEFAULT NULL,
  `done_by` int DEFAULT NULL,
  `comments` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_expenditure_parameter_values` (`currency_id`) USING BTREE,
  KEY `FK_expenditure_parameter_values_2` (`expenditure_type_id`) USING BTREE,
  KEY `FK_expenditure_campaigns` (`campaign_id`),
  CONSTRAINT `FK_expenditure_campaigns` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_expenditure_parameter_values` FOREIGN KEY (`currency_id`) REFERENCES `parameter_values` (`id`),
  CONSTRAINT `FK_expenditure_parameter_values_2` FOREIGN KEY (`expenditure_type_id`) REFERENCES `parameter_values` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Expenditure';

-- Dumping data for table accountsmaster.expenditure: ~2 rows (approximately)
INSERT INTO `expenditure` (`id`, `file_no`, `campaign_id`, `expenditure_type_id`, `currency_id`, `amount`, `reference`, `expenditure_date`, `done_by`, `comments`, `created_by`, `created_on`, `updated_by`, `updated_on`) VALUES
	(1, 'EXP-0001', 2, 24, 19, 5000, NULL, '2026-09-14', 1, NULL, 1, '2026-09-14 17:08:04', NULL, '2026-09-14 17:08:42'),
	(2, 'EXP-0002', 3, 24, 19, 3000, NULL, '2026-09-17', 1, NULL, 1, '2026-09-17 15:03:38', NULL, '2026-09-17 15:05:18');

-- Dumping structure for table accountsmaster.loyalty_config
CREATE TABLE IF NOT EXISTS `loyalty_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `min_sale_amount` decimal(12,2) NOT NULL DEFAULT '500.00',
  `amount_per_point` decimal(10,2) NOT NULL DEFAULT '100.00',
  `qualifying_stage_id` int DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_lc_stage` (`qualifying_stage_id`),
  CONSTRAINT `fk_lc_stage` FOREIGN KEY (`qualifying_stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table accountsmaster.loyalty_config: ~0 rows (approximately)
INSERT INTO `loyalty_config` (`id`, `min_sale_amount`, `amount_per_point`, `qualifying_stage_id`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 1000.00, 1000.00, NULL, 1, '2026-06-15 13:02:25', '2026-08-27 14:59:47');

-- Dumping structure for table accountsmaster.loyalty_points
CREATE TABLE IF NOT EXISTS `loyalty_points` (
  `id` int NOT NULL AUTO_INCREMENT,
  `member_id` int NOT NULL,
  `order_id` int DEFAULT NULL COMMENT 'legacy ÃƒÆ’Ã¢â‚¬ÂÃƒÆ’Ã¢â‚¬Â¡ÃƒÆ’Ã‚Â¶ was a bookings.id, table removed',
  `campaign_id` int DEFAULT NULL,
  `points` int NOT NULL DEFAULT '0',
  `order_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lp_campaign` (`campaign_id`),
  KEY `fk_lp_client` (`member_id`),
  CONSTRAINT `fk_lp_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lp_client` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table accountsmaster.loyalty_points: ~3 rows (approximately)

-- Dumping structure for table accountsmaster.member_next_of_kin
CREATE TABLE IF NOT EXISTS `member_next_of_kin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `member_id` int NOT NULL,
  `kin_ref_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kin_name` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `relationship_id` int DEFAULT NULL,
  `id_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kin_ref_no` (`kin_ref_no`),
  KEY `FK_next_of_kin_member` (`member_id`),
  KEY `FK_next_of_kin_relationship` (`relationship_id`),
  CONSTRAINT `FK_next_of_kin_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_next_of_kin_relationship` FOREIGN KEY (`relationship_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Next of kin per member';

-- Dumping data for table accountsmaster.member_next_of_kin: ~4 rows (approximately)
INSERT INTO `member_next_of_kin` (`id`, `member_id`, `kin_ref_no`, `kin_name`, `relationship_id`, `id_number`, `phone`, `email`, `created_by`, `created_on`, `updated_by`, `updated_on`) VALUES
	(2, 15, 'NOK-0001', 'Mary Geoges', 10, NULL, '0726262222', NULL, 1, '2026-10-19 16:06:29', NULL, '2026-10-19 16:13:18'),
	(3, 15, 'NOK-0002', 'Dennis Honey', 11, NULL, NULL, NULL, 1, '2026-10-19 16:06:54', NULL, '2026-10-19 16:13:18'),
	(5, 3, 'NOK-0003', 'John Doe', 10, NULL, NULL, NULL, 1, '2026-10-19 16:15:31', NULL, NULL),
	(6, 12, 'NOK-0004', 'Dennis Rebman', 11, '2233', '9891222', 'email@example.com', 1, '2026-10-22 10:28:42', 1, '2026-10-22 10:30:07');

-- Dumping structure for table accountsmaster.members
CREATE TABLE IF NOT EXISTS `members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `member_ref_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `member_name` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position_id` int DEFAULT NULL,
  `id_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `firstname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender_id` int DEFAULT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reg_date` date DEFAULT NULL,
  `reg_fee` decimal(12,2) DEFAULT NULL,
  `other_details` text COLLATE utf8mb4_unicode_ci,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','locked','suspended','revoked') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `loyalty_points` int NOT NULL DEFAULT '0',
  `workflow_id` int DEFAULT NULL,
  `workflow_stage_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_ref_no` (`member_ref_no`),
  UNIQUE KEY `username` (`username`),
  KEY `FK_clients_workflow` (`workflow_id`),
  KEY `FK_clients_workflow_stage` (`workflow_stage_id`),
  KEY `FK_members_position` (`position_id`),
  KEY `FK_members_gender` (`gender_id`),
  CONSTRAINT `FK_clients_workflow` FOREIGN KEY (`workflow_id`) REFERENCES `workflows` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_clients_workflow_stage` FOREIGN KEY (`workflow_stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_members_gender` FOREIGN KEY (`gender_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_members_position` FOREIGN KEY (`position_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table accountsmaster.members: ~5 rows (approximately)
INSERT INTO `members` (`id`, `member_ref_no`, `member_name`, `position_id`, `id_number`, `firstname`, `lastname`, `gender_id`, `phone`, `email`, `reg_date`, `reg_fee`, `other_details`, `username`, `password_hash`, `profile_image`, `logo_url`, `status`, `created_at`, `updated_at`, `loyalty_points`, `workflow_id`, `workflow_stage_id`) VALUES
	(1, 'ADV/CLT-0001', 'Nebuzaradan Duke', NULL, NULL, 'Nebuzaradan Duke', '', NULL, '0746210500', 'example@hotmail.com', NULL, NULL, NULL, 'example@hotmail.com', '$2a$10$DfDgyjLZiJN.H8qNnL81v.FCrsYnFdLrsEFECLoWy/TUocEG1TYve', NULL, NULL, 'active', '2026-06-15 10:38:35', '2026-10-22 16:37:23', 14, NULL, NULL),
	(2, 'ADV/CLT-0002', 'Jonathan David', NULL, NULL, 'Jonathan David', '', NULL, '0745098765', NULL, NULL, NULL, NULL, 'jonathan', '$2a$10$yWALXJ8vgkGvyU1k3/2koepR6V/Ll8s4Atb09GuA4M0ujM04QGgCi', NULL, NULL, 'active', '2026-08-14 16:17:51', '2026-10-22 16:36:42', 75, NULL, NULL),
	(3, 'ADV/CLT-0003', 'Sarah Abraham\'s', NULL, NULL, 'Sarah Abraham\'s', '', NULL, '0714325652', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/advertisers/client_1789399539418.png', 'active', '2026-08-14 16:18:22', '2026-10-22 16:38:23', 2, NULL, NULL),
	(12, 'ADV/CLT-0005', 'Chiff Evans', 4, NULL, 'Chiff Evans', '', 7, NULL, NULL, NULL, 0.00, NULL, 'evanson', '$2a$10$laoexyfieubv50ID6YDCxOKqCcPCcPn6GoRaFmdYqpn1wwMnkIWg2', NULL, NULL, 'active', '2026-09-14 15:27:47', '2026-10-22 16:38:45', 0, 2, 103),
	(15, 'MEM-0006', 'Francis Georges', 4, '1000', 'Francis Georges', '', 7, NULL, NULL, '2026-10-19', 0.00, NULL, NULL, NULL, NULL, NULL, 'active', '2026-10-19 15:52:46', '2026-10-19 16:05:53', 0, 2, 103);

-- Dumping structure for table accountsmaster.menus
CREATE TABLE IF NOT EXISTS `menus` (
  `id` int NOT NULL AUTO_INCREMENT,
  `menu_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_menu_id` int DEFAULT NULL,
  `level` int DEFAULT '1',
  `view_path` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `menu_order` int DEFAULT '0',
  `icon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_visible` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `parent_menu_id` (`parent_menu_id`),
  CONSTRAINT `menus_ibfk_1` FOREIGN KEY (`parent_menu_id`) REFERENCES `menus` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table accountsmaster.menus: ~23 rows (approximately)
INSERT INTO `menus` (`id`, `menu_name`, `parent_menu_id`, `level`, `view_path`, `menu_order`, `icon`, `description`, `is_visible`, `created_at`, `updated_at`) VALUES
	(1, 'Dashboard', NULL, 1, '/dashboard', 0, 'DashboardOutlined', 'Main dashboard', 1, '2026-05-06 12:29:31', '2026-05-11 10:20:23'),
	(2, 'Configurations', NULL, 1, NULL, 7, 'SettingOutlined', 'System configurations', 1, '2026-05-06 12:29:31', '2026-08-20 13:49:23'),
	(3, 'Business Setup', 2, 2, '/config/business', 0, 'ShopOutlined', 'Business information', 1, '2026-05-06 12:29:31', '2026-05-06 12:29:31'),
	(4, 'System Menus', 2, 2, '/config/menus', 1, 'MenuOutlined', 'Manage menus', 1, '2026-05-06 12:29:31', '2026-05-11 10:22:29'),
	(5, 'Groups', 8, 2, '/config/roles', 2, 'TeamOutlined', 'Manage roles', 1, '2026-05-06 12:29:31', '2026-08-14 16:23:29'),
	(6, 'Process Types', 2, 2, '/config/process-types', 3, 'ApartmentOutlined', 'Manage process types', 1, '2026-05-06 12:29:31', '2026-05-06 12:29:31'),
	(7, 'Ref Numbering', 2, 2, '/config/ref-numbering', 4, 'NumberOutlined', 'Reference numbering', 1, '2026-05-06 12:29:31', '2026-05-06 12:29:31'),
	(8, 'Users and Roles', NULL, 1, NULL, 6, 'UserOutlined', 'User administration', 1, '2026-05-06 12:29:31', '2026-08-20 14:01:56'),
	(9, 'Users', 8, 2, '/users', 0, 'UserAddOutlined', 'Manage users', 1, '2026-05-06 12:29:31', '2026-05-06 12:29:31'),
	(16, 'Stake-Holders', NULL, 1, NULL, 3, 'BankOutlined', 'Member management', 1, '2026-05-06 12:29:31', '2026-10-19 14:54:08'),
	(17, 'Members', 16, 2, '/members', 1, 'IdcardOutlined', 'Manage members', 1, '2026-05-06 12:29:31', '2026-10-19 14:54:08'),
	(22, ' Dashboard', 8, 2, '/config/dashboard', 3, 'DashboardOutlined', ' Dashboard Configurations', 1, '2026-05-07 15:43:24', '2026-05-14 09:05:00'),
	(23, 'Workflows', 2, 2, '/config/workflows', 6, 'BranchesOutlined', NULL, 1, '2026-05-13 12:47:04', '2026-09-15 10:10:45'),
	(27, 'Reporting', NULL, 1, NULL, 5, 'BarChartOutlined', NULL, 1, '2026-06-02 16:48:24', '2026-08-20 14:02:03'),
	(28, 'Financial Report', 27, 2, '/reports/finance', 1, 'LineChartOutlined', 'Deposits, withdrawals and registration fees', 1, '2026-06-02 16:48:24', '2026-10-19 17:08:27'),
	(29, 'Loyalty Points', 2, 2, '/config/loyalty', 15, 'TrophyOutlined', NULL, 0, '2026-06-15 13:02:25', '2026-09-28 15:45:13'),
	(30, 'Parameters', 2, 2, '/config/parameters', 16, 'ControlOutlined', 'Generic configuration lookups (parameters and their values)', 1, '2026-08-13 15:58:01', '2026-08-13 15:58:01'),
	(31, 'Accounts', NULL, 1, NULL, 2, 'DollarOutlined', NULL, 1, '2026-08-14 10:04:36', '2026-09-29 12:27:56'),
	(33, 'Expenditure', 31, 2, '/stock/expenditure', 2, 'WalletOutlined', 'Trip/event expenditure', 0, '2026-08-14 13:12:42', '2026-10-19 16:05:02'),
	(35, 'Transactions', 31, 1, '/transactions', 9, 'TransactionOutlined', 'Record member transactions', 1, '2026-09-14 12:26:47', '2026-10-19 16:03:38'),
	(40, 'Targets', 2, 2, '/config/targets', 17, 'AimOutlined', 'Target amounts by date', 1, '2026-10-19 16:31:06', '2026-10-19 16:31:06'),
	(41, 'Statistics', 16, 2, '/members/statistics', 2, 'BarChartOutlined', 'Member contributions against the active target', 1, '2026-10-19 16:52:05', '2026-10-19 16:52:05'),
	(42, 'Contribution Rates', 2, 2, '/config/contribution-rates', 18, 'CalculatorOutlined', 'Contribution amount per time unit', 1, '2026-10-22 14:20:04', '2026-10-22 14:20:04');

-- Dumping structure for table accountsmaster.notification_preferences
CREATE TABLE IF NOT EXISTS `notification_preferences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `audience` enum('mis','brand_ambassador','member') COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_id` int NOT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `push_enabled` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_notification_pref` (`audience`,`recipient_id`,`type`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Per-recipient opt-out of individual notification types';

-- Dumping data for table accountsmaster.notification_preferences: ~2 rows (approximately)
INSERT INTO `notification_preferences` (`id`, `audience`, `recipient_id`, `type`, `enabled`, `push_enabled`) VALUES
	(1, 'brand_ambassador', 5, 'proof_reviewed', 1, 1),
	(3, 'mis', 1, 'member_registered', 1, 1);

-- Dumping structure for table accountsmaster.notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `audience` enum('mis','brand_ambassador','member') COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_id` int NOT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_notifications_recipient` (`audience`,`recipient_id`,`is_read`) USING BTREE,
  KEY `idx_notifications_created` (`created_on`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='In-app notification bell entries for advertisers, clients and MIS staff';

-- Dumping data for table accountsmaster.notifications: ~70 rows (approximately)
INSERT INTO `notifications` (`id`, `audience`, `recipient_id`, `type`, `title`, `body`, `url`, `is_read`, `created_on`) VALUES
	(8, 'mis', 1, 'member_registered', 'New advertiser registration', 'Anna Pamela (ADV-0004) registered and is awaiting review.', '/advertisers', 1, '2026-09-25 15:23:08'),
	(9, 'mis', 6, 'member_registered', 'New advertiser registration', 'Anna Pamela (ADV-0004) registered and is awaiting review.', '/advertisers', 0, '2026-09-25 15:23:08'),
	(10, 'brand_ambassador', 6, 'registration_reviewed', 'Registration Approved', 'Your advertiser registration has been approved ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â you can now log in to the portal.', '/advertiser/profile', 1, '2026-09-25 15:24:05'),
	(11, 'brand_ambassador', 6, 'campaign_assigned', 'Assigned to a campaign', 'You\'ve been assigned to run "Jonathan David\'s Youtube Channel".', '/advertiser/campaigns', 1, '2026-09-25 15:24:58'),
	(12, 'brand_ambassador', 5, 'campaign_assigned', 'Assigned to a campaign', 'You\'ve been assigned to run "Jonathan David\'s Youtube Channel".', '/advertiser/campaigns', 1, '2026-09-25 15:26:30'),
	(13, 'mis', 6, 'proof_submitted', 'New posting proof submitted', 'Anna Pamela submitted a proof for "Jonathan David\'s Youtube Channel" (2026-09-25).', '/campaigns/proof-review', 0, '2026-09-25 15:28:17'),
	(14, 'mis', 1, 'proof_submitted', 'New posting proof submitted', 'Anna Pamela submitted a proof for "Jonathan David\'s Youtube Channel" (2026-09-25).', '/campaigns/proof-review', 1, '2026-09-25 15:28:17'),
	(15, 'brand_ambassador', 6, 'proof_reviewed', 'Posting proof Accepted', 'Your proof for "Jonathan David\'s Youtube Channel" (2026-09-25) was Accepted.', '/advertiser/campaigns', 1, '2026-09-25 15:28:24'),
	(16, 'brand_ambassador', 6, 'proof_reviewed', 'Posting proof reverted to Pending', 'Your proof for "Jonathan David\'s Youtube Channel" (2026-09-25) was reverted to Pending.', '/advertiser/campaigns', 1, '2026-09-25 15:37:19'),
	(17, 'brand_ambassador', 6, 'proof_reviewed', 'Posting proof Rejected', 'Your proof for "Jonathan David\'s Youtube Channel" (2026-09-25) was rejected: Rejected', '/advertiser/campaigns', 1, '2026-09-25 15:37:44'),
	(18, 'mis', 6, 'proof_submitted', 'New posting proof submitted', 'Anna Pamela submitted a proof for "Jonathan David\'s Youtube Channel" (2026-09-25).', '/campaigns/proof-review', 0, '2026-09-25 15:39:01'),
	(19, 'mis', 1, 'proof_submitted', 'New posting proof submitted', 'Anna Pamela submitted a proof for "Jonathan David\'s Youtube Channel" (2026-09-25).', '/campaigns/proof-review', 1, '2026-09-25 15:39:01'),
	(20, 'brand_ambassador', 6, 'proof_reviewed', 'Posting proof Accepted', 'Your proof for "Jonathan David\'s Youtube Channel" (2026-09-25) was Accepted.', '/advertiser/campaigns', 1, '2026-09-25 15:39:24'),
	(21, 'mis', 6, 'member_registered', 'New advertiser registration', 'Test User (ADV-0005) registered and is awaiting review.', '/advertisers', 0, '2026-09-25 15:55:19'),
	(22, 'mis', 1, 'member_registered', 'New advertiser registration', 'Test User (ADV-0005) registered and is awaiting review.', '/advertisers', 1, '2026-09-25 15:55:19'),
	(23, 'mis', 6, 'proof_submitted', 'New posting proof submitted', 'Splane Muchai submitted a proof for "New System Awareness" (2026-09-23).', '/campaigns/proof-review', 0, '2026-09-28 12:19:41'),
	(24, 'mis', 1, 'proof_submitted', 'New posting proof submitted', 'Splane Muchai submitted a proof for "New System Awareness" (2026-09-23).', '/campaigns/proof-review', 1, '2026-09-28 12:19:41'),
	(25, 'mis', 6, 'proof_submitted', 'New posting proof submitted', 'Splane Muchai submitted a proof for "New System Awareness" (2026-09-22).', '/campaigns/proof-review', 0, '2026-09-28 14:24:08'),
	(26, 'mis', 1, 'proof_submitted', 'New posting proof submitted', 'Splane Muchai submitted a proof for "New System Awareness" (2026-09-22).', '/campaigns/proof-review', 1, '2026-09-28 14:24:08'),
	(27, 'mis', 1, 'proof_submitted', 'New posting proof submitted', 'Splane Muchai submitted a proof for "New System Awareness" (2026-09-24).', '/campaigns/proof-review', 1, '2026-09-28 14:24:25'),
	(28, 'mis', 6, 'proof_submitted', 'New posting proof submitted', 'Splane Muchai submitted a proof for "New System Awareness" (2026-09-24).', '/campaigns/proof-review', 0, '2026-09-28 14:24:25'),
	(29, 'mis', 1, 'proof_submitted', 'New posting proof submitted', 'Splane Muchai submitted a proof for "New System Awareness" (2026-09-25).', '/campaigns/proof-review', 1, '2026-09-28 14:24:44'),
	(30, 'mis', 6, 'proof_submitted', 'New posting proof submitted', 'Splane Muchai submitted a proof for "New System Awareness" (2026-09-25).', '/campaigns/proof-review', 0, '2026-09-28 14:24:44'),
	(31, 'mis', 1, 'proof_submitted', 'New posting proof submitted', 'Splane Muchai submitted a proof for "Sample Campaign" (2026-09-25).', '/campaigns/proof-review', 1, '2026-09-28 14:25:11'),
	(32, 'mis', 6, 'proof_submitted', 'New posting proof submitted', 'Splane Muchai submitted a proof for "Sample Campaign" (2026-09-25).', '/campaigns/proof-review', 0, '2026-09-28 14:25:11'),
	(33, 'brand_ambassador', 3, 'proof_reviewed', 'Posting proof Accepted', 'Your proof for "Sample Campaign" (2026-09-25) was Accepted.', '/advertiser/campaigns', 1, '2026-09-28 14:25:34'),
	(34, 'brand_ambassador', 3, 'proof_reviewed', 'Posting proof Accepted', 'Your proof for "New System Awareness" (2026-09-25) was Accepted.', '/advertiser/campaigns', 1, '2026-09-28 14:25:35'),
	(35, 'brand_ambassador', 3, 'proof_reviewed', 'Posting proof Rejected', 'Your proof for "New System Awareness" (2026-09-24) was rejected: Rejected', '/advertiser/campaigns', 1, '2026-09-28 14:25:59'),
	(36, 'brand_ambassador', 3, 'proof_reviewed', 'Posting proof Accepted', 'Your proof for "New System Awareness" (2026-09-22) was Accepted.', '/advertiser/campaigns', 1, '2026-09-28 14:26:14'),
	(37, 'brand_ambassador', 3, 'proof_reviewed', 'Posting proof Accepted', 'Your proof for "New System Awareness" (2026-09-23) was Accepted.', '/advertiser/campaigns', 1, '2026-09-28 14:26:28'),
	(38, 'mis', 1, 'proof_submitted', 'New posting proof submitted', 'Splane Muchai submitted a proof for "New System Awareness" (2026-09-24).', '/campaigns/proof-review', 1, '2026-09-28 14:28:38'),
	(39, 'mis', 6, 'proof_submitted', 'New posting proof submitted', 'Splane Muchai submitted a proof for "New System Awareness" (2026-09-24).', '/campaigns/proof-review', 0, '2026-09-28 14:28:38'),
	(40, 'brand_ambassador', 3, 'proof_reviewed', 'Posting proof Accepted', 'Your proof for "New System Awareness" (2026-09-24) was Accepted.', '/advertiser/campaigns', 1, '2026-09-28 14:28:49'),
	(41, 'brand_ambassador', 5, 'salary_paid', 'Salary payment recorded', 'A payment of 240.54 was recorded for "Pevans Cereals Shop Awareness".', '/advertiser/campaigns', 1, '2026-09-28 14:44:51'),
	(42, 'brand_ambassador', 1, 'salary_paid', 'Salary payment recorded', 'A payment of 546.74 was recorded for "Pevans Cereals Shop Awareness".', '/advertiser/campaigns', 0, '2026-09-28 14:44:54'),
	(43, 'brand_ambassador', 3, 'salary_paid', 'Salary payment recorded', 'A payment of 712.72 was recorded for "Pevans Cereals Shop Awareness".', '/advertiser/campaigns', 0, '2026-09-28 14:44:58'),
	(44, 'mis', 1, 'member_registered', 'New advertiser registration', 'Joshua (ADV-0005) registered and is awaiting review.', '/advertisers', 1, '2026-09-29 12:11:45'),
	(45, 'mis', 6, 'member_registered', 'New advertiser registration', 'Joshua (ADV-0005) registered and is awaiting review.', '/advertisers', 0, '2026-09-29 12:11:45'),
	(46, 'mis', 6, 'proof_submitted', 'New posting proof submitted', 'Anna Pamela submitted a proof for "Jonathan David\'s Youtube Channel" (2026-09-26).', '/campaigns/proof-review', 0, '2026-09-29 15:24:23'),
	(47, 'mis', 1, 'proof_submitted', 'New posting proof submitted', 'Anna Pamela submitted a proof for "Jonathan David\'s Youtube Channel" (2026-09-26).', '/campaigns/proof-review', 1, '2026-09-29 15:24:23'),
	(48, 'brand_ambassador', 6, 'proof_reviewed', 'Posting proof Accepted', 'Your proof for "Jonathan David\'s Youtube Channel" (2026-09-26) was Accepted.', '/advertiser/campaigns', 1, '2026-09-29 15:25:01'),
	(49, 'member', 2, 'campaign_stage_changed', 'Campaign Completed', '"CMP-2026-09-0004" is now "Completed".', '/campaigns', 1, '2026-09-29 15:25:41'),
	(50, 'brand_ambassador', 6, 'campaign_assigned', 'Assigned to a campaign', 'You\'ve been assigned to run "Sample Campaign".', '/advertiser/campaigns', 1, '2026-09-30 08:11:14'),
	(51, 'member', 1, 'campaign_stage_changed', 'Campaign Reviewing', '"CMP-2026-09-0005" is now "Reviewing".', '/campaigns', 0, '2026-09-30 09:36:51'),
	(52, 'member', 1, 'campaign_stage_changed', 'Campaign Approved', '"CMP-2026-09-0005" is now "Approved".', '/campaigns', 0, '2026-09-30 09:36:58'),
	(53, 'member', 1, 'campaign_stage_changed', 'Campaign Payment Requested', '"CMP-2026-09-0005" is now "Payment Requested".', '/campaigns', 0, '2026-09-30 09:37:25'),
	(54, 'member', 1, 'campaign_stage_changed', 'Campaign Payment Done', '"CMP-2026-09-0005" is now "Payment Done".', '/campaigns', 0, '2026-09-30 09:39:53'),
	(55, 'member', 1, 'campaign_stage_changed', 'Campaign Active', '"CMP-2026-09-0005" is now "Active".', '/campaigns', 0, '2026-09-30 09:40:02'),
	(56, 'brand_ambassador', 6, 'campaign_assigned', 'Assigned to a campaign', 'You\'ve been assigned to run "Venture Brite Information System Awareness".', '/advertiser/campaigns', 1, '2026-09-30 09:40:20'),
	(57, 'brand_ambassador', 8, 'registration_reviewed', 'Registration Approved', 'Your brand ambassador registration has been approved â€” you can now log in to the portal.', '/brand-ambassador/profile', 1, '2026-10-01 16:21:31'),
	(58, 'brand_ambassador', 8, 'registration_reviewed', 'Registration Approved', 'Your brand ambassador registration has been approved â€” you can now log in to the portal.', '/brand-ambassador/profile', 0, '2026-10-01 16:48:04'),
	(59, 'brand_ambassador', 8, 'registration_reviewed', 'Registration Approved', 'Your brand ambassador registration has been approved â€” you can now log in to the portal.', '/brand-ambassador/profile', 0, '2026-10-01 16:49:11'),
	(60, 'mis', 1, 'campaign_submitted', 'New campaign submitted', 'A campaign was submitted for review from the advertiser portal.', '/campaigns', 1, '2026-10-01 17:05:18'),
	(61, 'mis', 6, 'campaign_submitted', 'New campaign submitted', 'A campaign was submitted for review from the advertiser portal.', '/campaigns', 0, '2026-10-01 17:05:18'),
	(62, 'member', 2, 'campaign_stage_changed', 'Campaign Approved', '"Campaign" is now "Approved".', '/campaigns', 1, '2026-10-01 17:07:42'),
	(63, 'member', 2, 'campaign_stage_changed', 'Campaign Reviewing', '"Campaign" is now "Reviewing".', '/campaigns', 1, '2026-10-01 17:09:08'),
	(64, 'member', 2, 'campaign_stage_changed', 'Campaign Approved', '"CMP-2026-10-0006" is now "Approved".', '/campaigns', 1, '2026-10-01 17:09:13'),
	(65, 'mis', 1, 'proof_submitted', 'New posting proof submitted', 'Chris Benz submitted a proof for "New System Awareness" (2026-09-26).', '/campaigns/proof-review', 1, '2026-10-01 17:30:41'),
	(66, 'mis', 6, 'proof_submitted', 'New posting proof submitted', 'Chris Benz submitted a proof for "New System Awareness" (2026-09-26).', '/campaigns/proof-review', 0, '2026-10-01 17:30:41'),
	(67, 'brand_ambassador', 5, 'campaign_assigned', 'Assigned to a campaign', 'You\'ve been assigned to run "New Video Release".', '/brand-ambassador/campaigns', 1, '2026-10-01 17:34:09'),
	(68, 'member', 1, 'campaign_stage_changed', 'Campaign Reviewing', '"Campaign" is now "Reviewing".', '/campaigns', 0, '2026-10-04 19:13:07'),
	(69, 'member', 1, 'campaign_stage_changed', 'Campaign Approved', '"CMP-2026-10-0007" is now "Approved".', '/campaigns', 0, '2026-10-04 19:13:32'),
	(70, 'member', 1, 'campaign_stage_changed', 'Campaign Pending Payment', '"CMP-2026-10-0007" is now "Pending Payment".', '/campaigns', 0, '2026-10-04 20:17:11'),
	(71, 'member', 1, 'campaign_stage_changed', 'Campaign Payment Done', '"CMP-2026-10-0007" is now "Payment Done".', '/campaigns', 0, '2026-10-04 20:33:28'),
	(72, 'brand_ambassador', 5, 'proof_reviewed', 'Posting proof Rejected', 'Your proof for "New System Awareness" (2026-09-26) was rejected: Reject', '/brand-ambassador/campaigns', 1, '2026-10-04 20:34:04'),
	(73, 'member', 1, 'campaign_stage_changed', 'Campaign Active', '"CMP-2026-10-0007" is now "Active".', '/campaigns', 0, '2026-10-04 20:36:02'),
	(74, 'brand_ambassador', 5, 'campaign_assigned', 'Assigned to a campaign', 'You\'ve been assigned to run "New Products Arrival".', '/brand-ambassador/campaigns/p2VnsR', 1, '2026-10-04 21:19:35'),
	(75, 'brand_ambassador', 6, 'campaign_assigned', 'Assigned to a campaign', 'You\'ve been assigned to run "New Products Arrival".', '/brand-ambassador/campaigns/p2VnsR', 1, '2026-10-04 21:53:40'),
	(76, 'member', 15, 'registration_reviewed', 'Registration Approved', 'Your member registration has been approved — you can now log in to the portal.', '/profile', 0, '2026-10-19 15:53:12'),
	(77, 'member', 12, 'transaction_recorded', 'Deposit of KES 5,000.00 recorded', 'TRN-2026-10-0002 · Dated 2026-10-19.', '/transactions/ngOVS6', 1, '2026-10-19 18:00:33'),
	(78, 'member', 12, 'transaction_recorded', 'Deposit of KES 1,500.00 recorded', 'TRN-2026-10-0003 · Dated 2026-10-22.', '/transactions/46xUEd', 1, '2026-10-22 16:07:41'),
	(79, 'member', 12, 'transaction_recorded', 'Deposit of KES 500.00 recorded', 'TRN-2026-10-0004 · Dated 2026-10-22.', '/transactions/nW0G5p', 1, '2026-10-22 16:08:28'),
	(80, 'member', 12, 'transaction_recorded', 'Deposit of KES 1,000.00 recorded', 'TRN-2026-10-0005 · Dated 2026-10-22.', '/transactions/j7mUyT', 1, '2026-10-22 16:13:46'),
	(81, 'member', 12, 'transaction_recorded', 'Deposit of KES 3,000.00 recorded', 'TRN-2026-10-0006 · Dated 2026-10-22.', '/transactions/4IOGfk', 1, '2026-10-22 16:26:50'),
	(82, 'member', 3, 'transaction_recorded', 'Deposit of KES 8,500.00 recorded', 'TRN-2026-10-0007 · Dated 2026-10-22.', '/transactions/nJ6Ike', 0, '2026-10-22 16:40:47'),
	(83, 'member', 3, 'transaction_recorded', 'Deposit of KES 1,500.00 recorded', 'TRN-2026-10-0008 · Dated 2026-10-22.', '/transactions/RTTGUA', 0, '2026-10-22 16:42:35');

-- Dumping structure for table accountsmaster.parameter_values
CREATE TABLE IF NOT EXISTS `parameter_values` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parameter_id` int DEFAULT NULL,
  `parent_value_id` int DEFAULT NULL,
  `paramater_value` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint DEFAULT '1',
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_parameter_values_parameters` (`parameter_id`) USING BTREE,
  KEY `FK_parameter_values_parent` (`parent_value_id`),
  CONSTRAINT `FK_parameter_values_parameters` FOREIGN KEY (`parameter_id`) REFERENCES `parameters` (`id`),
  CONSTRAINT `FK_parameter_values_parent` FOREIGN KEY (`parent_value_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table accountsmaster.parameter_values: ~24 rows (approximately)
INSERT INTO `parameter_values` (`id`, `parameter_id`, `parent_value_id`, `paramater_value`, `description`, `is_active`, `is_default`, `created_on`) VALUES
	(1, 1, NULL, 'Chair Person', NULL, 1, 0, '2026-10-19 14:31:10'),
	(2, 1, NULL, 'Treasurer', NULL, 1, 0, '2026-10-19 14:31:25'),
	(3, 1, NULL, 'Secretary', NULL, 1, 0, '2026-10-19 14:31:34'),
	(4, 1, NULL, 'Member', NULL, 1, 1, '2026-10-19 14:31:56'),
	(5, 2, NULL, 'Deposit', NULL, 1, 1, '2026-10-19 14:32:21'),
	(6, 2, NULL, 'Withdraw', NULL, 1, 0, '2026-10-19 14:32:38'),
	(7, 3, NULL, 'Male', NULL, 1, 1, '2026-10-19 15:13:44'),
	(8, 3, NULL, 'Female', NULL, 1, 0, '2026-10-19 15:13:52'),
	(9, 3, NULL, 'Others', NULL, 1, 0, '2026-10-19 15:14:00'),
	(10, 4, NULL, 'Spouse', NULL, 1, 1, '2026-10-19 15:59:41'),
	(11, 4, NULL, 'Father', NULL, 1, 0, '2026-10-19 15:59:53'),
	(12, 4, NULL, 'Mother', NULL, 1, 0, '2026-10-19 16:00:00'),
	(13, 4, NULL, 'Brother', NULL, 1, 0, '2026-10-19 16:00:08'),
	(14, 4, NULL, 'Sister', NULL, 1, 0, '2026-10-19 16:00:15'),
	(15, 4, NULL, 'Child', NULL, 1, 0, '2026-10-19 16:00:44'),
	(16, 4, NULL, 'Friend', NULL, 1, 0, '2026-10-19 16:00:51'),
	(17, 4, NULL, 'Others', NULL, 1, 0, '2026-10-19 16:01:06'),
	(18, 4, NULL, 'Uncle', NULL, 1, 0, '2026-10-19 16:01:18'),
	(19, 4, NULL, 'Aunt', NULL, 1, 0, '2026-10-19 16:01:25'),
	(20, 4, NULL, 'Cousin', NULL, 1, 0, '2026-10-19 16:01:38'),
	(21, 5, NULL, 'Year - Yearly', NULL, 1, 0, '2026-10-19 16:17:32'),
	(22, 5, NULL, 'Month- Monthly', NULL, 1, 0, '2026-10-19 16:17:46'),
	(23, 5, NULL, 'Week - Weekly', NULL, 1, 1, '2026-10-19 16:18:14'),
	(24, 5, NULL, 'Day - Daily', NULL, 1, 0, '2026-10-19 16:18:54');

-- Dumping structure for table accountsmaster.parameters
CREATE TABLE IF NOT EXISTS `parameters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parameter_name` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `text_id` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint DEFAULT '1',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table accountsmaster.parameters: ~5 rows (approximately)
INSERT INTO `parameters` (`id`, `parameter_name`, `text_id`, `description`, `is_active`, `created_on`) VALUES
	(1, 'Positions', 'parties-positions', NULL, 1, '2026-10-19 14:29:39'),
	(2, 'Transaction Types', 'transaction-types', NULL, 1, '2026-10-19 14:30:45'),
	(3, 'Genders', 'genders', NULL, 1, '2026-10-19 15:13:31'),
	(4, 'Relationships', 'relationships', NULL, 1, '2026-10-19 15:59:24'),
	(5, 'Time Units', 'time-units', NULL, 1, '2026-10-19 16:17:12');

-- Dumping structure for table accountsmaster.payments
CREATE TABLE IF NOT EXISTS `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `file_no` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `member_id` int NOT NULL DEFAULT '0',
  `campaign_id` int DEFAULT NULL,
  `currency_id` int DEFAULT NULL,
  `payment_mode_id` int DEFAULT NULL,
  `amount` int DEFAULT NULL,
  `reference` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `received_by` int DEFAULT NULL,
  `comments` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_paymentss_clients` (`member_id`) USING BTREE,
  KEY `FK_paymentss_parameter_values` (`currency_id`) USING BTREE,
  KEY `FK_payments_campaigns` (`campaign_id`),
  KEY `FK_payments_payment_mode` (`payment_mode_id`),
  CONSTRAINT `FK_payments_campaigns` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_payments_payment_mode` FOREIGN KEY (`payment_mode_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_paymentss_clients` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`),
  CONSTRAINT `FK_paymentss_parameter_values` FOREIGN KEY (`currency_id`) REFERENCES `parameter_values` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Payments';

-- Dumping data for table accountsmaster.payments: ~10 rows (approximately)
INSERT INTO `payments` (`id`, `file_no`, `member_id`, `campaign_id`, `currency_id`, `payment_mode_id`, `amount`, `reference`, `payment_date`, `received_by`, `comments`, `created_by`, `created_on`, `updated_by`, `updated_on`) VALUES
	(1, 'PAY-0001', 1, 2, 19, 167, 30000, NULL, '2026-09-14', 1, NULL, 1, '2026-09-14 16:20:14', 1, '2026-09-14 17:09:53'),
	(2, 'PAY-0002', 3, 2, 19, 167, 1000, NULL, '2026-09-14', 1, NULL, 1, '2026-09-14 16:51:33', NULL, '2026-09-14 17:10:12'),
	(3, 'PAY-0003', 12, 3, 19, 167, 15000, NULL, '2026-09-15', 1, NULL, 1, '2026-09-15 09:51:18', NULL, NULL),
	(4, 'PAY-0004', 3, 4, 19, 167, 1500, NULL, '2026-09-15', 1, NULL, 1, '2026-09-15 09:51:36', NULL, NULL),
	(5, 'PAY-0005', 1, 2, 19, 167, 2000, NULL, '2026-09-17', 1, NULL, 1, '2026-09-17 13:54:21', NULL, NULL),
	(6, 'PAY-0006', 12, 3, 19, 167, 3500, NULL, '2026-09-17', 1, NULL, 1, '2026-09-17 13:54:36', NULL, NULL),
	(7, 'PAY-0007', 3, 4, 19, 167, 2000, NULL, '2026-09-22', 1, NULL, 1, '2026-09-22 10:52:37', NULL, NULL),
	(8, 'PAY-0008', 2, 5, 19, 167, 4000, NULL, '2026-09-25', 1, NULL, 1, '2026-09-25 14:17:21', NULL, NULL),
	(9, 'PAY-0009', 1, 6, 19, 167, 5000, NULL, '2026-09-30', 1, NULL, 1, '2026-09-30 09:39:46', NULL, NULL),
	(10, 'PAY-0010', 1, 8, 19, 167, 2000, NULL, '2026-10-04', 1, NULL, 1, '2026-10-04 20:33:21', NULL, NULL);

-- Dumping structure for table accountsmaster.process_types
CREATE TABLE IF NOT EXISTS `process_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `process_type_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `data_table` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `process_type_name` (`process_type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table accountsmaster.process_types: ~5 rows (approximately)
INSERT INTO `process_types` (`id`, `process_type_name`, `description`, `data_table`, `created_at`, `updated_at`) VALUES
	(1, 'user_registration', 'User Registration', 'users', '2026-05-06 12:29:31', '2026-06-24 17:14:17'),
	(2, 'member_registration', 'Member Registration', 'members', '2026-05-06 12:29:31', '2026-10-19 14:54:08'),
	(10, 'expenditure_creation', 'Expenditure', 'expenditure', '2026-08-14 13:12:42', '2026-10-19 16:11:56'),
	(15, 'transaction_creation', 'Member Transactions', 'transactions', '2026-10-19 15:32:40', '2026-10-19 15:32:40'),
	(16, 'next_of_kin_registration', 'Member Next of Kin', 'member_next_of_kin', '2026-10-19 16:13:17', '2026-10-19 16:13:17');

-- Dumping structure for table accountsmaster.push_subscriptions
CREATE TABLE IF NOT EXISTS `push_subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipient_id` int NOT NULL,
  `audience` enum('mis','brand_ambassador','member') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'member',
  `endpoint` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `p256dh` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `auth` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pps_endpoint` (`endpoint`(500)),
  KEY `idx_push_sub_recipient` (`audience`,`recipient_id`)
) ENGINE=InnoDB AUTO_INCREMENT=230 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table accountsmaster.push_subscriptions: ~17 rows (approximately)
INSERT INTO `push_subscriptions` (`id`, `recipient_id`, `audience`, `endpoint`, `p256dh`, `auth`, `is_active`, `created_at`) VALUES
	(17, 1, 'member', 'https://fcm.googleapis.com/fcm/send/de7nGtzYHSo:APA91bHLNsCI99a-pQFDr_wZDdz9k_xqDZFCyGX5C59pGrEhv5qZIIr_pbx-Klbv6rQncYsbDi7zwyQUQEf_Qyuot4IwSlBdf9YEDAzE7zSDD3VqeN9BVpDkdMmURivfgodh91qbCUbn', 'BC78f5_sElaMuulB9mamplg2L4pr4KQ8LR9un6NC7Ig985_TulbYX1u6ywfJ3aWSXzU2ysQlTNzHb-q5rBZNq2Q', 'T6HvxF849aRVq1L8zfvtcw', 1, '2026-06-23 11:37:53'),
	(48, 1, 'member', 'https://fcm.googleapis.com/fcm/send/dE1c_Spvkow:APA91bEs490SYDHqecMkp_P1Eiik1ukzftoh2F6Dbt2eTPn_EKOafZ5sQ48tYU6va05UIjCYRiFOiSrw-9l8FYXEkiXooDBl63cP_wL9McpzRj1aGeU9FIKnMstMD3fVDjozhIKob_Wp', 'BOTye-wPN3SxOExYsDaAljVe4huKkxWSJzjzUdk2n0DEierv79VBJTgXF5lbThevkrXJSmqwM58xGoxi0YKU-X4', '2tSfblhgHK2G-6ouXKjMxQ', 0, '2026-08-14 15:20:23'),
	(62, 1, 'member', 'https://fcm.googleapis.com/fcm/send/eeV9m9gboyk:APA91bGQPQDe_7NT22xOhx_nNwEvYzZIIjkKOfHM8l6_RTywnPZsbdq44HW7E6rt_vkZJaR2aetOloSxGLUlgS-HsnCuIDRXGDQy1xq1C67dAyzqCqXYTjqVwLNo_Rg7ggPoM61dU0Hv', 'BKvlkPjwsuNkLfFLXld66zteiwUeIhpnwUhqKvI0Y0TZO0oIRi1QZRrvYakEcjz0F27AHNt6x9dDcP0xXhOKbz8', 'sA06nzZcTD_vnMg9TclUuQ', 0, '2026-08-17 16:17:07'),
	(71, 1, 'member', 'https://fcm.googleapis.com/fcm/send/e_6tp2ax8dI:APA91bHFPOgW4yRLGPY8hzgcPD-0OeIglRHWM5xP5Uni68BQULAZy-dCpdXz36f0NtEO3zMYaNu2ZJs0AZthsObwLBuEkUfBYzIUHQewhAk_TM1X_EXcUrW0WnC88wngeADrd9MuPWnq', 'BHQNxYmzuh1Nx5Bt_2gZtM3LJwr7QiDeHBfQ4j9pY34LTWk88zhA-5wQstGW_p0yJjim-pzhwbheBXE16vZH8Bk', 'rbhVTwGaamrV5BLEEno6hg', 0, '2026-08-18 16:15:56'),
	(88, 1, 'member', 'https://fcm.googleapis.com/fcm/send/cE74ksvhi3I:APA91bFGUXtio8ryEp7IbTaIXTy9P3f4wlc3gY7gaSSQ4pGKH75SL-1RebOD-9gw3d1dzL7NIYaZ2f-nxX6MljMXoIW3xhmzE9cwwCMSIYXFzW_fdnJJsVRFXX7QQ2w32l5fM1_Z04cU', 'BNuSShrco1vaIXWCsgafysOKD_jYNjpmSbxtH-bLeHZsDPW0pkfouBQ5TNqcRblkBI5VbQ2C2yu_veNGF9omHg8', 'VG0s574U9_MD4EkvhsOz0g', 1, '2026-08-27 13:20:19'),
	(98, 1, 'member', 'https://fcm.googleapis.com/fcm/send/cyX8kFajbzQ:APA91bGRzErwGYbeBVYyy3TT922qAyjRGlo3sJKXpVsbXRSCPvez08JY16Jy1L5HrdhGzvRkBSTQR4WtaCctMLpW4Ip05tn-EukJR9rzXwV6NMF7n8ckUcodwuP4Tj-xrBIxNev_VoGc', 'BOigFr60Vk7q7PldLYWP-cbKZj-5HTPoRlbbfVJkRSWJVkkgQUrY8Gvw9Vka-wvH61_r0NzP47EjOoJjnCSzXxU', 'r1EbpayiCqXYoOrkiHsMkA', 0, '2026-09-03 15:15:37'),
	(109, 1, 'member', 'https://fcm.googleapis.com/fcm/send/dHr804UxSzc:APA91bEIysso6GlY9AfYqUOla4hS4VPEeRmfaNq_PWsDZDk376qwEPR4NS9ni2qVRIY3s-iJjNBpFgCNHik9ChHGiYqP4bGCGG0ovoqpnviQH_B2iKX1f3ItfohMxITjSmRLdoyU-UY6', 'BEw3x-MTAUSTf7p8g8E7IZ8ykkUXA6xIyTIS_I3bBsTpJfFNoJn9Eapv4LkPmi7S-9f0OMiCMjJGchmkFVqkDyE', 'ERLjEIjJZJON1sDnlB3Yog', 1, '2026-09-29 17:15:02'),
	(110, 1, 'mis', 'https://fcm.googleapis.com/fcm/send/fSbXcadOVSs:APA91bEOSQ-OnFCSr6ueeUjzOLC_duKUfBUAR3miQsB5SioMGnzrLV1087ZROG5TkPwHX6SGr2RTtOHFrYmacLU8lueC3jUi7l9yBsiJZcUwIrDgQlffpTyoroa3AOZqEuFroA4I7bDV', 'BOUzorkfShFH6vjYHfBwpPgrXH9Fk_1_qBGnptTF8DP-DX8w-b08bqqHxUPj3Uu2qTV8cF1egtkyqYQVjr7W5LQ', 'jVxu3byBrEkpQazs4Tn-Wg', 0, '2026-10-01 17:27:05'),
	(111, 1, 'mis', 'https://fcm.googleapis.com/fcm/send/eA6EKMC8Fmc:APA91bEKug02wNVkal0oKesoVfkMubiFPPpkNlTEHGX6U_asfoaZwGkSCuwydEBqDQduGigPZjFe8c8i__tQ1JnDHK6l2sMgxPpo7o6iJ3YEAWMDabzZBcK7uiyjE-55V9AqHYRu3Uxm', 'BL0pPeFW0uIGCn-4o6snb8VJa7t2dOIZA0dBKqB-ky9VlWIpmeKdc0WUO-p3TXtrWGFSDuZ-Lzr4A4MzfBDnlCo', 'IQ4ckzr6o_kD6Rs1oR0QjA', 1, '2026-10-01 17:28:22'),
	(113, 6, 'brand_ambassador', 'https://fcm.googleapis.com/fcm/send/f30JkBip0Es:APA91bFD-ZHYMMxexAkusHSb3o_hmoLeaXEsVhCAzYwzV2MyC6jKqr1nHasXWBIYPguTyV-5F5eSrehhqjlkA6pPt24u0jfRXjU2fEy9VNOctPcFzwjJs-s0vyL4eQi13kZ5jxUiygvA', 'BLmz9cNaBtI5AzMX_H2fJI27tnjgbSdKRFlomRIODY95Tk6pRM8NdQqRL3cGF5rdlzjjgdmaH2jdLudb20zYs6w', 'rFFxiAgW66y-QAC4zREKIg', 1, '2026-10-01 17:32:27'),
	(163, 1, 'mis', 'https://fcm.googleapis.com/fcm/send/fc_tKYYSBjY:APA91bH_EQzFx0fdfzMXoHKNByr8wvDSCOjHCixD2WTrUJGywTKckHjVcu3WMENzMCi6Ek1ob6TUqQ14KsWliLSsi1eA7ETHLkDKoOTyvbtaKiARDRD0TG4JuGBk7Nfscb39PwgAeU9o', 'BLnQ2QctRFDlZyf2UNo1xxGmP79qJKi-gECewNHYgRS5aPhyo5geIFQp3CZWfjzy9DHyI4Zw8MaVroHurzpQefc', 'YcSWekCoz8WaYECBbCjXFA', 0, '2026-10-19 13:26:52'),
	(182, 1, 'mis', 'https://fcm.googleapis.com/fcm/send/d2TKQxdh3Sw:APA91bFtQox9MIz5onfX1qxoUb1-p2Iy1YZpuhLE_VkBFyjJYf2SSs8Vh482mOJJ69dWvxxOtVyFz90E5hCmAjYNDAIXX3CAF-9K55sjRnGvvfEL5RHUi1yjCQl438xXsCdX1_GEVcOp', 'BHkdoaVrH164xvKggAxBiE5xs7v_lA9O3g2WddZgJuh8jyu98Piz5SUo-Pzi2KoaV0TOGooAZoh4C5ijIo3em8s', 'hzrygVNkFHnwExwRS9X5Zw', 0, '2026-10-19 13:40:59'),
	(185, 1, 'mis', 'https://fcm.googleapis.com/fcm/send/ehlTk81wviU:APA91bGogsCk8kXLABL7TVTXmHI7gIicfxVthOYR1xYdof7zXXUparRoKGiQ-P0FTB5nsdAnVhscc356XroiMYyrGCnNxe50NzUseFBiDzoK2S0VRzXOxSO9B-wDSRvmgzmuoZ6SnF97', 'BI8zXvPKIHlNmbUvIb9RUq0g7vWNavHnbgrMAnTWYvrpC9BtPm1jX-NPL0g4uGTZRaoH78w4vXwPrponVD9EPPg', '7lbJW6s4xiow_bLVX2i-_A', 0, '2026-10-19 14:16:07'),
	(194, 12, 'member', 'https://fcm.googleapis.com/fcm/send/cYE-EVyPENI:APA91bHpSaenzYBFKpcaKzT8JaLNTDoLIV2NmuYCPwXwjkYeka0AONuZSLQ4BB3p8cte88_7zvKSN7TQMuJaggETOH_FtitNBKQtieyd-8pOySbw7RbbEQThB_ZiVwOVOfVaZn6xulFi', 'BKVbN7Irf6Hcb6jlSCn7D4sJWhKaeNDtRfPMW2QRgVg8d4405Woxga4vPHDAbIZsCd4C24fCvBxHaJuDLePy4Zs', 'auyzFrO2607HWxuQTOHzag', 1, '2026-10-19 17:50:41'),
	(206, 1, 'mis', 'https://fcm.googleapis.com/fcm/send/eneY2Z09Qdw:APA91bH_HeLsnu2RYPfZ4J5n6q1bBOCb-BdetfJh-v93Uvg8pqxJsDLz6dWx48RicfmFxYEZwwKxOQdgk1vmR7S65TAJJIwNTBy4WbCIhgGuNDbd4Kqr3B2lQzasxt60GK3nXrM24m3u', 'BHOD_0xfOVEwFSeWc2m5Hf2eDkM2P6fyDtSlNK6xvvgzoksFcA8ZIHHpiCh309PDD9GM4OVyvl1aJVSYIVcr6SM', 'OwoCu_7WbOrVfpCsbUsKRw', 0, '2026-10-21 08:18:16'),
	(208, 1, 'mis', 'https://fcm.googleapis.com/fcm/send/enVH7MIyMsU:APA91bHxa7PCMbYg3sq3i9weOkj36q_Cx0k-F3iP97bWmygOK5bKMEB0RXPk9rHlXrjuACYxTj6_AP78AcauE3SxcelxMcf-mGF91kXvs8P_RIXMKIjYRZhhIrqLLJkAzRWjegC2xuh0', 'BL8htxz7EKfOFIVcLl1pso_Rg6yWBD5AqPK-xZHq5-sm2ikaZj9GklDBY7fseB0v7ic-8y2P2DxveKQZ5VUpTR0', 'GP1J2tGpXb_w5oqRUvv-Gw', 0, '2026-10-21 09:26:19'),
	(211, 1, 'mis', 'https://fcm.googleapis.com/fcm/send/cxklcdjr3so:APA91bGXP3pZ9uH9wk5Tn21046sdWHFdSPN07yLDfHBqngljw8ed8APB7p3iJ7S1bDyvsW0SrTLphZuQF6y__CiVNB3Lziy9PpR9fyNeAPQ0RMsBAsA3pXagK7Bc1yk8XaY6kb0Uw9AP', 'BOStNcu78UwQzTCgNyY7gBNg260kQuwc0xKRXvS3_J0BlShczP3clT3D8HZL8GdJuTr4mLPr8sOgW5UJYTE7svs', 'IFoKI5gmi6jMPKvyc9FThw', 1, '2026-10-21 10:52:08');

-- Dumping structure for table accountsmaster.ref_numbering
CREATE TABLE IF NOT EXISTS `ref_numbering` (
  `id` int NOT NULL AUTO_INCREMENT,
  `process_type_id` int NOT NULL,
  `prefix` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `initial_serial` int DEFAULT '1',
  `next_serial` int DEFAULT '1',
  `use_year` tinyint(1) DEFAULT '0',
  `use_month` tinyint(1) NOT NULL DEFAULT '0',
  `padding` int DEFAULT '4',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_process_ref` (`process_type_id`),
  CONSTRAINT `ref_numbering_ibfk_1` FOREIGN KEY (`process_type_id`) REFERENCES `process_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table accountsmaster.ref_numbering: ~5 rows (approximately)
INSERT INTO `ref_numbering` (`id`, `process_type_id`, `prefix`, `initial_serial`, `next_serial`, `use_year`, `use_month`, `padding`, `created_at`, `updated_at`) VALUES
	(1, 1, 'USR', 1, 9, 0, 0, 4, '2026-05-06 12:29:31', '2026-09-14 15:32:55'),
	(2, 2, 'MEM', 1, 7, 0, 0, 4, '2026-05-06 12:29:31', '2026-10-19 15:53:12'),
	(10, 10, 'EXP', 1, 3, 0, 0, 4, '2026-08-14 13:12:42', '2026-09-17 15:05:51'),
	(15, 15, 'TRN', 1, 10, 1, 1, 4, '2026-10-19 15:32:40', '2026-10-22 17:17:35'),
	(16, 16, 'NOK', 1, 5, 0, 0, 4, '2026-10-19 16:13:18', '2026-10-22 10:28:42');

-- Dumping structure for table accountsmaster.role_menu_access
CREATE TABLE IF NOT EXISTS `role_menu_access` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `menu_id` int NOT NULL,
  `can_view` tinyint(1) DEFAULT '0',
  `can_create` tinyint(1) DEFAULT '0',
  `can_edit` tinyint(1) DEFAULT '0',
  `can_delete` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_role_menu` (`role_id`,`menu_id`),
  KEY `menu_id` (`menu_id`),
  CONSTRAINT `role_menu_access_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_menu_access_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1299 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table accountsmaster.role_menu_access: ~44 rows (approximately)
INSERT INTO `role_menu_access` (`id`, `role_id`, `menu_id`, `can_view`, `can_create`, `can_edit`, `can_delete`) VALUES
	(1067, 2, 1, 1, 1, 1, 1),
	(1068, 2, 2, 1, 1, 1, 0),
	(1069, 2, 3, 1, 1, 1, 0),
	(1070, 2, 5, 0, 0, 0, 0),
	(1071, 2, 7, 1, 1, 1, 0),
	(1072, 2, 8, 0, 0, 0, 0),
	(1073, 2, 9, 0, 0, 0, 0),
	(1077, 2, 16, 1, 1, 1, 1),
	(1078, 2, 17, 1, 1, 1, 1),
	(1081, 2, 22, 0, 0, 0, 0),
	(1082, 2, 23, 1, 1, 1, 0),
	(1085, 2, 27, 1, 1, 1, 1),
	(1086, 2, 28, 1, 1, 1, 1),
	(1087, 2, 29, 1, 0, 1, 0),
	(1088, 2, 30, 1, 1, 1, 1),
	(1089, 2, 31, 1, 1, 1, 1),
	(1091, 2, 33, 1, 1, 1, 1),
	(1122, 2, 35, 1, 1, 1, 1),
	(1262, 1, 1, 1, 1, 1, 1),
	(1263, 1, 2, 1, 1, 1, 0),
	(1264, 1, 3, 1, 1, 1, 0),
	(1265, 1, 4, 1, 1, 1, 1),
	(1266, 1, 5, 1, 1, 1, 1),
	(1267, 1, 6, 1, 1, 1, 1),
	(1268, 1, 7, 1, 1, 1, 1),
	(1269, 1, 8, 1, 1, 1, 1),
	(1270, 1, 9, 1, 1, 1, 1),
	(1272, 1, 16, 1, 1, 1, 1),
	(1273, 1, 17, 1, 1, 1, 1),
	(1274, 1, 22, 1, 1, 1, 0),
	(1275, 1, 23, 1, 1, 1, 1),
	(1278, 1, 27, 1, 1, 1, 1),
	(1279, 1, 28, 1, 1, 1, 1),
	(1280, 1, 29, 1, 1, 1, 0),
	(1281, 1, 30, 1, 1, 1, 1),
	(1282, 1, 31, 1, 1, 1, 1),
	(1283, 1, 33, 1, 1, 1, 1),
	(1285, 1, 35, 1, 1, 1, 1),
	(1290, 2, 40, 1, 1, 1, 1),
	(1291, 1, 40, 1, 1, 1, 1),
	(1293, 2, 41, 1, 0, 0, 0),
	(1294, 1, 41, 1, 0, 0, 0),
	(1296, 2, 42, 1, 1, 1, 1),
	(1297, 1, 42, 1, 1, 1, 1);

-- Dumping structure for table accountsmaster.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table accountsmaster.roles: ~2 rows (approximately)
INSERT INTO `roles` (`id`, `role_name`, `description`, `created_at`, `updated_at`) VALUES
	(1, 'Super Admin', 'Full system access', '2026-05-06 12:29:31', '2026-05-06 12:29:31'),
	(2, 'Admins', 'Administrative access', '2026-05-06 12:29:31', '2026-10-19 16:14:39');

-- Dumping structure for table accountsmaster.targets
CREATE TABLE IF NOT EXISTS `targets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `target_amount` decimal(14,2) NOT NULL,
  `target_date` date NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `active_flag` tinyint GENERATED ALWAYS AS (if((`is_active` = 1),1,NULL)) STORED,
  `created_by` int DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_targets_single_active` (`active_flag`),
  KEY `idx_targets_date` (`target_date`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Financial targets';

-- Dumping data for table accountsmaster.targets: ~3 rows (approximately)
INSERT INTO `targets` (`id`, `target_amount`, `target_date`, `is_active`, `created_by`, `created_on`, `updated_by`, `updated_on`) VALUES
	(2, 10000.00, '2026-10-31', 0, 1, '2026-10-19 16:33:43', 1, '2026-10-19 17:01:28'),
	(5, 15000.00, '2026-12-30', 0, 1, '2026-10-19 16:43:07', 1, '2026-10-21 13:19:46'),
	(6, 20000.00, '2027-01-31', 1, 1, '2026-10-19 16:44:22', 1, '2026-10-19 17:01:28');

-- Dumping structure for table accountsmaster.transactions
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `file_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `member_id` int NOT NULL,
  `transaction_type_id` int DEFAULT NULL,
  `amount` decimal(14,2) NOT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `rate_id` int DEFAULT NULL,
  `rate_amount` decimal(14,2) DEFAULT NULL,
  `rate_unit` enum('year','month','week','day') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `credit_brought_forward` decimal(14,2) DEFAULT NULL,
  `cover_value` decimal(14,2) DEFAULT NULL,
  `credit_carried_forward` decimal(14,2) DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `other_details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_migrated` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_file_no` (`file_no`),
  KEY `FK_transactions_member` (`member_id`),
  KEY `FK_transactions_type` (`transaction_type_id`),
  KEY `idx_transactions_date` (`transaction_date`),
  KEY `FK_transactions_rate` (`rate_id`),
  KEY `idx_transactions_member_chain` (`member_id`,`from_date`,`id`),
  CONSTRAINT `FK_transactions_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_transactions_rate` FOREIGN KEY (`rate_id`) REFERENCES `contribution_rates` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_transactions_type` FOREIGN KEY (`transaction_type_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Member financial transactions';

-- Dumping data for table accountsmaster.transactions: ~9 rows (approximately)
INSERT INTO `transactions` (`id`, `file_no`, `member_id`, `transaction_type_id`, `amount`, `from_date`, `to_date`, `rate_id`, `rate_amount`, `rate_unit`, `credit_brought_forward`, `cover_value`, `credit_carried_forward`, `transaction_date`, `other_details`, `is_migrated`, `created_by`, `created_on`, `updated_by`, `updated_on`) VALUES
	(2, 'TRN-2026-10-0001', 12, 5, 1000.00, '2026-09-28', '2026-10-04', 7, 1000.00, 'week', 0.00, 1000.00, 0.00, '2026-10-19', 'Other Details', 0, 1, '2026-10-19 15:46:19', 1, '2026-10-22 16:35:32'),
	(5, 'TRN-2026-10-0002', 12, 5, 4000.00, '2026-10-05', '2026-11-01', 7, 1000.00, 'week', 0.00, 4000.00, 0.00, '2026-10-19', NULL, 0, 1, '2026-10-19 18:00:33', 1, '2026-10-22 17:06:55'),
	(12, 'TRN-2026-10-0003', 12, 5, 1500.00, '2026-11-02', '2026-11-08', 7, 1000.00, 'week', 0.00, 1000.00, 500.00, '2026-10-22', NULL, 0, 1, '2026-10-22 16:07:41', NULL, '2026-10-22 17:06:55'),
	(13, 'TRN-2026-10-0004', 12, 5, 500.00, '2026-11-09', '2026-11-15', 7, 1000.00, 'week', 500.00, 1000.00, 0.00, '2026-10-22', NULL, 0, 1, '2026-10-22 16:08:28', NULL, '2026-10-22 17:06:55'),
	(14, 'TRN-2026-10-0005', 12, 5, 1000.00, '2026-11-16', '2026-11-22', 7, 1000.00, 'week', 0.00, 1000.00, 0.00, '2026-10-22', NULL, 0, 1, '2026-10-22 16:13:46', 1, '2026-10-22 17:06:55'),
	(17, 'TRN-2026-10-0006', 12, 5, 3000.00, '2026-11-23', '2026-12-22', 8, 2000.00, 'month', 0.00, 2000.00, 1000.00, '2026-10-22', NULL, 0, 1, '2026-10-22 16:26:50', NULL, '2026-10-22 17:06:55'),
	(18, 'TRN-2026-10-0007', 3, 5, 8500.00, '2026-10-22', '2026-12-16', 7, 1000.00, 'week', 0.00, 8000.00, 500.00, '2026-10-22', NULL, 0, 1, '2026-10-22 16:40:47', NULL, '2026-10-22 16:40:47'),
	(19, 'TRN-2026-10-0008', 3, 5, 1500.00, '2026-12-17', '2026-12-30', 7, 1000.00, 'week', 500.00, 2000.00, 0.00, '2026-10-22', NULL, 0, 1, '2026-10-22 16:42:35', NULL, '2026-10-22 16:42:35'),
	(22, 'TRN-2026-10-0009', 12, 5, 2000.00, '2027-01-04', '2027-01-17', NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-22', NULL, 1, 1, '2026-10-22 17:17:35', NULL, NULL);

-- Dumping structure for table accountsmaster.units
CREATE TABLE IF NOT EXISTS `units` (
  `id` int NOT NULL AUTO_INCREMENT,
  `unit_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unit_name` (`unit_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table accountsmaster.units: ~0 rows (approximately)

-- Dumping structure for table accountsmaster.user_roles
CREATE TABLE IF NOT EXISTS `user_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_role` (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table accountsmaster.user_roles: ~1 rows (approximately)
INSERT INTO `user_roles` (`id`, `user_id`, `role_id`, `assigned_at`) VALUES
	(1, 1, 1, '2026-10-21 09:58:37');

-- Dumping structure for table accountsmaster.user_sessions
CREATE TABLE IF NOT EXISTS `user_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table accountsmaster.user_sessions: ~4 rows (approximately)
INSERT INTO `user_sessions` (`id`, `user_id`, `token_hash`, `ip_address`, `user_agent`, `is_active`, `created_at`, `expires_at`) VALUES
	(1, 1, 'RGKpOLXctlWyU46QP2P8', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 1, '2026-10-21 10:52:07', '2026-10-21 18:52:07'),
	(2, 1, 'zZr9ac4oQNDJtnOMrWSY', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 1, '2026-10-22 10:26:37', '2026-10-22 18:26:37'),
	(3, 1, 'W7BcyRRqQTsfINebQl3c', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 1, '2026-10-22 13:47:56', '2026-10-22 21:47:56'),
	(4, 1, 'MgxgyPgAf-M32ab0KX28', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 1, '2026-10-22 13:49:30', '2026-10-22 21:49:30');

-- Dumping structure for table accountsmaster.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_ref_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `firstname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` enum('Male','Female','Other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','locked','suspended','revoked') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `user_ref_no` (`user_ref_no`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table accountsmaster.users: ~3 rows (approximately)
INSERT INTO `users` (`id`, `user_ref_no`, `firstname`, `lastname`, `gender`, `phone`, `email`, `profile_image`, `username`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES
	(1, 'USR-0001', 'Dev', 'Admin', 'Male', NULL, 'admin@salesmaster.com', '/uploads/avatars/user_1_1778159097482.png', 'dev.admin', '$2a$10$FiE8ORNfBCVoPRCJG7aQGO4V2CAVW.wmuHCBlH8SHHqJFhlxQ7vvi', 'active', '2026-10-22 13:49:30', '2026-05-06 12:29:31', '2026-10-22 13:49:30'),
	(6, 'USR-0005', 'System', 'Admin', 'Male', NULL, NULL, '/uploads/avatars/user_6_1779347612177.jpg', 'sys.admin', '$2a$10$8n7T8Mg1KPkVhc4flMPEdujTZRfnljp/86fNCbzVtjvhEjH4N3YHu', 'active', '2026-05-25 12:45:29', '2026-05-14 14:24:04', '2026-06-25 11:18:09');

-- Dumping structure for table accountsmaster.workflow_history
CREATE TABLE IF NOT EXISTS `workflow_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `workflow_id` int DEFAULT NULL,
  `entity_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` int NOT NULL,
  `entity_ref` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `from_status` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to_status` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `moved_by` int DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `moved_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `from_stage_id` int DEFAULT NULL,
  `to_stage_id` int DEFAULT NULL,
  `process_type_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `workflow_id` (`workflow_id`),
  KEY `moved_by` (`moved_by`),
  KEY `fk_history_from_stage` (`from_stage_id`),
  KEY `fk_history_to_stage` (`to_stage_id`),
  CONSTRAINT `fk_history_from_stage` FOREIGN KEY (`from_stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_history_to_stage` FOREIGN KEY (`to_stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE SET NULL,
  CONSTRAINT `workflow_history_ibfk_1` FOREIGN KEY (`workflow_id`) REFERENCES `workflows` (`id`) ON DELETE SET NULL,
  CONSTRAINT `workflow_history_ibfk_2` FOREIGN KEY (`moved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table accountsmaster.workflow_history: ~11 rows (approximately)
INSERT INTO `workflow_history` (`id`, `workflow_id`, `entity_type`, `entity_id`, `entity_ref`, `from_status`, `to_status`, `moved_by`, `notes`, `moved_at`, `from_stage_id`, `to_stage_id`, `process_type_id`) VALUES
	(1, 4, 'campaign', 8, NULL, NULL, NULL, 1, 'Campaign created via MIS', '2026-10-04 19:12:45', NULL, 109, 13),
	(2, 4, 'campaign', 8, NULL, 'Draft', 'Reviewing', 1, NULL, '2026-10-04 19:13:07', 109, 110, 13),
	(3, 4, 'campaign', 8, 'CMP-2026-10-0007', 'Reviewing', 'Approved', 1, NULL, '2026-10-04 19:13:32', 110, 111, 13),
	(4, 4, 'campaign', 8, 'CMP-2026-10-0007', 'Approved', 'Pending Payment', 1, NULL, '2026-10-04 20:17:11', 111, 116, 13),
	(5, 4, 'campaign', 8, 'CMP-2026-10-0007', 'Pending Payment', 'Payment Done', 1, NULL, '2026-10-04 20:33:28', 116, 117, 13),
	(6, 4, 'campaign', 8, 'CMP-2026-10-0007', 'Payment Done', 'Active', 1, NULL, '2026-10-04 20:36:02', 117, 112, 13),
	(7, 2, 'member', 13, NULL, NULL, NULL, 1, 'Member registered via MIS', '2026-10-19 14:58:14', NULL, 101, 2),
	(8, 2, 'member', 14, NULL, NULL, NULL, 1, 'Member registered via MIS', '2026-10-19 15:19:17', NULL, 101, 2),
	(9, 2, 'member', 15, NULL, NULL, NULL, 1, 'Member registered via MIS', '2026-10-19 15:52:46', NULL, 101, 2),
	(10, 2, 'member', 15, NULL, 'Submitted', 'Under Review', 1, NULL, '2026-10-19 15:52:56', 101, 102, 2),
	(11, 2, 'member', 15, 'MEM-0006', 'Under Review', 'Approved', 1, NULL, '2026-10-19 15:53:12', 102, 103, 2);

-- Dumping structure for table accountsmaster.workflow_stages
CREATE TABLE IF NOT EXISTS `workflow_stages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `workflow_id` int NOT NULL,
  `stage_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `responsible_group` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `workflow_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stage_order` int DEFAULT '0',
  `is_initial` tinyint(1) DEFAULT '0',
  `is_terminal` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `stage_color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `include_in_revenue` tinyint(1) DEFAULT '1',
  `member_can_edit` tinyint(1) DEFAULT '1',
  `send_approval_email` tinyint(1) DEFAULT '0',
  `assign_ref_no` tinyint(1) DEFAULT '0',
  `show_in_grid_default` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `workflow_id` (`workflow_id`),
  CONSTRAINT `workflow_stages_ibfk_1` FOREIGN KEY (`workflow_id`) REFERENCES `workflows` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table accountsmaster.workflow_stages: ~17 rows (approximately)
INSERT INTO `workflow_stages` (`id`, `workflow_id`, `stage_name`, `description`, `responsible_group`, `workflow_status`, `stage_order`, `is_initial`, `is_terminal`, `created_at`, `stage_color`, `include_in_revenue`, `member_can_edit`, `send_approval_email`, `assign_ref_no`, `show_in_grid_default`) VALUES
	(101, 2, 'Submitted', NULL, NULL, NULL, 1, 1, 0, '2026-09-14 12:26:47', '#1677ff', 1, 1, 0, 0, 1),
	(102, 2, 'Under Review', NULL, NULL, NULL, 2, 0, 0, '2026-09-14 12:26:47', '#faad14', 1, 1, 0, 0, 1),
	(103, 2, 'Approved', NULL, NULL, NULL, 3, 0, 1, '2026-09-14 12:26:47', '#52c41a', 1, 1, 1, 1, 1),
	(104, 2, 'Rejected', NULL, NULL, NULL, 4, 0, 1, '2026-09-14 12:26:47', '#ff4d4f', 1, 1, 1, 0, 1),
	(105, 3, 'Submitted', NULL, NULL, NULL, 1, 1, 0, '2026-09-14 12:26:47', '#1677ff', 0, 0, 0, 0, 1),
	(106, 3, 'Under Review', NULL, NULL, NULL, 2, 0, 0, '2026-09-14 12:26:47', '#faad14', 0, 0, 0, 0, 1),
	(107, 3, 'Approved', NULL, NULL, NULL, 3, 0, 1, '2026-09-14 12:26:47', '#52c41a', 0, 0, 1, 1, 1),
	(108, 3, 'Rejected', NULL, NULL, NULL, 4, 0, 1, '2026-09-14 12:26:47', '#ff4d4f', 0, 0, 1, 0, 1),
	(109, 4, 'Draft', NULL, NULL, NULL, 0, 1, 0, '2026-09-14 12:26:47', '#8c8c8c', 1, 1, 0, 0, 1),
	(110, 4, 'Reviewing', NULL, NULL, NULL, 1, 0, 0, '2026-09-14 12:26:47', '#1677ff', 1, 1, 0, 0, 1),
	(111, 4, 'Approved', NULL, NULL, NULL, 2, 0, 0, '2026-09-14 12:26:47', '#13c2c2', 0, 1, 0, 1, 1),
	(112, 4, 'Active', NULL, NULL, NULL, 3, 0, 0, '2026-09-14 12:26:47', '#83bf65', 1, 1, 0, 0, 1),
	(113, 4, 'Completed', NULL, NULL, NULL, 4, 0, 1, '2026-09-14 12:26:47', '#097134', 1, 0, 0, 0, 1),
	(114, 4, 'Rejected', NULL, NULL, NULL, 5, 0, 1, '2026-09-14 12:26:47', '#ff4d4f', 0, 0, 0, 0, 1),
	(115, 4, 'Cancelled', NULL, NULL, NULL, 6, 0, 1, '2026-09-14 12:26:47', '#eb0b0b', 0, 0, 0, 0, 1),
	(116, 4, 'Pending Payment', NULL, NULL, NULL, 0, 0, 0, '2026-09-29 17:41:27', '#e16464', 0, 0, 0, 0, 1),
	(117, 4, 'Payment Done', NULL, NULL, NULL, 0, 0, 0, '2026-09-29 17:42:20', '#79de70', 1, 1, 0, 0, 1),
	(118, 2, 'Withdrawn', NULL, NULL, NULL, 0, 0, 1, '2026-10-19 16:58:05', '#7f1c1c', 1, 0, 0, 0, 1);

-- Dumping structure for table accountsmaster.workflow_transitions
CREATE TABLE IF NOT EXISTS `workflow_transitions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `workflow_id` int NOT NULL,
  `from_stage_id` int NOT NULL,
  `to_stage_id` int NOT NULL,
  `action_label` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Move',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_transition` (`from_stage_id`,`to_stage_id`),
  KEY `workflow_id` (`workflow_id`),
  KEY `to_stage_id` (`to_stage_id`),
  CONSTRAINT `workflow_transitions_ibfk_1` FOREIGN KEY (`workflow_id`) REFERENCES `workflows` (`id`) ON DELETE CASCADE,
  CONSTRAINT `workflow_transitions_ibfk_2` FOREIGN KEY (`from_stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `workflow_transitions_ibfk_3` FOREIGN KEY (`to_stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table accountsmaster.workflow_transitions: ~26 rows (approximately)
INSERT INTO `workflow_transitions` (`id`, `workflow_id`, `from_stage_id`, `to_stage_id`, `action_label`, `created_at`) VALUES
	(101, 2, 101, 102, 'Start Review', '2026-09-14 12:26:47'),
	(102, 2, 102, 103, 'Approve', '2026-09-14 12:26:47'),
	(103, 2, 102, 104, 'Reject', '2026-09-14 12:26:47'),
	(104, 2, 101, 104, 'Reject', '2026-09-14 12:26:47'),
	(105, 3, 105, 106, 'Start Review', '2026-09-14 12:26:47'),
	(106, 3, 106, 107, 'Approve', '2026-09-14 12:26:47'),
	(107, 3, 106, 108, 'Reject', '2026-09-14 12:26:47'),
	(108, 3, 105, 108, 'Reject', '2026-09-14 12:26:47'),
	(109, 4, 109, 110, 'Submit for Review', '2026-09-14 12:26:47'),
	(110, 4, 110, 111, 'Approve', '2026-09-14 12:26:47'),
	(111, 4, 110, 114, 'Reject', '2026-09-14 12:26:47'),
	(112, 4, 111, 112, 'Activate', '2026-09-14 12:26:47'),
	(113, 4, 112, 113, 'Complete', '2026-09-14 12:26:47'),
	(114, 4, 109, 115, 'Cancel', '2026-09-14 12:26:47'),
	(115, 4, 110, 115, 'Cancel', '2026-09-14 12:26:47'),
	(116, 4, 111, 115, 'Cancel', '2026-09-14 12:26:47'),
	(117, 4, 112, 115, 'Cancel', '2026-09-14 12:26:47'),
	(118, 4, 113, 112, 'Re-Activate', '2026-09-22 13:08:44'),
	(119, 4, 111, 116, 'Request Payment', '2026-09-29 17:42:51'),
	(120, 4, 116, 117, 'Paid', '2026-09-29 17:43:27'),
	(121, 4, 117, 112, 'Activate ', '2026-09-29 17:43:59'),
	(122, 4, 116, 115, 'Cancel ', '2026-09-29 17:45:15'),
	(123, 3, 107, 106, 'Re-Review', '2026-10-01 16:47:24'),
	(124, 4, 111, 110, 'Re-Review', '2026-10-01 17:08:28'),
	(125, 2, 103, 118, 'Withdraw', '2026-10-19 16:58:41'),
	(126, 2, 118, 102, 'Re-Review', '2026-10-19 16:59:16');

-- Dumping structure for table accountsmaster.workflows
CREATE TABLE IF NOT EXISTS `workflows` (
  `id` int NOT NULL AUTO_INCREMENT,
  `workflow_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `process_type_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `process_type_id` (`process_type_id`),
  CONSTRAINT `workflows_ibfk_1` FOREIGN KEY (`process_type_id`) REFERENCES `process_types` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table accountsmaster.workflows: ~3 rows (approximately)
INSERT INTO `workflows` (`id`, `workflow_name`, `description`, `process_type_id`, `is_active`, `created_at`, `updated_at`) VALUES
	(2, 'Member Registration Approval', 'Approval flow for new member registrations', 2, 1, '2026-09-14 12:26:47', '2026-10-19 14:54:08'),
	(3, 'Brand Ambassador Registration Approval', 'Approval flow for new WhatsApp status advertiser registrations', NULL, 1, '2026-09-14 12:26:47', '2026-10-01 10:32:40'),
	(4, 'Campaign Approval Workflow', 'Lifecycle for advertising campaigns from draft to completion', NULL, 1, '2026-09-14 12:26:47', '2026-09-14 12:26:47');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
