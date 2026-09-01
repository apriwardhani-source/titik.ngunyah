import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { status: 'error', message: 'Status tidak boleh kosong' },
        { status: 400 }
      );
    }

    const pool = getDbPool();
    await pool.query(
      'UPDATE orders SET order_status = ?, updated_at = NOW() WHERE id = ? OR queue_number = ? OR order_number = ?',
      [status, id, id, id]
    );

    return NextResponse.json({
      status: 'success',
      message: 'Status pesanan berhasil diperbarui',
    });
  } catch (error: any) {
    console.error('Failed to update order status:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to update order status' },
      { status: 500 }
    );
  }
}
