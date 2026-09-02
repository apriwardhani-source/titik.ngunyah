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
    SELECT id, order_number, queue_number, customer_name, created_at, 
           CONVERT_TZ(created_at, '+00:00', '+08:00') as created_at_wita,
           DATE(CONVERT_TZ(created_at, '+00:00', '+08:00')) as date_wita
    FROM orders 
    ORDER BY id DESC 
    LIMIT 10
  `);
  console.log('Last 10 orders:');
  console.log(JSON.stringify(rows, null, 2));

  const [dateCheck] = await pool.query(`
    SELECT NOW() as now_utc, 
           CONVERT_TZ(NOW(), '+00:00', '+08:00') as now_wita, 
           CURDATE() as curdate_utc, 
           DATE(CONVERT_TZ(NOW(), '+00:00', '+08:00')) as curdate_wita
  `);
  console.log('Date Check:');
  console.log(JSON.stringify(dateCheck, null, 2));

  // Check what the checkout query returns right now
  const [lastOrderRows] = await pool.query(`
    SELECT queue_number, created_at, CONVERT_TZ(created_at, '+00:00', '+08:00') as wita
    FROM orders 
    WHERE DATE(CONVERT_TZ(created_at, '+00:00', '+08:00')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+08:00'))
    ORDER BY id DESC LIMIT 1
  `);
  console.log('Query result for today WITA:');
  console.log(JSON.stringify(lastOrderRows, null, 2));

  process.exit(0);
}

run();
