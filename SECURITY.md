# Security Policy

## Reporting a Vulnerability

Email security@yourdomain.com. Do not open public issues for vulnerabilities.

## Known Frontend Constraints

- JWT is stored in `localStorage`. This is mitigated with stricter CSP headers. Migration to HttpOnly cookies should be coordinated with the backend.
- All authorization must be enforced server-side. Frontend role checks are UX only.

## Production Checklist

- [ ] `NEXT_PUBLIC_ENABLE_GUEST_MODE=false`
- [ ] `NEXT_PUBLIC_DEMO_MODE=false`
- [ ] CSP `connect-src` matches the production API
- [ ] Image domain allowlist is updated in `next.config.ts` and `validators.ts`
- [ ] HTTPS is enforced at the edge
- [ ] Backend enforces every role rule documented in `roles.ts`
- [ ] `npm audit --production` is clean

## Test Cases

1. Register payload with `role: "ADMIN"`: backend must coerce to `EMPLOYEE`.
2. Employee calls `DELETE /users/1` directly: backend must return `403`.
3. `localStorage.setItem('token', 'guest-token')`: backend must reject protected requests.
4. XSS payload in product name: frontend renders it as text only.
5. Break API URL: real users see an error state, not demo data.
