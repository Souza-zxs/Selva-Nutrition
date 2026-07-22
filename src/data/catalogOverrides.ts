/**
 * Kit products whose price is still an estimate (2x/3x the single unit price)
 * pending confirmation — shown as "Em breve" instead of "Esgotado" even
 * though their real stock is 0 in the database.
 */
export const PLACEHOLDER_KIT_IDS = new Set([
  "5961ab56-d4d7-41d4-8299-28ef7ff3a47e", // Kit 2x Tallow Premium 450g
  "a4ece57f-3644-4709-ad3b-ab5c0c4dee99", // Kit 3x Tallow Premium 450g
  "30d249f5-9ddf-412d-90e6-0cfc9c926b51", // Kit 2x Tallow HERBS 450g
  "4e623547-6f43-4322-be0c-57816ee92048", // Kit 3x Tallow HERBS 450g
]);
