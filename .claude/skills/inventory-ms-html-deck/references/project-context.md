# Project context

## Product identity

The repository uses the names **Inflow**, **Inventory MS**, and **Inventory Management System**. Confirm the official defense title with the user, then use one primary name consistently. A safe subtitle is:

> Supply Chain and Inventory Management System

## Product purpose

The system centralizes warehouse and inventory operations, including master data, stock custody, invoice lifecycles, receiving, returns, transfers, approvals, reports, notifications, and auditability.

The project is more than a CRUD dashboard. The defense should emphasize controlled inventory movement, transaction state, role and warehouse access, and traceability.

## Technology stack

### Frontend

- Next.js App Router
- React
- TypeScript
- React Query
- Axios services
- React Hook Form and validation utilities
- Zustand for sidebar state
- Tailwind CSS
- Recharts
- Reusable cards, tables, modals, drawers, badges, pagination, loading, and error states

### Backend

- Java 21
- Spring Boot
- Spring MVC
- Spring Security
- JWT authentication
- Spring Data JPA / Hibernate
- Jakarta validation
- PostgreSQL
- Flyway migrations
- Maven
- Docker

### Deployment

- Frontend container
- Backend container
- PostgreSQL container
- Docker Compose orchestration

## Major frontend domains

- Authentication: login and registration
- Dashboard
- Products and categories
- Customers and suppliers
- Warehouses and staff
- Current stock and stock movements
- Stock edit requests
- Purchase invoices and receiving
- Sales invoices
- Sales returns
- Purchase returns
- Internal transfers
- Approval queue
- Reports
- Audit logs
- Users, roles, and profile
- Notifications

## Architectural pattern

Use this concrete flow in the architecture slides:

```text
Next.js page
  → feature component
  → React Query hook
  → API service
  → REST/JSON
  → Spring controller
  → business service
  → repository
  → PostgreSQL
```

Database evolution is migration-driven through Flyway. Do not describe `ddl-auto=update`.

## Security model

- Stateless JWT authentication
- BCrypt password hashing
- URL-level Spring Security rules
- Method-level role authorization
- Warehouse-level access checks for scoped operations
- CORS configuration
- Audit logging for sensitive operations

Explain that hiding a button in the frontend is not a security boundary. The backend remains authoritative.

## Roles visible in source

- `SYSTEM_ADMIN`
- `OPERATIONAL_MANAGER`
- `WAREHOUSE_MANAGER`

Verify any additional role before placing it in the deck.

## Key business workflows

### Purchase and receiving

A purchase can move through approval and receiving states. Receiving stock must increase warehouse inventory and preserve transaction traceability. Partial receiving may produce an intermediate state.

### Sales

A confirmed sales invoice removes stock. Voiding or compensating operations must restore stock only according to implemented business rules.

### Returns

Sales returns can involve review, approval/rejection, optional restocking, and refund/store-credit behavior. Purchase returns reduce stock and return goods to suppliers according to the implemented workflow.

### Transfers

Internal inventory movement must identify source and destination warehouses. Warehouse-scoped users should only access permitted warehouses. Some transfer/request flows require acceptance or rejection.

### Stock adjustments

Stock counts or edit requests should create movement history rather than silently mutating quantities.

### Auditability

Audit logs expose actor, action, entity, entity identifier, timestamp, and details. Use the audit screen as evidence of governance.

## Known point to verify before presenting

The public registration flow and seeded role names may not align perfectly. Do not claim a specific default registration role without checking the current branch and runtime behavior.

## Presentation emphasis

Professors should leave understanding:

1. The operational problem being solved.
2. How inventory movement is modeled.
3. Why the architecture is modular.
4. How permissions and warehouse scope are enforced.
5. How the system preserves data integrity and accountability.
6. What was implemented and demonstrated.
