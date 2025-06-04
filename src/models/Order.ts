import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  customer: mongoose.Types.ObjectId;
  vendor: mongoose.Types.ObjectId;
  deliveryPartner?: mongoose.Types.ObjectId;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'assigned' | 'in-transit' | 'delivered' | 'cancelled';
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
}

const OrderSchema: Schema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deliveryPartner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in-transit', 'delivered', 'cancelled'],
      default: 'pending',
    },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
