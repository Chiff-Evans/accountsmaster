USE salesmaster;

ALTER TABLE ref_numbering
  ADD COLUMN use_month TINYINT(1) NOT NULL DEFAULT 0 AFTER use_year;
