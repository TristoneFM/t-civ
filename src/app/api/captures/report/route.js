import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    if (!start || !end) {
      return NextResponse.json({ error: 'Missing start or end date' }, { status: 400 });
    }
    // Query captures and join with client and defects info
    const rows = await query(
      `SELECT c.id, c.station_name, c.mandrel, c.client, c.sap_number, c.sap_number_extrusion, c.inspector, c.fecha_hora, c.piezas_buenas, c.piezas_malas, c.shift
       FROM captures c
       WHERE c.fecha_hora BETWEEN ? AND ?
       ORDER BY c.fecha_hora DESC`,
      [start, end],
      't-civ-test'
    );
    console.log(rows);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 