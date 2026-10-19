-- ============================================================
-- Campaign Advertisers — many-to-many assignment of WhatsApp-status
-- Advertisers to a Campaign, surfaced as an "Advertisers" tab in the
-- Campaign Activity modal. Idempotent — safe to re-run.
-- ============================================================
CREATE TABLE IF NOT EXISTS `campaign_advertisers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `campaign_id` INT NOT NULL,
  `advertiser_id` INT NOT NULL,
  `assigned_on` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `assigned_by` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_campaign_advertiser` (`campaign_id`, `advertiser_id`),
  INDEX `FK_campaign_advertisers_campaigns` (`campaign_id`) USING BTREE,
  INDEX `FK_campaign_advertisers_advertisers` (`advertiser_id`) USING BTREE,
  CONSTRAINT `FK_campaign_advertisers_campaigns` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT `FK_campaign_advertisers_advertisers` FOREIGN KEY (`advertiser_id`) REFERENCES `advertisers` (`id`) ON UPDATE NO ACTION ON DELETE CASCADE
) COMMENT='Advertisers assigned to run a Campaign'
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
