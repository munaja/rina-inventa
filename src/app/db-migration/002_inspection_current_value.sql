-- One-shot migration for existing installs.
-- Brings an existing database in line with schema.sql after:
--   * inspection.date becomes DATE NOT NULL with a UNIQUE key
--   * toolMachineInspection gains a currentValue column
--   * roomInspection materialized-stats table is introduced

ALTER TABLE inspection
  MODIFY COLUMN date DATE NOT NULL,
  ADD UNIQUE KEY uniq_inspection_date (date);

ALTER TABLE toolMachineInspection
  ADD COLUMN currentValue VARCHAR(50) NULL AFTER acquisitionValue;

CREATE TABLE IF NOT EXISTS roomInspection (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  inspection_id INT UNSIGNED NOT NULL,
  room_id INT UNSIGNED NOT NULL,
  totalItem INT UNSIGNED NOT NULL DEFAULT 0,
  totalValue BIGINT UNSIGNED NOT NULL DEFAULT 0,
  stats JSON NULL,
  UNIQUE KEY uniq_inspection_room (inspection_id, room_id),
  FOREIGN KEY (inspection_id) REFERENCES inspection(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES room(id) ON DELETE CASCADE
);
