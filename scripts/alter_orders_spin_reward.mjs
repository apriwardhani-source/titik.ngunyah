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
    const [cols] = await pool.query("SHOW COLUMNS FROM orders LIKE 'spin_reward'");
    if (cols.length === 0) {
      await pool.query("ALTER TABLE orders ADD COLUMN spin_reward VARCHAR(255) NULL AFTER customer_photo");
      console.log("Successfully added spin_reward column to orders table!");
    } else {
      console.log("spin_reward column already exists in orders table.");
    }

    const [hasSpinCols] = await pool.query("SHOW COLUMNS FROM orders LIKE 'has_spin'");
    if (hasSpinCols.length === 0) {
      await pool.query("ALTER TABLE orders ADD COLUMN has_spin TINYINT(1) DEFAULT 0 AFTER spin_reward");
      console.log("Successfully added has_spin column to orders table!");
    } else {
      console.log("has_spin column already exists in orders table.");
    }

    process.exit(0);
  } catch (e) {
    console.error('Error adding column:', e);
    process.exit(1);
  }
}

run();
