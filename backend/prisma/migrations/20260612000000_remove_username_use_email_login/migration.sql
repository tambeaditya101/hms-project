-- Drop the globally unique index on email (was @unique)
-- The composite unique @@unique([email, tenantId]) remains intact
DROP INDEX IF EXISTS "User_email_key";

-- Drop the username column
ALTER TABLE "User" DROP COLUMN IF EXISTS "username";

-- Drop the globally unique index on username (was @unique)
DROP INDEX IF EXISTS "User_username_key";
