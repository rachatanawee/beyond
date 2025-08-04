# Beyond - Multi-language Next.js Application

A modern Next.js application with multi-language support (Thai/English), authentication, admin dashboard, and comprehensive user management system.

## Features

- 🌐 **Multi-language Support** - Thai and English with next-intl
- 🔐 **Authentication** - Email/password and OAuth (Google, GitHub) with Supabase
- 👤 **User Profiles** - Complete profile management with avatar upload
- 🛡️ **Admin Dashboard** - Role-based access control and user management
- 📱 **Responsive Design** - Modern UI with shadcn/ui components
- 🧪 **Testing Suite** - Comprehensive tests with Playwright
- 🗄️ **Database** - PostgreSQL with Supabase and RLS policies

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Internationalization**: next-intl
- **Testing**: Playwright
- **Package Manager**: Bun

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- [Docker](https://docker.com/) for local Supabase development
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd beyond
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up Supabase locally**
   ```bash
   # Start Supabase services
   bunx supabase start
   
   # Run database migrations
   bunx supabase db reset
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

5. **Seed the database (optional)**
   ```bash
   # Create an admin user after signing up through the app
   bunx supabase sql --file supabase/seed.sql
   ```
   
   Or manually update a user to admin:
   ```sql
   UPDATE public.profiles 
   SET role = 'admin', status = 'active' 
   WHERE email = 'your-email@example.com';
   ```

6. **Start the development server**
   ```bash
   bun dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Schema

The application uses the following main tables:

- **profiles** - User profile information with roles and status
- **admin_logs** - Audit trail for admin actions
- **Storage buckets** - Avatar image storage

### User Roles

- **user** - Regular user with basic access
- **admin** - Full administrative access
- **moderator** - Limited administrative access

### User Status

- **active** - Normal active user
- **suspended** - Temporarily suspended user
- **banned** - Permanently banned user
- **pending** - Pending activation

## Available Scripts

```bash
# Development
bun dev                    # Start development server
bun build                  # Build for production
bun start                  # Start production server
bun lint                   # Run ESLint
bun type-check            # Run TypeScript checks

# Testing
bun test                   # Run Playwright tests
bun test:ui               # Run tests with UI
bun test:debug            # Debug tests

# Supabase
bunx supabase start       # Start local Supabase
bunx supabase stop        # Stop local Supabase
bunx supabase status      # Check Supabase status
bunx supabase db reset    # Reset database with migrations
bunx supabase db push     # Push migrations to remote
bunx supabase gen types   # Generate TypeScript types
```

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── [locale]/        # Internationalized routes
│   │   ├── admin/       # Admin dashboard
│   │   ├── dashboard/   # User dashboard
│   │   ├── login/       # Authentication
│   │   └── profile/     # User profile
├── components/          # Reusable UI components
│   └── ui/             # shadcn/ui components
├── contexts/           # React contexts
│   ├── AuthContext.tsx # Authentication state
│   └── AdminContext.tsx # Admin state
├── lib/                # Utilities and configurations
│   ├── services/       # API services
│   └── supabase/       # Supabase client
├── types/              # TypeScript type definitions
└── hooks/              # Custom React hooks

supabase/
├── migrations/         # Database migrations
├── config.toml        # Supabase configuration
└── seed.sql           # Database seed data

messages/              # Internationalization files
├── en.json           # English translations
└── th.json           # Thai translations

tests/                # Playwright tests
├── auth.spec.ts      # Authentication tests
├── admin.spec.ts     # Admin functionality tests
└── utils/            # Test utilities
```

## Internationalization

The app supports Thai and English languages:

- Routes are prefixed with locale (`/en/dashboard`, `/th/dashboard`)
- Translations are stored in `messages/` directory
- Language switcher available in navigation
- Automatic locale detection based on browser preferences

## Authentication

### Supported Methods

- Email/Password authentication
- Google OAuth
- GitHub OAuth

### User Flow

1. Sign up creates a user in `auth.users`
2. Profile is automatically created in `public.profiles`
3. Default role is `user` with `active` status
4. Admin can manage user roles and status

## Admin Features

- **User Maintenance** - Comprehensive user management interface
  - Search and filter users by name, email, status, or role
  - Update user roles (user, moderator, admin)
  - Suspend users with reason and expiration date
  - Ban/unban users
  - Delete user accounts
  - Export user data (CSV/JSON)
  - View user details (login history, profile info)
- **Role Management** - Assign admin/moderator roles
- **Audit Logs** - Track all admin actions
- **User Statistics** - Dashboard with user metrics
- **Bulk Operations** - Export user data

## Testing

The project includes comprehensive tests:

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/auth.spec.ts

# Run tests with UI
bun test:ui

# Debug tests
bun test:debug
```

Test coverage includes:
- Authentication flows
- Admin functionality
- Responsive design
- Accessibility compliance
- Language switching
- Navigation

## Deployment

### Deploy to Vercel

1. **Connect to Supabase Cloud**
   ```bash
   bunx supabase link --project-ref your-project-ref
   bunx supabase db push
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Set environment variables in Vercel**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run tests and linting
6. Submit a pull request

## License

This project is licensed under the MIT License.
