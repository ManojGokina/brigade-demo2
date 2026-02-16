# Backend API Integration - Login Flow

## What Was Integrated

### 1. Dependencies Added
- `zustand` - State management
- `axios` - HTTP client

### 2. Files Created

#### `/lib/api.ts`
- Axios instance configured with base URL
- Request interceptor to add Bearer token
- Response interceptor for 401 error handling
- Base URL: `http://localhost:9000/api/v1`

#### `/store/auth.store.ts`
- Zustand store for authentication state
- Persists user, token, and dashboardAccess to localStorage
- Actions:
  - `login(email, password)` - Calls `/auth/login` API
  - `logout()` - Clears auth state
  - `fetchDashboardAccess()` - Calls `/users/dashboard-access` API
  - `clearError()` - Clears error messages

#### `/.env.local`
- Environment variable for API URL
- `NEXT_PUBLIC_API_URL=http://localhost:9000/api/v1`

### 3. Files Modified

#### `/app/login/page.tsx`
- Removed demo/static login logic
- Integrated real API login with email + password
- Added password input field with Lock icon
- Added error alert display
- Form validation (email format + password min 6 chars)
- Removed demo account quick access buttons
- Uses `useAuthStore` instead of `useAuth` context

#### `/app/select-dashboard/page.tsx`
- Uses `useAuthStore` instead of `useAuth` context
- Fetches dashboard access after login
- Updated user display to use `username` instead of `name`

## API Integration Details

### Login API
**Endpoint:** `POST /api/v1/auth/login`

**Request:**
```json
{
  "email": "manojgokina@gmail.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "userId": "58ca2cf3-9bb4-4860-b6fe-807785bee548",
      "username": "manoj gokina",
      "email": "manojgokina@gmail.com",
      "createdAt": "2026-02-15T00:36:12.862Z",
      "updatedAt": "2026-02-15T00:36:12.862Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Dashboard Access API
**Endpoint:** `POST /api/v1/users/dashboard-access`

**Request:**
```json
{
  "user_id": "58ca2cf3-9bb4-4860-b6fe-807785bee548"
}
```

**Headers:**
```
Authorization: Bearer <token>
```

## State Management

### Auth Store State
```typescript
{
  user: User | null,
  token: string | null,
  dashboardAccess: DashboardAccess | null,
  isLoading: boolean,
  error: string | null
}
```

### Token Storage
- Token stored in localStorage as `auth_token`
- Automatically added to all API requests via axios interceptor
- Cleared on logout or 401 response

## User Flow

1. User enters email and password on login page
2. Click "Sign In" button
3. API call to `/auth/login`
4. On success:
   - User and token stored in Zustand store
   - Token saved to localStorage
   - Redirect to `/select-dashboard`
5. On select-dashboard page:
   - Fetch dashboard access via `/users/dashboard-access`
   - Display available dashboards based on permissions
6. On logout:
   - Clear store and localStorage
   - Redirect to `/login`

## Next Steps

To complete the integration:

1. **Dashboard Access Display**
   - Map API dashboard data to dashboard cards
   - Show/hide dashboards based on user permissions
   - Display modules and actions from API response

2. **Protected Routes**
   - Add route guards to check authentication
   - Redirect to login if not authenticated

3. **Additional APIs to Integrate**
   - Case tracking APIs
   - User management APIs
   - Meta data APIs (roles, modules, actions)

4. **Error Handling**
   - Add toast notifications for errors
   - Handle network failures gracefully
   - Add retry logic for failed requests

## Environment Setup

Make sure backend is running on `http://localhost:9000`

To change API URL, update `.env.local`:
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
```
