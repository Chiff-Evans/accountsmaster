-- ============================================================
-- Members: which internal account(s) the portal's Group Fund figures come
-- from.
--   is_interest_account    its deposits are the "Interest earned" figure
--   is_deductions_account  its withdrawals are the "Deductions / taxes" figure
-- Only internal accounts (is_human = 0) can carry these — the API clears
-- them for real members. Several accounts may share a flag; they're summed.
-- Not idempotent — run once.
-- ============================================================

ALTER TABLE `members`
  ADD COLUMN `is_interest_account`   TINYINT(1) NOT NULL DEFAULT 0 AFTER `is_human`,
  ADD COLUMN `is_deductions_account` TINYINT(1) NOT NULL DEFAULT 0 AFTER `is_interest_account`;
