#!/usr/bin/env node
// Creates the Stripe products + prices for policyctl and writes the real
// price IDs back into wrangler.toml so checkout works on the next deploy.
//
// Usage:
//   STRIPE_SECRET_KEY=sk_live_... node scripts/setup-stripe-prices.mjs
//
// Uses the modern Stripe v2024-06-14 API. Requires Node ≥ 18 (for fetch).

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const wranglerPath = join(here, "..", "wrangler.toml");

const SK = process.env.STRIPE_SECRET_KEY;
if (!SK) {
  console.error("✖  Set STRIPE_SECRET_KEY env var (sk_live_... or sk_test_...)");
  process.exit(1);
}

// Prices are per-seat, per-month/annual. Annual = 10 months paid (≈17% discount).
const PRODUCTS = [
  {
    name: "policyctl growth",
    prices: [
      { interval: "month",  currency: "usd", unit_amount: 500,  key: "STRIPE_PRICE_ID_GROWTH_MONTHLY" },
      { interval: "year",   currency: "usd", unit_amount: 5000, key: "STRIPE_PRICE_ID_GROWTH_ANNUAL"  },
    ],
  },
  {
    name: "policyctl pro",
    prices: [
      { interval: "month",  currency: "usd", unit_amount: 1200, key: "STRIPE_PRICE_ID_PRO_MONTHLY" },
      { interval: "year",   currency: "usd", unit_amount: 12000, key: "STRIPE_PRICE_ID_PRO_ANNUAL"  },
    ],
  },
];

const STRIPE_API = "https://api.stripe.com/v1";
const HEADERS = { Authorization: `Bearer ${SK}`, "Stripe-Version: 2024-06-14" };

async function stripe(path, body) {
  const url = new URL(STRIPE_API + path);
  for (const [k, v] of Object.entries(body ?? {})) url.searchParams.append(k, v);
  const res = await fetch(url, { method: "POST", headers: HEADERS });
  const data = await res.json();
  if (!res.ok) throw new Error(`${path} → ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

async function findOrCreateProduct(name) {
  // Check if a product with this name already exists.
  const list = await stripe("/products", { limit: "100", type: "service" });
  const existing = list.data.find((p) => p.name === name && !p.deleted);
  if (existing) return existing.id;
  const created = await stripe("/products", { name, type: "service" });
  console.log(`  + Created product "${name}" (id: ${created.id})`);
  return created.id;
}

async function findOrCreatePrice(productId, price) {
  // Check existing prices for this product.
  const list = await stripe(`/prices`, { product: productId, limit: "100" });
  const existing = list.data.find(
    (p) =>
      p.recurring?.interval === price.interval &&
      p.currency === price.currency &&
      p.unit_amount === price.unit_amount
  );
  if (existing) return existing.id;
  const created = await stripe(`/prices`, {
    product: productId,
    currency: price.currency,
    unit_amount: price.unit_amount,
    recurring: { interval: price.interval, interval_count: 1 },
    payment_behavior: "default_incomplete",
    expand: ["latest_invoice.payment_intent"],
  });
  console.log(`  + Created price ${price.currency} ${price.unit_amount}¢/${price.interval} (id: ${created.id})`);
  return created.id;
}

// --- Main ---

console.log("Creating Stripe products and prices…");
const priceIdMap = {};

for (const product of PRODUCTS) {
  console.log(`\nProduct: ${product.name}`);
  const productId = await findOrCreateProduct(product.name);
  for (const price of product.prices) {
    const priceId = await findOrCreatePrice(productId, price);
    priceIdMap[price.key] = priceId;
  }
}

// --- Write results back to wrangler.toml ---

console.log("\nWriting price IDs to wrangler.toml…");
let toml = readFileSync(wranglerPath, "utf8");

for (const [key, priceId] of Object.entries(priceIdMap)) {
  // Replace the placeholder or existing value for each key.
  const regex = new RegExp(`(${key}\\s*=\\s*)"[^"]*"`);
  if (regex.test(toml)) {
    toml = toml.replace(regex, `$1"${priceId}"`);
  } else {
    // Key not found in toml — shouldn't happen, but warn.
    console.warn(`  ⚠  ${key} not found in wrangler.toml`);
  }
}

// Remove the placeholder warning comment we added.
toml = toml.replace(/# Run `node scripts\/setup-stripe-prices\.mjs`.*?Until then, checkout will return 503\.\n/, "");

writeFileSync(wranglerPath, toml);
console.log(`✓  wrangler.toml updated with real Stripe price IDs.`);

// Verify
console.log("\nPrice ID summary:");
for (const [key, priceId] of Object.entries(priceIdMap)) {
  console.log(`  ${key} = ${priceId}`);
}
console.log("\nNext: run `wrangler deploy` to deploy with the updated price IDs.");
