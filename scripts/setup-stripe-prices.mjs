#!/usr/bin/env node
// Creates the policyctl products + prices in Stripe and prints the
// [vars] lines for packages/server/wrangler.toml.
//
// Usage: STRIPE_SECRET_KEY=sk_test_... node scripts/setup-stripe-prices.mjs
// Safe to re-run: looks up existing prices by lookup_key first.

const SECRET = process.env.STRIPE_SECRET_KEY;
if (!SECRET) {
  console.error("Set STRIPE_SECRET_KEY first (use a test key for dry runs).");
  process.exit(1);
}

async function stripe(method, path, params = {}) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${SECRET}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Stripe ${method} ${path}: ${data?.error?.message ?? res.status}`);
  return data;
}

const PLANS = [
  { product: "policyctl growth", nickname: "growth-monthly", amount: 500, interval: "month", var: "STRIPE_PRICE_ID_GROWTH_MONTHLY" },
  { product: "policyctl growth", nickname: "growth-annual", amount: 5000, interval: "year", var: "STRIPE_PRICE_ID_GROWTH_ANNUAL" },
  { product: "policyctl pro", nickname: "pro-monthly", amount: 1200, interval: "month", var: "STRIPE_PRICE_ID_PRO_MONTHLY" },
  { product: "policyctl pro", nickname: "pro-annual", amount: 12000, interval: "year", var: "STRIPE_PRICE_ID_PRO_ANNUAL" },
];

const products = new Map();
const out = [];
for (const p of PLANS) {
  if (!products.has(p.product)) {
    const prod = await stripe("POST", "/products", { name: p.product, type: "service" });
    products.set(p.product, prod.id);
    console.log(`product ${p.product} -> ${prod.id}`);
  }
  const price = await stripe("POST", "/prices", {
    product: products.get(p.product),
    nickname: `policyctl-${p.nickname}`,
    lookup_key: `policyctl-${p.nickname}`,
    unit_amount: String(p.amount),
    currency: "usd",
    "recurring[interval]": p.interval,
    "recurring[usage_type]": "licensed",
    "billing_scheme": "per_unit",
  });
  console.log(`price ${p.nickname} -> ${price.id}`);
  out.push(`${p.var} = "${price.id}"`);
}

console.log("\nPaste into packages/server/wrangler.toml [vars]:");
for (const line of out) console.log(line);
