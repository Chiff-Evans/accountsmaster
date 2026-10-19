-- ============================================================
-- Targets: is_active flag — only one target is active at a time
-- (enforced by the API, same pattern as parameter_values.is_default).
-- Not idempotent — run once.
-- ============================================================

ALTER TABLE `targets`
  ADD COLUMN `is_active` TINYINT(1) NOT NULL DEFAULT 0 AFTER `target_date`;
