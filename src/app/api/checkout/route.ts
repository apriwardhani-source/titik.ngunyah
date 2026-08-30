import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customer_name = 'Guest', payment_method = 'qris', customer_photo = null } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Keranjang belanja kosong' },
        { status: 400 }
      );
    }

    const pool = getDbPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Generate Order Number & Queue Number
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      const orderNumber = `ORD-${dateStr}-${randomStr}`;

      // Fetch the highest/latest queue number today with transaction lock (FOR UPDATE) to prevent duplicates & race conditions
      const [lastOrderRows]: any = await connection.query(
        `SELECT queue_number FROM orders 
         WHERE DATE(created_at) = CURDATE() 
            OR DATE(CONVERT_TZ(created_at, '+00:00', '+07:00')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+07:00'))
         ORDER BY id DESC LIMIT 1 FOR UPDATE`
      );

      let queueIndex = 1;
      if (lastOrderRows && lastOrderRows.length > 0 && lastOrderRows[0].queue_number) {
        const match = String(lastOrderRows[0].queue_number).match(/A-(\d+)/);
        if (match) {
          queueIndex = parseInt(match[1], 10) + 1;
        } else {
          // If queue number is not in A-XXX format, count today's records as fallback
          const [countResult]: any = await connection.query(
            'SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURDATE()'
          );
          queueIndex = (countResult[0]?.count || 0) + 1;
        }
      }
      const queueNumber = `A-${String(queueIndex).padStart(3, '0')}`;

      // 2. Fetch prices from database to calculate exact total
      let subtotal = 0;
      const orderItemsToInsert: Array<{ menu_id: number; price: number; qty: number; subtotal: number; notes: string | null }> = [];

      for (const item of items) {
        const [menuRows]: any = await connection.query('SELECT price FROM menus WHERE id = ?', [item.menu_id]);
        const price = menuRows[0] ? Number(menuRows[0].price) : (item.price || 0);
        const itemSubtotal = price * Number(item.qty || 1);
        subtotal += itemSubtotal;

        orderItemsToInsert.push({
          menu_id: Number(item.menu_id),
          price,
          qty: Number(item.qty || 1),
          subtotal: itemSubtotal,
          notes: item.notes || null,
        });
      }

      const total = subtotal; // Tax is 0 for now
      const orderStatus = payment_method === 'cash' ? 'waiting_payment' : 'waiting_for_kitchen';
      const paymentStatus = payment_method === 'cash' ? 'pending' : 'paid';

      // 3. Insert into orders table with customer_photo
      const [orderResult]: any = await connection.query(
        'INSERT INTO orders (order_number, queue_number, customer_name, customer_photo, subtotal, tax, total, payment_method, payment_status, order_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [orderNumber, queueNumber, customer_name, customer_photo, subtotal, 0, total, payment_method, paymentStatus, orderStatus]
      );

      const orderId = orderResult.insertId;

      // 4. Insert order items
      for (const item of orderItemsToInsert) {
        await connection.query(
          'INSERT INTO order_items (order_id, menu_id, price, qty, subtotal, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [orderId, item.menu_id, item.price, item.qty, item.subtotal, item.notes]
        );
      }

      await connection.commit();

      return NextResponse.json({
        status: 'success',
        message: 'Pesanan berhasil dibuat',
        data: {
          id: orderId,
          order_number: orderNumber,
          queue_number: queueNumber,
          total,
          payment_method,
        },
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Failed to create order:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Gagal memproses pesanan' },
      { status: 500 }
    );
  }
}
