import mongoose from 'mongoose';

const currentSchema = new mongoose.Schema({
  stationName: String,
  mandrelConfig: [{
    mandrel: String,
    status: String
  }],
  quantity: Number,
  
}, { 
  collection: 'currents' 
});

export default mongoose.models.Current || mongoose.model('Current', currentSchema); 