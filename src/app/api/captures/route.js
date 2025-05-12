import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      station_name,
      mandrel,
      client,
      sap_number,
      inspector,
      fecha_hora,
      piezas_buenas,
      piezas_malas,
      defects // array of { defect_id, defect_count }
    } = body;

    if (!station_name || !mandrel || !sap_number || !fecha_hora) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST2,
      user: process.env.MYSQL_USER2,
      password: process.env.MYSQL_PASSWORD2,
      database: 't-civ'
    });

    // Insert into captures
    const [captureResult] = await connection.execute(
      `INSERT INTO captures (station_name, mandrel, client, sap_number, inspector, fecha_hora, piezas_buenas, piezas_malas)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [station_name, mandrel, client, sap_number, inspector, fecha_hora, piezas_buenas, piezas_malas]
    );
    const capture_id = captureResult.insertId;

    // Insert defects
    if (Array.isArray(defects) && defects.length > 0) {
      const defectInserts = defects.map(d => [capture_id, d.defect_id, d.defect_count]);
      await connection.query(
        'INSERT INTO capture_defects (capture_id, defect_id, defect_count) VALUES ?',[defectInserts]
      );
    }

    await connection.end();
    return NextResponse.json({ success: true, capture_id });
  } catch (error) {
    console.error('Error saving capture:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 