-- ------------------------------------------------------------
-- Bookings — book a trip on behalf of a company
--
-- A client can already be the "contact person" for a company via
-- `shops.owner_id` (renamed to "Contact Person" in the UI). This lets a
-- booking be made for one of the client's companies instead of just for
-- themselves.
--
-- Uniqueness: the old `unique_booking (client_id, trip_id)` meant a client
-- could only ever have ONE booking per trip, personal or not. We need the
-- same contact person to be able to book a trip once for themselves AND
-- once per company they represent. A generated `company_key` column
-- (0 when company_id is NULL) sidesteps MySQL's NULL-is-distinct unique-
-- index behaviour so the new 3-way key actually enforces "one booking per
-- client, per trip, per company (or per trip for their personal booking)".
-- ------------------------------------------------------------

ALTER TABLE `bookings`
  ADD COLUMN `company_id` INT NULL DEFAULT NULL AFTER `client_id`,
  ADD INDEX `FK_bookings_shops` (`company_id`),
  ADD CONSTRAINT `FK_bookings_shops` FOREIGN KEY (`company_id`) REFERENCES `shops` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION;

-- FK_bookings_clients relies on `unique_booking` as its supporting index —
-- add a plain index on client_id first so dropping it doesn't fail.
ALTER TABLE `bookings` ADD INDEX `idx_bookings_client` (`client_id`);

ALTER TABLE `bookings` DROP INDEX `unique_booking`;

ALTER TABLE `bookings`
  ADD COLUMN `company_key` INT GENERATED ALWAYS AS (COALESCE(`company_id`, 0)) STORED,
  ADD UNIQUE KEY `unique_booking` (`client_id`, `trip_id`, `company_key`);
