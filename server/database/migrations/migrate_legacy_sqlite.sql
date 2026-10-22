-- ============================================================
-- Legacy (SQLite, giachuki_2016_db) -> Accounts Master: members and their
-- contributions.
--
-- Source: server/database/2026-10-22-database_sqlite.sql (HeidiSQL dump;
-- 10 members, 82 contributions). MySQL can't read SQLite directly, so the
-- dump's rows are loaded into two staging tables first, then mapped:
--
--   legacy members        -> members        (legacy_id = legacy members.id)
--   legacy contributions  -> transactions   (legacy_id = legacy contributions.id,
--                                            is_migrated = 1, file_no MIG-0001..)
--
-- Mapping notes
--   * Members are matched ONLY by legacy_id (never by phone/name), so nothing
--     already in this database is merged or overwritten.
--   * Safe to re-run: rows whose legacy_id is already present are skipped.
--   * Dates are dd-mm-yyyy text in the legacy system -> real DATEs.
--   * position "Chair-Person" -> parameter "Chair Person"; gender by name.
--   * status: Active -> active / stage Approved, Withdrawn -> inactive /
--     stage Withdrawn, Blocked -> locked / stage Approved.
--   * id_number '00000000' and other_details 'N/A' (placeholders) -> NULL;
--     names/references are trimmed, repeated spaces collapsed, and stray
--     standalone dots removed from names ("Peter .  Kanda" -> "Peter Kanda").
--   * Members get the next MEM ref numbers and the serial is advanced.
--   * Contributions are migrated transactions: dates kept exactly as
--     recorded, no rate snapshot, outside the credit ledger, no notifications.
--   * Members have no portal login yet — use Members -> Portal Access.
--
-- To leave out non-person / blocked accounts, see the INCLUDE filter in
-- step 3 (by default everything is migrated).
-- ============================================================

-- ── 1. Traceability columns — added only if missing, so re-runs are safe ──
SET @ddl := IF((SELECT COUNT(*) FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'members' AND COLUMN_NAME = 'legacy_id') = 0,
  'ALTER TABLE `members` ADD COLUMN `legacy_id` INT DEFAULT NULL, ADD UNIQUE KEY `uq_members_legacy_id` (`legacy_id`)',
  'DO 0');
PREPARE ddl FROM @ddl; EXECUTE ddl; DEALLOCATE PREPARE ddl;

SET @ddl := IF((SELECT COUNT(*) FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'transactions' AND COLUMN_NAME = 'legacy_id') = 0,
  'ALTER TABLE `transactions` ADD COLUMN `legacy_id` INT DEFAULT NULL, ADD UNIQUE KEY `uq_transactions_legacy_id` (`legacy_id`)',
  'DO 0');
PREPARE ddl FROM @ddl; EXECUTE ddl; DEALLOCATE PREPARE ddl;

-- ── 2. Staging tables with the legacy rows, as dumped ──
DROP TABLE IF EXISTS `legacy_contributions`;
DROP TABLE IF EXISTS `legacy_members`;

