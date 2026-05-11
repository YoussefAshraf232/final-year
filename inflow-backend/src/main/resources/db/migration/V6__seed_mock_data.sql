-- Mock data seed (non-user records). Keeps the seeded system admin only.

-- Categories
INSERT INTO categories (name)
SELECT name
FROM (VALUES ('Electronics'), ('Office Supplies')) AS v(name)
WHERE NOT EXISTS (
  SELECT 1 FROM categories c WHERE c.name = v.name
);

-- Suppliers
INSERT INTO suppliers (name, phone, address)
SELECT name, phone, address
FROM (
  VALUES
    ('Nile Supplies', '0100000001', 'Cairo Industrial Zone'),
    ('Delta Distribution', '0100000002', 'Alex Logistics Park')
) AS v(name, phone, address)
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers s WHERE s.name = v.name
);

-- Products
INSERT INTO products (name, description, picture_url, current_price, supplier_id)
SELECT
  'Barcode Scanner',
  'Handheld barcode scanner for inventory checks.',
  NULL,
  120.00,
  (SELECT id FROM suppliers WHERE name = 'Nile Supplies')
WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.name = 'Barcode Scanner');

INSERT INTO products (name, description, picture_url, current_price, supplier_id)
SELECT
  'Thermal Paper Rolls',
  'Receipt paper rolls for POS printers.',
  NULL,
  15.50,
  (SELECT id FROM suppliers WHERE name = 'Delta Distribution')
WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.name = 'Thermal Paper Rolls');

-- Warehouses
INSERT INTO warehouses (address, is_central)
SELECT address, is_central
FROM (
  VALUES
    ('Cairo Central Warehouse', TRUE),
    ('Alexandria Hub Warehouse', FALSE)
) AS v(address, is_central)
WHERE NOT EXISTS (
  SELECT 1 FROM warehouses w WHERE w.address = v.address
);

-- Customers
INSERT INTO customers (name, phone, address)
SELECT name, phone, address
FROM (
  VALUES
    ('Blue Horizon Co', '0111111111', 'Giza Business Center'),
    ('Sunrise Retail', '0111111112', 'Alex Retail Park')
) AS v(name, phone, address)
WHERE NOT EXISTS (
  SELECT 1 FROM customers c WHERE c.name = v.name
);

-- Assign admin to warehouses
INSERT INTO users_warehouses (user_id, warehouse_id)
SELECT u.id, w.id
FROM users u
JOIN warehouses w ON w.address IN ('Cairo Central Warehouse', 'Alexandria Hub Warehouse')
WHERE u.username = 'admin'
ON CONFLICT DO NOTHING;

-- Product stock per warehouse
INSERT INTO products_warehouses (product_id, warehouse_id, amount)
SELECT p.id, w.id, 25
FROM products p
JOIN warehouses w ON w.address = 'Cairo Central Warehouse'
WHERE p.name = 'Barcode Scanner'
ON CONFLICT DO NOTHING;

INSERT INTO products_warehouses (product_id, warehouse_id, amount)
SELECT p.id, w.id, 200
FROM products p
JOIN warehouses w ON w.address = 'Cairo Central Warehouse'
WHERE p.name = 'Thermal Paper Rolls'
ON CONFLICT DO NOTHING;

INSERT INTO products_warehouses (product_id, warehouse_id, amount)
SELECT p.id, w.id, 10
FROM products p
JOIN warehouses w ON w.address = 'Alexandria Hub Warehouse'
WHERE p.name = 'Barcode Scanner'
ON CONFLICT DO NOTHING;

INSERT INTO products_warehouses (product_id, warehouse_id, amount)
SELECT p.id, w.id, 120
FROM products p
JOIN warehouses w ON w.address = 'Alexandria Hub Warehouse'
WHERE p.name = 'Thermal Paper Rolls'
ON CONFLICT DO NOTHING;

-- Product categories
INSERT INTO categories_products (category_id, product_id)
SELECT c.id, p.id
FROM categories c
JOIN products p ON p.name = 'Barcode Scanner'
WHERE c.name = 'Electronics'
ON CONFLICT DO NOTHING;

INSERT INTO categories_products (category_id, product_id)
SELECT c.id, p.id
FROM categories c
JOIN products p ON p.name = 'Thermal Paper Rolls'
WHERE c.name = 'Office Supplies'
ON CONFLICT DO NOTHING;

