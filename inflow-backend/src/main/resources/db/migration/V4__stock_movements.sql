CREATE TABLE stock_movements(
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) NOT NULL,
    warehouse_id INTEGER REFERENCES warehouses(id) NOT NULL,
    movement_type VARCHAR(40) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(12, 2),
    total_value DECIMAL(12, 2),
    reference_type VARCHAR(80),
    reference_id INTEGER,
    note TEXT,
    actor_user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_warehouse ON stock_movements(warehouse_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at);
