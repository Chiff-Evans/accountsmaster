-- ============================================================
-- Members: gender becomes a value of the "Genders" parameter
-- (text_id 'genders') instead of a hardcoded enum, like position_id.
-- Requires the Genders parameter to exist. Not idempotent — run once.
-- ============================================================

ALTER TABLE `members`
  ADD COLUMN `gender_id` INT DEFAULT NULL AFTER `gender`,
  ADD KEY `FK_members_gender` (`gender_id`),
  ADD CONSTRAINT `FK_members_gender` FOREIGN KEY (`gender_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL;

-- carry existing enum values over by name ('Other' matches 'Other'/'Others')
UPDATE `members` m
JOIN `parameters` p        ON p.text_id = 'genders'
JOIN `parameter_values` pv ON pv.parameter_id = p.id
  AND (pv.paramater_value = m.gender OR (m.gender = 'Other' AND pv.paramater_value = 'Others'))
SET m.gender_id = pv.id;

ALTER TABLE `members` DROP COLUMN `gender`;
