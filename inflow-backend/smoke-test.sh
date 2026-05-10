#!/bin/bash
# Smoke test against a running backend.
# Requirements: curl, jq.
# Backend must already have V1 + V2 Flyway migrations applied (admin user seeded).

set -uo pipefail

BASE=${BASE:-http://localhost:9090}
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@inflow.local}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-Admin@12345}
PASS=0
FAIL=0

check() {
    if [ "$1" = "$2" ]; then
        echo "  PASS  $3 ($2)"
        PASS=$((PASS+1))
    else
        echo "  FAIL  $3  expected=$1 actual=$2"
        FAIL=$((FAIL+1))
    fi
}

echo "=== Authenticate as seed admin ==="
TOKEN=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
  | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
    echo "  FAIL  could not log in as $ADMIN_EMAIL — abort"
    exit 1
fi
echo "  PASS  obtained JWT (length=${#TOKEN})"

AUTH=(-H "Authorization: Bearer $TOKEN")

echo ""
echo "=== Auth required ==="
S=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/users");                   check 401 "$S" "GET /users without token"
S=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/products");                check 401 "$S" "GET /products without token"

echo ""
echo "=== Master Data Reads (authenticated) ==="
S=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH[@]}" "$BASE/roles");          check 200 "$S" "GET /roles"
S=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH[@]}" "$BASE/roles/9999");     check 404 "$S" "GET /roles/9999"
S=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH[@]}" "$BASE/categories");     check 200 "$S" "GET /categories"
S=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH[@]}" "$BASE/suppliers");      check 200 "$S" "GET /suppliers"
S=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH[@]}" "$BASE/customers");      check 200 "$S" "GET /customers"
S=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH[@]}" "$BASE/warehouses");     check 200 "$S" "GET /warehouses"
S=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH[@]}" "$BASE/users");          check 200 "$S" "GET /users"
S=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH[@]}" "$BASE/products");       check 200 "$S" "GET /products"
S=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH[@]}" "$BASE/user-warehouses");    check 200 "$S" "GET /user-warehouses"
S=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH[@]}" "$BASE/product-warehouses"); check 200 "$S" "GET /product-warehouses"

echo ""
echo "=== Invoice Reads ==="
S=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH[@]}" "$BASE/purchase-invoices");        check 200 "$S" "GET /purchase-invoices"
S=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH[@]}" "$BASE/sales-invoices");           check 200 "$S" "GET /sales-invoices"
S=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH[@]}" "$BASE/internal-invoices");        check 200 "$S" "GET /internal-invoices"
S=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH[@]}" "$BASE/return-sales-invoices");    check 200 "$S" "GET /return-sales-invoices"
S=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH[@]}" "$BASE/return-purchase-invoices"); check 200 "$S" "GET /return-purchase-invoices"

echo ""
echo "=== Validation Errors ==="
S=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH[@]}" -X POST "$BASE/roles" -H "Content-Type: application/json" -d '{"name":""}'); check 400 "$S" "POST /roles empty name"
S=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH[@]}" -X POST "$BASE/roles" -H "Content-Type: application/json" -d '{}');           check 400 "$S" "POST /roles missing name"

echo ""
echo "=== Internal Invoice business rules ==="
S=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH[@]}" -X POST "$BASE/internal-invoices" \
    -H "Content-Type: application/json" \
    -d '{"sourceWarehouseId":1,"destinationWarehouseId":1,"items":[{"productId":1,"amount":1}]}')
check 400 "$S" "POST /internal-invoices same warehouse"

echo ""
echo "==========================================="
echo "  PASSED: $PASS    FAILED: $FAIL"
echo "==========================================="

[ "$FAIL" -eq 0 ]
