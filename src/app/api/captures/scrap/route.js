import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const station = searchParams.get('station');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!station || !start || !end) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    console.log('Received parameters:', { station, start, end });

    const sql = `
      SELECT mandrel, SUM(piezas_malas) as malas
      FROM captures
      WHERE station_name = ?
        AND fecha_hora >= ?
        AND fecha_hora <= ?
      GROUP BY mandrel
      HAVING SUM(piezas_malas) > 0
    `;
    const results = await query(sql, [station, start, end], 't-civ-test');
    const totalMalas = results.reduce((sum, row) => sum + Number(row.malas || 0), 0);

    return NextResponse.json({ totalMalas, porMandril: results });
  } catch (error) {
    console.error('Error in scrap API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 