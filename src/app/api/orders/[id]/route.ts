import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pool = getDbPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Delete associated order items
      await connection.query('DELETE FROM order_items WHERE order_id = ?', [id]);

      // 2. Delete associated payments if any
      try {
        await connection.query('DELETE FROM payments WHERE order_id = ?', [id]);
      } catch (err) {
        // payments table might not have order_id or might not exist, ignore
      }

      // 3. Delete order
      await connection.query('DELETE FROM orders WHERE id = ?', [id]);

      await connection.commit();

      return NextResponse.json({
        status: 'success',
        message: 'Pesanan berhasil dihapus',
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Failed to delete order:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Gagal menghapus pesanan' },
      { status: 500 }
    );
  }
}
