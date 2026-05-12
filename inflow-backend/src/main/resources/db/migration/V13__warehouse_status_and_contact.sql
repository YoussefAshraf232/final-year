-- Add status, phone, notes, deactivated_at columns to warehouses.
ALTER TABLE warehouses
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN IF NOT EXISTS phone VARCHAR(40),
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE warehouses
    ADD CONSTRAINT warehouses_status_check CHECK (status IN ('ACTIVE', 'INACTIVE'));

CREATE INDEX IF NOT EXISTS idx_warehouses_status ON warehouses(status);
CREATE INDEX IF NOT EXISTS idx_warehouses_is_central ON warehouses(is_central);
