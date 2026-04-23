# Design System Strategy: The Modern Sanctuary

This document outlines the visual and structural logic for the room management platform. Our goal is to move beyond the rigid, "boxed-in" feel of traditional management software. We are building a "Digital Sanctuary"—an environment that feels as organized and welcoming as a well-managed home.

## 1. Creative North Star: The Modern Sanctuary
The design philosophy centers on **Soft Precision**. While the backend logic is complex (contracts, debts, maintenance), the frontend must feel effortless. We achieve this by breaking the "standard grid" through intentional white space, layered depth, and a complete rejection of harsh structural lines. 

The experience should feel like an editorial layout: high-contrast typography, generous margins, and a sense of calm authority.

---

## 2. Color & Tonal Architecture
We utilize a sophisticated palette that balances trust (Blue) with growth (Green), grounded in a spectrum of soft, atmospheric grays.

### The "No-Line" Rule
**Strict Directive:** Do not use 1px solid borders to define sections or containers. 
Traditional borders create visual "noise" that exhausts the user. Instead, define boundaries through:
- **Tonal Shifts:** Placing a `surface-container-low` card against a `surface` background.
- **Negative Space:** Using the spacing scale to create implicit boundaries.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. We use the Material Design surface tokens to create "stacked" depth:
- **Base Layer:** `surface` (#f6fafe) — The infinite canvas.
- **Structural Layer:** `surface-container-low` (#f0f4f8) — For grouping related content areas.
- **Action Layer:** `surface-container-lowest` (#ffffff) — For primary interactive cards and white-space "islands."
- **Elevated Layer:** `surface-container-high` (#e4e9ed) — For navigation rails or contextual overlays.

### The Glass & Gradient Rule
To prevent the UI from looking "flat," use Glassmorphism for floating elements (Modals, Mobile Bottom Sheets). 
- **Recipe:** `surface` color at 80% opacity + `backdrop-blur-xl`.
- **Signature Textures:** Apply a subtle linear gradient to primary buttons, transitioning from `primary` (#004ac6) to `primary_container` (#2563eb). This adds a "jewel-like" quality that signals premium quality.

---

## 3. Typography: Editorial Authority
We use a dual-font system to bridge the gap between "Professional" and "Friendly."

| Level | Token | Font | Size | Intent |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-sm` | Be Vietnam Pro | 2.25rem | Hero financial amounts (e.g., 15.000.000đ) |
| **Headline** | `headline-sm` | Be Vietnam Pro | 1.5rem | Page titles and room numbers |
| **Title** | `title-md` | Inter | 1.125rem | Card headers and section labels |
| **Body** | `body-md` | Inter | 0.875rem | Standard UI text and descriptions |
| **Label** | `label-sm` | Inter | 0.6875rem | Status badges and captions |

**Vietnamese Formatting:** Financial figures must use the `display-sm` or `headline-sm` tokens. Ensure the "đ" symbol is slightly smaller or lightened to keep the focus on the numerical value.

---

## 4. Elevation & Depth
We replace traditional shadows with **Ambient Light** and **Tonal Layering**.

- **The Layering Principle:** Depth is achieved by stacking. A `surface-container-lowest` card sitting on a `surface-container-low` background creates a natural lift.
- **Ambient Shadows:** Only for "Floating" elements (e.g., Popovers). 
    - **Blur:** 24px - 40px. 
    - **Opacity:** 4% - 6%. 
    - **Color:** Use a tinted version of `on-surface` (#171c1f), never pure black.
- **The Ghost Border:** If a border is required for accessibility, use `outline_variant` at **15% opacity**. It should be felt, not seen.

---

## 5. Signature Components

### Buttons (The Tactile Core)
- **Primary:** Gradient fill (`primary` to `primary_container`), `rounded-md` (0.75rem), white text. 
- **Secondary:** `surface-container-high` background with `on-surface` text. No border.
- **Tertiary:** Pure text with `primary` color. High padding for touch targets.

### Status Badges (The Semantic Signal)
Badges must use low-vibrancy "Pill" shapes with high-contrast text.
- **Paid/Rented:** `secondary_fixed` background / `on_secondary_fixed` text.
- **Pending/Repair:** `tertiary_fixed` background / `on_tertiary_fixed` text.
- **Overdue/Debt:** `error_container` background / `on_error_container` text.
- **Empty:** `surface_variant` background / `on_surface_variant` text.

### Room Cards & Financial Lists
- **Rule:** Forbid divider lines. 
- **Alternative:** Use 16px of vertical white space or a 4px left-accent bar using the status color (e.g., a green bar for "Paid").
- **Financial Layout:** Always right-align currency values in lists to allow for quick scanning of decimal places.

### Specialized Component: The "Quick-Action" Sheet
Given the mobile-first requirement, use a Radix-based Bottom Sheet for all room edits. It should use the **Glassmorphism** rule to maintain a sense of context with the background data.

---

## 6. Do's and Don'ts

### Do
- **Use "Be Vietnam Pro"** for all numbers and titles. It is optimized for Vietnamese diacritics and looks premium.
- **Embrace Asymmetry.** Align text to the left but allow large imagery or data visualizations to bleed slightly off-center to create an editorial feel.
- **Use Soft Grays.** Layering `#f6fafe` on `#ffffff` is more sophisticated than using a single gray tone.

### Don't
- **Don't use 100% black.** Use `on_surface` (#171c1f) for all text to reduce eye strain.
- **Don't use sharp corners.** Stick to the `md` (0.75rem) and `lg` (1rem) roundedness scale to keep the "Friendly" tone.
- **Don't use "Standard" Tailwind Blue.** Always map to the `primary` token (#004ac6) which has been tuned for professional trust.

---

## 7. Implementation Note for Developers
This system is designed to be implemented using **TailwindCSS** and **Radix UI/Shadcn**. When building, extend the Tailwind config with the Material tokens provided. Use `gap` and `padding` utility classes rather than `border` classes to achieve the "No-Line" layout.