ALTER TABLE sales_invoices
    ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'PAID',
    ADD COLUMN payment_method VARCHAR(60),
    ADD COLUMN paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
    ADD COLUMN balance_due DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (balance_due >= 0),
    ADD COLUMN notes TEXT,
    ADD COLUMN voided_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN voided_by_user_id INTEGER REFERENCES users(id);

ALTER TABLE return_sales_invoices
    ADD COLUMN return_status VARCHAR(40) NOT NULL DEFAULT 'PENDING_REVIEW',
    ADD COLUMN restock_status VARCHAR(40) NOT NULL DEFAULT 'PENDING_RESTOCK',
    ADD COLUMN refund_status VARCHAR(40) NOT NULL DEFAULT 'PENDING_REFUND',
    ADD COLUMN refund_method VARCHAR(60),
    ADD COLUMN notes TEXT,
    ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN approved_by_user_id INTEGER REFERENCES users(id),
    ADD COLUMN refunded_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN restocked_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE return_sales_invoices_products
    ADD COLUMN condition VARCHAR(40) NOT NULL DEFAULT 'NEEDS_INSPECTION',
    ADD COLUMN restock_decision VARCHAR(40) NOT NULL DEFAULT 'PENDING_REVIEW',
    ADD COLUMN restocked_quantity INTEGER NOT NULL DEFAULT 0 CHECK (restocked_quantity >= 0);
