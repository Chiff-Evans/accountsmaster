-- ============================================================
-- In-app notifications (bell) for all three audiences — advertisers,
-- business clients, and MIS staff — plus per-recipient, per-type
-- preferences (opt-out model: absent row = enabled).
-- Idempotent — safe to re-run.
-- ============================================================
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `audience` ENUM('advertiser','client','mis') NOT NULL,
  `recipient_id` INT NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `body` TEXT NULL DEFAULT NULL,
  `url` VARCHAR(255) NULL DEFAULT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_on` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_notifications_recipient` (`audience`, `recipient_id`, `is_read`) USING BTREE,
  INDEX `idx_notifications_created` (`created_on`) USING BTREE
) COMMENT='In-app notification bell entries for advertisers, clients and MIS staff'
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notification_preferences` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `audience` ENUM('advertiser','client','mis') NOT NULL,
  `recipient_id` INT NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `enabled` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_notification_pref` (`audience`, `recipient_id`, `type`)
) COMMENT='Per-recipient opt-out of individual notification types'
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
