import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { spin_reward } = body;

    if (!spin_reward) {
      return NextResponse.json(
        { status: 'error', message: 'spin_reward is required' },
        { status: 400 }
      );
    }

    const pool = getDbPool();
    await pool.query(
      'UPDATE orders SET spin_reward = ?, updated_at = NOW() WHERE id = ?',
      [spin_reward, id]
    );

    return NextResponse.json({
      status: 'success',
      message: 'Hadiah Lucky Spin berhasil dicatat ke pesanan',
      data: { id, spin_reward },
    });
  } catch (error: any) {
    console.error('Failed to update spin reward:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to record spin reward' },
      { status: 500 }
    );
  }
}
