# Build notes — 16 October 2026

GitHub Pages: https://ops-09.github.io/Prototypes/

- `02d9794` — Support multiple NUANS reports, Not applicable share and membership entry, director minimums, and manual corporation entry on Form 1, and align Form 7 name and NUANS fields.
- `bdfac0a` — Make stakeholder membership fields optional when the co-operative is not multi-stakeholder.
- `166848d` — Require a minimum number of incorporators by co-operative sub-type on Form 1.
- `ea12bef` — Add the Form 2 articles without share capital prototype.
- `1ee0c56` — Add Form 7 Before you begin and show the Act line as body text on Forms 1 and 2.

## Form 2 — Articles of Incorporation (without share capital)

New prototype (`/form-2`), cloned from Form 1 without share fields.

Before you begin title: **Articles of Incorporation of a Co-operative without Share Capital**, with **Co-operative Corporations Act** as body text under the title.

1. Contact information (cover letter).
2. Co-operative name and NUANS. This step also asks whether the co-operative is a non-profit organization.
3. Co-operative sub-type, primary activity (NAICS), and official email.
4. Head office address.
5. First directors — add and edit.
6. Member loans and restrictions — business or powers restrictions, member loans, and membership fee.
7. Membership and provisions.
8. Incorporators — no share fields. Add still creates only non-director incorporators.
9. Review — summary, generated articles PDF, and authorization.

Directors who are not incorporators still confirm consent and upload the consent PDF.

## Form 1 — filing rules

- Incorporators: at least 3, or 5 for a worker co-operative, and only after a sub-type is selected. The unused Other sub-type free-text field is removed. The incorporators step shows the count guidance.
- Stakeholder membership fields are required only when the directors step says the co-operative is multi-stakeholder.
- More than one NUANS report can be added, with a remove action on each report.
- Share and membership questions can be answered **Not applicable**.
- Director count enforces the minimum for the selected sub-type.
- If the Ontario corporation search does not find a match, the incorporator can enter the corporation manually.

## Form 7 — Before you begin

`/form-7` is now the instructions page. Title lines: **Articles of Amendment** and **Form 7**, with **Co-operative Corporations Act** under the title.

Steps listed: contact information, business details, amendment details (including a proposed name and NUANS report when the name changes), supporting documents, and review.

The home page Form 7 card opens Before you begin. Filing step routes shift so the cover letter stays Step 1.

## Form 7 — name and NUANS

Name and NUANS fields follow the same multiple-report pattern as Form 1.

## Form titles

On Forms 1 and 2, the Act line sits under the page title as body text. It is not part of the heading.
