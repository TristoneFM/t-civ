import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function POST(request) {
  try {
    const { employeeId, isAdmin } = await request.json();

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Query the database to check if the employee exists and get their access level
    const employees = await query(
      `SELECT emp_num, emp_name, emp_sup, emp_area 
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
    const supervisor = employee.emp_sup;
    const area = employee.emp_area;
    

    // Determine access permissions based on area and supervisor status
    let permissions = [];
    
    // If it's an admin login attempt
    if (isAdmin) {
      // Check if the employee is a supervisor (emp_sup = 1)
      if (supervisor === 1) {
        permissions.push('admin');
      } else {
        return NextResponse.json(
          { error: 'No tiene permisos de supervisor' },
          { status: 401 }
        );
      }
    } else {
      // Regular inspector login - allow access if they are in TCIV area
      permissions.push('inspector');
    }

    return NextResponse.json({
      success: true,
      employeeId: employee.emp_num,
      permissions,
      employeeName: employee.emp_name
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error durante el inicio de sesión' },
      { status: 500 }
    );
  }
} 