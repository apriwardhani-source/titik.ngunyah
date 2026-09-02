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
  const [r1] = await pool.query("SELECT NOW() as db_now, CURDATE() as db_date");
  const [r2] = await pool.query("SELECT CONVERT_TZ(NOW(), '+00:00', '+08:00') as wita_now, DATE(CONVERT_TZ(NOW(), '+00:00', '+08:00')) as wita_date");
  const [r3] = await pool.query("SELECT queue_number, created_at FROM orders ORDER BY id DESC LIMIT 5");
  console.log("DB NOW (UTC):", r1[0]);
  console.log("WITA NOW:", r2[0]);
  console.log("Last 5 orders:", r3);
  await pool.end();
}

run();
