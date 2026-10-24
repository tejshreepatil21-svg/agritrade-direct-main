# AgriTrade Direct

A full-stack agricultural marketplace platform connecting farmers directly with buyers.

## Features

- **User Authentication**: Login and registration for farmers, buyers, and admins
- **Dashboard**: Role-based dashboards for farmers, buyers, and admins
- **Wallet System**: In-app wallet for transactions
- **Government Schemes**: Application system for subsidies and schemes
- **Order Management**: Create and track orders
- **Bank Details**: Store and manage bank account information
- **Responsive UI**: Fully responsive design for mobile, tablet, and desktop

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- React Query (TanStack Query)
- Lucide Icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Project Structure

```
agritrade-direct-main/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/              # Page components
│   ├── context/            # React context (Auth)
│   ├── lib/                # Utilities and API config
│   └── hooks/              # Custom hooks
├── backend/                # Backend API
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   └── server.js           # Express server entry point
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Setup Instructions

### 1. Frontend Setup

```bash
# Navigate to project root
cd agritrade-direct-main

# Install dependencies
npm install

# Create environment file (optional - for API URL)
# Create .env file in root with:
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

Frontend will run on `http://localhost:8080`

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file and set:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/agritrade
# JWT_SECRET=your-secret-key-change-this-in-production
# NODE_ENV=development

# Start MongoDB (if running locally)
# Make sure MongoDB is running on your system

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. MongoDB Setup

#### Local MongoDB:
```bash
# Install and start MongoDB locally
# Or use MongoDB Compass to connect
```

#### MongoDB Atlas (Cloud):
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in backend `.env` file

## Running the Application

### Development Mode

1. **Start MongoDB** (if using local)
2. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```
3. **Start Frontend**:
   ```bash
   npm run dev
   ```

### Production Build

1. **Build Frontend**:
   ```bash
   npm run build
   ```

2. **Start Backend**:
   ```bash
   cd backend
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile

### Wallet
- `GET /api/wallet` - Get wallet status
- `POST /api/wallet/add` - Add money to wallet
- `POST /api/wallet/withdraw` - Withdraw money

### Bank Details
- `GET /api/bank` - Get bank details
- `POST /api/bank` - Add/Update bank details

### Subscriptions
- `GET /api/subscriptions/schemes` - Get all schemes
- `GET /api/subscriptions` - Get user subscriptions
- `POST /api/subscriptions/apply` - Apply for scheme

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

## Notes

### TypeScript to JavaScript Migration

- All `.tsx` files have been converted to `.jsx`
- TypeScript types and interfaces have been removed
- Some UI components in `src/components/ui/` may still have `.tsx` extensions and need manual conversion
- To complete the migration, convert remaining `.tsx` files in `src/components/ui/` to `.jsx`

### Remaining Tasks

1. Convert remaining UI components from `.tsx` to `.jsx` (if any)
2. Remove TypeScript config files (`tsconfig.json`, `tsconfig.app.json`, etc.) if no longer needed
3. Update `index.html` to point to `main.jsx` instead of `main.tsx`

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check `MONGODB_URI` in backend `.env` file
- Verify network connectivity if using MongoDB Atlas

### CORS Issues
- Backend CORS is configured to allow all origins in development
- Update CORS settings in `backend/server.js` for production

### Port Already in Use
- Change ports in `vite.config.js` (frontend) or `.env` (backend)

## License

ISC
