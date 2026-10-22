-- ============================================================
-- Transactions: is_migrated flag for records carried over from a previous
-- system. A migrated transaction keeps exactly the dates entered — no
-- automatic From/To, no rate snapshot, and it sits outside the
-- contribution credit ledger (no credit brought/carried forward).
-- Its To Date still sets where a member's next cover starts.
-- Not idempotent — run once.
-- ============================================================

ALTER TABLE `transactions`
  ADD COLUMN `is_migrated` TINYINT(1) NOT NULL DEFAULT 0 AFTER `other_details`;
