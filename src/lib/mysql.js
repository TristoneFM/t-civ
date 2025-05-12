import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  charset: 'utf8mb4',
  timezone: '+00:00',
};

// Helper function to execute queries with connection management
export async function query(sql, params, database = null) {
  let connection;
  try {
    // Create a new connection for each query
    const config = database 
      ? { ...dbConfig, database } 
      : dbConfig;
    connection = await mysql.createConnection(config);
    
    // Use query() for bulk inserts (when params is an array of arrays)
    // and execute() for prepared statements
    const isBulkInsert = Array.isArray(params) && Array.isArray(params[0]);
    const [results] = isBulkInsert 
      ? await connection.query(sql, params)
      : await connection.execute(sql, params);
    
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
  }
}

// Helper function to execute a transaction
export async function transaction(callback, database = null) {
  let connection;
  try {
    // Create a new connection for the transaction
    const config = database 
      ? { ...dbConfig, database } 
      : dbConfig;
    connection = await mysql.createConnection(config);
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
  }
}

// Helper function to check database connection
export async function checkConnection(database = null) {
  let connection;
  try {
    const config = database 
      ? { ...dbConfig, database } 
      : dbConfig;
    connection = await mysql.createConnection(config);
    await connection.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
  }
} 