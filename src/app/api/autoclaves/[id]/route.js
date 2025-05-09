import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Station from '@/app/models/Autoclave';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const station = await Station.findById(params.id)
      .select('_id stationName plantCode');

    if (!station) {
      return NextResponse.json(
        { error: 'Station not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(station);
  } catch (error) {
    console.error('Error fetching station:', error);
    return NextResponse.json(
      { error: 'Error fetching station' },
      { status: 500 }
    );
  }
} 