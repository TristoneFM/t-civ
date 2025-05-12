import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const now = new Date();
    return NextResponse.json({
      time: now.toISOString(),
      hours: now.getHours(),
      minutes: now.getMinutes()
    });
  } catch (error) {
    console.error('Error getting server time:', error);
    return NextResponse.json({ error: 'Failed to get server time' }, { status: 500 });
  }
} 