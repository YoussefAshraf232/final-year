-- Product master-data fields used by the Manage Products feature.
ALTER TABLE products
    ADD COLUMN sku VARCHAR(50),
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN cost_price DECIMAL(12, 2) CHECK (cost_price IS NULL OR cost_price >= 0),
    ADD COLUMN reorder_level INTEGER NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN deactivated_at TIMESTAMP WITH TIME ZONE;

UPDATE products SET sku = 'PROD-' || LPAD(id::text, 6, '0') WHERE sku IS NULL;
ALTER TABLE products ALTER COLUMN sku SET NOT NULL;
ALTER TABLE products ADD CONSTRAINT uq_products_sku UNIQUE (sku);
ALTER TABLE products ADD CONSTRAINT chk_products_status
    CHECK (status IN ('ACTIVE','INACTIVE','DISCONTINUED'));

CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_supplier ON products(supplier_id);

-- Supplier master-data fields used by the Manage Suppliers feature.
ALTER TABLE suppliers
    ADD COLUMN email VARCHAR(255),
    ADD COLUMN contact_person VARCHAR(100),
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN notes TEXT,
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN deactivated_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE suppliers ADD CONSTRAINT chk_suppliers_status
    CHECK (status IN ('ACTIVE','INACTIVE'));

CREATE INDEX idx_suppliers_status ON suppliers(status);
