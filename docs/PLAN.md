# Amazon Clone — 24h Build Plan

## Context
This is a take-home assignment: build an Amazon.com-style store in about 24 hours. It will be judged on **how much gets built**, **how good the product is**, and **UX/UI**. It needs a **live link** (Vercel free tier) and the GitHub repo `https://github.com/Hammad-Amer/amazon-clone.git`. The reference screenshots in `screenshots/` define the look and flow: guest/user homepage, header and search dropdown, sidebar, search results with filters, product page, added-to-cart, cart, checkout and sign-in. Constraints: Next.js + Tailwind, no paid APIs, dummy product data. Ads, Alexa, Prime Video and the like are out of scope.

**Decisions (confirmed with user):**
- Mock auth. Users, cart, wishlist and orders are kept in `localStorage` via Zustand `persist`. No DB.
- Product data is a one-time **DummyJSON snapshot** (~190 products, 24 categories, real images, ratings, reviews) committed as local JSON. No runtime API calls.
- **Fully responsive**: desktop matches the screenshots, plus a real mobile layout.
- Amazon colors/layout with **our own wordmark** (e.g. `amazon.clone` text + CSS smile arrow). No Amazon logo or banner assets.

**Repo state:** the root has only `.agent-logs/`, `.claude/` (capture hooks, must stay untouched), `screenshots/`, `CAPTURE-TEST.md` and `.gitignore`. There is no git remote yet. The Next app goes at the **repo root** so Vercel needs no root-dir config.

---

## Tech stack
- **Next.js (latest, App Router, TypeScript)**, **Tailwind CSS** (whatever version create-next-app ships)
- **zustand** (+ `persist`) for client state · **embla-carousel-react** for carousels · **lucide-react** icons · **sonner** toasts · `clsx` + `tailwind-merge`
- **Vitest** for the pure logic only (search/filter/sort, cart math)
- `next/image` with `remotePatterns` for `cdn.dummyjson.com`
- Deploy: Vercel Hobby, GitHub import → auto-deploy on every push to `main`

## Architecture

```
app/
  layout.tsx                 Header + NavBelt + Sidebar + Footer, Toaster
  page.tsx                   Homepage (guest vs signed-in sections)
  s/page.tsx                 Search/results  (?k=&c=&brand=&min=&max=&rating=&sort=&page=)
  dp/[id]/page.tsx           Product detail  (generateStaticParams → all SSG)
  cart/page.tsx              Cart + Saved for later
  cart/added/page.tsx        "Added to cart" confirmation (?id=)
  signin/page.tsx, register/page.tsx
  checkout/page.tsx          Secure checkout (address → payment → review), requires sign-in
  orders/page.tsx, orders/[id]/page.tsx   Order history + order confirmation/detail
  wishlist/page.tsx          "Your Lists"
  deals/page.tsx             Today's Deals (discount-sorted)
  api/suggest/route.ts       Search autocomplete (reads local JSON)
  not-found.tsx, loading.tsx
components/
  layout/  Header, SearchBar (category select + suggestions), NavBelt, SidebarDrawer,
           AccountFlyout, LocationModal, Footer, Logo
  home/    HeroCarousel, CategoryCardGrid (4-up "Plug in with electronics" cards),
           ProductCarousel, SignInCard, personalized rows
  product/ ProductCard, Rating(stars), Price (superscript cents), ImageGallery, BuyBox,
           QuantitySelect, ReviewsList, SpecsTable
  search/  FilterSidebar (category/brand/price/rating), SortSelect, Pagination, MobileFilterDrawer
  cart/    CartItem (trash/−/qty/+ pill), CartSummary, SavedForLater
  ui/      Button (yellow/orange/outline variants), Drawer, Modal, Skeleton, EmptyState
lib/
  products.ts   getAllProducts, getProduct, getCategories, getRelated, getDeals, getBestSellers
  search.ts     searchProducts(params) → {items,total,facets}   (pure; unit-tested)
  departments.ts  DummyJSON category → Amazon-style department names/groupings
  format.ts     price formatting, delivery-date helpers ("FREE delivery Sun, Oct 4")
store/
  cart.ts  auth.ts  wishlist.ts  orders.ts  history.ts  location.ts   (zustand + persist)
  useHydrated.ts   (gate badge counts etc. until client mount → no hydration mismatch)
data/products.json            generated snapshot (committed)
scripts/fetch-products.mjs    pulls dummyjson.com/products?limit=0 once + enriches
```

