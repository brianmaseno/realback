import { Router } from 'express';
import { 
  createOrder, 
  getVendorOrders, 
  getDeliveryOrders, 
  getCustomerOrders, 
  getOrderById, 
  assignDeliveryPartner, 
  updateOrderStatus 
} from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private (Customer)
router.post('/', authorize('customer'), createOrder);

// @route   GET /api/orders/vendor
// @desc    Get all orders for a vendor
// @access  Private (Vendor)
router.get('/vendor', authorize('vendor'), getVendorOrders);

// @route   GET /api/orders/delivery
// @desc    Get all orders assigned to a delivery partner
// @access  Private (Delivery Partner)
router.get('/delivery', authorize('delivery'), getDeliveryOrders);

// @route   GET /api/orders/customer
// @desc    Get all orders for a customer
// @access  Private (Customer)
router.get('/customer', authorize('customer'), getCustomerOrders);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', getOrderById);

// @route   PUT /api/orders/:id/assign
// @desc    Assign delivery partner to order
// @access  Private (Vendor)
router.put('/:id/assign', authorize('vendor'), assignDeliveryPartner);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Delivery Partner)
router.put('/:id/status', authorize('delivery'), updateOrderStatus);

export default router;
