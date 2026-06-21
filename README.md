# Wytnest — Web App

Design-forward testimonial collection & display SaaS. Marketing site + dashboard + submission flow.
Built by **CyberSage**. Aesthetic: ultra-modern, night-canvas editorial, Awwwards 2026.

> Open `preview.html` in a browser to see the marketing site rendered without running anything.

---

## Stack

- **Next.js 15** (App Router, React 19)
- **Tailwind CSS** with a custom token system (`tailwind.config.ts`)
- **GSAP + ScrollTrigger** for the hero sequence and scroll reveals
- **Supabase** (auth, Postgres, RLS) — schema lives in the sibling `wytnest/` backend bundle
- Fonts via `next/font`: **Bricolage Grotesque** (display), **Fraunces** (quote serif), **Geist** (UI), **Geist Mono** (labels/code)

## Run

```bash
npm install
cp .env.example .env.local   # fill in Supabase + provider keys
npm run dev                  # http://localhost:3000
```

## Design system

The signature is the **Witness Wall** — vertical columns of testimony drift at opposing
speeds behind the hero claim (`components/marketing/WitnessWall.tsx`). The product is a
testimonial wall, so the hero is one too.

Tokens (in `tailwind.config.ts`):

- **Canvas** — `night #0A0917`, `panel #131128`, `panel2 #1E1A42` (violet-tinted dark)
- **Ink violet** — `ink-600 #4F3FCC` core, `ink-400 #7B6EF5` glow, `ink-200 #B0A8FC` text-on-dark
- **Amber gold** — `gold-400 #E8960F` foil; reserved for proof markers only (stars, the sequence thread, the hero underline, the popular tier)
- **Carbon** neutrals, **paper** for any future light surfaces

Type roles: display = Bricolage; **real testimony is always set in Fraunces** (`.testimony`);
UI = Geist; eyebrows / data / embed code = Geist Mono (`.eyebrow`).

Utility classes in `styles/globals.css`: `.glass-dark`, `.witness-card`, `.text-foil`,
`.text-gradient`, `.foil-underline`, `.testimony`, `.eyebrow`, `.mask-fade-x/y`, `.reveal`.
Reduced-motion freezes the wall and disables reveals.

## Structure

```
app/
  layout.tsx              fonts + metadata
  page.tsx                marketing composition
  submit/[token]/page.tsx public testimonial recording flow (4 steps)
  dashboard/              overview, testimonials, widgets, campaigns, analytics
components/
  marketing/              Navbar, Hero, WitnessWall, HowItWorks, Features, Pricing, CTA
  widgets/                BentoWall, Ticker + CinematicSlider  (each has a `dark` prop)
  dashboard/              DashboardShell (collapsible sidebar)
lib/                      utils, mock-data, use-scroll-reveal
styles/globals.css        design system
```

## Notes for continuation

- Marketing site is on the night canvas end-to-end. The dashboard and submission flow are
  currently light "app surfaces" by design — convert to dark if a unified theme is preferred.
- Widgets read from `lib/mock-data.ts`. Wire them to Supabase via the embed payload shape in
  the backend `database.types.ts` (`WidgetEmbedPayload`).
- The standalone `components` embed for third-party sites is the separate `wytnest.embed.ts`
  in the backend bundle (shadow-DOM isolated) — this app renders the same layouts natively.
