-- ------------------------------------------------------------
-- Loyalty Points — repoint at bookings, base points on amount paid
--
-- `loyalty_points.order_id` FK'd against the retired `orders` table (same
-- situation `order_items.item_id` was in before it got repointed at
-- `trips`) — repointed at `bookings` instead, column name kept as-is since
-- it's just a label at this point (matches the established convention for
-- every prior "keep the path, swap the entity" rename in this project).
-- `loyalty_points` is empty in production, so this is a clean repoint.
-- ------------------------------------------------------------

ALTER TABLE `loyalty_points` DROP FOREIGN KEY `fk_lp_order`;
ALTER TABLE `loyalty_points`
  ADD CONSTRAINT `fk_lp_order` FOREIGN KEY (`order_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;
