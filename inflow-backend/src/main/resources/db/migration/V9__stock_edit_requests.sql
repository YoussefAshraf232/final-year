CREATE TABLE stock_edit_requests(
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) NOT NULL,
    warehouse_id INTEGER REFERENCES warehouses(id) NOT NULL,
    current_quantity INTEGER NOT NULL CHECK (current_quantity >= 0),
    requested_quantity INTEGER NOT NULL CHECK (requested_quantity >= 0),
    difference_quantity INTEGER NOT NULL,
    reason VARCHAR(80) NOT NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    requested_by_user_id INTEGER REFERENCES users(id) NOT NULL,
    reviewed_by_user_id INTEGER REFERENCES users(id),
    review_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_stock_edit_requests_status ON stock_edit_requests(status);
CREATE INDEX idx_stock_edit_requests_product ON stock_edit_requests(product_id);
CREATE INDEX idx_stock_edit_requests_warehouse ON stock_edit_requests(warehouse_id);
CREATE INDEX idx_stock_edit_requests_requester ON stock_edit_requests(requested_by_user_id);
CREATE INDEX idx_stock_edit_requests_created ON stock_edit_requests(created_at);
