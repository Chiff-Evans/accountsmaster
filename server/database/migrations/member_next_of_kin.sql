-- ============================================================
-- Members: next of kin (many per member). Relationship is a value of
-- the "Relationships" parameter (text_id 'relationships').
-- Not idempotent — run once.
-- ============================================================

CREATE TABLE `member_next_of_kin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `member_id` int NOT NULL,
  `kin_name` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
  `relationship_id` int DEFAULT NULL,
  `id_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_next_of_kin_member` (`member_id`),
  KEY `FK_next_of_kin_relationship` (`relationship_id`),
  CONSTRAINT `FK_next_of_kin_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_next_of_kin_relationship` FOREIGN KEY (`relationship_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Next of kin per member';
