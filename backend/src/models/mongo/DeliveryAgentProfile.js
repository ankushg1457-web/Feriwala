const mongoose = require('mongoose');

const deliveryAgentProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  assignedShopId: { type: Number, default: null },
  isOnline: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  currentLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    updatedAt: { type: Date, default: Date.now },
  },
  vehicleType: { type: String, enum: ['bike', 'scooter', 'bicycle', 'walk'], default: 'bike' },
  completedDeliveries: { type: Number, default: 0 },
  completedReturns: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0, min: 1, max: 5 },
  totalRatings: { type: Number, default: 0 },
}, {
  timestamps: true,
});

deliveryAgentProfileSchema.index({ isOnline: 1, isAvailable: 1 });
deliveryAgentProfileSchema.index({ assignedShopId: 1 });
deliveryAgentProfileSchema.index({ 'currentLocation.latitude': 1, 'currentLocation.longitude': 1 });

module.exports = mongoose.model('DeliveryAgentProfile', deliveryAgentProfileSchema);
