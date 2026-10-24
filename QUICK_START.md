# AgriTrade Direct - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### Project Structure
```
agritrade-direct-main/
├── backend/          # Express.js API server
└── frontend/         # React + Vite application
```

## 📦 Installation

### 1. Backend Setup

```bash
# Navigate to backend directory
cd agritrade-direct-main/backend

# Install dependencies
npm install

# The .env file is already configured with MongoDB Atlas
# If you want to use local MongoDB, edit backend/.env:
# MONGODB_URI=mongodb://localhost:27017/agritrade

# Create first admin user (optional but recommended)
npm run create-admin

# Start the backend server
npm run dev
```

The backend server will start on **http://localhost:5000**

### 2. Frontend Setup

```bash
# Open a new terminal
# Navigate to frontend directory
cd agritrade-direct-main

# Install dependencies
npm install

# The .env file is already created with the API URL
# Start the frontend development server
npm run dev
```

The frontend will start on **http://localhost:5173** (or another port if 5173 is busy)

## 🔧 Configuration Files

### Backend `.env` (already configured)
```env
MONGODB_URI=mongodb+srv://worktrack:keshav123@cluster0.b2xtzoa.mongodb.net/Kisan_setu
PORT=5000
JWT_SECRET=devsecret123
```

### Frontend `.env` (already created)
```env
VITE_API_URL=http://localhost:5000/api
```

## 👥 User Roles

The application supports three user roles:

1. **Farmer** - Can sell crops, manage farm details, access schemes
2. **Buyer** - Can browse and purchase crops from farmers
3. **Admin** - Can manage users, verify accounts, oversee platform

## 🎯 Quick Test

### Register a New Farmer
1. Open http://localhost:5173
2. Click "Register"
3. Select "Farmer" role
4. Fill in the form:
   - Name: John Farmer
   - Email: farmer@test.com
   - Phone: 1234567890
   - Village: Green Valley
   - Farm Size: 10 (acres)
   - Password: password123
   - Confirm Password: password123
5. Click "Create Account"

### Register a New Buyer
1. Click "Register"
2. Select "Buyer" role
3. Fill in the form:
   - Name: Jane Buyer
   - Email: buyer@test.com
   - Phone: 9876543210
   - Village: City Center
   - Business Name: Fresh Foods Ltd
   - Password: password123
   - Confirm Password: password123
4. Click "Create Account"

### Login
1. Go to http://localhost:5173/login
2. Select your role (Farmer/Buyer/Admin)
3. Enter email and password
4. Click "Sign In"

### Create Admin (via CLI)
```bash
cd backend
npm run create-admin
# Follow the prompts
```

## 🛠️ Common Issues & Solutions

### Backend won't start
- **Error: MongoDB connection failed**
  - Check if MongoDB is running (local) or internet connection (Atlas)
  - Verify MONGODB_URI in backend/.env
  - Check MongoDB Atlas IP whitelist (should allow all IPs: 0.0.0.0/0)

- **Error: Port 5000 already in use**
  - Change PORT in backend/.env to another port (e.g., 5001)
  - Update VITE_API_URL in frontend .env accordingly

### Frontend won't start
- **Error: Port 5173 already in use**
  - Vite will automatically use the next available port
  - Check the terminal output for the actual port

- **Error: API calls failing**
  - Make sure backend is running on port 5000
  - Check VITE_API_URL in .env file
  - Check browser console for CORS errors

### Registration fails
- **"Farm size is required for farmers"**
  - Enter a valid number in the Farm Size field (e.g., 5, 10.5)

- **"Email already exists"**
  - Use a different email address
  - Or login with the existing email

### Login fails
- **"Invalid credentials"**
  - Check email and password are correct
  - Make sure you selected the correct role
  - Farmers should select "Farmer", Buyers should select "Buyer"

## 📝 API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Get current user
- POST `/api/auth/register-admin` - Create admin (admin only)
- PATCH `/api/auth/verify/:userId` - Verify user (admin only)

### Users
- GET `/api/users/me` - Get current user profile
- PUT `/api/users/me` - Update profile
- GET `/api/users` - Get all users (admin only)
- GET `/api/users/:id` - Get user by ID (admin only)
- PATCH `/api/users/:id/status` - Update user status (admin only)

### Other Features
- Wallet management
- Bank details
- Schemes/Subscriptions
- Orders

## 🎨 Features

✅ User authentication with JWT  
✅ Role-based access control (Farmer, Buyer, Admin)  
✅ MongoDB database integration  
✅ Responsive UI with shadcn/ui components  
✅ Real-time form validation  
✅ Password hashing with bcrypt  
✅ Protected routes  
✅ Toast notifications  

## 📱 Routes

### Public Routes
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page

### Farmer Routes
- `/farmer` - Farmer dashboard
- `/farmer/crops` - Manage crops
- `/farmer/orders` - View orders
- `/farmer/wallet` - Wallet management
- `/farmer/schemes` - Government schemes

### Buyer Routes
- `/buyer` - Buyer dashboard
- `/buyer/browse` - Browse products
- `/buyer/orders` - Order history
- `/buyer/wallet` - Wallet management

### Admin Routes
- `/admin` - Admin dashboard
- `/admin/farmers` - Manage farmers
- `/admin/buyers` - Manage buyers
- `/admin/transactions` - View transactions
- `/admin/schemes` - Manage schemes

## 🔒 Security

- Passwords are hashed using bcrypt (12 salt rounds)
- JWT tokens expire after 7 days
- Role-based middleware protection
- Input validation on both frontend and backend
- CORS enabled for development

## 📚 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React 18
- Vite
- TailwindCSS
- shadcn/ui components
- React Router
- TanStack Query
- Sonner (toasts)

## 🐛 Debug Mode

To see detailed logs:

### Backend
```bash
cd backend
# Logs are printed to console by default
npm run dev
```

### Frontend
Open browser DevTools (F12) → Console tab

## 💡 Tips

1. **First time setup**: Create an admin user using `npm run create-admin` in the backend directory
2. **Testing**: Use different browsers/incognito mode to test multiple users simultaneously
3. **Development**: Keep both backend and frontend terminals open to see real-time logs
4. **Production**: Set stronger JWT_SECRET before deploying

## 📞 Support

If you encounter any issues:
1. Check this README
2. Review backend/MONGODB_SETUP.md for database details
3. Check the terminal logs for errors
4. Verify all .env files are correctly configured

## 🚀 Next Steps

After getting the app running:
1. Create an admin account
2. Register as a farmer and buyer
3. Explore the dashboard features
4. Test wallet functionality
5. Try creating and managing orders

---

**Happy Coding! 🌾**
