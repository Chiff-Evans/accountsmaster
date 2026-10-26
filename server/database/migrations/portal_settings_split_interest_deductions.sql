-- ============================================================
-- Portal Settings: interest and deductions/taxes become separate switches.
-- show_interest_deductions is split into show_interest + show_deductions;
-- both inherit its current value, so nothing members see changes until
-- staff flip one of them.
-- Not idempotent — run once, after portal_settings.sql.
-- ============================================================

ALTER TABLE `portal_settings`
  ADD COLUMN `show_interest`   TINYINT(1) NOT NULL DEFAULT 0 AFTER `show_total_balance`,
  ADD COLUMN `show_deductions` TINYINT(1) NOT NULL DEFAULT 0 AFTER `show_interest`;

UPDATE `portal_settings`
SET show_interest = show_interest_deductions,
    show_deductions = show_interest_deductions;

ALTER TABLE `portal_settings` DROP COLUMN `show_interest_deductions`;
