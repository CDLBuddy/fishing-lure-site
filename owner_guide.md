# RIP Custom Lures — Owner Guide

> **Site URL:** https://fishing-lure-site.vercel.app  
> **Admin URL:** https://fishing-lure-site.vercel.app/admin  
> **Repository:** https://github.com/CDLBuddy/fishing-lure-site  
> **Last updated:** 2025-10-11

This guide shows you how to log in to the admin, add/edit products, manage customer catch photos in the gallery, and publish changes to your website. No code required.

The CMS has been redesigned with **sectioned forms** to make it easier and less overwhelming!

---

## Contents

1. [Access & Sign-in](#access--sign-in)  
2. [Products: Add / Edit / Publish](#products-add--edit--publish)  
3. [Gallery: Customer Catches](#gallery-customer-catches)  
4. [New Sectioned UI](#new-sectioned-ui)  
5. [Images: Quality, Size, Filenames](#images-quality-size-filenames)  
6. [Statuses: Draft vs Published](#statuses-draft-vs-published)  
7. [Variants (sizes, colors, weights)](#variants-sizes-colors-weights)  
8. [Featured Items](#featured-items)  
9. [Cart & Checkout (Stripe)](#cart--checkout-stripe)  
10. [What Happens When You Publish](#what-happens-when-you-publish)  
11. [Troubleshooting](#troubleshooting)  
12. [FAQ](#faq)  
13. [Support](#support)

---

## Access & Sign-in

1. You'll need a **GitHub account**. If you don't have one, create it at https://github.com/join.
2. Send your **GitHub username** to the site maintainer (see [Support](#support)) so you can be added as a collaborator.
3. Visit **Admin**: `https://fishing-lure-site.vercel.app/admin`.
4. Click **Login with GitHub** and approve the authorization popup.  
   - If the popup is blocked, allow popups for the site and try again.

> Your admin changes are saved to the Git repository, which automatically redeploys the site.

---

## Products: Add / Edit / Publish

**Where:** Admin → **🎣 Products (Lures)**

### Add a product

1. Click **New Product**.
2. The form is organized into collapsible sections. Fill them out step-by-step:

#### 📝 Basic Product Info
   - **Product ID**: short, lowercase code (e.g. `sb-001`, `crank-blue`)  
     _Cannot change after creation — becomes the product URL!_
   - **Product Name**: Full name (e.g. "River Shimmer Spinnerbait")
   - **Category**: Select from dropdown with icons:
     - 🌀 Spinnerbait
     - 🪝 Jig
     - 🐠 Crankbait
     - 🌊 Topwater
     - 🪱 Soft Plastic

#### 📄 Description
   - Write 20+ characters describing the lure, how it works, best conditions, target species

#### 📸 Product Photos
   - Upload 1-5 photos. First photo becomes the main image
   - See [Images section](#images-quality-size-filenames) for tips

#### 🎨 Variants (Sizes/Colors/Weights)
   - Add one or more variants (different sizes/colors)
   - **Variant ID**: Internal code (e.g. `v1`, `3-8oz-chart`)
   - **Variant Label**: Select from dropdown or type custom:
     - Common weights: 1/8 oz, 1/4 oz, 3/8 oz, 1/2 oz, etc.
     - Popular colors: Chartreuse, White, Black, Blue, Silver, Gold, etc.
     - Combos: "3/8 oz • Chartreuse", "1/2 oz • White", etc.
     - Can type custom values if not in list!
   - **SKU**: Your inventory code
   - **Price**: Display price (e.g. 12.99)
   - **Stripe Price ID**: Leave blank until checkout enabled

#### ⚙️ Publishing Options (collapsed by default)
   - **Status**: ✏️ Draft / ✅ Active / 👁️ Hidden
   - **⭐ Featured**: Toggle to highlight on homepage
   - **Sort Order**: Lower numbers appear first (optional)
   - **Tags**: Keywords for search (optional)
   - **Publish Date**: When added (optional)

3. Click **Save**, then **Publish**.

### Edit a product

1. Open a product from the list.
2. Make changes and **Save**.
3. Click **Publish** to push it live.

### Remove a product

- Change **Status** to **Hidden** (not listed) or **Draft** (not public), then **Publish** the change.
- If you need it fully gone from the site, set **Hidden**, publish, then coordinate with the maintainer to remove the file entirely.

---

## Gallery: Customer Catches

**Where:** Admin → **🎣 Gallery (Catches)**

The Gallery showcases real catches from real anglers using your lures. This builds trust and excitement!

### Add a catch photo

1. Click **New Catch Photo**.
2. The form is organized into sections. Fill them out step-by-step:

#### 📝 Basic Information
   - **Auto ID**: Leave as-is (auto-generated from date and title)
   - **Photo Title/Caption**: Brief description (e.g. "Dan's 5lb Largemouth Bass")
   - **When was it caught?**: Select date from calendar (no time needed)

#### 🐟 Catch Details
   - **Angler Name**: Who caught it (optional, for credit)
   - **Fish Species**: Select from dropdown:
     - Largemouth Bass, Smallmouth Bass, Spotted Bass, Striped Bass
     - Pike, Muskie, Walleye, Crappie, Bluegill
     - Trout, Catfish, Redfish, Snook, Tarpon
     - Other (if not listed)
   - **Location**: Where caught (e.g. "Lake Michigan")
   - **Length (inches)**: Optional measurement
   - **Weight (pounds)**: Optional measurement

#### 🎣 Which Lure?
   - **Lure Used**: Select which product was used (creates automatic link!)
   - Search by product name or ID

#### 📸 Photos
   - Upload 1-5 photos. First photo is the thumbnail
   - Add **Photo Description (Alt Text)** for accessibility

#### ⚙️ Publishing Options (collapsed by default)
   - **Status**: ✏️ Draft / ✅ Published
   - **⭐ Featured**: Highlight at top of gallery
   - **Sort Order**: Lower numbers appear first (optional)
   - **Tags**: Keywords for filtering (e.g. `bass`, `summer`, `trophy`)
   - **Publish Date**: Optional specific publish date/time

3. Click **Save**, then **Publish**.

### Gallery features

- **Filters**: Visitors can filter by category, specific lure, or search
- **Lightbox**: Click any photo to view full-size with keyboard navigation (←/→/Esc)
- **Product links**: Catches automatically link to the lure that was used
- **Pagination**: Loads 24 catches at a time for fast performance

### Tips for great gallery entries

- Use high-quality photos showing the fish and lure together when possible
- Fill in measurements to build credibility
- Link to the specific lure product for easy shopping
- Mark your best catches as **Featured**
- Use consistent tags for easier filtering
- Select species from dropdown for consistency

---

## New Sectioned UI

The CMS has been redesigned to be less overwhelming! Here's what's new:

### What Changed?
- **Grouped Fields**: Related fields are grouped into sections with emoji icons
- **Collapsible Sections**: Advanced options are collapsed by default
- **Dropdowns**: Common values (species, colors, weights) now have dropdowns
- **Helpful Hints**: Every field has contextual help text
- **Mobile-Friendly**: Works great on phones and tablets

### Why Is This Better?
- **Less Overwhelming**: See 5 sections instead of 17 individual fields
- **Faster**: Select from dropdowns instead of typing everything
- **Fewer Errors**: Dropdowns ensure consistent spelling
- **Clearer**: Icons and labels guide you through the process
- **Progressive**: Fill essentials first, advanced options later

### Using Sections
1. Open a section to see its fields
2. Fill out the fields
3. Click the section header to collapse it
4. Move to the next section
5. Publishing Options are collapsed — expand only if needed

This wizard-like approach makes it easy to know what to do next!

---

## Images: Quality, Size, Filenames

- **Shape**: Landscape **3:2** (cards expect this shape).  
- **Size**: ~**1200–1600 px** wide is ideal.
- **Format**: **JPG/JPEG** at quality ~80–85.
- **Filenames**: Lowercase, hyphens, no spaces (e.g. `river-shimmer.jpg`).  
  _Web hosting is case-sensitive: `Lure.jpg` ≠ `lure.jpg`._

> If you change a photo but still see the old one, try a hard refresh. For instant updates, upload with a **new filename**.

---

## Statuses: Draft vs Published

**For Products:**
- **Draft**: ✏️ Not live. Safe place to work before publishing.
- **Active**: ✅ Live on the site (shows in catalog, product page, sitemap).
- **Hidden**: 👁️ Not listed publicly; kept out of the sitemap.

**For Catches (Gallery):**
- **Draft**: ✏️ Not visible in gallery. Use while editing.
- **Published**: ✅ Live in the gallery for visitors to see.

> When in doubt, use **Draft** until you're ready, then switch to **Active** (products) or **Published** (catches).

---

## Variants (sizes, colors, weights)

Use **Variants** for different sizes, colors, weights, or hooks of the same lure.

- Give each variant a stable **Variant ID** (e.g. `v1`, `v2`).
- **Label** is displayed to shoppers — now has dropdown with 30+ common options:
  - Weights: 1/8 oz, 1/4 oz, 3/8 oz, 1/2 oz, 3/4 oz, 1 oz
  - Colors: Chartreuse, White, Black, Blue, Silver, Gold, Red, Green, Purple, etc.
  - Combos: "3/8 oz • Chartreuse", "1/2 oz • White", etc.
  - Can still type custom values if not in dropdown!
- **SKU** is your internal code for inventory.
- **Stripe Price ID** stays empty until checkout is enabled.

---

## Featured Items

**Products**: Toggle **⭐ Featured** to highlight a product on the homepage/featured rails (if configured).

**Catches**: Toggle **⭐ Featured** to showcase exceptional catches at the top of the gallery.

Use sparingly so the best items stand out.

---

## Cart & Checkout (Stripe)

- The site supports a **shopping cart** now.
- **Checkout is currently disabled** until Stripe is connected.  
  When you're ready:
  1. We'll configure Stripe products/prices.
  2. We'll paste **Stripe Price IDs** into each variant.
  3. We'll enable checkout and test with Stripe's test mode.

---

## What Happens When You Publish

1. The admin saves your changes to the Git repository.
2. The hosting platform **rebuilds** and **deploys** the site automatically.
3. When the deploy finishes, refresh your site to see updates.

> Don't worry if you don't see changes immediately right after publishing — they appear after the new build goes live.

---

## Troubleshooting

- **Admin login loop or "Authorization failed"**  
  - Ensure popups are allowed.  
  - Verify you're logged into the **GitHub account** that was invited.  
  - If needed, try a private/incognito window.

- **I changed a product but don't see it on the site**  
  - Did you click **Publish** (not just Save)?  
  - Wait for the site to redeploy, then refresh.  
  - If still missing, confirm the product **Status** is **Active**.

- **Gallery catch isn't showing**  
  - Verify **Status** is **Published** (not Draft).
  - Click **Publish** to save and deploy changes.
  - Wait for rebuild, then refresh the gallery page.

- **Photo isn't updating**  
  - Try a hard refresh (Ctrl+F5 or Cmd+Shift+R).  
  - For instant change, upload with a **new filename**.

- **Can't select a lure when adding a catch**  
  - Make sure products exist and are **Active**.
  - The relation widget searches by product name and ID.
  - If you just added a product, publish it first.

- **Fields are grouped in sections — is this normal?**  
  - Yes! The CMS was redesigned to be less overwhelming.
  - Click section headers to expand/collapse them.
  - This is the new normal and much easier to use!

- **Dropdown doesn't have my option**  
  - For variant labels and some other fields, you can type custom values.
  - Look for dropdowns that say "Can type custom option."

- **Broken link / "Not found"**  
  - Don't change the **ID (slug)** of products that are already public.  
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

**Should I add every catch to the gallery?**  
Focus on quality over quantity! Add catches that:
- Show the lure and fish clearly
- Have good lighting and composition
- Represent different species, locations, or lure types
- Tell a story or build excitement

**Can customers submit their own catch photos?**  
Not automatically yet, but you can:
- Create a form or email where customers send photos
- Add them manually to the admin with credit to the angler
- Or coordinate with the maintainer to add a submission feature

**How many photos per catch?**  
You can upload multiple photos for each catch. They'll appear in the lightbox viewer where visitors can navigate through them.

**Why are fields grouped into sections now?**  
To make the CMS less overwhelming! Instead of 17 fields at once, you see 5 sections. Fill them one at a time. Advanced options are collapsed by default so you can focus on essentials.

**Can I still access all the old fields?**  
Yes! All fields are still there, just organized better. Click section headers to expand and see all fields.

**Do dropdowns limit my options?**  
No! Most dropdowns allow you to type custom values. For example, variant labels have 30+ common options but you can type any custom combination you want.

---

## Support

- **Maintainer:** CDLBuddy  
- **Contact:** Open an issue in the repo: https://github.com/CDLBuddy/fishing-lure-site/issues  
- **Backup Contact:** _optional_

> If you're ever stuck, include a brief description of what you tried and a screenshot of the admin page. That speeds up fixes.

---

### One-page Cheat Sheet

**Products:**
- **Login:** `/admin` → Login with GitHub → 🎣 Products (Lures)
- **Sections:** Basic Info → Description → Photos → Variants → Publishing Options
- **Add:** New → fill sections → Save → **Publish**
- **Edit:** Open item → change → Save → **Publish**
- **Status:** ✏️ Draft / ✅ Active / 👁️ Hidden
- **Category:** Select from dropdown with icons
- **Variant Labels:** 30+ dropdown options or type custom
- **Photos:** JPG, ~3:2, ~1600px, lowercase-hyphen filenames

**Gallery (Catches):**
- **Login:** `/admin` → Login with GitHub → 🎣 Gallery (Catches)
- **Sections:** Basic Info → Catch Details → Which Lure? → Photos → Publishing Options
- **Add:** New → fill sections → Save → **Publish**
- **Species:** Select from dropdown (15 common species)
- **Status:** ✏️ Draft / ✅ Published
- **Link to lure:** Use the Lure dropdown to connect catch to product
- **Photos:** Can upload multiple per catch, JPG preferred
- **Featured:** ⭐ Toggle on for your best catches

**General:**
- **UI:** Sectioned forms with collapsible sections
- **Dropdowns:** Common values pre-filled, can type custom
- **Hints:** Every field has helpful examples
- **Mobile:** Works great on phones/tablets
- **Checkout:** Disabled until Stripe is connected
- **Publish workflow:** Save changes → Publish → Wait for rebuild → Refresh site
