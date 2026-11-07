# GRANTLY — Unified Scholarship Discovery & Management

Premium Lavender React + Vite scholarship dashboard with lightweight CSS 3D and smooth UI motion.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

## Production build

```bash
npm run build
npm run preview
```

## Animation implementation

- `framer-motion` animates page transitions, the 3D hero, counters, cards and dialogs.
- `src/styles.css` adds CSS 3D perspective, floating graduation elements, orbital rings, responsive layouts and reduced-motion support.
- Dashboard statistics, eligibility scoring, deadlines and application progress are calculated from the scholarship catalog, profile and application data. "Scholarships explored" counts unique scholarship detail views.
- Scholarship search, category filters, sorting, bookmarks, profile editing and application status changes persist through LocalStorage.

## Notes

Scholarship names, organizations, award values, deadlines and eligibility rules are illustrative demo data. Eligibility matching is simplified and is not an official decision. Verify every detail with the official provider.
