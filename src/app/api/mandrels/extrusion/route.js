import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mandrel = searchParams.get('mandrel');

    if (!mandrel) {
      return NextResponse.json(
        { no_sap: 'No disponible' },
        { status: 200 }
      );
    }

    // Query to get SAP extrusion number from extr table
    const rows = await query(
      'SELECT no_sap FROM extr WHERE cust_part = ?',
      [mandrel],
      'b10_bartender'
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { no_sap: 'No disponible' },
        { status: 200 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { no_sap: 'No disponible' },
      { status: 200 }
    );
  }
} 