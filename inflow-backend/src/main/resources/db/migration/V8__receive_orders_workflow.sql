ALTER TABLE purchase_invoices
    ADD COLUMN receipt_status VARCHAR(40) NOT NULL DEFAULT 'PENDING_RECEIPT',
    ADD COLUMN received_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN received_by_user_id INTEGER REFERENCES users(id),
    ADD COLUMN receiving_notes TEXT;

ALTER TABLE purchase_invoices_products
    ADD COLUMN received_quantity INTEGER NOT NULL DEFAULT 0 CHECK (received_quantity >= 0),
    ADD COLUMN damaged_quantity INTEGER NOT NULL DEFAULT 0 CHECK (damaged_quantity >= 0),
    ADD COLUMN item_receiving_notes TEXT;

-- Existing purchase invoices were created under the old "create-adds-stock" behaviour.
-- Treat them as already received so the new workflow does not double-count stock.
UPDATE purchase_invoices_products SET received_quantity = amount WHERE received_quantity = 0;
UPDATE purchase_invoices SET receipt_status = 'RECEIVED', received_at = created_at, received_by_user_id = user_id
WHERE receipt_status = 'PENDING_RECEIPT';

CREATE INDEX idx_purchase_invoices_receipt_status ON purchase_invoices(receipt_status);
CREATE INDEX idx_purchase_invoices_supplier ON purchase_invoices(supplier_id);
CREATE INDEX idx_purchase_invoices_warehouse ON purchase_invoices(warehouse_id);
