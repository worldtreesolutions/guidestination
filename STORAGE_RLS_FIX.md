# Supabase Storage RLS Policy Fix

## Issue Identified ✅
Your `registration-documents` and `media` buckets exist in Supabase, but uploads are failing due to **Row Level Security (RLS) policies** blocking access.

**Error**: `new row violates row-level security policy`

**Root Cause**: The partner registration form uploads documents BEFORE creating the user account, so the user is still anonymous when uploading. The RLS policies need to allow anonymous uploads during registration.

## Solution: Configure Storage Policies

### Step 1: Access Supabase Dashboard
1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Policies**
3. Look for the **storage** schema

### Step 2: Create Storage Policies

You need to create policies for the `storage.objects` table. Here are the required policies:

#### Policy 1: Allow anonymous uploads to registration-documents (for registration process)
```sql
-- Allow anonymous users to upload during partner registration
CREATE POLICY "Allow anonymous uploads to registration-documents" 
ON storage.objects 
FOR INSERT 
TO anon 
WITH CHECK (bucket_id = 'registration-documents');
```

#### Policy 2: Allow authenticated users to upload to registration-documents
```sql
-- Allow authenticated users to upload to registration-documents bucket
CREATE POLICY "Allow authenticated uploads to registration-documents" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'registration-documents');
```

#### Policy 3: Allow authenticated users to view files in registration-documents
```sql
-- Allow authenticated users to view files in registration-documents
CREATE POLICY "Allow authenticated users to view files in registration-documents" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (bucket_id = 'registration-documents');
```

#### Policy 3: Allow public uploads to media bucket (if needed)
```sql
-- Allow authenticated users to upload to media bucket
CREATE POLICY "Allow authenticated uploads to media" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'media');
```

#### Policy 4: Allow public access to media files
```sql
-- Allow public access to media files
CREATE POLICY "Allow public access to media" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'media');
```

### Step 3: Alternative - Disable RLS (Less Secure)

If you want to temporarily disable RLS for testing:

1. Go to **Table Editor** → **storage** → **objects**
2. Click on the table settings
3. Disable **Enable Row Level Security (RLS)**

⚠️ **Warning**: This makes all storage publicly accessible. Only use for testing.

### Step 4: Test After Policy Creation

After creating the policies, test the upload:
```
POST http://localhost:3002/api/debug/test-upload
```

This should return `"success": true` if the policies are working.

## Quick Fix Commands

If you have SQL access, run these commands in the Supabase SQL Editor:

```sql
-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for registration-documents bucket
-- Policy 1: Allow anonymous uploads during registration
CREATE POLICY "anonymous_uploads_registration_documents" 
ON storage.objects 
FOR INSERT 
TO anon 
WITH CHECK (bucket_id = 'registration-documents');

-- Policy 2: Allow authenticated uploads
CREATE POLICY "authenticated_uploads_registration_documents" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'registration-documents');

-- Policy 3: Allow authenticated users to view files
CREATE POLICY "authenticated_select_registration_documents" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (bucket_id = 'registration-documents');

-- Create policies for media bucket
CREATE POLICY "authenticated_uploads_media" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'media');

CREATE POLICY "public_select_media" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'media');

-- IMPORTANT: Create policies for partner_registrations table
-- Allow anonymous users to create partner registrations
CREATE POLICY "anonymous_insert_partner_registrations" 
ON partner_registrations 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Allow authenticated users to view and update their own registrations
CREATE POLICY "authenticated_select_own_partner_registrations" 
ON partner_registrations 
FOR SELECT 
TO authenticated 
USING (id = auth.uid());

CREATE POLICY "authenticated_update_own_partner_registrations" 
ON partner_registrations 
FOR UPDATE 
TO authenticated 
USING (id = auth.uid());
```

## Next Steps

1. Create the RLS policies above
2. Test upload: `POST http://localhost:3002/api/debug/test-upload`
3. If successful, test partner registration form
4. Create the `profiles` bucket if needed

The partner registration form will work once these policies are in place!
