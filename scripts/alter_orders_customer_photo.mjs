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
    const [cols] = await pool.query("SHOW COLUMNS FROM orders LIKE 'customer_photo'");
    if (cols.length === 0) {
      await pool.query("ALTER TABLE orders ADD COLUMN customer_photo LONGTEXT NULL AFTER customer_name");
      console.log("Successfully added customer_photo column to orders table!");
    } else {
      console.log("customer_photo column already exists in orders table.");
    }
    process.exit(0);
  } catch (e) {
    console.error('Error adding column:', e);
    process.exit(1);
  }
}

run();
