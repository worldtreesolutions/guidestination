
# Admin Portal

This is the admin portal for the activity provider and hotel management system. It allows administrators to verify new registrations and manage users.

## Features

- Activity provider verification
- Hotel verification
- User management (for super admins)
- Notification system for new registrations
- Role-based access control

## Deployment Instructions

### Prerequisites

- Node.js 14.x or higher
- npm or yarn
- Supabase account with project set up

### Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Database Setup

Ensure your Supabase database has the following tables:

1. `activity_owners` - For activity providers
2. `hotels` - For hotels
3. `staff` - For admin users
4. `roles` - For user roles
5. `admin_notifications` - For system notifications

### Deployment Steps

1. Set up a subdomain (e.g., admin.yourdomain.com) pointing to your hosting service
2. Install dependencies:
   ```
   npm install
   ```
3. Build the application:
   ```
   npm run build
   ```
4. Deploy the built files to your hosting service
5. Configure your hosting service to serve the application from the subdomain

### Running Locally

```
npm run dev
```

The application will be available at http://localhost:3001

## Dependencies

- Next.js 14.0.3
- React 18
- Supabase
- Tailwind CSS
- shadcn/ui components
- Lucide React icons
- React Hook Form
- Zod
- Sonner (toast notifications)
- date-fns
