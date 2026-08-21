import mysql from 'mysql2/promise';

let pool: mysql.Pool;

export function getDbPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.TIDB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
      port: Number(process.env.TIDB_PORT || 4000),
      user: process.env.TIDB_USER || '2mutHwzd3LgsP27.root',
      password: process.env.TIDB_PASSWORD || 'GBi554ID2Jx6OGlK',
      database: process.env.TIDB_DATABASE || 'titik_ngunyah',
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false,
      },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }
  return pool;
}
