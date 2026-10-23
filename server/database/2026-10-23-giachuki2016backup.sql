-- --------------------------------------------------------
-- Host:                         31.97.199.20
-- Server version:               8.0.46-0ubuntu0.24.04.4 - (Ubuntu)
-- Server OS:                    Linux
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

-- Dumping structure for table giachuki2016.business
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

-- Dumping data for table giachuki2016.business: ~0 rows (approximately)
INSERT INTO `business` (`id`, `business_name`, `owner_name`, `email`, `phone`, `location`, `incorporation_date`, `logo`, `created_at`, `updated_at`) VALUES
	(1, 'Giachuki 2016 Alumni', 'Evanson Muchai', 'arapchiff@gmail.com', '+254746210500', NULL, '2022-04-04', NULL, '2026-05-06 12:29:31', '2026-10-23 14:28:03');

-- Dumping structure for table giachuki2016.business_shareholders
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table giachuki2016.business_shareholders: ~0 rows (approximately)

-- Dumping structure for table giachuki2016.contribution_rates
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Member contribution rates';

-- Dumping data for table giachuki2016.contribution_rates: ~3 rows (approximately)

-- Dumping structure for table giachuki2016.dashboard_visibility
CREATE TABLE IF NOT EXISTS `dashboard_visibility` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `section_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_visible` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_role_section` (`role_id`,`section_key`),
  CONSTRAINT `dashboard_visibility_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=210 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table giachuki2016.dashboard_visibility: ~4 rows (approximately)
INSERT INTO `dashboard_visibility` (`id`, `role_id`, `section_key`, `is_visible`) VALUES
	(113, 2, 'stat_members', 1),
	(117, 2, 'chart_trend', 1),
	(135, 1, 'stat_members', 1),
	(139, 1, 'chart_trend', 1);

