import mongoose from 'mongoose';

const finalSchema = new mongoose.Schema({
  stationName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  plant_code: {
    type: String,
    required: true
  },
  shift: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'in_progress', 'cancelled'],
    default: 'in_progress'
  },
  mandrelConfig: [{
    quantity: Number,
    reference: String,
    mandrel: String,
    mandrelStdTime: Number,
    trolley: String
  }]
}, {
  timestamps: true
});

// Create index for faster queries
finalSchema.index({ stationName: 1, startTime: 1 });
finalSchema.index({ plant_code: 1 });

const Final = mongoose.models.Final || mongoose.model('Final', finalSchema);

export default Final; 