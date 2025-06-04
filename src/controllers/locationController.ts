import { Request, Response } from 'express';
import Location from '../models/Location';
import Order from '../models/Order';

// @desc    Update delivery partner location
// @route   POST /api/location/update
// @access  Private (Delivery Partner)
export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { orderId, latitude, longitude } = req.body;
    
    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if the delivery partner is assigned to this order
    if (order.deliveryPartner?.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update location for this order' });
    }
    
    // Create a new location entry
    const location = await Location.create({
      order: orderId,
      deliveryPartner: req.userId,
      coordinates: {
        latitude,
        longitude,
      },
    });
    
    // Update the order status to in-transit if not already
    if (order.status !== 'in-transit') {
      order.status = 'in-transit';
      await order.save();
    }
    
    res.status(201).json(location);
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get latest location for an order
// @route   GET /api/location/:orderId
// @access  Private
export const getLatestLocation = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    
    // Check if order exists
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check permissions
    const isAuthorized = 
      req.role === 'vendor' && order.vendor.toString() === req.userId ||
      req.role === 'delivery' && order.deliveryPartner?.toString() === req.userId ||
      req.role === 'customer' && order.customer.toString() === req.userId;
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view this location' });
    }
    
    // Get the latest location
    const latestLocation = await Location.findOne({ order: orderId })
      .sort({ timestamp: -1 })
      .populate('deliveryPartner', 'name');
    
    if (!latestLocation) {
      return res.status(404).json({ message: 'No location data available' });
    }
    
    res.json(latestLocation);
  } catch (error) {
    console.error('Get latest location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get location history for an order
// @route   GET /api/location/:orderId/history
// @access  Private
export const getLocationHistory = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    
    // Check if order exists
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check permissions
    const isAuthorized = 
      req.role === 'vendor' && order.vendor.toString() === req.userId ||
      req.role === 'delivery' && order.deliveryPartner?.toString() === req.userId ||
      req.role === 'customer' && order.customer.toString() === req.userId;
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view this location history' });
    }
    
    // Get location history
    const locationHistory = await Location.find({ order: orderId })
      .sort({ timestamp: 1 });
    
    if (!locationHistory || locationHistory.length === 0) {
      return res.status(404).json({ message: 'No location data available' });
    }
    
    res.json(locationHistory);
  } catch (error) {
    console.error('Get location history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