-- Dumping structure for table giachuki2016.email_verification_codes
CREATE TABLE IF NOT EXISTS `email_verification_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `audience` enum('brand_ambassador','member') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` int NOT NULL DEFAULT '0',
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `expires_at` timestamp NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email_verification_lookup` (`audience`,`email`,`created_on`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table giachuki2016.email_verification_codes: ~5 rows (approximately)

-- Dumping structure for table giachuki2016.expenditure
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Expenditure';

-- Dumping data for table giachuki2016.expenditure: ~2 rows (approximately)

-- Dumping structure for table giachuki2016.loyalty_config
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table giachuki2016.loyalty_config: ~0 rows (approximately)

-- Dumping structure for table giachuki2016.loyalty_points
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

-- Dumping data for table giachuki2016.loyalty_points: ~0 rows (approximately)

-- Dumping structure for table giachuki2016.member_next_of_kin
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Next of kin per member';

-- Dumping data for table giachuki2016.member_next_of_kin: ~4 rows (approximately)

-- Dumping structure for table giachuki2016.members
CREATE TABLE IF NOT EXISTS `members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `member_ref_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `member_name` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position_id` int DEFAULT NULL,
  `id_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `firstname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender_id` int DEFAULT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reg_date` date DEFAULT NULL,
  `reg_fee` decimal(12,2) DEFAULT NULL,
  `other_details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
  `legacy_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_ref_no` (`member_ref_no`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `uq_members_legacy_id` (`legacy_id`),
  KEY `FK_clients_workflow` (`workflow_id`),
  KEY `FK_clients_workflow_stage` (`workflow_stage_id`),
  KEY `FK_members_position` (`position_id`),
  KEY `FK_members_gender` (`gender_id`),
  CONSTRAINT `FK_clients_workflow` FOREIGN KEY (`workflow_id`) REFERENCES `workflows` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_clients_workflow_stage` FOREIGN KEY (`workflow_stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_members_gender` FOREIGN KEY (`gender_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_members_position` FOREIGN KEY (`position_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table giachuki2016.members: ~9 rows (approximately)

-- Dumping structure for table giachuki2016.menus
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

-- Dumping data for table giachuki2016.menus: ~23 rows (approximately)
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

-- Dumping structure for table giachuki2016.notification_preferences
CREATE TABLE IF NOT EXISTS `notification_preferences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `audience` enum('mis','brand_ambassador','member') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_id` int NOT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `push_enabled` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_notification_pref` (`audience`,`recipient_id`,`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Per-recipient opt-out of individual notification types';

-- Dumping data for table giachuki2016.notification_preferences: ~1 rows (approximately)

-- Dumping structure for table giachuki2016.notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `audience` enum('mis','brand_ambassador','member') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='In-app notification bell entries for advertisers, clients and MIS staff';

-- Dumping data for table giachuki2016.notifications: ~9 rows (approximately)

-- Dumping structure for table giachuki2016.parameter_values
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

-- Dumping data for table giachuki2016.parameter_values: ~24 rows (approximately)
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

-- Dumping structure for table giachuki2016.parameters
CREATE TABLE IF NOT EXISTS `parameters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parameter_name` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `text_id` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint DEFAULT '1',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table giachuki2016.parameters: ~5 rows (approximately)
INSERT INTO `parameters` (`id`, `parameter_name`, `text_id`, `description`, `is_active`, `created_on`) VALUES
	(1, 'Positions', 'parties-positions', NULL, 1, '2026-10-19 14:29:39'),
	(2, 'Transaction Types', 'transaction-types', NULL, 1, '2026-10-19 14:30:45'),
	(3, 'Genders', 'genders', NULL, 1, '2026-10-19 15:13:31'),
	(4, 'Relationships', 'relationships', NULL, 1, '2026-10-19 15:59:24'),
	(5, 'Time Units', 'time-units', NULL, 1, '2026-10-19 16:17:12');

-- Dumping structure for table giachuki2016.payments
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Payments';

-- Dumping data for table giachuki2016.payments: ~10 rows (approximately)

-- Dumping structure for table giachuki2016.process_types
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

-- Dumping data for table giachuki2016.process_types: ~5 rows (approximately)
INSERT INTO `process_types` (`id`, `process_type_name`, `description`, `data_table`, `created_at`, `updated_at`) VALUES
	(1, 'user_registration', 'User Registration', 'users', '2026-05-06 12:29:31', '2026-06-24 17:14:17'),
	(2, 'member_registration', 'Member Registration', 'members', '2026-05-06 12:29:31', '2026-10-19 14:54:08'),
	(10, 'expenditure_creation', 'Expenditure', 'expenditure', '2026-08-14 13:12:42', '2026-10-19 16:11:56'),
	(15, 'transaction_creation', 'Member Transactions', 'transactions', '2026-10-19 15:32:40', '2026-10-19 15:32:40'),
	(16, 'next_of_kin_registration', 'Member Next of Kin', 'member_next_of_kin', '2026-10-19 16:13:17', '2026-10-19 16:13:17');

-- Dumping structure for table giachuki2016.push_subscriptions
CREATE TABLE IF NOT EXISTS `push_subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipient_id` int NOT NULL,
  `audience` enum('mis','brand_ambassador','member') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'member',
  `endpoint` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `p256dh` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `auth` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pps_endpoint` (`endpoint`(500)),
  KEY `idx_push_sub_recipient` (`audience`,`recipient_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table giachuki2016.push_subscriptions: ~21 rows (approximately)
INSERT INTO `push_subscriptions` (`id`, `recipient_id`, `audience`, `endpoint`, `p256dh`, `auth`, `is_active`, `created_at`) VALUES
	(1, 1, 'mis', 'https://fcm.googleapis.com/fcm/send/djLTBg_07UA:APA91bH186MsvvMmlw4At5YqbWORrRnDTc3x8pusWfxLOlpyNbhmeapTmF31FrdoFg05jzG42UbmO6Qcs_tHe39pKTuRIxcV_6byAKkNSj810LCQRvb5iM1ya0gC3I5Xr3D2GbyVi3nO', 'BHd3PVLCP10WSlwU0XZGos1W3RqKCWKdSBbMXUMe73QJn-liI1yo30p5_BuGfaN9N39cbAsh-u4rRnrT7x3DO4o', 'bE_68yfvJYoIuTkXsGUPGg', 1, '2026-10-23 15:07:07');

-- Dumping structure for table giachuki2016.ref_numbering
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

-- Dumping data for table giachuki2016.ref_numbering: ~5 rows (approximately)
INSERT INTO `ref_numbering` (`id`, `process_type_id`, `prefix`, `initial_serial`, `next_serial`, `use_year`, `use_month`, `padding`, `created_at`, `updated_at`) VALUES
	(1, 1, 'USR', 1, 1, 0, 0, 4, '2026-05-06 12:29:31', '2026-10-23 14:33:17'),
	(2, 2, 'MEM', 1, 1, 0, 0, 4, '2026-05-06 12:29:31', '2026-10-23 14:32:26'),
	(10, 10, 'EXP', 1, 1, 0, 0, 4, '2026-08-14 13:12:42', '2026-10-22 18:21:39'),
	(15, 15, 'TRN', 1, 1, 1, 1, 5, '2026-10-19 15:32:40', '2026-10-23 14:33:03'),
	(16, 16, 'NOK', 1, 1, 0, 0, 4, '2026-10-19 16:13:18', '2026-10-23 14:32:36');

-- Dumping structure for table giachuki2016.role_menu_access
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
) ENGINE=InnoDB AUTO_INCREMENT=1368 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table giachuki2016.role_menu_access: ~44 rows (approximately)
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
	(1290, 2, 40, 1, 1, 1, 1),
	(1293, 2, 41, 1, 0, 0, 0),
	(1296, 2, 42, 1, 1, 1, 1),
	(1345, 1, 1, 1, 1, 1, 1),
	(1346, 1, 2, 1, 1, 1, 0),
	(1347, 1, 3, 1, 1, 1, 0),
	(1348, 1, 4, 1, 1, 1, 0),
	(1349, 1, 5, 1, 1, 1, 1),
	(1350, 1, 6, 1, 1, 1, 0),
	(1351, 1, 7, 1, 1, 1, 0),
	(1352, 1, 8, 1, 1, 1, 1),
	(1353, 1, 9, 1, 1, 1, 1),
	(1354, 1, 16, 1, 1, 1, 1),
	(1355, 1, 17, 1, 1, 1, 1),
	(1356, 1, 22, 1, 1, 1, 0),
	(1357, 1, 23, 1, 1, 1, 1),
	(1358, 1, 27, 1, 1, 1, 1),
	(1359, 1, 28, 1, 1, 1, 1),
	(1360, 1, 29, 1, 1, 1, 0),
	(1361, 1, 30, 1, 1, 1, 1),
	(1362, 1, 31, 1, 1, 1, 1),
	(1363, 1, 33, 1, 1, 1, 1),
	(1364, 1, 35, 1, 1, 1, 1),
	(1365, 1, 40, 1, 1, 1, 1),
	(1366, 1, 41, 1, 0, 0, 0),
	(1367, 1, 42, 1, 1, 1, 1);

-- Dumping structure for table giachuki2016.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table giachuki2016.roles: ~2 rows (approximately)
INSERT INTO `roles` (`id`, `role_name`, `description`, `created_at`, `updated_at`) VALUES
	(1, 'Super Admin', 'Full system access', '2026-05-06 12:29:31', '2026-05-06 12:29:31'),
	(2, 'Admins', 'Administrative access', '2026-05-06 12:29:31', '2026-10-19 16:14:39');

-- Dumping structure for table giachuki2016.targets
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Financial targets';

-- Dumping data for table giachuki2016.targets: ~3 rows (approximately)

-- Dumping structure for table giachuki2016.transactions
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
  `rate_unit` enum('year','month','week','day') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `legacy_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_file_no` (`file_no`),
  UNIQUE KEY `uq_transactions_legacy_id` (`legacy_id`),
  KEY `FK_transactions_member` (`member_id`),
  KEY `FK_transactions_type` (`transaction_type_id`),
  KEY `idx_transactions_date` (`transaction_date`),
  KEY `FK_transactions_rate` (`rate_id`),
  KEY `idx_transactions_member_chain` (`member_id`,`from_date`,`id`),
  CONSTRAINT `FK_transactions_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_transactions_rate` FOREIGN KEY (`rate_id`) REFERENCES `contribution_rates` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_transactions_type` FOREIGN KEY (`transaction_type_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Member financial transactions';

-- Dumping data for table giachuki2016.transactions: ~83 rows (approximately)

-- Dumping structure for table giachuki2016.units
CREATE TABLE IF NOT EXISTS `units` (
  `id` int NOT NULL AUTO_INCREMENT,
  `unit_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unit_name` (`unit_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table giachuki2016.units: ~0 rows (approximately)

-- Dumping structure for table giachuki2016.user_roles
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

-- Dumping data for table giachuki2016.user_roles: ~0 rows (approximately)
INSERT INTO `user_roles` (`id`, `user_id`, `role_id`, `assigned_at`) VALUES
	(1, 1, 1, '2026-10-21 09:58:37');

-- Dumping structure for table giachuki2016.user_sessions
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table giachuki2016.user_sessions: ~8 rows (approximately)

-- Dumping structure for table giachuki2016.users
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

-- Dumping data for table giachuki2016.users: ~2 rows (approximately)
INSERT INTO `users` (`id`, `user_ref_no`, `firstname`, `lastname`, `gender`, `phone`, `email`, `profile_image`, `username`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES
	(1, 'USR-0001', 'Dev', 'Admin', 'Male', NULL, 'admin@salesmaster.com', '/uploads/avatars/user_1_1778159097482.png', 'dev.admin', '$2a$10$FiE8ORNfBCVoPRCJG7aQGO4V2CAVW.wmuHCBlH8SHHqJFhlxQ7vvi', 'active', '2026-10-23 14:25:45', '2026-05-06 12:29:31', '2026-10-23 14:25:45'),
	(6, 'USR-0005', 'System', 'Admin', 'Male', NULL, NULL, '/uploads/avatars/user_6_1779347612177.jpg', 'sys.admin', '$2a$10$8n7T8Mg1KPkVhc4flMPEdujTZRfnljp/86fNCbzVtjvhEjH4N3YHu', 'active', '2026-05-25 12:45:29', '2026-05-14 14:24:04', '2026-06-25 11:18:09');

-- Dumping structure for table giachuki2016.workflow_history
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table giachuki2016.workflow_history: ~11 rows (approximately)

-- Dumping structure for table giachuki2016.workflow_stages
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

-- Dumping data for table giachuki2016.workflow_stages: ~5 rows (approximately)
INSERT INTO `workflow_stages` (`id`, `workflow_id`, `stage_name`, `description`, `responsible_group`, `workflow_status`, `stage_order`, `is_initial`, `is_terminal`, `created_at`, `stage_color`, `include_in_revenue`, `member_can_edit`, `send_approval_email`, `assign_ref_no`, `show_in_grid_default`) VALUES
	(101, 2, 'Submitted', NULL, NULL, NULL, 1, 1, 0, '2026-09-14 12:26:47', '#1677ff', 1, 1, 0, 0, 1),
	(102, 2, 'Under Review', NULL, NULL, NULL, 2, 0, 0, '2026-09-14 12:26:47', '#faad14', 1, 1, 0, 0, 1),
	(103, 2, 'Approved', NULL, NULL, NULL, 3, 0, 1, '2026-09-14 12:26:47', '#52c41a', 1, 1, 1, 1, 1),
	(104, 2, 'Rejected', NULL, NULL, NULL, 4, 0, 1, '2026-09-14 12:26:47', '#ff4d4f', 1, 1, 1, 0, 1),
	(118, 2, 'Withdrawn', NULL, NULL, NULL, 0, 0, 1, '2026-10-19 16:58:05', '#7f1c1c', 1, 0, 0, 0, 1);

-- Dumping structure for table giachuki2016.workflow_transitions
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

-- Dumping data for table giachuki2016.workflow_transitions: ~26 rows (approximately)
INSERT INTO `workflow_transitions` (`id`, `workflow_id`, `from_stage_id`, `to_stage_id`, `action_label`, `created_at`) VALUES
	(101, 2, 101, 102, 'Start Review', '2026-09-14 12:26:47'),
	(102, 2, 102, 103, 'Approve', '2026-09-14 12:26:47'),
	(103, 2, 102, 104, 'Reject', '2026-09-14 12:26:47'),
	(104, 2, 101, 104, 'Reject', '2026-09-14 12:26:47'),
	(125, 2, 103, 118, 'Withdraw', '2026-10-19 16:58:41'),
	(126, 2, 118, 102, 'Re-Review', '2026-10-19 16:59:16');

-- Dumping structure for table giachuki2016.workflows
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

-- Dumping data for table giachuki2016.workflows: ~1 rows (approximately)
INSERT INTO `workflows` (`id`, `workflow_name`, `description`, `process_type_id`, `is_active`, `created_at`, `updated_at`) VALUES
	(2, 'Member Registration Approval', 'Approval flow for new member registrations', 2, 1, '2026-09-14 12:26:47', '2026-10-19 14:54:08');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
