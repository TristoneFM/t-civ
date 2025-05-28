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
    const rows = await query(
      `SELECT 
        d.id AS defect_id,
        d.defect_code,
        d.description AS defect_name,
        c.mandrel,
        c.sap_number_extrusion,
        c.shift,
        SUM(cd.defect_count) AS total_malas
      FROM capture_defects cd
      JOIN captures c ON cd.capture_id = c.id
      JOIN defects d ON cd.defect_id = d.id
      WHERE c.fecha_hora BETWEEN ? AND ?
      GROUP BY d.id, c.mandrel, c.sap_number_extrusion, c.shift
      ORDER BY total_malas DESC`,
      [start, end],
      't-civ-test'
    );
    console.log(rows);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching defect summary:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 