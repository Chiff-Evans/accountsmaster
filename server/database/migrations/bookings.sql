-- ============================================================
-- Adventure Management Transform — Bookings feature
-- Replaces the retail-Orders-based "Bookings" admin screen with
-- a simple client+trip booking request table.
-- Run once against the venturebrite database.
-- BACK UP THE DATABASE BEFORE RUNNING THIS FILE.
-- ============================================================

CREATE TABLE IF NOT EXISTS `bookings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `client_id` INT NULL DEFAULT NULL,
  `trip_id` INT NULL DEFAULT NULL,
  `no_of_adults` INT NULL DEFAULT NULL,
  `no_of_kids` INT NULL DEFAULT NULL,
  `comments` TEXT NULL DEFAULT NULL,
  `cancel_requested` INT NULL DEFAULT '0',
  `created_on` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_booking` (`client_id`, `trip_id`) USING BTREE,
  INDEX `FK_bookings_trips` (`trip_id`) USING BTREE,
  CONSTRAINT `FK_bookings_clients` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT `FK_bookings_trips` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
