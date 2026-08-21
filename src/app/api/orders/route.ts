import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = getDbPool();

    // 1. Fetch orders
    const [orders]: any = await pool.query('SELECT * FROM orders ORDER BY id DESC LIMIT 100');

    if (orders.length === 0) {
      return NextResponse.json({ status: 'success', data: [] });
    }

    const orderIds = orders.map((o: any) => o.id);

    // 2. Fetch order items with menu details
    const [items]: any = await pool.query(
      `SELECT oi.*, m.name as menu_name 
       FROM order_items oi 
       LEFT JOIN menus m ON oi.menu_id = m.id 
       WHERE oi.order_id IN (?)`,
      [orderIds]
    );

    // 3. Group items by order_id
    const itemsByOrder: Record<number, any[]> = {};
    for (const item of items) {
      if (!itemsByOrder[item.order_id]) {
        itemsByOrder[item.order_id] = [];
      }
      itemsByOrder[item.order_id].push({
        id: item.id,
        menu_id: item.menu_id,
        qty: Number(item.qty),
        price: Number(item.price),
        subtotal: Number(item.subtotal),
        notes: item.notes,
        menu: {
          name: item.menu_name || 'Menu',
        },
      });
    }

    // 4. Map final response
    const result = orders.map((order: any) => ({
      id: order.id,
      order_number: order.order_number,
      queue_number: order.queue_number,
      customer_name: order.customer_name,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      total: Number(order.total),
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      order_status: order.order_status,
      created_at: order.created_at,
      items: itemsByOrder[order.id] || [],
    }));

    return NextResponse.json({ status: 'success', data: result });
  } catch (error: any) {
    console.error('Failed to get orders:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
