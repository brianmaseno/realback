import mongoose, { Schema, Document } from 'mongoose';

export interface ILocation extends Document {
  order: mongoose.Types.ObjectId;
  deliveryPartner: mongoose.Types.ObjectId;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
}

const LocationSchema: Schema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    deliveryPartner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create an index on the order field
LocationSchema.index({ order: 1 });

// Create a compound index on deliveryPartner and timestamp
LocationSchema.index({ deliveryPartner: 1, timestamp: -1 });

export default mongoose.model<ILocation>('Location', LocationSchema);
