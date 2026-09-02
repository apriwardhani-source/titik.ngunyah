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
  const [schema] = await pool.query('SHOW CREATE TABLE orders');
  console.log(schema[0]['Create Table']);
  
  const [res] = await pool.query(`
    SELECT id, queue_number, customer_name,
           CAST(created_at AS CHAR) as raw_created_at,
           CAST(NOW() AS CHAR) as raw_now,
           DATE(created_at) as raw_date,
           DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', '+08:00'), '%Y-%m-%d') as wita_day,
           DATE_FORMAT(CONVERT_TZ(NOW(), '+00:00', '+08:00'), '%Y-%m-%d') as wita_today,
           DATE_FORMAT(CONVERT_TZ(created_at, 'SYSTEM', '+08:00'), '%Y-%m-%d') as sys_wita_day,
           DATE_FORMAT(created_at, '%Y-%m-%d') as plain_day
    FROM orders 
    ORDER BY id DESC LIMIT 10
  `);
  console.log('Detailed timezone inspection:');
  console.log(JSON.stringify(res, null, 2));

  const [tzVars] = await pool.query("SHOW VARIABLES LIKE '%time_zone%'");
  console.log('Timezone variables:');
  console.log(JSON.stringify(tzVars, null, 2));

  process.exit(0);
}

run();
