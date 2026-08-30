import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.TIDB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: Number(process.env.TIDB_PORT) || 4000,
  user: process.env.TIDB_USER || '2mutHwzd3LgsP27.root',
  password: process.env.TIDB_PASSWORD || 'GBi554ID2Jx6OGlK',
  database: process.env.TIDB_DATABASE || 'titik_ngunyah',
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false,
  },
  waitForConnections: true,
  connectionLimit: 5,
});

const officialMenus = [
  // 1. Menu Paket
  {
    name: 'Paket Ngunyah Mix',
    category: 'Menu Paket',
    price: 18000,
    desc: 'Kebab Daging Biasa / Sosis (Bisa Mix) + Air Es / Teh Es',
    img: '/photos/paket-ngunyah-mix.png',
    best_seller: 1,
    visible: 1,
  },
  {
    name: 'Paket Ngunyah Asik',
    category: 'Menu Paket',
    price: 20000,
    desc: 'Kebab Extra Daging / Sosis (Bisa Mix) + Air Es / Teh Es',
    img: '/photos/paket-ngunyah-mix.png',
    best_seller: 1,
    visible: 1,
  },
  {
    name: 'Paket Ngunyah Puas',
    category: 'Menu Paket',
    price: 20000,
    desc: 'Kebab Daging + Air Es / Teh Es',
    img: '/photos/paket-ngunyah-puas.png',
    best_seller: 1,
    visible: 1,
  },
  {
    name: 'Paket Sultan Ngunyah',
    category: 'Menu Paket',
    price: 22000,
    desc: 'Kebab Extra (Daging x Sosis) + Es Squash Jeruk / Es Moka',
    img: '/photos/paket-sultan-ngunyah.png',
    best_seller: 1,
    visible: 1,
  },

  // 2. Menu Satuan Kebab
  {
    name: 'Kebab Daging',
    category: 'Kebab',
    price: 13000,
    desc: 'Kebab dengan isian daging murni nikmat (Extra Daging = 15K)',
    img: '/photos/kebab-daging-besar.png',
    best_seller: 0,
    visible: 1,
  },
  {
    name: 'Kebab Sosis',
    category: 'Kebab',
    price: 16000,
    desc: 'Kebab dengan isian sosis lezat berbalut saus spesial',
    img: '/photos/kebab-sosis-besar.png',
    best_seller: 0,
    visible: 1,
  },
  {
    name: 'Kebab Mix',
    category: 'Kebab',
    price: 17000,
    desc: 'Kebab kombinasi lezat daging sapi dan sosis panggang',
    img: '/photos/kebab-mix-besar.png',
    best_seller: 0,
    visible: 1,
  },

  // 3. Minuman
  {
    name: 'Acqua con ghiaccio',
    category: 'Minuman',
    price: 4000,
    desc: 'Air es dingin segar',
    img: '/photos/air-es.png',
    best_seller: 0,
    visible: 1,
  },
  {
    name: 'Es Squash Jeruk',
    category: 'Minuman',
    price: 7000,
    desc: 'Es squash jeruk asam manis segar penghilang dahaga',
    img: '/photos/es-milo.png',
    best_seller: 1,
    visible: 1,
  },
  {
    name: 'Es Teh',
    category: 'Minuman',
    price: 7000,
    desc: 'Es teh manis segar khas Titik Ngunyah',
    img: '/photos/es-teh.png',
    best_seller: 0,
    visible: 1,
  },
  {
    name: 'Es Moka',
    category: 'Minuman',
    price: 8000,
    desc: 'Perpaduan rasa kopi moka dan coklat dingin nikmat',
    img: '/photos/es-milo.png',
    best_seller: 1,
    visible: 1,
  },

  // 4. Game
  {
    name: 'Game Spin Wheel',
    category: 'Game',
    price: 1000,
    desc: 'Game Spin Wheel dengan berbagai hadiah menarik!',
    img: '/photos/default.png',
    best_seller: 0,
    visible: 1,
  },
];

async function seed() {
  try {
    console.log('Connecting to TiDB Cloud...');
    
    // Delete all existing menu items
    await pool.query('DELETE FROM menus');
    console.log('Cleared old menus from TiDB.');

    for (const m of officialMenus) {
      await pool.query(
        'INSERT INTO menus (name, category, price, `desc`, img, best_seller, visible, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [m.name, m.category, m.price, m.desc, m.img, m.best_seller, m.visible]
      );
      console.log(`✓ Inserted: ${m.name} (Rp${m.price.toLocaleString('id-ID')}) - ${m.category}`);
    }

    console.log('\n SUCCESS! All 12 flyer menus are now live in TiDB Cloud database!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding menus:', err);
    process.exit(1);
  }
}

seed();
