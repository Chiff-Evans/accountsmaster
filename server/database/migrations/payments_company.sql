-- ------------------------------------------------------------
-- Payments — pay towards a booking made for a group
--
-- Mirrors `bookings.company_id`: a payment can now be attributed to a
-- client's personal booking (company_id NULL) or to a specific group they
-- represent, so payments reconcile correctly against the right booking's
-- balance instead of being lumped into every booking that client+trip pair
-- has (personal and every group booking all shared one paid_amount total
-- before this).
-- ------------------------------------------------------------

ALTER TABLE `payments`
  ADD COLUMN `company_id` INT NULL DEFAULT NULL AFTER `client_id`,
  ADD INDEX `FK_payments_shops` (`company_id`),
  ADD CONSTRAINT `FK_payments_shops` FOREIGN KEY (`company_id`) REFERENCES `shops` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION;
