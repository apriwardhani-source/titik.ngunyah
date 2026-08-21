<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        DB::table('menus')->insert([
            ['name' => 'Paket Ngunyah Mix', 'category' => 'Paket Berdua', 'price' => 35000, 'desc' => 'Kebab mini daging x sosis + es teh / air es', 'img' => '/photos/paket-ngunyah-mix.png', 'best_seller' => true],
            ['name' => 'Paket Ngunyah Puas', 'category' => 'Paket Berdua', 'price' => 45000, 'desc' => 'Kebab besar daging x sosis + es teh / air es', 'img' => '/photos/paket-ngunyah-puas.png', 'best_seller' => true],
            ['name' => 'Paket Nyemil Balado', 'category' => 'Paket Berdua', 'price' => 25000, 'desc' => 'Kentang goreng bumbu balado + es teh / air es', 'img' => '/photos/paket-nyemil-balado.png', 'best_seller' => true],
            ['name' => 'Paket Sultan Ngunyah', 'category' => 'Paket Komplit', 'price' => 55000, 'desc' => 'Kebab besar (daging x sosis) + kentang goreng + es milo', 'img' => '/photos/paket-sultan-ngunyah.png', 'best_seller' => true],

            ['name' => 'Kebab Daging Mini', 'category' => 'Kebab Series', 'price' => 15000, 'desc' => 'Kebab dengan isian daging murni', 'img' => '/photos/kebab-daging-mini.png', 'best_seller' => false],
            ['name' => 'Kebab Daging Besar', 'category' => 'Kebab Series', 'price' => 25000, 'desc' => 'Kebab dengan isian daging murni', 'img' => '/photos/kebab-daging-besar.png', 'best_seller' => false],
            ['name' => 'Kebab Sosis Mini', 'category' => 'Kebab Series', 'price' => 15000, 'desc' => 'Kebab dengan isian sosis', 'img' => '/photos/kebab-sosis-mini.png', 'best_seller' => false],
            ['name' => 'Kebab Sosis Besar', 'category' => 'Kebab Series', 'price' => 25000, 'desc' => 'Kebab dengan isian sosis', 'img' => '/photos/kebab-sosis-besar.png', 'best_seller' => false],
            ['name' => 'Kebab Mix Daging x Sosis Mini', 'category' => 'Kebab Series', 'price' => 18000, 'desc' => 'Kebab kombinasi daging dan sosis', 'img' => '/photos/kebab-mix-mini.png', 'best_seller' => false],
            ['name' => 'Kebab Mix Daging x Sosis Besar', 'category' => 'Kebab Series', 'price' => 28000, 'desc' => 'Kebab kombinasi daging dan sosis', 'img' => '/photos/kebab-mix-besar.png', 'best_seller' => false],

            ['name' => 'Kentang Pedas Manis Mayo', 'category' => 'Kentang Series', 'price' => 18000, 'desc' => 'Kentang goreng dengan saos pedas manis dan mayo', 'img' => '/photos/kentang-pedas-manis.png', 'best_seller' => false],
            ['name' => 'Kentang Bumbu Jagung', 'category' => 'Kentang Series', 'price' => 18000, 'desc' => 'Bumbu jagung + saos pedas manis + mayo', 'img' => '/photos/kentang-jagung.png', 'best_seller' => false],
            ['name' => 'Kentang Bumbu Balado', 'category' => 'Kentang Series', 'price' => 18000, 'desc' => 'Bumbu balado + saos pedas manis + mayo', 'img' => '/photos/kentang-balado.png', 'best_seller' => false],

            ['name' => 'Es Teh', 'category' => 'Minuman', 'price' => 6000, 'desc' => 'Es Teh Manis Segar', 'img' => '/photos/es-teh.png', 'best_seller' => false],
            ['name' => 'Es Milo', 'category' => 'Minuman', 'price' => 10000, 'desc' => 'Es Milo Segar', 'img' => '/photos/es-milo.png', 'best_seller' => false],
            ['name' => 'Air Es', 'category' => 'Minuman', 'price' => 3000, 'desc' => 'Air Es Segar', 'img' => '/photos/air-es.png', 'best_seller' => false],

            ['name' => 'Paket Ngunyah Daging Mini', 'category' => 'Paket Berdua', 'price' => 20000, 'desc' => 'Kebab daging mini + es teh / air es', 'img' => '/photos/paket-ngunyah-daging-mini.png', 'best_seller' => false],
            ['name' => 'Paket Ngunyah Daging Besar', 'category' => 'Paket Berdua', 'price' => 30000, 'desc' => 'Kebab daging besar + es teh / air es', 'img' => '/photos/paket-ngunyah-daging-besar.png', 'best_seller' => false],
            ['name' => 'Paket Ngunyah Sosis Mini', 'category' => 'Paket Berdua', 'price' => 20000, 'desc' => 'Kebab sosis mini + es teh / air es', 'img' => '/photos/paket-ngunyah-sosis-mini.png', 'best_seller' => false],
            ['name' => 'Paket Ngunyah Sosis Besar', 'category' => 'Paket Berdua', 'price' => 30000, 'desc' => 'Kebab sosis besar + es teh / air es', 'img' => '/photos/paket-ngunyah-sosis-besar.png', 'best_seller' => false],
            ['name' => 'Paket Nyemil Ori', 'category' => 'Paket Berdua', 'price' => 22000, 'desc' => 'Kentang goreng saos pedas manis mayo + es teh / air es', 'img' => '/photos/paket-nyemil-ori.png', 'best_seller' => false],
            ['name' => 'Paket Nyemil Jagung', 'category' => 'Paket Berdua', 'price' => 22000, 'desc' => 'Kentang goreng bumbu jagung + es teh / air es', 'img' => '/photos/paket-nyemil-jagung.png', 'best_seller' => false],

            ['name' => 'Paket Barbar 1 Mini', 'category' => 'Paket Komplit', 'price' => 35000, 'desc' => 'Kebab daging mini + kentang goreng + es teh / air es', 'img' => '/photos/paket-barbar-1-mini.png', 'best_seller' => false],
            ['name' => 'Paket Barbar 1 Besar', 'category' => 'Paket Komplit', 'price' => 45000, 'desc' => 'Kebab daging besar + kentang goreng + es teh / air es', 'img' => '/photos/paket-barbar-1-besar.png', 'best_seller' => false],
            ['name' => 'Paket Barbar 2 Mini', 'category' => 'Paket Komplit', 'price' => 35000, 'desc' => 'Kebab sosis mini + kentang goreng + es teh / air es', 'img' => '/photos/paket-barbar-2-mini.png', 'best_seller' => false],
            ['name' => 'Paket Barbar 2 Besar', 'category' => 'Paket Komplit', 'price' => 45000, 'desc' => 'Kebab sosis besar + kentang goreng + es teh / air es', 'img' => '/photos/paket-barbar-2-besar.png', 'best_seller' => false],
        ]);
    }
}
