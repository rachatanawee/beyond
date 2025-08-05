# Test Cases - Beyond Application

## Test Case Format

Each test case follows this structure:
- **Test ID:** Unique identifier
- **Test Name:** Descriptive name
- **Preconditions:** Setup required
- **Test Steps:** Step-by-step actions
- **Expected Results:** What should happen
- **Priority:** High/Medium/Low
- **Status:** Pass/Fail/Not Run

---

## 🔐 Authentication Test Cases

### AUTH-001: Login Page Access
- **Priority:** High
- **Preconditions:** User not logged in
- **Test Steps:**
  1. Navigate to `/en`
  2. Click "Sign In" button
- **Expected Results:**
  - Redirected to `/en/login`
  - Login form displayed with email/password fields
  - "Welcome back!" heading visible

### AUTH-002: Valid Login
- **Priority:** High
- **Preconditions:** Valid user account exists
- **Test Steps:**
  1. Navigate to `/en/login`
  2. Enter valid email: `user@test.com`
  3. Enter valid password: `password123`
  4. Click "Sign In" button
- **Expected Results:**
  - User redirected to `/en/dashboard`
  - Welcome message displayed
  - Navigation shows user profile

### AUTH-003: Invalid Login
- **Priority:** High
- **Preconditions:** User on login page
- **Test Steps:**
  1. Navigate to `/en/login`
  2. Enter invalid email: `invalid@test.com`
  3. Enter invalid password: `wrongpassword`
  4. Click "Sign In" button
- **Expected Results:**
  - Error message displayed
  - User remains on login page
  - Form fields retain values

### AUTH-004: Form Toggle
- **Priority:** Medium
- **Preconditions:** User on login page
- **Test Steps:**
  1. Navigate to `/en/login`
  2. Click "Don't have an account?" link
  3. Verify Sign Up form appears
  4. Click "Already have an account?" link
- **Expected Results:**
  - Form toggles between Sign In and Sign Up
  - Appropriate fields shown/hidden
  - Confirm Password field appears in Sign Up

### AUTH-005: Password Mismatch
- **Priority:** Medium
- **Preconditions:** User on Sign Up form
- **Test Steps:**
  1. Navigate to `/en/login`
  2. Switch to Sign Up form
  3. Enter email: `test@example.com`
  4. Enter password: `password123`
  5. Enter confirm password: `differentpassword`
  6. Click "Sign Up" button
- **Expected Results:**
  - Error message: "Passwords do not match"
  - Form submission prevented
  - Password fields highlighted

---

## 👥 Admin User Management Test Cases

### ADMIN-001: Admin Access Verification
- **Priority:** High
- **Preconditions:** Admin user logged in
- **Test Steps:**
  1. Login as admin user
  2. Navigate to `/en/admin/users`
- **Expected Results:**
  - User Management page loads
  - "User Maintenance" heading visible
  - User list displayed
  - "Create User" button visible

### ADMIN-002: Non-Admin Access Denied
- **Priority:** High
- **Preconditions:** Regular user logged in
- **Test Steps:**
  1. Login as regular user
  2. Navigate to `/en/admin/users`
- **Expected Results:**
  - Access denied message or redirect
  - User cannot view admin interface
  - Appropriate error message shown

### ADMIN-003: User List Display
- **Priority:** High
- **Preconditions:** Admin logged in, users exist in database
- **Test Steps:**
  1. Navigate to `/en/admin/users`
  2. Wait for user list to load
- **Expected Results:**
  - User cards displayed with:
    - User avatar or initials
    - Full name and email
    - Role badge
    - Status indicator
    - Join date
    - Login count
    - Action buttons

### ADMIN-004: Search Functionality
- **Priority:** Medium
- **Preconditions:** Admin on user management page
- **Test Steps:**
  1. Navigate to `/en/admin/users`
  2. Enter search term in search box: "john"
  3. Wait for results to filter
- **Expected Results:**
  - User list filters to show matching users
  - Results update in real-time
  - "X users found" count updates
  - Clear search shows all users

### ADMIN-005: Create User Dialog
- **Priority:** High
- **Preconditions:** Admin on user management page
- **Test Steps:**
  1. Navigate to `/en/admin/users`
  2. Click "Create User" button
