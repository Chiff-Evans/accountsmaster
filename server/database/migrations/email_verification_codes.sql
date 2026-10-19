-- ============================================================
-- Email verification codes — used by the advertiser and business
-- portal registration forms to confirm the registrant actually
-- controls the email address they entered before they can submit.
-- Idempotent — safe to re-run.
-- ============================================================

CREATE TABLE IF NOT EXISTS `email_verification_codes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `audience` ENUM('advertiser','client') NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `code` VARCHAR(10) NOT NULL,
  `attempts` INT NOT NULL DEFAULT 0,
  `verified` TINYINT(1) NOT NULL DEFAULT 0,
  `expires_at` TIMESTAMP NOT NULL,
  `created_on` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_email_verification_lookup` (`audience`, `email`, `created_on`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
