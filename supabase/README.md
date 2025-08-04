# Supabase Setup Guide

## Database Setup

### 1. Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Copy your project URL and anon key to `.env.local`

### 2. Run Migrations
Execute the SQL migration in your Supabase SQL Editor:

```sql
-- Copy and paste the content from migrations/001_create_profiles_table.sql
```

### 3. Configure Authentication

#### Enable Email Authentication
1. Go to Authentication > Settings
2. Enable "Enable email confirmations" if desired
3. Configure email templates

#### Enable OAuth Providers
1. Go to Authentication > Providers
2. Enable Google OAuth:
   - Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
3. Enable GitHub OAuth:
   - Get credentials from [GitHub Developer Settings](https://github.com/settings/developers)
   - Add authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`

### 4. Storage Setup

The migration automatically creates:
- `avatars` bucket for profile pictures
- Proper RLS policies for secure access

### 5. Environment Variables

Update your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

### Profiles Table
- `id` - UUID primary key
- `user_id` - Foreign key to auth.users
- `email` - User email (synced from auth)
- `full_name` - User's full name
- `avatar_url` - Profile picture URL
- `bio` - User biography
- `website` - Personal website
- `location` - User location
- `phone` - Phone number
- `date_of_birth` - Date of birth
- `preferred_language` - UI language preference
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Security Features
- Row Level Security (RLS) enabled
- Users can only access their own profiles
- Automatic profile creation on signup
- Secure file upload for avatars

## API Usage

### Profile Service Methods
- `getProfile(userId)` - Get user profile
- `createProfile(userId, email, data)` - Create new profile
- `updateProfile(userId, updates)` - Update profile
- `uploadAvatar(userId, file)` - Upload profile picture
- `deleteAvatar(avatarUrl)` - Delete profile picture
- `searchProfiles(query)` - Search users

### Auth Context Methods
- `updateProfile(updates)` - Update current user profile
- `uploadAvatar(file)` - Upload avatar for current user
- `refreshProfile()` - Refresh profile data

## Testing

The profile system includes:
- Automatic profile creation on signup
- Secure file uploads
- Real-time profile updates
- Multi-language support
- Responsive design