import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema({
  plantCode: String,
  stationName: String,
  // Add other fields as needed
}, { 
  collection: 'stations' // Specify the collection name
});

export default mongoose.models.Station || mongoose.model('Station', stationSchema); 