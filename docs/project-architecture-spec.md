# Project Architecture Specification

## Project Overview
**Beyond** - A modern web application built with Next.js 15, TypeScript, and Supabase, featuring comprehensive user management, internationalization, and admin capabilities.

## Technology Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** React Context API
- **Internationalization:** next-intl
- **Icons:** Lucide React
- **Build Tool:** Bun

### Backend
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth
- **API:** Next.js API Routes
- **File Storage:** Supabase Storage
- **Real-time:** Supabase Realtime (future)

### Development & Deployment
- **Package Manager:** Bun
- **Linting:** ESLint + TypeScript ESLint
- **Testing:** Playwright (E2E)
- **Version Control:** Git
- **Deployment:** Vercel (recommended)

## Project Structure

```
beyond/
├── .kiro/                      # Kiro IDE configuration
├── .next/                      # Next.js build output
├── .vscode/                    # VS Code settings
├── docs/                       # Documentation
│   ├── project-architecture-spec.md
│   └── user-management-spec.md
├── messages/                   # Internationalization
│   ├── en.json
│   └── th.json
├── public/                     # Static assets
├── scripts/                    # Utility scripts
│   ├── cleanup-orphaned-users.js
│   └── seed-cloud.js
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # Internationalized routes
│   │   │   ├── admin/         # Admin pages
│   │   │   ├── dashboard/     # User dashboard
│   │   │   ├── login/         # Authentication
│   │   │   └── profile/       # User profile
│   │   ├── api/               # API routes
│   │   │   └── admin/         # Admin API endpoints
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── AuthButton.tsx
│   │   ├── dashboard-nav.tsx
│   │   └── LanguageSwitcher.tsx
│   ├── contexts/             # React contexts
│   │   ├── AdminContext.tsx
│   │   └── AuthContext.tsx
│   ├── hooks/                # Custom React hooks
│   │   └── useHydration.ts
│   ├── i18n/                 # Internationalization config
│   │   ├── request.ts
│   │   └── routing.ts
│   ├── lib/                  # Utility libraries
│   │   ├── services/         # Business logic services
│   │   ├── supabase/         # Supabase clients
│   │   └── utils.ts          # Utility functions
│   ├── types/                # TypeScript type definitions
│   │   ├── admin.ts
│   │   └── profile.ts
│   └── middleware.ts         # Next.js middleware
├── supabase/                 # Supabase configuration
│   ├── functions/            # Edge functions (unused)
│   ├── migrations/           # Database migrations
│   └── seed.sql             # Database seed data
├── tests/                    # Test files
└── package.json
```

## Core Architecture Patterns

### 1. Layered Architecture

```
┌─────────────────────────────────────┐
│           Presentation Layer        │
│  (React Components, Pages, UI)      │
├─────────────────────────────────────┤
│           Business Logic Layer      │
│     (Services, Contexts, Hooks)     │
├─────────────────────────────────────┤
│           Data Access Layer         │
│    (Supabase Clients, API Routes)   │
├─────────────────────────────────────┤
│           Database Layer            │
│      (PostgreSQL via Supabase)      │
└─────────────────────────────────────┘
```

### 2. Service-Oriented Architecture
- **AdminService:** User management operations
- **ProfileService:** User profile operations
- **AuthService:** Authentication (via Supabase)

### 3. Context-Based State Management
- **AuthContext:** User authentication state
- **AdminContext:** Admin-specific state and operations

## Database Architecture

### Core Tables

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  location TEXT,
  phone TEXT,
  date_of_birth DATE,
  preferred_language TEXT DEFAULT 'en',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending')),
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  suspended_until TIMESTAMPTZ,
  suspension_reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### admin_logs
