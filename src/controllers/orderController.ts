import { Request, Response } from 'express';
import Order, { IOrder } from '../models/Order';
import User from '../models/User';

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private (Customer)
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { vendor, items, totalAmount, deliveryAddress } = req.body;

    // Verify that vendor exists and is a vendor
    const vendorExists = await User.findOne({
      _id: vendor,
      role: 'vendor'
    });

    if (!vendorExists) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Create order
    const order = await Order.create({
      customer: req.userId,
      vendor,
      items,
      totalAmount,
      deliveryAddress,
      status: 'pending',
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all orders for a vendor
// @route   GET /api/orders/vendor
// @access  Private (Vendor)
export const getVendorOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ vendor: req.userId })
      .populate('customer', 'name email')
      .populate('deliveryPartner', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all orders assigned to a delivery partner
// @route   GET /api/orders/delivery
// @access  Private (Delivery Partner)
export const getDeliveryOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ deliveryPartner: req.userId })
      .populate('customer', 'name email')
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get delivery orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all orders for a customer
// @route   GET /api/orders/customer
// @access  Private (Customer)
export const getCustomerOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ customer: req.userId })
      .populate('vendor', 'name email')
      .populate('deliveryPartner', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('vendor', 'name email')
      .populate('deliveryPartner', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has permission to view this order
    const isAuthorized = 
      req.role === 'vendor' && order.vendor.toString() === req.userId ||
      req.role === 'delivery' && order.deliveryPartner?.toString() === req.userId ||
      req.role === 'customer' && order.customer.toString() === req.userId;

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Assign delivery partner to order
// @route   PUT /api/orders/:id/assign
// @access  Private (Vendor)
export const assignDeliveryPartner = async (req: Request, res: Response) => {
  try {
    const { deliveryPartnerId } = req.body;
    
    // Check if delivery partner exists and has the right role
    const deliveryPartner = await User.findOne({
      _id: deliveryPartnerId,
      role: 'delivery'
    });
    
    if (!deliveryPartner) {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }
    
    // Find the order
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if the vendor owns this order
    if (order.vendor.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to assign this order' });
    }
    
    // Update order
    order.deliveryPartner = deliveryPartner._id;
    order.status = 'assigned';
    
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Assign delivery partner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Delivery Partner)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['pending', 'assigned', 'in-transit', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Find the order
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if the delivery partner is assigned to this order
    if (order.deliveryPartner?.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }
    
    // Update order status
    order.status = status as 'pending' | 'assigned' | 'in-transit' | 'delivered' | 'cancelled';
    
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