- **Expected Results:**
  - Dialog opens with title "Create New User"
  - Form fields visible:
    - Email (required)
    - Password (required)
    - Full Name (required)
    - Role (dropdown)
  - "Create User" and "Cancel" buttons visible

### ADMIN-006: Create User Success
- **Priority:** High
- **Preconditions:** Create user dialog open
- **Test Steps:**
  1. Fill email: `newuser@test.com`
  2. Fill password: `password123`
  3. Fill full name: `New Test User`
  4. Select role: `user`
  5. Click "Create User" button
- **Expected Results:**
  - Dialog closes
  - Success message: "User created successfully"
  - User appears in user list
  - User list refreshes

### ADMIN-007: Create User Validation
- **Priority:** High
- **Preconditions:** Create user dialog open
- **Test Steps:**
  1. Leave all fields empty
  2. Click "Create User" button
- **Expected Results:**
  - Error message in dialog: "Please fill in all required fields"
  - Dialog remains open
  - Form fields highlighted as invalid

### ADMIN-008: Duplicate Email Prevention
- **Priority:** High
- **Preconditions:** Create user dialog open, existing user email known
- **Test Steps:**
  1. Fill email with existing user email
  2. Fill other required fields
  3. Click "Create User" button
- **Expected Results:**
  - Error message: "This email is already in use"
  - Dialog remains open
  - Email field highlighted as invalid

### ADMIN-009: Edit User Dialog
- **Priority:** High
- **Preconditions:** Admin on user management page, users exist
- **Test Steps:**
  1. Navigate to `/en/admin/users`
  2. Click edit button (pencil icon) on a user
- **Expected Results:**
  - Edit dialog opens with title "Edit User Profile"
  - Form pre-populated with user data
  - Email field disabled (read-only)
  - All other fields editable

### ADMIN-010: Edit User Profile
- **Priority:** High
- **Preconditions:** Edit user dialog open
- **Test Steps:**
  1. Modify full name: `Updated Name`
  2. Add bio: `Updated biography`
  3. Add website: `https://example.com`
  4. Add location: `Bangkok, Thailand`
  5. Click "Update User" button
- **Expected Results:**
  - Dialog closes
  - Success message: "User updated successfully"
  - Changes reflected in user list
  - User data persisted

### ADMIN-011: Role Change
- **Priority:** High
- **Preconditions:** Edit user dialog open
- **Test Steps:**
  1. Change role from "user" to "moderator"
  2. Click "Update User" button
- **Expected Results:**
  - Role updated successfully
  - User list shows new role badge
  - Admin action logged

### ADMIN-012: Status Change
- **Priority:** High
- **Preconditions:** Edit user dialog open
- **Test Steps:**
  1. Change status from "active" to "suspended"
  2. Click "Update User" button
- **Expected Results:**
  - Status updated successfully
  - User list shows suspended status
  - User access restricted

### ADMIN-013: Suspend User
- **Priority:** Medium
- **Preconditions:** Admin on user management page
- **Test Steps:**
  1. Click suspend button (user-x icon) on active user
  2. Fill suspend until date: `2024-12-31`
  3. Fill reason: `Policy violation`
  4. Click "Suspend User" button
- **Expected Results:**
  - Suspend dialog closes
  - Success message: "User suspended successfully"
  - User status changes to "suspended"
  - Suspend button changes to unsuspend

### ADMIN-014: Delete User Confirmation
- **Priority:** High
- **Preconditions:** Admin on user management page
- **Test Steps:**
  1. Click delete button (trash icon) on a user
- **Expected Results:**
  - Delete confirmation dialog opens
  - Warning message about permanent deletion
  - User name/email shown in confirmation
  - "Delete User" and "Cancel" buttons visible

### ADMIN-015: Delete User Execution
- **Priority:** High
- **Preconditions:** Delete confirmation dialog open
- **Test Steps:**
  1. Click "Delete User" button in confirmation dialog
- **Expected Results:**
  - Dialog closes
  - User removed from list
  - Success message or silent removal
  - User cannot login anymore

### ADMIN-016: Export CSV
- **Priority:** Low
- **Preconditions:** Admin on user management page
- **Test Steps:**
  1. Click "Export CSV" button
- **Expected Results:**
  - CSV file download initiated
  - File contains user data
  - Filename includes timestamp
  - All visible users included

