# MongoDB Setup for AgriTrade Direct

## Overview

All farmer, buyer, and admin login credentials and profile data are stored, validated, and managed using MongoDB.

## Database Schema

### User Model

The User model supports three role types: **farmer**, **buyer**, and **admin**.

#### Common Fields (All Users)
- `name` - User's full name (required, 2-100 characters)
- `email` - Unique email address (required, validated format)
- `password` - Hashed password (required, min 6 characters)
- `role` - User role: farmer, buyer, or admin (required)
- `phone` - Phone number (optional, validated format)
- `village` - Village/location name (optional)
- `address` - Full address (optional)
- `profileImage` - Profile image URL (optional)
- `isVerified` - Account verification status (default: false)
- `isActive` - Account active status (default: true)
- `lastLogin` - Last login timestamp
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

#### Farmer-Specific Fields
- `farmSize` - Size of farm in acres (required for farmers)
- `crops` - Array of crops grown (optional)

#### Buyer-Specific Fields
- `businessName` - Business name (optional)
- `gstNumber` - GST number (optional, validated format)

#### Admin Tracking Fields
- `verifiedBy` - ID of admin who verified the account
- `verifiedAt` - Verification timestamp

## Setup Instructions

### 1. Install MongoDB

#### Local Installation
- Download MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
- Follow installation instructions for your OS
- Start MongoDB service

#### MongoDB Atlas (Cloud)
- Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster
- Get your connection string

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb://localhost:27017/agritrade
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agritrade
   
   JWT_SECRET=your-secure-secret-key
   ```

3. Generate a secure JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

### 3. Create Initial Admin User

Run the admin creation script:

```bash
node create-admin.js
```

Follow the prompts to create the first admin account.

## API Endpoints

### Authentication

#### Register (Farmer/Buyer)
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "farmer",
  "phone": "1234567890",
  "village": "Green Valley",
  "farmSize": 5.5,
  "crops": ["wheat", "rice"]
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword",
  "role": "farmer"
}
```

#### Register Admin (Admin Only)
```http
POST /api/auth/register-admin
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "adminpassword",
  "phone": "1234567890"
}
```

#### Verify User (Admin Only)
```http
PATCH /api/auth/verify/:userId
Authorization: Bearer <admin-token>
```

### User Management

#### Get Current User Profile
```http
GET /api/users/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "9876543210",
  "village": "New Village"
}
```

#### Get All Users (Admin Only)
```http
GET /api/users?role=farmer&isVerified=true&page=1&limit=10
Authorization: Bearer <admin-token>
```

#### Get User by ID (Admin Only)
```http
GET /api/users/:id
Authorization: Bearer <admin-token>
```

#### Update User Status (Admin Only)
```http
PATCH /api/users/:id/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "isActive": false
}
```

#### Delete User (Admin Only)
```http
DELETE /api/users/:id
Authorization: Bearer <admin-token>
```

## Security Features

### Password Security
- Passwords are hashed using bcrypt with salt rounds of 12
- Minimum password length: 6 characters
- Passwords are never returned in API responses

### Authentication
- JWT-based authentication with 7-day token expiration
- Tokens include user ID and role
- Token verification on all protected routes

### Authorization
- Role-based access control (farmer, buyer, admin)
- Route-level middleware for role validation
- Account status checking (active/inactive)
- Verification status checking

### Validation
- Email format validation with regex
- Phone number validation (10-15 digits)
- GST number validation for buyers
- Role-specific field validation
- Unique email constraint

## Middleware

### Available Middleware
- `authMiddleware` - Verify JWT token and attach user to request
- `adminMiddleware` - Ensure user has admin role
- `farmerMiddleware` - Ensure user has farmer role
- `buyerMiddleware` - Ensure user has buyer role
- `roleMiddleware(...roles)` - Allow multiple specific roles
- `verifiedMiddleware` - Ensure user account is verified

### Usage Example
```javascript
import { authMiddleware, farmerMiddleware } from './middleware/auth.js';

// Farmer-only route
router.post('/crops', authMiddleware, farmerMiddleware, createCrop);

// Multiple roles allowed
router.get('/products', authMiddleware, roleMiddleware('farmer', 'buyer'), getProducts);
```

## Database Indexes

The following indexes are created for optimal query performance:
- `email` (unique)
- `role`
- `email + role` (compound)
- `createdAt` (descending)

## Running the Server

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production mode
npm start
```

## MongoDB Connection

The server will:
1. Attempt to connect to MongoDB on startup
2. Log connection success or failure
3. Exit with error code 1 if connection fails
4. Automatically reconnect on connection loss

## Troubleshooting

### Connection Issues
- Verify MongoDB is running: `mongosh` or `mongo`
- Check MONGODB_URI in .env file
- For Atlas: Check IP whitelist and credentials

### Authentication Errors
- Verify JWT_SECRET is set in .env
- Check token format: `Bearer <token>`
- Ensure token hasn't expired (7 days)

### Validation Errors
- Check required fields for each role
- Verify email format
- Ensure password meets minimum length
- For farmers: farmSize is required
- For buyers: GST number must match format (if provided)

## Admin Features

Admins can:
- Create other admin accounts
- View all users with filtering and pagination
- Verify user accounts
- Activate/deactivate user accounts
- Delete user accounts
- View complete user profiles including verification details

## Best Practices

1. **Never commit .env file** - Contains sensitive credentials
2. **Use strong JWT secrets** - Generate random 64-byte strings
3. **Regular backups** - Backup MongoDB regularly
4. **Monitor failed logins** - Implement rate limiting if needed
5. **Verify admin actions** - Log all admin operations
6. **Keep MongoDB updated** - Use latest stable version
7. **Use environment-specific configs** - Different settings for dev/prod

## Support

For issues or questions:
- Check MongoDB logs
- Review server console output
- Verify all required fields in requests
- Ensure proper authentication headers
