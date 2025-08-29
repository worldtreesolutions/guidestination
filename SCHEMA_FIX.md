# Database Schema Fix for Partner Registration

## Issue Identified
The code expects a `user_id` column in the `partner_registrations` table, but your current schema has the `id` column as the foreign key to `auth.users.id`.

## Solution: Update Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Add user_id column to partner_registrations table
ALTER TABLE partner_registrations 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_partner_registrations_user_id ON partner_registrations(user_id);

-- If you have existing data and want to migrate:
-- Update existing records to set user_id = id (if that's your current structure)
-- UPDATE partner_registrations SET user_id = id WHERE user_id IS NULL;
```

## Alternative: Update Code to Match Your Schema

If you prefer to keep your current schema where `id` is the foreign key, update the code:

### File: `src/services/partnerService.ts`
Change this part (around line 115):
```typescript
// FROM:
user_id: authData.user.id,

// TO:
id: authData.user.id,
```

And update the interface in the same file:
```typescript
// Remove user_id field from PartnerRegistration interface
export interface PartnerRegistration {
  id?: string  // This will be the foreign key to auth.users.id
  // user_id?: string  // Remove this line
  // ... rest of fields
}
```

## Recommended Approach
**Use Option 1** (add user_id column) because:
1. It matches the generated types
2. It's clearer that user_id is a foreign key
3. It follows common database design patterns
4. It won't break other parts of the codebase

## After Making the Change
Test the registration process to ensure both the user creation and rollback logic work properly.
