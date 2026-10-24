import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// General authentication middleware
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Support fixed admin tokens without DB lookup
    if (decoded.role === 'admin' && decoded.adminEmail === 'patelkeshav03@gmail.com') {
      req.user = {
        _id: undefined,
        name: 'Admin',
        email: decoded.adminEmail,
        role: 'admin',
        isVerified: true,
        isActive: true,
      };
    } else {
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }

      req.user = user;
    }
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Admin-only middleware
export const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

// Farmer-only middleware
export const farmerMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'farmer') {
    return res.status(403).json({ message: 'Farmer access required' });
  }
  
  next();
};

// Buyer-only middleware
export const buyerMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'buyer') {
    return res.status(403).json({ message: 'Buyer access required' });
  }
  
  next();
};

// Multiple roles middleware
export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }
    
    next();
  };
};

// Verified users only middleware
export const verifiedMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (!req.user.isVerified) {
    return res.status(403).json({ 
      message: 'Account verification required. Please contact admin.' 
    });
  }
  
  next();
};
