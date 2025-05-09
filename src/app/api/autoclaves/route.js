import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Station from '@/app/models/Autoclave';

export async function GET() {
  try {
    await connectDB();
    
    // Find stations with plantCode 5210 and stationName containing 'AUTOCLAVE'
    const stations = await Station.find({
      plantCode: '5210',
      stationName: { $regex: 'AUTOCLAVE', $options: 'i' } // Case-insensitive search
    })
    .select('_id stationName plantCode') // Select only needed fields
    .sort({ stationName: 1 });

    return NextResponse.json(stations);
  } catch (error) {
    console.error('Error fetching stations:', error);
    return NextResponse.json(
      { error: 'Error fetching stations' },
      { status: 500 }
    );
  }
} 