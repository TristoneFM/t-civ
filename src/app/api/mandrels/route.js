import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Current from '@/app/models/Current';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const stationName = searchParams.get('stationName');

    if (!stationName) {
      return NextResponse.json(
        { error: 'Station name is required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const current = await Current.findOne({ stationName })
      .select('mandrelConfig');

    if (!current) {
      return NextResponse.json(
        { error: 'No mandrels found for this station' },
        { status: 404 }
      );
    }

    return NextResponse.json(current.mandrelConfig);
  } catch (error) {
    console.error('Error fetching mandrels:', error);
    return NextResponse.json(
      { error: 'Error fetching mandrels' },
      { status: 500 }
    );
  }
} 