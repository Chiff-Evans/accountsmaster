-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: venturebrite
-- ------------------------------------------------------
-- Server version	8.0.26

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `file_no` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `client_id` int DEFAULT NULL,
  `company_id` int DEFAULT NULL,
  `trip_id` int DEFAULT NULL,
  `no_of_adults` int DEFAULT NULL,
  `no_of_kids` int DEFAULT NULL,
  `discount` int DEFAULT '0',
  `comments` text COLLATE utf8mb4_unicode_ci,
  `cancel_requested` int DEFAULT '0',
  `workflow_id` int DEFAULT NULL,
  `workflow_stage_id` int DEFAULT NULL,
  `created_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `company_key` int GENERATED ALWAYS AS (coalesce(`company_id`,0)) STORED,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `unique_booking` (`client_id`,`trip_id`,`company_key`),
  KEY `FK_bookings_trips` (`trip_id`) USING BTREE,
  KEY `FK_bookings_workflows` (`workflow_id`),
  KEY `FK_bookings_workflow_stages` (`workflow_stage_id`),
  KEY `FK_bookings_shops` (`company_id`),
  KEY `idx_bookings_client` (`client_id`),
  CONSTRAINT `FK_bookings_clients` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  CONSTRAINT `FK_bookings_shops` FOREIGN KEY (`company_id`) REFERENCES `shops` (`id`),
  CONSTRAINT `FK_bookings_trips` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`),
  CONSTRAINT `FK_bookings_workflow_stages` FOREIGN KEY (`workflow_stage_id`) REFERENCES `workflow_stages` (`id`),
  CONSTRAINT `FK_bookings_workflows` FOREIGN KEY (`workflow_id`) REFERENCES `workflows` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (3,'ADV/BKNG-00001',1,NULL,2,3,1,0,NULL,0,1,2,'2026-08-14 16:09:56',0),(4,'ADV/BKNG-00002',3,NULL,2,1,1,0,NULL,0,1,1,'2026-08-14 16:18:37',0),(5,'ADV/BKNG-00003',2,NULL,2,2,0,0,NULL,0,1,3,'2026-08-14 16:19:00',0),(6,'ADV/BKNG-00004',1,NULL,5,3,0,0,NULL,0,1,1,'2026-08-14 17:19:16',0),(7,'ADV/BKNG-00005',1,NULL,6,2,0,1000,NULL,0,1,12,'2026-08-17 12:56:06',0),(9,'ADV/BKNG-00006',2,NULL,6,2,0,0,NULL,0,1,1,'2026-08-17 16:12:12',0),(12,'ADV/BKNG-00007',1,3,7,25,0,0,NULL,0,1,2,'2026-08-17 18:14:01',3),(13,'ADV/BKNG-00008',2,4,5,10,0,0,NULL,0,1,1,'2026-08-18 09:32:09',4);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business`
--

DROP TABLE IF EXISTS `business`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `business` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business`
--