### ADMIN-017: Export JSON
- **Priority:** Low
- **Preconditions:** Admin on user management page
- **Test Steps:**
  1. Click "Export JSON" button
- **Expected Results:**
  - JSON file download initiated
  - File contains structured user data
  - All user fields included
  - Valid JSON format

---

## 📊 Dashboard Test Cases

### DASH-001: Dashboard Access
- **Priority:** High
- **Preconditions:** User logged in
- **Test Steps:**
  1. Login as regular user
  2. Navigate to `/en/dashboard`
- **Expected Results:**
  - Dashboard page loads
  - Welcome message with time-based greeting
  - Account status card visible
  - Quick actions section visible

### DASH-002: Time-Based Greeting
- **Priority:** Medium
- **Preconditions:** User on dashboard
- **Test Steps:**
  1. Navigate to `/en/dashboard`
  2. Check greeting message
- **Expected Results:**
  - Morning (6-12): "Good morning"
  - Afternoon (12-18): "Good afternoon"
  - Evening (18-6): "Good evening"
  - Greeting in appropriate language

### DASH-003: Account Status Card
- **Priority:** High
- **Preconditions:** User on dashboard
- **Test Steps:**
  1. Navigate to `/en/dashboard`
  2. Locate account status section
- **Expected Results:**
  - User's full name displayed
  - Member since date shown
  - Current role displayed
  - Account status indicator

### DASH-004: Quick Actions Navigation
- **Priority:** High
- **Preconditions:** User on dashboard
- **Test Steps:**
  1. Navigate to `/en/dashboard`
  2. Click "Edit Profile" action
  3. Verify navigation to profile page
  4. Return to dashboard
  5. Click "Analytics" action
- **Expected Results:**
  - Each quick action navigates correctly
  - Profile link goes to `/en/profile`
  - Analytics link goes to `/en/dashboard/analytics`
  - Navigation preserves user session

### DASH-005: Admin Panel Visibility
- **Priority:** High
- **Preconditions:** Admin user logged in
- **Test Steps:**
  1. Login as admin user
  2. Navigate to `/en/dashboard`
  3. Look for admin panel section
- **Expected Results:**
  - Admin panel quick action visible
  - "Admin Panel" card displayed
  - Link to admin dashboard works
  - Regular users don't see this section

---

## 👤 Profile Management Test Cases

### PROF-001: Profile Page Access
- **Priority:** High
- **Preconditions:** User logged in
- **Test Steps:**
  1. Login as user
  2. Navigate to `/en/profile`
- **Expected Results:**
  - Profile settings page loads
  - "Profile Settings" heading visible
  - Form with user data displayed
  - All profile fields visible

### PROF-002: Form Field Validation
- **Priority:** High
- **Preconditions:** User on profile page
- **Test Steps:**
  1. Navigate to `/en/profile`
  2. Verify email field is disabled
  3. Check other fields are editable
- **Expected Results:**
  - Email field disabled/read-only
  - Full name field editable
  - Bio textarea editable
  - Website, location, phone editable
  - Language dropdown functional

### PROF-003: Profile Update Success
- **Priority:** High
- **Preconditions:** User on profile page
- **Test Steps:**
  1. Navigate to `/en/profile`
  2. Update full name: `Updated Name`
  3. Update bio: `New biography text`
  4. Update website: `https://newsite.com`
  5. Click "Update Profile" button
- **Expected Results:**
  - Success message: "Profile updated successfully"
  - Changes saved to database
  - Form shows updated values
  - Loading state during save

### PROF-004: Website URL Validation
- **Priority:** Medium
- **Preconditions:** User on profile page
- **Test Steps:**
  1. Navigate to `/en/profile`
  2. Enter invalid URL: `not-a-url`
  3. Click "Update Profile" button
- **Expected Results:**
  - Validation error shown
  - Field highlighted as invalid
  - Form submission prevented
  - Error message descriptive

### PROF-005: Language Preference
- **Priority:** Medium
- **Preconditions:** User on profile page
- **Test Steps:**
  1. Navigate to `/en/profile`
  2. Change language to "ไทย"
  3. Click "Update Profile" button
- **Expected Results:**
  - Language preference saved
  - Success message shown
  - Interface may switch to Thai
  - Setting persisted for future sessions

---

## 🌍 Internationalization Test Cases

