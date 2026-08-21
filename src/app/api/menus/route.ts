import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    const pool = getDbPool();
    const query = isAdmin
      ? 'SELECT * FROM menus ORDER BY id DESC'
      : 'SELECT * FROM menus WHERE visible = 1 ORDER BY id DESC';

    const [rows]: any = await pool.query(query);

    const data = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      price: Number(r.price),
      desc: r.desc,
      img: r.img,
      best_seller: Boolean(r.best_seller),
      visible: Boolean(r.visible),
    }));

    return NextResponse.json({ status: 'success', data });
  } catch (error: any) {
    console.error('Failed to get menus:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to fetch menus' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, price, desc, img, best_seller = false, visible = true } = body;

    const pool = getDbPool();
    const [result]: any = await pool.query(
      'INSERT INTO menus (name, category, price, `desc`, img, best_seller, visible, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [
        name,
        category,
        price,
        desc || null,
        img || '/photos/default.png',
        best_seller ? 1 : 0,
        visible ? 1 : 0,
      ]
    );

    return NextResponse.json({
      status: 'success',
      message: 'Menu created successfully',
      data: { id: result.insertId, ...body },
    });
  } catch (error: any) {
    console.error('Failed to create menu:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to create menu' },
      { status: 500 }
    );
  }
}
