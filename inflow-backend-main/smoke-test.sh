#!/bin/bash

BASE=http://localhost:9090
PASS=0
FAIL=0

check() {
    if [ "\$1" = "\$2" ]; then
        echo "  PASS  \$3 (\$2)"
        PASS=$((PASS+1))
    else
        echo "  FAIL  \$3  expected=\$1 actual=\$2"
        FAIL=$((FAIL+1))
    fi
}

echo ""
echo "=== Master Data Reads ==="
S=$(curl -s -o /dev/null -w "%{http_code}" $BASE/roles);          check 200 "$S" "GET /roles"
S=$(curl -s -o /dev/null -w "%{http_code}" $BASE/roles/1);        check 200 "$S" "GET /roles/1"
S=$(curl -s -o /dev/null -w "%{http_code}" $BASE/roles/9999);     check 404 "$S" "GET /roles/9999"
S=$(curl -s -o /dev/null -w "%{http_code}" $BASE/categories);     check 200 "$S" "GET /categories"
S=$(curl -s -o /dev/null -w "%{http_code}" $BASE/suppliers);      check 200 "$S" "GET /suppliers"
S=$(curl -s -o /dev/null -w "%{http_code}" $BASE/customers);      check 200 "$S" "GET /customers"
S=$(curl -s -o /dev/null -w "%{http_code}" $BASE/warehouses);     check 200 "$S" "GET /warehouses"
S=$(curl -s -o /dev/null -w "%{http_code}" $BASE/users);          check 200 "$S" "GET /users"
S=$(curl -s -o /dev/null -w "%{http_code}" $BASE/products);       check 200 "$S" "GET /products"
S=$(curl -s -o /dev/null -w "%{http_code}" $BASE/user-warehouses);    check 200 "$S" "GET /user-warehouses"
S=$(curl -s -o /dev/null -w "%{http_code}" $BASE/product-warehouses); check 200 "$S" "GET /product-warehouses"
S=$(curl -s -o /dev/null -w "%{http_code}" $BASE/product-warehouses/1/1); check 200 "$S" "GET /product-warehouses/1/1"

echo ""
echo "=== Invoice Reads ==="
S=$(curl -s -o /dev/null -w "%{http_code}" $BASE/purchase-invoices);        check 200 "$S" "GET /purchase-invoices"
S=$(curl -s -o /dev/null -w "%{http_code}" $BASE/sales-invoices);           check 200 "$S" "GET /sales-invoices"
S=$(curl -s -o /dev/null -w "%{http_code}" $BASE/internal-invoices);        check 200 "$S" "GET /internal-invoices"
S=$(curl -s -o /dev/null -w "%{http_code}" $BASE/return-sales-invoices);    check 200 "$S" "GET /return-sales-invoices"
S=$(curl -s -o /dev/null -w "%{http_code}" $BASE/return-purchase-invoices); check 200 "$S" "GET /return-purchase-invoices"

echo ""
echo "=== Validation Errors ==="
S=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/roles -H "Content-Type: application/json" -d '{"name":""}'); check 400 "$S" "POST /roles empty name"
S=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/roles -H "Content-Type: application/json" -d '{}');           check 400 "$S" "POST /roles missing name"

echo ""
echo "=== Create + Duplicate ==="
SUFFIX=$$
S=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/roles -H "Content-Type: application/json" -d "{\"name\":\"R_$SUFFIX\"}"); check 201 "$S" "POST /roles create"
S=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/roles -H "Content-Type: application/json" -d "{\"name\":\"R_$SUFFIX\"}"); check 409 "$S" "POST /roles duplicate"

echo ""
echo "=== Purchase Invoice (stock IN) ==="
S=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/purchase-invoices \
    -H "Content-Type: application/json" -H "X-User-Id: 1" \
    -d '{"supplierId":1,"warehouseId":1,"items":[{"productId":1,"amount":5,"price":50.00}]}')
check 201 "$S" "POST /purchase-invoices"

echo ""
echo "=== Sales Invoice (stock OUT + check) ==="
S=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/sales-invoices \
    -H "Content-Type: application/json" -H "X-User-Id: 1" \
    -d '{"customerId":1,"warehouseId":1,"items":[{"productId":1,"amount":1,"sellingPrice":100.00}]}')
check 201 "$S" "POST /sales-invoices basic"

S=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/sales-invoices \
    -H "Content-Type: application/json" -H "X-User-Id: 1" \
    -d '{"customerId":1,"warehouseId":1,"items":[{"productId":1,"amount":99999,"sellingPrice":100.00}]}')
check 409 "$S" "POST /sales-invoices insufficient stock"

echo ""
echo "=== Internal Invoice (business rule) ==="
S=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/internal-invoices \
    -H "Content-Type: application/json" -H "X-User-Id: 1" \
    -d '{"sourceWarehouseId":1,"destinationWarehouseId":2,"items":[{"productId":1,"amount":1}]}')
check 201 "$S" "POST /internal-invoices valid"

S=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/internal-invoices \
    -H "Content-Type: application/json" -H "X-User-Id: 1" \
    -d '{"sourceWarehouseId":1,"destinationWarehouseId":1,"items":[{"productId":1,"amount":1}]}')
check 400 "$S" "POST /internal-invoices same warehouse"

echo ""
echo "==========================================="
echo "  PASSED: $PASS    FAILED: $FAIL"
echo "==========================================="
