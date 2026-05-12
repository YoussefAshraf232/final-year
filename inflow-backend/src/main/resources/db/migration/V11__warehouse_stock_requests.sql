CREATE TABLE warehouse_stock_requests(
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) NOT NULL,
    source_warehouse_id INTEGER REFERENCES warehouses(id) NOT NULL,
    destination_warehouse_id INTEGER REFERENCES warehouses(id) NOT NULL,
    requested_quantity INTEGER NOT NULL CHECK (requested_quantity > 0),
    approved_quantity INTEGER CHECK (approved_quantity IS NULL OR approved_quantity > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reason VARCHAR(120) NOT NULL,
    notes TEXT,
    requester_user_id INTEGER REFERENCES users(id) NOT NULL,
    reviewer_user_id INTEGER REFERENCES users(id),
    reviewer_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    CHECK (source_warehouse_id <> destination_warehouse_id),
    CHECK (approved_quantity IS NULL OR approved_quantity <= requested_quantity)
);

CREATE INDEX idx_warehouse_stock_requests_status ON warehouse_stock_requests(status);
CREATE INDEX idx_warehouse_stock_requests_source ON warehouse_stock_requests(source_warehouse_id);
CREATE INDEX idx_warehouse_stock_requests_destination ON warehouse_stock_requests(destination_warehouse_id);
CREATE INDEX idx_warehouse_stock_requests_requester ON warehouse_stock_requests(requester_user_id);
CREATE INDEX idx_warehouse_stock_requests_created ON warehouse_stock_requests(created_at);

INSERT INTO users(username, f_name, l_name, phone_number, email, password_hash, user_role)
SELECT username, first_name, last_name, phone_number, email, password_hash, r.id
FROM (
    VALUES
        ('cairo_manager', 'Cairo', 'Manager', '0100000101', 'cairo.manager@inflow.local', '$2b$10$0ewlxxOSg1RX4.3hi0L2xOOIFQk6f1k9kK5WNNmyUk4oplLT5/o72'),
        ('alex_manager', 'Alexandria', 'Manager', '0100000102', 'alex.manager@inflow.local', '$2b$10$0ewlxxOSg1RX4.3hi0L2xOOIFQk6f1k9kK5WNNmyUk4oplLT5/o72')
) AS v(username, first_name, last_name, phone_number, email, password_hash)
JOIN roles r ON r.name = 'WAREHOUSE_MANAGER'
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.username = v.username);

INSERT INTO users_warehouses (user_id, warehouse_id)
SELECT u.id, w.id
FROM users u
JOIN warehouses w ON w.address = 'Cairo Central Warehouse'
WHERE u.username = 'cairo_manager'
ON CONFLICT DO NOTHING;

INSERT INTO users_warehouses (user_id, warehouse_id)
SELECT u.id, w.id
FROM users u
JOIN warehouses w ON w.address = 'Alexandria Hub Warehouse'
WHERE u.username = 'alex_manager'
ON CONFLICT DO NOTHING;
