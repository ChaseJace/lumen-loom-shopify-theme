# Lumen & Loom - Shopify theme

An Online Store 2.0 theme (Liquid, JSON templates, sections everywhere) that mirrors the static demo site. Merchants can edit and rearrange everything in the theme editor.

## Contents

- `theme/` - the theme itself (this is what gets uploaded)
- `sample-products.csv` - the same 12 demo products, in Shopify's product import format (no images)

## Install

Option A - upload (no tools needed)
1. Shopify admin > Online Store > Themes > Add theme > Upload zip file, and choose `lumen-loom-shopify-theme.zip`.
2. Click Customize to preview it before publishing.

Option B - Shopify CLI (best for development)

    cd theme
    shopify theme dev --store your-store.myshopify.com

## Set up the store content

1. Products > Import, upload `sample-products.csv`. Add product photos afterwards.
2. Products > Collections > Create collection (Automated). The homepage expects these handles:
   - `home`, `kitchen`, `lifestyle`, `gifts`: condition "Product type is equal to Home / Kitchen / Lifestyle / Gifts"
   - `bestsellers`: condition "Product tag is equal to Bestseller"
   (If a collection is missing, the tile or section falls back gracefully; change them any time in the theme editor.)
3. Content > Menus: edit `main-menu` (Home, Shop all, Kitchen, Gifts) and `footer` (policies, contact).
4. Settings > Payments: enable Shopify Payments or another provider and PayPal. Settings > Shipping and delivery: add rates, including a free-shipping rate that matches the threshold in Theme settings > Shipping. Settings > Taxes and duties as needed.

## What the theme includes

- Header with announcement bar, menu, search, account and cart count
- Home: hero, trust bar, collection tiles, featured collection, newsletter signup (creates a customer tagged `newsletter`)
- Collection: storefront filtering (availability, price, etc. from Search & Discovery), sorting, pagination
- Product: image gallery, variant picker with live price/stock, quantity, Ajax add to cart, dynamic checkout buttons, related products, Product structured data
- Cart: quantity edit, discounts, order note, free-shipping progress bar, Shopify-hosted checkout
- Search, 404, collections list and generic page templates
- SEO: titles, meta descriptions, canonical URLs, Open Graph/Twitter tags, JSON-LD

## Known gaps

- Not run against a live store (see main message). Test in a development store first.
- No blog/article, customer account (login, orders) or password templates. Shopify's default customer accounts cover login and orders if you use the new accounts experience.
- No product reviews, wishlist or cart drawer (add via apps or extend `theme.js`).
- Text strings are mostly hardcoded in English; only a few use `locales/en.default.json`.
- Product images are not included in the CSV.
