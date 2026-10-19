-- ============================================================
-- Next of kin becomes a process type with its own ref numbering
-- (NOK-0001, ...). Existing records are backfilled in id order.
-- Not idempotent — run once.
-- ============================================================

INSERT INTO `process_types` (`process_type_name`, `description`, `data_table`)
VALUES ('next_of_kin_registration', 'Member Next of Kin', 'member_next_of_kin');
SET @pt := LAST_INSERT_ID();

ALTER TABLE `member_next_of_kin`
  ADD COLUMN `kin_ref_no` VARCHAR(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `member_id`,
  ADD UNIQUE KEY `kin_ref_no` (`kin_ref_no`);

SET @n := 0;
UPDATE `member_next_of_kin`
SET `kin_ref_no` = CONCAT('NOK-', LPAD(@n := @n + 1, 4, '0'))
ORDER BY `id`;

INSERT INTO `ref_numbering` (`process_type_id`, `prefix`, `initial_serial`, `next_serial`, `use_year`, `use_month`, `padding`)
VALUES (@pt, 'NOK', 1, @n + 1, 0, 0, 4);
