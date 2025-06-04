import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Extend the Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      userId?: string;
      role?: string;
    }
  }
}

// Make JWT_SECRET available
const JWT_SECRET = process.env.JWT_SECRET || 'yoursecretsecuritykeyforjsonwebtoken';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    
    // Find user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user to request
    req.user = user;
    req.userId = user._id.toString();
    req.role = user.role;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token, access denied' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.role) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    if (!roles.includes(req.role)) {
      return res.status(403).json({ message: 'Access denied: Unauthorized role' });
    }
    
    next();
  };
};
