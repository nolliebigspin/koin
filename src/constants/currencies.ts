export type Currency = {
  code: string;
  name: string;
  flag: string;
  country: string;
  symbol: string;
};

export const currencies: Currency[] = [
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪", country: "United Arab Emirates", symbol: "د.إ" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺", country: "Australia", symbol: "A$" },
  { code: "BRL", name: "Brazilian Real", flag: "🇧🇷", country: "Brazil", symbol: "R$" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", country: "Canada", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭", country: "Switzerland", symbol: "Fr" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳", country: "China", symbol: "¥" },
  { code: "COP", name: "Colombian Peso", flag: "🇨🇴", country: "Colombia", symbol: "$" },
  { code: "CZK", name: "Czech Koruna", flag: "🇨🇿", country: "Czech Republic", symbol: "Kč" },
  { code: "DKK", name: "Danish Krone", flag: "🇩🇰", country: "Denmark", symbol: "kr" },
  { code: "EUR", name: "Euro", flag: "🇪🇺", country: "Eurozone", symbol: "€" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧", country: "United Kingdom", symbol: "£" },
  { code: "HKD", name: "Hong Kong Dollar", flag: "🇭🇰", country: "Hong Kong", symbol: "HK$" },
  { code: "IDR", name: "Indonesian Rupiah", flag: "🇮🇩", country: "Indonesia", symbol: "Rp" },
  { code: "ILS", name: "Israeli Shekel", flag: "🇮🇱", country: "Israel", symbol: "₪" },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳", country: "India", symbol: "₹" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", country: "Japan", symbol: "¥" },
  { code: "KRW", name: "South Korean Won", flag: "🇰🇷", country: "South Korea", symbol: "₩" },
  { code: "MXN", name: "Mexican Peso", flag: "🇲🇽", country: "Mexico", symbol: "$" },
  { code: "MYR", name: "Malaysian Ringgit", flag: "🇲🇾", country: "Malaysia", symbol: "RM" },
  { code: "NOK", name: "Norwegian Krone", flag: "🇳🇴", country: "Norway", symbol: "kr" },
  { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿", country: "New Zealand", symbol: "NZ$" },
  { code: "PHP", name: "Philippine Peso", flag: "🇵🇭", country: "Philippines", symbol: "₱" },
  { code: "PLN", name: "Polish Zloty", flag: "🇵🇱", country: "Poland", symbol: "zł" },
  { code: "RUB", name: "Russian Ruble", flag: "🇷🇺", country: "Russia", symbol: "₽" },
  { code: "SEK", name: "Swedish Krona", flag: "🇸🇪", country: "Sweden", symbol: "kr" },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬", country: "Singapore", symbol: "S$" },
  { code: "THB", name: "Thai Baht", flag: "🇹🇭", country: "Thailand", symbol: "฿" },
  { code: "TRY", name: "Turkish Lira", flag: "🇹🇷", country: "Turkey", symbol: "₺" },
  { code: "TWD", name: "Taiwan Dollar", flag: "🇹🇼", country: "Taiwan", symbol: "NT$" },
  { code: "USD", name: "US Dollar", flag: "🇺🇸", country: "United States", symbol: "$" },
  { code: "VND", name: "Vietnamese Dong", flag: "🇻🇳", country: "Vietnam", symbol: "₫" },
  { code: "ZAR", name: "South African Rand", flag: "🇿🇦", country: "South Africa", symbol: "R" },
];

export function getCurrency(code: string): Currency | undefined {
  return currencies.find((c) => c.code === code);
}
