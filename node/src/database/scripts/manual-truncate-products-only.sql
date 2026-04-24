-- Manual use only (NOT run by npm migrate).
-- Deletes all products; inventory rows are removed by ON DELETE CASCADE.
--
-- psql "$DATABASE_URL" -f src/database/scripts/manual-truncate-products-only.sql
-- Or from psql: \i path/to/manual-truncate-products-only.sql

BEGIN;

TRUNCATE TABLE products RESTART IDENTITY CASCADE;

COMMIT;
