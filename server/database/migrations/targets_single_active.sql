-- ============================================================
-- Targets: enforce "only one active target" in the database.
-- active_flag is 1 for the active row and NULL otherwise; a UNIQUE
-- index allows any number of NULLs but only one 1.
-- Not idempotent — run once.
-- ============================================================

-- if several are active already, keep only the most recently created one
UPDATE `targets` t
JOIN (SELECT MAX(id) AS keep_id FROM `targets` WHERE is_active = 1) k
SET t.is_active = 0
WHERE t.is_active = 1 AND t.id <> k.keep_id;

ALTER TABLE `targets`
  ADD COLUMN `active_flag` TINYINT GENERATED ALWAYS AS (IF(`is_active` = 1, 1, NULL)) STORED AFTER `is_active`,
  ADD UNIQUE KEY `uq_targets_single_active` (`active_flag`);
