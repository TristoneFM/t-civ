import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET() {
  try {
    const rows = await query('SELECT id, defect_code, description FROM defects', [], 't-civ');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching defects:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { defect_code, description } = await request.json();
    if (!defect_code || !description) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }
    const result = await query(
      'INSERT INTO defects (defect_code, description) VALUES (?, ?)',
      [defect_code, description],
      't-civ'
    );
    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Error creating defect:', error);
    return NextResponse.json({ error: 'Error al crear el defecto' }, { status: 500 });
  }
} 