-- Sales invoices
INSERT INTO sales_invoices (user_id, customer_id, warehouse_id, total_price, discount)
SELECT u.id, c.id, w.id, 120.00, 0.00
FROM users u
JOIN customers c ON c.name = 'Blue Horizon Co'
JOIN warehouses w ON w.address = 'Cairo Central Warehouse'
WHERE u.username = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM sales_invoices si
    WHERE si.user_id = u.id
      AND si.customer_id = c.id
      AND si.warehouse_id = w.id
      AND si.total_price = 120.00
  );

INSERT INTO sales_invoices (user_id, customer_id, warehouse_id, total_price, discount)
SELECT u.id, c.id, w.id, 155.00, 0.00
FROM users u
JOIN customers c ON c.name = 'Sunrise Retail'
JOIN warehouses w ON w.address = 'Alexandria Hub Warehouse'
WHERE u.username = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM sales_invoices si
    WHERE si.user_id = u.id
      AND si.customer_id = c.id
      AND si.warehouse_id = w.id
      AND si.total_price = 155.00
  );

-- Sales invoice items
INSERT INTO sales_invoices_products (sales_invoice_id, product_id, amount, selling_price)
SELECT si.id, p.id, 1, 120.00
FROM sales_invoices si
JOIN products p ON p.name = 'Barcode Scanner'
JOIN customers c ON c.id = si.customer_id
WHERE c.name = 'Blue Horizon Co'
ON CONFLICT DO NOTHING;

INSERT INTO sales_invoices_products (sales_invoice_id, product_id, amount, selling_price)
SELECT si.id, p.id, 10, 15.50
FROM sales_invoices si
JOIN products p ON p.name = 'Thermal Paper Rolls'
JOIN customers c ON c.id = si.customer_id
WHERE c.name = 'Sunrise Retail'
ON CONFLICT DO NOTHING;

-- Return sales invoices
INSERT INTO return_sales_invoices (user_id, sales_invoice_id, customer_id, warehouse_id, total_price, reason)
SELECT u.id, si.id, c.id, w.id, 120.00, 'Damaged on delivery'
FROM users u
JOIN sales_invoices si ON si.total_price = 120.00
JOIN customers c ON c.id = si.customer_id
JOIN warehouses w ON w.id = si.warehouse_id
WHERE u.username = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM return_sales_invoices rsi
    WHERE rsi.sales_invoice_id = si.id
  );

INSERT INTO return_sales_invoices (user_id, sales_invoice_id, customer_id, warehouse_id, total_price, reason)
SELECT u.id, si.id, c.id, w.id, 31.00, 'Overstock'
FROM users u
JOIN sales_invoices si ON si.total_price = 155.00
JOIN customers c ON c.id = si.customer_id
JOIN warehouses w ON w.id = si.warehouse_id
WHERE u.username = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM return_sales_invoices rsi
    WHERE rsi.sales_invoice_id = si.id
  );

-- Return sales invoice items
INSERT INTO return_sales_invoices_products (return_sales_invoice_id, product_id, price_at_return, amount)
SELECT rsi.id, p.id, 120.00, 1
FROM return_sales_invoices rsi
JOIN products p ON p.name = 'Barcode Scanner'
WHERE rsi.total_price = 120.00
ON CONFLICT DO NOTHING;

INSERT INTO return_sales_invoices_products (return_sales_invoice_id, product_id, price_at_return, amount)
SELECT rsi.id, p.id, 15.50, 2
FROM return_sales_invoices rsi
JOIN products p ON p.name = 'Thermal Paper Rolls'
WHERE rsi.total_price = 31.00
ON CONFLICT DO NOTHING;

-- Purchase invoices
INSERT INTO purchase_invoices (user_id, supplier_id, warehouse_id, total_price)
SELECT u.id, s.id, w.id, 600.00
FROM users u
JOIN suppliers s ON s.name = 'Nile Supplies'
JOIN warehouses w ON w.address = 'Cairo Central Warehouse'
WHERE u.username = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM purchase_invoices pi
    WHERE pi.user_id = u.id
      AND pi.supplier_id = s.id
      AND pi.warehouse_id = w.id
      AND pi.total_price = 600.00
  );

