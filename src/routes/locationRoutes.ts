import { Router } from 'express';
import { 
  updateLocation, 
  getLatestLocation, 
  getLocationHistory 
} from '../controllers/locationController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// @route   POST /api/location/update
// @desc    Update delivery partner location
// @access  Private (Delivery Partner)
router.post('/update', authorize('delivery'), updateLocation);

// @route   GET /api/location/:orderId
// @desc    Get latest location for an order
// @access  Private
router.get('/:orderId', getLatestLocation);

// @route   GET /api/location/:orderId/history
// @desc    Get location history for an order
// @access  Private
router.get('/:orderId/history', getLocationHistory);

export default router;
