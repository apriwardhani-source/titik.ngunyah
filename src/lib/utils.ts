/**
 * Format a number as Indonesian Rupiah currency string.
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Return Tailwind CSS classes for order status badges.
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "Menunggu":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "Dibayar":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "Disiapkan":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Siap":
      return "bg-green-100 text-green-700 border-green-200";
    case "Selesai":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "Dibatalkan":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

/**
 * API base URL helper.
 */
export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
}
