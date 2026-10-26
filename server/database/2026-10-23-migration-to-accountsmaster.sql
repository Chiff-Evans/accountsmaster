-- --------------------------------------------------------
-- Host:                         C:\masterbrains.com\Giachuki\others\db\giachuki_2016_db.db
-- Server version:               3.51.0
-- Server OS:                    
-- HeidiSQL Version:             12.17.0.7270
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES  */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping structure for table giachuki_2016_db.contributions
CREATE TABLE IF NOT EXISTS contributions (id INTEGER PRIMARY KEY ON CONFLICT ROLLBACK AUTOINCREMENT, transaction_type VARCHAR (100), member_id INTEGER REFERENCES members (id) ON DELETE CASCADE ON UPDATE CASCADE, name VARCHAR (50), phone VARCHAR (50), amount INTEGER, pay_date DATETIME, from_date DATETIME, to_date DATETIME, other_details TEXT, time_stamp DATETIME DEFAULT (CURRENT_TIMESTAMP));

-- Dumping data for table giachuki_2016_db.contributions: 168 rows
INSERT INTO "contributions" ("id", "transaction_type", "member_id", "name", "phone", "amount", "pay_date", "from_date", "to_date", "other_details", "time_stamp") VALUES
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
	(76, 'Deposit', 3, 'Peter Kanda', '0795428950', 2000, '01-12-2023', '06-11-2023', '03-12-2023', 'RL13WXP7MT', '2023-12-04 12:30:46'),
	(77, 'Deposit', 5, 'Duncan Muchai', '0740384086', 2000, '08-01-2024', '01-01-2024', '28-01-2024', 'SA83FCIHHJ', '2024-01-19 07:51:54'),
	(78, 'Deposit', 1, 'Evanson Muchai', '0746210500', 2000, '03-02-2024', '01-01-2024', '28-01-2024', 'SB35X99XD3', '2024-02-07 06:08:21'),
	(79, 'Deposit', 5, 'Duncan Muchai', '0740384086', 2000, '12-02-2024', '29-01-2024', '25-02-2024', 'SBC9V62D7Z', '2024-02-14 13:31:21'),
	(80, 'Deposit', 3, 'Peter Kanda', '0795428950', 4000, '19-02-2024', '04-12-2023', '28-01-2024', 'SBJ0IJYDY2', '2024-02-21 00:50:32'),
	(81, 'Deposit', 2, 'Francis Maina', '0740594602', 5000, '25-02-2024', '18-12-2023', '25-02-2024', 'SBP562MD0H', '2024-02-28 17:55:05'),
	(82, 'Deposit', 1, 'Evanson Muchai', '0746210500', 4500, '05-03-2024', '29-01-2024', '31-03-2024', 'Bank Ref: FT24065D4PVJ ', '2024-03-05 09:58:25'),
	(83, 'Deposit', 2, 'Francis Maina', '0740594602', 2500, '09-03-2024', '26-02-2024', '31-03-2024', 'SC92GJDG62
Deposited as Ksh 10000.', '2024-03-10 17:12:02'),
	(84, 'Deposit', 2, 'Francis Maina', '0740594602', 7500, '09-03-2024', '01-04-2024', '09-06-2024', 'SC92GJDG62
Deposited as Ksh 10000.', '2024-03-10 17:24:31'),
	(85, 'Deposit', 5, 'Duncan Muchai', '0740384086', 2000, '12-03-2024', '26-02-2024', '24-03-2024', 'SCC2AK92CC
Deposited as Ksh 10000.', '2024-03-12 09:22:54'),
	(86, 'Deposit', 3, 'Peter Kanda', '0795428950', 2000, '26-03-2024', '29-01-2024', '25-02-2024', 'SCQ572ILFH', '2024-04-02 07:25:05'),
	(87, 'Deposit', 6, 'John Kamemia', '0723062192', 10000, '31-03-2024', '01-04-2024', '30-06-2024', 'SCV4QDKKU0
Ksh 9750 to cover for 13 weeks
1st April 2024 to 30th June 2024
Carry forward Ksh 250 ', '2024-04-02 07:36:44'),
	(88, 'Deposit', 6, 'John Kamemia', '0723062192', 500, '04-04-2024', '01-07-2024', '07-07-2024', 'SD434CTHYH
Carried forward Ksh 250 from
the previous deposit of Ksh 10000.', '2024-04-04 10:15:17'),
	(89, 'Deposit', 3, 'Peter Kanda', '0795428950', 3000, '20-04-2024', '26-02-2024', '31-03-2024', 'SDK5S42LTV
Ksh 2500 to cover until 31st March 
2024.
Carry over Ksh 500.', '2024-04-21 16:56:00'),
	(90, 'Deposit', 3, 'Peter Kanda', '0795428950', 250, '22-04-2024', '01-04-2024', '07-04-2024', 'SDM6WMCLZO
Carried forward Ksh 500 from
the previous deposit of Ksh 3000.', '2024-04-22 13:27:17'),
	(91, 'Deposit', 1, 'Evanson Muchai', '0746210500', 4500, '29-04-2024', '01-04-2024', '12-05-2024', 'Bank Ref: FT24120KSN0K', '2024-04-29 06:50:40'),
	(92, 'Deposit', 7, 'Credit Interest', '0746210500', 11142, '24-05-2024', '26-12-2022', '31-03-2024', 'Interest paid by 31st March 2024', '2024-05-24 11:35:01'),
	(93, 'Deposit', 1, 'Evanson Muchai', '0746210500', 3000, '30-05-2024', '13-05-2024', '09-06-2024', 'Bank Ref: FT24151FWDMR', '2024-05-30 13:21:36'),
	(94, 'Withdraw', 5, 'Duncan Muchai', '0740384086', 43000, '09-07-2024', '04-04-2022', '31-03-2024', 'TT241910FY22', '2024-08-14 16:38:13'),
	(95, 'Deposit', 2, 'Francis Maina', '0740594602', 10000, '26-07-2024', '10-06-2024', '08-09-2024', 'SGQ8UWIWFG Ksh 9,750 to cover from 10th June 2024
to 8th September 2024

Carry over - Ksh 250', '2024-08-15 08:36:32'),
	(96, 'Deposit', 6, 'John Kamemia', '0723062192', 10500, '29-07-2024', '08-07-2024', '13-10-2024', 'SGT29WUDQW', '2024-08-15 08:42:30'),
	(97, 'Deposit', 1, 'Evanson Muchai', '0746210500', 6000, '29-07-2024', '10-06-2024', '04-08-2024', 'Dear EVANSON MUCHAI KINYANJUI,  Transaction 
Ref: 20045393660 of  KES 6,000.00 from A/c 1**8739 to 
A/c 1**8475 on 29/07/2024 is  Completed Bank 
Ref: FT24211SFJQ0.', '2024-08-15 08:46:11'),
	(98, 'Deposit', 1, 'Evanson Muchai', '0746210500', 6000, '27-08-2024', '05-08-2024', '29-09-2024', 'Dear EVANSON MUCHAI KINYANJUI, Transaction 
Ref: 20046800171 of  KES 6,000.00 from A/c 1**8739 to 
A/c 1**8475 on 27/08/2024 is  Completed Bank 
Ref: FT24240J6NC1', '2024-08-28 09:19:41'),
	(99, 'Deposit', 6, 'John Kamemia', '0723062192', 6000, '04-11-2024', '14-10-2024', '08-12-2024', 'Ksh 6000.00 sent to KCB  Pay Bill 522522  for account 
129***8475  EVANSON FRANCIS PETER JA  has been 
received on 04/11/2024  at 05:09 PM. 
M-PESA ref SK45KG8C09', '2024-11-06 09:21:51'),
	(100, 'Deposit', 6, 'John Kamemia', '0723062192', 6000, '23-11-2024', '09-12-2024', '02-02-2025', 'Ksh 6000.00 sent to KCB Pay Bill 522522 for account 
129***8475  EVANSON FRANCIS PETER JA has been 
received on 23/11/2024 at 10:42 AM. 
M-PESA ref SKN8SVX3OE', '2024-11-26 14:08:27'),
	(101, 'Deposit', 2, 'Francis Maina', '0740594602', 10000, '06-01-2025', '09-09-2024', '08-12-2024', 'Ksh 10000.00 sent to KCB  Pay Bill 522522 for account 
129***8475 EVANSON FRANCIS PETER JA has  been 
received on 06/01/2025 at 10:59 AM. 
M-PESA ref TA645VW3TY 
Ksh 9750 -  9th Sept  to  8th Dec 2024
Remainder of Ksh 250 + 250 = 500', '2025-01-06 08:51:29'),
	(102, 'Deposit', 1, 'Evanson Muchai', '0746210500', 10500, '06-01-2025', '30-09-2024', '05-01-2025', 'Dear EVANSON MUCHAI KINYANJUI, 
Transaction  Ref: 20053587520 of  KES 10,500.00 
from A/c 1**8739 to A/c 1**8475 on 06/01/2025 is  
Completed Bank Ref: FT250069LQZ7.', '2025-01-06 08:54:54'),
	(103, 'Deposit', 7, 'Credit Interest', '0746210500', 17628, '01-01-2025', '04-04-2022', '31-12-2025', 'Credit Interest Awarded by 31st 
December 2024', '2025-01-06 09:36:24'),
	(104, 'Withdraw', 8, 'Deductions', '0700000000', 2644, '01-01-2025', '04-04-2022', '31-12-2025', 'Tax deducted by 31st December 2024', '2025-01-06 09:38:28'),
	(105, 'Deposit', 2, 'Francis Maina', '0740594602', 2500, '06-01-2025', '09-12-2024', '05-01-2025', 'Ksh 2500.00 sent to KCB Pay Bill  522522 for account 
129***8475  EVANSON FRANCIS PETER JA has been  
received on 06/01/2025at 12:44 PM. M-PESA 
ref TA626BGU68

Carry over of Ksh 500 is included', '2025-01-06 09:51:36'),
	(106, 'Deposit', 8, 'Deductions', '0700000000', 0, '06-01-2025', '01-01-2025', '06-01-2025', 'Dummy Deposit', '2025-01-06 10:28:30'),
	(107, 'Deposit', 6, 'John Kamemia', '0723062192', 3000, '13-03-2025', '03-02-2025', '02-03-2025', 'TCD9HVRF1N Confirmed. Ksh3,000.00 sent to KCB 
INVESTMENT BANK MMF for account KCBAM;24101 
on 13/3/25 at 9:47 AM.', '2025-03-13 07:47:48'),
	(108, 'Deposit', 3, 'Peter Kanda', '0795428950', 20000, '29-12-2025', '08-04-2024', '06-10-2024', 'TCE4MP25UK Confirmed. Ksh20,000  sent to KCB 
INVESTMENT BANK MMF for account KCBAM24101 
on 14/3/25 at 11:00 AM

Carried Forward Ksh 500', '2025-03-17 08:20:23'),
	(109, 'Deposit', 6, 'John Kamemia', '0723062192', 6000, '21-03-2025', '03-03-2025', '27-04-2025', 'TCL1KYDHDJ Confirmed. Ksh6,000 sent to KCB 
INVESTMENT BANK MMF for account KCBAM;24101 
on 21/3/25 at 7:06 PM.', '2025-03-25 08:32:13'),
	(110, 'Deposit', 1, 'Evanson Muchai', '0746210500', 9000, '27-03-2025', '06-01-2025', '30-03-2025', 'TCR2BQEUJ2 Confirmed. Ksh9,000.00  sent to KCB 
INVESTMENT BANK MMF for account KCBAM24101 
on 27/3/25 at 5:11 PM.', '2025-03-27 14:22:37'),
	(111, 'Deposit', 7, 'Credit Interest', '0746210500', 1630, '31-03-2025', '01-03-2025', '31-03-2025', 'Interest earned as of 31st March 2025', '2025-04-07 07:38:55'),
	(112, 'Deposit', 2, 'Francis Maina', '0740594602', 10000, '12-04-2025', '06-01-2025', '06-04-2025', 'TDC6I5N5QY Confirmed. Ksh10,000 sent to KCB 
INVESTMENT BANK  MMF for account KCBAM;24101 
on 12/4/25 at 7:28 PM.

KSh 9750  - to cover upto 06 Apr 2025
KSh 250 - Carry over to next dates ', '2025-04-16 09:03:46'),
	(113, 'Deposit', 3, 'Peter Kanda', '0795428950', 10000, '13-04-2025', '07-10-2024', '12-01-2025', 'TDD5K674SZ Confirmed. Ksh10,000  sent to KCB 
INVESTMENT BANK MMF for account KCBAM;24101 
on 13/4/25 at 10:30 AM.

Previous carry forward KSh 500 applied.', '2025-04-16 09:10:20'),
	(114, 'Deposit', 7, 'Credit Interest', '0746210500', 2628, '06-05-2025', '01-04-2025', '30-04-2025', 'Interest earned as of 30th April 2025', '2025-05-07 08:38:02'),
	(115, 'Deposit', 1, 'Evanson Muchai', '0746210500', 10500, '07-05-2025', '31-03-2025', '06-07-2025', 'TE71QPLD5V Confirmed. Ksh10,500.00 sent to 
KCB INVESTMENT BANK MMF for account
 KCBAM24101 on 7/5/25 at 12:02 PM.', '2025-05-07 09:12:37'),
	(116, 'Deposit', 6, 'John Kamemia', '0723062192', 6000, '07-05-2025', '28-04-2025', '22-06-2025', 'TE75SXSDWB Confirmed. Ksh6,000.00 sent to 
KCB INVESTMENT BANK MMF for account 
KCBAM;24101 on 7/5/25 at 7:23 PM', '2025-05-07 16:40:40'),
	(117, 'Deposit', 3, 'Peter M Kanda', '0795428950', 10000, '16-05-2025', '13-01-2025', '13-04-2025', 'TEG8ZFQPSY Confirmed. Ksh10,000.00 sent to 
KCB INVESTMENT BANK MMF for account 
KCBAM24101 on 16/5/25 at 6:41 PM

Ksh 9750 - Amount Used
Ksh 250 - Carry forward amount', '2025-05-17 16:42:14'),
	(118, 'Deposit', 7, 'Credit Interest', '0746210500', 2861, '06-06-2025', '01-05-2025', '31-05-2025', 'May 2025 Interest', '2025-06-09 08:15:13'),
	(119, 'Deposit', 7, 'Credit Interest', '0746210500', 2816, '06-07-2025', '01-06-2025', '30-06-2025', 'June 2025 Interest', '2025-07-17 12:37:07'),
	(120, 'Deposit', 3, 'Peter M Kanda', '0795428950', 10000, '24-07-2025', '14-04-2025', '13-07-2025', 'TGO1AMMGHT Confirmed. Ksh10,000.00 sent to 
KCB INVESTMENT BANK MMF for account 
KCBAM24101 on 24/7/25 at 12:04 PM

Carry forward
Last  Ksh 250
Current Ksh 250
Total - Ksh 500', '2025-07-24 10:05:03'),
	(121, 'Deposit', 7, 'Credit Interest', '0746210500', 2883, '07-08-2025', '01-07-2025', '31-07-2025', 'July Credit Interest', '2025-08-13 20:38:56'),
	(122, 'Deposit', 1, 'Evanson Muchai', '0746210500', 6000, '27-08-2025', '07-07-2025', '31-08-2025', 'THR58WWRR9 Confirmed. Ksh6,000.00 sent to 
KCB INVESTMENT BANK MMF for account 
KCBAM24101 on 27/8/25 at 9:01 PM', '2025-08-27 19:32:48'),
	(123, 'Deposit', 7, 'Credit Interest', '0746210500', 2943, '04-09-2025', '01-08-2025', '31-08-2025', 'August Interest ', '2025-09-05 20:16:05'),
	(124, 'Deposit', 3, 'Peter M Kanda', '0795428950', 7000, '12-09-2025', '14-07-2025', '21-09-2025', 'TIC8JL6LJ2 Confirmed. Ksh7,000.00 sent to 
KCB INVESTMENT BANK MMF for account 24101 
on 12/9/25 at 12:13 PM

Ksh 6,750  for 9 weeks
Current - Ksh 250 
Previous - Ksh 500 
Carry over of 500 utilized fully', '2025-09-16 10:27:45'),
	(125, 'Deposit', 2, 'Francis Maina', '0740594602', 20000, '05-10-2025', '07-04-2025', '12-10-2025', 'TJ5AG6JN15 Confirmed. Ksh20,000.00 sent to 
KCB INVESTMENT BANK MMF for account 
KCBAM ; 24101 on 5/10/25 at 1:34 PM

Carry over of KSh 250 used', '2025-10-06 14:47:02'),
	(126, 'Deposit', 7, 'Credit Interest', '0746210500', 3445, '07-10-2025', '01-09-2025', '30-09-2025', 'September 2025 interest', '2025-10-08 09:29:59'),
	(127, 'Deposit', 1, 'Evanson Muchai', '0746210500', 6750, '07-10-2025', '01-09-2025', '02-11-2025', 'TJ8L16WW2D Confirmed. Ksh6,750.00 
sent to KCB INVESTMENT BANK MMF for account 
KCBAM24101 on 8/10/25 at 5:00 PM', '2025-10-08 22:22:31'),
	(128, 'Deposit', 7, 'Credit Interest', '0746210500', 3788, '06-11-2025', '01-10-2025', '31-10-2025', 'October 2025 Interest', '2025-11-06 07:44:43'),
	(129, 'Deposit', 6, 'John Kamemia', '0723062192', 30000, '06-11-2025', '23-06-2025', '29-03-2026', 'TK6FK9HJ40 Confirmed. Ksh30,000.00 sent to 
KCB INVESTMENT BANK MMF for account 
KCB24101 on 6/11/25 at 11:50 AM', '2025-11-06 12:56:48'),
	(130, 'Deposit', 1, 'Evanson Muchai', '0746210500', 3000, '12-11-2025', '03-11-2025', '30-11-2025', 'TKCL1A1ML6 Confirmed. Ksh3,000.00 sent to 
KCB INVESTMENT BANK MMF for account 
KCB24101 on 12/11/25 at 6:36 PM.', '2025-11-13 15:23:57'),
	(131, 'Deposit', 1, 'Evanson Muchai', '0746210500', 3750, '03-12-2025', '01-12-2025', '04-01-2026', 'TL3L101MZ1 Confirmed. Ksh3,750.00 sent to 
KCB INVESTMENT BANK MMF for account KCB24101 
on 3/12/25 at 7:35 PM.', '2025-12-04 07:41:06'),
	(132, 'Deposit', 7, 'Credit Interest', '0746210500', 3965, '06-12-2025', '01-11-2025', '30-11-2025', 'November 2025 Interest', '2025-12-08 07:09:45'),
	(133, 'Withdraw', 8, 'Deductions Done', '0700000000', 516, '07-10-2025', '01-09-2025', '30-09-2025', 'September Tax Deduction', '2025-12-08 08:51:20'),
	(134, 'Withdraw', 8, 'Deductions Done', '0700000000', 568, '06-11-2025', '01-10-2025', '31-10-2025', 'October Tax Deductions', '2025-12-08 08:53:13'),
	(135, 'Withdraw', 8, 'Deductions Done', '0700000000', 594, '06-12-2025', '01-11-2025', '30-11-2025', 'November Tax Deductions', '2025-12-08 08:55:20'),
	(136, 'Deposit', 7, 'Credit Interest', '0746210500', 3357, '01-01-2026', '01-01-2025', '29-12-2025', 'Interest up to end of  2025 From KCB Savings Account', '2026-01-05 08:58:33'),
	(137, 'Deposit', 3, 'Peter M Kanda', '0795428950', 10000, '03-01-2026', '22-09-2025', '21-12-2025', 'UA2F52SJA2 Confirmed. Ksh10,000.00 sent to 
KCB INVESTMENT BANK MMF for account KCB24101
on 2/1/26 at 3:38 PM

Carry Over
Previous Ksh 0
Current Ksh 250
Total Unutilized - Ksh 250', '2026-01-05 09:04:22'),
	(138, 'Deposit', 7, 'Credit Interest', '0746210500', 4239, '06-01-2026', '01-12-2025', '29-12-2025', 'December 2025 Interest', '2026-01-06 09:52:51'),
	(139, 'Withdraw', 8, 'Deductions Done', '0700000000', 635, '06-01-2026', '01-12-2025', '29-12-2025', 'December 2025 Deductions', '2026-01-06 09:58:49'),
	(140, 'Withdraw', 8, 'Deductions Done', '0700000000', 503, '01-01-2026', '29-12-2025', '29-12-2025', 'Taxes Deducted From the savings KCB account', '2026-01-06 10:07:35'),
	(141, 'Deposit', 7, 'Credit Interest', '0746210500', 4308, '09-02-2026', '01-01-2026', '31-01-2026', 'January 2026 Interest', '2026-02-09 16:13:00'),
	(142, 'Withdraw', 8, 'Deductions Done', '0700000000', 646, '09-02-2026', '01-01-2026', '31-01-2026', 'January 2026 deductions.', '2026-02-09 16:13:43'),
	(143, 'Deposit', 6, 'John Kamemia', '0723062192', 6000, '28-02-2026', '30-03-2026', '24-05-2026', 'UBSFK83X5Y Confirmed. Ksh6,000.00 sent to 
KCB INVESTMENT BANK MMF for account KCB24101 
on 28/2/26 at 5:57 PM', '2026-03-02 08:08:46'),
	(144, 'Deposit', 1, 'Evanson Muchai', '0746210500', 6000, '28-02-2026', '05-01-2026', '01-03-2026', 'UBSL185PGJ Confirmed. Ksh6,000.00 sent to 
KCB INVESTMENT BANK MMF for account KCB24101 
on 28/2/26 at 8:20 PM.', '2026-03-02 08:11:15'),
	(145, 'Deposit', 2, 'Francis Maina', '0740594602', 10000, '03-03-2026', '13-10-2025', '11-01-2026', 'UC3AG8DE36 Confirmed. Ksh10,000.00 sent to 
KCB INVESTMENT BANK MMF for account KCB24101 
on 3/3/26 at 9:08 PM

Carry over KSh 250', '2026-03-04 12:49:58'),
	(146, 'Deposit', 2, 'Francis Maina', '0740594602', 10000, '05-03-2026', '12-01-2026', '12-04-2026', 'UC5AG8ITOV Confirmed. Ksh10,000.00 sent to 
KCB INVESTMENT BANK MMF for account KCB24101 
on 5/3/26 at 3:00 PM

Carry Over 
Previous - KSh 250
Current - KSh 250
Total - KSh 500', '2026-03-05 14:22:30'),
	(147, 'Deposit', 7, 'Credit Interest', '0746210500', 3875, '06-03-2026', '01-02-2026', '28-02-2026', 'February 2026 interest', '2026-03-06 19:49:41'),
	(148, 'Withdraw', 8, 'Deductions Done', '0700000000', 581, '06-03-2026', '01-02-2026', '28-02-2026', 'February 2026 deductions', '2026-03-06 19:51:43'),
	(149, 'Deposit', 7, 'Credit Interest', '0746210500', 4536, '08-12-2025', '01-03-2026', '31-03-2026', 'March 2026 Interest', '2026-04-09 08:28:52'),
	(150, 'Withdraw', 8, 'Deductions Done', '0700000000', 680, '08-04-2026', '01-03-2026', '31-03-2026', 'March 2026 deductions', '2026-04-09 08:29:52'),
	(151, 'Deposit', 7, 'Credit Interest', '0746210500', 4411, '05-05-2026', '01-04-2026', '30-04-2026', 'April 2026 Interest', '2026-05-08 11:55:19'),
	(152, 'Withdraw', 8, 'Deductions Done', '0700000000', 661, '05-05-2026', '01-04-2026', '30-04-2026', 'April  2026  deductions', '2026-05-08 11:56:35'),
	(153, 'Deposit', 3, 'Peter M Kanda', '0795428950', 15000, '14-05-2026', '22-12-2025', '10-05-2026', 'UEDF54H40E Confirmed. Ksh15,000.00 sent to 
KCB INVESTMENT BANK MMF for account 
KCBAM24101 on 13/5/26 at 11:15 PM

Carry Over
Previous Ksh 250
Current Ksh 0
Total Unutilized - Ksh 250', '2026-05-15 13:06:11'),
	(154, 'Deposit', 6, 'John Kamemia', '0723062192', 7500, '15-05-2026', '24-05-2026', '02-08-2026', 'UEFFK4K0XM Confirmed. Ksh7,500.00 sent to 
KCB INVESTMENT BANK MMF for account KCB24101 
on 15/5/26 at 6:42 PM', '2026-05-22 10:21:02'),
	(155, 'Deposit', 7, 'Credit Interest', '0746210500', 4634, '28-12-2026', '01-05-2026', '31-05-2026', 'May 2026 Interest', '2026-06-15 08:47:44'),
	(156, 'Withdraw', 8, 'Deductions Done', '0700000000', 695, '05-06-2026', '01-05-2026', '31-05-2026', 'May 2026 deductions', '2026-06-15 08:48:34'),
	(157, 'Deposit', 7, 'Credit Interest', '0746210500', 4633, '07-07-2026', '01-06-2026', '30-06-2026', 'June 2026  Interest', '2026-07-08 09:23:50'),
	(158, 'Withdraw', 8, 'Deductions Done', '0700000000', 695, '07-07-2026', '01-06-2026', '30-06-2026', 'Taxes June 2026', '2026-07-08 09:24:56'),
	(159, 'Deposit', 6, 'John Kamemia', '0723062192', 6750, '01-08-2026', '03-08-2026', '04-10-2026', 'UH1FK1KKE7 Confirmed. Ksh6,750.00 sent to 
KCB INVESTMENT BANK MMF for account
KCB24101 on 1/8/26 at 5:20 PM', '2026-08-10 15:14:46'),
	(160, 'Deposit', 7, 'Credit Interest', '0746210500', 4839, '10-08-2026', '01-07-2026', '31-07-2026', 'July Interest', '2026-08-11 08:08:33'),
	(161, 'Withdraw', 8, 'Deductions Done', '0700000000', 725, '10-08-2026', '01-07-2026', '31-07-2026', 'July Deductions', '2026-08-11 08:09:40'),
	(162, 'Deposit', 6, 'John Kamemia', '0723062192', 8250, '29-08-2026', '05-10-2026', '20-12-2026', 'UHTFK4S37Q Confirmed. Ksh8,250.00 sent to 
KCB INVESTMENT BANK MMF for account 
KCB24101 on 29/8/26 at 11:53 AM .', '2026-09-02 10:57:49'),
	(163, 'Deposit', 1, 'Evanson Muchai', '0746210500', 10000, '02-09-2026', '02-03-2026', '31-05-2026', 'Dear EVANSON MUCHAI KINYANJUI, 
your investment of 10000.00 KES into your MMF  
account was successful. 
Ref: MBNHEJEYGEDPYMOY.

Carry Over  un-used 250', '2026-09-02 11:03:12'),
	(164, 'Deposit', 7, 'Credit Interest', '0746210500', 4907, '05-09-2026', '01-08-2026', '31-08-2026', 'August 2026 Credit Interest', '2026-09-07 12:23:38'),
	(165, 'Withdraw', 8, 'Deductions Done', '0746210500', 736, '05-09-2026', '01-08-2026', '31-08-2026', 'August 2026 Deductions', '2026-09-07 12:24:51'),
	(166, 'Deposit', 1, 'Evanson Muchai', '0746210500', 9500, '25-09-2026', '01-06-2026', '30-08-2026', 'Dear EVANSON MUCHAI KINYANJUI,
your contribution of KES 9500.00  for Money Market 
Investment has been successfully received. 
Investment will be updated within the next working day.

Carry over of KSh 250 fully used.', '2026-09-28 08:00:14'),
	(167, 'Deposit', 2, 'Francis Maina', '0740594602', 10000, '30-09-2026', '13-04-2026', '19-07-2026', 'Confirmed. Your M-PESA transaction UIUAG8JCGF 
of Ksh 10000.00 to KCB INVESTMENT BANK LIMITED 
for account KCB24101 on 30/09/2026 at 09:05 AM 
has been received

Carry over of KSH 500 fully used.', '2026-10-01 14:52:01'),
	(168, 'Deposit', 3, 'Peter M Kanda', '0795428950', 15000, '18-10-2026', '11-05-2026', '27-09-2026', 'Confirmed. Your M-PESA transaction UJIF5B1MM2 
of Ksh 15000.00 to KCB INVESTMENT BANK LIMITED 
for account KCB24101 on 18/10/2026 at 08:41 AM 
has been received.
Carry Over
Previous Ksh 250
Current Ksh 0
Total Unutilized - Ksh 250', '2026-10-19 09:51:44');


-- Dumping structure for table giachuki_2016_db.members
CREATE TABLE IF NOT EXISTS members (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR (50), position VARCHAR (50), gender VARCHAR (50), id_number VARCHAR (50), phone VARCHAR (50), email TEXT, reg_date DATETIME, reg_fee, other_details TEXT, status VARCHAR (50) DEFAULT Active, is_human VARCHAR(50) DEFAULT 'true');

-- Dumping data for table giachuki_2016_db.members: 10 rows
INSERT INTO "members" ("id", "name", "position", "gender", "id_number", "phone", "email", "reg_date", "reg_fee", "other_details", "status", "is_human") VALUES
	(1, 'Evanson Muchai', 'Treasurer', 'Male', '34707519', '0746210500', 'evansonmuchai2016@gmail.com', '01-04-2022', '00', 'N/A', 'Active', 'true'),
	(2, 'Francis Maina', 'Chair-Person', 'Male', '00000000', '0740594602', 'fmuguuru@gmail.com', '01-04-2022', '00', 'Chair Person', 'Active', 'true'),
	(3, 'Peter M Kanda', 'Member', 'Male', '00000000', '0795428950', 'matukanda254@gmail.com', '01-04-2022', '00', 'Secretary', 'Active', 'true'),
	(4, 'Kennedy Maina', 'Member', 'Male', '00000000', '0799149536', 'kencasper97@gmail.com', '01-04-2022', '00', 'Member', 'Active', 'true'),
	(5, 'Duncan Muchai', 'Member', 'Male', '00000000', '0740384086', 'testdm@gmail.com', '01-04-2022', '00', 'Member', 'Withdrawn', 'true'),
	(6, 'John Kamemia', 'Secretary', 'Male', '00000000', '0723062192', 'johnwaituika266@gmail.com', '12-12-2022', '00', 'Joined us on 12th December 2022 at
an anual general meeting held at
Green Spot Hotel By Pass Ruiru.', 'Active', 'true'),
	(7, 'Credit Interest', 'Member', 'Female', '00000000', '0746210500', 'example@tmail.com', '24-05-2024', '00', 'System user to monitor credit interest 
paid by the bank or Money Market Fund...', 'Active', 'false'),
	(8, 'Deductions Done', 'Member', 'Male', '00000000', '0746210500', 'taxemail@email.com', '06-01-2025', '00', 'System user to monitor taxes and deductions
done by the bank or Money Market Fund...', 'Active', 'false'),
	(9, 'Martin Irungu', 'Member', 'Male', '00000000', '0717711482', 'example@gmail.com', '21-10-2025', '00', 'Other Details', 'Blocked', 'true'),
	(10, 'Anonymous Person', 'Member', 'Female', '00000000', '0711111111', 'examplefemale@gmail.com', '18-06-2022', '00', 'Others', 'Blocked', 'true');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