CREATE TABLE `legacy_members` (
  `id` INT PRIMARY KEY, `name` VARCHAR(50), `position` VARCHAR(50), `gender` VARCHAR(50),
  `id_number` VARCHAR(50), `phone` VARCHAR(50), `email` TEXT, `reg_date` VARCHAR(20),
  `reg_fee` VARCHAR(20), `other_details` TEXT, `status` VARCHAR(50), `is_human` VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `legacy_contributions` (
  `id` INT PRIMARY KEY, `transaction_type` VARCHAR(100), `member_id` INT, `name` VARCHAR(50),
  `phone` VARCHAR(50), `amount` INT, `pay_date` VARCHAR(20), `from_date` VARCHAR(20),
  `to_date` VARCHAR(20), `other_details` TEXT, `time_stamp` DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `legacy_members` (`id`, `name`, `position`, `gender`, `id_number`, `phone`, `email`, `reg_date`, `reg_fee`, `other_details`, `status`, `is_human`) VALUES
	(1, 'Evanson Muchai', 'Treasurer', 'Male', '34707519', '0746210500', 'evansonmuchai2016@gmail.com', '01-04-2022', '00', 'N/A', 'Active', 'true'),
	(2, 'Francis Maina', 'Chair-Person', 'Male', '00000000', '0740594602', 'testfm@gmail.com', '01-04-2022', '00', 'Chair Person', 'Active', 'true'),
	(3, 'Peter .  Kanda', 'Secretary', 'Male', '00000000', '0795428950', 'testpk@gmail.com', '01-04-2022', '00', 'Secretary', 'Active', 'true'),
	(4, 'Kennedy Maina', 'Member', 'Male', '00000000', '0799149536', 'caspertest@gmail.com', '01-04-2022', '00', 'Member', 'Active', 'true'),
	(5, 'Duncan Muchai', 'Member', 'Male', '00000000', '0740384086', 'testdm@gmail.com', '01-04-2022', '00', 'Member', 'Withdrawn', 'true'),
	(6, 'John Kamemia', 'Member', 'Male', '00000000', '0723062192', 'example@gmail.com', '12-12-2022', '00', 'Joined us on 12th December 2022 at
an anual general meeting held at
Green Spot Hotel By Pass Ruiru.', 'Active', 'true'),
	(7, 'Test Person', 'Member', 'Male', '12354334', '0745762200', 'email@gmail.com', '20-02-2024', '500', 'N/A', 'Blocked', 'true'),
	(8, 'John Doe', 'Member', 'Male', '34344334', '0734433434', 'johndoe@gmail.com', '10-06-2022', '500', 'Other Details', 'Blocked', 'true'),
	(9, 'Test Female', 'Member', 'Female', '00000000', '0723765569', 'example@gmail.com', '18-06-2022', '500', 'Others', 'Blocked', 'true'),
	(10, 'Credit Cnterest', 'Member', 'Male', '00000000', '0746210500', 'evansonmuchai2016@gmail.com', '24-05-2024', '00', 'Credit Interest by KCB Bank', 'Active', 'false');

INSERT INTO `legacy_contributions` (`id`, `transaction_type`, `member_id`, `name`, `phone`, `amount`, `pay_date`, `from_date`, `to_date`, `other_details`, `time_stamp`) VALUES
	(1, 'Deposit', 1, 'Evanson Muchai', '0746210500', 500, '13-04-2022', '04-04-2022', '10-04-2022', 'Deposited by Peter Kanda
QDD3BQF7WH', '2023-04-27 20:07:17'),
	(2, 'Deposit', 3, 'Peter Kanda', '0795428950', 500, '13-04-2022', '04-04-2022', '10-04-2022', 'Deposited Ksh 1000.
Peter Kanda -- 500
Evanson Muchai -- 500 ', '2023-04-27 20:07:17'),
	(3, 'Deposit', 4, 'Kennedy Maina', '0799149536', 1000, '14-04-2022', '04-04-2022', '17-04-2022', 'QDE3E72KQ9', '2023-04-27 20:07:17'),
	(4, 'Deposit', 5, 'Duncan Muchai', '0740384086', 2000, '16-04-2022', '04-04-2022', '01-05-2022', 'QDGOH8JSLW', '2023-04-27 20:07:17'),
	(5, 'Deposit', 3, 'Peter Kanda', '0795428950', 500, '18-04-2022', '11-04-2022', '17-04-2022', 'QDI4KQHGSW', '2023-04-27 20:07:17'),
	(6, 'Deposit', 3, 'Peter Kanda', '0795428950', 1500, '24-04-2022', '18-04-2022', '08-05-2022', 'QDO0W9NLX2', '2023-04-27 20:07:17'),
	(7, 'Deposit', 1, 'Evanson Muchai', '0746210500', 3000, '28-04-2022', '11-04-2022', '22-05-2022', 'QDS53OLJ7V', '2023-04-27 20:07:17'),
	(8, 'Deposit', 2, 'Francis Maina', '0740594602', 4000, '09-05-2022', '04-04-2022', '29-05-2022', 'QE98P9MQ9W', '2023-04-27 20:07:17'),
	(9, 'Deposit', 3, 'Peter Kanda', '0795428950', 2000, '09-05-2022', '09-05-2022', '05-06-2022', 'QEA8SAEQHI', '2023-04-27 20:07:17'),
	(10, 'Deposit', 5, 'Duncan Muchai', '0740384086', 2000, '21-05-2022', '02-05-2022', '29-05-2022', 'QEL5CSBJHD', '2023-04-27 20:07:17'),
	(11, 'Deposit', 4, 'Kennedy Maina', '0799149536', 3000, '30-05-2022', '18-04-2022', '29-05-2022', 'QEU8U3DJBW', '2023-04-27 20:07:17'),
	(12, 'Deposit', 3, 'Peter Kanda', '0795428950', 2500, '15-06-2022', '06-06-2022', '10-07-2022', 'QFF7R0AV6T', '2023-04-27 20:07:17'),
	(13, 'Deposit', 2, 'Francis Maina', '0740594602', 2000, '24-06-2022', '30-05-2022', '26-06-2022', 'QFO19N6FT9', '2023-04-27 20:07:17'),
	(14, 'Deposit', 5, 'Duncan Muchai', '0740384086', 4500, '27-06-2022', '30-05-2022', '31-07-2022', 'QFR4FBCGNC', '2023-04-27 20:07:17'),
	(15, 'Deposit', 4, 'Kennedy Maina', '0799149536', 4500, '27-06-2022', '30-05-2022', '31-07-2022', 'QFR6GIP8WW', '2023-04-27 20:07:17'),
	(16, 'Deposit', 1, 'Evanson Muchai', '0746210500', 5000, '28-06-2022', '23-05-2022', '31-07-2022', 'QFS3HSNEUV', '2023-04-27 20:07:17'),
	(17, 'Deposit', 2, 'Francis Maina', '0740594602', 2000, '10-07-2022', '27-06-2022', '24-07-2022', 'QGA18TMVYR', '2023-04-27 20:07:17'),
	(18, 'Deposit', 3, 'Peter Kanda', '0795428950', 2000, '11-07-2022', '11-07-2022', '07-08-2022', 'QGB1B4XQQL', '2023-04-27 20:07:17'),
	(19, 'Deposit', 2, 'Francis Maina', '0740594602', 1000, '16-07-2022', '25-07-2022', '07-08-2022', 'QGG0KZ0SXO', '2023-04-27 20:07:17'),
	(20, 'Deposit', 2, 'Francis Maina', '0740594602', 1000, '25-07-2022', '08-08-2022', '21-08-2022', 'QGP7370KVV', '2023-04-27 20:07:17'),
	(21, 'Deposit', 1, 'Evanson Muchai', '0746210500', 500, '10-08-2022', '01-08-2022', '07-08-2022', 'FT22222X223T', '2023-04-27 20:07:17'),
	(22, 'Deposit', 3, 'Peter Kanda', '0795428950', 2000, '11-08-2022', '08-08-2022', '04-09-2022', 'QHB22J82QU', '2023-04-27 20:07:17'),
	(23, 'Deposit', 5, 'Duncan Muchai', '0740384086', 4000, '21-08-2022', '01-08-2022', '25-09-2022', 'QHL5KTOPSN', '2023-04-27 20:07:17'),
	(24, 'Deposit', 1, 'Evanson Muchai', '0746210500', 1500, '07-09-2022', '08-08-2022', '28-08-2022', 'Q173JRELY3', '2023-04-27 20:07:17'),
	(25, 'Deposit', 2, 'Francis Maina', '0740594602', 3000, '19-09-2022', '22-08-2022', '02-10-2022', 'QIJ494DJIQ', '2023-04-27 20:07:17'),
	(26, 'Deposit', 5, 'Duncan Muchai', '0740384086', 7000, '30-09-2022', '26-09-2022', '01-01-2023', 'QIU4X9UTKI', '2023-04-27 20:07:17'),
	(27, 'Deposit', 3, 'Peter Kanda', '0795428950', 4000, '07-10-2022', '05-09-2022', '30-10-2022', 'QJ77FWXIDB', '2023-04-27 20:07:17'),
	(28, 'Deposit', 1, 'Evanson Muchai', '0746210500', 2000, '08-10-2022', '29-08-2022', '25-09-2022', 'QJ86IRODJU', '2023-04-27 20:07:17'),
	(29, 'Deposit', 2, 'Francis Maina', '0740594602', 2000, '18-10-2022', '03-10-2022', '30-10-2022', 'QJL16FJ8AN', '2023-04-27 20:07:17'),
	(30, 'Deposit', 2, 'Francis Maina', '0740594602', 2000, '24-10-2022', '31-10-2022', '27-11-2022', 'QJO2J5M880', '2023-04-27 20:07:17'),
	(31, 'Deposit', 4, 'Kennedy Maina', '0799149536', 8500, '24-10-2022', '01-08-2022', '27-11-2022', 'QJ09JCXVG3', '2023-04-27 20:07:17'),
	(32, 'Deposit', 1, 'Evanson Muchai', '0746210500', 1500, '25-10-2022', '26-09-2022', '16-10-2022', 'QJP6L9JT7G', '2023-04-27 20:07:17'),
	(33, 'Deposit', 2, 'Francis Maina', '0740594602', 1000, '07-11-2022', '28-11-2022', '11-12-2022', 'QK70GOLB5I', '2023-04-27 20:07:17'),
	(34, 'Deposit', 3, 'Peter Kanda', '0795428950', 2000, '10-11-2022', '31-10-2022', '27-11-2022', 'QKA9MXELIL', '2023-04-27 20:07:17'),
	(35, 'Deposit', 3, 'Peter Kanda', '0795428950', 2000, '01-12-2022', '28-11-2022', '25-12-2022', 'Pesa Link Transfer
Ref no: 006800012022120108490866987372', '2023-04-27 20:07:17'),
	(36, 'Deposit', 5, 'Duncan Muchai', '0740384086', 11000, '08-12-2022', '02-01-2023', '04-06-2023', 'QL85NL4MR3', '2023-04-27 20:07:17'),
	(37, 'Deposit', 6, 'John Kamemia', '0723062192', 10000, '18-12-2022', '04-04-2022', '21-08-2022', 'QLI0H9YIOI', '2023-04-27 20:07:17'),
	(38, 'Deposit', 1, 'Evanson Muchai', '0746210500', 5500, '20-12-2022', '17-10-2022', '01-01-2023', 'QLK4MI97DA', '2023-04-27 20:07:17'),
	(39, 'Deposit', 3, 'Peter Kanda', '0795428950', 500, '22-12-2022', '25-12-2022', '01-01-2023', 'QLM7QQ5ZZ5', '2023-04-27 20:07:17'),
	(40, 'Deposit', 3, 'Peter Kanda', '0795428950', 2000, '07-01-2023', '02-01-2023', '29-01-2023', 'RA78VIV0EO', '2023-04-27 20:07:17'),
	(41, 'Deposit', 2, 'Francis Maina', '0740594602', 1000, '08-01-2023', '12-12-2022', '25-12-2022', 'RA85YANNUP', '2023-04-27 20:07:17'),
	(42, 'Deposit', 2, 'Francis Maina', '0740594602', 1000, '08-01-2023', '26-12-2022', '08-01-2023', 'RA84YGF7HO', '2023-04-27 20:07:17'),
	(43, 'Deposit', 6, 'John Kamemia', '0723062192', 11500, '20-01-2023', '22-08-2022', '29-01-2023', 'RAK7TF7UAB', '2023-04-27 20:07:17'),
	(44, 'Deposit', 2, 'Francis Maina', '0740594602', 2000, '20-01-2023', '09-01-2023', '05-02-2023', 'RAK0TRZZZO', '2023-04-27 20:07:17'),
	(45, 'Deposit', 3, 'Peter Kanda', '0795428950', 2000, '03-02-2023', '30-01-2023', '26-02-2023', 'RB30RZV5HA', '2023-04-27 20:07:17'),
	(46, 'Deposit', 2, 'Francis Maina', '0740594602', 2000, '27-02-2023', '06-02-2023', '05-03-2023', 'RBR9MW9T5H', '2023-04-27 20:07:17'),
	(47, 'Deposit', 3, 'Peter Kanda', '0795428950', 2000, '06-03-2023', '27-02-2023', '26-03-2023', 'RC616X7GIL', '2023-04-27 20:07:17'),
	(48, 'Deposit', 5, 'Duncan Muchai', '0740384086', 15000, '14-03-2023', '05-06-2023', '30-12-2023', 'RCE6RL1JE4', '2023-04-27 20:07:17'),
	(49, 'Deposit', 2, 'Francis Maina', '0740594602', 2000, '29-03-2023', '06-03-2023', '02-04-2023', 'RCS0UK6IMO', '2023-04-27 20:07:17'),
	(50, 'Deposit', 1, 'Evanson Muchai', '0746210500', 6500, '30-03-2023', '02-01-2023', '02-04-2023', 'RCU8XWUQA2', '2023-04-27 20:07:17'),
	(51, 'Deposit', 6, 'John Kamemia', '0723062192', 2000, '01-04-2023', '30-01-2023', '26-02-2023', 'RD164DJN66', '2023-04-27 20:07:17'),
	(52, 'Deposit', 6, 'John Kamemia', '0723062192', 2500, '01-04-2023', '27-02-2023', '02-04-2023', 'RD134DS6R5', '2023-04-27 20:07:17'),
	(53, 'Deposit', 3, 'Peter Kanda', '0795428950', 2000, '05-04-2023', '27-03-2023', '23-04-2023', 'RD50HG2V9K', '2023-04-27 20:07:17'),
	(54, 'Deposit', 2, 'Francis Maina', '0740594602', 2000, '13-04-2023', '03-04-2023', '30-04-2023', 'RDD744QKJJ', '2023-04-27 20:07:17'),
	(55, 'Deposit', 6, 'John Kamemia', '0723062192', 8500, '05-05-2023', '03-04-2023', '30-07-2023', 'RE55TBGGG7', '2023-05-07 19:12:38'),
	(56, 'Deposit', 3, 'Peter Kanda', '0795428950', 2000, '08-05-2023', '24-04-2023', '21-05-2023', 'RE8722J8XN', '2023-05-15 09:53:25'),
	(57, 'Deposit', 2, 'Francis Maina', '0740594602', 2000, '15-05-2023', '01-05-2023', '28-05-2023', 'REF3MVY403', '2023-05-15 17:57:05'),
	(58, 'Deposit', 2, 'Francis Maina', '0740594602', 2000, '24-05-2023', '29-05-2023', '25-06-2023', 'REM66YXR56', '2023-05-29 17:18:35'),
	(59, 'Deposit', 2, 'Francis Maina', '0740594602', 2000, '06-06-2023', '26-06-2023', '23-07-2023', 'RF67EP5PCV', '2023-06-07 08:21:57'),
	(60, 'Deposit', 3, 'Peter Kanda', '0795428950', 2000, '14-06-2023', '22-05-2023', '18-06-2023', 'RFE6ZR53QU', '2023-06-14 17:38:48'),
	(61, 'Deposit', 2, 'Francis Maina', '0740594602', 500, '19-06-2023', '24-07-2023', '30-07-2023', 'RFJ9H00UEX', '2023-06-26 06:06:58'),
	(62, 'Deposit', 6, 'John Kamemia', '0723062192', 3500, '20-06-2023', '31-07-2023', '17-09-2023', 'RFK716JWE3', '2023-06-26 06:10:46'),
	(63, 'Deposit', 2, 'Francis Maina', '0740594602', 2000, '26-06-2023', '31-07-2023', '27-08-2023', 'RFQ725NZ4N', '2023-06-29 08:42:08'),
	(64, 'Deposit', 1, 'Evanson Muchai', '0746210500', 7000, '01-07-2023', '03-04-2023', '09-07-2023', 'RG13EFWQSN', '2023-07-01 21:37:58'),
	(65, 'Deposit', 3, 'Peter Kanda', '0795428950', 2000, '07-07-2023', '19-06-2023', '16-07-2023', 'RG77YGKFA7', '2023-07-10 08:20:07'),
	(66, 'Deposit', 3, 'Peter Kanda', '0795428950', 2000, '02-08-2023', '17-07-2023', '13-08-2023', 'RH203U3II', '2023-08-04 20:15:56'),
	(67, 'Deposit', 6, 'John Kamemia', '0723062192', 6000, '19-08-2023', '18-09-2023', '10-12-2023', 'RHJ0QESSW', '2023-08-22 07:26:10'),
	(68, 'Deposit', 3, 'Peter Kanda', '0795428950', 2000, '10-09-2023', '14-08-2023', '10-09-2023', 'RIR7DHNAHP', '2023-09-11 14:57:55'),
	(69, 'Deposit', 2, 'Francis Maina', '0740594602', 4000, '12-09-2023', '28-08-2023', '22-10-2023', 'RICOM153JK', '2023-09-18 11:18:47'),
	(70, 'Deposit', 1, 'Evanson Muchai', '0746210500', 5000, '01-10-2023', '10-07-2023', '17-09-2023', 'RJ199JB4F', '2023-10-02 09:39:05'),
	(71, 'Deposit', 3, 'Peter Kanda', '0795428950', 2000, '04-10-2023', '11-09-2023', '08-10-2023', 'RJ44IMARAW   ', '2023-10-12 07:04:34'),
	(72, 'Deposit', 3, 'Peter Kanda', '0795428950', 2000, '04-11-2023', '09-10-2023', '05-11-2023', 'RK41FVUBJ5', '2023-11-09 19:35:32'),
	(73, 'Deposit', 2, 'Francis Maina', '0740594602', 4000, '12-11-2023', '23-10-2023', '17-12-2023', 'RKA6Z4PH6E', '2023-11-15 07:25:32'),
	(74, 'Deposit', 1, 'Evanson Muchai', '0746210500', 7500, '01-12-2023', '18-09-2023', '30-12-2023', 'RL10UINSMO', '2023-12-04 12:20:53'),
	(75, 'Deposit', 6, 'John Kamemia', '0723062192', 8000, '01-12-2023', '11-12-2023', '31-03-2024', 'RL13WKSHA1', '2023-12-04 12:25:56'),
	(76, 'Deposit', 3, 'Peter    Kanda', '0795428950', 2000, '01-12-2023', '06-11-2023', '03-12-2023', 'RL13WXP7MT', '2023-12-04 12:30:46'),
	(77, 'Deposit', 5, 'Duncan Muchai', '0740384086', 2000, '08-01-2024', '01-01-2024', '28-01-2024', 'SA83FCIHHJ', '2024-01-19 07:51:54'),
	(78, 'Deposit', 1, 'Evanson Muchai', '0746210500', 2000, '03-02-2024', '01-01-2024', '28-01-2024', 'SB35X99XD3', '2024-02-07 06:08:21'),
	(79, 'Deposit', 5, 'Duncan Muchai', '0740384086', 2000, '12-02-2024', '29-01-2024', '25-02-2024', 'SBC9V62D7Z', '2024-02-14 13:31:21'),
	(80, 'Deposit', 10, 'Credit Cnterest', '0746210500', 10000, '24-05-2024', '04-04-2022', '31-03-2024', '2 years Credit Interest', '2024-05-25 10:31:47'),
	(81, 'Withdraw', 1, 'Evanson Muchai', '0746210500', 1000, '30-07-2024', '01-07-2024', '07-07-2024', 'SQL2345DEST2', '2024-07-30 12:26:58'),
	(82, 'Withdraw', 5, 'Duncan Muchai', '0740384086', 43000, '30-07-2024', '04-04-2022', '31-03-2024', 'SQL234GERTS', '2024-07-30 12:35:04');

START TRANSACTION;

-- ── 3. Members ──
INSERT INTO `members`
  (`legacy_id`, `member_name`, `firstname`, `lastname`, `position_id`, `gender_id`, `id_number`,
   `phone`, `email`, `reg_date`, `reg_fee`, `other_details`, `status`, `workflow_id`, `workflow_stage_id`)
SELECT
  l.id,
  TRIM(REGEXP_REPLACE(REGEXP_REPLACE(l.name, '(^|[[:space:]])[.]([[:space:]]|$)', ' '), '[[:space:]]{2,}', ' ')),
  TRIM(REGEXP_REPLACE(REGEXP_REPLACE(l.name, '(^|[[:space:]])[.]([[:space:]]|$)', ' '), '[[:space:]]{2,}', ' ')),
  '',
  pos.id,
  gen.id,
  NULLIF(NULLIF(TRIM(l.id_number), ''), '00000000'),
  NULLIF(TRIM(l.phone), ''),
  NULLIF(TRIM(l.email), ''),
  STR_TO_DATE(l.reg_date, '%d-%m-%Y'),
  CAST(NULLIF(TRIM(l.reg_fee), '') AS DECIMAL(12,2)),
  NULLIF(NULLIF(TRIM(l.other_details), ''), 'N/A'),
  CASE l.status WHEN 'Active' THEN 'active' WHEN 'Withdrawn' THEN 'inactive' WHEN 'Blocked' THEN 'locked' ELSE 'inactive' END,
  wf.id,
  CASE l.status WHEN 'Withdrawn' THEN st_withdrawn.id ELSE st_approved.id END
FROM `legacy_members` l
JOIN `workflows` wf
  ON wf.process_type_id = (SELECT id FROM `process_types` WHERE process_type_name = 'member_registration')
LEFT JOIN `workflow_stages` st_approved  ON st_approved.workflow_id  = wf.id AND st_approved.stage_name  = 'Approved'
LEFT JOIN `workflow_stages` st_withdrawn ON st_withdrawn.workflow_id = wf.id AND st_withdrawn.stage_name = 'Withdrawn'
LEFT JOIN `parameter_values` pos
  ON pos.parameter_id = (SELECT id FROM `parameters` WHERE text_id = 'parties-positions')
 AND pos.paramater_value = REPLACE(TRIM(l.position), '-', ' ')
LEFT JOIN `parameter_values` gen
  ON gen.parameter_id = (SELECT id FROM `parameters` WHERE text_id = 'genders')
 AND gen.paramater_value = TRIM(l.gender)
LEFT JOIN `members` existing ON existing.legacy_id = l.id
WHERE existing.id IS NULL
  -- INCLUDE filter — uncomment to skip non-person and/or blocked accounts:
  -- AND l.is_human = 'true'
  -- AND l.status <> 'Blocked'
ORDER BY l.id;

-- Member ref numbers: continue the MEM series in legacy order, then advance it.
SET @mig_new := (SELECT COUNT(*) FROM `members` WHERE legacy_id IS NOT NULL AND member_ref_no IS NULL);

UPDATE `members` m
JOIN (
  SELECT id, ROW_NUMBER() OVER (ORDER BY legacy_id) AS rn
  FROM `members` WHERE legacy_id IS NOT NULL AND member_ref_no IS NULL
) seq ON seq.id = m.id
JOIN `ref_numbering` rn
  ON rn.process_type_id = (SELECT id FROM `process_types` WHERE process_type_name = 'member_registration')
SET m.member_ref_no = CONCAT(
  rn.prefix,
  IF(rn.use_year,  CONCAT('-', YEAR(CURDATE())), ''),
  IF(rn.use_month, CONCAT('-', LPAD(MONTH(CURDATE()), 2, '0')), ''),
  IF(rn.prefix REGEXP '[/-]$', '', '-'),
  LPAD(rn.next_serial + seq.rn - 1, rn.padding, '0'));

UPDATE `ref_numbering`
SET next_serial = next_serial + @mig_new
WHERE process_type_id = (SELECT id FROM `process_types` WHERE process_type_name = 'member_registration');

-- ── 4. Contributions -> migrated transactions ──
INSERT INTO `transactions`
  (`legacy_id`, `file_no`, `member_id`, `transaction_type_id`, `amount`, `from_date`, `to_date`,
   `transaction_date`, `other_details`, `is_migrated`, `created_on`)
SELECT
  c.id,
  CONCAT('MIG-', LPAD(c.id, 4, '0')),
  m.id,
  tt.id,
  c.amount,
  STR_TO_DATE(c.from_date, '%d-%m-%Y'),
  STR_TO_DATE(c.to_date,   '%d-%m-%Y'),
  STR_TO_DATE(c.pay_date,  '%d-%m-%Y'),
  NULLIF(REGEXP_REPLACE(TRIM(c.other_details), ' {2,}', ' '), ''),
  1,
  COALESCE(c.time_stamp, CURRENT_TIMESTAMP)
FROM `legacy_contributions` c
JOIN `members` m ON m.legacy_id = c.member_id
JOIN `parameter_values` tt
  ON tt.parameter_id = (SELECT id FROM `parameters` WHERE text_id = 'transaction-types')
 AND tt.paramater_value = TRIM(c.transaction_type)
LEFT JOIN `transactions` existing ON existing.legacy_id = c.id
WHERE existing.id IS NULL
ORDER BY c.id;

COMMIT;

-- ── 5. Reconciliation — every count and total should match ──
SELECT 'members' AS what,
       (SELECT COUNT(*) FROM `legacy_members`) AS legacy,
       (SELECT COUNT(*) FROM `members` WHERE legacy_id IS NOT NULL) AS migrated
UNION ALL
SELECT 'contributions',
       (SELECT COUNT(*) FROM `legacy_contributions`),
       (SELECT COUNT(*) FROM `transactions` WHERE legacy_id IS NOT NULL)
UNION ALL
SELECT 'deposit total',
       (SELECT SUM(amount) FROM `legacy_contributions` WHERE transaction_type = 'Deposit'),
       (SELECT SUM(t.amount) FROM `transactions` t JOIN `parameter_values` tt ON tt.id = t.transaction_type_id
         WHERE t.legacy_id IS NOT NULL AND tt.paramater_value = 'Deposit')
UNION ALL
SELECT 'withdraw total',
       (SELECT SUM(amount) FROM `legacy_contributions` WHERE transaction_type = 'Withdraw'),
       (SELECT SUM(t.amount) FROM `transactions` t JOIN `parameter_values` tt ON tt.id = t.transaction_type_id
         WHERE t.legacy_id IS NOT NULL AND tt.paramater_value = 'Withdraw')
UNION ALL
SELECT 'unmapped positions/genders/dates',
       0,
       (SELECT COUNT(*) FROM `members` WHERE legacy_id IS NOT NULL
          AND (position_id IS NULL OR gender_id IS NULL OR reg_date IS NULL))
     + (SELECT COUNT(*) FROM `transactions` WHERE legacy_id IS NOT NULL
          AND (transaction_date IS NULL OR from_date IS NULL OR to_date IS NULL));

-- Contributions that could not be placed (member skipped / type unknown):
SELECT c.id, c.member_id, c.name, c.transaction_type, c.amount
FROM `legacy_contributions` c
LEFT JOIN `transactions` t ON t.legacy_id = c.id
WHERE t.id IS NULL;

-- ── 6. Staging no longer needed (the dump file remains the source copy) ──
DROP TABLE `legacy_contributions`;
DROP TABLE `legacy_members`;
