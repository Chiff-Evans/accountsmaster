-- ============================================================
-- Members: is_human. 1 (default) = a real member; 0 = an internal
-- account used to track things like interest or taxes/deductions.
-- Internal accounts keep their deposits/withdrawals but don't owe the
-- target, so Statistics and the Dashboard's target progress leave them
-- out of balance / overpayment.
-- Not idempotent — run once.
-- ============================================================

ALTER TABLE `members`
  ADD COLUMN `is_human` TINYINT(1) NOT NULL DEFAULT 1 AFTER `other_details`;
