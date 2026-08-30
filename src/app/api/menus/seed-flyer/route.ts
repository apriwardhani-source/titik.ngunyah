import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function POST() {
  try {
    const pool = getDbPool();

    // 12 official menus based on Technopreneurship 2026 Flyer
    const officialMenus = [
      {
        name: 'Paket Ngunyah Mix',
        category: 'Menu Paket',
        price: 18000,
        desc: 'Kebab Daging Biasa / Sosis (Bisa Mix) + Air Es / Teh Es',
        img: '/photos/paket-ngunyah-mix.png',
        best_seller: true,
        visible: true,
      },
      {
        name: 'Paket Ngunyah Asik',
        category: 'Menu Paket',
        price: 20000,
        desc: 'Kebab Extra Daging / Sosis (Bisa Mix) + Air Es / Teh Es',
        img: '/photos/paket-ngunyah-mix.png',
        best_seller: true,
        visible: true,
      },
      {
        name: 'Paket Ngunyah Puas',
        category: 'Menu Paket',
        price: 20000,
        desc: 'Kebab Daging Porsi Puas + Air Es / Teh Es',
        img: '/photos/paket-ngunyah-puas.png',
        best_seller: true,
        visible: true,
      },
      {
        name: 'Paket Sultan Ngunyah',
        category: 'Menu Paket',
        price: 22000,
        desc: 'Kebab Extra (Daging / Sosis / Mix) + Es Squash Jeruk / Es Moka',
        img: '/photos/paket-sultan-ngunyah.png',
        best_seller: true,
        visible: true,
      },
      {
        name: 'Kebab Daging',
        category: 'Menu Satuan',
        price: 13000,
        desc: 'Kebab isian daging murni nikmat dan gurih (Bisa Extra Daging +2K)',
        img: '/photos/kebab-daging-besar.png',
        best_seller: false,
        visible: true,
      },
      {
        name: 'Kebab Sosis',
        category: 'Menu Satuan',
        price: 16000,
        desc: 'Kebab isian sosis lezat berbalut saus spesial',
        img: '/photos/kebab-sosis-besar.png',
        best_seller: false,
        visible: true,
      },
      {
        name: 'Kebab Mix',
        category: 'Menu Satuan',
        price: 17000,
        desc: 'Kombinasi mantap daging sapi dan sosis panggang',
        img: '/photos/kebab-mix-besar.png',
        best_seller: false,
        visible: true,
      },
      {
        name: 'Acqua con ghiaccio (Air Es)',
        category: 'Minuman',
        price: 4000,
        desc: 'Air mineral dingin dengan es menyegarkan',
        img: '/photos/air-es.png',
        best_seller: false,
        visible: true,
      },
      {
        name: 'Es Squash Jeruk',
        category: 'Minuman',
        price: 7000,
        desc: 'Es squash jeruk asam manis segar penghilang dahaga',
        img: '/photos/es-milo.png',
        best_seller: true,
        visible: true,
      },
      {
        name: 'Es Teh',
        category: 'Minuman',
        price: 7000,
        desc: 'Es teh manis segar khas Titik Ngunyah',
        img: '/photos/es-teh.png',
        best_seller: false,
        visible: true,
      },
      {
        name: 'Es Moka',
        category: 'Minuman',
        price: 8000,
        desc: 'Perpaduan kopi moka dan coklat dingin nikmat',
        img: '/photos/es-milo.png',
        best_seller: true,
        visible: true,
      },
    ];

    // Delete existing old menus and insert official ones
    await pool.query('TRUNCATE TABLE menus');

    for (const m of officialMenus) {
      await pool.query(
        'INSERT INTO menus (name, category, price, `desc`, img, best_seller, visible, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [m.name, m.category, m.price, m.desc, m.img, m.best_seller ? 1 : 0, m.visible ? 1 : 0]
      );
    }

    return NextResponse.json({
      status: 'success',
      message: '12 Menu resmi dari Brosur Bazar berhasil disinkronkan ke database TiDB Cloud!',
    });
  } catch (error: any) {
    console.error('Failed to seed flyer menus:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to sync flyer menus' },
      { status: 500 }
    );
  }
}
