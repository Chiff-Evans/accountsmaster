-- --------------------------------------------------------
-- Host:                         C:\Users\SoftClans\Documents\NetBeansProjects\Online_Writing\others\db\online_writing_db3.3.3.db|C:\Users\SoftClans\Documents\NetBeansProjects\GIACHUKI_2016\others\db\giachuki_2016_db.db|C:\xampp\htdocs\projects\salesmaster\client\pos.db
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
CREATE TABLE IF NOT EXISTS contributions (id INTEGER PRIMARY KEY ON CONFLICT ROLLBACK AUTOINCREMENT, transaction_type VARCHAR (100), member_id INTEGER REFERENCES members (id) ON DELETE CASCADE ON UPDATE CASCADE, name VARCHAR (50) REFERENCES members (id) ON DELETE CASCADE ON UPDATE CASCADE, phone VARCHAR (50) REFERENCES members (id) ON DELETE CASCADE ON UPDATE CASCADE, amount INTEGER, pay_date DATETIME, from_date DATETIME, to_date DATETIME, other_details TEXT, time_stamp DATETIME DEFAULT (CURRENT_TIMESTAMP));

-- Dumping data for table giachuki_2016_db.contributions: 82 rows
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
	(76, 'Deposit', 3, 'Peter    Kanda', '0795428950', 2000, '01-12-2023', '06-11-2023', '03-12-2023', 'RL13WXP7MT', '2023-12-04 12:30:46'),
	(77, 'Deposit', 5, 'Duncan Muchai', '0740384086', 2000, '08-01-2024', '01-01-2024', '28-01-2024', 'SA83FCIHHJ', '2024-01-19 07:51:54'),
	(78, 'Deposit', 1, 'Evanson Muchai', '0746210500', 2000, '03-02-2024', '01-01-2024', '28-01-2024', 'SB35X99XD3', '2024-02-07 06:08:21'),
	(79, 'Deposit', 5, 'Duncan Muchai', '0740384086', 2000, '12-02-2024', '29-01-2024', '25-02-2024', 'SBC9V62D7Z', '2024-02-14 13:31:21'),
	(80, 'Deposit', 10, 'Credit Cnterest', '0746210500', 10000, '24-05-2024', '04-04-2022', '31-03-2024', '2 years Credit Interest', '2024-05-25 10:31:47'),
	(81, 'Withdraw', 1, 'Evanson Muchai', '0746210500', 1000, '30-07-2024', '01-07-2024', '07-07-2024', 'SQL2345DEST2', '2024-07-30 12:26:58'),
	(82, 'Withdraw', 5, 'Duncan Muchai', '0740384086', 43000, '30-07-2024', '04-04-2022', '31-03-2024', 'SQL234GERTS', '2024-07-30 12:35:04');

-- Dumping structure for table giachuki_2016_db.members
CREATE TABLE IF NOT EXISTS members (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR (50), position VARCHAR (50), gender VARCHAR (50), id_number VARCHAR (50), phone VARCHAR (50), email TEXT, reg_date DATETIME, reg_fee, other_details TEXT, status VARCHAR (50) DEFAULT Active, is_human VARCHAR (50) DEFAULT (true));

-- Dumping data for table giachuki_2016_db.members: 10 rows
INSERT INTO "members" ("id", "name", "position", "gender", "id_number", "phone", "email", "reg_date", "reg_fee", "other_details", "status", "is_human") VALUES
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

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
