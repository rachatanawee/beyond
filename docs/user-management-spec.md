# User Management System Specification

## Overview
ระบบจัดการผู้ใช้สำหรับ Admin ที่ช่วยให้ผู้ดูแลระบบสามารถสร้าง แก้ไข และจัดการบัญชีผู้ใช้ได้อย่างครบถ้วน

## Features

### 1. Create User (✅ Implemented)
**Description:** Admin สามารถสร้างบัญชีผู้ใช้ใหม่ได้

**API Endpoint:** `POST /api/admin/create-user`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "role": "user" // user | admin | moderator
}
```

**Response:**
```json
{
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",
    "status": "active",
    "created_at": "2025-01-05T10:00:00Z"
  },
  "error": null
}
```

**Error Responses:**
- `400` - Missing required fields
- `401` - Unauthorized
- `403` - Admin privileges required
- `409` - Email already exists
- `500` - Internal server error

**Features:**
- ✅ Email validation and duplication check
- ✅ Password requirement
- ✅ Role assignment (user, admin, moderator)
- ✅ Automatic profile creation via database trigger
- ✅ Multi-language error messages (EN/TH)
- ✅ Admin authorization check
- ✅ Error display in dialog
- ✅ Form validation

### 2. List Users (✅ Implemented)
**Description:** แสดงรายการผู้ใช้ทั้งหมดพร้อมการกรองและค้นหา

**Features:**
- ✅ Pagination support
- ✅ Search by name or email
- ✅ Filter by status (active, suspended, banned, pending)
- ✅ Filter by role (user, admin, moderator)
- ✅ User count display
- ✅ Avatar display
- ✅ Join date information
- ✅ Last login tracking

### 3. User Actions (Partially Implemented)

#### 3.1 Suspend User (✅ Implemented)
- ✅ Temporary suspension with expiry date
- ✅ Suspension reason
- ✅ Admin logging

#### 3.2 Ban User (✅ Implemented)
- ✅ Permanent ban
- ✅ Ban reason
- ✅ Admin logging

#### 3.3 Delete User (❌ Needs Fix)
**Current Issue:** "User not allowed" error
**Required:** API endpoint for admin user deletion

#### 3.4 Role Management (✅ Implemented)
- ✅ Change user role (user ↔ admin ↔ moderator)
- ✅ Admin logging

### 4. Export Functionality (✅ Implemented)
- ✅ Export to CSV
- ✅ Export to JSON
- ✅ All user data included

## Technical Architecture

### Database Schema

#### profiles table
```sql
CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  location TEXT,
  phone VARCHAR(20),
  date_of_birth DATE,
  preferred_language VARCHAR(2) DEFAULT 'en',
  role user_role DEFAULT 'user',
  status user_status DEFAULT 'active',
  last_login_at TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  suspended_until TIMESTAMP WITH TIME ZONE,
  suspension_reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### admin_logs table
```sql
CREATE TABLE admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Database Triggers

#### Auto Profile Creation
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, role, status, login_count, preferred_language)
  VALUES (NEW.id, NEW.email, 'user', 'active', 0, 'en');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### API Routes

#### Implemented
- ✅ `POST /api/admin/create-user` - Create new user
- ✅ Admin authorization middleware
- ✅ Error handling with translations
- ✅ Database trigger integration

#### Needed
- ❌ `DELETE /api/admin/delete-user` - Delete user (admin only)
- ❌ `PUT /api/admin/update-user` - Update user details
- ❌ `POST /api/admin/reset-password` - Reset user password

### Frontend Components

#### AdminService
```typescript
class AdminService {
  async createUser(userData: NewUserData): Promise<{data: UserProfile | null; error: unknown}>
  async getAllUsers(page?: number, limit?: number): Promise<{data: UserWithAdmin[] | null; error: unknown; count?: number}>
  async updateUserRole(userId: string, role: UserRole): Promise<{error: unknown}>
  async suspendUser(suspendData: SuspendUserData): Promise<{error: unknown}>
  async deleteUser(userId: string): Promise<{error: unknown}> // Needs API fix
  // ... other methods
}
```

#### UI Components
- ✅ User list with filtering
- ✅ Create user dialog with error handling
- ✅ Suspend user dialog
- ✅ Delete confirmation dialog
- ✅ Role change dropdown
- ✅ Export buttons
- ✅ Search and filter controls

### Internationalization

#### Supported Languages
- ✅ English (en)
- ✅ Thai (th)

#### Translation Keys
```json
{
  "Admin": {
    "createUser": {
      "emailExists": "This email is already in use. Please use a different email.",
      "profileExists": "User profile already exists in the system.",
      "missingFields": "Please fill in email, password, and full name completely.",
      "unauthorized": "Access denied. Please log in again.",
      "adminRequired": "Admin privileges required to create users.",
      "userCreationFailed": "Unable to create user: {error}",
      "internalError": "System error occurred. Please try again."
    }
  }
}
```

## Security

### Authorization
- ✅ Admin role verification
- ✅ Active status check
- ✅ JWT token validation
- ✅ Service role key for admin operations

### Data Protection
- ✅ Password hashing (handled by Supabase Auth)
- ✅ Email validation
- ✅ SQL injection prevention
- ✅ CORS headers
- ✅ Rate limiting (via Supabase)

## Known Issues & TODO

### High Priority
1. **Delete User API** - Need to implement admin delete user endpoint
2. **Password Reset** - Admin should be able to reset user passwords
3. **Bulk Operations** - Select multiple users for bulk actions

### Medium Priority
1. **User Profile Editing** - Admin edit user profiles
2. **Advanced Filtering** - Date ranges, custom filters
3. **Activity Logs** - User activity tracking
4. **Email Notifications** - Notify users of account changes

### Low Priority
1. **User Import** - Bulk import from CSV
2. **Advanced Analytics** - User growth charts
3. **Audit Trail** - Detailed admin action history
4. **User Groups** - Organize users into groups

## Testing

### Manual Testing Checklist
- ✅ Create user with valid data
- ✅ Create user with duplicate email (should fail)
- ✅ Create user with missing fields (should fail)
- ✅ Create user without admin privileges (should fail)
- ✅ Error messages display in dialog
- ✅ Multi-language error messages
- ✅ User list filtering and search
- ✅ Export functionality
- ❌ Delete user (currently failing)

### Automated Testing
- [ ] Unit tests for AdminService
- [ ] Integration tests for API routes
- [ ] E2E tests for user workflows
- [ ] Security testing for authorization

## Performance Considerations

### Current Implementation
- ✅ Pagination for user lists
- ✅ Database indexing on email and user_id
- ✅ Efficient queries with select specific fields
- ✅ Client-side filtering for better UX

### Optimization Opportunities
- [ ] Implement server-side search
- [ ] Add database indexes for filtering columns
- [ ] Cache user counts
- [ ] Implement virtual scrolling for large lists

## Deployment

### Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Migrations
- ✅ `001_create_profiles_table.sql`
- ✅ Profile creation trigger
- ✅ Admin logs table
- ✅ RLS policies

### Build Process
- ✅ TypeScript compilation
- ✅ Next.js optimization
- ✅ Translation file validation
- ✅ No build errors or warnings

## Conclusion

The User Management System is largely complete with core functionality working well. The main outstanding issue is the delete user functionality which requires implementing a proper admin delete API endpoint. The system provides a solid foundation for user administration with good security, internationalization, and user experience.