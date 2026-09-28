# Changelog

## 1.0.3 — 2026-09-28

### App Store "What's New"

```
• Swap keeps your amount: flipping the direction now carries the converted value over — and
  swapping back and forth always gives the same numbers.
• Works offline after swapping: rates for both directions come from the rates already on your
  phone, no connection needed.
• Fresh rates every day: rates refresh automatically when a new day starts, even if the app
  was left open in the background.
• Cleaner numbers: currencies without cents (JPY, KRW, VND, IDR, …) no longer show ",00", and
  the rate line is readable for every currency (e.g. 1.000 JPY = 6,70 USD).
• Faster input: changing a currency keeps your amount, long-press ⌫ clears the input, and
  picking the currency from the other side simply swaps them.
• Improved layout on iPad, with large text sizes and on small screens.
• New setting: choose whether swapping keeps or resets the amount.
```

### Changes

**App**
- Swap carries the exact converted amount (no rounding drift); the next key starts a fresh entry.
- Setting to keep or reset the amount on swap.
- One rates snapshot, rebased locally to the home currency: swaps are offline-capable and never
  refetch. Rates become stale at the next UTC midnight and are re-checked on app resume.
- Currency-aware decimals (zero-decimal currencies), scaled rate line that respects the decimal
  separator setting.
- Keep amount on currency change; selecting the opposite currency swaps.
- No leading zeros, long-press backspace clears, chevrons on the currency cards.
- iPad: centered max-width layout. Font scaling capped on numpad and amounts.
- Settings scrollable; Android: safe-area insets in modals, back button in onboarding step 2.

**API**
- Precise inverse rates for weak-currency bases (provider rounds e.g. VND→EUR to 0.000034).
- Discord alert when currency updates fail.

**Tooling**
- Local EAS build + submit scripts for iOS and Android (`bun run release:ios|android`).
