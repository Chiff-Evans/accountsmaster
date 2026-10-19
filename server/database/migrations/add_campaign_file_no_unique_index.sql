-- Matches the single-column UNIQUE KEY already on advertisers.advertiser_ref_no
-- and brand_ambassadors.brand_ambassador_ref_no (nullable, tolerates multiple
-- NULLs — needed now that campaign file_no assignment can be deferred).
ALTER TABLE campaigns ADD UNIQUE KEY campaign_file_no (file_no);
