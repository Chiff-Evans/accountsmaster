-- MySQL dump 10.13  Distrib 8.0.26, for Win64 (x86_64)
--
-- Host: localhost    Database: accountsmaster
-- ------------------------------------------------------
-- Server version	8.0.26

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `notifications`
--
-- WHERE:  type IN ('campaign_assigned','campaign_stage_changed','campaign_submitted','proof_submitted','proof_reviewed','salary_paid')

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (11,'brand_ambassador',6,'campaign_assigned','Assigned to a campaign','You\'ve been assigned to run \"Jonathan David\'s Youtube Channel\".','/advertiser/campaigns',1,'2026-09-25 15:24:58'),(12,'brand_ambassador',5,'campaign_assigned','Assigned to a campaign','You\'ve been assigned to run \"Jonathan David\'s Youtube Channel\".','/advertiser/campaigns',1,'2026-09-25 15:26:30'),(13,'mis',6,'proof_submitted','New posting proof submitted','Anna Pamela submitted a proof for \"Jonathan David\'s Youtube Channel\" (2026-09-25).','/campaigns/proof-review',0,'2026-09-25 15:28:17'),(14,'mis',1,'proof_submitted','New posting proof submitted','Anna Pamela submitted a proof for \"Jonathan David\'s Youtube Channel\" (2026-09-25).','/campaigns/proof-review',1,'2026-09-25 15:28:17'),(15,'brand_ambassador',6,'proof_reviewed','Posting proof Accepted','Your proof for \"Jonathan David\'s Youtube Channel\" (2026-09-25) was Accepted.','/advertiser/campaigns',1,'2026-09-25 15:28:24'),(16,'brand_ambassador',6,'proof_reviewed','Posting proof reverted to Pending','Your proof for \"Jonathan David\'s Youtube Channel\" (2026-09-25) was reverted to Pending.','/advertiser/campaigns',1,'2026-09-25 15:37:19'),(17,'brand_ambassador',6,'proof_reviewed','Posting proof Rejected','Your proof for \"Jonathan David\'s Youtube Channel\" (2026-09-25) was rejected: Rejected','/advertiser/campaigns',1,'2026-09-25 15:37:44'),(18,'mis',6,'proof_submitted','New posting proof submitted','Anna Pamela submitted a proof for \"Jonathan David\'s Youtube Channel\" (2026-09-25).','/campaigns/proof-review',0,'2026-09-25 15:39:01'),(19,'mis',1,'proof_submitted','New posting proof submitted','Anna Pamela submitted a proof for \"Jonathan David\'s Youtube Channel\" (2026-09-25).','/campaigns/proof-review',1,'2026-09-25 15:39:01'),(20,'brand_ambassador',6,'proof_reviewed','Posting proof Accepted','Your proof for \"Jonathan David\'s Youtube Channel\" (2026-09-25) was Accepted.','/advertiser/campaigns',1,'2026-09-25 15:39:24'),(23,'mis',6,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"New System Awareness\" (2026-09-23).','/campaigns/proof-review',0,'2026-09-28 12:19:41'),(24,'mis',1,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"New System Awareness\" (2026-09-23).','/campaigns/proof-review',1,'2026-09-28 12:19:41'),(25,'mis',6,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"New System Awareness\" (2026-09-22).','/campaigns/proof-review',0,'2026-09-28 14:24:08'),(26,'mis',1,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"New System Awareness\" (2026-09-22).','/campaigns/proof-review',1,'2026-09-28 14:24:08'),(27,'mis',1,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"New System Awareness\" (2026-09-24).','/campaigns/proof-review',1,'2026-09-28 14:24:25'),(28,'mis',6,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"New System Awareness\" (2026-09-24).','/campaigns/proof-review',0,'2026-09-28 14:24:25'),(29,'mis',1,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"New System Awareness\" (2026-09-25).','/campaigns/proof-review',1,'2026-09-28 14:24:44'),(30,'mis',6,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"New System Awareness\" (2026-09-25).','/campaigns/proof-review',0,'2026-09-28 14:24:44'),(31,'mis',1,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"Sample Campaign\" (2026-09-25).','/campaigns/proof-review',1,'2026-09-28 14:25:11'),(32,'mis',6,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"Sample Campaign\" (2026-09-25).','/campaigns/proof-review',0,'2026-09-28 14:25:11'),(33,'brand_ambassador',3,'proof_reviewed','Posting proof Accepted','Your proof for \"Sample Campaign\" (2026-09-25) was Accepted.','/advertiser/campaigns',1,'2026-09-28 14:25:34'),(34,'brand_ambassador',3,'proof_reviewed','Posting proof Accepted','Your proof for \"New System Awareness\" (2026-09-25) was Accepted.','/advertiser/campaigns',1,'2026-09-28 14:25:35'),(35,'brand_ambassador',3,'proof_reviewed','Posting proof Rejected','Your proof for \"New System Awareness\" (2026-09-24) was rejected: Rejected','/advertiser/campaigns',1,'2026-09-28 14:25:59'),(36,'brand_ambassador',3,'proof_reviewed','Posting proof Accepted','Your proof for \"New System Awareness\" (2026-09-22) was Accepted.','/advertiser/campaigns',1,'2026-09-28 14:26:14'),(37,'brand_ambassador',3,'proof_reviewed','Posting proof Accepted','Your proof for \"New System Awareness\" (2026-09-23) was Accepted.','/advertiser/campaigns',1,'2026-09-28 14:26:28'),(38,'mis',1,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"New System Awareness\" (2026-09-24).','/campaigns/proof-review',1,'2026-09-28 14:28:38'),(39,'mis',6,'proof_submitted','New posting proof submitted','Splane Muchai submitted a proof for \"New System Awareness\" (2026-09-24).','/campaigns/proof-review',0,'2026-09-28 14:28:38'),(40,'brand_ambassador',3,'proof_reviewed','Posting proof Accepted','Your proof for \"New System Awareness\" (2026-09-24) was Accepted.','/advertiser/campaigns',1,'2026-09-28 14:28:49'),(41,'brand_ambassador',5,'salary_paid','Salary payment recorded','A payment of 240.54 was recorded for \"Pevans Cereals Shop Awareness\".','/advertiser/campaigns',1,'2026-09-28 14:44:51'),(42,'brand_ambassador',1,'salary_paid','Salary payment recorded','A payment of 546.74 was recorded for \"Pevans Cereals Shop Awareness\".','/advertiser/campaigns',0,'2026-09-28 14:44:54'),(43,'brand_ambassador',3,'salary_paid','Salary payment recorded','A payment of 712.72 was recorded for \"Pevans Cereals Shop Awareness\".','/advertiser/campaigns',0,'2026-09-28 14:44:58'),(46,'mis',6,'proof_submitted','New posting proof submitted','Anna Pamela submitted a proof for \"Jonathan David\'s Youtube Channel\" (2026-09-26).','/campaigns/proof-review',0,'2026-09-29 15:24:23'),(47,'mis',1,'proof_submitted','New posting proof submitted','Anna Pamela submitted a proof for \"Jonathan David\'s Youtube Channel\" (2026-09-26).','/campaigns/proof-review',1,'2026-09-29 15:24:23'),(48,'brand_ambassador',6,'proof_reviewed','Posting proof Accepted','Your proof for \"Jonathan David\'s Youtube Channel\" (2026-09-26) was Accepted.','/advertiser/campaigns',1,'2026-09-29 15:25:01'),(49,'member',2,'campaign_stage_changed','Campaign Completed','\"CMP-2026-09-0004\" is now \"Completed\".','/campaigns',1,'2026-09-29 15:25:41'),(50,'brand_ambassador',6,'campaign_assigned','Assigned to a campaign','You\'ve been assigned to run \"Sample Campaign\".','/advertiser/campaigns',1,'2026-09-30 08:11:14'),(51,'member',1,'campaign_stage_changed','Campaign Reviewing','\"CMP-2026-09-0005\" is now \"Reviewing\".','/campaigns',1,'2026-09-30 09:36:51'),(52,'member',1,'campaign_stage_changed','Campaign Approved','\"CMP-2026-09-0005\" is now \"Approved\".','/campaigns',1,'2026-09-30 09:36:58'),(53,'member',1,'campaign_stage_changed','Campaign Payment Requested','\"CMP-2026-09-0005\" is now \"Payment Requested\".','/campaigns',1,'2026-09-30 09:37:25'),(54,'member',1,'campaign_stage_changed','Campaign Payment Done','\"CMP-2026-09-0005\" is now \"Payment Done\".','/campaigns',1,'2026-09-30 09:39:53'),(55,'member',1,'campaign_stage_changed','Campaign Active','\"CMP-2026-09-0005\" is now \"Active\".','/campaigns',1,'2026-09-30 09:40:02'),(56,'brand_ambassador',6,'campaign_assigned','Assigned to a campaign','You\'ve been assigned to run \"Venture Brite Information System Awareness\".','/advertiser/campaigns',1,'2026-09-30 09:40:20'),(60,'mis',1,'campaign_submitted','New campaign submitted','A campaign was submitted for review from the advertiser portal.','/campaigns',1,'2026-10-01 17:05:18'),(61,'mis',6,'campaign_submitted','New campaign submitted','A campaign was submitted for review from the advertiser portal.','/campaigns',0,'2026-10-01 17:05:18'),(62,'member',2,'campaign_stage_changed','Campaign Approved','\"Campaign\" is now \"Approved\".','/campaigns',1,'2026-10-01 17:07:42'),(63,'member',2,'campaign_stage_changed','Campaign Reviewing','\"Campaign\" is now \"Reviewing\".','/campaigns',1,'2026-10-01 17:09:08'),(64,'member',2,'campaign_stage_changed','Campaign Approved','\"CMP-2026-10-0006\" is now \"Approved\".','/campaigns',1,'2026-10-01 17:09:13'),(65,'mis',1,'proof_submitted','New posting proof submitted','Chris Benz submitted a proof for \"New System Awareness\" (2026-09-26).','/campaigns/proof-review',1,'2026-10-01 17:30:41'),(66,'mis',6,'proof_submitted','New posting proof submitted','Chris Benz submitted a proof for \"New System Awareness\" (2026-09-26).','/campaigns/proof-review',0,'2026-10-01 17:30:41'),(67,'brand_ambassador',5,'campaign_assigned','Assigned to a campaign','You\'ve been assigned to run \"New Video Release\".','/brand-ambassador/campaigns',1,'2026-10-01 17:34:09'),(68,'member',1,'campaign_stage_changed','Campaign Reviewing','\"Campaign\" is now \"Reviewing\".','/campaigns',1,'2026-10-04 19:13:07'),(69,'member',1,'campaign_stage_changed','Campaign Approved','\"CMP-2026-10-0007\" is now \"Approved\".','/campaigns',1,'2026-10-04 19:13:32'),(70,'member',1,'campaign_stage_changed','Campaign Pending Payment','\"CMP-2026-10-0007\" is now \"Pending Payment\".','/campaigns',1,'2026-10-04 20:17:11'),(71,'member',1,'campaign_stage_changed','Campaign Payment Done','\"CMP-2026-10-0007\" is now \"Payment Done\".','/campaigns',1,'2026-10-04 20:33:28'),(72,'brand_ambassador',5,'proof_reviewed','Posting proof Rejected','Your proof for \"New System Awareness\" (2026-09-26) was rejected: Reject','/brand-ambassador/campaigns',1,'2026-10-04 20:34:04'),(73,'member',1,'campaign_stage_changed','Campaign Active','\"CMP-2026-10-0007\" is now \"Active\".','/campaigns',1,'2026-10-04 20:36:02'),(74,'brand_ambassador',5,'campaign_assigned','Assigned to a campaign','You\'ve been assigned to run \"New Products Arrival\".','/brand-ambassador/campaigns/p2VnsR',1,'2026-10-04 21:19:35'),(75,'brand_ambassador',6,'campaign_assigned','Assigned to a campaign','You\'ve been assigned to run \"New Products Arrival\".','/brand-ambassador/campaigns/p2VnsR',1,'2026-10-04 21:53:40');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `notification_preferences`
--
-- WHERE:  type IN ('campaign_assigned','campaign_stage_changed','campaign_submitted','proof_submitted','proof_reviewed','salary_paid')

LOCK TABLES `notification_preferences` WRITE;
/*!40000 ALTER TABLE `notification_preferences` DISABLE KEYS */;
INSERT INTO `notification_preferences` VALUES (1,'brand_ambassador',5,'proof_reviewed',1,1);
/*!40000 ALTER TABLE `notification_preferences` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-22 20:54:17
-- MySQL dump 10.13  Distrib 8.0.26, for Win64 (x86_64)
--
-- Host: localhost    Database: accountsmaster
-- ------------------------------------------------------
-- Server version	8.0.26

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `notifications`
--
-- WHERE:  audience='brand_ambassador' OR (type='member_registered' AND (title LIKE '%advertiser%' OR url LIKE '/advertiser%'))

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (8,'mis',1,'member_registered','New advertiser registration','Anna Pamela (ADV-0004) registered and is awaiting review.','/advertisers',1,'2026-09-25 15:23:08'),(9,'mis',6,'member_registered','New advertiser registration','Anna Pamela (ADV-0004) registered and is awaiting review.','/advertisers',0,'2026-09-25 15:23:08'),(10,'brand_ambassador',6,'registration_reviewed','Registration Approved','Your advertiser registration has been approved ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â you can now log in to the portal.','/advertiser/profile',1,'2026-09-25 15:24:05'),(21,'mis',6,'member_registered','New advertiser registration','Test User (ADV-0005) registered and is awaiting review.','/advertisers',0,'2026-09-25 15:55:19'),(22,'mis',1,'member_registered','New advertiser registration','Test User (ADV-0005) registered and is awaiting review.','/advertisers',1,'2026-09-25 15:55:19'),(44,'mis',1,'member_registered','New advertiser registration','Joshua (ADV-0005) registered and is awaiting review.','/advertisers',1,'2026-09-29 12:11:45'),(45,'mis',6,'member_registered','New advertiser registration','Joshua (ADV-0005) registered and is awaiting review.','/advertisers',0,'2026-09-29 12:11:45'),(57,'brand_ambassador',8,'registration_reviewed','Registration Approved','Your brand ambassador registration has been approved â€” you can now log in to the portal.','/brand-ambassador/profile',1,'2026-10-01 16:21:31'),(58,'brand_ambassador',8,'registration_reviewed','Registration Approved','Your brand ambassador registration has been approved â€” you can now log in to the portal.','/brand-ambassador/profile',0,'2026-10-01 16:48:04'),(59,'brand_ambassador',8,'registration_reviewed','Registration Approved','Your brand ambassador registration has been approved â€” you can now log in to the portal.','/brand-ambassador/profile',0,'2026-10-01 16:49:11');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-22 20:55:07
