import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { query } from '@/lib/mysql';
import Current from '@/app/models/Current';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shift = searchParams.get('shift');

    if (!shift) {
      return NextResponse.json(
        { error: 'Shift parameter is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Get all current documents for autoclaves
    const currentDocs = await Current.find({
      stationName: { $regex: /autoclave/i },
      plant_code: "5210"
    }).select('stationName quantity mandrelConfig');

    // Get all captures for today and current shift
    const captures = await query(
      `SELECT 
        station_name,
        SUM(piezas_buenas) as total_buenas,
        SUM(piezas_malas) as total_malas
      FROM captures 
      WHERE DATE(fecha_hora) = ? 
      AND shift = ?
      GROUP BY station_name`,
      [today, shift],
      't-civ'
    );

    // Format the data
    const formattedData = currentDocs.map(doc => {
      const mandriles = doc.mandrelConfig?.length || 0;
      const ciclosTMES = doc.quantity || 0;
      const piezasProgramadas = mandriles * ciclosTMES;

      // Find captures for this autoclave
      const autoclaveCapture = captures.find(c => c.station_name === doc.stationName) || { total_buenas: 0, total_malas: 0 };
      
      return {
        autoclave: doc.stationName,
        ciclosTMES,
        mandriles,
        piezasProgramadas,
        piezasBuenas: parseInt(autoclaveCapture.total_buenas) || 0,
        piezasMalas: parseInt(autoclaveCapture.total_malas) || 0,
        piezasTotal: parseInt(autoclaveCapture.total_buenas) + parseInt(autoclaveCapture.total_malas)
      };
    });

    // Sort by autoclave name
    formattedData.sort((a, b) => a.autoclave.localeCompare(b.autoclave));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching production statistics:', error);
    return NextResponse.json(
      { error: 'Error fetching production statistics' },
      { status: 500 }
    );
  }
} 