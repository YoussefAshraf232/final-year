-- Seed canonical roles. Names match the frontend FrontendRole enum
-- in src/constants/roles.ts. Do NOT remove or rename without coordinating
-- with the frontend role mapping.
INSERT INTO roles(name) VALUES ('SYSTEM_ADMIN')         ON CONFLICT (name) DO NOTHING;
INSERT INTO roles(name) VALUES ('OPERATIONAL_MANAGER')  ON CONFLICT (name) DO NOTHING;
INSERT INTO roles(name) VALUES ('WAREHOUSE_MANAGER')    ON CONFLICT (name) DO NOTHING;

-- Seed first admin so a fresh database is immediately usable.
-- Password is 'Admin@12345' (bcrypt cost 10).
-- ⚠ ROTATE THIS HASH BEFORE ANY DEPLOYMENT. Generate a new one with:
--     python3 -c "import bcrypt; print(bcrypt.hashpw(b'<password>', bcrypt.gensalt(rounds=12)).decode())"
INSERT INTO users(username, f_name, l_name, phone_number, email, password_hash, user_role)
SELECT 'admin',
       'System',
       'Admin',
       '0000000000',
       'admin@inflow.local',
       '$2b$10$0ewlxxOSg1RX4.3hi0L2xOOIFQk6f1k9kK5WNNmyUk4oplLT5/o72',
       r.id
FROM roles r
WHERE r.name = 'SYSTEM_ADMIN'
  AND NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');
