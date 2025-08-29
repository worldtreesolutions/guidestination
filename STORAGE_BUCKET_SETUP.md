# Storage Bucket Setup Guide

## Issue
The partner registration form is failing with "Upload Error: 1 document(s) failed to upload" because the required storage buckets don't exist in your Supabase project.

## Required Buckets

You need to create these 3 buckets in your Supabase dashboard:

### 1. registration-documents (PRIVATE)
- **Name**: `registration-documents`
- **Public**: ❌ **NO** (Private bucket for sensitive documents)
- **File size limit**: 15 MB
- **Allowed MIME types**: 
  - `application/pdf`
  - `image/jpeg`
  - `image/png`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### 2. activity-media (PUBLIC)
- **Name**: `activity-media`
- **Public**: ✅ **YES** (Public bucket for activity images/videos)
- **File size limit**: 50 MB
- **Allowed MIME types**:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `video/mp4`
  - `video/webm`

### 3. profiles (PUBLIC)
- **Name**: `profiles`
- **Public**: ✅ **YES** (Public bucket for profile pictures)
- **File size limit**: 5 MB
- **Allowed MIME types**:
  - `image/jpeg`
  - `image/png`
  - `image/webp`

## How to Create Buckets

1. Open your Supabase dashboard
2. Go to **Storage** in the left sidebar
3. Click **Create bucket**
4. For each bucket above:
   - Enter the exact bucket name
   - Set the public/private setting as specified
   - Configure file size limits and MIME types
   - Click **Save**

## Verification

After creating the buckets, you can verify they exist by calling:
```
GET http://localhost:3002/api/debug/check-bucket
```

This should show:
- `registrationBucketExists: true`
- `totalBuckets: 3`

## Next Steps

Once all buckets are created:
1. Test the partner registration form
2. Upload should work without errors
3. Documents will be securely stored in the private `registration-documents` bucket

## Important Notes

- The `registration-documents` bucket MUST be private for security
- The CDN configuration in `next.config.mjs` has been updated to support Supabase domains
- Your upload service is configured to use the correct bucket names
