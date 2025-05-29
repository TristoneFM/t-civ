import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { query } from '@/lib/mysql';
import Current from '@/app/models/Current';
import Final from '@/app/models/Final';

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

    const todayMysql = new Date().toISOString().split('T')[0];
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all current documents for autoclaves
    const currentDocs = await Current.find({
      stationName: { $regex: /autoclave/i },
      plant_code: "5210"
    }).select('stationName quantity mandrelConfig');

    // Get all finals documents for today
    const shiftNumber = shift === 'A' ? 1 : 2;
    const finalsDocs = await Final.find({
      stationName: { $regex: /autoclave/i },
      plant_code: "5210",
      shift: shiftNumber,
      startTime: {
        $gte: today,
        $lt: tomorrow
      }
    }).select('stationName quantity');

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
      [todayMysql, shift],
      't-civ'
    );

    // Format the data
    const formattedData = currentDocs.map(doc => {
      // Find matching finals documents for this autoclave
      const matchingFinals = finalsDocs.filter(f => f.stationName === doc.stationName);
      const finalsQuantity = matchingFinals.reduce((sum, f) => sum + (f.quantity || 0), 0);
      
      // Combine current quantity with finals quantity
      const totalQuantity = (doc.quantity || 0) + finalsQuantity;

      // Convert MongoDB document to plain object if needed
      const mandrelConfigArray = Array.isArray(doc.mandrelConfig) 
        ? doc.mandrelConfig.map(config => config.toObject ? config.toObject() : config)
        : [];
      
      const mandriles = mandrelConfigArray.reduce((sum, config) => {
        const quantity = Number(config.quantity) || 0;
        return sum + quantity;
      }, 0);
      
      const ciclosTMES = totalQuantity;
      let piezasProgramadas = (mandriles/2) * ciclosTMES;
      piezasProgramadas = Math.floor(piezasProgramadas);

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