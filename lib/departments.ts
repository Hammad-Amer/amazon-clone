export type Department = {
  slug: string;
  label: string;
  categories: string[];
};

export const CATEGORY_LABELS: Record<string, string> = {
  smartphones: "Smartphones",
  laptops: "Laptops",
  tablets: "Tablets",
  "mobile-accessories": "Mobile Accessories",
  "mens-shirts": "Men's Shirts",
  "mens-shoes": "Men's Shoes",
  "mens-watches": "Men's Watches",
  tops: "Women's Tops",
  "womens-dresses": "Women's Dresses",
  "womens-shoes": "Women's Shoes",
  "womens-bags": "Women's Handbags",
  "womens-jewellery": "Women's Jewelry",
  "womens-watches": "Women's Watches",
  sunglasses: "Sunglasses",
  beauty: "Makeup",
  fragrances: "Fragrances",
  "skin-care": "Skin Care",
  furniture: "Furniture",
  "home-decoration": "Home Décor",
  "kitchen-accessories": "Kitchen & Dining",
  groceries: "Grocery",
  "sports-accessories": "Sports & Fitness",
};

export const DEPARTMENTS: Department[] = [
  {
    slug: "electronics",
    label: "Electronics",
    categories: ["smartphones", "laptops", "tablets", "mobile-accessories"],
  },
  {
    slug: "fashion",
    label: "Clothing, Shoes & Jewelry",
    categories: [
      "mens-shirts",
      "mens-shoes",
      "mens-watches",
      "tops",
      "womens-dresses",
      "womens-shoes",
      "womens-bags",
      "womens-jewellery",
      "womens-watches",
      "sunglasses",
    ],
  },
  {
    slug: "beauty",
    label: "Beauty & Personal Care",
    categories: ["beauty", "fragrances", "skin-care"],
  },
  {
    slug: "home",
    label: "Home & Kitchen",
    categories: ["furniture", "home-decoration", "kitchen-accessories"],
  },
  { slug: "grocery", label: "Grocery & Gourmet Food", categories: ["groceries"] },
  { slug: "sports", label: "Sports & Outdoors", categories: ["sports-accessories"] },
];

export function categoryLabel(slug: string): string {
  return CATEGORY_LABELS[slug] ?? slug;
}

export function departmentOf(category: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.categories.includes(category));
}

/**
 * Resolves a `c` search param, which may be a department slug or a category slug,
 * to the list of category slugs it covers.
 */
export function resolveCategoryFilter(c: string | undefined): string[] | null {
  if (!c) return null;
  const dept = DEPARTMENTS.find((d) => d.slug === c);
  if (dept) return dept.categories;
  if (c in CATEGORY_LABELS) return [c];
  return [];
}

export function filterLabel(c: string): string {
  return DEPARTMENTS.find((d) => d.slug === c)?.label ?? categoryLabel(c);
}
