# Beyond - Modern Web Application

A comprehensive web application built with Next.js 15, TypeScript, and Supabase, featuring advanced user management, internationalization, and admin capabilities.

## 🚀 Features

### Core Features
- **🔐 Authentication & Authorization** - Secure user authentication with role-based access control
- **👥 User Management** - Complete CRUD operations for user profiles
- **🌍 Internationalization** - Multi-language support (English/Thai)
- **📱 Responsive Design** - Mobile-first responsive UI
- **🎨 Modern UI** - Built with Tailwind CSS and shadcn/ui components

### Admin Features
- **👨‍💼 Admin Dashboard** - Comprehensive admin panel
- **📊 User Analytics** - User statistics and insights
- **🔧 User Management** - Create, edit, suspend, ban, and delete users
- **📋 Activity Logging** - Complete audit trail of admin actions
- **📤 Data Export** - Export user data in CSV/JSON formats

### Technical Features
- **⚡ Performance** - Optimized build with Next.js 15 and Bun
- **🛡️ Type Safety** - Full TypeScript implementation
- **🔒 Security** - Row-level security and input validation
- **📈 Scalability** - Designed for growth and expansion

## 🛠️ Technology Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Build Tool:** Bun
- **Testing:** Playwright
- **Deployment:** Vercel (recommended)

## 📋 Prerequisites

- **Node.js** 18+ or **Bun** 1.0+
- **Supabase** account and project
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd beyond
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Environment Setup
Create `.env.local` file:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Database Setup
Run the migration file in your Supabase SQL editor:
```bash
# Execute: supabase/migrations/001_create_profiles_table.sql
```

### 5. Start Development Server
```bash
bun dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
beyond/
├── docs/                       # Documentation
│   ├── project-architecture-spec.md
│   └── user-management-spec.md
├── messages/                   # Internationalization
│   ├── en.json
│   └── th.json
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # Internationalized routes
│   │   └── api/               # API routes
│   ├── components/            # Reusable components
│   ├── contexts/             # React contexts
│   ├── lib/                  # Utilities and services
│   └── types/                # TypeScript definitions
├── supabase/                 # Database configuration
└── tests/                    # Test files
```

## 🔧 Available Scripts

```bash
# Development
bun dev                 # Start development server
bun build              # Build for production
bun start              # Start production server

# Testing
bun test               # Run tests
bun test:e2e           # Run E2E tests

# Database
node scripts/seed-cloud.js           # Seed database
node scripts/cleanup-orphaned-users.js  # Clean orphaned users
```

## 🌍 Internationalization

The application supports multiple languages:

- **English (en)** - Default language
- **Thai (th)** - Full translation support

Language switching is available in the navigation menu.

## 👨‍💼 Admin Features

### User Management
- **Create Users** - Add new users with roles and permissions
- **Edit Profiles** - Update user information and settings
- **Role Management** - Assign user, moderator, or admin roles
- **Status Control** - Activate, suspend, ban, or delete users
- **Bulk Operations** - Perform actions on multiple users

### Analytics & Reporting
- **User Statistics** - Growth metrics and user counts
- **Activity Logs** - Complete audit trail of admin actions
- **Data Export** - Export user data in multiple formats

## 🔒 Security Features

- **Authentication** - Secure JWT-based authentication
- **Authorization** - Role-based access control (RBAC)
- **Input Validation** - Server-side validation and sanitization
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Content sanitization
- **Audit Logging** - Complete action tracking

## 📊 Database Schema

### Core Tables
- **profiles** - User profile information
- **admin_logs** - Admin action audit trail

### Key Features
- **Row Level Security (RLS)** - Database-level access control
- **Automatic Triggers** - Profile creation and timestamp updates
- **Foreign Key Constraints** - Data integrity enforcement

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your Git repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
bun build
bun start
```

## 🧪 Testing

### E2E Testing with Playwright
```bash
bun test:e2e
```

### Test Coverage
- Authentication flows
- User management operations
- Internationalization
- Responsive design
- Accessibility compliance

## 📚 Documentation

- **[Project Architecture](docs/project-architecture-spec.md)** - Technical architecture overview
- **[User Management](docs/user-management-spec.md)** - User management system specification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [documentation](docs/)
- Open an [issue](issues)
- Contact the development team

## 🎯 Roadmap

### Upcoming Features
- **Password Reset** - Admin-initiated password resets
- **Bulk Operations** - Enhanced multi-user actions
- **Real-time Notifications** - Live updates and alerts
- **Advanced Analytics** - Detailed user insights
- **Mobile App** - React Native companion

### Long-term Goals
- **Microservices Architecture** - Service decomposition
- **AI Integration** - Intelligent user insights
- **Multi-tenancy** - Organization-based isolation
- **Advanced Permissions** - Granular access control

---

**Built with ❤️ using Next.js, TypeScript, and Supabase**