# OPS Prototypes for demo purposes
UI prototypes built with the [Ontario Design System](https://designsystem.ontario.ca/) React component library.

## Prerequisites

- Node.js 20+ recommended
- npm

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Prototype playground (GitHub Pages)

This repo deploys to GitHub Pages on every push to `main`:

**https://ops-09.github.io/Prototypes/**

One-time setup in the GitHub repo: **Settings → Pages → Source → GitHub Actions**.

## Ontario Design System integration

This project pins **Ontario Design System v8.1.0**:

| Package | Purpose |
| --- | --- |
| `@ongov/ontario-design-system-component-library-react` | React components |
| `@ongov/ontario-design-system-global-styles` | Global theme SCSS and utility classes |
| `@ongov/ontario-design-system-design-tokens` | Canonical design token values |

### Setup details

1. **Styles** — imported once in `src/main.tsx` via the compiled global theme CSS:
   ```tsx
   import '@ongov/ontario-design-system-global-styles/styles/css/compiled/ontario-theme.min.css';
   ```
2. **Assets** — fonts, images, and favicons are copied from the React package into `public/assets/` via `npm run copy:assets` (runs before `dev` and `build`).
3. **Asset path** — `setAssetPath` is called in `src/main.tsx` so Stencil components resolve assets at `/assets/`.

## AI documentation

When building UI with AI assistance, use the **project catalog** in [`docs/ods/`](docs/ods/) — not memory or third-party UI kits.

| File | Purpose |
| --- | --- |
| [`AGENTS.md`](AGENTS.md) | Agent onboarding and mandatory workflow |
| [`llms.txt`](llms.txt) | Root AI discovery file |
| [`docs/ods/COMPONENT-INDEX.md`](docs/ods/COMPONENT-INDEX.md) | Allowed React component exports |
| [`docs/ods/COMPONENT-API.md`](docs/ods/COMPONENT-API.md) | Documented props per component |
| [`docs/ods/TOKENS.md`](docs/ods/TOKENS.md) | Allowed SCSS design tokens |
| [`docs/ods/VERSION.md`](docs/ods/VERSION.md) | Installed ODS package versions |

Regenerate after upgrading any `@ongov/*` package:

```bash
npm run sync:ods-docs
```

## Official links

- [Developer documentation](https://designsystem.ontario.ca/developer-docs/)
- [Component guidance](https://designsystem.ontario.ca/components/)
- [React npm package](https://www.npmjs.com/package/@ongov/ontario-design-system-component-library-react)

