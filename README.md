# amazon.clone

An Amazon.com-style shopping experience built in 24 hours with **Next.js 16 (App Router)** and **Tailwind CSS v4**, deployed on Vercel.

**Live demo:** https://amazon-clone-rouge-five.vercel.app

**Walkthrough video:** [Watch on Google Drive](https://drive.google.com/file/d/1JjkJuJZ8uEeKsDDRr-fzDqDhrQ8PN17q/view?usp=sharing)

**Quick look:** open the site → **Sign in → "Use demo account"**. The demo account has an order history, so personalized rows, _Your Orders_ and _Buy it again_ are populated immediately.

## Features

**Browse & discover**
- Our own "Sky & Navy" design across every page: navy header, sky-blue background, soft floating white cards and blue buttons
- Dark mode: follows the system setting by default, with a sun/moon toggle in the header that remembers your choice (no flash of the wrong theme on load)
- Homepage with a scrolling row of promo tiles, round shop-by-category bubbles, category cards, Today's Deals strip, best-seller rows
- Personalized rows: _Keep shopping for_ (browsing history), _Buy it again_ (orders), _Inspired by your browsing history_
- Header search with department selector, **live autocomplete** (keyboard navigation, "in Men's Shoes" suggestions) and **recent searches**
- Sidebar menu ("☰ All") with a department sub-menu, plus a nav belt
- Deliver-to location picker, shown in the header and buy box

**Search & filter** (`/s`)
- **Plain-English search:** "shoes under 50", "phones 4 stars", "cheapest laptops", "watches on sale" or "sunglasses between 20 and 60" become real price, rating, deals and sort filters
- Active filters shown as removable chips, with "Clear all"
- Relevance search (word-prefix matching so "men" doesn't match "women", synonyms such as "clothes")
- Filters for department/category, brand, customer rating, price buckets and custom range, and deals
- Sorting (featured, price, rating, newest, best sellers) and pagination
- Every filter lives in the URL, so results are shareable and the back button works. Filters open in a drawer on mobile.

**Product page** (`/dp/[id]`, statically generated for all 184 products)
- Image gallery with thumbnail rail and hover zoom (swipe on mobile)
- Price with discount and list price, stock warnings, delivery dates, quantity
- Buy box: **Add to cart**, **Buy Now** (straight to checkout), Add to List
- **Frequently bought together:** tick the add-ons you want, see the total, and add them all in one click
- **Compare with similar items:** a side-by-side table of price, rating, shipping, stock, weight and warranty
- **Write a review:** star picker with validation and a "Verified Purchase" label if you ordered the item. The average and histogram update live, and you can edit or delete (with undo)
- Filter reviews by clicking a histogram row, and vote reviews "Helpful"
- Specs table, "About this item", related products

**Cart → checkout → orders**
- "Added to cart" confirmation page with recommendations
- Cart with per-item select, quantity stepper, **Save for later / Move to cart**, free-shipping progress, "customers also bought"
- Sign in / create account (validated forms, `?next=` redirects), with checkout requiring sign-in
- 3-step checkout: address (saved addresses reused), payment (Luhn-validated test card or cash on delivery), delivery speed. The order summary covers shipping and tax.
- Order confirmation, order details with shipment progress, _Your Orders_ with tabs and _Buy it again_
- Wish List with move-to-cart

**Quality**
- Fully responsive: desktop layout matches Amazon, plus a dedicated mobile header, drawers and stacked buy box
- Loading skeletons, empty states, custom 404, keyboard-accessible menus and dialogs, visible focus rings
- Unit tests (Vitest) for search, query parsing, cart math, payment validation, order logic and review ratings

## Tech & architecture

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS v4 with Amazon design tokens in `app/globals.css` |
| Data | [DummyJSON](https://dummyjson.com) catalog snapshotted once into `data/products.json` (`npm run fetch-products`); no runtime API calls |
| State | Zustand stores persisted to `localStorage` (cart, auth, orders, history, wishlist, location, reviews) |
| Other | `next/image`, lucide-react, sonner |

```
app/(shop)/      pages with the full header/footer: home, /s, /dp/[id], /cart, /orders, /deals, /wishlist
app/(focus)/     distraction-free pages: /signin, /register, /checkout
app/api/         suggest (autocomplete), products (by id), recommendations
lib/             pure logic: search, query parsing, cart, orders, payment, reviews, formatting (unit-tested)
store/           client state (Zustand + persist)
components/      layout, home, product, search, cart, checkout, orders, ui
```

- **Server-first:** catalog reads, search and filtering run in Server Components off `searchParams`. Client components are limited to interactive parts.
- **Hydration-safe persistence:** stores use `skipHydration` and are rehydrated after mount, so server HTML and the first client render always match.
- **No backend by design:** accounts and orders live in the browser, and passwords are SHA-256 hashed. This keeps the demo free to host and zero-config. The store layer is isolated in `store/`, so swapping in a real database later touches only that layer.

## Run locally

```bash
npm install
npm run dev       # http://localhost:3000
npm test          # unit tests
npm run build     # production build
```

_Not affiliated with Amazon.com, Inc. Built for a take-home assignment; the logo is an original wordmark._
