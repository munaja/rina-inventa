-- Migration: add UNIQUE constraint on `code` columns and add `room.code`.
-- Apply to databases created before this change.
--
-- IMPORTANT: each ADD UNIQUE below will fail if duplicate values already
-- exist in the column. Run this query first to detect duplicates per table:
--
--   SELECT code, COUNT(*) c FROM <table> WHERE code IS NOT NULL
--     GROUP BY code HAVING c > 1;
--
-- Resolve duplicates (UPDATE or DELETE) before running the ALTERs.

ALTER TABLE toolSoftware   ADD UNIQUE KEY uniq_toolSoftware_code   (code);
ALTER TABLE road           ADD UNIQUE KEY uniq_road_code           (code);
ALTER TABLE permanentAsset ADD UNIQUE KEY uniq_permanentAsset_code (code);
ALTER TABLE construction   ADD UNIQUE KEY uniq_construction_code   (code);
ALTER TABLE otherAsset     ADD UNIQUE KEY uniq_otherAsset_code     (code);
ALTER TABLE extraAsset     ADD UNIQUE KEY uniq_extraAsset_code     (code);

ALTER TABLE room
  ADD COLUMN code VARCHAR(100) NULL AFTER id,
  ADD UNIQUE KEY uniq_room_code (code);
