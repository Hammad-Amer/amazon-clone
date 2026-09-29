import "server-only";
import data from "@/data/products.json";
import { DEPARTMENTS } from "./departments";
import type { Product, ProductSummary } from "./types";

const products = data as Product[];
const byId = new Map(products.map((p) => [p.id, p]));

export function getAllProducts(): Product[] {
  return products;
}

export function getProduct(id: number): Product | undefined {
  return byId.get(id);
}

export function getProductsByIds(ids: number[]): Product[] {
  return ids.map((id) => byId.get(id)).filter((p): p is Product => !!p);
}

export function toSummary(p: Product): ProductSummary {
  return {
    id: p.id,
    title: p.title,
    brand: p.brand,
    category: p.category,
    price: p.price,
    listPrice: p.listPrice,
    discountPercentage: p.discountPercentage,
    rating: p.rating,
    ratingCount: p.ratingCount,
    boughtPastMonth: p.boughtPastMonth,
    stock: p.stock,
    fastDelivery: p.fastDelivery,
    thumbnail: p.thumbnail,
    badge: p.badge,
  };
}

const byPopularity = (a: Product, b: Product) =>
  b.boughtPastMonth * b.rating - a.boughtPastMonth * a.rating || b.ratingCount - a.ratingCount;

export function getByCategories(categories: string[], limit = 12): Product[] {
  return products.filter((p) => categories.includes(p.category)).sort(byPopularity).slice(0, limit);
}

export function getByDepartment(slug: string, limit = 12): Product[] {
  const dept = DEPARTMENTS.find((d) => d.slug === slug);
  return dept ? getByCategories(dept.categories, limit) : [];
}

export function getDeals(limit = 12): Product[] {
  return products
    .filter((p) => p.discountPercentage > 0)
    .sort((a, b) => b.discountPercentage - a.discountPercentage)
    .slice(0, limit);
}

export function getBestSellers(limit = 12): Product[] {
  return [...products].sort(byPopularity).slice(0, limit);
}

export function getNewReleases(limit = 12): Product[] {
  return [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

export function getUnderPrice(max: number, categories: string[], limit = 12): Product[] {
  return getByCategories(categories, 100)
    .filter((p) => p.price <= max)
    .slice(0, limit);
}

/** Same category first, then same department, excluding the product itself. */
export function getRelated(product: Product, limit = 12): Product[] {
  const dept = DEPARTMENTS.find((d) => d.categories.includes(product.category));
  const same = getByCategories([product.category], 50).filter((p) => p.id !== product.id);
  const near = dept
    ? getByCategories(dept.categories, 100).filter(
        (p) => p.id !== product.id && p.category !== product.category,
      )
    : [];
  return [...same, ...near].slice(0, limit);
}
