export interface SpinSector {
  id: string;
  label: string;
  shortLabel: string;
  badgeText: string;
  icon: string;
  color: string;
  textColor: string;
  probability: number; // in percent
  isJackpot?: boolean;
  desc: string;
}

export const SPIN_PRICE = 1000;

export const SPIN_SECTORS: SpinSector[] = [
  {
    id: "kebab_daging",
    label: "1 Kebab Daging",
    shortLabel: "1 KEBAB",
    badgeText: "🏆 JACKPOT: 1 Kebab Daging",
    icon: "🌯",
    color: "#b80000",
    textColor: "#ffde59",
    probability: 0.5,
    isJackpot: true,
    desc: "Selamat! Kamu memenangkan 1 Porsi Kebab Daging Gratis!",
  },
  {
    id: "permen",
    label: "1 Permen Manis",
    shortLabel: "1 PERMEN",
    badgeText: "🍬 BONUS: 1 Permen Manis",
    icon: "🍬",
    color: "#ffde59",
    textColor: "#b80000",
    probability: 74.0,
    isJackpot: false,
    desc: "Tetap manis! Kamu dapat 1 Butir Permen dari kasir Titik Ngunyah.",
  },
  {
    id: "es_teh",
    label: "1 Es Teh Manis",
    shortLabel: "1 ES TEH",
    badgeText: "🥤 BONUS: 1 Es Teh Manis",
    icon: "🥤",
    color: "#059669",
    textColor: "#ffffff",
    probability: 1.5,
    isJackpot: false,
    desc: "Segar! Kamu dapat 1 Cup Es Teh Manis Gratis!",
  },
  {
    id: "voucher_2k",
    label: "Voucher Diskon 2K",
    shortLabel: "DISKON 2K",
    badgeText: "🎟️ BONUS: Voucher Diskon 2K",
    icon: "🎟️",
    color: "#d97706",
    textColor: "#ffffff",
    probability: 15.0,
    isJackpot: false,
    desc: "Mantap! Dapatkan Diskon Rp 2.000 untuk pesanan berikutnya.",
  },
  {
    id: "extra_daging",
    label: "Extra Daging",
    shortLabel: "+DAGING",
    badgeText: "🥩 BONUS: Extra Daging Kebab",
    icon: "🥩",
    color: "#831843",
    textColor: "#ffffff",
    probability: 3.0,
    isJackpot: false,
    desc: "Nikmat! Porsi daging kebab kamu ditambah makin gurih!",
  },
  {
    id: "air_es",
    label: "Air Es Segar",
    shortLabel: "AIR ES",
    badgeText: "🧊 BONUS: 1 Cup Air Es",
    icon: "🧊",
    color: "#0284c7",
    textColor: "#ffffff",
    probability: 6.0,
    isJackpot: false,
    desc: "Adem! Kamu dapat 1 Cup Air Es Dingin Segar Gratis!",
  },
];

/**
 * Weighted random selector to pick prize based on profit-optimized probabilities
 */
export function getRandomSpinPrize(): { sector: SpinSector; index: number } {
  const rand = Math.random() * 100; // 0 - 100
  let cumulative = 0;

  for (let i = 0; i < SPIN_SECTORS.length; i++) {
    cumulative += SPIN_SECTORS[i].probability;
    if (rand <= cumulative) {
      return { sector: SPIN_SECTORS[i], index: i };
    }
  }

  // Fallback to permen
  return { sector: SPIN_SECTORS[1], index: 1 };
}
