CREATE TABLE roles(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE categories(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    f_name VARCHAR(30),
    l_name VARCHAR(30),
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_role INTEGER REFERENCES roles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE suppliers(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(200)
);

CREATE TABLE products(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    picture_url TEXT,
    current_price DECIMAL(12, 2) NOT NULL CHECK (current_price >= 0),
    supplier_id INTEGER REFERENCES suppliers(id)
);

CREATE TABLE warehouses(
    id SERIAL PRIMARY KEY,
    address VARCHAR(255) NOT NULL UNIQUE,
    is_central BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(200)
);

CREATE TABLE sales_invoices(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    customer_id INTEGER REFERENCES customers(id) NOT NULL,
    warehouse_id INTEGER REFERENCES warehouses(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_price DECIMAL(12, 2) NOT NULL CHECK (total_price >= 0),
    discount DECIMAL (12, 2) DEFAULT 0.00 CHECK (discount >= 0)
);

CREATE TABLE return_sales_invoices(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    sales_invoice_id INTEGER REFERENCES sales_invoices(id),
    customer_id INTEGER REFERENCES customers(id) NOT NULL,
    warehouse_id INTEGER REFERENCES warehouses(id) NOT NULL,
    returned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_price DECIMAL(12, 2) NOT NULL CHECK (total_price >= 0),
    reason TEXT
);

CREATE TABLE purchase_invoices(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    supplier_id INTEGER REFERENCES suppliers(id) NOT NULL,
    warehouse_id INTEGER REFERENCES warehouses(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_price DECIMAL(12, 2) NOT NULL CHECK (total_price >= 0)
);

CREATE TABLE return_purchase_invoices(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    purchase_invoice_id INTEGER REFERENCES purchase_invoices(id),
    supplier_id INTEGER REFERENCES suppliers(id) NOT NULL,
    warehouse_id INTEGER REFERENCES warehouses(id) NOT NULL,
    returned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_price DECIMAL(12, 2) NOT NULL CHECK (total_price >= 0),
    reason TEXT
);

CREATE TABLE internal_invoices(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    source_warehouse_id INTEGER REFERENCES warehouses(id) NOT NULL,
    destination_warehouse_id INTEGER REFERENCES warehouses(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (source_warehouse_id <> destination_warehouse_id)
);

CREATE TABLE sales_invoices_products(
    sales_invoice_id INTEGER REFERENCES sales_invoices(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    amount INTEGER NOT NULL CHECK (amount > 0),
    selling_price DECIMAL(12, 2) NOT NULL CHECK (selling_price >= 0),
    PRIMARY KEY (sales_invoice_id, product_id)
);

CREATE TABLE purchase_invoices_products(
    purchase_invoice_id INTEGER REFERENCES purchase_invoices(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    amount INTEGER NOT NULL CHECK (amount > 0),
    price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
    PRIMARY KEY (purchase_invoice_id, product_id)
);

CREATE TABLE internal_invoices_products(
    internal_invoice_id INTEGER REFERENCES internal_invoices(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    amount INTEGER NOT NULL CHECK (amount > 0),
    PRIMARY KEY (internal_invoice_id, product_id)
);

CREATE TABLE return_sales_invoices_products(
    return_sales_invoice_id INTEGER REFERENCES return_sales_invoices(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    price_at_return DECIMAL(12,2) NOT NULL CHECK (price_at_return >= 0),
    amount INTEGER NOT NULL CHECK (amount > 0),
    PRIMARY KEY (return_sales_invoice_id, product_id)
);

CREATE TABLE return_purchase_invoices_products(
    return_purchase_invoice_id INTEGER REFERENCES return_purchase_invoices(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    price_at_return DECIMAL(12,2) NOT NULL CHECK (price_at_return >= 0),
    amount INTEGER NOT NULL CHECK (amount > 0),
    PRIMARY KEY (return_purchase_invoice_id, product_id)
);

CREATE TABLE categories_products(
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (category_id, product_id)
);

CREATE TABLE users_warehouses(
    user_id INTEGER REFERENCES users(id),
    warehouse_id INTEGER REFERENCES warehouses(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (user_id, warehouse_id, assigned_at),
    CHECK (left_at IS NULL OR left_at >= assigned_at)
);

CREATE TABLE products_warehouses(
    product_id INTEGER REFERENCES products(id),
    warehouse_id INTEGER REFERENCES warehouses(id),
    amount INTEGER NOT NULL CHECK (amount >= 0),
    PRIMARY KEY (product_id, warehouse_id)
);
