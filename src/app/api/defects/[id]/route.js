import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { defect_code, description } = await request.json();
    if (!defect_code || !description) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }
    await query(
      'UPDATE defects SET defect_code = ?, description = ? WHERE id = ?',
      [defect_code, description, id],
      't-civ-test'
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating defect:', error);
    return NextResponse.json({ error: 'Error al actualizar el defecto' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await query('DELETE FROM defects WHERE id = ?', [id], 't-civ-test');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting defect:', error);
    return NextResponse.json({ error: 'Error al eliminar el defecto' }, { status: 500 });
  }
} 