LOCK TABLES `business` WRITE;
/*!40000 ALTER TABLE `business` DISABLE KEYS */;
INSERT INTO `business` VALUES (1,'Vuenture Brite Adventures','Evanson Muchai','info@business.com','+254700000000',NULL,'2026-06-01',NULL,'2026-05-06 12:29:31','2026-08-14 16:24:18');
/*!40000 ALTER TABLE `business` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_shareholders`
--

DROP TABLE IF EXISTS `business_shareholders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `business_shareholders` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_shareholders`
--

LOCK TABLES `business_shareholders` WRITE;
/*!40000 ALTER TABLE `business_shareholders` DISABLE KEYS */;
INSERT INTO `business_shareholders` VALUES (1,1,'Shareholder\'s One Name','Owner','1111222233','07434353522',NULL,5.00,250000.00,'2026-06-24 17:05:12');
/*!40000 ALTER TABLE `business_shareholders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_category_id` int DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `parent_category_id` (`parent_category_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_ref_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `firstname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` enum('Male','Female','Other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','locked','suspended','revoked') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `loyalty_points` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_ref_no` (`client_ref_no`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (1,'ADV/CLT-0001','Evanson','Muchai','Male','0746210500','emailexample@hotmail.com','evanson','$2a$10$nKX33toJgQrF.v2.DLulUu70ryN5Wcoga4kg3yqW4l4p/nsvWwpnC',NULL,'active','2026-06-15 10:38:35','2026-08-14 14:45:14',86),(2,'ADV/CLT-0002','Jonathan','David','Male','0745098765',NULL,'jonathan','$2a$10$yWALXJ8vgkGvyU1k3/2koepR6V/Ll8s4Atb09GuA4M0ujM04QGgCi',NULL,'active','2026-08-14 16:17:51','2026-08-18 09:29:46',0),(3,'ADV/CLT-0003','Peninah','Muchai','Female','0714325652',NULL,NULL,NULL,NULL,'active','2026-08-14 16:18:22','2026-08-14 16:18:22',0);
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dashboard_visibility`
--

DROP TABLE IF EXISTS `dashboard_visibility`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dashboard_visibility` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `section_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_visible` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_role_section` (`role_id`,`section_key`),
  CONSTRAINT `dashboard_visibility_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=210 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dashboard_visibility`
--

LOCK TABLES `dashboard_visibility` WRITE;
/*!40000 ALTER TABLE `dashboard_visibility` DISABLE KEYS */;
INSERT INTO `dashboard_visibility` VALUES (1,3,'stat_orders',1),(2,3,'stat_revenue',0),(3,3,'stat_clients',1),(4,3,'stat_stock',1),(5,3,'stat_suppliers',0),(6,3,'stat_low_stock',1),(7,3,'chart_trend',1),(8,3,'chart_status',1),(9,3,'chart_top_items',1),(10,3,'chart_recent_orders',0),(11,3,'chart_stock_cat',1),(34,4,'stat_orders',1),(35,4,'stat_revenue',0),(36,4,'stat_clients',0),(37,4,'stat_stock',1),(38,4,'stat_suppliers',1),(39,4,'stat_low_stock',1),(40,4,'chart_trend',0),(41,4,'chart_status',1),(42,4,'chart_top_items',1),(43,4,'chart_recent_orders',0),(44,4,'chart_stock_cat',1),(111,2,'stat_orders',1),(112,2,'stat_revenue',1),(113,2,'stat_clients',1),(114,2,'stat_stock',1),(115,2,'stat_suppliers',1),(116,2,'stat_low_stock',1),(117,2,'chart_trend',1),(118,2,'chart_status',1),(119,2,'chart_top_items',1),(120,2,'chart_recent_orders',0),(121,2,'chart_stock_cat',1),(133,1,'stat_orders',1),(134,1,'stat_revenue',1),(135,1,'stat_clients',1),(136,1,'stat_stock',1),(137,1,'stat_suppliers',1),(138,1,'stat_low_stock',1),(139,1,'chart_trend',1),(140,1,'chart_status',1),(141,1,'chart_top_items',1),(142,1,'chart_recent_orders',1),(143,1,'chart_stock_cat',1),(144,6,'stat_orders',0),(145,6,'stat_revenue',0),(146,6,'stat_clients',1),(147,6,'stat_stock',1),(148,6,'stat_suppliers',0),(149,6,'stat_low_stock',0),(150,6,'chart_trend',0),(151,6,'chart_status',1),(152,6,'chart_top_items',1),(153,6,'chart_recent_orders',1),(154,6,'chart_stock_cat',1);
/*!40000 ALTER TABLE `dashboard_visibility` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenditure`
--

DROP TABLE IF EXISTS `expenditure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `expenditure` (
  `id` int NOT NULL AUTO_INCREMENT,
  `file_no` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trip_id` int NOT NULL DEFAULT '0',
  `expenditure_type_id` int DEFAULT NULL,
  `currency_id` int DEFAULT NULL,
  `amount` int DEFAULT NULL,
  `reference` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expenditure_date` date DEFAULT NULL,
  `done_by` int DEFAULT NULL,
  `comments` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_expenditure_trips` (`trip_id`) USING BTREE,
  KEY `FK_expenditure_parameter_values` (`currency_id`) USING BTREE,
  KEY `FK_expenditure_parameter_values_2` (`expenditure_type_id`) USING BTREE,
  CONSTRAINT `FK_expenditure_parameter_values` FOREIGN KEY (`currency_id`) REFERENCES `parameter_values` (`id`),
  CONSTRAINT `FK_expenditure_parameter_values_2` FOREIGN KEY (`expenditure_type_id`) REFERENCES `parameter_values` (`id`),
  CONSTRAINT `FK_expenditure_trips` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Expenditure';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenditure`
--

LOCK TABLES `expenditure` WRITE;
/*!40000 ALTER TABLE `expenditure` DISABLE KEYS */;
INSERT INTO `expenditure` VALUES (2,'ADV/EXP-0001',2,22,19,5000,NULL,'2026-08-14',1,NULL,1,'2026-08-14 16:16:00',NULL,NULL),(3,'ADV/EXP-0002',2,23,19,2000,NULL,'2026-08-14',1,NULL,1,'2026-08-14 16:20:20',NULL,NULL);
/*!40000 ALTER TABLE `expenditure` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `item_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` int DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `item_code` (`item_code`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loyalty_config`
--

DROP TABLE IF EXISTS `loyalty_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `loyalty_config` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loyalty_config`
--

LOCK TABLES `loyalty_config` WRITE;
/*!40000 ALTER TABLE `loyalty_config` DISABLE KEYS */;
INSERT INTO `loyalty_config` VALUES (1,1000.00,1000.00,12,1,'2026-06-15 13:02:25','2026-06-15 13:23:02');
/*!40000 ALTER TABLE `loyalty_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loyalty_points`
--

DROP TABLE IF EXISTS `loyalty_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `loyalty_points` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `order_id` int NOT NULL,
  `points` int NOT NULL DEFAULT '0',
  `order_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lp_order` (`order_id`),
  KEY `fk_lp_client` (`client_id`),
  CONSTRAINT `fk_lp_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lp_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loyalty_points`
--

LOCK TABLES `loyalty_points` WRITE;
/*!40000 ALTER TABLE `loyalty_points` DISABLE KEYS */;
/*!40000 ALTER TABLE `loyalty_points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menus`
--

DROP TABLE IF EXISTS `menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `menus` (
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
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menus`
--

LOCK TABLES `menus` WRITE;
/*!40000 ALTER TABLE `menus` DISABLE KEYS */;
INSERT INTO `menus` VALUES (1,'Dashboard',NULL,1,'/dashboard',0,'DashboardOutlined','Main dashboard',1,'2026-05-06 12:29:31','2026-05-11 10:20:23'),(2,'Configurations',NULL,1,NULL,6,'SettingOutlined','System configurations',1,'2026-05-06 12:29:31','2026-05-06 15:15:15'),(3,'Business Setup',2,2,'/config/business',0,'ShopOutlined','Business information',1,'2026-05-06 12:29:31','2026-05-06 12:29:31'),(4,'System Menus',2,2,'/config/menus',1,'MenuOutlined','Manage menus',1,'2026-05-06 12:29:31','2026-05-11 10:22:29'),(5,'Groups',8,2,'/config/roles',2,'TeamOutlined','Manage roles',1,'2026-05-06 12:29:31','2026-08-14 16:23:29'),(6,'Process Types',2,2,'/config/process-types',3,'ApartmentOutlined','Manage process types',1,'2026-05-06 12:29:31','2026-05-06 12:29:31'),(7,'Ref Numbering',2,2,'/config/ref-numbering',4,'NumberOutlined','Reference numbering',1,'2026-05-06 12:29:31','2026-05-06 12:29:31'),(8,'Users and Roles',NULL,1,NULL,5,'UserOutlined','User administration',1,'2026-05-06 12:29:31','2026-06-15 10:08:24'),(9,'Users',8,2,'/users',0,'UserAddOutlined','Manage users',1,'2026-05-06 12:29:31','2026-05-06 12:29:31'),(10,'Trips',NULL,1,NULL,3,'DatabaseOutlined','Inventory management',1,'2026-05-06 12:29:31','2026-08-13 15:58:01'),(11,'Revenue',31,2,'/stock/payments',1,'AppstoreOutlined','Trip/event payments',1,'2026-05-06 12:29:31','2026-08-14 14:02:06'),(13,'Trips Catalogue',10,2,'/stock/items',0,'TagOutlined','Items/Products catalogue',1,'2026-05-06 12:29:31','2026-08-14 11:32:20'),(16,'Clients',NULL,1,NULL,2,'ContactsOutlined','Client management',1,'2026-05-06 12:29:31','2026-06-15 10:07:45'),(17,'Clients',16,2,'/clients',0,'UserOutlined','Manage clients',1,'2026-05-06 12:29:31','2026-05-06 12:29:31'),(18,'Groups',16,2,'/clients/shops',1,'ShopOutlined','Manage shops',1,'2026-05-06 12:29:31','2026-08-18 10:05:56'),(21,'Bookings',26,2,'/orders',1,'ShoppingCartOutlined','Incoming Orders',1,'2026-05-06 12:29:31','2026-08-13 15:58:01'),(22,' Dashboard',8,2,'/config/dashboard',3,'DashboardOutlined',' Dashboard Configurations',1,'2026-05-07 15:43:24','2026-05-14 09:05:00'),(23,'Workflows',2,2,'/config/workflows',6,'ApartmentOutlined',NULL,1,'2026-05-13 12:47:04','2026-05-13 12:47:04'),(24,'Receipt Setup',31,2,'/stock/receipt-config',3,'FileTextOutlined',NULL,1,'2026-05-26 13:39:22','2026-08-14 14:02:18'),(26,'Bookings',NULL,1,NULL,0,'ShoppingCartOutlined','Orders Management',1,'2026-06-01 14:08:11','2026-08-13 15:58:01'),(27,'Reporting',NULL,1,NULL,8,'BarChartOutlined',NULL,1,'2026-06-02 16:48:24','2026-06-02 16:48:24'),(28,'Sales',27,2,'/reports/sales',1,'LineChartOutlined',NULL,1,'2026-06-02 16:48:24','2026-06-02 16:48:24'),(29,'Loyalty Points',2,2,'/config/loyalty',15,'TrophyOutlined',NULL,1,'2026-06-15 13:02:25','2026-06-15 13:02:25'),(30,'Parameters',2,2,'/config/parameters',16,'ControlOutlined','Generic configuration lookups (parameters and their values)',1,'2026-08-13 15:58:01','2026-08-13 15:58:01'),(31,'Accounts',NULL,1,NULL,0,'DollarOutlined',NULL,1,'2026-08-14 10:04:36','2026-08-14 14:04:50'),(32,'Participants',10,2,'/stock/participants',4,'TeamOutlined','Trip/event participants',1,'2026-08-14 13:12:42','2026-08-14 13:12:42'),(33,'Expenditure',31,2,'/stock/expenditure',5,'WalletOutlined','Trip/event expenditure',1,'2026-08-14 13:12:42','2026-08-14 14:02:29');
/*!40000 ALTER TABLE `menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `item_id` int NOT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `unit_id` int DEFAULT NULL,
  `unit_price` decimal(12,2) DEFAULT '0.00',
  `subtotal` decimal(14,2) GENERATED ALWAYS AS ((`quantity` * `unit_price`)) STORED,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `item_id` (`item_id`),
  KEY `unit_id` (`unit_id`),
  CONSTRAINT `fk_order_items_trip` FOREIGN KEY (`item_id`) REFERENCES `trips` (`id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_receipts`
--

DROP TABLE IF EXISTS `order_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_receipts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `receipt_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `order_id` int NOT NULL,
  `payment_details` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `customer_care_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tax_no` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_mode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Cash',
  `paid_amount` decimal(15,2) DEFAULT NULL,
  `balance` decimal(15,2) DEFAULT NULL,
  `payment_reference` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `other_conditions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `printed_at` datetime DEFAULT NULL,
  `printed_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `discount` decimal(12,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `receipt_no` (`receipt_no`),
  KEY `order_id` (`order_id`),
  KEY `printed_by` (`printed_by`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `order_receipts_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_receipts_ibfk_2` FOREIGN KEY (`printed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `order_receipts_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `order_receipts_ibfk_4` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_receipts`
--

LOCK TABLES `order_receipts` WRITE;
/*!40000 ALTER TABLE `order_receipts` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_ref_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shop_id` int DEFAULT NULL,
  `client_id` int DEFAULT NULL,
  `ordered_by` int DEFAULT NULL,
  `assigned_driver_id` int DEFAULT NULL,
  `workflow_status` enum('pending','confirmed','processing','on_hold','shipped','delivered','completed','cancelled','awaiting_payment','payment_done','refunded','returned') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `order_status` enum('in_progress','done','cancelled','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'in_progress',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `total_amount` decimal(14,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `workflow_id` int DEFAULT NULL,
  `workflow_stage_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_ref_no` (`order_ref_no`),
  KEY `shop_id` (`shop_id`),
  KEY `ordered_by` (`ordered_by`),
  KEY `fk_orders_workflow` (`workflow_id`),
  KEY `fk_orders_stage` (`workflow_stage_id`),
  KEY `fk_orders_driver` (`assigned_driver_id`),
  KEY `fk_orders_client` (`client_id`),
  CONSTRAINT `fk_orders_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_orders_driver` FOREIGN KEY (`assigned_driver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_orders_stage` FOREIGN KEY (`workflow_stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_orders_workflow` FOREIGN KEY (`workflow_id`) REFERENCES `workflows` (`id`) ON DELETE SET NULL,
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE SET NULL,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`ordered_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parameter_values`
--

DROP TABLE IF EXISTS `parameter_values`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parameter_values` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parameter_id` int DEFAULT NULL,
  `paramater_value` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint DEFAULT '1',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_parameter_values_parameters` (`parameter_id`) USING BTREE,
  CONSTRAINT `FK_parameter_values_parameters` FOREIGN KEY (`parameter_id`) REFERENCES `parameters` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parameter_values`
--

LOCK TABLES `parameter_values` WRITE;
/*!40000 ALTER TABLE `parameter_values` DISABLE KEYS */;
INSERT INTO `parameter_values` VALUES (1,1,'Active','',1,'2026-08-13 15:58:01'),(2,1,'Inactive','',1,'2026-08-13 15:58:01'),(3,1,'Suspended','',1,'2026-08-13 15:58:01'),(4,2,'English','',1,'2026-08-13 15:58:01'),(5,4,'National Identity Card','',1,'2026-08-13 15:58:01'),(6,4,'Passport',NULL,1,'2026-08-13 15:58:01'),(7,3,'Male',NULL,1,'2026-08-13 15:58:01'),(8,3,'Female',NULL,1,'2026-08-13 15:58:01'),(9,3,'Others',NULL,1,'2026-08-13 15:58:01'),(10,5,'Software Developer',NULL,1,'2026-08-13 15:58:01'),(11,5,'System Administrator',NULL,1,'2026-08-13 15:58:01'),(12,5,'Business Administrator',NULL,1,'2026-08-13 15:58:01'),(13,6,'Booked',NULL,1,'2026-08-13 15:58:01'),(14,6,'Fully Paid',NULL,1,'2026-08-13 15:58:01'),(15,6,'Partially Paid',NULL,1,'2026-08-13 15:58:01'),(16,2,'Swahili',NULL,1,'2026-08-13 15:58:01'),(17,7,'Approved',NULL,1,'2026-08-13 15:58:01'),(18,7,'Cancelled',NULL,1,'2026-08-13 15:58:01'),(19,8,'KSH',NULL,1,'2026-08-13 15:58:01'),(22,9,'Transport','',1,'2026-08-13 15:58:01'),(23,9,'Photography','',1,'2026-08-13 15:58:01'),(24,9,'Entrance Fee','',1,'2026-08-13 15:58:01'),(25,9,'Food and beverage ','',1,'2026-08-13 15:58:01'),(26,10,'Transport ','',1,'2026-08-13 15:58:01'),(27,10,'Lunch','',1,'2026-08-13 15:58:01'),(28,10,'Proffesinal/Epic photography','',1,'2026-08-13 15:58:01'),(29,10,'Mudfun','',1,'2026-08-13 15:58:01'),(30,10,'Canopy walk','',1,'2026-08-13 15:58:01'),(31,10,'Team building','',1,'2026-08-13 15:58:01'),(32,10,'Zumba dance','',1,'2026-08-13 15:58:01'),(33,10,'Ice breakers','',1,'2026-08-13 15:58:01'),(34,10,'Guide fee','',1,'2026-08-13 15:58:01'),(35,10,'Entrance fee','',1,'2026-08-13 15:58:01'),(36,10,'Snacks','',1,'2026-08-13 15:58:01'),(37,10,'Drinking Water','',1,'2026-08-13 15:58:01'),(38,10,'Anything not in inclusives','',1,'2026-08-13 15:58:01'),(39,10,'Swimming','',1,'2026-08-13 15:58:01'),(40,10,'Meals on halfboard','',1,'2026-08-13 15:58:01'),(41,11,'Adult','E.g. Over 12 years',1,'2026-08-13 15:58:01'),(42,11,'Kid','E.g. Under 12 years',1,'2026-08-13 15:58:01'),(43,12,'Individual','',1,'2026-08-13 15:58:01'),(44,12,'Couple','',1,'2026-08-13 15:58:01'),(45,12,'Corporate','',1,'2026-08-13 15:58:01'),(46,12,'Kid','',1,'2026-08-13 15:58:01'),(47,8,'USD',NULL,0,'2026-08-13 15:58:01'),(48,13,'Pending Review','Pending Review',1,'2026-08-13 15:58:01'),(49,13,'Approved','Approved',1,'2026-08-13 15:58:01'),(50,13,'Rejected','Rejected',1,'2026-08-13 15:58:01'),(51,1,'Revoked','Revoked',1,'2026-08-13 15:58:01'),(52,10,'Boat Riding','Boat Riding',1,'2026-08-13 15:58:01'),(53,10,'Rock climbing','Rock climbing',1,'2026-08-13 15:58:01'),(54,10,'Hiking','',1,'2026-08-13 15:58:01'),(55,10,'Mental health Talk ','Mental health Talk ',1,'2026-08-13 15:58:01'),(56,10,'Fishing','Fishing',1,'2026-08-13 15:58:01'),(57,10,'Gamings','',1,'2026-08-13 15:58:01');
/*!40000 ALTER TABLE `parameter_values` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parameters`
--

DROP TABLE IF EXISTS `parameters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parameters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parameter_name` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text_id` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint DEFAULT '1',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parameters`
--

LOCK TABLES `parameters` WRITE;
/*!40000 ALTER TABLE `parameters` DISABLE KEYS */;
INSERT INTO `parameters` VALUES (1,'Client Statuses','client_statuses','',1,'2026-08-13 15:58:01'),(2,'Languages','languages','',1,'2026-08-13 15:58:01'),(3,'Genders/ Sex','genders',NULL,1,'2026-08-13 15:58:01'),(4,'Identity Types','id_types',NULL,1,'2026-08-13 15:58:01'),(5,'Occupations','occupations',NULL,1,'2026-08-13 15:58:01'),(6,'Participation Statuses','participation_stutuses',NULL,1,'2026-08-13 15:58:01'),(7,'Trip Statuses','trip_statuses',NULL,1,'2026-08-13 15:58:01'),(8,'Currencies','currencies',NULL,1,'2026-08-13 15:58:01'),(9,'Types of Expenditures','expenditure_types',NULL,1,'2026-08-13 15:58:01'),(10,'Trip activities','trip_activities','Trip inclusions and exclusions',1,'2026-08-13 15:58:01'),(11,'Client Categories','client_categories',NULL,1,'2026-08-13 15:58:01'),(12,'Client Types','client_types',NULL,1,'2026-08-13 15:58:01'),(13,'Onboarding Statuses','onboarding_statuses',NULL,1,'2026-08-13 15:58:01');
/*!40000 ALTER TABLE `parameters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `participants`
--

DROP TABLE IF EXISTS `participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `participants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `file_no` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trip_id` int NOT NULL DEFAULT '0',
  `client_id` int NOT NULL DEFAULT '0',
  `status_id` int DEFAULT NULL,
  `booking_id` int DEFAULT NULL,
  `no_of_adults` int DEFAULT '1',
  `no_of_kids` int DEFAULT '0',
  `discount` int DEFAULT '0',
  `comments` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_participants_trips` (`trip_id`) USING BTREE,
  KEY `FK_participants_clients` (`client_id`) USING BTREE,
  KEY `FK_participants_parameter_values` (`status_id`) USING BTREE,
  KEY `FK_participants_bookings` (`booking_id`) USING BTREE,
  CONSTRAINT `FK_participants_bookings` FOREIGN KEY (`booking_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `FK_participants_clients` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  CONSTRAINT `FK_participants_parameter_values` FOREIGN KEY (`status_id`) REFERENCES `parameter_values` (`id`),
  CONSTRAINT `FK_participants_trips` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Trips and Events Participants Table';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `participants`
--

LOCK TABLES `participants` WRITE;
/*!40000 ALTER TABLE `participants` DISABLE KEYS */;
/*!40000 ALTER TABLE `participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `file_no` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trip_id` int NOT NULL DEFAULT '0',
  `client_id` int NOT NULL DEFAULT '0',
  `company_id` int DEFAULT NULL,
  `currency_id` int DEFAULT NULL,
  `amount` int DEFAULT NULL,
  `reference` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `received_by` int DEFAULT NULL,
  `comments` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_paymentss_trips` (`trip_id`) USING BTREE,
  KEY `FK_paymentss_clients` (`client_id`) USING BTREE,
  KEY `FK_paymentss_parameter_values` (`currency_id`) USING BTREE,
  KEY `FK_payments_shops` (`company_id`),
  CONSTRAINT `FK_payments_shops` FOREIGN KEY (`company_id`) REFERENCES `shops` (`id`),
  CONSTRAINT `FK_paymentss_clients` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  CONSTRAINT `FK_paymentss_parameter_values` FOREIGN KEY (`currency_id`) REFERENCES `parameter_values` (`id`),
  CONSTRAINT `FK_paymentss_trips` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Payments';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (2,'ADV/PAY/0001',2,1,NULL,19,2000,NULL,'2026-08-14',1,NULL,1,'2026-08-14 16:16:15',1,'2026-08-17 14:08:38'),(3,'ADV/PAY/0002',2,2,NULL,19,5000,NULL,'2026-08-14',1,NULL,1,'2026-08-14 16:19:38',NULL,NULL),(4,'ADV/PAY/0003',2,3,NULL,19,4000,NULL,'2026-08-14',1,NULL,1,'2026-08-14 16:19:58',NULL,NULL),(5,'ADV/PAY/0004',2,1,NULL,19,3000,NULL,'2026-08-17',1,NULL,1,'2026-08-17 14:09:00',1,'2026-08-17 14:24:47'),(6,'ADV/PAY/0005',6,2,NULL,19,12000,NULL,'2026-08-17',1,NULL,1,'2026-08-17 16:16:12',NULL,NULL),(7,'ADV/PAY/0006',6,1,NULL,19,24000,NULL,'2026-08-17',1,NULL,1,'2026-08-17 16:51:08',NULL,NULL),(10,'ADV/PAY/0007',5,2,4,19,50000,NULL,'2026-08-18',1,NULL,1,'2026-08-18 10:46:13',NULL,NULL);
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `portal_push_subscriptions`
--

DROP TABLE IF EXISTS `portal_push_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `portal_push_subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `endpoint` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `p256dh` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `auth` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pps_endpoint` (`endpoint`(500)),
  KEY `idx_pps_client` (`client_id`),
  CONSTRAINT `fk_pps_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `portal_push_subscriptions`
--

LOCK TABLES `portal_push_subscriptions` WRITE;
/*!40000 ALTER TABLE `portal_push_subscriptions` DISABLE KEYS */;
INSERT INTO `portal_push_subscriptions` VALUES (17,1,'https://fcm.googleapis.com/fcm/send/de7nGtzYHSo:APA91bHLNsCI99a-pQFDr_wZDdz9k_xqDZFCyGX5C59pGrEhv5qZIIr_pbx-Klbv6rQncYsbDi7zwyQUQEf_Qyuot4IwSlBdf9YEDAzE7zSDD3VqeN9BVpDkdMmURivfgodh91qbCUbn','BC78f5_sElaMuulB9mamplg2L4pr4KQ8LR9un6NC7Ig985_TulbYX1u6ywfJ3aWSXzU2ysQlTNzHb-q5rBZNq2Q','T6HvxF849aRVq1L8zfvtcw',1,'2026-06-23 11:37:53'),(48,1,'https://fcm.googleapis.com/fcm/send/dE1c_Spvkow:APA91bEs490SYDHqecMkp_P1Eiik1ukzftoh2F6Dbt2eTPn_EKOafZ5sQ48tYU6va05UIjCYRiFOiSrw-9l8FYXEkiXooDBl63cP_wL9McpzRj1aGeU9FIKnMstMD3fVDjozhIKob_Wp','BOTye-wPN3SxOExYsDaAljVe4huKkxWSJzjzUdk2n0DEierv79VBJTgXF5lbThevkrXJSmqwM58xGoxi0YKU-X4','2tSfblhgHK2G-6ouXKjMxQ',0,'2026-08-14 15:20:23'),(62,1,'https://fcm.googleapis.com/fcm/send/eeV9m9gboyk:APA91bGQPQDe_7NT22xOhx_nNwEvYzZIIjkKOfHM8l6_RTywnPZsbdq44HW7E6rt_vkZJaR2aetOloSxGLUlgS-HsnCuIDRXGDQy1xq1C67dAyzqCqXYTjqVwLNo_Rg7ggPoM61dU0Hv','BKvlkPjwsuNkLfFLXld66zteiwUeIhpnwUhqKvI0Y0TZO0oIRi1QZRrvYakEcjz0F27AHNt6x9dDcP0xXhOKbz8','sA06nzZcTD_vnMg9TclUuQ',1,'2026-08-17 16:17:07');
/*!40000 ALTER TABLE `portal_push_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `process_types`
--

DROP TABLE IF EXISTS `process_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `process_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `process_type_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `data_table` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `process_type_name` (`process_type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `process_types`
--

LOCK TABLES `process_types` WRITE;
/*!40000 ALTER TABLE `process_types` DISABLE KEYS */;
INSERT INTO `process_types` VALUES (1,'user_registration','User Registration','users','2026-05-06 12:29:31','2026-06-24 17:14:17'),(2,'client_registration','Client Registration','clients','2026-05-06 12:29:31','2026-06-24 17:13:16'),(4,'order_placement','Order Placement','bookings','2026-05-06 12:29:31','2026-08-17 15:44:48'),(7,'order_receipt','Order Receipt',NULL,'2026-05-26 10:20:14','2026-05-26 10:20:14'),(8,'trip_event_Creation','Trip/events','trips','2026-08-14 08:51:24','2026-08-14 08:51:24'),(9,'participant_registration','Trip/Event Participants','participants','2026-08-14 13:12:42','2026-08-14 13:12:42'),(10,'expenditure_creation','Trip/Event Expenditure','expenditure','2026-08-14 13:12:42','2026-08-14 13:12:42'),(11,'payment_creation','Trip/Event Payments','payments','2026-08-14 13:54:44','2026-08-14 13:54:44');
/*!40000 ALTER TABLE `process_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receipt_config`
--

DROP TABLE IF EXISTS `receipt_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `receipt_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `config_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Default',
  `payment_details` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `customer_care_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `other_conditions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `receipt_config_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `receipt_config_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receipt_config`
--

LOCK TABLES `receipt_config` WRITE;
/*!40000 ALTER TABLE `receipt_config` DISABLE KEYS */;
INSERT INTO `receipt_config` VALUES (1,'Receipt Configurations','EQUITY ACCOUNT NO. 0713269635','0117107055','ARAPCHIFF@GMAIL.COM','<p><strong>All payments should be made to QUICK NEST SHELVES No cash payment to be made to any of our staff and we are not liable for it.Goods once sold are not refundable.</strong></p>','2026-05-26 18:21:26',1,'2026-08-14 16:15:31',1);
/*!40000 ALTER TABLE `receipt_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ref_numbering`
--

DROP TABLE IF EXISTS `ref_numbering`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ref_numbering` (
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_numbering`
--

LOCK TABLES `ref_numbering` WRITE;
/*!40000 ALTER TABLE `ref_numbering` DISABLE KEYS */;
INSERT INTO `ref_numbering` VALUES (1,1,'ADV/USR',1,9,0,0,4,'2026-05-06 12:29:31','2026-08-14 13:42:40'),(2,2,'ADV/CLT',1,4,0,0,4,'2026-05-06 12:29:31','2026-08-14 16:18:22'),(4,4,'ADV/BKNG',1,9,0,0,5,'2026-05-06 12:29:31','2026-08-18 09:32:09'),(7,7,'ADV/RCP',1,1,0,0,5,'2026-05-26 10:20:14','2026-08-14 13:43:45'),(8,8,'ADV/TRP',1,5,0,0,4,'2026-08-14 08:51:24','2026-08-17 18:09:06'),(9,9,'ADV/PAT',1,1,0,0,4,'2026-08-14 13:12:42','2026-08-14 13:41:56'),(10,10,'ADV/EXP',1,3,0,0,4,'2026-08-14 13:12:42','2026-08-14 16:20:20'),(11,11,'ADV/PAY/',1,8,0,0,4,'2026-08-14 13:54:44','2026-08-18 10:46:13');
/*!40000 ALTER TABLE `ref_numbering` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_menu_access`
--

DROP TABLE IF EXISTS `role_menu_access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_menu_access` (
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
) ENGINE=InnoDB AUTO_INCREMENT=988 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_menu_access`
--

LOCK TABLES `role_menu_access` WRITE;
/*!40000 ALTER TABLE `role_menu_access` DISABLE KEYS */;
INSERT INTO `role_menu_access` VALUES (731,3,1,1,0,0,0),(732,3,2,1,0,0,0),(733,3,10,1,0,0,0),(734,3,11,0,0,0,0),(735,3,13,1,0,0,0),(737,3,16,1,1,1,0),(738,3,17,1,1,1,0),(739,3,18,1,1,1,0),(740,3,21,1,1,1,0),(741,3,23,1,0,0,0),(743,3,26,1,1,1,0),(848,4,1,1,0,0,0),(849,4,2,0,0,0,0),(850,4,10,1,1,1,0),(851,4,11,1,1,1,0),(853,4,13,1,1,1,0),(856,4,21,1,1,1,0),(857,4,24,1,1,1,0),(859,4,26,1,1,1,0),(860,4,27,1,0,0,0),(861,4,28,1,0,0,0),(891,6,1,1,0,0,0),(892,6,13,1,0,0,0),(895,6,16,1,0,0,0),(896,6,17,1,0,0,0),(897,6,18,1,0,0,0),(898,6,21,1,1,1,0),(899,6,26,1,1,1,0),(910,2,1,1,1,1,1),(911,2,2,1,1,1,0),(912,2,3,1,1,1,0),(913,2,5,0,0,0,0),(914,2,7,1,1,1,0),(915,2,8,0,0,0,0),(916,2,9,0,0,0,0),(917,2,10,1,1,1,1),(918,2,11,1,1,1,1),(919,2,13,1,1,1,1),(920,2,16,1,1,1,1),(921,2,17,1,1,1,1),(922,2,18,1,1,1,1),(923,2,21,1,1,1,0),(924,2,22,0,0,0,0),(925,2,23,1,1,1,0),(926,2,24,1,1,1,1),(927,2,26,1,1,1,1),(928,2,27,1,1,1,1),(929,2,28,1,1,1,1),(930,2,30,1,1,1,1),(931,2,31,1,1,1,1),(932,2,32,1,1,1,1),(933,2,33,1,1,1,1),(961,1,1,1,1,1,1),(962,1,2,1,1,1,0),(963,1,3,1,1,1,0),(964,1,4,1,1,1,0),(965,1,5,1,1,1,0),(966,1,6,1,1,1,0),(967,1,7,1,1,1,0),(968,1,8,1,1,1,1),(969,1,9,1,1,1,0),(970,1,10,1,1,1,1),(971,1,11,1,1,1,1),(972,1,13,1,1,1,1),(973,1,16,1,1,1,1),(974,1,17,1,1,1,1),(975,1,18,1,1,1,1),(976,1,21,1,1,1,0),(977,1,22,1,1,1,0),(978,1,23,1,1,1,1),(979,1,24,1,1,1,1),(980,1,26,1,1,1,1),(981,1,27,1,1,1,1),(982,1,28,1,1,1,1),(983,1,29,1,1,1,0),(984,1,30,1,1,1,1),(985,1,31,1,1,1,1),(986,1,32,1,1,1,1),(987,1,33,1,1,1,1);
/*!40000 ALTER TABLE `role_menu_access` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Super Admin','Full system access','2026-05-06 12:29:31','2026-05-06 12:29:31'),(2,'Admin','Administrative access','2026-05-06 12:29:31','2026-05-06 12:29:31'),(3,'Sales','Sales operations access','2026-05-06 12:29:31','2026-05-06 12:29:31'),(4,'Warehouse','Stock and inventory access','2026-05-06 12:29:31','2026-05-06 12:29:31'),(6,'Drivers','Shipping Drivers','2026-05-19 12:57:10','2026-05-19 12:57:10');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shops`
--

DROP TABLE IF EXISTS `shops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shops` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shop_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_id` int DEFAULT NULL,
  `geolocation` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner_id`),
  CONSTRAINT `shops_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shops`
--

LOCK TABLES `shops` WRITE;
/*!40000 ALTER TABLE `shops` DISABLE KEYS */;
INSERT INTO `shops` VALUES (3,'Jet-Brains Solutions Kenya',1,NULL,'0746210500','emailexample@hotmail.com','active','2026-08-17 18:13:41','2026-08-18 09:34:51',NULL,NULL),(4,'Sales Master Wholesalers',2,NULL,'0745098765',NULL,'active','2026-08-18 09:31:23','2026-08-18 09:31:23',NULL,NULL);
/*!40000 ALTER TABLE `shops` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trips`
--

DROP TABLE IF EXISTS `trips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trips` (
  `id` int NOT NULL AUTO_INCREMENT,
  `file_no` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `event_fee` int DEFAULT NULL,
  `kids_fee` int DEFAULT NULL,
  `booking_fee` int DEFAULT NULL,
  `status_id` int DEFAULT NULL,
  `inclusions` json DEFAULT NULL,
  `exclusions` json DEFAULT NULL,
  `comments` text COLLATE utf8mb4_unicode_ci,
  `img_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_trips_parameter_values` (`status_id`) USING BTREE,
  CONSTRAINT `FK_trips_parameter_values` FOREIGN KEY (`status_id`) REFERENCES `parameter_values` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Trips and Events Table';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trips`
--

LOCK TABLES `trips` WRITE;
/*!40000 ALTER TABLE `trips` DISABLE KEYS */;
INSERT INTO `trips` VALUES (2,'ADV/TRP-0001','Nairobi National Park','2026-08-14','2026-08-14',NULL,3000,2000,1000,17,'[30, 52, 38, 37, 56, 35, 57, 53, 39, 29, 55, 31]','[38]',NULL,'/uploads/trips/trip_1786975161130.png',1,'2026-08-14 10:01:27',1,'2026-08-17 13:59:21'),(5,'ADV/TRP-0002','Explore Malindi','2026-08-14','2026-08-30',NULL,9000,7000,3000,17,'[40, 28, 39, 26, 31, 57, 56, 52]','[38]',NULL,'/uploads/trips/trip_1786727532181.jpeg',1,'2026-08-14 17:12:12',NULL,'2026-08-17 12:52:03'),(6,'ADV/TRP-0003','Mombasa Flying Package','2026-09-24','2026-09-28',NULL,12500,10500,5000,17,'[39, 31, 26, 28, 40, 52, 56, 35, 55, 34]','[38]',NULL,'/uploads/trips/trip_1786974853248.jpg',1,'2026-08-17 12:50:17',1,'2026-08-17 13:54:13'),(7,'ADV/TRP-0004','Diani Summer Tides','2026-09-25','2026-09-30',NULL,18000,14000,6000,17,'[35, 57, 30, 52, 37, 33, 40, 55, 28, 39]','[38]',NULL,'/uploads/trips/trip_1786990146740.jpeg',1,'2026-08-17 18:09:06',NULL,NULL);
/*!40000 ALTER TABLE `trips` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `units`
--

DROP TABLE IF EXISTS `units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `units` (
  `id` int NOT NULL AUTO_INCREMENT,
  `unit_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unit_name` (`unit_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `units`
--

LOCK TABLES `units` WRITE;
/*!40000 ALTER TABLE `units` DISABLE KEYS */;
/*!40000 ALTER TABLE `units` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_role` (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,1,1,'2026-05-06 16:06:21'),(2,4,4,'2026-05-07 09:27:03'),(3,3,3,'2026-05-14 14:22:26'),(4,6,2,'2026-05-14 14:24:04'),(16,1,2,'2026-05-15 08:14:40'),(17,1,3,'2026-05-15 08:14:51'),(18,6,3,'2026-05-15 08:15:13'),(19,6,4,'2026-05-15 08:15:26'),(20,1,4,'2026-05-15 08:15:27');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_sessions` (
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
) ENGINE=InnoDB AUTO_INCREMENT=171 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
INSERT INTO `user_sessions` VALUES (1,1,'U1pL6EDTuqM3D9kSbWPo','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-06 14:06:27','2026-05-06 22:06:27'),(2,3,'2qX147iUb_FVOLsooZNA','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-06 15:43:30','2026-05-06 23:43:30'),(3,3,'7bVB9XEjexlp7n5R4JZc','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-06 15:52:55','2026-05-06 23:52:55'),(4,3,'Uz8Z30E63XVwKRKvcuOU','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-06 16:05:34','2026-05-07 00:05:34'),(5,3,'B3pOYGe8bvrzdunvExrQ','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-06 16:06:46','2026-05-07 00:06:46'),(6,1,'8cw1P6i62y-3jMoY7jOQ','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-07 08:58:17','2026-05-07 16:58:17'),(7,3,'WJSu8jIISiA7h68uR3HM','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-07 09:24:59','2026-05-07 17:24:59'),(8,3,'eSBShj5Vwoy2AV2jggdI','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-07 09:28:23','2026-05-07 17:28:23'),(9,1,'Y0BAwyuRale2U-slwuqY','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-07 09:29:10','2026-05-07 17:29:10'),(10,4,'0kifxdZ7B341hySTintE','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-07 09:40:29','2026-05-07 17:40:29'),(11,4,'mhpnK5rGWg_HAiXU3f0k','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-07 10:18:12','2026-05-07 18:18:12'),(12,1,'-GQHIAPgzZNrnJG2oi_c','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-07 13:06:34','2026-05-07 21:06:34'),(13,3,'QI4y_f5wzqJLqk4eyjJA','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-07 15:17:47','2026-05-07 23:17:47'),(14,1,'LfNdyDMUN02gwSV-5xks','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-07 15:22:12','2026-05-07 23:22:12'),(15,3,'VZQiVzkjLxPZzQDGV9ss','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-07 15:22:28','2026-05-07 23:22:28'),(16,3,'3NFdhcaOStnubaQaDoHk','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-07 16:26:57','2026-05-08 00:26:57'),(17,3,'K3RHQby2yslwwZQTudVk','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-07 16:27:53','2026-05-08 00:27:53'),(18,3,'ruCLbY_hr3YZ7PIC17YM','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-08 11:34:18','2026-05-08 19:34:18'),(19,1,'VP8GMwZLehjwmEy0P658','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-08 11:35:40','2026-05-08 19:35:40'),(20,1,'09oJApuy28uHKzoRuRjY','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-08 11:39:54','2026-05-08 19:39:54'),(21,1,'YLGoPCEvhf7dYIDkSfs8','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-09 19:05:23','2026-05-10 03:05:23'),(22,1,'zsxghTA517MX2XNYR-nU','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-10 05:51:57','2026-05-10 13:51:57'),(23,1,'Z1osSFQCJC9lni0WpT8E','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-11 10:03:32','2026-05-11 18:03:32'),(24,3,'OdiWGcnDl5Dy7eSQXcTQ','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-11 10:28:36','2026-05-11 18:28:36'),(25,1,'KJk4HUQvOkybUFmHXW08','::1','Mozilla/5.0 (BB10; Touch) AppleWebKit/537.10+ (KHTML, like Gecko) Version/10.0.9.2372 Mobile Safari/537.10+',0,'2026-05-11 14:52:43','2026-05-11 22:52:43'),(26,1,'C5uZnJNA-NzJjlU1Kq5w','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-12 14:55:07','2026-05-12 22:55:07'),(27,3,'CNAt-xeD1r3fkzkGbWSI','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-12 18:15:29','2026-05-13 02:15:29'),(28,3,'vERVsRooIEL5rcVW7dVI','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-13 07:36:06','2026-05-13 15:36:06'),(29,1,'NuJAuOEIjtub5iKkDPMo','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-13 07:42:54','2026-05-13 15:42:54'),(30,3,'mG1PtF7b7sysclwt-a4w','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-13 07:43:16','2026-05-13 15:43:16'),(31,3,'G9sEylmY3EWVd9scqjzw','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-13 14:11:45','2026-05-13 22:11:45'),(32,1,'SylbP42iIqCIqexbtjO4','::1','Mozilla/5.0 (Linux; U; Android 4.1; en-us; GT-N7100 Build/JRO03C) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',0,'2026-05-13 15:45:04','2026-05-13 23:45:04'),(33,1,'vRW6mq-ac05ehtpP2Gag','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-13 15:57:21','2026-05-13 23:57:21'),(34,1,'rJA4qbjqvXaaoHNWMiwQ','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 07:49:12','2026-05-14 15:49:12'),(37,1,'W65rnul8RXOwP_xopbvs','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 13:57:11','2026-05-14 21:57:11'),(38,3,'OBBjsIJ2hj4H9NPQ8Hzc','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 14:00:04','2026-05-14 22:00:04'),(39,1,'FVRApiR2ZtNsh1YV2xg4','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 14:01:00','2026-05-14 22:01:00'),(41,1,'TpPQPJIxE2u3I93zO63I','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 14:10:12','2026-05-14 22:10:12'),(42,1,'crg8tv_17GEUOa88LwUA','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 14:11:26','2026-05-14 22:11:26'),(43,1,'JapLFzt3vFpSTAivYFFo','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 14:12:07','2026-05-14 22:12:07'),(44,4,'gXSK_1ie6vM6q6-aqIU8','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 14:18:01','2026-05-14 22:18:01'),(45,1,'iAYnCGQ4TLg-M9aMv0qE','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 14:20:54','2026-05-14 22:20:54'),(46,1,'HCoInbJVB5jOzwxD0wrg','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 14:24:41','2026-05-14 22:24:41'),(47,1,'jAedaYQ-szoTl-gw5_QU','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 14:26:25','2026-05-14 22:26:25'),(48,6,'Q3zAfk7OwuyD_pbnF4iA','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 14:34:27','2026-05-14 22:34:27'),(49,6,'1vV9ON6PULC4MdUTdGdA','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 14:41:57','2026-05-14 22:41:57'),(50,4,'tafO9aHyN9esndiyiYfs','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 14:44:21','2026-05-14 22:44:21'),(51,1,'EB1GCC4DYk_moDjKhEk4','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 15:11:09','2026-05-14 23:11:09'),(52,1,'3UtNTKjeodvVG-oh2zs4','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 15:40:37','2026-05-14 23:40:37'),(53,1,'4nBvSnX_YidtgpsbTLxM','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-14 15:58:31','2026-05-14 23:58:31'),(54,3,'L42tjg1-j_jnJcMMWxAc','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-14 15:59:10','2026-05-14 23:59:10'),(55,1,'MTqr8RGrw6FSemJfB24Q','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-15 07:36:28','2026-05-15 15:36:28'),(56,3,'ZFBD3BtKaVNKjclIOojw','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-15 07:51:18','2026-05-15 15:51:18'),(57,1,'o547VxGmFAPMzimJ6EuU','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-15 07:56:17','2026-05-15 15:56:17'),(58,4,'jnXfXC6uw-C8rNYTb8zo','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-15 07:57:19','2026-05-15 15:57:19'),(59,1,'Gl6d1zMNkFYCgH4pvzIA','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-15 08:16:49','2026-05-15 16:16:49'),(60,1,'Pc2NDxzAVsNrGnroUxqc','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-16 05:20:24','2026-05-16 13:20:24'),(61,1,'WzoHOR0u58Q6xkiGDmGc','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-16 19:55:34','2026-05-17 03:55:34'),(62,1,'flgK2fIv5qEGZU2VNd7s','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-18 08:57:31','2026-05-18 16:57:31'),(63,1,'gA_1ac3V73qT7CV0E8Is','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-18 17:11:28','2026-05-19 01:11:28'),(64,3,'wsx59mMfvgG7JsF7Pfb8','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-18 17:57:36','2026-05-19 01:57:36'),(65,4,'j21qSGpAldgpbHeG0QlU','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-18 18:07:24','2026-05-19 02:07:24'),(66,6,'Appx0yWF3vyLzP-Czfd4','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-18 18:53:34','2026-05-19 02:53:34'),(67,6,'IdvpGrfzHSbXh7nYMCDY','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-19 06:51:43','2026-05-19 14:51:43'),(68,6,'4fOJX-HYi2lEdVOeIyK8','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-19 12:23:08','2026-05-19 20:23:08'),(69,7,'29u3N3GRbrdns1rd56n0','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-19 12:44:57','2026-05-19 20:44:57'),(70,7,'XODwTPRKsKWmzFag7kyg','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-19 12:46:09','2026-05-19 20:46:09'),(71,3,'MsgwgIDj5RuuSDjl8jZE','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-19 12:51:51','2026-05-19 20:51:51'),(72,4,'cgVZmQ4v5zpDMCm0Hk6Y','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-19 12:54:03','2026-05-19 20:54:03'),(73,6,'QjyAeb3LM_60Jk5FBoSs','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-19 12:56:40','2026-05-19 20:56:40'),(74,8,'oFL2PudSLdnDsvKL0k1U','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-19 13:00:44','2026-05-19 21:00:44'),(75,3,'Q4aO5NSEjI_Yu6EJV5pc','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-19 13:02:42','2026-05-19 21:02:42'),(76,8,'vW19cAgsgYSxxRhTJOiQ','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-19 13:03:25','2026-05-19 21:03:25'),(77,6,'uZMiBqeejhcDiIWWJ4II','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-19 13:04:12','2026-05-19 21:04:12'),(78,8,'BUe5eGMirIKY2hFDXbZQ','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-19 13:04:59','2026-05-19 21:04:59'),(79,8,'HaN1yaZBtSD-du4jyHDU','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',1,'2026-05-19 13:06:00','2026-05-19 21:06:00'),(80,6,'gJqK-oyXLnCF-lkq59AI','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-19 13:09:23','2026-05-19 21:09:23'),(81,8,'5N-U1BnyGF6fym6bu5HM','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',1,'2026-05-19 13:18:41','2026-05-19 21:18:41'),(82,8,'DEMfEAuenjpsbhC8Z-58','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',1,'2026-05-19 13:20:18','2026-05-19 21:20:18'),(83,7,'vedDlnFWDCUArSxSOUiY','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',1,'2026-05-20 17:17:27','2026-05-21 01:17:27'),(84,7,'Rsm2Qt4ym-KRK865EnPM','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',1,'2026-05-20 17:25:31','2026-05-21 01:25:31'),(85,1,'OIyHd-bHZepz8elQd13w','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-20 18:25:57','2026-05-21 02:25:57'),(86,1,'LDXFnHprG-0RtOLF4A_E','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-21 04:27:21','2026-05-21 12:27:21'),(87,1,'vKAATas3zAFeXU5Da_-o','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-21 04:28:23','2026-05-21 12:28:23'),(88,6,'Yi5IOh8ls06wBKcW0gWc','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-21 07:07:18','2026-05-21 15:07:18'),(89,6,'EL_NzbtNWE41BqNAkbiw','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-21 08:21:28','2026-05-21 16:21:28'),(90,6,'uSv5ITdEW8x92cyLmgH4','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-21 18:47:22','2026-05-22 02:47:22'),(91,6,'WLsArQ5RmeBfrbMBV_mA','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-23 09:41:33','2026-05-23 17:41:33'),(92,1,'CTxX2Imi6pzLEpj3JBto','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-24 21:36:27','2026-05-25 05:36:27'),(93,6,'ZlJka1RTpbGmOZZnZMxw','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-25 12:45:29','2026-05-25 20:45:29'),(94,1,'8wQUsVNDzKGkBGvFQA34','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-25 12:45:58','2026-05-25 20:45:58'),(95,9,'kmtDuwUW1qCZo6OS0cZ4','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',1,'2026-05-25 12:50:57','2026-05-25 20:50:57'),(96,1,'VD_H-L_hYFXrrRN7YTiI','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-25 22:22:16','2026-05-26 06:22:16'),(97,9,'iY1j00AHuKzu_NH_F4e4','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',1,'2026-05-26 06:38:10','2026-05-26 14:38:10'),(98,1,'fq2z5_kamnePe-ifkzYc','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-26 07:17:07','2026-05-26 15:17:07'),(99,1,'mF3oAHEtN4pqC1W8rePg','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-26 15:19:42','2026-05-26 23:19:42'),(100,1,'_VDjO3v3Bf6HuW0-meyo','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-26 16:25:08','2026-05-27 00:25:08'),(101,3,'hq3ILJDXkIaDtA06Yibg','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-26 18:35:49','2026-05-27 02:35:49'),(102,3,'Hpf3Q8U7c2F1MfpyPopg','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-26 18:40:57','2026-05-27 02:40:57'),(103,1,'eNvs_LEjD5hjahBbAj84','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-27 06:00:04','2026-05-27 14:00:04'),(104,1,'nqH0zinqF4fXM9_v2WhM','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-27 06:01:31','2026-05-27 14:01:31'),(105,9,'76x6XZgZmSjFoLHPLxvI','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',1,'2026-05-27 08:55:50','2026-05-27 16:55:50'),(106,1,'2D2BTbt7QoIaYERws29E','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-27 11:39:40','2026-05-27 19:39:40'),(107,1,'9bXnnTrPiEol7lDhBCgQ','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-27 15:12:42','2026-05-27 23:12:42'),(108,1,'t-O0cENBPUOroXmnDD40','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-27 18:03:25','2026-05-28 02:03:25'),(109,1,'2aHz7aZfCp872OeohOV8','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-27 18:06:28','2026-05-28 02:06:28'),(110,3,'45vYDNCGpj7-KrpxDegg','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-28 06:22:29','2026-05-28 14:22:29'),(111,1,'m7BLGcyF1v3GlTdXFyEU','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-28 11:13:03','2026-05-28 19:13:03'),(112,1,'NwKxSl6NrPrFYT3gLKSg','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-28 12:00:19','2026-05-28 20:00:19'),(113,9,'X00bRwlYMgT8i0pgl4h8','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',1,'2026-05-28 13:53:53','2026-05-28 21:53:53'),(114,1,'7b2HE8L9KEMx6FnFyiGY','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-28 21:20:10','2026-05-29 05:20:10'),(115,1,'zFjm4pjyVm_MFsP7nb00','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-29 12:35:40','2026-05-29 20:35:40'),(116,1,'uaR96PUfDgp0VqptOKpM','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-29 17:13:46','2026-05-30 01:13:46'),(117,7,'2Ha5MOoTfE9GtinqzPzA','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',1,'2026-05-30 14:47:08','2026-05-30 22:47:08'),(118,1,'mYYrSrhaAvFLqBpSBqrI','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-30 14:48:02','2026-05-30 22:48:02'),(119,1,'8WXWT9aLkwONaukfQWqU','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-31 22:48:46','2026-06-01 06:48:46'),(120,1,'ZMFtQ1ZHJoSLu-2ll09o','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-01 13:59:18','2026-06-01 21:59:18'),(121,1,'G4T9n5GR-KOu3rui3zis','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-01 14:11:31','2026-06-01 22:11:31'),(122,1,'dJIzNijuM2Jt_4Gue3ZE','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-01 14:13:33','2026-06-01 22:13:33'),(123,1,'-7zLV1V6swKqJElNwJ4I','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-02 11:46:36','2026-06-02 19:46:36'),(124,3,'cFduoQnfIQL_kfcD7ldE','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',1,'2026-06-02 13:15:51','2026-06-02 21:15:51'),(125,1,'MWjhgaUyckhNEp3PQ6uc','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-02 17:15:16','2026-06-03 01:15:16'),(126,1,'5cwr6QW3eaJof5AzhwFk','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-06-02 17:24:50','2026-06-03 01:24:50'),(127,1,'K8jon59ozvQAnVS7Qi88','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-06-02 19:11:54','2026-06-03 03:11:54'),(128,1,'MFvMuLKQiwdamP2eXTYc','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-06-02 19:12:26','2026-06-03 03:12:26'),(129,1,'EoZ8QXkJ0wIKnxClQSTk','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-06-02 19:16:35','2026-06-03 03:16:35'),(130,1,'Y_FtVBgt9LcnMaanF0Eo','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-03 12:44:56','2026-06-03 20:44:56'),(131,1,'g6nS2xmoqXyR5wbX5Clk','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-06-03 17:24:40','2026-06-04 01:24:40'),(132,1,'xNAlMFdUWEqpcKTFuLsg','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-06-03 19:46:54','2026-06-04 03:46:54'),(133,1,'ZyOSO3_nasO_6AD1FqNU','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-04 14:50:28','2026-06-04 22:50:28'),(134,1,'zTIE1ilhq476PMz66zBo','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-06-05 05:32:14','2026-06-05 13:32:14'),(135,1,'8t4zJ8jKWOX9qj9ymSN4','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-05 11:09:32','2026-06-05 19:09:32'),(136,1,'w2hO988xTaiFAMXyZ-uc','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-06-07 20:40:54','2026-06-08 04:40:54'),(137,1,'6FQWmjLXnkuiaPb1qYqE','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-06-08 11:24:52','2026-06-08 19:24:52'),(138,1,'78aZM77lTdrYUe0qmgvY','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-08 13:04:25','2026-06-08 21:04:25'),(139,1,'7xoKCTgCt7cAIDetmwSc','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-08 13:53:29','2026-06-08 21:53:29'),(140,1,'otGsgg8d1CGYRobVOF3E','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-08 13:54:38','2026-06-08 21:54:38'),(141,1,'pM4I6_eYRiSTmvefmIjI','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-08 16:05:22','2026-06-09 00:05:22'),(142,1,'0_GEVCu7nKPal2CRDQFo','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-08 16:10:02','2026-06-09 00:10:02'),(143,1,'1oxtWb6kcdKNu-FfVjDg','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-09 08:07:53','2026-06-09 16:07:53'),(144,1,'gxdg394vJ7jsTND2mtDE','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-09 09:51:15','2026-06-09 17:51:15'),(145,1,'PuMCC2CVQd0DnJfw1dY4','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-09 09:57:47','2026-06-09 17:57:47'),(146,1,'80953AUaL0ZZtGRJIAmw','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-09 10:04:30','2026-06-09 18:04:30'),(147,1,'N2B-MMs_Qjv10BT_Cmc0','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-10 07:55:40','2026-06-10 15:55:40'),(148,1,'fM8p9H1Lwl1UCR63o7ok','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-10 08:13:27','2026-06-10 16:13:27'),(149,1,'GZG8GtQfMqK98-vG8eb0','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-10 11:24:04','2026-06-10 19:24:04'),(150,1,'Yb6LXKBDbyED5wNolUkg','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-11 07:46:24','2026-06-11 15:46:24'),(151,1,'nUPKjlHgRf1-XigoSOGY','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-11 15:47:04','2026-06-11 23:47:04'),(152,1,'RH88jeF7Sh9CpcenMET4','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-12 07:16:30','2026-06-12 15:16:30'),(153,1,'sIFoouckThNKauhNLRCA','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-15 08:55:10','2026-06-15 16:55:10'),(154,1,'ekU50QT0vezMFXIVG86A','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-15 13:07:10','2026-06-15 21:07:10'),(155,1,'jSH5nOjCB-_zduZsm_fs','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-16 15:56:18','2026-06-16 23:56:18'),(156,1,'8WTDgWUMh772_hu6r77Y','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-18 15:22:01','2026-06-18 23:22:01'),(157,1,'72fBiNIMCJpyhySvhBDA','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-22 12:11:03','2026-06-22 20:11:03'),(158,1,'cl7B5EGiBhKFsW7ynUMY','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',0,'2026-06-23 11:35:28','2026-06-23 19:35:28'),(159,1,'eAChDOP5ea1duOTfws6w','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',0,'2026-06-24 14:43:06','2026-06-24 22:43:06'),(160,1,'b1F6aO5ID0fCW5egZglQ','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',0,'2026-06-24 14:45:04','2026-06-24 22:45:04'),(161,1,'EwTL5WprYANpqdKF48Fk','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',1,'2026-06-25 11:14:19','2026-06-25 19:14:19'),(162,1,'3TX2MLmIakkq-AKjRetU','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',1,'2026-06-29 16:19:25','2026-06-30 00:19:25'),(163,1,'n-9EJOw2YB6Yd8O-8dY4','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',1,'2026-08-11 13:34:48','2026-08-11 21:34:48'),(164,1,'MUkgOROsb8EklB5yM4ao','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',1,'2026-08-12 08:16:13','2026-08-12 16:16:13'),(165,1,'oE-RSlCsgkLQsS5Trkzc','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',1,'2026-08-13 14:09:29','2026-08-13 22:09:29'),(166,1,'fIth5SRk74wp7-RPpDO8','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',1,'2026-08-14 07:43:36','2026-08-14 15:43:36'),(167,1,'zwNeHEnfdH6gPK6BcKA8','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',1,'2026-08-14 16:08:55','2026-08-15 00:08:55'),(168,1,'ra0RWjnFh3CGDFjAY68k','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',1,'2026-08-17 12:42:30','2026-08-17 20:42:30'),(169,1,'JJp7c8t9HnE5kuUG5Ewk','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',1,'2026-08-17 12:43:15','2026-08-17 20:43:15'),(170,1,'R8PS9HyfPzAjfSMwoQtk','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',1,'2026-08-18 08:20:24','2026-08-18 16:20:24');
/*!40000 ALTER TABLE `user_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'USR-0001','Dev','Admin','Male',NULL,'admin@salesmaster.com','/uploads/avatars/user_1_1778159097482.png','dev.admin','$2a$10$FiE8ORNfBCVoPRCJG7aQGO4V2CAVW.wmuHCBlH8SHHqJFhlxQ7vvi','active','2026-08-18 08:20:24','2026-05-06 12:29:31','2026-08-18 08:20:24'),(3,'USR-0002','Sales ','Person','Female',NULL,NULL,'/uploads/avatars/user_3_1778167136984.jpg','sales','$2a$10$ldscHKucbY/Tk7Xon3AIzuy4OZqAeRx9u3vjQ9dpfEAqLi27T.G/a','active','2026-06-02 13:15:51','2026-05-06 15:43:03','2026-06-25 11:17:58'),(4,'USR-0003','Stock','Person','Male',NULL,NULL,'/uploads/avatars/user_4_1778169242765.jpg','stock','$2a$10$Mgqhl/n8Dt7d06PktrXBLeZyPAYj457qw3l/SNhi8p4Xz8NQ/jIAa','active','2026-05-19 12:54:03','2026-05-07 09:27:03','2026-06-25 11:17:44'),(6,'USR-0005','System','Admin','Male',NULL,NULL,'/uploads/avatars/user_6_1779347612177.jpg','sys.admin','$2a$10$8n7T8Mg1KPkVhc4flMPEdujTZRfnljp/86fNCbzVtjvhEjH4N3YHu','active','2026-05-25 12:45:29','2026-05-14 14:24:04','2026-06-25 11:18:09'),(7,'USR-0006','Dommy','Locky','Male',NULL,NULL,NULL,'dominic','$2a$10$G0UB6Bn4SDiEGRIA/pCEs.Qx4Pgl91Vq7v4Ozf6AG1ULVbGAwVG1y','active','2026-05-30 14:47:08','2026-05-19 12:42:55','2026-08-17 12:54:41'),(8,'USR-0007','John','Doe','Male',NULL,NULL,NULL,'john','$2a$10$KiU/8grC4tYEBDsxbR7RSeY2ydyw829nx5wFPSQUwSgp.t2l0aPYm','active','2026-05-19 13:20:18','2026-05-19 12:59:52','2026-08-17 12:54:10'),(9,'USR-0008','Jacob','Musa','Male',NULL,NULL,NULL,'jacob','$2a$10$b6nokHydUuHx9TMoiBACjemzV7r1gFFC8Zjbrenv42ASsTnYynyf2','active','2026-05-28 13:53:53','2026-05-25 12:46:56','2026-08-17 12:54:27');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workflow_history`
--

DROP TABLE IF EXISTS `workflow_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `workflow_history` (
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
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workflow_history`
--

LOCK TABLES `workflow_history` WRITE;
/*!40000 ALTER TABLE `workflow_history` DISABLE KEYS */;
INSERT INTO `workflow_history` VALUES (1,1,'order',1,'ORD-2026-06-0002',NULL,'Submitted',NULL,NULL,'2026-06-15 10:41:54',NULL,1,NULL),(2,1,'order',2,'ORD-2026-06-0003',NULL,NULL,1,'Order created','2026-06-15 11:04:33',NULL,1,4),(3,1,'order',3,'ORD-2026-06-0004',NULL,'Submitted',NULL,NULL,'2026-06-15 11:53:04',NULL,1,NULL),(4,1,'order',1,'ORD-2026-06-0002','Submitted','Confirmed',1,NULL,'2026-06-15 13:20:34',1,3,4),(5,1,'order',1,'ORD-2026-06-0002','Confirmed','Processing',1,NULL,'2026-06-15 13:20:40',3,NULL,4),(6,1,'order',1,'ORD-2026-06-0002','Processing','Shipped',1,NULL,'2026-06-15 13:20:46',NULL,NULL,4),(7,1,'order',1,'ORD-2026-06-0002','Shipped','Delivered',1,NULL,'2026-06-15 13:20:50',NULL,NULL,4),(8,1,'order',1,'ORD-2026-06-0002','Delivered','Pending Payment',1,NULL,'2026-06-15 13:20:55',NULL,11,4),(9,1,'order',1,'ORD-2026-06-0002','Pending Payment','Payment Done',1,NULL,'2026-06-15 13:21:00',11,13,4),(10,1,'order',1,'ORD-2026-06-0002','Payment Done','Completed',1,NULL,'2026-06-15 13:21:07',13,12,4),(11,1,'order',2,'ORD-2026-06-0003','Submitted','Confirmed',1,NULL,'2026-06-15 13:23:25',1,3,4),(12,1,'order',2,'ORD-2026-06-0003','Confirmed','Pending Payment',1,NULL,'2026-06-15 13:23:32',3,11,4),(13,1,'order',2,'ORD-2026-06-0003','Pending Payment','Payment Done',1,NULL,'2026-06-15 13:23:36',11,13,4),(14,1,'order',2,'ORD-2026-06-0003','Payment Done','Processing',1,NULL,'2026-06-15 13:23:43',13,NULL,4),(15,1,'order',2,'ORD-2026-06-0003','Processing','Shipped',1,NULL,'2026-06-15 13:23:48',NULL,NULL,4),(16,1,'order',2,'ORD-2026-06-0003','Shipped','Delivered',1,NULL,'2026-06-15 13:23:53',NULL,NULL,4),(17,1,'order',2,'ORD-2026-06-0003','Delivered','Completed',1,NULL,'2026-06-15 13:24:02',NULL,12,4),(18,1,'order',4,'ORD-2026-06-0005',NULL,'Submitted',NULL,NULL,'2026-06-15 14:08:04',NULL,1,NULL),(19,1,'order',5,'ORD-2026-06-0006',NULL,NULL,1,'Order created','2026-06-18 17:01:19',NULL,1,4),(20,1,'order',6,'ORD-2026-06-0007',NULL,NULL,1,'Order created','2026-06-22 14:21:37',NULL,1,4),(21,1,'order',4,'ORD-2026-06-0005','Submitted','Confirmed',1,NULL,'2026-06-22 16:44:23',1,3,4),(22,1,'order',4,'ORD-2026-06-0005','Confirmed','Processing',1,NULL,'2026-06-22 16:46:23',3,NULL,4),(23,1,'order',4,'ORD-2026-06-0005','Processing','Shipped',1,NULL,'2026-06-22 16:54:58',NULL,NULL,4),(24,1,'order',4,'ORD-2026-06-0005','Shipped','Delivered',1,NULL,'2026-06-22 16:55:58',NULL,NULL,4),(25,1,'order',4,'ORD-2026-06-0005','Delivered','Pending Payment',1,NULL,'2026-06-22 16:59:00',NULL,11,4),(26,1,'order',4,'ORD-2026-06-0005','Pending Payment','Payment Done',1,NULL,'2026-06-22 17:22:10',11,13,4),(27,1,'order',7,'ORD-2026-06-0008',NULL,'Submitted',NULL,NULL,'2026-06-22 17:26:47',NULL,1,NULL),(28,1,'order',7,'ORD-2026-06-0008','Submitted','Confirmed',1,NULL,'2026-06-22 17:33:55',1,3,4),(29,1,'order',7,'ORD-2026-06-0008','Confirmed','Processing',1,NULL,'2026-06-22 17:34:50',3,NULL,4),(30,1,'order',7,'ORD-2026-06-0008','Processing','Shipped',1,NULL,'2026-06-22 17:41:20',NULL,NULL,4),(31,1,'order',7,'ORD-2026-06-0008','Shipped','Delivered',1,NULL,'2026-06-22 17:54:36',NULL,NULL,4),(32,1,'order',3,'ORD-2026-06-0004','Submitted','Reviewing',1,NULL,'2026-06-23 11:38:36',1,2,4),(33,1,'order',3,'ORD-2026-06-0004','Reviewing','Confirmed',1,NULL,'2026-06-23 11:38:59',2,3,4),(34,1,'order',3,'ORD-2026-06-0004','Confirmed','Processing',1,NULL,'2026-06-23 11:39:31',3,NULL,4),(35,1,'order',5,'ORD-2026-06-0006','Submitted','Reviewing',1,NULL,'2026-06-23 11:57:50',1,2,4),(36,1,'order',6,'ORD-2026-06-0007','Submitted','Reviewing',1,NULL,'2026-06-23 11:58:06',1,2,4),(37,1,'order',5,'ORD-2026-06-0006','Reviewing','Confirmed',1,NULL,'2026-06-23 11:58:25',2,3,4),(38,1,'order',8,'ORD-2026-06-0009',NULL,NULL,1,'Order created','2026-06-29 16:23:11',NULL,1,4),(39,1,'order',9,'ORD-2026-08-0012',NULL,NULL,1,'Order created','2026-08-11 13:42:44',NULL,1,4),(40,1,'order',10,'ORD-2026-08-0013',NULL,NULL,1,'Order created','2026-08-11 13:47:18',NULL,1,4),(41,1,'order',11,'ORD-2026-08-0014',NULL,NULL,1,'Order created','2026-08-11 14:00:59',NULL,1,4),(42,1,'order',12,'ORD-2026-08-0015',NULL,'Submitted',NULL,NULL,'2026-08-11 14:17:49',NULL,1,NULL),(43,1,'order',13,'ORD-2026-08-0016',NULL,'Submitted',NULL,NULL,'2026-08-11 14:18:31',NULL,1,NULL),(44,1,'order',11,'ORD-2026-08-0014','Submitted','Reviewing',1,NULL,'2026-08-11 16:26:45',1,2,4),(45,1,'order',13,'ORD-2026-08-0016','Submitted','Reviewing',1,NULL,'2026-08-11 16:26:56',1,2,4),(46,1,'order',13,'ORD-2026-08-0016','Reviewing','Confirmed',1,NULL,'2026-08-11 16:27:10',2,3,4),(47,1,'order',12,'ORD-2026-08-0015','Submitted','Reviewing',1,NULL,'2026-08-12 08:17:11',1,2,4),(48,1,'order',1,'BKNG-000017',NULL,NULL,1,'Order created','2026-08-14 09:35:14',NULL,1,4),(50,1,'booking',7,'Booking #7','Submitted','Reviewing',1,NULL,'2026-08-17 16:06:06',1,2,4),(51,1,'booking',7,'Booking #7','Reviewing','Confirmed',1,NULL,'2026-08-17 16:06:40',2,3,4),(52,1,'booking',5,'Booking #5','Submitted','Reviewing',1,NULL,'2026-08-17 16:07:00',1,2,4),(53,1,'booking',3,'Booking #3','Submitted','Reviewing',1,NULL,'2026-08-17 16:07:06',1,2,4),(54,1,'booking',5,'Booking #5','Reviewing','Confirmed',1,NULL,'2026-08-17 16:07:14',2,3,4),(55,1,'booking',7,'Booking #7','Confirmed','Pending Payment',1,NULL,'2026-08-17 16:07:20',3,11,4),(56,1,'booking',9,'Booking #9',NULL,NULL,1,'Booking created','2026-08-17 16:12:12',NULL,1,4),(57,1,'booking',7,'Booking #7','Pending Payment','Payment Done',1,NULL,'2026-08-17 16:16:31',11,13,4),(58,1,'booking',7,'ADV/BKNG-00005','Payment Done','Completed',1,NULL,'2026-08-17 16:51:21',13,12,4),(59,1,'booking',10,'ADV/BKNG-00007',NULL,NULL,NULL,'Booked via client portal (client #6)','2026-08-17 18:12:13',NULL,1,4),(60,1,'booking',11,'ADV/BKNG-00008',NULL,NULL,NULL,'Booked via client portal (client #6)','2026-08-17 18:12:14',NULL,1,4),(61,1,'booking',12,'ADV/BKNG-00007',NULL,NULL,NULL,'Booked via client portal (client #1)','2026-08-17 18:14:01',NULL,1,4),(62,1,'booking',12,'ADV/BKNG-00007','Submitted','Reviewing',1,NULL,'2026-08-18 08:22:36',1,2,4),(63,1,'booking',13,'ADV/BKNG-00008',NULL,NULL,NULL,'Booked via client portal (client #2)','2026-08-18 09:32:09',NULL,1,4);
/*!40000 ALTER TABLE `workflow_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workflow_stages`
--

DROP TABLE IF EXISTS `workflow_stages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `workflow_stages` (
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
  PRIMARY KEY (`id`),
  KEY `workflow_id` (`workflow_id`),
  CONSTRAINT `workflow_stages_ibfk_1` FOREIGN KEY (`workflow_id`) REFERENCES `workflows` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workflow_stages`
--

LOCK TABLES `workflow_stages` WRITE;
/*!40000 ALTER TABLE `workflow_stages` DISABLE KEYS */;
INSERT INTO `workflow_stages` VALUES (1,1,'Submitted',NULL,NULL,NULL,1,1,0,'2026-05-13 12:52:46','#d4ff00',1),(2,1,'Reviewing','Pending Review',NULL,NULL,2,0,0,'2026-05-13 12:53:43','#0044ff',1),(3,1,'Confirmed','Confirmed',NULL,NULL,3,0,0,'2026-05-13 12:54:17','#88ff00',1),(5,1,'On Hold','On Hold',NULL,NULL,5,0,0,'2026-05-13 12:57:16','#8b858b',1),(7,1,'Cancelled','Cancelled',NULL,NULL,7,0,1,'2026-05-13 12:59:21','#fc0000',0),(10,1,'Refunded','Refunded',NULL,NULL,10,0,0,'2026-05-13 13:00:34','#d7c6c6',0),(11,1,'Pending Payment','Pending Payment',NULL,'Payment',11,0,0,'2026-05-13 13:09:53','#dc7729',1),(12,1,'Completed','Completed',NULL,NULL,12,0,1,'2026-05-13 13:11:17','#0f700b',1),(13,1,'Payment Done','Payment Done',NULL,NULL,13,0,1,'2026-05-13 13:11:55','#37ff00',1);
/*!40000 ALTER TABLE `workflow_stages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workflow_transitions`
--

DROP TABLE IF EXISTS `workflow_transitions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `workflow_transitions` (
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
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workflow_transitions`
--

LOCK TABLES `workflow_transitions` WRITE;
/*!40000 ALTER TABLE `workflow_transitions` DISABLE KEYS */;
INSERT INTO `workflow_transitions` VALUES (1,1,1,2,'Forward for Review ','2026-05-13 13:01:25'),(2,1,1,7,'Cancel','2026-05-13 13:01:42'),(3,1,1,3,'Confirm','2026-05-13 13:02:06'),(4,1,2,3,'Confirm','2026-05-13 13:02:28'),(5,1,2,7,'Cancel','2026-05-13 13:02:43'),(6,1,2,5,'Hold','2026-05-13 13:02:53'),(8,1,3,2,'Return for Review','2026-05-13 13:03:53'),(9,1,3,7,'Cancel','2026-05-13 13:04:03'),(10,1,3,5,'Hold','2026-05-13 13:04:12'),(16,1,5,7,'Cancel','2026-05-13 13:06:16'),(17,1,5,3,'Confirm','2026-05-13 13:07:01'),(18,1,5,2,'Request Review','2026-05-13 13:07:37'),(22,1,3,11,'Request Payment','2026-05-13 13:12:59'),(24,1,10,7,'Cancel','2026-05-13 13:14:34'),(26,1,13,12,'Complete','2026-05-13 13:15:34'),(27,1,11,13,'Paid','2026-05-13 13:17:10'),(35,1,11,7,'Cancel','2026-05-19 06:56:52');
/*!40000 ALTER TABLE `workflow_transitions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workflows`
--

DROP TABLE IF EXISTS `workflows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `workflows` (
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workflows`
--

LOCK TABLES `workflows` WRITE;
/*!40000 ALTER TABLE `workflows` DISABLE KEYS */;
INSERT INTO `workflows` VALUES (1,'Bookings Workflow','Bookings Workflow',4,1,'2026-05-13 12:50:53','2026-08-17 15:31:28');
/*!40000 ALTER TABLE `workflows` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-18 15:15:23
