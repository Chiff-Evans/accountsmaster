-- ------------------------------------------------------------
-- Parameter Values — configurable default per parameter
--
-- Several forms (Trip Status, Participant Status, …) auto-select "the
-- first value" as a default, which is really just whatever sorts first
-- alphabetically — arbitrary. This lets staff explicitly mark which value
-- is the real default for each parameter.
-- ------------------------------------------------------------

ALTER TABLE `parameter_values`
  ADD COLUMN `is_default` TINYINT(1) NOT NULL DEFAULT 0 AFTER `is_active`;
