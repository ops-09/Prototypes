# Build notes — 4 November 2026

GitHub Pages: https://ops-09.github.io/Prototypes/

- `6523d71` — Add Form 14 and Form 15 continuance prototypes and align Form 7 articles copy.
- `cb4820d` — Simplify Form 7 not-for-profit conversion and add bilingual name examples.
- `9d9c661` — Align Form 1, Form 2, and Form 7 articles PDFs with the paper forms and update Form 1 and Form 2 step order.
- `02a2353` — Align the Form 10 checklist, supporting documents, and articles PDF with the paper form.

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

- **Amendment details** (the old item 3) is removed. Later items move up, so the certified resolution is item 3.
- Certified copy shows typed resolution text only; blank if empty or upload-only.
- “The resolution authorizing the amendment was confirmed by the members of the co-operative on:” follows the certified copy.
- Execution item: **Certified**, blank name line, **(Name of Co-operative)**, **By:**
- Co-operative name is not prefilled on the execution block.
- Signature heading is omitted; two blank rows with **Name** and **Description of office**.

## Shared articles PDF

All articles PDFs now place **This space for ministry use only** under the header, with **Ontario Corporation Number** on the far right. A solid line sits under the stamp box, before item 1. Each form keeps its own title and Act.

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

## Form 1 and Form 2 — generated PDF

Ministry name under the Ontario logo is **Ministry of Government and Consumer Services** (other forms still say Ministry of Public and Business Service Delivery).

- First-directors column: **Name in full, including all given names**.
- Incorporator name columns (addresses table, and the Form 1 shares table): **Incorporators full names, including all given names**.
- Execution is a numbered item: **18** on Form 1 and **17** on Form 2. The label is **These articles are executed for delivery to the Minister**.
- Under that label: “Full name(s) and signature(s) of incorporator(s). In the case of a corporation set out the name of the corporation and the name and office of the person signing on behalf of the corporation.”
- Signature lines stay under that sentence. The **Signatures** heading is omitted.

## Primary activity (all forms)

The **Example: childcare, housing, or manufacturing** hint is removed from the shared NAICS search field. Form 1 and Form 2 also no longer include **Example: 4521 - Department stores** in the primary-activity expander.

## Form 10 — Before you begin checklist

Submission checklist replaced. Bullets:

1. Certified amalgamation agreement, including the six-month effective-date rule.
2. Affidavits of Solvency (Amalgamation), with a Central Forms Repository link.
3. Ontario Nuans report when the amalgamated co-operative has a new name.
4. Nuans report dated within 90 days of submission.
5. Nuans suppliers / Yellow Pages / **www.nuans.com**.
6. Primary activity must match a NAICS code, linking to NAICS Canada.
7. Link to **Notice – Co-operative Corporations Act – Filings by Co-operative Corporations**.

## Form 10 — playground pages

Home-page cards for Steps 1–7 open the matching page. Steps 4 and 5 no longer bounce back to amalgamating co-operatives when opened directly. Sample amalgamating co-operatives are filled in only when those earlier answers are missing.

## Form 10 — supporting documents (Step 5)

- Text box under **The following is a certified copy of the amalgamation agreement:**, same pattern as Form 7 Step 4.
- Typed text or one uploaded file completes the item.
- Typed text is saved on the draft and shown on review.

## Form 10 — generated PDF

- Amalgamating co-operatives table headers: **Name of the Co-operatives**, **Ontario Corporation Number**, **Dates of Members’ Approval (Year, Month, Day)**.
- Item 4: **The following is a certified copy of the amalgamation agreement:**. Shows the Step 5 text, or stays blank when that box is empty.
- Item 5: **These articles are executed for delivery to the Minister.**
- Under item 5, in order: **Certified**, the names-and-seals sentence, **By:**, then one signature block per amalgamating co-operative.
- Each signature block: the co-operative’s name on a line labeled **Name of Co-operative**, then **Signature**, **Print name of signatory**, and **Description of Office**. Lines are plain, not highlighted.
- The old signature heading and “Names and seals…” label above the signature rows are removed. That sentence now sits under **Certified**.

## Playground home

Home page cards and page lists added for Form 14 and Form 15. Existing form cards that mentioned NUANS now say Nuans. Form 1 and Form 2 Step 2 / Step 3 cards match the swapped order. Form 10 Step 1–7 cards open the matching pages.

## Not in this build

- Form 14 / Form 15 submit step.
- Cover-letter mailing address.
- Rich-text editor for the certified resolution or the amalgamation agreement (pending an ODS component). Both are plain text boxes.