```sql
CREATE TABLE admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Database Triggers
- **Profile Auto-Creation:** Automatically creates profile when user signs up
- **Updated At:** Automatically updates `updated_at` timestamp
- **Login Stats:** Updates login statistics

### Row Level Security (RLS)
- Users can only access their own profiles
- Admins have elevated permissions via service role
- Public read access for certain fields

## API Architecture

### RESTful API Design
All API routes follow REST conventions:

```
POST   /api/admin/create-user      # Create new user
GET    /api/admin/users           # List users (future)
PUT    /api/admin/update-user     # Update user profile
DELETE /api/admin/delete-user     # Delete user (hard delete)
DELETE /api/admin/delete-user-profile # Delete profile (fallback)
```

### Authentication & Authorization
- **JWT Tokens:** Via Supabase Auth
- **Service Role:** For admin operations
- **Middleware:** Route protection and locale handling

### Error Handling
- Consistent error response format
- Internationalized error messages
- Proper HTTP status codes
- Detailed logging for debugging

## Security Architecture

### Authentication
- **Supabase Auth:** Email/password, OAuth providers
- **JWT Tokens:** Secure token-based authentication
- **Session Management:** Automatic token refresh

### Authorization
- **Role-Based Access Control (RBAC)**
  - `user`: Basic user permissions
  - `moderator`: Enhanced moderation capabilities
  - `admin`: Full system access
- **Row Level Security:** Database-level access control
- **API Route Protection:** Middleware-based authorization

### Data Protection
- **Input Validation:** Server-side validation for all inputs
- **SQL Injection Prevention:** Parameterized queries via Supabase
- **XSS Prevention:** React's built-in protection + sanitization
- **CSRF Protection:** SameSite cookies and token validation

### Privacy & Compliance
- **Data Minimization:** Only collect necessary data
- **User Consent:** Clear privacy policies
- **Data Retention:** Configurable retention policies
- **Audit Logging:** Complete admin action tracking

## Internationalization (i18n)

### Supported Languages
- **English (en):** Default language
- **Thai (th):** Full translation support

### Implementation
- **next-intl:** Modern i18n solution for Next.js
- **Route-based Locales:** `/en/...` and `/th/...`
- **Dynamic Loading:** Translations loaded per route
- **Fallback Strategy:** English as fallback language

### Translation Structure
```json
{
  "Navigation": { ... },
  "Auth": { ... },
  "Profile": { ... },
  "Admin": {
    "createUser": { ... },
    "updateUser": { ... },
    "deleteUser": { ... }
  },
  "Dashboard": { ... }
}
```

## Performance Optimization

### Frontend Optimization
- **Code Splitting:** Automatic route-based splitting
- **Image Optimization:** Next.js Image component
- **Bundle Analysis:** Regular bundle size monitoring
- **Lazy Loading:** Components loaded on demand

### Database Optimization
- **Indexing:** Strategic indexes on frequently queried columns
- **Query Optimization:** Efficient Supabase queries
- **Connection Pooling:** Managed by Supabase
- **Caching:** Browser and CDN caching strategies

### API Optimization
- **Response Compression:** Automatic gzip compression
- **Rate Limiting:** Protection against abuse
- **Pagination:** Efficient data loading
- **Error Caching:** Prevent repeated failed requests

## Testing Strategy

### Testing Pyramid
```
┌─────────────────┐
│   E2E Tests     │  ← Playwright (Critical user flows)
├─────────────────┤
│ Integration     │  ← API route testing
├─────────────────┤
│  Unit Tests     │  ← Component and utility testing
└─────────────────┘
```

### Test Coverage
- **Authentication Flows:** Login, logout, registration
- **User Management:** CRUD operations, role changes
- **Internationalization:** Language switching
- **Responsive Design:** Mobile and desktop layouts
- **Accessibility:** WCAG compliance testing

## Deployment Architecture

### Recommended Stack
- **Frontend:** Vercel (Next.js optimized)
- **Database:** Supabase (managed PostgreSQL)
- **CDN:** Vercel Edge Network
- **Monitoring:** Vercel Analytics + Supabase Monitoring

### Environment Configuration
```bash
# Required Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### CI/CD Pipeline
1. **Code Push:** Git push to main branch
2. **Build Process:** Bun install + build
3. **Type Checking:** TypeScript compilation
4. **Linting:** ESLint validation
5. **Testing:** Playwright E2E tests
6. **Deployment:** Automatic Vercel deployment

## Monitoring & Observability

### Application Monitoring
- **Error Tracking:** Console logging + error boundaries
- **Performance Monitoring:** Core Web Vitals
- **User Analytics:** Privacy-compliant analytics
- **Database Monitoring:** Supabase dashboard

### Logging Strategy
- **Admin Actions:** Complete audit trail
- **API Requests:** Request/response logging
- **Error Logging:** Structured error information
- **Performance Metrics:** Response times and throughput

## Scalability Considerations

### Horizontal Scaling
- **Stateless Design:** No server-side sessions
- **Database Scaling:** Supabase auto-scaling
- **CDN Distribution:** Global content delivery
- **API Rate Limiting:** Prevent resource exhaustion

### Vertical Scaling
- **Database Optimization:** Query performance tuning
- **Bundle Optimization:** Code splitting and tree shaking
- **Image Optimization:** WebP format and responsive images
- **Caching Strategy:** Multi-level caching

## Future Enhancements

### Short Term (1-3 months)
- **Password Reset:** Admin-initiated password resets
- **Bulk Operations:** Multi-user actions
- **Advanced Filtering:** Date ranges and custom filters
- **Email Notifications:** User communication system

### Medium Term (3-6 months)
- **Real-time Features:** Live notifications and updates
- **Advanced Analytics:** User behavior insights
- **API Rate Limiting:** Enhanced security measures
- **Mobile App:** React Native companion app

### Long Term (6+ months)
- **Microservices:** Service decomposition for scale
- **Advanced Permissions:** Granular access control
- **Multi-tenancy:** Organization-based isolation
- **AI Integration:** Intelligent user insights

## Development Guidelines

### Code Standards
- **TypeScript:** Strict mode enabled
- **ESLint:** Consistent code formatting
- **Naming Conventions:** Clear and descriptive names
- **Component Structure:** Functional components with hooks

### Git Workflow
- **Feature Branches:** One feature per branch
- **Commit Messages:** Conventional commit format
- **Pull Requests:** Code review required
- **Automated Testing:** CI/CD pipeline validation

### Documentation
- **Code Comments:** Complex logic explanation
- **API Documentation:** OpenAPI specifications
- **Architecture Decisions:** ADR documentation
- **User Guides:** End-user documentation

## Conclusion

This architecture provides a solid foundation for a modern, scalable web application with:

- **Type Safety:** Full TypeScript implementation
- **Security:** Comprehensive security measures
- **Performance:** Optimized for speed and efficiency
- **Maintainability:** Clean, well-structured codebase
- **Scalability:** Ready for growth and expansion
- **User Experience:** Responsive, accessible, internationalized

The modular design allows for incremental improvements and feature additions while maintaining system stability and performance.