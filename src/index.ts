import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes';
import orderRoutes from './routes/orderRoutes';
import locationRoutes from './routes/locationRoutes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: '*',  // Allow connections from any origin for now
    methods: ['GET', 'POST'],
    credentials: true
  },
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',  // Allow connections from any origin for now
  credentials: true,
}));

// Set up routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/location', locationRoutes);

// Health check route
app.get('/', (_req, res) => {
  res.send('API is running...');
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log('New client connected');

  // Join a room for specific order updates
  socket.on('join-order-room', (orderId: string) => {
    socket.join(`order:${orderId}`);
    console.log(`Socket joined room: order:${orderId}`);
  });

  // Leave order room
  socket.on('leave-order-room', (orderId: string) => {
    socket.leave(`order:${orderId}`);
    console.log(`Socket left room: order:${orderId}`);
  });

  // Handle location update
  socket.on('location-update', (data: { orderId: string; location: any }) => {
    // Broadcast to everyone in the specific order room
    io.to(`order:${data.orderId}`).emit('location-updated', data.location);
  });

  // Handle order status update
  socket.on('status-update', (data: { orderId: string; status: string }) => {
    // Broadcast to everyone in the specific order room
    io.to(`order:${data.orderId}`).emit('status-updated', data.status);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export the io instance for use in other files if needed
export { io };
