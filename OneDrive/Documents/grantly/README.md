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

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm audit
npm run build
```

The scholarship catalog, eligibility rules, filter logic, deadline calculations, and application updates live in `src/domain/scholarships.ts`. This domain module is checked with TypeScript strict mode. The existing React screens remain JavaScript/JSX; `npm run typecheck` does not claim to type-check those screens. Shared card, form, deadline, and status UI is in `src/components/ScholarshipComponents.jsx`.

The tests cover sample eligibility, missing criteria, discovery filters, search/sorting, deadline boundaries, tracker creation and status history, and malformed stored data. The test command uses Node's built-in TypeScript stripping and therefore needs Node 22.18 or newer.

## Animation implementation

- `framer-motion` animates the 3D hero, counters, hover effects and dialogs. Page and filtered-card entrances use CSS animations so filtered items are removed reliably.
- `src/styles.css` adds CSS 3D perspective, floating graduation elements, orbital rings, responsive layouts and reduced-motion support.
- Dashboard statistics, eligibility scoring, deadlines and application progress are calculated from the scholarship catalog, profile and application data. "Scholarships explored" counts unique scholarship detail views.
- Scholarship search supports provider/name keywords, category, minimum award amount, eligibility score and amount/deadline sorting. Bookmarks, profile editing and application status/history changes persist through LocalStorage.
- Matcher inputs are validated before scoring; scholarship cards and results explain sample criteria and gaps. Notifications summarize closing-soon opportunities.
- Dialogs support Escape, focus trapping and focus restoration. Layouts and animations respect reduced-motion settings.

## Notes

Scholarship names, organizations, award values, deadlines and eligibility rules are illustrative demo data. Eligibility matching is simplified and is not an official decision. Verify every detail with the official provider.

Adding an opportunity to the tracker starts it at **Saved**; GRANTLY does not submit forms to scholarship providers. Students update statuses themselves after applying externally. Profile fields, including academic score and family income, are stored in browser LocalStorage and are not encrypted; avoid entering sensitive personal or account credentials. Use **Settings → Reset workspace** to remove the demo data from this browser.
