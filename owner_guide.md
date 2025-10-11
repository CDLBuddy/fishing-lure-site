# RIP Custom Lures — Owner Guide

> **Site URL:** https://fishing-lure-site.vercel.app  
> **Admin URL:** https://fishing-lure-site.vercel.app/admin  
> **Repository:** https://github.com/CDLBuddy/fishing-lure-site  
> **Last updated:** 2025-10-11

This guide shows you how to log in to the admin, add/edit products, manage photos, and publish changes to your website. No code required.

---

## Contents

1. [Access & Sign-in](#access--sign-in)  
2. [Products: Add / Edit / Publish](#products-add--edit--publish)  
3. [Images: Quality, Size, Filenames](#images-quality-size-filenames)  
4. [Statuses: Draft vs Active vs Hidden](#statuses-draft-vs-active-vs-hidden)  
5. [Variants (sizes, colors, weights)](#variants-sizes-colors-weights)  
6. [Featured Products](#featured-products)  
7. [Cart & Checkout (Stripe)](#cart--checkout-stripe)  
8. [What Happens When You Publish](#what-happens-when-you-publish)  
9. [Troubleshooting](#troubleshooting)  
10. [FAQ](#faq)  
11. [Support](#support)

---

## Access & Sign-in

1. You’ll need a **GitHub account**. If you don’t have one, create it at https://github.com/join.
2. Send your **GitHub username** to the site maintainer (see [Support](#support)) so you can be added as a collaborator.
3. Visit **Admin**: `https://fishing-lure-site.vercel.app/admin`.
4. Click **Login with GitHub** and approve the authorization popup.  
   - If the popup is blocked, allow popups for the site and try again.

> Your admin changes are saved to the Git repository, which automatically redeploys the site.

---

## Products: Add / Edit / Publish

**Where:** Admin → **Products**

### Add a product
1. Click **New Products**.
2. Fill out the fields:
   - **ID (slug)**: short, lowercase id (e.g. `sb-001`).  
     _Don’t change this later — it becomes the product URL._
   - **Name** and **Description**
   - **Category**: spinnerbait / jig / crankbait / topwater / soft-plastic
   - **Images**: Add at least one (see image tips below).
   - **Variants**: Add one or more (e.g. different weights/colors).
     - **Variant ID** (e.g. `v1`)
     - **Label** (e.g. `3/8 oz • Chartreuse`)
     - **SKU** (your internal code)
     - **Stripe Price ID** (leave blank until checkout is enabled)
     - **Price (USD)** (optional display price for now)
   - (Optional) **Tags**, **Featured**, **Sort**, **Published At**
3. Click **Save**, then **Publish**.

### Edit a product
1. Open a product from the list.
2. Make changes and **Save**.
3. Click **Publish** to push it live.

### Remove a product
- Change **Status** to **Hidden** (not listed) or **Draft** (not public), then **Publish** the change.
- If you need it fully gone from the site, set **Hidden**, publish, then coordinate with the maintainer to remove the file entirely.

---

## Images: Quality, Size, Filenames

- **Shape**: Landscape **3:2** (cards expect this shape).  
- **Size**: ~**1200–1600 px** wide is ideal.
- **Format**: **JPG/JPEG** at quality ~80–85.
- **Filenames**: Lowercase, hyphens, no spaces (e.g. `river-shimmer.jpg`).  
  _Web hosting is case-sensitive: `Lure.jpg` ≠ `lure.jpg`._

> If you change a photo but still see the old one, try a hard refresh. For instant updates, upload with a **new filename**.

---

## Statuses: Draft vs Active vs Hidden

- **Draft**: Not live. Safe place to work before publishing.
- **Active**: Live on the site (shows in catalog, product page, sitemap).
- **Hidden**: Not listed publicly; kept out of the sitemap.

> When in doubt, use **Draft** until you’re ready, then switch to **Active**.

---

## Variants (sizes, colors, weights)

Use **Variants** for different sizes, colors, weights, or hooks of the same lure.

- Give each variant a stable **Variant ID** (e.g. `v1`, `v2`).
- **Label** is displayed to shoppers (e.g. `1/2 oz • Brown/Orange`).
- **SKU** is your internal code for inventory.
- **Stripe Price ID** stays empty until checkout is enabled.

---

## Featured Products

Toggle **Featured** to highlight a product on the homepage/featured rails (if configured). Use sparingly so the best items stand out.

---

## Cart & Checkout (Stripe)

- The site supports a **shopping cart** now.
- **Checkout is currently disabled** until Stripe is connected.  
  When you’re ready:
  1. We’ll configure Stripe products/prices.
  2. We’ll paste **Stripe Price IDs** into each variant.
  3. We’ll enable checkout and test with Stripe’s test mode.

---

## What Happens When You Publish

1. The admin saves your changes to the Git repository.
2. The hosting platform **rebuilds** and **deploys** the site automatically.
3. When the deploy finishes, refresh your site to see updates.

> Don’t worry if you don’t see changes immediately right after publishing — they appear after the new build goes live.

---

## Troubleshooting

- **Admin login loop or “Authorization failed”**  
  - Ensure popups are allowed.  
  - Verify you’re logged into the **GitHub account** that was invited.  
  - If needed, try a private/incognito window.

- **I changed a product but don’t see it on the site**  
  - Did you click **Publish** (not just Save)?  
  - Wait for the site to redeploy, then refresh.  
  - If still missing, confirm the product **Status** is **Active**.

- **Photo isn’t updating**  
  - Try a hard refresh.  
  - For instant change, upload with a **new filename**.

- **Broken link / “Not found”**  
  - Don’t change the **ID (slug)** of products that are already public.  
  - If a slug must change, coordinate a redirect with the maintainer.

- **Variants disappeared**  
  - Ensure each variant has **Variant ID**, **Label**, and **SKU** filled in.

---

## FAQ

**Can I create categories?**  
Yes, but keep them within the approved list for now: spinnerbait, jig, crankbait, topwater, soft-plastic. Ask the maintainer to add more if needed.

**Can I reorder products?**  
Yes—use the **Sort** field (lower numbers appear first). If not visible on the site yet, ask the maintainer to enable sorting on the catalog view.

**Can I use PNGs or HEIC from my phone?**  
JPG is recommended for size/quality. You can upload PNG, but file sizes will be larger. Convert HEIC to JPG before upload.

**Can I run sales or discount prices?**  
Yes, once Stripe is live we can add sale prices or coupon codes through Stripe and reflect that on the site.

---

## Support

- **Maintainer:** CDLBuddy  
- **Contact:** Open an issue in the repo: https://github.com/CDLBuddy/fishing-lure-site/issues  
- **Backup Contact:** _optional_

> If you’re ever stuck, include a brief description of what you tried and a screenshot of the admin page. That speeds up fixes.

---

### One-page Cheat Sheet

- **Login:** `/admin` → Login with GitHub → Products  
- **Add:** New → fill fields → Save → **Publish**  
- **Edit:** Open item → change → Save → **Publish**  
- **Status:** Draft (not live) / Active (live) / Hidden (not listed)  
- **Photos:** JPG, ~3:2, ~1600px, lowercase-hyphen filenames  
- **Variants:** Each needs ID + Label + SKU  
- **Checkout:** Disabled until Stripe is connected