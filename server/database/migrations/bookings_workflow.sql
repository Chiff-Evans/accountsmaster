-- ------------------------------------------------------------
-- Bookings — workflow-based processing
--
-- The "Bookings Workflow" (workflows.id=1) and its stages/transitions
-- already exist (Submitted -> Reviewing -> Confirmed -> ... -> Completed,
-- with Cancel/Hold/Payment branches) — they were originally built for the
-- old `orders` table (process_types.id=4, process_type_name=
-- 'order_placement'). That screen has since been replaced by `bookings`,
-- so this migration repoints the same workflow/process-type at `bookings`
-- instead of building a new one, and gives `bookings` the workflow_id /
-- workflow_stage_id columns `orders` already had.
-- ------------------------------------------------------------

ALTER TABLE `bookings`
  ADD COLUMN `workflow_id` INT NULL DEFAULT NULL AFTER `cancel_requested`,
  ADD COLUMN `workflow_stage_id` INT NULL DEFAULT NULL AFTER `workflow_id`,
  ADD INDEX `FK_bookings_workflows` (`workflow_id`),
  ADD INDEX `FK_bookings_workflow_stages` (`workflow_stage_id`),
  ADD CONSTRAINT `FK_bookings_workflows` FOREIGN KEY (`workflow_id`) REFERENCES `workflows` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
  ADD CONSTRAINT `FK_bookings_workflow_stages` FOREIGN KEY (`workflow_stage_id`) REFERENCES `workflow_stages` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION;

-- Repoint the existing process type from the retired `orders` screen to `bookings`.
UPDATE `process_types` SET `data_table` = 'bookings' WHERE `id` = 4;

-- Backfill any bookings created before this migration (portal submissions
-- accepted prior to workflow support) into the workflow's initial stage.
UPDATE `bookings` b
JOIN `workflows` w ON w.process_type_id = 4 AND w.is_active = 1
JOIN `workflow_stages` ws ON ws.workflow_id = w.id AND ws.is_initial = 1
SET b.workflow_id = w.id, b.workflow_stage_id = ws.id
WHERE b.workflow_stage_id IS NULL;
