# AGENTS.md — OPS-RBAC

This project uses **Ontario Design System v8.1.0 only**. Read this file before writing or editing any UI code.

## Mandatory workflow

Before creating or editing `.tsx`, `.scss`, or `.css` files:

1. Read [`docs/ods/VERSION.md`](docs/ods/VERSION.md) — confirm installed ODS version matches `package.json`.
2. Read [`docs/ods/COMPONENT-INDEX.md`](docs/ods/COMPONENT-INDEX.md) — pick React export names (e.g. `OntarioTable`, not raw `<table>`).
3. Read [`docs/ods/COMPONENT-API.md`](docs/ods/COMPONENT-API.md) — use only documented props for chosen components.
4. Read [`docs/ods/TOKENS.md`](docs/ods/TOKENS.md) — use only listed SCSS variables for custom layout.
5. If a component, prop, or token is **not** in these files, **stop** — do not invent it. Use the official doc URL from the catalog or ask the user.

## Rules

- Import components from `@ongov/ontario-design-system-component-library-react` only.
- Import global styles once in `src/main.tsx`.
- **Never** use MUI, shadcn, Tailwind palette utilities, or bespoke HTML form controls when an ODS component exists.
- **Never** hardcode colors, spacing, or font values — use tokens from `docs/ods/TOKENS.md`.
- **Never** override ODS component shadow DOM or internal selectors.
- If no ODS component fits: compose layout with tokens only and note the gap in a code comment.

## Catalog location

[`docs/ods/`](docs/ods/) is the **single source of truth** for this project. Files are auto-generated — do not edit by hand. Regenerate with:

```bash
npm run sync:ods-docs
```

## Official fallback

When the catalog links out for more detail: https://designsystem.ontario.ca/developer-docs/
