# Build notes — 4 November 2026

GitHub Pages: https://ops-09.github.io/Prototypes/

- `6523d71` — Add Form 14 and Form 15 continuance prototypes and align Form 7 articles copy.
- `cb4820d` — Simplify Form 7 not-for-profit conversion and add bilingual name examples.
- Later the same day (not yet pushed): Form 1 and Form 2 step-order and copy updates, and primary-activity example text removed on all forms.

## Form 14 — Articles of Continuance (with share capital)

New 10-step prototype (`/form-14`).

1. Instructions (placeholder copy; continue to Step 2).
2. Co-operative details — sub-type, primary activity (NAICS), official email.
3. Current corporation name and proposed co-operative name with Nuans reports.
4. Original incorporating Act and incorporation or amalgamation date.
5. Head office address.
6. Directors — count, multi-stakeholder groups, written consent, first directors (add/edit subflow).
7. Restrictions on business and powers, authorized capital, preference terms, issued capital continued.
8. Membership classes and terms, stakeholder groups and terms, special provisions.
9. Declarations, authorizing Act and jurisdiction, date continuation was authorized.
10. Review — read-only summary with Change links back to each step (including cover letter).

Draft is saved in session storage. There is no submit step in this build.

## Form 15 — Articles of Continuance (without share capital)

Same 10-step flow as Form 14 (`/form-15`), with Step 7 using member-loan / membership-fee fields instead of share capital.

## Form 7 — Articles of Amendment

### Before you begin

- User-facing **NUANS** wording is now **Nuans**.
- Affidavit of Solvency (Amendment) is a Central Forms Repository link.
- Submission checklist is six items, including Nuans / www.nuans.com.
- Payment intro: “The fee depends on the type of amendment.”
- Instructions no longer say “project”.
- Contact intro no longer says “designation request”.
- Cancel instruction uses **Cancel**, not **Cancel and exit**.

### Amendment details (Step 3)

- Convert to not-for-profit no longer shows the number-name radio; a proposed name is always required.
- Convert to not-for-profit no longer shows the name-language radios; the corporation name and Nuans fields appear immediately.
- Convert to a business corporation still shows name-language radios when the corporation does not have a number name.
- Name-field examples: English **GREEN INSTITUTE INC.**; French **Institut Green Inc.**; combined **Green Institute Inc./ Institut Green Inc.**
- “(Set out in Block Capital Letters)” is removed from Form 7 steps, review, and PDF.

### Supporting documents (Step 4)

- Optional textarea above the certified-resolution upload (ODS has no rich-text component in v8.1.0).
- Hint: “Upload or enter the certified resolution or certified special resolution authorizing the amendment. You can upload more than one file.”
- Completeness accepts typed text or uploaded files.
- Date label: “The resolution authorizing the amendment was confirmed by the members of the co-operative on:”

### Generated PDF

- Item 5: “The resolution authorizing the amendment was confirmed by the members of the co-operative on:”
- Certified copy shows typed resolution text only; blank if empty or upload-only.
- Execution item: **Certified**, blank name line, **(Name of Co-operative)**, **By:**
- Co-operative name is not prefilled on the execution block.
- Signature heading is omitted; two blank rows with **Name** and **Description of office**.

## Shared articles PDF

All articles PDFs now place **This space for ministry use only** under the header, with **Ontario Corporation Number** on the far right. Each form keeps its own title and Act.

## Cross-form copy

User-facing **NUANS** → **Nuans** on Forms 1, 2, 3, 7, 10, and 11 (identifiers and URLs unchanged). Shared Before you begin instructions and contact copy apply to forms that use those strings.

## Form 1 and Form 2 — step order

Step 2 and Step 3 are swapped on both forms, including Before you begin, the step indicator, review Change links, and playground cards.

1. Contact information (cover letter).
2. Co-operative sub-type, primary activity (NAICS), and official email.
3. Co-operative name and Nuans report (Form 2 also asks whether it is a non-profit organization).

## Form 1 and Form 2 — Before you begin checklist

- Nuans copy is two bullets: the 90-day report requirement, then suppliers / Yellow Pages / **www.nuans.com**.
- New last bullet links to **Notice – Co-operative Corporations Act – Filings by Co-operative Corporations**.

## Form 1 and Form 2 — name caption

“(Set out in Block Capital Letters)” is removed from the name field, review, and generated articles PDF. The caption is **The name of the co-operative is:**

## Primary activity (all forms)

The **Example: childcare, housing, or manufacturing** hint is removed from the shared NAICS search field. Form 1 and Form 2 also no longer include **Example: 4521 - Department stores** in the primary-activity expander.

## Playground home

Home page cards and page lists added for Form 14 and Form 15. Existing form cards that mentioned NUANS now say Nuans. Form 1 and Form 2 Step 2 / Step 3 cards match the swapped order.

## Not in this build

- Form 14 / Form 15 submit step.
- Cover-letter mailing address.
- Rich-text editor for the certified resolution (pending an ODS component).
