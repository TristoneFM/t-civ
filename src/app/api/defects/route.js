import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET() {
  try {
    const rows = await query('SELECT defect_code, description as name FROM defects', [], 't-civ-test');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching defects:', error);
    return NextResponse.json([], { status: 500 });
  }
} 