INSERT INTO purchase_invoices (user_id, supplier_id, warehouse_id, total_price)
SELECT u.id, s.id, w.id, 310.00
FROM users u
JOIN suppliers s ON s.name = 'Delta Distribution'
JOIN warehouses w ON w.address = 'Alexandria Hub Warehouse'
WHERE u.username = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM purchase_invoices pi
    WHERE pi.user_id = u.id
      AND pi.supplier_id = s.id
      AND pi.warehouse_id = w.id
      AND pi.total_price = 310.00
  );

-- Purchase invoice items
INSERT INTO purchase_invoices_products (purchase_invoice_id, product_id, amount, price)
SELECT pi.id, p.id, 5, 120.00
FROM purchase_invoices pi
JOIN products p ON p.name = 'Barcode Scanner'
WHERE pi.total_price = 600.00
ON CONFLICT DO NOTHING;

INSERT INTO purchase_invoices_products (purchase_invoice_id, product_id, amount, price)
SELECT pi.id, p.id, 20, 15.50
FROM purchase_invoices pi
JOIN products p ON p.name = 'Thermal Paper Rolls'
WHERE pi.total_price = 310.00
ON CONFLICT DO NOTHING;

-- Return purchase invoices
INSERT INTO return_purchase_invoices (user_id, purchase_invoice_id, supplier_id, warehouse_id, total_price, reason)
SELECT u.id, pi.id, s.id, w.id, 120.00, 'Damaged in transit'
FROM users u
JOIN purchase_invoices pi ON pi.total_price = 600.00
JOIN suppliers s ON s.id = pi.supplier_id
JOIN warehouses w ON w.id = pi.warehouse_id
WHERE u.username = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM return_purchase_invoices rpi
    WHERE rpi.purchase_invoice_id = pi.id
  );

INSERT INTO return_purchase_invoices (user_id, purchase_invoice_id, supplier_id, warehouse_id, total_price, reason)
SELECT u.id, pi.id, s.id, w.id, 31.00, 'Incorrect batch'
FROM users u
JOIN purchase_invoices pi ON pi.total_price = 310.00
JOIN suppliers s ON s.id = pi.supplier_id
JOIN warehouses w ON w.id = pi.warehouse_id
WHERE u.username = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM return_purchase_invoices rpi
    WHERE rpi.purchase_invoice_id = pi.id
  );

-- Return purchase invoice items
INSERT INTO return_purchase_invoices_products (return_purchase_invoice_id, product_id, price_at_return, amount)
SELECT rpi.id, p.id, 120.00, 1
FROM return_purchase_invoices rpi
JOIN products p ON p.name = 'Barcode Scanner'
WHERE rpi.total_price = 120.00
ON CONFLICT DO NOTHING;

INSERT INTO return_purchase_invoices_products (return_purchase_invoice_id, product_id, price_at_return, amount)
SELECT rpi.id, p.id, 15.50, 2
FROM return_purchase_invoices rpi
JOIN products p ON p.name = 'Thermal Paper Rolls'
WHERE rpi.total_price = 31.00
ON CONFLICT DO NOTHING;

-- Internal invoices
INSERT INTO internal_invoices (user_id, source_warehouse_id, destination_warehouse_id)
SELECT u.id, w1.id, w2.id
FROM users u
JOIN warehouses w1 ON w1.address = 'Cairo Central Warehouse'
JOIN warehouses w2 ON w2.address = 'Alexandria Hub Warehouse'
WHERE u.username = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM internal_invoices ii
    WHERE ii.source_warehouse_id = w1.id AND ii.destination_warehouse_id = w2.id
  );

INSERT INTO internal_invoices (user_id, source_warehouse_id, destination_warehouse_id)
SELECT u.id, w1.id, w2.id
FROM users u
JOIN warehouses w1 ON w1.address = 'Alexandria Hub Warehouse'
JOIN warehouses w2 ON w2.address = 'Cairo Central Warehouse'
WHERE u.username = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM internal_invoices ii
    WHERE ii.source_warehouse_id = w1.id AND ii.destination_warehouse_id = w2.id
  );

-- Internal invoice items
INSERT INTO internal_invoices_products (internal_invoice_id, product_id, amount)
SELECT ii.id, p.id, 2
FROM internal_invoices ii
JOIN products p ON p.name = 'Barcode Scanner'
WHERE ii.source_warehouse_id = (SELECT id FROM warehouses WHERE address = 'Cairo Central Warehouse')
ON CONFLICT DO NOTHING;