**Data enrichment** (inside `fetch-products.mjs`, deterministic from the id): `listPrice` (computed from `discountPercentage`), `boughtPastMonth` ("1K+ bought in past month"), `isBestSeller` / `isAmazonsChoice` badges, `primeEligible`, and `department` mapping. Rendering stays server-side: products are read from JSON in Server Components, while search runs on the server off `searchParams`, so URLs are shareable and the back button works.

**Client state:** cart items `{id, qty, savedForLater}`; auth `{users[], currentUser}` (passwords SHA-256 hashed via `crypto.subtle` so plaintext isn't stored, even in a demo); orders `{id, items, address, paymentLast4, total, createdAt}`; history (last 20 viewed product ids); wishlist ids; location (zip/city shown in "Deliver to").

**Design tokens (Tailwind theme):** header `#131921`, nav belt `#232f3e`, footer `#232f3e`/`#131a22`, "Back to top" `#37475a`, page bg `#e3e6e6`, search button `#febd69`, Add-to-cart `#ffd814`, Buy Now `#ffa41c`, links `#007185`, deal red `#cc0c39`, stars `#de7921`, in-stock green `#007600`. Font: a clean sans via `next/font` (Amazon Ember isn't free), with Arial as fallback.

---

## Build phases (each phase ends with a commit + push, which means a live deploy)

### Phase 0 — Setup & first deploy (~1h)
1. Save this plan to `docs/PLAN.md`.
2. Scaffold with `create-next-app` in a scratch folder, then move the files into the root, because the root isn't empty and create-next-app would refuse. Merge `.gitignore` and keep existing entries. Don't touch `.claude/` or `.agent-logs/`.
3. Install deps, set up Tailwind theme tokens, `next.config` image remotePatterns.
4. `git remote add origin …amazon-clone.git`, push. **User imports the repo in the Vercel dashboard** (one-time login), which gives a live URL from hour 1.
5. Recommend gitignoring `screenshots/`, since they contain the user's name and delivery address. User's call.

### Phase 1 — Core shopping (guest) (~8h) — build in this order
1. **Data:** run the fetch script → `data/products.json`; `lib/products.ts`, `lib/search.ts` + Vitest tests.
2. **Layout shell:** Header (wordmark, "Deliver to", search with *All Departments* select, EN, Account & Lists, Returns & Orders, cart count), NavBelt (☰ All, Today's Deals, Best Sellers, New Releases, Customer Service…, linking only to pages that exist), SidebarDrawer (Trending / Shop by Department with slide-in + dim overlay like `sidebar.png`), Footer (Back to top + link columns).
3. **Guest homepage** (`homepage_guest.png`): full-width hero carousel with CSS-gradient banners composed from product images, overlapped by a row of 4-up category cards ("Plug in with our electronics", "Beauty picks", "Apparel under $25"…, each a 2×2 image grid linking to `/s?c=`), a "Sign in for the best experience" card, and 3–4 horizontal product carousels (Today's deals, Best sellers in X…).
4. **Search/results** (`search_shoes*.png`): "1-24 of N results for 'x'", left filter sidebar (Department, Brand checkboxes, Customer Reviews ≥4★, Price buckets + custom min/max), sort (Featured / Price ↑↓ / Avg review / Newest), grid cards (badge, title, stars + count, "bought in past month", price with superscript cents + List strike, delivery line, **Add to cart** button), pagination, no-results state. Clicking a department in the header select filters the results.
5. **Product detail** (`Specific_product*.png`): breadcrumb, thumbnail rail + main image (hover-zoom on desktop, swipe on mobile), title/brand link/rating, price with discount % and list price, "About this item" bullets, specs table (weight, dimensions, warranty, shipping, return policy from DummyJSON), **Buy Box** (price, FREE delivery date, In stock / Only N left, qty select, Add to cart, Buy Now, Ships from/Sold by, Add to List), customer reviews with rating breakdown bars, "Related products" carousel. Viewing a product records it in history.
6. **Cart:** "Added to cart" page (`addedToCart.png`) with subtotal, Proceed to checkout / Go to Cart, "Based on what you added" carousel. Cart page (`cart.png`) with checkbox select, trash/−/qty/+ pill, Delete, Save for later, Move to cart, subtotal "(N items)", free-delivery threshold message, "Customers also bought" sidebar, empty-cart state.

### Phase 2 — Accounts, checkout, orders (~4h)
1. **Sign in / Register** (`sign_in.png` style, minimal centered card). Includes a **"Use demo account"** button so judges can get in with one click; the demo user is seeded with 2 past orders so personalization shows immediately. Validation, error messages, `?next=` redirect.
2. Header "Hello, {name}", Account & Lists flyout (Sign in CTA / Your Orders / Your Lists / Sign out).
3. **Checkout** (`checkout.png`): minimal header "Secure checkout", 3 collapsible steps: address form (validated), payment (mock card form, only last-4 stored, or "Cash on delivery"), review items with delivery options (Standard free / Next-day $9.99). Order summary box (Items, Shipping, Est. tax, Order total), **Place your order**. "Buy Now" goes straight to checkout with that single item.
4. **Order confirmation** ("Order placed, thanks!" + delivery estimate) and **Your Orders** list/detail with "Buy it again".

### Phase 3 — Personalization & extras (~3h)
1. Signed-in homepage (`homepage_user*.png`): "Keep shopping for" (history), "Buy again" (orders), "Inspired by your recent history" (same-category picks), "Deals for you".
2. **Search autocomplete** (`searchfield.png`): debounced `/api/suggest`, keyboard nav, highlighted match.
3. **Wishlist / Your Lists** (heart on PDP + "Add to List"), **Today's Deals** page with discount badges and category chips.
4. "Deliver to" **location modal** (enter a zip/pick a country, shown in the header and buy box).
5. Mini cart toast/flyout when adding from search cards (stays on the page instead of navigating away).

### Phase 4 — Polish & submission (~3h)
- Responsive pass. Mobile header becomes logo/account/cart on the first row, full-width search on the second and a scrollable nav on the third. Filters open in a drawer, the PDP buy box stacks, and there's a sticky mobile "Add to cart" bar.
- `loading.tsx` skeletons, empty states, `not-found`, focus states, alt text, keyboard-operable drawers/modals.
- Per-page `metadata` + OG image, favicon, Lighthouse check (images sized, fonts via next/font).
- **README**: live link, feature checklist, tech stack, architecture notes, screenshots/GIF, demo login. Judges read this first.

**Buffer:** ~3–4h unallocated for bugs and scope overflow. If time runs short, cut from Phase 3 bottom-up. Phases 1–2 are the must-haves.

## Out of scope
Prime/Prime Video, Alexa, ads/sponsored, gift cards, real payments, seller pages, returns flow, multi-language/currency, real backend.

## Recommendations (beyond the brief)
- **Deploy in hour 1** and push at every phase end, so a working live link always exists.
- **Demo-account button + seeded orders**, so judges see the full signed-in experience in one click.
- **URL-driven search/filter state**, so shareable links and the back button work (a UX point judges notice).
- Keep a small **feature checklist in the README** matching what's built, so "how much you created" is easy to see.

## Verification
- `npm run test` (Vitest): search filters/sort/pagination, cart totals/qty edge cases.
- `npm run build` must pass with no type errors before every push (Vercel runs the same build).
- Manual E2E after each phase with `npm run dev` / the `run` skill (browser): guest home → search "shoes" → filter brand + price → sort → PDP → add to cart → change qty / save for later → checkout redirects to sign-in → demo login → place order → order confirmation → Your Orders → homepage now shows "Buy again" / "Keep shopping for".
- Check at 375px, 768px and 1440px widths. Reload mid-flow to confirm persisted state and no hydration warnings in the console.
- After each push: open the Vercel URL and smoke-test the same flow on the live deployment.
