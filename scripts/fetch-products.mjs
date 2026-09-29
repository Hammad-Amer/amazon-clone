// One-time snapshot of the DummyJSON catalog into data/products.json.
// Run with: node scripts/fetch-products.mjs
// The app never calls DummyJSON at runtime; it only reads the committed JSON.
import { writeFile, mkdir } from "node:fs/promises";

const EXCLUDED_CATEGORIES = new Set(["vehicle", "motorcycle"]);

// Deterministic pseudo-random number in [0, 1) derived from a seed,
// so re-running the script produces identical data.
function seeded(seed) {
  let x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const round2 = (n) => Math.round(n * 100) / 100;

const res = await fetch("https://dummyjson.com/products?limit=0");
if (!res.ok) throw new Error(`DummyJSON responded ${res.status}`);
const { products: raw } = await res.json();

const products = raw
  .filter((p) => !EXCLUDED_CATEGORIES.has(p.category))
  .map((p) => {
    const r1 = seeded(p.id);
    const r2 = seeded(p.id + 1000);
    const hasDeal = p.discountPercentage >= 8;
    const boughtBuckets = [0, 0, 50, 100, 200, 300, 500, 1000, 2000, 5000];

    return {
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      brand: p.brand ?? null,
      price: p.price,
      discountPercentage: hasDeal ? Math.round(p.discountPercentage) : 0,
      listPrice: hasDeal ? round2(p.price / (1 - p.discountPercentage / 100)) : null,
      rating: round2(p.rating),
      ratingCount: Math.round(12 + r1 * r1 * 24000),
      boughtPastMonth: boughtBuckets[Math.floor(r2 * boughtBuckets.length)],
      stock: p.stock,
      fastDelivery: r2 > 0.35,
      tags: p.tags,
      sku: p.sku,
      weight: p.weight,
      dimensions: p.dimensions,
      warrantyInformation: p.warrantyInformation,
      shippingInformation: p.shippingInformation,
      returnPolicy: p.returnPolicy,
      reviews: p.reviews.map(({ rating, comment, date, reviewerName }) => ({
        rating,
        comment,
        date,
        reviewerName,
      })),
      createdAt: p.meta.createdAt,
      images: p.images,
      thumbnail: p.thumbnail,
      badge: null,
    };
  });

// Badges: the most-bought product per category is a "Best Seller";
// the best-rated remaining one (with enough ratings) is the "Overall Pick".
const byCategory = Map.groupBy(products, (p) => p.category);
for (const items of byCategory.values()) {
  const best = [...items].sort((a, b) => b.boughtPastMonth - a.boughtPastMonth)[0];
  if (best.boughtPastMonth > 0) best.badge = "Best Seller";
  const pick = items
    .filter((p) => !p.badge && p.ratingCount > 500)
    .sort((a, b) => b.rating - a.rating)[0];
  if (pick) pick.badge = "Overall Pick";
}

await mkdir(new URL("../data/", import.meta.url), { recursive: true });
await writeFile(
  new URL("../data/products.json", import.meta.url),
  JSON.stringify(products, null, 1) + "\n",
);
console.log(`Wrote ${products.length} products across ${byCategory.size} categories.`);