INSERT INTO internal_invoices_products (internal_invoice_id, product_id, amount)
SELECT ii.id, p.id, 20
FROM internal_invoices ii
JOIN products p ON p.name = 'Thermal Paper Rolls'
WHERE ii.source_warehouse_id = (SELECT id FROM warehouses WHERE address = 'Alexandria Hub Warehouse')
ON CONFLICT DO NOTHING;

-- Stock movements
INSERT INTO stock_movements (
  product_id,
  warehouse_id,
  movement_type,
  quantity,
  unit_cost,
  total_value,
  reference_type,
  reference_id,
  note,
  actor_user_id
)
SELECT
  p.id,
  w.id,
  'INBOUND',
  5,
  120.00,
  600.00,
  'PURCHASE_INVOICE',
  pi.id,
  'Initial stock',
  u.id
FROM products p
JOIN warehouses w ON w.address = 'Cairo Central Warehouse'
JOIN purchase_invoices pi ON pi.total_price = 600.00
JOIN users u ON u.username = 'admin'
WHERE p.name = 'Barcode Scanner'
  AND NOT EXISTS (
    SELECT 1 FROM stock_movements sm
    WHERE sm.reference_type = 'PURCHASE_INVOICE'
      AND sm.reference_id = pi.id
      AND sm.product_id = p.id
  );

INSERT INTO stock_movements (
  product_id,
  warehouse_id,
  movement_type,
  quantity,
  unit_cost,
  total_value,
  reference_type,
  reference_id,
  note,
  actor_user_id
)
SELECT
  p.id,
  w.id,
  'OUTBOUND',
  10,
  15.50,
  155.00,
  'SALES_INVOICE',
  si.id,
  'Order fulfillment',
  u.id
FROM products p
JOIN warehouses w ON w.address = 'Alexandria Hub Warehouse'
JOIN sales_invoices si ON si.total_price = 155.00
JOIN users u ON u.username = 'admin'
WHERE p.name = 'Thermal Paper Rolls'
  AND NOT EXISTS (
    SELECT 1 FROM stock_movements sm
    WHERE sm.reference_type = 'SALES_INVOICE'
      AND sm.reference_id = si.id
      AND sm.product_id = p.id
  );

-- Notifications
INSERT INTO notifications (user_id, type, title, body, related_entity_type, related_entity_id)
SELECT u.id, 'ALERT', 'Low stock', 'Barcode Scanner stock below threshold.', 'PRODUCT', p.id
FROM users u
JOIN products p ON p.name = 'Barcode Scanner'
WHERE u.username = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.user_id = u.id
      AND n.related_entity_type = 'PRODUCT'
      AND n.related_entity_id = p.id
  );

INSERT INTO notifications (user_id, type, title, body, related_entity_type, related_entity_id)
SELECT u.id, 'INFO', 'Invoice created', 'Sales invoice #2 created.', 'SALES_INVOICE', si.id
FROM users u
JOIN sales_invoices si ON si.total_price = 155.00
WHERE u.username = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.user_id = u.id
      AND n.related_entity_type = 'SALES_INVOICE'
      AND n.related_entity_id = si.id
  );

-- Audit logs
INSERT INTO audit_logs (
  actor_user_id,
  actor_username,
  action,
  entity_type,
  entity_id,
  request_path,
  http_method,
  ip,
  user_agent,
  metadata
)
SELECT
  u.id,
  u.username,
  'CREATE',
  'PRODUCT',
  p.id::text,
  '/products',
  'POST',
  '127.0.0.1',
  'seed',
  'mock data seed'
FROM users u
JOIN products p ON p.name = 'Barcode Scanner'
WHERE u.username = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM audit_logs al
    WHERE al.entity_type = 'PRODUCT'
      AND al.entity_id = p.id::text
  );

INSERT INTO audit_logs (
  actor_user_id,
  actor_username,
  action,
  entity_type,
  entity_id,
  request_path,
  http_method,
  ip,
  user_agent,
  metadata
)
SELECT
  u.id,
  u.username,
  'CREATE',
  'SALES_INVOICE',
  si.id::text,
  '/sales-invoices',
  'POST',
  '127.0.0.1',
  'seed',
  'mock data seed'
FROM users u
JOIN sales_invoices si ON si.total_price = 155.00
WHERE u.username = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM audit_logs al
    WHERE al.entity_type = 'SALES_INVOICE'
      AND al.entity_id = si.id::text
  );
