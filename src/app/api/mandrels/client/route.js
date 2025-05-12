import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sapNumber = searchParams.get('sapNumber');

    if (!sapNumber) {
      return NextResponse.json(
        { client: 'No disponible' },
        { status: 200 }
      );
    }

    // Query to get client details
    const rows = await query(
      'SELECT client FROM vulc WHERE no_sap = ?',
      [sapNumber],
      'b10_bartender'
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { client: 'No disponible' },
        { status: 200 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { client: 'No disponible' },
      { status: 200 }
    );
  }
} 