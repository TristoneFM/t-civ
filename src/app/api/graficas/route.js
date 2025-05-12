import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Current from '@/app/models/Current';

export async function GET() {
  try {
    await connectDB();

    // Get all current documents for autoclaves
    const currentDocs = await Current.find({
      stationName: { $regex: /autoclave/i },
      plant_code: "5210"
    }).select('stationName quantity mandrelConfig');

    // Format the data
    const formattedData = currentDocs.map(doc => {
      const mandriles = doc.mandrelConfig?.length || 0;
      const ciclosTMES = doc.quantity || 0;
      const piezasProgramadas = mandriles * ciclosTMES;

      return {
        autoclave: doc.stationName,
        ciclosTMES,
        mandriles,
        piezasProgramadas,
        piezasBuenas: 0, // We'll get this from captures
        piezasMalas: 0, // We'll get this from captures
        piezasTotal: 0 // We'll get this from captures
      };
    });

    console.log(formattedData); 
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