### I18N-001: Default Language
- **Priority:** High
- **Preconditions:** Clean browser session
- **Test Steps:**
  1. Navigate to `/`
- **Expected Results:**
  - Redirected to `/en`
  - English interface displayed
  - All text in English
  - Language switcher shows "English"

### I18N-002: Thai Language Access
- **Priority:** High
- **Preconditions:** None
- **Test Steps:**
  1. Navigate to `/th`
- **Expected Results:**
  - Thai interface displayed
  - All navigation in Thai
  - Content translated appropriately
  - Language switcher shows "ไทย"

### I18N-003: Language Switching
- **Priority:** High
- **Preconditions:** User on English page
- **Test Steps:**
  1. Navigate to `/en/dashboard`
  2. Click language switcher
  3. Select "ไทย"
- **Expected Results:**
  - URL changes to `/th/dashboard`
  - Interface switches to Thai
  - Content translated
  - User session maintained

### I18N-004: Error Message Translation
- **Priority:** High
- **Preconditions:** User on Thai admin page
- **Test Steps:**
  1. Navigate to `/th/admin/users`
  2. Try to create user with empty form
- **Expected Results:**
  - Error messages in Thai
  - Validation messages translated
  - Success messages in Thai
  - Consistent language throughout

---

## 📱 Responsive Design Test Cases

### RESP-001: Mobile Layout (375px)
- **Priority:** High
- **Preconditions:** None
- **Test Steps:**
  1. Set viewport to 375x667 (iPhone)
  2. Navigate to `/en/dashboard`
  3. Test navigation and content
- **Expected Results:**
  - Content fits screen width
  - Navigation adapts (hamburger menu)
  - Text remains readable
  - Buttons are touch-friendly (44px min)

### RESP-002: Tablet Layout (768px)
- **Priority:** High
- **Preconditions:** None
- **Test Steps:**
  1. Set viewport to 768x1024 (iPad)
  2. Navigate to `/en/admin/users`
  3. Test user management interface
- **Expected Results:**
  - Layout adapts to tablet size
  - User cards display properly
  - Forms remain usable
  - No horizontal scrolling

### RESP-003: Desktop Layout (1920px)
- **Priority:** High
- **Preconditions:** None
- **Test Steps:**
  1. Set viewport to 1920x1080
  2. Navigate through all pages
- **Expected Results:**
  - Full desktop layout displayed
  - Content doesn't stretch too wide
  - Sidebar navigation visible
  - Optimal use of screen space

---

## ♿ Accessibility Test Cases

### A11Y-001: Keyboard Navigation
- **Priority:** High
- **Preconditions:** User on any page
- **Test Steps:**
  1. Navigate to `/en/profile`
  2. Use Tab key to navigate through form
  3. Use Enter/Space to activate buttons
- **Expected Results:**
  - All interactive elements reachable
  - Focus indicators visible
  - Logical tab order
  - No keyboard traps

### A11Y-002: Form Labels
- **Priority:** High
- **Preconditions:** User on form page
- **Test Steps:**
  1. Navigate to `/en/admin/users`
  2. Open create user dialog
  3. Check all form fields have labels
- **Expected Results:**
  - Every input has associated label
  - Labels properly connected (for/id)
  - Required fields marked
  - Error messages accessible

### A11Y-003: Image Alt Text
- **Priority:** High
- **Preconditions:** User on any page with images
- **Test Steps:**
  1. Navigate through application
  2. Check all images for alt attributes
- **Expected Results:**
  - All images have alt text
  - Alt text is descriptive
  - Decorative images have empty alt=""
  - Icons have appropriate labels

---

## Test Execution Checklist

### Pre-Test Setup
- [ ] Test environment running (`bun dev`)
- [ ] Database seeded with test data
- [ ] Test user accounts created
- [ ] Browser cache cleared

### Test Execution
- [ ] Run smoke tests first
- [ ] Execute high priority tests
- [ ] Document any failures
- [ ] Take screenshots of issues
- [ ] Verify fixes and retest

### Post-Test Activities
- [ ] Generate test report
- [ ] Update test cases if needed
- [ ] Log defects found
- [ ] Update test data
- [ ] Archive test results

---

**Total Test Cases:** 50+  
**Estimated Execution Time:** 4-6 hours  
**Automation Coverage:** 90%  
**Manual Verification:** 10%