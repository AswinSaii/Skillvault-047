-- Seed the super admin user (Note: Password hashing is handled by Supabase Auth)
-- This script provides the instructions for manual seeding or via Supabase Admin API
-- Since I cannot directly create auth users via SQL without administrative extensions, 
-- I will implement the logic in the AuthContext to handle the first login for the superadmin account.

INSERT INTO colleges (name, location, verified) 
VALUES ('Global University', 'Global', true)
ON CONFLICT DO NOTHING;
