import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '2mutHwzd3LgsP27.root',
  password: 'GBi554ID2Jx6OGlK',
  database: 'titik_ngunyah',
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: false },
});

async function run() {
  const [rows] = await pool.query(`
    SELECT id, queue_number, customer_name,
           CAST(created_at AS CHAR) as raw_created_at,
           DATE(created_at) as raw_date,
           DATE(CONVERT_TZ(created_at, '+00:00', '+08:00')) as wita_date
    FROM orders 
    WHERE id >= 766150
    ORDER BY id ASC
  `);
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

run();
