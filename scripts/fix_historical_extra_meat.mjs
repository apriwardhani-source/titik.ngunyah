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
  const [items] = await pool.query(`
    SELECT oi.id, oi.order_id, oi.price, oi.qty, oi.subtotal, oi.notes,
           o.order_number, o.customer_name, o.subtotal as order_subtotal, o.total as order_total
    FROM order_items oi 
    JOIN orders o ON oi.order_id = o.id 
    WHERE oi.notes LIKE '%Extra Daging%' AND oi.price = 13000
  `);
  console.log('Affected old items count:', items.length);
  console.log('Items:', JSON.stringify(items, null, 2));

  // Update them to 15,000 and fix order totals
  for (const item of items) {
    const newPrice = 15000;
    const newSubtotal = newPrice * item.qty;
    const diff = newSubtotal - item.subtotal;

    await pool.query(
      'UPDATE order_items SET price = ?, subtotal = ? WHERE id = ?',
      [newPrice, newSubtotal, item.id]
    );

    await pool.query(
      'UPDATE orders SET subtotal = subtotal + ?, total = total + ? WHERE id = ?',
      [diff, diff, item.order_id]
    );

    console.log(`Updated order_item ${item.id} (Order ${item.order_id} - ${item.customer_name}): +${diff}`);
  }

  console.log('All historical Extra Daging orders successfully updated to Rp 15.000!');
  process.exit(0);
}

run();
