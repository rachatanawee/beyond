# Comprehensive Test Suite with Playwright

This directory contains comprehensive end-to-end tests using Playwright for the Beyond application, covering all major features including user management, authentication, and internationalization.

## Test Structure

### Core Test Files
- `homepage.spec.ts` - Homepage functionality and content display
- `auth.spec.ts` - Authentication flows (login, registration, OAuth)
- `navigation.spec.ts` - Routing and navigation behavior
- `language-switcher.spec.ts` - Internationalization features
- `responsive.spec.ts` - Responsive design across devices
- `accessibility.spec.ts` - WCAG accessibility compliance

### Feature Test Files
- `admin-user-management.spec.ts` - **Complete admin user management suite**
  - User list, search, and filtering
  - Create, edit, delete users
  - Role and status management
  - Export functionality
  - Error handling and validation
- `dashboard.spec.ts` - User dashboard features and navigation
- `profile.spec.ts` - User profile management and form handling

### Test Utilities
- `utils/test-helpers.ts` - Comprehensive helper functions and test patterns
- `utils/fixtures/` - Test data and mock responses

## Running Tests

### Prerequisites
```bash
# Install dependencies
bun install

# Install Playwright browsers
bunx playwright install
```

### Running Tests
```bash
# Run all tests
bun test

# Run specific test suites
bun test:admin          # Admin user management tests
bun test:dashboard      # Dashboard functionality tests
bun test:profile        # Profile management tests
bun test:auth          # Authentication flow tests

# Run tests with UI mode (interactive)
bun test:ui

# Run tests in headed mode (see browser)
bun test:headed

# Run tests with tags
bun test:e2e           # End-to-end tests
bun test:smoke         # Smoke tests

# Run specific test file
bunx playwright test admin-user-management.spec.ts

# Run tests in specific browser
bunx playwright test --project=chromium

# Run tests on mobile
bunx playwright test --project="Mobile Chrome"
```

### Debugging Tests
```bash
# Run tests in debug mode
bunx playwright test --debug

# Generate test code
bunx playwright codegen localhost:3000
```

## Test Coverage

### Homepage Tests
- ✅ Default language redirect
- ✅ Content display in both languages
- ✅ Footer links functionality

### Language Switcher Tests
- ✅ Language switcher visibility
- ✅ Switching between English and Thai
- ✅ Dropdown behavior
- ✅ URL changes with language

### Authentication Tests
- ✅ Sign In button display
- ✅ Login page navigation
- ✅ Form toggle between Sign In/Sign Up
- ✅ OAuth buttons display
- ✅ Form validation
- ✅ Multi-language auth forms

### Navigation Tests
- ✅ Root path redirect
- ✅ Locale preservation
- ✅ Invalid locale handling
- ✅ Query parameter preservation
- ✅ Browser navigation (back/forward)
- ✅ Direct URL access

### Responsive Design Tests
- ✅ Mobile viewport (375px)
- ✅ Tablet viewport (768px)
- ✅ Desktop viewport (1920px)
- ✅ Login form responsiveness

### Accessibility Tests
- ✅ Keyboard navigation
- ✅ Form labels
- ✅ Image alt text
- ✅ Focus management
- ✅ Screen reader compatibility

## Browser Support

Tests run on:
- ✅ Chromium (Desktop)
- ✅ Firefox (Desktop)
- ✅ WebKit/Safari (Desktop)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)

## CI/CD Integration

Tests automatically run on:
- Push to main/master branch
- Pull requests
- GitHub Actions workflow generates HTML reports

## Best Practices

1. **Page Object Model**: Use helper functions for reusable actions
2. **Wait Strategies**: Use `expect()` with proper waiting
3. **Test Isolation**: Each test should be independent
4. **Descriptive Names**: Test names should clearly describe what they test
5. **Error Handling**: Tests should handle async operations properly

## Troubleshooting

### Common Issues
1. **Tests timing out**: Increase timeout in playwright.config.ts
2. **Elements not found**: Check selectors and wait for elements
3. **Flaky tests**: Add proper waits and stable selectors
4. **Browser not launching**: Run `bunx playwright install`

### Debug Commands
```bash
# Show test results
bunx playwright show-report

# Open trace viewer
bunx playwright show-trace trace.zip
```