-- ============================================================
-- Campaign Start/End Date + Daily Posting Proofs
-- Idempotent — safe to re-run.
-- ============================================================

-- 1. campaigns.start_date / end_date (end_date is computed server-side from
--    start_date + duration_value/duration_unit_id whenever a campaign is saved)
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'campaigns' AND COLUMN_NAME = 'start_date');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `campaigns` ADD COLUMN `start_date` DATE NULL AFTER `duration_unit_id`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists2 := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'campaigns' AND COLUMN_NAME = 'end_date');
SET @sql2 := IF(@col_exists2 = 0,
  'ALTER TABLE `campaigns` ADD COLUMN `end_date` DATE NULL AFTER `start_date`',
  'SELECT 1');
PREPARE stmt2 FROM @sql2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

-- 2. campaign_proofs — one daily posting-proof screenshot per advertiser per
--    campaign per day, reviewed (accept/reject) by MIS staff.
CREATE TABLE IF NOT EXISTS `campaign_proofs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `campaign_id` INT NOT NULL,
  `advertiser_id` INT NOT NULL,
  `proof_date` DATE NOT NULL,
  `image_path` VARCHAR(500) NOT NULL,
  `status` ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `review_notes` TEXT NULL DEFAULT NULL,
  `reviewed_by` INT NULL DEFAULT NULL,
  `reviewed_on` TIMESTAMP NULL DEFAULT NULL,
  `submitted_on` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_campaign_advertiser_date` (`campaign_id`, `advertiser_id`, `proof_date`),
  INDEX `FK_campaign_proofs_campaigns` (`campaign_id`) USING BTREE,
  INDEX `FK_campaign_proofs_advertisers` (`advertiser_id`) USING BTREE,
  CONSTRAINT `FK_campaign_proofs_campaigns` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT `FK_campaign_proofs_advertisers` FOREIGN KEY (`advertiser_id`) REFERENCES `advertisers` (`id`) ON UPDATE NO ACTION ON DELETE CASCADE
) COMMENT='Daily WhatsApp-status posting proof screenshots, per advertiser per campaign'
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. "Proof Review" menu under the Campaigns parent, Super Admin + Admin only
--    (matches the existing Campaigns menu's role grants).
INSERT INTO menus (menu_name, parent_menu_id, level, view_path, menu_order, icon, description, is_visible)
SELECT 'Proof Review', m.id, 1, '/campaigns/proof-review', 10, 'FileSearchOutlined',
       'Review advertiser daily posting-proof submissions', 1
FROM   menus m
WHERE  m.id = 26
  AND  NOT EXISTS (SELECT 1 FROM menus WHERE view_path = '/campaigns/proof-review')
LIMIT 1;

INSERT INTO role_menu_access (role_id, menu_id, can_view, can_create, can_edit, can_delete)
SELECT r.id, m.id, 1, 0, 1, 0
FROM   roles r
JOIN   menus m ON m.view_path = '/campaigns/proof-review'
WHERE  r.id IN (1, 2)
  AND  NOT EXISTS (
         SELECT 1 FROM role_menu_access rma WHERE rma.role_id = r.id AND rma.menu_id = m.id
       );
