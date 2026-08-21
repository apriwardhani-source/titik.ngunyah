import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, category, price, desc, img, best_seller, visible } = body;

    const pool = getDbPool();
    await pool.query(
      'UPDATE menus SET name = COALESCE(?, name), category = COALESCE(?, category), price = COALESCE(?, price), `desc` = COALESCE(?, `desc`), img = COALESCE(?, img), best_seller = COALESCE(?, best_seller), visible = COALESCE(?, visible), updated_at = NOW() WHERE id = ?',
      [
        name,
        category,
        price,
        desc,
        img,
        best_seller !== undefined ? (best_seller ? 1 : 0) : null,
        visible !== undefined ? (visible ? 1 : 0) : null,
        id,
      ]
    );

    return NextResponse.json({ status: 'success', message: 'Menu updated successfully' });
  } catch (error: any) {
    console.error('Failed to update menu:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to update menu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pool = getDbPool();
    await pool.query('DELETE FROM menus WHERE id = ?', [id]);

    return NextResponse.json({ status: 'success', message: 'Menu deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete menu:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to delete menu' },
      { status: 500 }
    );
  }
}
