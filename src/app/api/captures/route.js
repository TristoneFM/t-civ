import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      station_name,
      mandrel,
      client,
      sap_number,
      sap_number_extrusion,
      inspector,
      fecha_hora,
      piezas_buenas,
      piezas_malas,
      defects, // array of { defect_id, defect_count }
      shift
    } = body;

    if (!station_name || !mandrel || !sap_number || !fecha_hora) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert into captures
    const captureResult = await query(
      `INSERT INTO captures (station_name, mandrel, client, sap_number, sap_number_extrusion, inspector, fecha_hora, piezas_buenas, piezas_malas,shift)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [station_name, mandrel, client, sap_number, sap_number_extrusion, inspector, fecha_hora, piezas_buenas, piezas_malas, shift],
      't-civ-test'
    );
    const capture_id = captureResult.insertId;

    // Insert defects
    if (Array.isArray(defects) && defects.length > 0) {
      const defectInserts = defects.map(d => [capture_id, d.defect_id, d.defect_count]);
      await query(
        'INSERT INTO capture_defects (capture_id, defect_id, defect_count) VALUES ?',
        [defectInserts],
        't-civ-test'
      );
    }

    return NextResponse.json({ success: true, capture_id });
  } catch (error) {
    console.error('Error saving capture:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 