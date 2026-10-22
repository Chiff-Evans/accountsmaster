-- ============================================================
-- Contribution credit ledger on transactions.
-- A deposit rarely buys an exact number of days, so each one now records
-- its own accounting:
--   credit_brought_forward  previous deposit's credit_carried_forward
--   cover_value             value of the days actually covered (from..to),
--                           priced at the rate snapshot below
--   credit_carried_forward  amount + brought_forward - cover_value
--                           (> 0 credit for the next deposit, < 0 arrears)
-- rate_id / rate_amount / rate_unit snapshot the contribution rate used
-- when the deposit was recorded, so later rate changes never rewrite it.
-- Values are maintained by the API (helpers/contributionLedger.js), which
-- recalculates a member's whole chain after any create / edit / delete.
-- Existing rows have no rate snapshot and stay outside the chain.
-- Not idempotent — run once.
-- ============================================================

ALTER TABLE `transactions`
  ADD COLUMN `rate_id`                INT           DEFAULT NULL AFTER `to_date`,
  ADD COLUMN `rate_amount`            DECIMAL(14,2) DEFAULT NULL AFTER `rate_id`,
  ADD COLUMN `rate_unit`              ENUM('year','month','week','day') DEFAULT NULL AFTER `rate_amount`,
  ADD COLUMN `credit_brought_forward` DECIMAL(14,2) DEFAULT NULL AFTER `rate_unit`,
  ADD COLUMN `cover_value`            DECIMAL(14,2) DEFAULT NULL AFTER `credit_brought_forward`,
  ADD COLUMN `credit_carried_forward` DECIMAL(14,2) DEFAULT NULL AFTER `cover_value`,
  ADD KEY `FK_transactions_rate` (`rate_id`),
  ADD KEY `idx_transactions_member_chain` (`member_id`, `from_date`, `id`),
  ADD CONSTRAINT `FK_transactions_rate` FOREIGN KEY (`rate_id`) REFERENCES `contribution_rates` (`id`) ON DELETE SET NULL;
