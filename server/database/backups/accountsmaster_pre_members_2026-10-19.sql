-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: accountsmaster
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
-- Table structure for table `advertisers`
--

DROP TABLE IF EXISTS `advertisers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `advertisers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `advertiser_ref_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `advertiser_type_id` int DEFAULT NULL,
  `advertiser_name` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `industry_id` int DEFAULT NULL,
  `country_id` int DEFAULT NULL,
  `county_id` int DEFAULT NULL,
  `subcounty_id` int DEFAULT NULL,
  `firstname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` enum('Male','Female','Other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  UNIQUE KEY `client_ref_no` (`advertiser_ref_no`),
  UNIQUE KEY `username` (`username`),
  KEY `FK_clients_client_type` (`advertiser_type_id`),
  KEY `FK_clients_industry` (`industry_id`),
  KEY `FK_clients_country` (`country_id`),
  KEY `FK_clients_county` (`county_id`),
  KEY `FK_clients_subcounty` (`subcounty_id`),
  KEY `FK_clients_workflow` (`workflow_id`),
  KEY `FK_clients_workflow_stage` (`workflow_stage_id`),
  CONSTRAINT `FK_clients_client_type` FOREIGN KEY (`advertiser_type_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_clients_country` FOREIGN KEY (`country_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_clients_county` FOREIGN KEY (`county_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_clients_industry` FOREIGN KEY (`industry_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_clients_subcounty` FOREIGN KEY (`subcounty_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_clients_workflow` FOREIGN KEY (`workflow_id`) REFERENCES `workflows` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_clients_workflow_stage` FOREIGN KEY (`workflow_stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `advertisers`
--

LOCK TABLES `advertisers` WRITE;
/*!40000 ALTER TABLE `advertisers` DISABLE KEYS */;
INSERT INTO `advertisers` VALUES (1,'ADV/CLT-0001',100,'SaleMasters',106,114,NULL,NULL,'SaleMasters','',NULL,'0746210500','example@hotmail.com','example@hotmail.com','$2a$10$DfDgyjLZiJN.H8qNnL81v.FCrsYnFdLrsEFECLoWy/TUocEG1TYve',NULL,NULL,'active','2026-06-15 10:38:35','2026-09-29 17:14:18',14,NULL,NULL),(2,'ADV/CLT-0002',100,'Jonathan David\'s',107,114,NULL,NULL,'','',NULL,'0745098765',NULL,'jonathan','$2a$10$yWALXJ8vgkGvyU1k3/2koepR6V/Ll8s4Atb09GuA4M0ujM04QGgCi',NULL,NULL,'active','2026-08-14 16:17:51','2026-09-14 16:34:30',75,NULL,NULL),(3,'ADV/CLT-0003',43,'Pevans Cereals',106,114,NULL,NULL,'Pevans Cereals','',NULL,'0714325652',NULL,NULL,NULL,NULL,'/uploads/advertisers/client_1789399539418.png','active','2026-08-14 16:18:22','2026-10-01 11:07:33',2,NULL,NULL),(12,'ADV/CLT-0005',100,'Civil Aviation Authority',103,114,NULL,NULL,'Civil Aviation Authority','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','2026-09-14 15:27:47','2026-10-01 11:28:32',0,2,103);
/*!40000 ALTER TABLE `advertisers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brand_ambassador_config`
--

DROP TABLE IF EXISTS `brand_ambassador_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `brand_ambassador_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `min_avg_status_views` int NOT NULL DEFAULT '0',
  `max_proof_resubmissions` int NOT NULL DEFAULT '3',
  `brand_ambassador_pay_percentage` decimal(5,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brand_ambassador_config`
--

LOCK TABLES `brand_ambassador_config` WRITE;
/*!40000 ALTER TABLE `brand_ambassador_config` DISABLE KEYS */;
INSERT INTO `brand_ambassador_config` VALUES (1,450,2,30.00,'2026-09-15 13:22:28','2026-09-25 15:38:39');
/*!40000 ALTER TABLE `brand_ambassador_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brand_ambassadors`
--

DROP TABLE IF EXISTS `brand_ambassadors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `brand_ambassadors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `brand_ambassador_ref_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country_id` int DEFAULT NULL,
  `county_id` int DEFAULT NULL,
  `subcounty_id` int DEFAULT NULL,
  `avg_status_views` int DEFAULT NULL,
  `profile_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status_proof_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `areas_to_advertise` json DEFAULT NULL,
  `email` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','locked','suspended','revoked') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'inactive',
  `workflow_id` int DEFAULT NULL,
  `workflow_stage_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `advertiser_ref_no` (`brand_ambassador_ref_no`),
  UNIQUE KEY `username` (`username`),
  KEY `FK_advertisers_country` (`country_id`),
  KEY `FK_advertisers_county` (`county_id`),
  KEY `FK_advertisers_subcounty` (`subcounty_id`),
  KEY `FK_advertisers_workflow` (`workflow_id`),
  KEY `FK_advertisers_workflow_stage` (`workflow_stage_id`),
  CONSTRAINT `FK_advertisers_country` FOREIGN KEY (`country_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_advertisers_county` FOREIGN KEY (`county_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_advertisers_subcounty` FOREIGN KEY (`subcounty_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_advertisers_workflow` FOREIGN KEY (`workflow_id`) REFERENCES `workflows` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_advertisers_workflow_stage` FOREIGN KEY (`workflow_stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='WhatsApp status advertisers';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brand_ambassadors`
--

LOCK TABLES `brand_ambassadors` WRITE;
/*!40000 ALTER TABLE `brand_ambassadors` DISABLE KEYS */;
INSERT INTO `brand_ambassadors` VALUES (1,'ADV-0001','Kenneth Baton','0718248766',114,NULL,NULL,600,NULL,NULL,NULL,'[135, 139, 133]','Baton@gmail.com','baton@gmail.com','$2a$10$66cLxXAa/.xe26dlo8BxPuSkhk0lkyNvWPVXuCTo1imJtdM1uue4.','active',3,107,'2026-09-14 13:37:53','2026-09-29 09:33:44'),(3,'ADV-0002','Floyd Ken','0718248766',114,323,325,500,NULL,'/uploads/brand-ambassadors/advertiser_1789478087386.png',NULL,'[135]','ken@gmail.com','ken@gmail.com','$2a$10$8oFOA7S9tq2xsmcG6KrFp.z2W9pyOdWWs0pEEmVyvmnT.zq8moSD.','active',3,107,'2026-09-15 13:14:47','2026-10-01 10:33:31'),(5,'ADV-0003','Chris Benz','0746123654',114,299,304,700,NULL,'/uploads/brand-ambassadors/advertiser_1790326168886.png',NULL,'[]','benz@gmail.com','benz@gmail.com','$2a$10$yAoEN0CAITd1RE8y/BocZ.T3qlMu0mu08gT1rJzzemSEaf6kxxVyK','active',3,107,'2026-09-25 08:49:29','2026-10-01 10:33:31'),(6,'ADV-0004','Anna Pamela',NULL,114,516,525,550,NULL,'/uploads/brand-ambassadors/advertiser_1790349788043.png',NULL,'[]','pamela@email.com','pamela@gmail.com','$2a$10$cu9h1D4PB35XbetqsOdhy.ySXvINiwnTQbN23EnFK.sXyAo4dpjeG','active',3,107,'2026-09-25 15:23:08','2026-10-01 10:33:31'),(8,'BAM-0006','Joshua Kiti','0746210500',114,323,325,480,NULL,'/uploads/brand-ambassadors/advertiser_1790683904946.jpg',NULL,'[]','evansonmuchai2016@gmail.com','evansonmuchai2016@gmail.com','$2a$10$uVe36dQbUz2UKyxugnqd8.5A7U7OFsVEM3OgOXCpAluOs516qFSWW','active',3,107,'2026-09-29 12:11:45','2026-10-01 16:49:11');
/*!40000 ALTER TABLE `brand_ambassadors` ENABLE KEYS */;
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
INSERT INTO `business` VALUES (1,'Ads-Brite Brand Boosters','Evanson Muchai','arapchiff@gmail.com','+254746210500',NULL,'2026-09-01',NULL,'2026-05-06 12:29:31','2026-10-06 13:18:11');
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
INSERT INTO `business_shareholders` VALUES (1,1,'Shareholder\'s One Name','Owner','000000000','0746210500',NULL,100.00,300000.00,'2026-06-24 17:05:12');
/*!40000 ALTER TABLE `business_shareholders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campaign_brand_ambassadors`
--

DROP TABLE IF EXISTS `campaign_brand_ambassadors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `campaign_brand_ambassadors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campaign_id` int NOT NULL,
  `brand_ambassador_id` int NOT NULL,
  `assigned_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `proof_deadline` date DEFAULT NULL,
  `assigned_by` int DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_campaign_advertiser` (`campaign_id`,`brand_ambassador_id`),
  KEY `FK_campaign_advertisers_campaigns` (`campaign_id`) USING BTREE,
  KEY `FK_campaign_advertisers_advertisers` (`brand_ambassador_id`) USING BTREE,
  CONSTRAINT `FK_campaign_advertisers_advertisers` FOREIGN KEY (`brand_ambassador_id`) REFERENCES `brand_ambassadors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_campaign_advertisers_campaigns` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Advertisers assigned to run a Campaign';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaign_brand_ambassadors`
--

LOCK TABLES `campaign_brand_ambassadors` WRITE;
/*!40000 ALTER TABLE `campaign_brand_ambassadors` DISABLE KEYS */;
INSERT INTO `campaign_brand_ambassadors` VALUES (2,4,3,'2026-09-15 16:42:49',NULL,1),(5,3,3,'2026-09-15 16:59:32',NULL,1),(6,4,1,'2026-09-17 13:30:39',NULL,1),(7,2,3,'2026-09-21 15:05:57',NULL,1),(9,3,5,'2026-09-25 08:56:33',NULL,1),(10,4,5,'2026-09-25 08:59:02',NULL,1),(11,2,5,'2026-09-25 13:26:11',NULL,1),(16,5,6,'2026-09-25 15:24:58',NULL,1),(17,5,5,'2026-09-25 15:26:30',NULL,1),(19,6,6,'2026-09-30 09:40:20',NULL,1),(20,7,5,'2026-10-01 17:34:09',NULL,1),(21,8,5,'2026-10-04 21:19:35','2026-10-07',1),(22,8,6,'2026-10-04 21:53:40',NULL,1);
/*!40000 ALTER TABLE `campaign_brand_ambassadors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campaign_proofs`
--

DROP TABLE IF EXISTS `campaign_proofs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `campaign_proofs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campaign_id` int NOT NULL,
  `brand_ambassador_id` int NOT NULL,
  `proof_date` date NOT NULL,
  `image_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_views` int DEFAULT NULL,
  `status` enum('pending','accepted','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `rejection_count` int NOT NULL DEFAULT '0',
  `review_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `reviewed_by` int DEFAULT NULL,
  `reviewed_on` timestamp NULL DEFAULT NULL,
  `submitted_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_campaign_advertiser_date` (`campaign_id`,`brand_ambassador_id`,`proof_date`),
  KEY `FK_campaign_proofs_campaigns` (`campaign_id`) USING BTREE,
  KEY `FK_campaign_proofs_advertisers` (`brand_ambassador_id`) USING BTREE,
  CONSTRAINT `FK_campaign_proofs_advertisers` FOREIGN KEY (`brand_ambassador_id`) REFERENCES `brand_ambassadors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_campaign_proofs_campaigns` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Daily WhatsApp-status posting proof screenshots, per advertiser per campaign';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaign_proofs`
--

LOCK TABLES `campaign_proofs` WRITE;
/*!40000 ALTER TABLE `campaign_proofs` DISABLE KEYS */;
INSERT INTO `campaign_proofs` VALUES (1,4,3,'2026-09-17','/uploads/campaign-proofs/proof_1789651632394_740519437.jpeg',465,'accepted',0,NULL,1,'2026-09-17 13:27:38','2026-09-17 13:27:12'),(2,3,3,'2026-09-16','/uploads/campaign-proofs/proof_1789647346399_399739542.png',508,'accepted',0,NULL,1,'2026-09-17 12:17:06','2026-09-17 12:15:46'),(3,3,3,'2026-09-17','/uploads/campaign-proofs/proof_1790001346163_668883029.jpg',999,'accepted',3,NULL,1,'2026-09-21 14:36:11','2026-09-21 14:35:46'),(8,4,1,'2026-09-17','/uploads/campaign-proofs/proof_1789652788540_249519487.png',568,'accepted',0,NULL,1,'2026-09-17 13:51:31','2026-09-17 13:46:28'),(9,3,3,'2026-09-18','/uploads/campaign-proofs/proof_1789747816181_579823359.jpeg',458,'accepted',2,NULL,1,'2026-09-18 16:10:56','2026-09-18 16:10:16'),(10,4,3,'2026-09-18','/uploads/campaign-proofs/proof_1789744625713_790697972.jpg',475,'accepted',0,NULL,1,'2026-09-18 15:17:28','2026-09-18 15:17:05'),(18,3,3,'2026-09-19','/uploads/campaign-proofs/proof_1790000052198_960103548.ico',400,'accepted',0,NULL,1,'2026-09-21 14:31:11','2026-09-21 14:14:12'),(19,3,3,'2026-09-20','/uploads/campaign-proofs/proof_1790000091141_104217564.png',700,'accepted',0,NULL,1,'2026-09-21 16:11:15','2026-09-21 14:14:51'),(20,3,3,'2026-09-21','/uploads/campaign-proofs/proof_1790000137491_404545133.png',610,'accepted',0,NULL,1,'2026-09-21 14:44:24','2026-09-21 14:15:37'),(21,4,3,'2026-09-19','/uploads/campaign-proofs/proof_1790000182530_729919884.jpg',654,'accepted',0,NULL,1,'2026-09-21 14:18:21','2026-09-21 14:16:22'),(22,4,3,'2026-09-20','/uploads/campaign-proofs/proof_1790000216100_421955072.png',665,'accepted',0,NULL,1,'2026-09-21 14:18:15','2026-09-21 14:16:56'),(23,4,3,'2026-09-21','/uploads/campaign-proofs/proof_1790006102256_85883806.png',704,'accepted',1,NULL,1,'2026-09-21 15:56:49','2026-09-21 15:55:02'),(25,2,3,'2026-09-19','/uploads/campaign-proofs/proof_1790003435253_630898031.png',455,'rejected',1,'Rejected',1,'2026-09-21 16:11:30','2026-09-21 15:10:35'),(26,2,3,'2026-09-20','/uploads/campaign-proofs/proof_1790003451115_162610547.jpg',505,'rejected',1,'Rejected',1,'2026-09-21 16:10:36','2026-09-21 15:10:51'),(27,2,3,'2026-09-21','/uploads/campaign-proofs/proof_1790003687342_719130062.jpeg',600,'accepted',0,NULL,1,'2026-09-21 16:11:33','2026-09-21 15:14:47'),(29,4,1,'2026-09-18','/uploads/campaign-proofs/proof_1790006807854_337546340.png',560,'accepted',0,NULL,1,'2026-09-21 16:10:24','2026-09-21 16:06:47'),(30,4,1,'2026-09-19','/uploads/campaign-proofs/proof_1790006832073_317851075.png',577,'rejected',1,'Rejected',1,'2026-09-21 16:11:48','2026-09-21 16:07:12'),(31,4,1,'2026-09-20','/uploads/campaign-proofs/proof_1790006849068_505908790.png',565,'accepted',0,NULL,1,'2026-09-21 16:10:18','2026-09-21 16:07:29'),(32,4,1,'2026-09-21','/uploads/campaign-proofs/proof_1790006865890_267833660.png',580,'accepted',0,NULL,1,'2026-09-21 16:10:16','2026-09-21 16:07:45'),(33,3,5,'2026-09-25','/uploads/campaign-proofs/proof_1790326641082_654347474.png',810,'accepted',0,NULL,1,'2026-09-25 08:57:42','2026-09-25 08:57:21'),(34,4,5,'2026-09-21','/uploads/campaign-proofs/proof_1790326765857_434609494.png',1000,'accepted',0,NULL,1,'2026-09-25 08:59:31','2026-09-25 08:59:25'),(35,2,5,'2026-09-25','/uploads/campaign-proofs/proof_1790343010165_405003190.png',785,'accepted',0,NULL,1,'2026-09-25 14:14:28','2026-09-25 13:30:10'),(36,5,5,'2026-09-25','/uploads/campaign-proofs/proof_1790345950147_716747896.png',890,'accepted',0,NULL,1,'2026-09-25 15:09:31','2026-09-25 14:19:10'),(37,5,6,'2026-09-25','/uploads/campaign-proofs/proof_1790350741490_843851735.png',795,'accepted',1,NULL,1,'2026-09-25 15:39:24','2026-09-25 15:39:01'),(39,3,3,'2026-09-23','/uploads/campaign-proofs/proof_1790597981160_503958797.jpg',602,'accepted',0,NULL,1,'2026-09-28 14:26:28','2026-09-28 12:19:41'),(40,3,3,'2026-09-22','/uploads/campaign-proofs/proof_1790605447829_211348365.jpg',900,'accepted',0,NULL,1,'2026-09-28 14:26:14','2026-09-28 14:24:07'),(41,3,3,'2026-09-24','/uploads/campaign-proofs/proof_1790605718659_906141453.jpg',656,'accepted',1,NULL,1,'2026-09-28 14:28:49','2026-09-28 14:28:38'),(42,3,3,'2026-09-25','/uploads/campaign-proofs/proof_1790605484527_578595423.jpg',777,'accepted',0,NULL,1,'2026-09-28 14:25:35','2026-09-28 14:24:44'),(43,2,3,'2026-09-25','/uploads/campaign-proofs/proof_1790605511410_8436802.jpg',675,'accepted',0,NULL,1,'2026-09-28 14:25:34','2026-09-28 14:25:11'),(45,5,6,'2026-09-26','/uploads/campaign-proofs/proof_1790695462599_595491254.jpg',578,'accepted',0,NULL,1,'2026-09-29 15:25:01','2026-09-29 15:24:23'),(46,3,5,'2026-09-26','/uploads/campaign-proofs/proof_1790875841721_558650948.jpg',568,'rejected',1,'Reject',1,'2026-10-04 20:34:04','2026-10-01 17:30:41');
/*!40000 ALTER TABLE `campaign_proofs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campaigns`
--

DROP TABLE IF EXISTS `campaigns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `campaigns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `file_no` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `advertiser_id` int NOT NULL,
  `campaign_title` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `campaign_type_id` int DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `posters` json DEFAULT NULL,
  `attachments` json DEFAULT NULL,
  `website_link` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `promo_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration_value` int DEFAULT NULL,
  `duration_unit_id` int DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `target_audience` json DEFAULT NULL,
  `target_country_id` int DEFAULT NULL,
  `target_county_id` int DEFAULT NULL,
  `target_subcounty_id` int DEFAULT NULL,
  `budget` int DEFAULT NULL,
  `brand_ambassador_pay_percentage` decimal(5,2) DEFAULT NULL,
  `discount` int DEFAULT '0',
  `workflow_id` int DEFAULT NULL,
  `workflow_stage_id` int DEFAULT NULL,
  `comments` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `campaign_file_no` (`file_no`),
  KEY `FK_campaigns_clients` (`advertiser_id`),
  KEY `FK_campaigns_campaign_type` (`campaign_type_id`),
  KEY `FK_campaigns_duration_unit` (`duration_unit_id`),
  KEY `FK_campaigns_target_country` (`target_country_id`),
  KEY `FK_campaigns_target_county` (`target_county_id`),
  KEY `FK_campaigns_target_subcounty` (`target_subcounty_id`),
  KEY `FK_campaigns_workflow` (`workflow_id`),
  KEY `FK_campaigns_workflow_stage` (`workflow_stage_id`),
  CONSTRAINT `FK_campaigns_campaign_type` FOREIGN KEY (`campaign_type_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_campaigns_clients` FOREIGN KEY (`advertiser_id`) REFERENCES `advertisers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_campaigns_duration_unit` FOREIGN KEY (`duration_unit_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_campaigns_target_country` FOREIGN KEY (`target_country_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_campaigns_target_county` FOREIGN KEY (`target_county_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_campaigns_target_subcounty` FOREIGN KEY (`target_subcounty_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_campaigns_workflow` FOREIGN KEY (`workflow_id`) REFERENCES `workflows` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_campaigns_workflow_stage` FOREIGN KEY (`workflow_stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Advertising campaigns';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaigns`
--

LOCK TABLES `campaigns` WRITE;
/*!40000 ALTER TABLE `campaigns` DISABLE KEYS */;
INSERT INTO `campaigns` VALUES (2,'CMP-2026-09-0001',1,'Sample Campaign',143,NULL,'[]','[]',NULL,NULL,NULL,7,155,'2026-09-19','2026-09-25','[166, 162, 157]',114,NULL,NULL,35000,NULL,2000,4,112,NULL,1,'2026-09-14 13:17:19',1,'2026-10-04 20:28:58'),(3,'CMP-2026-09-0002',12,'New System Awareness',142,NULL,'[]','[\"/uploads/campaigns/campaign_attachments_1789463262521_868976058.jpeg\"]',NULL,NULL,NULL,14,155,'2026-09-16','2026-09-29','[166]',114,NULL,NULL,20000,NULL,1500,4,112,NULL,1,'2026-09-15 09:07:42',1,'2026-09-17 12:14:43'),(4,'CMP-2026-09-0003',3,'Pevans Cereals Shop Awareness',142,NULL,'[\"/uploads/campaigns/campaign_posters_1789463742715_460857098.jpeg\"]','[]',NULL,NULL,NULL,5,155,'2026-09-17','2026-09-21','[166]',114,NULL,NULL,5000,NULL,1500,4,113,NULL,1,'2026-09-15 09:15:42',1,'2026-09-22 13:09:50'),(5,'CMP-2026-09-0004',2,'Jonathan David\'s Youtube Channel',148,NULL,'[\"/uploads/campaigns/campaign_posters_1790343284157_52905522.png\", \"/uploads/campaigns/campaign_posters_1790343284174_507789364.png\", \"/uploads/campaigns/campaign_posters_1790759883500_962321402.jpg\", \"/uploads/campaigns/campaign_posters_1790759884332_562097243.jpg\", \"/uploads/campaigns/campaign_posters_1790759884468_910717182.jpg\"]','[]',NULL,NULL,NULL,3,155,'2026-09-25','2026-09-27','[166]',114,NULL,NULL,4000,NULL,0,4,113,NULL,1,'2026-09-25 13:34:44',1,'2026-09-30 09:18:04'),(6,'CMP-2026-09-0005',1,'Venture Brite Information System Awareness',141,NULL,'[\"/uploads/campaigns/campaign_posters_1790761291143_479544902.jpg\"]','[]',NULL,NULL,NULL,5,155,'2026-10-01','2026-10-05','[]',114,NULL,NULL,5000,NULL,0,4,112,NULL,1,'2026-09-30 09:35:08',1,'2026-09-30 09:41:31'),(7,'CMP-2026-10-0006',2,'New Video Release',148,NULL,'[\"/uploads/campaigns/campaign_posters_1790874282777_782584259.jpg\"]','[]',NULL,NULL,NULL,5,155,'2026-10-02','2026-10-06','[166]',114,NULL,NULL,5000,NULL,0,4,111,NULL,NULL,'2026-10-01 17:04:42',1,'2026-10-01 17:09:13'),(8,'CMP-2026-10-0007',1,'New Products Arrival',142,NULL,'[\"/uploads/campaigns/campaign_posters_1791141165408_894998862.png\"]','[]',NULL,NULL,NULL,5,155,'2026-10-05','2026-10-09','[166]',114,516,NULL,2000,NULL,0,4,112,NULL,1,'2026-10-04 19:12:45',1,'2026-10-04 21:51:41');
/*!40000 ALTER TABLE `campaigns` ENABLE KEYS */;
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
INSERT INTO `dashboard_visibility` VALUES (1,3,'stat_orders',1),(2,3,'stat_revenue',0),(3,3,'stat_advertisers',1),(4,3,'stat_stock',1),(5,3,'stat_suppliers',0),(6,3,'stat_low_stock',1),(7,3,'chart_trend',1),(8,3,'chart_status',1),(9,3,'chart_top_items',1),(10,3,'chart_recent_orders',0),(11,3,'chart_stock_cat',1),(111,2,'stat_orders',1),(112,2,'stat_revenue',1),(113,2,'stat_advertisers',1),(114,2,'stat_stock',1),(115,2,'stat_suppliers',1),(116,2,'stat_low_stock',1),(117,2,'chart_trend',1),(118,2,'chart_status',1),(119,2,'chart_top_items',1),(120,2,'chart_recent_orders',0),(121,2,'chart_stock_cat',1),(133,1,'stat_orders',1),(134,1,'stat_revenue',1),(135,1,'stat_advertisers',1),(136,1,'stat_stock',1),(137,1,'stat_suppliers',1),(138,1,'stat_low_stock',1),(139,1,'chart_trend',1),(140,1,'chart_status',1),(141,1,'chart_top_items',1),(142,1,'chart_recent_orders',1),(143,1,'chart_stock_cat',1);
/*!40000 ALTER TABLE `dashboard_visibility` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_verification_codes`
--

DROP TABLE IF EXISTS `email_verification_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `email_verification_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `audience` enum('brand_ambassador','advertiser') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` int NOT NULL DEFAULT '0',
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `expires_at` timestamp NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email_verification_lookup` (`audience`,`email`,`created_on`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_verification_codes`
--

LOCK TABLES `email_verification_codes` WRITE;
/*!40000 ALTER TABLE `email_verification_codes` DISABLE KEYS */;
INSERT INTO `email_verification_codes` VALUES (3,'brand_ambassador','evansarapchiff254@gmail.com','203651',1,0,'2026-09-25 16:11:28','2026-09-25 16:01:28'),(4,'brand_ambassador','evansonmuchai2016@gmail.com','512769',1,0,'2026-09-25 16:17:51','2026-09-25 16:07:51'),(5,'brand_ambassador','arapchiff@gmail.com','470526',0,0,'2026-09-25 16:40:51','2026-09-25 16:25:51'),(6,'brand_ambassador','evansonmuchai2016@gmail.com','741028',0,1,'2026-09-29 12:24:16','2026-09-29 12:09:16'),(7,'brand_ambassador','evansarapchiff254@gmail.com','451429',0,0,'2026-10-01 15:18:47','2026-10-01 15:03:47');
/*!40000 ALTER TABLE `email_verification_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenditure`
--

DROP TABLE IF EXISTS `expenditure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `expenditure` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenditure`
--

LOCK TABLES `expenditure` WRITE;
/*!40000 ALTER TABLE `expenditure` DISABLE KEYS */;
INSERT INTO `expenditure` VALUES (1,'EXP-0001',2,24,19,5000,NULL,'2026-09-14',1,NULL,1,'2026-09-14 17:08:04',NULL,'2026-09-14 17:08:42'),(2,'EXP-0002',3,24,19,3000,NULL,'2026-09-17',1,NULL,1,'2026-09-17 15:03:38',NULL,'2026-09-17 15:05:18');
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
INSERT INTO `loyalty_config` VALUES (1,1000.00,1000.00,NULL,1,'2026-06-15 13:02:25','2026-08-27 14:59:47');
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
  `advertiser_id` int NOT NULL,
  `order_id` int DEFAULT NULL COMMENT 'legacy ÃƒÆ’Ã¢â‚¬ÂÃƒÆ’Ã¢â‚¬Â¡ÃƒÆ’Ã‚Â¶ was a bookings.id, table removed',
  `campaign_id` int DEFAULT NULL,
  `points` int NOT NULL DEFAULT '0',
  `order_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lp_campaign` (`campaign_id`),
  KEY `fk_lp_client` (`advertiser_id`),
  CONSTRAINT `fk_lp_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lp_client` FOREIGN KEY (`advertiser_id`) REFERENCES `advertisers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loyalty_points`
--

LOCK TABLES `loyalty_points` WRITE;
/*!40000 ALTER TABLE `loyalty_points` DISABLE KEYS */;
INSERT INTO `loyalty_points` VALUES (4,2,13,NULL,35,70000.00,'2026-08-18 12:52:07'),(6,2,5,NULL,3,6000.00,'2026-08-19 13:38:48'),(8,2,19,NULL,4,9000.00,'2026-08-20 09:46:20');
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
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menus`
--

LOCK TABLES `menus` WRITE;
/*!40000 ALTER TABLE `menus` DISABLE KEYS */;
INSERT INTO `menus` VALUES (1,'Dashboard',NULL,1,'/dashboard',0,'DashboardOutlined','Main dashboard',1,'2026-05-06 12:29:31','2026-05-11 10:20:23'),(2,'Configurations',NULL,1,NULL,7,'SettingOutlined','System configurations',1,'2026-05-06 12:29:31','2026-08-20 13:49:23'),(3,'Business Setup',2,2,'/config/business',0,'ShopOutlined','Business information',1,'2026-05-06 12:29:31','2026-05-06 12:29:31'),(4,'System Menus',2,2,'/config/menus',1,'MenuOutlined','Manage menus',1,'2026-05-06 12:29:31','2026-05-11 10:22:29'),(5,'Groups',8,2,'/config/roles',2,'TeamOutlined','Manage roles',1,'2026-05-06 12:29:31','2026-08-14 16:23:29'),(6,'Process Types',2,2,'/config/process-types',3,'ApartmentOutlined','Manage process types',1,'2026-05-06 12:29:31','2026-05-06 12:29:31'),(7,'Ref Numbering',2,2,'/config/ref-numbering',4,'NumberOutlined','Reference numbering',1,'2026-05-06 12:29:31','2026-05-06 12:29:31'),(8,'Users and Roles',NULL,1,NULL,6,'UserOutlined','User administration',1,'2026-05-06 12:29:31','2026-08-20 14:01:56'),(9,'Users',8,2,'/users',0,'UserAddOutlined','Manage users',1,'2026-05-06 12:29:31','2026-05-06 12:29:31'),(11,'Revenue',31,2,'/stock/payments',1,'RiseOutlined','Trip/event payments',1,'2026-05-06 12:29:31','2026-09-15 10:10:45'),(16,'Stake-Holders',NULL,1,NULL,3,'BankOutlined','Client management',1,'2026-05-06 12:29:31','2026-10-01 11:52:08'),(17,'Advertisers',16,2,'/advertisers',1,'IdcardOutlined','Manage clients',1,'2026-05-06 12:29:31','2026-10-01 11:53:36'),(22,' Dashboard',8,2,'/config/dashboard',3,'DashboardOutlined',' Dashboard Configurations',1,'2026-05-07 15:43:24','2026-05-14 09:05:00'),(23,'Workflows',2,2,'/config/workflows',6,'BranchesOutlined',NULL,1,'2026-05-13 12:47:04','2026-09-15 10:10:45'),(24,'Receipt Setup',31,2,'/stock/receipt-config',3,'FileTextOutlined',NULL,0,'2026-05-26 13:39:22','2026-08-20 14:14:32'),(26,'Campaigns',NULL,1,NULL,1,'SoundOutlined','Orders Management',1,'2026-06-01 14:08:11','2026-09-29 12:28:08'),(27,'Reporting',NULL,1,NULL,5,'BarChartOutlined',NULL,1,'2026-06-02 16:48:24','2026-08-20 14:02:03'),(28,'Campaigns',27,2,'/reports/campaigns',1,'LineChartOutlined',NULL,1,'2026-06-02 16:48:24','2026-09-17 09:54:51'),(29,'Loyalty Points',2,2,'/config/loyalty',15,'TrophyOutlined',NULL,0,'2026-06-15 13:02:25','2026-09-28 15:45:13'),(30,'Parameters',2,2,'/config/parameters',16,'ControlOutlined','Generic configuration lookups (parameters and their values)',1,'2026-08-13 15:58:01','2026-08-13 15:58:01'),(31,'Accounts',NULL,1,NULL,2,'DollarOutlined',NULL,1,'2026-08-14 10:04:36','2026-09-29 12:27:56'),(33,'Expenditure',31,2,'/stock/expenditure',2,'WalletOutlined','Trip/event expenditure',1,'2026-08-14 13:12:42','2026-08-20 07:41:12'),(34,'Ambassadors',16,1,'/brand-ambassadors',2,'MobileOutlined','WhatsApp status advertiser accounts',1,'2026-09-14 12:26:47','2026-10-01 11:53:22'),(35,'Campaigns',26,1,'/campaigns',9,'SoundOutlined','Advertising campaigns',1,'2026-09-14 12:26:47','2026-09-15 10:10:45'),(36,'Ambassadors',2,2,'/config/brand-ambassador-settings',17,'SettingOutlined','Minimum average status views required to register as an advertiser',1,'2026-09-15 10:22:28','2026-10-04 20:42:04'),(37,'Proof Review',26,1,'/campaigns/proof-review',10,'FileSearchOutlined','Review advertiser daily posting-proof submissions',1,'2026-09-17 11:20:19','2026-09-17 11:20:19'),(38,'Salaries',31,2,'/stock/salaries',4,'DollarCircleOutlined','Salary payments made to advertisers for campaigns',1,'2026-09-25 14:01:46','2026-09-25 14:01:46');
/*!40000 ALTER TABLE `menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_preferences`
--

DROP TABLE IF EXISTS `notification_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_preferences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `audience` enum('mis','brand_ambassador','advertiser') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_id` int NOT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `push_enabled` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_notification_pref` (`audience`,`recipient_id`,`type`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Per-recipient opt-out of individual notification types';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_preferences`
--

LOCK TABLES `notification_preferences` WRITE;
/*!40000 ALTER TABLE `notification_preferences` DISABLE KEYS */;
INSERT INTO `notification_preferences` VALUES (1,'brand_ambassador',5,'proof_reviewed',1,1),(3,'mis',1,'advertiser_registered',1,1);
/*!40000 ALTER TABLE `notification_preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `audience` enum('mis','brand_ambassador','advertiser') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='In-app notification bell entries for advertisers, clients and MIS staff';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (8,'mis',1,'advertiser_registered','New advertiser registration','Anna Pamela (ADV-0004) registered and is awaiting review.','/advertisers',1,'2026-09-25 15:23:08'),(9,'mis',6,'advertiser_registered','New advertiser registration','Anna Pamela (ADV-0004) registered and is awaiting review.','/advertisers',0,'2026-09-25 15:23:08'),(10,'brand_ambassador',6,'registration_reviewed','Registration Approved','Your advertiser registration has been approved ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â you can now log in to the portal.','/advertiser/profile',1,'2026-09-25 15:24:05'),(11,'brand_ambassador',6,'campaign_assigned','Assigned to a campaign','You\'ve been assigned to run \"Jonathan David\'s Youtube Channel\".','/advertiser/campaigns',1,'2026-09-25 15:24:58'),(12,'brand_ambassador',5,'campaign_assigned','Assigned to a campaign','You\'ve been assigned to run \"Jonathan David\'s Youtube Channel\".','/advertiser/campaigns',1,'2026-09-25 15:26:30'),(13,'mis',6,'proof_submitted','New posting proof submitted','Anna Pamela submitted a proof for \"Jonathan David\'s Youtube Channel\" (2026-09-25).','/campaigns/proof-review',0,'2026-09-25 15:28:17'),(14,'mis',1,'proof_submitted','New posting proof submitted','Anna Pamela submitted a proof for \"Jonathan David\'s Youtube Channel\" (2026-09-25).','/campaigns/proof-review',1,'2026-09-25 15:28:17'),(15,'brand_ambassador',6,'proof_reviewed','Posting proof Accepted','Your proof for \"Jonathan David\'s Youtube Channel\" (2026-09-25) was Accepted.','/advertiser/campaigns',1,'2026-09-25 15:28:24'),(16,'brand_ambassador',6,'proof_reviewed','Posting proof reverted to Pending','Your proof for \"Jonathan David\'s Youtube Channel\" (2026-09-25) was reverted to Pending.','/advertiser/campaigns',1,'2026-09-25 15:37:19'),(17,'brand_ambassador',6,'proof_reviewed','Posting proof Rejected','Your proof for \"Jonathan David\'s Youtube Channel\" (2026-09-25) was rejected: Rejected','/advertiser/campaigns',1,'2026-09-25 15:37:44'),(18,'mis',6,'proof_submitted','New posting proof submitted','Anna Pamela submitted a proof for \"Jonathan David\'s Youtube Channel\" (2026-09-25).','/campaigns/proof-review',0,'2026-09-25 15:39:01'),(19,'mis',1,'proof_submitted','New posting proof submitted','Anna Pamela submitted a proof for \"Jonathan David\'s Youtube Channel\" (2026-09-25).','/campaigns/proof-review',1,'2026-09-25 15:39:01'),(20,'brand_ambassador',6,'proof_reviewed','Posting proof Accepted','Your proof for \"Jonathan David\'s Youtube Channel\" (2026-09-25) was Accepted.','/advertiser/campaigns',1,'2026-09-25 15:39:24'),(21,'mis',6,'advertiser_registered','New advertiser registration','Test User (ADV-0005) registered and is awaiting review.','/advertisers',0,'2026-09-25 15:55:19'),(22,'mis',1,'advertiser_registered','New advertiser registration','Test User (ADV-0005) registered and is awaiting review.','/advertisers',1,'2026-09-25 15:55:19'),(23,'mis',6,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"New System Awareness\" (2026-09-23).','/campaigns/proof-review',0,'2026-09-28 12:19:41'),(24,'mis',1,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"New System Awareness\" (2026-09-23).','/campaigns/proof-review',1,'2026-09-28 12:19:41'),(25,'mis',6,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"New System Awareness\" (2026-09-22).','/campaigns/proof-review',0,'2026-09-28 14:24:08'),(26,'mis',1,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"New System Awareness\" (2026-09-22).','/campaigns/proof-review',1,'2026-09-28 14:24:08'),(27,'mis',1,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"New System Awareness\" (2026-09-24).','/campaigns/proof-review',1,'2026-09-28 14:24:25'),(28,'mis',6,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"New System Awareness\" (2026-09-24).','/campaigns/proof-review',0,'2026-09-28 14:24:25'),(29,'mis',1,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"New System Awareness\" (2026-09-25).','/campaigns/proof-review',1,'2026-09-28 14:24:44'),(30,'mis',6,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"New System Awareness\" (2026-09-25).','/campaigns/proof-review',0,'2026-09-28 14:24:44'),(31,'mis',1,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"Sample Campaign\" (2026-09-25).','/campaigns/proof-review',1,'2026-09-28 14:25:11'),(32,'mis',6,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"Sample Campaign\" (2026-09-25).','/campaigns/proof-review',0,'2026-09-28 14:25:11'),(33,'brand_ambassador',3,'proof_reviewed','Posting proof Accepted','Your proof for \"Sample Campaign\" (2026-09-25) was Accepted.','/advertiser/campaigns',1,'2026-09-28 14:25:34'),(34,'brand_ambassador',3,'proof_reviewed','Posting proof Accepted','Your proof for \"New System Awareness\" (2026-09-25) was Accepted.','/advertiser/campaigns',1,'2026-09-28 14:25:35'),(35,'brand_ambassador',3,'proof_reviewed','Posting proof Rejected','Your proof for \"New System Awareness\" (2026-09-24) was rejected: Rejected','/advertiser/campaigns',1,'2026-09-28 14:25:59'),(36,'brand_ambassador',3,'proof_reviewed','Posting proof Accepted','Your proof for \"New System Awareness\" (2026-09-22) was Accepted.','/advertiser/campaigns',1,'2026-09-28 14:26:14'),(37,'brand_ambassador',3,'proof_reviewed','Posting proof Accepted','Your proof for \"New System Awareness\" (2026-09-23) was Accepted.','/advertiser/campaigns',1,'2026-09-28 14:26:28'),(38,'mis',1,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"New System Awareness\" (2026-09-24).','/campaigns/proof-review',1,'2026-09-28 14:28:38'),(39,'mis',6,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"New System Awareness\" (2026-09-24).','/campaigns/proof-review',0,'2026-09-28 14:28:38'),(40,'brand_ambassador',3,'proof_reviewed','Posting proof Accepted','Your proof for \"New System Awareness\" (2026-09-24) was Accepted.','/advertiser/campaigns',1,'2026-09-28 14:28:49'),(41,'brand_ambassador',5,'salary_paid','Salary payment recorded','A payment of 240.54 was recorded for \"Pevans Cereals Shop Awareness\".','/advertiser/campaigns',1,'2026-09-28 14:44:51'),(42,'brand_ambassador',1,'salary_paid','Salary payment recorded','A payment of 546.74 was recorded for \"Pevans Cereals Shop Awareness\".','/advertiser/campaigns',0,'2026-09-28 14:44:54'),(43,'brand_ambassador',3,'salary_paid','Salary payment recorded','A payment of 712.72 was recorded for \"Pevans Cereals Shop Awareness\".','/advertiser/campaigns',0,'2026-09-28 14:44:58'),(44,'mis',1,'advertiser_registered','New advertiser registration','Joshua (ADV-0005) registered and is awaiting review.','/advertisers',1,'2026-09-29 12:11:45'),(45,'mis',6,'advertiser_registered','New advertiser registration','Joshua (ADV-0005) registered and is awaiting review.','/advertisers',0,'2026-09-29 12:11:45'),(46,'mis',6,'proof_submitted','New posting proof submitted','Anna Pamela submitted a proof for \"Jonathan David\'s Youtube Channel\" (2026-09-26).','/campaigns/proof-review',0,'2026-09-29 15:24:23'),(47,'mis',1,'proof_submitted','New posting proof submitted','Anna Pamela submitted a proof for \"Jonathan David\'s Youtube Channel\" (2026-09-26).','/campaigns/proof-review',1,'2026-09-29 15:24:23'),(48,'brand_ambassador',6,'proof_reviewed','Posting proof Accepted','Your proof for \"Jonathan David\'s Youtube Channel\" (2026-09-26) was Accepted.','/advertiser/campaigns',1,'2026-09-29 15:25:01'),(49,'advertiser',2,'campaign_stage_changed','Campaign Completed','\"CMP-2026-09-0004\" is now \"Completed\".','/campaigns',1,'2026-09-29 15:25:41'),(50,'brand_ambassador',6,'campaign_assigned','Assigned to a campaign','You\'ve been assigned to run \"Sample Campaign\".','/advertiser/campaigns',1,'2026-09-30 08:11:14'),(51,'advertiser',1,'campaign_stage_changed','Campaign Reviewing','\"CMP-2026-09-0005\" is now \"Reviewing\".','/campaigns',0,'2026-09-30 09:36:51'),(52,'advertiser',1,'campaign_stage_changed','Campaign Approved','\"CMP-2026-09-0005\" is now \"Approved\".','/campaigns',0,'2026-09-30 09:36:58'),(53,'advertiser',1,'campaign_stage_changed','Campaign Payment Requested','\"CMP-2026-09-0005\" is now \"Payment Requested\".','/campaigns',0,'2026-09-30 09:37:25'),(54,'advertiser',1,'campaign_stage_changed','Campaign Payment Done','\"CMP-2026-09-0005\" is now \"Payment Done\".','/campaigns',0,'2026-09-30 09:39:53'),(55,'advertiser',1,'campaign_stage_changed','Campaign Active','\"CMP-2026-09-0005\" is now \"Active\".','/campaigns',0,'2026-09-30 09:40:02'),(56,'brand_ambassador',6,'campaign_assigned','Assigned to a campaign','You\'ve been assigned to run \"Venture Brite Information System Awareness\".','/advertiser/campaigns',1,'2026-09-30 09:40:20'),(57,'brand_ambassador',8,'registration_reviewed','Registration Approved','Your brand ambassador registration has been approved â€” you can now log in to the portal.','/brand-ambassador/profile',1,'2026-10-01 16:21:31'),(58,'brand_ambassador',8,'registration_reviewed','Registration Approved','Your brand ambassador registration has been approved â€” you can now log in to the portal.','/brand-ambassador/profile',0,'2026-10-01 16:48:04'),(59,'brand_ambassador',8,'registration_reviewed','Registration Approved','Your brand ambassador registration has been approved â€” you can now log in to the portal.','/brand-ambassador/profile',0,'2026-10-01 16:49:11'),(60,'mis',1,'campaign_submitted','New campaign submitted','A campaign was submitted for review from the advertiser portal.','/campaigns',1,'2026-10-01 17:05:18'),(61,'mis',6,'campaign_submitted','New campaign submitted','A campaign was submitted for review from the advertiser portal.','/campaigns',0,'2026-10-01 17:05:18'),(62,'advertiser',2,'campaign_stage_changed','Campaign Approved','\"Campaign\" is now \"Approved\".','/campaigns',1,'2026-10-01 17:07:42'),(63,'advertiser',2,'campaign_stage_changed','Campaign Reviewing','\"Campaign\" is now \"Reviewing\".','/campaigns',1,'2026-10-01 17:09:08'),(64,'advertiser',2,'campaign_stage_changed','Campaign Approved','\"CMP-2026-10-0006\" is now \"Approved\".','/campaigns',1,'2026-10-01 17:09:13'),(65,'mis',1,'proof_submitted','New posting proof submitted','Chris Benz submitted a proof for \"New System Awareness\" (2026-09-26).','/campaigns/proof-review',1,'2026-10-01 17:30:41'),(66,'mis',6,'proof_submitted','New posting proof submitted','Chris Benz submitted a proof for \"New System Awareness\" (2026-09-26).','/campaigns/proof-review',0,'2026-10-01 17:30:41'),(67,'brand_ambassador',5,'campaign_assigned','Assigned to a campaign','You\'ve been assigned to run \"New Video Release\".','/brand-ambassador/campaigns',1,'2026-10-01 17:34:09'),(68,'advertiser',1,'campaign_stage_changed','Campaign Reviewing','\"Campaign\" is now \"Reviewing\".','/campaigns',0,'2026-10-04 19:13:07'),(69,'advertiser',1,'campaign_stage_changed','Campaign Approved','\"CMP-2026-10-0007\" is now \"Approved\".','/campaigns',0,'2026-10-04 19:13:32'),(70,'advertiser',1,'campaign_stage_changed','Campaign Pending Payment','\"CMP-2026-10-0007\" is now \"Pending Payment\".','/campaigns',0,'2026-10-04 20:17:11'),(71,'advertiser',1,'campaign_stage_changed','Campaign Payment Done','\"CMP-2026-10-0007\" is now \"Payment Done\".','/campaigns',0,'2026-10-04 20:33:28'),(72,'brand_ambassador',5,'proof_reviewed','Posting proof Rejected','Your proof for \"New System Awareness\" (2026-09-26) was rejected: Reject','/brand-ambassador/campaigns',1,'2026-10-04 20:34:04'),(73,'advertiser',1,'campaign_stage_changed','Campaign Active','\"CMP-2026-10-0007\" is now \"Active\".','/campaigns',0,'2026-10-04 20:36:02'),(74,'brand_ambassador',5,'campaign_assigned','Assigned to a campaign','You\'ve been assigned to run \"New Products Arrival\".','/brand-ambassador/campaigns/p2VnsR',1,'2026-10-04 21:19:35'),(75,'brand_ambassador',6,'campaign_assigned','Assigned to a campaign','You\'ve been assigned to run \"New Products Arrival\".','/brand-ambassador/campaigns/p2VnsR',1,'2026-10-04 21:53:40');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
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
  `advertiser_id` int DEFAULT NULL,
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
  KEY `fk_orders_client` (`advertiser_id`),
  CONSTRAINT `fk_orders_client` FOREIGN KEY (`advertiser_id`) REFERENCES `advertisers` (`id`) ON DELETE SET NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parameter_values`
--

LOCK TABLES `parameter_values` WRITE;
/*!40000 ALTER TABLE `parameter_values` DISABLE KEYS */;
INSERT INTO `parameter_values` VALUES (1,1,NULL,'Chair Person',NULL,1,0,'2026-10-19 14:31:10'),(2,1,NULL,'Treasurer',NULL,1,0,'2026-10-19 14:31:25'),(3,1,NULL,'Secretary',NULL,1,0,'2026-10-19 14:31:34'),(4,1,NULL,'Member',NULL,1,1,'2026-10-19 14:31:56'),(5,2,NULL,'Deposit',NULL,1,1,'2026-10-19 14:32:21'),(6,2,NULL,'Withdraw',NULL,1,0,'2026-10-19 14:32:38');
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
  `parameter_name` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `text_id` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint DEFAULT '1',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parameters`
--

LOCK TABLES `parameters` WRITE;
/*!40000 ALTER TABLE `parameters` DISABLE KEYS */;
INSERT INTO `parameters` VALUES (1,'Positions','parties-positions',NULL,1,'2026-10-19 14:29:39'),(2,'Transaction Types','transaction-types',NULL,1,'2026-10-19 14:30:45');
/*!40000 ALTER TABLE `parameters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `file_no` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `advertiser_id` int NOT NULL DEFAULT '0',
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
  KEY `FK_paymentss_clients` (`advertiser_id`) USING BTREE,
  KEY `FK_paymentss_parameter_values` (`currency_id`) USING BTREE,
  KEY `FK_payments_campaigns` (`campaign_id`),
  KEY `FK_payments_payment_mode` (`payment_mode_id`),
  CONSTRAINT `FK_payments_campaigns` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_payments_payment_mode` FOREIGN KEY (`payment_mode_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_paymentss_clients` FOREIGN KEY (`advertiser_id`) REFERENCES `advertisers` (`id`),
  CONSTRAINT `FK_paymentss_parameter_values` FOREIGN KEY (`currency_id`) REFERENCES `parameter_values` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Payments';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,'PAY-0001',1,2,19,167,30000,NULL,'2026-09-14',1,NULL,1,'2026-09-14 16:20:14',1,'2026-09-14 17:09:53'),(2,'PAY-0002',3,2,19,167,1000,NULL,'2026-09-14',1,NULL,1,'2026-09-14 16:51:33',NULL,'2026-09-14 17:10:12'),(3,'PAY-0003',12,3,19,167,15000,NULL,'2026-09-15',1,NULL,1,'2026-09-15 09:51:18',NULL,NULL),(4,'PAY-0004',3,4,19,167,1500,NULL,'2026-09-15',1,NULL,1,'2026-09-15 09:51:36',NULL,NULL),(5,'PAY-0005',1,2,19,167,2000,NULL,'2026-09-17',1,NULL,1,'2026-09-17 13:54:21',NULL,NULL),(6,'PAY-0006',12,3,19,167,3500,NULL,'2026-09-17',1,NULL,1,'2026-09-17 13:54:36',NULL,NULL),(7,'PAY-0007',3,4,19,167,2000,NULL,'2026-09-22',1,NULL,1,'2026-09-22 10:52:37',NULL,NULL),(8,'PAY-0008',2,5,19,167,4000,NULL,'2026-09-25',1,NULL,1,'2026-09-25 14:17:21',NULL,NULL),(9,'PAY-0009',1,6,19,167,5000,NULL,'2026-09-30',1,NULL,1,'2026-09-30 09:39:46',NULL,NULL),(10,'PAY-0010',1,8,19,167,2000,NULL,'2026-10-04',1,NULL,1,'2026-10-04 20:33:21',NULL,NULL);
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `process_types`
--

LOCK TABLES `process_types` WRITE;
/*!40000 ALTER TABLE `process_types` DISABLE KEYS */;
INSERT INTO `process_types` VALUES (1,'user_registration','User Registration','users','2026-05-06 12:29:31','2026-06-24 17:14:17'),(2,'advertiser_registration','Advertiser Registration','advertisers','2026-05-06 12:29:31','2026-10-01 11:06:51'),(4,'order_placement','Order Placement','bookings','2026-05-06 12:29:31','2026-08-17 15:44:48'),(7,'order_receipt','Order Receipt',NULL,'2026-05-26 10:20:14','2026-05-26 10:20:14'),(8,'trip_event_Creation','Trip/events','trips','2026-08-14 08:51:24','2026-08-14 08:51:24'),(9,'participant_registration','Trip/Event Participants','participants','2026-08-14 13:12:42','2026-08-14 13:12:42'),(10,'expenditure_creation','Trip/Event Expenditure','expenditure','2026-08-14 13:12:42','2026-08-14 13:12:42'),(11,'payment_creation','Trip/Event Payments','payments','2026-08-14 13:54:44','2026-08-14 13:54:44'),(12,'brand_ambassador_registration','Brand Ambassador Registration','brand_ambassadors','2026-09-14 12:26:47','2026-10-01 10:32:40'),(13,'campaign_creation','Advertising campaign creation','campaigns','2026-09-14 12:26:47','2026-09-14 12:26:47'),(14,'salary_creation','Advertiser Salary Payments','salaries','2026-09-25 14:01:46','2026-09-25 14:01:46');
/*!40000 ALTER TABLE `process_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `push_subscriptions`
--

DROP TABLE IF EXISTS `push_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `push_subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipient_id` int NOT NULL,
  `audience` enum('mis','brand_ambassador','advertiser') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'advertiser',
  `endpoint` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `p256dh` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `auth` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pps_endpoint` (`endpoint`(500)),
  KEY `idx_push_sub_recipient` (`audience`,`recipient_id`)
) ENGINE=InnoDB AUTO_INCREMENT=186 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `push_subscriptions`
--

LOCK TABLES `push_subscriptions` WRITE;
/*!40000 ALTER TABLE `push_subscriptions` DISABLE KEYS */;
INSERT INTO `push_subscriptions` VALUES (17,1,'advertiser','https://fcm.googleapis.com/fcm/send/de7nGtzYHSo:APA91bHLNsCI99a-pQFDr_wZDdz9k_xqDZFCyGX5C59pGrEhv5qZIIr_pbx-Klbv6rQncYsbDi7zwyQUQEf_Qyuot4IwSlBdf9YEDAzE7zSDD3VqeN9BVpDkdMmURivfgodh91qbCUbn','BC78f5_sElaMuulB9mamplg2L4pr4KQ8LR9un6NC7Ig985_TulbYX1u6ywfJ3aWSXzU2ysQlTNzHb-q5rBZNq2Q','T6HvxF849aRVq1L8zfvtcw',1,'2026-06-23 11:37:53'),(48,1,'advertiser','https://fcm.googleapis.com/fcm/send/dE1c_Spvkow:APA91bEs490SYDHqecMkp_P1Eiik1ukzftoh2F6Dbt2eTPn_EKOafZ5sQ48tYU6va05UIjCYRiFOiSrw-9l8FYXEkiXooDBl63cP_wL9McpzRj1aGeU9FIKnMstMD3fVDjozhIKob_Wp','BOTye-wPN3SxOExYsDaAljVe4huKkxWSJzjzUdk2n0DEierv79VBJTgXF5lbThevkrXJSmqwM58xGoxi0YKU-X4','2tSfblhgHK2G-6ouXKjMxQ',0,'2026-08-14 15:20:23'),(62,1,'advertiser','https://fcm.googleapis.com/fcm/send/eeV9m9gboyk:APA91bGQPQDe_7NT22xOhx_nNwEvYzZIIjkKOfHM8l6_RTywnPZsbdq44HW7E6rt_vkZJaR2aetOloSxGLUlgS-HsnCuIDRXGDQy1xq1C67dAyzqCqXYTjqVwLNo_Rg7ggPoM61dU0Hv','BKvlkPjwsuNkLfFLXld66zteiwUeIhpnwUhqKvI0Y0TZO0oIRi1QZRrvYakEcjz0F27AHNt6x9dDcP0xXhOKbz8','sA06nzZcTD_vnMg9TclUuQ',0,'2026-08-17 16:17:07'),(71,1,'advertiser','https://fcm.googleapis.com/fcm/send/e_6tp2ax8dI:APA91bHFPOgW4yRLGPY8hzgcPD-0OeIglRHWM5xP5Uni68BQULAZy-dCpdXz36f0NtEO3zMYaNu2ZJs0AZthsObwLBuEkUfBYzIUHQewhAk_TM1X_EXcUrW0WnC88wngeADrd9MuPWnq','BHQNxYmzuh1Nx5Bt_2gZtM3LJwr7QiDeHBfQ4j9pY34LTWk88zhA-5wQstGW_p0yJjim-pzhwbheBXE16vZH8Bk','rbhVTwGaamrV5BLEEno6hg',0,'2026-08-18 16:15:56'),(88,1,'advertiser','https://fcm.googleapis.com/fcm/send/cE74ksvhi3I:APA91bFGUXtio8ryEp7IbTaIXTy9P3f4wlc3gY7gaSSQ4pGKH75SL-1RebOD-9gw3d1dzL7NIYaZ2f-nxX6MljMXoIW3xhmzE9cwwCMSIYXFzW_fdnJJsVRFXX7QQ2w32l5fM1_Z04cU','BNuSShrco1vaIXWCsgafysOKD_jYNjpmSbxtH-bLeHZsDPW0pkfouBQ5TNqcRblkBI5VbQ2C2yu_veNGF9omHg8','VG0s574U9_MD4EkvhsOz0g',1,'2026-08-27 13:20:19'),(98,1,'advertiser','https://fcm.googleapis.com/fcm/send/cyX8kFajbzQ:APA91bGRzErwGYbeBVYyy3TT922qAyjRGlo3sJKXpVsbXRSCPvez08JY16Jy1L5HrdhGzvRkBSTQR4WtaCctMLpW4Ip05tn-EukJR9rzXwV6NMF7n8ckUcodwuP4Tj-xrBIxNev_VoGc','BOigFr60Vk7q7PldLYWP-cbKZj-5HTPoRlbbfVJkRSWJVkkgQUrY8Gvw9Vka-wvH61_r0NzP47EjOoJjnCSzXxU','r1EbpayiCqXYoOrkiHsMkA',0,'2026-09-03 15:15:37'),(109,1,'advertiser','https://fcm.googleapis.com/fcm/send/dHr804UxSzc:APA91bEIysso6GlY9AfYqUOla4hS4VPEeRmfaNq_PWsDZDk376qwEPR4NS9ni2qVRIY3s-iJjNBpFgCNHik9ChHGiYqP4bGCGG0ovoqpnviQH_B2iKX1f3ItfohMxITjSmRLdoyU-UY6','BEw3x-MTAUSTf7p8g8E7IZ8ykkUXA6xIyTIS_I3bBsTpJfFNoJn9Eapv4LkPmi7S-9f0OMiCMjJGchmkFVqkDyE','ERLjEIjJZJON1sDnlB3Yog',1,'2026-09-29 17:15:02'),(110,1,'mis','https://fcm.googleapis.com/fcm/send/fSbXcadOVSs:APA91bEOSQ-OnFCSr6ueeUjzOLC_duKUfBUAR3miQsB5SioMGnzrLV1087ZROG5TkPwHX6SGr2RTtOHFrYmacLU8lueC3jUi7l9yBsiJZcUwIrDgQlffpTyoroa3AOZqEuFroA4I7bDV','BOUzorkfShFH6vjYHfBwpPgrXH9Fk_1_qBGnptTF8DP-DX8w-b08bqqHxUPj3Uu2qTV8cF1egtkyqYQVjr7W5LQ','jVxu3byBrEkpQazs4Tn-Wg',0,'2026-10-01 17:27:05'),(111,1,'mis','https://fcm.googleapis.com/fcm/send/eA6EKMC8Fmc:APA91bEKug02wNVkal0oKesoVfkMubiFPPpkNlTEHGX6U_asfoaZwGkSCuwydEBqDQduGigPZjFe8c8i__tQ1JnDHK6l2sMgxPpo7o6iJ3YEAWMDabzZBcK7uiyjE-55V9AqHYRu3Uxm','BL0pPeFW0uIGCn-4o6snb8VJa7t2dOIZA0dBKqB-ky9VlWIpmeKdc0WUO-p3TXtrWGFSDuZ-Lzr4A4MzfBDnlCo','IQ4ckzr6o_kD6Rs1oR0QjA',1,'2026-10-01 17:28:22'),(113,6,'brand_ambassador','https://fcm.googleapis.com/fcm/send/f30JkBip0Es:APA91bFD-ZHYMMxexAkusHSb3o_hmoLeaXEsVhCAzYwzV2MyC6jKqr1nHasXWBIYPguTyV-5F5eSrehhqjlkA6pPt24u0jfRXjU2fEy9VNOctPcFzwjJs-s0vyL4eQi13kZ5jxUiygvA','BLmz9cNaBtI5AzMX_H2fJI27tnjgbSdKRFlomRIODY95Tk6pRM8NdQqRL3cGF5rdlzjjgdmaH2jdLudb20zYs6w','rFFxiAgW66y-QAC4zREKIg',1,'2026-10-01 17:32:27'),(163,1,'mis','https://fcm.googleapis.com/fcm/send/fc_tKYYSBjY:APA91bH_EQzFx0fdfzMXoHKNByr8wvDSCOjHCixD2WTrUJGywTKckHjVcu3WMENzMCi6Ek1ob6TUqQ14KsWliLSsi1eA7ETHLkDKoOTyvbtaKiARDRD0TG4JuGBk7Nfscb39PwgAeU9o','BLnQ2QctRFDlZyf2UNo1xxGmP79qJKi-gECewNHYgRS5aPhyo5geIFQp3CZWfjzy9DHyI4Zw8MaVroHurzpQefc','YcSWekCoz8WaYECBbCjXFA',0,'2026-10-19 13:26:52'),(182,1,'mis','https://fcm.googleapis.com/fcm/send/d2TKQxdh3Sw:APA91bFtQox9MIz5onfX1qxoUb1-p2Iy1YZpuhLE_VkBFyjJYf2SSs8Vh482mOJJ69dWvxxOtVyFz90E5hCmAjYNDAIXX3CAF-9K55sjRnGvvfEL5RHUi1yjCQl438xXsCdX1_GEVcOp','BHkdoaVrH164xvKggAxBiE5xs7v_lA9O3g2WddZgJuh8jyu98Piz5SUo-Pzi2KoaV0TOGooAZoh4C5ijIo3em8s','hzrygVNkFHnwExwRS9X5Zw',0,'2026-10-19 13:40:59'),(185,1,'mis','https://fcm.googleapis.com/fcm/send/ehlTk81wviU:APA91bGogsCk8kXLABL7TVTXmHI7gIicfxVthOYR1xYdof7zXXUparRoKGiQ-P0FTB5nsdAnVhscc356XroiMYyrGCnNxe50NzUseFBiDzoK2S0VRzXOxSO9B-wDSRvmgzmuoZ6SnF97','BI8zXvPKIHlNmbUvIb9RUq0g7vWNavHnbgrMAnTWYvrpC9BtPm1jX-NPL0g4uGTZRaoH78w4vXwPrponVD9EPPg','7lbJW6s4xiow_bLVX2i-_A',1,'2026-10-19 14:16:07');
/*!40000 ALTER TABLE `push_subscriptions` ENABLE KEYS */;
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
INSERT INTO `receipt_config` VALUES (1,'Receipt Configurations','EQUITY ACCOUNT NO. 0746210500','0117107055','ARAPCHIFF@GMAIL.COM','<ul><li><strong>All payments should be made to VENTURE BRITE ADVENTURES </strong></li><li><strong>No cash payment to be made to any of our staff and we are not liable for it. </strong></li><li><strong><span class=\"ql-cursor\">ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â»Ãƒâ€šÃ‚Â¿</span>Fee once sold is not refundable but can be utilized for other trips.</strong></li></ul>','2026-05-26 18:21:26',1,'2026-08-20 07:42:56',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_numbering`
--

LOCK TABLES `ref_numbering` WRITE;
/*!40000 ALTER TABLE `ref_numbering` DISABLE KEYS */;
INSERT INTO `ref_numbering` VALUES (1,1,'USR',1,9,0,0,4,'2026-05-06 12:29:31','2026-09-14 15:32:55'),(2,2,'ADV',1,6,0,0,4,'2026-05-06 12:29:31','2026-10-01 11:06:52'),(7,7,'RCP',1,1,0,0,5,'2026-05-26 10:20:14','2026-09-14 15:32:10'),(10,10,'EXP',1,3,0,0,4,'2026-08-14 13:12:42','2026-09-17 15:05:51'),(11,11,'PAY',1,11,0,0,4,'2026-08-14 13:54:44','2026-10-04 20:33:21'),(12,12,'BAM',1,7,0,0,4,'2026-09-14 12:26:47','2026-10-01 16:49:11'),(13,13,'CMP',1,8,1,1,4,'2026-09-14 12:26:47','2026-10-04 19:13:32'),(14,14,'SAL',1,4,0,0,4,'2026-09-25 14:01:46','2026-09-28 14:44:58');
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
) ENGINE=InnoDB AUTO_INCREMENT=1290 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_menu_access`
--

LOCK TABLES `role_menu_access` WRITE;
/*!40000 ALTER TABLE `role_menu_access` DISABLE KEYS */;
INSERT INTO `role_menu_access` VALUES (731,3,1,1,0,0,0),(732,3,2,1,0,0,0),(734,3,11,0,0,0,0),(737,3,16,1,1,1,0),(738,3,17,1,1,1,0),(741,3,23,1,0,0,0),(743,3,26,1,1,1,0),(1067,2,1,1,1,1,1),(1068,2,2,1,1,1,0),(1069,2,3,1,1,1,0),(1070,2,5,0,0,0,0),(1071,2,7,1,1,1,0),(1072,2,8,0,0,0,0),(1073,2,9,0,0,0,0),(1075,2,11,1,1,1,1),(1077,2,16,1,1,1,1),(1078,2,17,1,1,1,1),(1081,2,22,0,0,0,0),(1082,2,23,1,1,1,0),(1083,2,24,1,1,1,1),(1084,2,26,1,1,1,1),(1085,2,27,1,1,1,1),(1086,2,28,1,1,1,1),(1087,2,29,1,0,1,0),(1088,2,30,1,1,1,1),(1089,2,31,1,1,1,1),(1091,2,33,1,1,1,1),(1120,2,34,1,1,1,1),(1122,2,35,1,1,1,1),(1175,2,36,1,1,1,1),(1177,2,37,1,0,1,0),(1232,2,38,1,1,1,1),(1262,1,1,1,1,1,1),(1263,1,2,1,1,1,0),(1264,1,3,1,1,1,0),(1265,1,4,1,1,1,1),(1266,1,5,1,1,1,1),(1267,1,6,1,1,1,1),(1268,1,7,1,1,1,1),(1269,1,8,1,1,1,1),(1270,1,9,1,1,1,1),(1271,1,11,1,1,1,1),(1272,1,16,1,1,1,1),(1273,1,17,1,1,1,1),(1274,1,22,1,1,1,0),(1275,1,23,1,1,1,1),(1276,1,24,1,1,1,1),(1277,1,26,1,1,1,1),(1278,1,27,1,1,1,1),(1279,1,28,1,1,1,1),(1280,1,29,1,1,1,0),(1281,1,30,1,1,1,1),(1282,1,31,1,1,1,1),(1283,1,33,1,1,1,1),(1284,1,34,1,1,1,1),(1285,1,35,1,1,1,1),(1286,1,36,1,1,1,1),(1287,1,37,1,0,1,0),(1288,1,38,1,1,1,1);
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
INSERT INTO `roles` VALUES (1,'Super Admin','Full system access','2026-05-06 12:29:31','2026-05-06 12:29:31'),(2,'Admin','Administrative access','2026-05-06 12:29:31','2026-05-06 12:29:31'),(3,'Sales','Sales operations access','2026-05-06 12:29:31','2026-05-06 12:29:31');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salaries`
--

DROP TABLE IF EXISTS `salaries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `salaries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `file_no` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `campaign_id` int NOT NULL,
  `brand_ambassador_id` int NOT NULL,
  `currency_id` int DEFAULT NULL,
  `payment_mode_id` int DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `reference` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `paid_by` int DEFAULT NULL,
  `comments` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_salaries_campaigns` (`campaign_id`) USING BTREE,
  KEY `FK_salaries_advertisers` (`brand_ambassador_id`) USING BTREE,
  CONSTRAINT `FK_salaries_advertisers` FOREIGN KEY (`brand_ambassador_id`) REFERENCES `brand_ambassadors` (`id`),
  CONSTRAINT `FK_salaries_campaigns` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Salary payments made to advertisers for campaigns';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salaries`
--

LOCK TABLES `salaries` WRITE;
/*!40000 ALTER TABLE `salaries` DISABLE KEYS */;
INSERT INTO `salaries` VALUES (1,'SAL-0001',4,5,19,167,240.54,NULL,'2026-09-28',1,NULL,1,'2026-09-28 14:44:51',NULL,NULL),(2,'SAL-0002',4,1,19,167,546.74,NULL,'2026-09-28',1,NULL,1,'2026-09-28 14:44:54',NULL,NULL),(3,'SAL-0003',4,3,19,167,712.72,NULL,'2026-09-28',1,NULL,1,'2026-09-28 14:44:58',NULL,NULL);
/*!40000 ALTER TABLE `salaries` ENABLE KEYS */;
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
  CONSTRAINT `shops_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `advertisers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shops`
--

LOCK TABLES `shops` WRITE;
/*!40000 ALTER TABLE `shops` DISABLE KEYS */;
INSERT INTO `shops` VALUES (3,'Jet-Brains Solutions Kenya',1,NULL,'0746210500','emailexample@hotmail.com','active','2026-08-17 18:13:41','2026-08-20 08:42:36',-1.1061230,37.0130950),(4,'Sales Master Wholesalers',2,NULL,'0745098765',NULL,'active','2026-08-18 09:31:23','2026-08-18 09:31:23',NULL,NULL);
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
  `file_no` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `event_fee` int DEFAULT NULL,
  `kids_fee` int DEFAULT NULL,
  `booking_fee` int DEFAULT NULL,
  `status_id` int DEFAULT NULL,
  `inclusions` json DEFAULT NULL,
  `exclusions` json DEFAULT NULL,
  `comments` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `img_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_trips_parameter_values` (`status_id`) USING BTREE,
  CONSTRAINT `FK_trips_parameter_values` FOREIGN KEY (`status_id`) REFERENCES `parameter_values` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Trips and Events Table';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trips`
--

LOCK TABLES `trips` WRITE;
/*!40000 ALTER TABLE `trips` DISABLE KEYS */;
INSERT INTO `trips` VALUES (2,'ADV/TRP-0001','Nairobi National Park','2026-08-14','2026-08-14',NULL,3000,2000,1000,17,'[30, 52, 38, 37, 56, 35, 57, 53, 39, 29, 55, 31]','[38]',NULL,'/uploads/trips/trip_1786975161130.png',1,'2026-08-14 10:01:27',1,'2026-08-17 13:59:21'),(5,'ADV/TRP-0002','Explore Malindi','2026-08-27','2026-08-30',NULL,9000,7000,3000,17,'[40, 28, 39, 26, 31, 57, 56, 52]','[38]',NULL,'/uploads/trips/trip_1786727532181.jpeg',1,'2026-08-14 17:12:12',1,'2026-08-20 09:53:30'),(6,'ADV/TRP-0003','Mombasa Flying Package','2026-09-24','2026-09-28',NULL,12500,10500,5000,17,'[39, 31, 26, 28, 40, 52, 56, 35, 55, 34]','[38]',NULL,'/uploads/trips/trip_1786974853248.jpg',1,'2026-08-17 12:50:17',1,'2026-08-17 13:54:13'),(7,'ADV/TRP-0004','Diani Summer Tides','2026-09-25','2026-09-30',NULL,18000,14000,6000,17,'[35, 57, 30, 52, 37, 33, 40, 55, 28, 39]','[38]',NULL,'/uploads/trips/trip_1786990146740.jpeg',1,'2026-08-17 18:09:06',NULL,NULL),(8,'ADV/TRP-0005','Jumbo Resort Watamu','2026-10-28','2026-11-02',NULL,32500,28500,10000,17,'[52, 30, 37, 56, 39, 28, 31, 26]','[38]',NULL,'/uploads/trips/trip_1787140000266.jpeg',1,'2026-08-19 11:46:40',NULL,NULL),(9,'ADV/TRP-0006','Mombasa August Edition','2026-08-26','2026-08-31',NULL,14500,10000,7500,17,'[40, 28, 39, 26, 53]','[38, 35, 53]',NULL,'/uploads/trips/trip_1787140258757.jpeg',1,'2026-08-19 11:50:58',NULL,NULL),(10,'ADV/TRP-0007','Karura Forest Adventure','2026-07-30','2026-07-30',NULL,3000,2000,1000,17,'[37, 35, 57, 56, 52, 33, 27, 40]','[38]',NULL,'/uploads/trips/trip_1787845041059.jpeg',1,'2026-08-27 15:37:21',NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,1,1,'2026-05-06 16:06:21'),(3,3,3,'2026-05-14 14:22:26'),(4,6,2,'2026-05-14 14:24:04'),(16,1,2,'2026-05-15 08:14:40'),(17,1,3,'2026-05-15 08:14:51'),(18,6,3,'2026-05-15 08:15:13');
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
) ENGINE=InnoDB AUTO_INCREMENT=206 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
INSERT INTO `user_sessions` VALUES (1,1,'U1pL6EDTuqM3D9kSbWPo','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-06 14:06:27','2026-05-06 22:06:27'),(2,3,'2qX147iUb_FVOLsooZNA','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-06 15:43:30','2026-05-06 23:43:30'),(3,3,'7bVB9XEjexlp7n5R4JZc','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-06 15:52:55','2026-05-06 23:52:55'),(4,3,'Uz8Z30E63XVwKRKvcuOU','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-06 16:05:34','2026-05-07 00:05:34'),(5,3,'B3pOYGe8bvrzdunvExrQ','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-06 16:06:46','2026-05-07 00:06:46'),(6,1,'8cw1P6i62y-3jMoY7jOQ','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-07 08:58:17','2026-05-07 16:58:17'),(7,3,'WJSu8jIISiA7h68uR3HM','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-07 09:24:59','2026-05-07 17:24:59'),(8,3,'eSBShj5Vwoy2AV2jggdI','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-07 09:28:23','2026-05-07 17:28:23'),(9,1,'Y0BAwyuRale2U-slwuqY','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-07 09:29:10','2026-05-07 17:29:10'),(12,1,'-GQHIAPgzZNrnJG2oi_c','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-07 13:06:34','2026-05-07 21:06:34'),(13,3,'QI4y_f5wzqJLqk4eyjJA','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-07 15:17:47','2026-05-07 23:17:47'),(14,1,'LfNdyDMUN02gwSV-5xks','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-07 15:22:12','2026-05-07 23:22:12'),(15,3,'VZQiVzkjLxPZzQDGV9ss','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-07 15:22:28','2026-05-07 23:22:28'),(16,3,'3NFdhcaOStnubaQaDoHk','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-07 16:26:57','2026-05-08 00:26:57'),(17,3,'K3RHQby2yslwwZQTudVk','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-07 16:27:53','2026-05-08 00:27:53'),(18,3,'ruCLbY_hr3YZ7PIC17YM','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-08 11:34:18','2026-05-08 19:34:18'),(19,1,'VP8GMwZLehjwmEy0P658','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-08 11:35:40','2026-05-08 19:35:40'),(20,1,'09oJApuy28uHKzoRuRjY','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-08 11:39:54','2026-05-08 19:39:54'),(21,1,'YLGoPCEvhf7dYIDkSfs8','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-09 19:05:23','2026-05-10 03:05:23'),(22,1,'zsxghTA517MX2XNYR-nU','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-10 05:51:57','2026-05-10 13:51:57'),(23,1,'Z1osSFQCJC9lni0WpT8E','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-11 10:03:32','2026-05-11 18:03:32'),(24,3,'OdiWGcnDl5Dy7eSQXcTQ','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-11 10:28:36','2026-05-11 18:28:36'),(25,1,'KJk4HUQvOkybUFmHXW08','::1','Mozilla/5.0 (BB10; Touch) AppleWebKit/537.10+ (KHTML, like Gecko) Version/10.0.9.2372 Mobile Safari/537.10+',0,'2026-05-11 14:52:43','2026-05-11 22:52:43'),(26,1,'C5uZnJNA-NzJjlU1Kq5w','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-12 14:55:07','2026-05-12 22:55:07'),(27,3,'CNAt-xeD1r3fkzkGbWSI','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-12 18:15:29','2026-05-13 02:15:29'),(28,3,'vERVsRooIEL5rcVW7dVI','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-13 07:36:06','2026-05-13 15:36:06'),(29,1,'NuJAuOEIjtub5iKkDPMo','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-13 07:42:54','2026-05-13 15:42:54'),(30,3,'mG1PtF7b7sysclwt-a4w','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-13 07:43:16','2026-05-13 15:43:16'),(31,3,'G9sEylmY3EWVd9scqjzw','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-13 14:11:45','2026-05-13 22:11:45'),(32,1,'SylbP42iIqCIqexbtjO4','::1','Mozilla/5.0 (Linux; U; Android 4.1; en-us; GT-N7100 Build/JRO03C) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',0,'2026-05-13 15:45:04','2026-05-13 23:45:04'),(33,1,'vRW6mq-ac05ehtpP2Gag','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',0,'2026-05-13 15:57:21','2026-05-13 23:57:21'),(34,1,'rJA4qbjqvXaaoHNWMiwQ','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 07:49:12','2026-05-14 15:49:12'),(37,1,'W65rnul8RXOwP_xopbvs','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 13:57:11','2026-05-14 21:57:11'),(38,3,'OBBjsIJ2hj4H9NPQ8Hzc','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 14:00:04','2026-05-14 22:00:04'),(39,1,'FVRApiR2ZtNsh1YV2xg4','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 14:01:00','2026-05-14 22:01:00'),(41,1,'TpPQPJIxE2u3I93zO63I','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 14:10:12','2026-05-14 22:10:12'),(42,1,'crg8tv_17GEUOa88LwUA','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 14:11:26','2026-05-14 22:11:26'),(43,1,'JapLFzt3vFpSTAivYFFo','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 14:12:07','2026-05-14 22:12:07'),(45,1,'iAYnCGQ4TLg-M9aMv0qE','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 14:20:54','2026-05-14 22:20:54'),(46,1,'HCoInbJVB5jOzwxD0wrg','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 14:24:41','2026-05-14 22:24:41'),(47,1,'jAedaYQ-szoTl-gw5_QU','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 14:26:25','2026-05-14 22:26:25'),(48,6,'Q3zAfk7OwuyD_pbnF4iA','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 14:34:27','2026-05-14 22:34:27'),(49,6,'1vV9ON6PULC4MdUTdGdA','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 14:41:57','2026-05-14 22:41:57'),(51,1,'EB1GCC4DYk_moDjKhEk4','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 15:11:09','2026-05-14 23:11:09'),(52,1,'3UtNTKjeodvVG-oh2zs4','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-14 15:40:37','2026-05-14 23:40:37'),(53,1,'4nBvSnX_YidtgpsbTLxM','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-14 15:58:31','2026-05-14 23:58:31'),(54,3,'L42tjg1-j_jnJcMMWxAc','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-14 15:59:10','2026-05-14 23:59:10'),(55,1,'MTqr8RGrw6FSemJfB24Q','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-15 07:36:28','2026-05-15 15:36:28'),(56,3,'ZFBD3BtKaVNKjclIOojw','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-15 07:51:18','2026-05-15 15:51:18'),(57,1,'o547VxGmFAPMzimJ6EuU','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-15 07:56:17','2026-05-15 15:56:17'),(59,1,'Gl6d1zMNkFYCgH4pvzIA','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-15 08:16:49','2026-05-15 16:16:49'),(60,1,'Pc2NDxzAVsNrGnroUxqc','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-16 05:20:24','2026-05-16 13:20:24'),(61,1,'WzoHOR0u58Q6xkiGDmGc','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-16 19:55:34','2026-05-17 03:55:34'),(62,1,'flgK2fIv5qEGZU2VNd7s','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-18 08:57:31','2026-05-18 16:57:31'),(63,1,'gA_1ac3V73qT7CV0E8Is','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-18 17:11:28','2026-05-19 01:11:28'),(64,3,'wsx59mMfvgG7JsF7Pfb8','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-18 17:57:36','2026-05-19 01:57:36'),(66,6,'Appx0yWF3vyLzP-Czfd4','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-18 18:53:34','2026-05-19 02:53:34'),(67,6,'IdvpGrfzHSbXh7nYMCDY','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-19 06:51:43','2026-05-19 14:51:43'),(68,6,'4fOJX-HYi2lEdVOeIyK8','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-19 12:23:08','2026-05-19 20:23:08'),(71,3,'MsgwgIDj5RuuSDjl8jZE','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-19 12:51:51','2026-05-19 20:51:51'),(73,6,'QjyAeb3LM_60Jk5FBoSs','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-19 12:56:40','2026-05-19 20:56:40'),(75,3,'Q4aO5NSEjI_Yu6EJV5pc','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-19 13:02:42','2026-05-19 21:02:42'),(77,6,'uZMiBqeejhcDiIWWJ4II','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-19 13:04:12','2026-05-19 21:04:12'),(80,6,'gJqK-oyXLnCF-lkq59AI','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-19 13:09:23','2026-05-19 21:09:23'),(85,1,'OIyHd-bHZepz8elQd13w','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-20 18:25:57','2026-05-21 02:25:57'),(86,1,'LDXFnHprG-0RtOLF4A_E','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-21 04:27:21','2026-05-21 12:27:21'),(87,1,'vKAATas3zAFeXU5Da_-o','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-21 04:28:23','2026-05-21 12:28:23'),(88,6,'Yi5IOh8ls06wBKcW0gWc','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-21 07:07:18','2026-05-21 15:07:18'),(89,6,'EL_NzbtNWE41BqNAkbiw','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-21 08:21:28','2026-05-21 16:21:28'),(90,6,'uSv5ITdEW8x92cyLmgH4','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-21 18:47:22','2026-05-22 02:47:22'),(91,6,'WLsArQ5RmeBfrbMBV_mA','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-23 09:41:33','2026-05-23 17:41:33'),(92,1,'CTxX2Imi6pzLEpj3JBto','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-24 21:36:27','2026-05-25 05:36:27'),(93,6,'ZlJka1RTpbGmOZZnZMxw','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-25 12:45:29','2026-05-25 20:45:29'),(94,1,'8wQUsVNDzKGkBGvFQA34','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-25 12:45:58','2026-05-25 20:45:58'),(96,1,'VD_H-L_hYFXrrRN7YTiI','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-25 22:22:16','2026-05-26 06:22:16'),(98,1,'fq2z5_kamnePe-ifkzYc','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-26 07:17:07','2026-05-26 15:17:07'),(99,1,'mF3oAHEtN4pqC1W8rePg','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-26 15:19:42','2026-05-26 23:19:42'),(100,1,'_VDjO3v3Bf6HuW0-meyo','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-26 16:25:08','2026-05-27 00:25:08'),(101,3,'hq3ILJDXkIaDtA06Yibg','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-26 18:35:49','2026-05-27 02:35:49'),(102,3,'Hpf3Q8U7c2F1MfpyPopg','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-26 18:40:57','2026-05-27 02:40:57'),(103,1,'eNvs_LEjD5hjahBbAj84','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-27 06:00:04','2026-05-27 14:00:04'),(104,1,'nqH0zinqF4fXM9_v2WhM','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-27 06:01:31','2026-05-27 14:01:31'),(106,1,'2D2BTbt7QoIaYERws29E','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-27 11:39:40','2026-05-27 19:39:40'),(107,1,'9bXnnTrPiEol7lDhBCgQ','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-27 15:12:42','2026-05-27 23:12:42'),(108,1,'t-O0cENBPUOroXmnDD40','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-27 18:03:25','2026-05-28 02:03:25'),(109,1,'2aHz7aZfCp872OeohOV8','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-27 18:06:28','2026-05-28 02:06:28'),(110,3,'45vYDNCGpj7-KrpxDegg','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-28 06:22:29','2026-05-28 14:22:29'),(111,1,'m7BLGcyF1v3GlTdXFyEU','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-28 11:13:03','2026-05-28 19:13:03'),(112,1,'NwKxSl6NrPrFYT3gLKSg','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-28 12:00:19','2026-05-28 20:00:19'),(114,1,'7b2HE8L9KEMx6FnFyiGY','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-28 21:20:10','2026-05-29 05:20:10'),(115,1,'zFjm4pjyVm_MFsP7nb00','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-29 12:35:40','2026-05-29 20:35:40'),(116,1,'uaR96PUfDgp0VqptOKpM','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-05-29 17:13:46','2026-05-30 01:13:46'),(118,1,'mYYrSrhaAvFLqBpSBqrI','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-30 14:48:02','2026-05-30 22:48:02'),(119,1,'8WXWT9aLkwONaukfQWqU','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-05-31 22:48:46','2026-06-01 06:48:46'),(120,1,'ZMFtQ1ZHJoSLu-2ll09o','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-01 13:59:18','2026-06-01 21:59:18'),(121,1,'G4T9n5GR-KOu3rui3zis','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-01 14:11:31','2026-06-01 22:11:31'),(122,1,'dJIzNijuM2Jt_4Gue3ZE','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-01 14:13:33','2026-06-01 22:13:33'),(123,1,'-7zLV1V6swKqJElNwJ4I','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-02 11:46:36','2026-06-02 19:46:36'),(124,3,'cFduoQnfIQL_kfcD7ldE','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',1,'2026-06-02 13:15:51','2026-06-02 21:15:51'),(125,1,'MWjhgaUyckhNEp3PQ6uc','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-02 17:15:16','2026-06-03 01:15:16'),(126,1,'5cwr6QW3eaJof5AzhwFk','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-06-02 17:24:50','2026-06-03 01:24:50'),(127,1,'K8jon59ozvQAnVS7Qi88','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-06-02 19:11:54','2026-06-03 03:11:54'),(128,1,'MFvMuLKQiwdamP2eXTYc','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-06-02 19:12:26','2026-06-03 03:12:26'),(129,1,'EoZ8QXkJ0wIKnxClQSTk','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-06-02 19:16:35','2026-06-03 03:16:35'),(130,1,'Y_FtVBgt9LcnMaanF0Eo','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-03 12:44:56','2026-06-03 20:44:56'),(131,1,'g6nS2xmoqXyR5wbX5Clk','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-06-03 17:24:40','2026-06-04 01:24:40'),(132,1,'xNAlMFdUWEqpcKTFuLsg','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-06-03 19:46:54','2026-06-04 03:46:54'),(133,1,'ZyOSO3_nasO_6AD1FqNU','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-04 14:50:28','2026-06-04 22:50:28'),(134,1,'zTIE1ilhq476PMz66zBo','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-06-05 05:32:14','2026-06-05 13:32:14'),(135,1,'8t4zJ8jKWOX9qj9ymSN4','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-05 11:09:32','2026-06-05 19:09:32'),(136,1,'w2hO988xTaiFAMXyZ-uc','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-06-07 20:40:54','2026-06-08 04:40:54'),(137,1,'6FQWmjLXnkuiaPb1qYqE','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',0,'2026-06-08 11:24:52','2026-06-08 19:24:52'),(138,1,'78aZM77lTdrYUe0qmgvY','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-08 13:04:25','2026-06-08 21:04:25'),(139,1,'7xoKCTgCt7cAIDetmwSc','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-08 13:53:29','2026-06-08 21:53:29'),(140,1,'otGsgg8d1CGYRobVOF3E','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-08 13:54:38','2026-06-08 21:54:38'),(141,1,'pM4I6_eYRiSTmvefmIjI','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-08 16:05:22','2026-06-09 00:05:22'),(142,1,'0_GEVCu7nKPal2CRDQFo','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-08 16:10:02','2026-06-09 00:10:02'),(143,1,'1oxtWb6kcdKNu-FfVjDg','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-09 08:07:53','2026-06-09 16:07:53'),(144,1,'gxdg394vJ7jsTND2mtDE','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-09 09:51:15','2026-06-09 17:51:15'),(145,1,'PuMCC2CVQd0DnJfw1dY4','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-09 09:57:47','2026-06-09 17:57:47'),(146,1,'80953AUaL0ZZtGRJIAmw','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-09 10:04:30','2026-06-09 18:04:30'),(147,1,'N2B-MMs_Qjv10BT_Cmc0','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-10 07:55:40','2026-06-10 15:55:40'),(148,1,'fM8p9H1Lwl1UCR63o7ok','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-10 08:13:27','2026-06-10 16:13:27'),(149,1,'GZG8GtQfMqK98-vG8eb0','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-10 11:24:04','2026-06-10 19:24:04'),(150,1,'Yb6LXKBDbyED5wNolUkg','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-11 07:46:24','2026-06-11 15:46:24'),(151,1,'nUPKjlHgRf1-XigoSOGY','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-11 15:47:04','2026-06-11 23:47:04'),(152,1,'RH88jeF7Sh9CpcenMET4','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-12 07:16:30','2026-06-12 15:16:30'),(153,1,'sIFoouckThNKauhNLRCA','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-15 08:55:10','2026-06-15 16:55:10'),(154,1,'ekU50QT0vezMFXIVG86A','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-15 13:07:10','2026-06-15 21:07:10'),(155,1,'jSH5nOjCB-_zduZsm_fs','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-16 15:56:18','2026-06-16 23:56:18'),(156,1,'8WTDgWUMh772_hu6r77Y','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-18 15:22:01','2026-06-18 23:22:01'),(157,1,'72fBiNIMCJpyhySvhBDA','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',0,'2026-06-22 12:11:03','2026-06-22 20:11:03'),(158,1,'cl7B5EGiBhKFsW7ynUMY','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',0,'2026-06-23 11:35:28','2026-06-23 19:35:28'),(159,1,'eAChDOP5ea1duOTfws6w','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',0,'2026-06-24 14:43:06','2026-06-24 22:43:06'),(160,1,'b1F6aO5ID0fCW5egZglQ','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',0,'2026-06-24 14:45:04','2026-06-24 22:45:04'),(161,1,'EwTL5WprYANpqdKF48Fk','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',0,'2026-06-25 11:14:19','2026-06-25 19:14:19'),(162,1,'3TX2MLmIakkq-AKjRetU','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',0,'2026-06-29 16:19:25','2026-06-30 00:19:25'),(163,1,'n-9EJOw2YB6Yd8O-8dY4','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',0,'2026-08-11 13:34:48','2026-08-11 21:34:48'),(164,1,'MUkgOROsb8EklB5yM4ao','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',0,'2026-08-12 08:16:13','2026-08-12 16:16:13'),(165,1,'oE-RSlCsgkLQsS5Trkzc','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',0,'2026-08-13 14:09:29','2026-08-13 22:09:29'),(166,1,'fIth5SRk74wp7-RPpDO8','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',0,'2026-08-14 07:43:36','2026-08-14 15:43:36'),(167,1,'zwNeHEnfdH6gPK6BcKA8','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',0,'2026-08-14 16:08:55','2026-08-15 00:08:55'),(168,1,'ra0RWjnFh3CGDFjAY68k','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',0,'2026-08-17 12:42:30','2026-08-17 20:42:30'),(169,1,'JJp7c8t9HnE5kuUG5Ewk','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',0,'2026-08-17 12:43:15','2026-08-17 20:43:15'),(170,1,'R8PS9HyfPzAjfSMwoQtk','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',0,'2026-08-18 08:20:24','2026-08-18 16:20:24'),(171,1,'6aClwMJIJqUQABpZ9Tt4','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',0,'2026-08-18 15:48:46','2026-08-18 23:48:46'),(172,1,'CVOOv8ZHYF-CUgTK1Z4c','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',0,'2026-08-19 11:39:54','2026-08-19 19:39:54'),(173,1,'iM3cfNCbJB-XciEEJ19c','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',0,'2026-08-19 12:22:27','2026-08-19 20:22:27'),(174,1,'I5CI3wz3Fx21dbw--5XU','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',0,'2026-08-20 07:30:11','2026-08-20 15:30:11'),(175,1,'eQe54NARqGUbCL7SWQI8','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',0,'2026-08-21 09:37:29','2026-08-21 17:37:29'),(176,1,'v-iX8l0bb6oltEsg2INo','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',0,'2026-08-27 13:19:59','2026-08-27 21:19:59'),(177,1,'KwDPkIuKI4N_JvT9Ce1k','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36',0,'2026-08-28 08:58:08','2026-08-28 16:58:08'),(178,1,'-zYTsbQtoGO1_gOZHu04','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36',0,'2026-09-03 15:14:58','2026-09-03 23:14:58'),(179,1,'Ya9azWyPwhfFgCHXKiwo','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36',0,'2026-09-04 13:33:05','2026-09-04 21:33:05'),(180,1,'ZEPqqy2SsL7ZzVxNRgY4','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36',0,'2026-09-11 08:24:49','2026-09-11 16:24:49'),(181,1,'WcmgUKoLJTbkBpjLao2U','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',0,'2026-09-14 12:02:58','2026-09-14 20:02:58'),(182,1,'a-YIsi3h1ufZ64lqzDj4','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',0,'2026-09-15 09:04:33','2026-09-15 17:04:33'),(183,1,'5W51LOlpnfnQeZelUohA','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',0,'2026-09-15 11:27:21','2026-09-15 19:27:21'),(184,1,'zqarhkMEi-0YBK89OLAM','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',0,'2026-09-17 09:21:45','2026-09-17 17:21:45'),(185,1,'i7oy8Un0NeEc5wq1Jr4E','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',0,'2026-09-18 09:03:38','2026-09-18 17:03:38'),(186,1,'7PhBcA4n8sVS6oV88qWg','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',0,'2026-09-21 14:09:56','2026-09-21 22:09:56'),(187,1,'NtH1mJDsjJsH9yC8tiUc','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',0,'2026-09-22 10:41:04','2026-09-22 18:41:04'),(188,1,'Usu0eXXlO819cpaNetQQ','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',0,'2026-09-22 12:55:23','2026-09-22 20:55:23'),(189,1,'8j0M7LkHjHZTXL7f_mP4','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',0,'2026-09-25 07:54:59','2026-09-25 15:54:59'),(190,1,'h7LnK7e8aggfkN_rioM0','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',0,'2026-09-25 13:31:24','2026-09-25 21:31:24'),(191,1,'bxt7Xldw5MKC-FOrnOvs','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',0,'2026-09-28 10:02:19','2026-09-28 18:02:19'),(192,1,'Lh1gv7qOWFyoQmg55CtQ','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',0,'2026-09-28 17:51:41','2026-09-29 01:51:41'),(193,1,'qSAZsi8GilunyB5g7Wa8','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36',0,'2026-09-28 20:32:02','2026-09-29 04:32:02'),(194,1,'6fzRW6v67vO4Kodu0SdM','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',0,'2026-09-29 09:22:24','2026-09-29 17:22:24'),(195,1,'bL2lZDlMQ4AF5H2PwM2Y','::1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36',0,'2026-09-29 16:36:38','2026-09-30 00:36:38'),(196,1,'vo3VXQ_0BNc4C6Z7YgkU','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',0,'2026-09-30 08:09:47','2026-09-30 16:09:47'),(197,1,'Mengmtk_bSQ_ZMt4aEeY','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',0,'2026-10-01 16:06:56','2026-10-02 00:06:56'),(198,1,'GNHtlZM4tfLCMWwxemtE','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',0,'2026-10-01 17:28:20','2026-10-02 01:28:20'),(199,1,'m9s0KSWwhqVLiLBZCbxw','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',0,'2026-10-02 15:04:23','2026-10-02 23:04:23'),(200,1,'-ryHcaVHIfmpTTwDzLIo','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',0,'2026-10-04 18:56:03','2026-10-05 02:56:03'),(201,1,'gXCJ8l7DwDzb-dfg7cnM','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',0,'2026-10-06 11:47:29','2026-10-06 19:47:29'),(202,1,'yKNIDnefecYQzv50ui_k','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36',0,'2026-10-19 13:26:32','2026-10-19 21:26:32'),(203,1,'_95DfMXy0Thv3evZWmSM','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36',0,'2026-10-19 13:40:57','2026-10-19 21:40:57'),(204,1,'Vj2jV24QmUKk8UI35djw','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36',0,'2026-10-19 13:50:53','2026-10-19 21:50:53'),(205,1,'5uSUn9THVXV6MCsC-Whs','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36',1,'2026-10-19 14:16:06','2026-10-19 22:16:06');
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
INSERT INTO `users` VALUES (1,'USR-0001','Dev','Admin','Male',NULL,'admin@salesmaster.com','/uploads/avatars/user_1_1778159097482.png','dev.admin','$2a$10$FiE8ORNfBCVoPRCJG7aQGO4V2CAVW.wmuHCBlH8SHHqJFhlxQ7vvi','active','2026-10-19 14:16:06','2026-05-06 12:29:31','2026-10-19 14:16:06'),(3,'USR-0002','Sales ','Person','Female',NULL,NULL,'/uploads/avatars/user_3_1778167136984.jpg','sales','$2a$10$ldscHKucbY/Tk7Xon3AIzuy4OZqAeRx9u3vjQ9dpfEAqLi27T.G/a','active','2026-06-02 13:15:51','2026-05-06 15:43:03','2026-06-25 11:17:58'),(6,'USR-0005','System','Admin','Male',NULL,NULL,'/uploads/avatars/user_6_1779347612177.jpg','sys.admin','$2a$10$8n7T8Mg1KPkVhc4flMPEdujTZRfnljp/86fNCbzVtjvhEjH4N3YHu','active','2026-05-25 12:45:29','2026-05-14 14:24:04','2026-06-25 11:18:09');
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workflow_history`
--

LOCK TABLES `workflow_history` WRITE;
/*!40000 ALTER TABLE `workflow_history` DISABLE KEYS */;
INSERT INTO `workflow_history` VALUES (1,4,'campaign',8,NULL,NULL,NULL,1,'Campaign created via MIS','2026-10-04 19:12:45',NULL,109,13),(2,4,'campaign',8,NULL,'Draft','Reviewing',1,NULL,'2026-10-04 19:13:07',109,110,13),(3,4,'campaign',8,'CMP-2026-10-0007','Reviewing','Approved',1,NULL,'2026-10-04 19:13:32',110,111,13),(4,4,'campaign',8,'CMP-2026-10-0007','Approved','Pending Payment',1,NULL,'2026-10-04 20:17:11',111,116,13),(5,4,'campaign',8,'CMP-2026-10-0007','Pending Payment','Payment Done',1,NULL,'2026-10-04 20:33:28',116,117,13),(6,4,'campaign',8,'CMP-2026-10-0007','Payment Done','Active',1,NULL,'2026-10-04 20:36:02',117,112,13);
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
  `advertiser_can_edit` tinyint(1) DEFAULT '1',
  `send_approval_email` tinyint(1) DEFAULT '0',
  `assign_ref_no` tinyint(1) DEFAULT '0',
  `show_in_grid_default` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `workflow_id` (`workflow_id`),
  CONSTRAINT `workflow_stages_ibfk_1` FOREIGN KEY (`workflow_id`) REFERENCES `workflows` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=118 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workflow_stages`
--

LOCK TABLES `workflow_stages` WRITE;
/*!40000 ALTER TABLE `workflow_stages` DISABLE KEYS */;
INSERT INTO `workflow_stages` VALUES (101,2,'Submitted',NULL,NULL,NULL,1,1,0,'2026-09-14 12:26:47','#1677ff',1,1,0,0,1),(102,2,'Under Review',NULL,NULL,NULL,2,0,0,'2026-09-14 12:26:47','#faad14',1,1,0,0,1),(103,2,'Approved',NULL,NULL,NULL,3,0,1,'2026-09-14 12:26:47','#52c41a',1,1,1,1,1),(104,2,'Rejected',NULL,NULL,NULL,4,0,1,'2026-09-14 12:26:47','#ff4d4f',1,1,1,0,1),(105,3,'Submitted',NULL,NULL,NULL,1,1,0,'2026-09-14 12:26:47','#1677ff',0,0,0,0,1),(106,3,'Under Review',NULL,NULL,NULL,2,0,0,'2026-09-14 12:26:47','#faad14',0,0,0,0,1),(107,3,'Approved',NULL,NULL,NULL,3,0,1,'2026-09-14 12:26:47','#52c41a',0,0,1,1,1),(108,3,'Rejected',NULL,NULL,NULL,4,0,1,'2026-09-14 12:26:47','#ff4d4f',0,0,1,0,1),(109,4,'Draft',NULL,NULL,NULL,0,1,0,'2026-09-14 12:26:47','#8c8c8c',1,1,0,0,1),(110,4,'Reviewing',NULL,NULL,NULL,1,0,0,'2026-09-14 12:26:47','#1677ff',1,1,0,0,1),(111,4,'Approved',NULL,NULL,NULL,2,0,0,'2026-09-14 12:26:47','#13c2c2',0,1,0,1,1),(112,4,'Active',NULL,NULL,NULL,3,0,0,'2026-09-14 12:26:47','#83bf65',1,1,0,0,1),(113,4,'Completed',NULL,NULL,NULL,4,0,1,'2026-09-14 12:26:47','#097134',1,0,0,0,1),(114,4,'Rejected',NULL,NULL,NULL,5,0,1,'2026-09-14 12:26:47','#ff4d4f',0,0,0,0,1),(115,4,'Cancelled',NULL,NULL,NULL,6,0,1,'2026-09-14 12:26:47','#eb0b0b',0,0,0,0,1),(116,4,'Pending Payment',NULL,NULL,NULL,0,0,0,'2026-09-29 17:41:27','#e16464',0,0,0,0,1),(117,4,'Payment Done',NULL,NULL,NULL,0,0,0,'2026-09-29 17:42:20','#79de70',1,1,0,0,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workflow_transitions`
--

LOCK TABLES `workflow_transitions` WRITE;
/*!40000 ALTER TABLE `workflow_transitions` DISABLE KEYS */;
INSERT INTO `workflow_transitions` VALUES (101,2,101,102,'Start Review','2026-09-14 12:26:47'),(102,2,102,103,'Approve','2026-09-14 12:26:47'),(103,2,102,104,'Reject','2026-09-14 12:26:47'),(104,2,101,104,'Reject','2026-09-14 12:26:47'),(105,3,105,106,'Start Review','2026-09-14 12:26:47'),(106,3,106,107,'Approve','2026-09-14 12:26:47'),(107,3,106,108,'Reject','2026-09-14 12:26:47'),(108,3,105,108,'Reject','2026-09-14 12:26:47'),(109,4,109,110,'Submit for Review','2026-09-14 12:26:47'),(110,4,110,111,'Approve','2026-09-14 12:26:47'),(111,4,110,114,'Reject','2026-09-14 12:26:47'),(112,4,111,112,'Activate','2026-09-14 12:26:47'),(113,4,112,113,'Complete','2026-09-14 12:26:47'),(114,4,109,115,'Cancel','2026-09-14 12:26:47'),(115,4,110,115,'Cancel','2026-09-14 12:26:47'),(116,4,111,115,'Cancel','2026-09-14 12:26:47'),(117,4,112,115,'Cancel','2026-09-14 12:26:47'),(118,4,113,112,'Re-Activate','2026-09-22 13:08:44'),(119,4,111,116,'Request Payment','2026-09-29 17:42:51'),(120,4,116,117,'Paid','2026-09-29 17:43:27'),(121,4,117,112,'Activate ','2026-09-29 17:43:59'),(122,4,116,115,'Cancel ','2026-09-29 17:45:15'),(123,3,107,106,'Re-Review','2026-10-01 16:47:24'),(124,4,111,110,'Re-Review','2026-10-01 17:08:28');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workflows`
--

LOCK TABLES `workflows` WRITE;
/*!40000 ALTER TABLE `workflows` DISABLE KEYS */;
INSERT INTO `workflows` VALUES (2,'Advertiser Registration Approval','Approval flow for new business/client registrations',2,1,'2026-09-14 12:26:47','2026-10-01 11:06:52'),(3,'Brand Ambassador Registration Approval','Approval flow for new WhatsApp status advertiser registrations',12,1,'2026-09-14 12:26:47','2026-10-01 10:32:40'),(4,'Campaign Approval Workflow','Lifecycle for advertising campaigns from draft to completion',13,1,'2026-09-14 12:26:47','2026-09-14 12:26:47');
/*!40000 ALTER TABLE `workflows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'accountsmaster'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-19 17:53:08
