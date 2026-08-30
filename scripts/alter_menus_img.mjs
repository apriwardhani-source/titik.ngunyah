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
  try {
    await pool.query("ALTER TABLE menus MODIFY COLUMN img LONGTEXT");
    console.log('Successfully altered menus.img to LONGTEXT!');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

run();
