import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

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

    // Create MySQL connection
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST2,
      user: process.env.MYSQL_USER2,
      password: process.env.MYSQL_PASSWORD2,
      database: 'b10_bartender'
    });

    // Query to get client details
    const [rows] = await connection.execute(
      'SELECT client FROM vulc WHERE no_sap = ?',
      [sapNumber]
    );

    await connection.end();

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