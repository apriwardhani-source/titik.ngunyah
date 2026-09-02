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
  const [orders] = await pool.query(`
    SELECT * FROM orders 
    WHERE queue_number = 'A-004' OR customer_name LIKE '%ziroh%' 
    ORDER BY id DESC 
    LIMIT 5
  `);
  console.log('Orders:');
  console.log(JSON.stringify(orders, null, 2));

  if (orders.length > 0) {
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orders[0].id]);
    console.log('Items for order ' + orders[0].id + ':');
    console.log(JSON.stringify(items, null, 2));
  }

  process.exit(0);
}

run();
