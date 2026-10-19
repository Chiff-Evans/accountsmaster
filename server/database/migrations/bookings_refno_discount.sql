-- ------------------------------------------------------------
-- Bookings — file number (ref numbering) + Discount
--
-- Ref numbering for bookings was already pre-configured under the retired
-- 'order_placement' process type (process_types.id=4, prefix 'ADV/BKNG',
-- padding 5) — same process type this migration's workflow phase repointed
-- at `bookings`. This just adds the columns to store it.
--
-- Discount is pulled in from the `participants` feature (which already has
-- a `discount` INT column) — bookings gets its own copy so it's editable
-- directly on the booking form instead of via a separate Participant record.
-- ------------------------------------------------------------

ALTER TABLE `bookings`
  ADD COLUMN `file_no` VARCHAR(250) NULL DEFAULT NULL AFTER `id`,
  ADD COLUMN `discount` INT NULL DEFAULT 0 AFTER `no_of_kids`;
