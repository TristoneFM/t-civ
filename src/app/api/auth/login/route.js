import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function POST(request) {
  try {
    const { employeeId } = await request.json();

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Query the database to check if the employee exists and get their access level
    const employees = await query(
      `SELECT emp_num, emp_name 
       FROM b10.empleados 
       WHERE emp_num = ?`,
      [employeeId],
      'b10'
    );

    if (employees.length === 0) {
      return NextResponse.json(
        { error: 'Employee ID not found' },
        { status: 404 }
      );
    }

    const employee = employees[0];
    const accessLevel = employee.acc_inventario;

    // Determine access permissions based on acc_inventario value
    let permissions = [];
    if (accessLevel === 1) {
      permissions = ['capture'];
    } else if (accessLevel === 2 || accessLevel === 3) {
      permissions = ['capture', 'audit'];
    }

    return NextResponse.json({
      success: true,
      employeeId: employee.acc_id,
      accessLevel,
      permissions
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error during login' },
      { status: 500 }
    );
  }
} 