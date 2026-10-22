-- ============================================================
-- Contribution Rates: end date becomes optional (an open-ended rate).
-- The date check now only applies when an end date is set.
-- Not idempotent — run once, after contribution_rates.sql.
-- ============================================================

ALTER TABLE `contribution_rates` DROP CHECK `chk_contribution_rates_dates`;
ALTER TABLE `contribution_rates` MODIFY COLUMN `end_date` DATE DEFAULT NULL;
ALTER TABLE `contribution_rates`
  ADD CONSTRAINT `chk_contribution_rates_dates` CHECK (`end_date` IS NULL OR `end_date` >= `start_date`);
