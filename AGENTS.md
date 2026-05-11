# AGENTS.md

## Project Overview

This is a full-stack inventory management system.

Project root:

```txt
C:\final-year

Main parts:

C:\final-year
├─ src/                 # Next.js frontend
├─ inflow-backend/      # Spring Boot backend
├─ package.json         # Frontend scripts
├─ next.config.ts       # Next.js config
├─ proxy.ts             # Middleware/proxy if present
└─ AGENTS.md            # Agent guide

Do not search the whole codebase first. Read this file, then inspect only the relevant folders.

Frontend

The frontend is a Next.js App Router project.

Frontend source:

src/

Important folders:

src/app/             # Routes and layouts
src/components/      # Reusable UI and feature components
src/hooks/           # React Query hooks and app hooks
src/services/        # API calls
src/types/           # TypeScript types
src/lib/             # Validators, formatters, helpers
src/constants/       # Routes, roles, sidebar links
src/context/         # Auth context
src/stores/          # Zustand stores

Frontend commands:

npm run dev
npm run build
npm run lint
npm run typecheck
npm run test

Frontend runs at:

http://localhost:3000
Frontend Routes

Routes are under:

src/app/

Auth routes:

src/app/(auth)/login/page.tsx
src/app/(auth)/register/page.tsx

Protected dashboard routes:

src/app/(dashboard)/dashboard/page.tsx
src/app/(dashboard)/products/page.tsx
src/app/(dashboard)/categories/page.tsx
src/app/(dashboard)/customers/page.tsx
src/app/(dashboard)/suppliers/page.tsx
src/app/(dashboard)/users/page.tsx
src/app/(dashboard)/warehouses/page.tsx
src/app/(dashboard)/stock/page.tsx
src/app/(dashboard)/stock/movements/page.tsx
src/app/(dashboard)/stock/request-edit/page.tsx
src/app/(dashboard)/reports/page.tsx
src/app/(dashboard)/audit-logs/page.tsx
src/app/(dashboard)/invoices/sales/page.tsx
src/app/(dashboard)/invoices/purchases/page.tsx
src/app/(dashboard)/invoices/returns/page.tsx
src/app/(dashboard)/invoices/purchase-returns/page.tsx
src/app/(dashboard)/invoices/transfers/page.tsx

Root page:

src/app/page.tsx

Root route redirects to:

/dashboard
Frontend Layouts

Check these for app-wide behavior:

src/app/layout.tsx
src/app/(auth)/layout.tsx
src/app/(dashboard)/layout.tsx

The dashboard layout handles authentication and protected pages.

Authentication

For authentication issues, check in this order:

src/context/AuthContext.tsx
src/hooks/useAuth.ts
src/app/(auth)/login/page.tsx
src/app/(dashboard)/layout.tsx
src/constants/roles.ts
src/constants/routes.ts
src/services/auth.service.ts
proxy.ts

Notes:

JWT is stored in localStorage.
Frontend role checks are for UI only.
Backend must enforce permissions.
If login acts strangely, clear browser localStorage/sessionStorage and log in again.
Frontend API Pattern

Most frontend features follow this structure:

page.tsx
  -> hook in src/hooks/
    -> service in src/services/
      -> backend API

Example for products:

src/app/(dashboard)/products/page.tsx
src/hooks/useProducts.ts
src/services/product.service.ts
src/types/product.types.ts

When fixing API behavior:

Check the page.
Check the hook.
Check the service.
Check the type file.
Then update the UI if needed.
Shared UI

Shared UI components are under:

src/components/ui/

Common UI components:

Button
Card
Input
Select
Table
Pagination
Badge
Modal
ConfirmDialog
ErrorState
LoadingState
DemoModeBanner

Layout components:

src/components/layout/Sidebar.tsx
src/components/layout/Topbar.tsx
src/components/layout/BreadCrumb.tsx

Feature components:

src/components/products/
src/components/customers/
src/components/suppliers/
src/components/users/
src/components/dashboard/
src/components/invoices/

Before creating a new component, check if a similar component already exists.

Backend

Backend folder:

C:\final-year\inflow-backend

Backend stack:

Java 21
Spring Boot
Maven
PostgreSQL
JPA / Hibernate
Flyway migrations

Backend commands:

cd inflow-backend
.\mvnw.cmd spring-boot:run
.\mvnw.cmd clean install
.\mvnw.cmd test

Backend runs at:

http://localhost:9090

Database local port:

5433

Local backend environment variables:

$env:INFLOW_DB_USERNAME="postgres"
$env:INFLOW_DB_PASSWORD="123456"
$env:INFLOW_JWT_SECRET="this-is-a-long-local-development-secret-123456"
Backend Structure

Backend package:

com.john.inflow

Important folders:

inflow-backend/src/main/java/com/john/inflow/controller
inflow-backend/src/main/java/com/john/inflow/service
inflow-backend/src/main/java/com/john/inflow/repository
inflow-backend/src/main/java/com/john/inflow/entity
inflow-backend/src/main/java/com/john/inflow/dto/request
inflow-backend/src/main/java/com/john/inflow/dto/response
inflow-backend/src/main/resources
inflow-backend/src/main/resources/db/migration

Backend investigation order:

Controller -> Service -> Repository -> Entity -> Migration

Do not put business logic in controllers. Put business logic in services.

Database Rules

Database migrations are handled by Flyway.

Migration folder:

inflow-backend/src/main/resources/db/migration

Rules:

Do not use generated schema changes as the final solution.
Add a new Flyway migration for schema changes.
Do not edit old migrations unless doing a local-only reset.
Use PostgreSQL-compatible SQL.
Feature Map
Dashboard

Frontend:

src/app/(dashboard)/dashboard/page.tsx
src/hooks/useDashboard.ts
src/services/dashboard.service.ts
src/components/dashboard/
Products

Frontend:

src/app/(dashboard)/products/page.tsx
src/components/products/
src/hooks/useProducts.ts
src/services/product.service.ts
src/types/product.types.ts

Backend:

ProductController
ProductService
ProductRepository
Product entity
CreateProductRequest
ProductResponse
Categories

Frontend:

src/app/(dashboard)/categories/page.tsx
src/hooks/useCategories.ts
src/services/category.service.ts
src/types/category.types.ts

Backend:

CategoryController
CategoryService
CategoryRepository
Category entity
Customers

Frontend:

src/app/(dashboard)/customers/page.tsx
src/components/customers/
src/hooks/useCustomers.ts
src/services/customer.service.ts
src/types/customer.types.ts

Backend:

CustomerController
CustomerService
CustomerRepository
Customer entity
Suppliers

Frontend:

src/app/(dashboard)/suppliers/page.tsx
src/components/suppliers/
src/hooks/useSuppliers.ts
src/services/supplier.service.ts
src/types/supplier.types.ts

Backend:

SupplierController
SupplierService
SupplierRepository
Supplier entity
Users and Roles

Frontend:

src/app/(dashboard)/users/page.tsx
src/components/users/
src/hooks/useUsers.ts
src/hooks/useRoles.ts
src/services/user.service.ts
src/services/role.service.ts
src/types/user.types.ts
src/constants/roles.ts

Backend:

UserController
RoleController
UserService
RoleService
UserRepository
RoleRepository
User entity
Role entity
CreateUserRequest
Warehouses

Frontend:

src/app/(dashboard)/warehouses/page.tsx
src/hooks/useWarehouses.ts
src/services/warehouse.service.ts
src/types/warehouse.types.ts

Backend:

WarehouseController
WarehouseService
WarehouseRepository
Warehouse entity
Stock

Frontend:

src/app/(dashboard)/stock/page.tsx
src/app/(dashboard)/stock/movements/page.tsx
src/app/(dashboard)/stock/request-edit/page.tsx
src/hooks/useStock.ts
src/types/inventory.types.ts

Backend:

StockController
InventoryController
StockService
InventoryService
ProductWarehouse-related entity/repository
StockMovement-related entity/repository
Invoices

Frontend:

src/app/(dashboard)/invoices/sales/page.tsx
src/app/(dashboard)/invoices/purchases/page.tsx
src/app/(dashboard)/invoices/returns/page.tsx
src/app/(dashboard)/invoices/purchase-returns/page.tsx
src/app/(dashboard)/invoices/transfers/page.tsx

Hooks:

src/hooks/useSalesInvoices.ts
src/hooks/usePurchaseInvoices.ts
src/hooks/useReturnInvoices.ts
src/hooks/useReturnPurchaseInvoices.ts
src/hooks/useInternalInvoices.ts
src/hooks/useInvoices.ts

Services:

src/services/sales-invoice.service.ts
src/services/purchase-invoice.service.ts
src/services/return-invoice.service.ts
src/services/return-purchase-invoice.service.ts
src/services/internal-invoice.service.ts

Backend DTOs:

CreateSalesInvoiceRequest
CreatePurchaseInvoiceRequest
CreateReturnSalesInvoiceRequest
CreateReturnPurchaseInvoiceRequest
CreateInternalInvoiceRequest
Reports

Frontend:

src/app/(dashboard)/reports/page.tsx
src/hooks/useReports.ts
src/services/report.service.ts
src/types/report.types.ts

Backend:

ReportController
ReportService

Report endpoints:

GET /reports/stock-on-hand
GET /reports/low-stock
GET /reports/stock-movements
GET /reports/sales-summary
GET /reports/purchase-summary
GET /reports/returns
GET /reports/product-performance
GET /reports/warehouse
GET /reports/supplier-performance
GET /reports/customer-purchase-history
Audit Logs

Frontend:

src/app/(dashboard)/audit-logs/page.tsx
src/hooks/useAuditLogs.ts
src/services/audit-log.service.ts
src/types/audit.types.ts

Backend:

AuditLogController
AuditLogService
AuditLogRepository
AuditLog entity
Task Instructions for Agent
When fixing a frontend page
Open the route file in src/app.
Check imported components.
Check the related hook in src/hooks.
Check the related service in src/services.
Check related types in src/types.
Make the smallest safe change.
When fixing backend behavior
Start with the controller.
Follow to the service.
Check repository methods.
Check entity mappings.
Check DTO request/response shapes.
Add Flyway migration only if schema changes are required.
When fixing authentication

Check:

src/context/AuthContext.tsx
src/hooks/useAuth.ts
src/app/(auth)/login/page.tsx
src/app/(dashboard)/layout.tsx
src/constants/roles.ts
proxy.ts
inflow-backend security/JWT files
When fixing 404 routes

Check:

src/app/
src/constants/routes.ts
src/constants/sidebar-links.ts
proxy.ts

A valid route must have a matching page.tsx.

When fixing Next.js build/type issues

Check:

next-env.d.ts
tsconfig.json
.next/

Do not edit .next/ manually.

If generated files are corrupted, run:

Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Force tsconfig.tsbuildinfo -ErrorAction SilentlyContinue
Remove-Item -Force next-env.d.ts -ErrorAction SilentlyContinue
npm run build
Folders to Avoid

Do not search or edit these unless explicitly asked:

node_modules/
.next/
target/
.git/
dist/
build/
.turbo/
.class files
.claude/worktrees/

The .claude/worktrees/ folder may contain duplicate copies. Do not treat it as the real source of truth.

Validation Checklist

Before saying work is done, run relevant checks.

Frontend:

npm run build

Backend:

cd inflow-backend
.\mvnw.cmd test

Full frontend check if needed:

npm run lint
npm run typecheck
npm run test
npm run build
Agent Rules
Read this file first.
Do not scan the whole codebase by default.
Start from the feature map above.
Prefer existing patterns over new structure.
Keep frontend API calls inside src/services.
Keep React Query logic inside src/hooks.
Keep reusable UI inside src/components.
Keep backend business logic inside services.
Keep database schema changes inside Flyway migrations.
Never commit secrets or .env values.
Never edit generated folders such as .next, target, or node_modules.