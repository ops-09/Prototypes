#!/usr/bin/env python3
"""Build the common-components approval Word pack from screenshots and pack.json."""

from __future__ import annotations

import json
from pathlib import Path

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Inches, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[1]
PACK_DIR = ROOT / "docs" / "common-components-approval"
PACK = json.loads((PACK_DIR / "pack.json").read_text(encoding="utf-8"))
SHOT_DIR = PACK_DIR / "screenshots"
OUT_PATH = PACK_DIR / "Common-form-components-approval-pack.docx"

TEAL = "1A5A4A"
RED = "C8102E"
HEADER_TEXT = "FFFFFF"
ROW_ALT = "F4F4F4"
BLACK = RGBColor(0x1A, 0x1A, 0x1A)
MUTED = RGBColor(0x4D, 0x4D, 0x4D)


def set_run_font(run, *, size=11, bold=False, color=BLACK, name="Calibri"):
    run.font.name = name
    run._element.rPr.rFonts.set(qn("w:eastAsia"), name)
    run.font.size = Pt(size)
    run.bold = bold
    run.font.color.rgb = color


def shade_cell(cell, hex_color):
    tc_pr = cell._tc.get_or_add_tcPr()
    for child in list(tc_pr):
        if child.tag == qn("w:shd"):
            tc_pr.remove(child)
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), hex_color)
    shd.set(qn("w:val"), "clear")
    tc_pr.append(shd)


def set_cell_borders(cell, color="B2B2B2"):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    borders = OxmlElement("w:tcBorders")
    for edge in ("top", "left", "bottom", "right"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), "4")
        el.set(qn("w:space"), "0")
        el.set(qn("w:color"), color)
        borders.append(el)
    tcPr.append(borders)


FILL_IN = "FFF8E7"


def set_cell_text(cell, text, *, bold=False, size=10, color=BLACK, fill=None):
    cell.text = ""
    lines = (text or "").split("\n") or [""]
    para = cell.paragraphs[0]
    para.paragraph_format.space_before = Pt(3)
    para.paragraph_format.space_after = Pt(2)
    run = para.add_run(lines[0])
    set_run_font(run, size=size, bold=bold, color=color)
    for line in lines[1:]:
        extra = cell.add_paragraph()
        extra.paragraph_format.space_before = Pt(0)
        extra.paragraph_format.space_after = Pt(2)
        extra_run = extra.add_run(line)
        set_run_font(extra_run, size=size, bold=bold, color=color)
    if fill:
        shade_cell(cell, fill)
    set_cell_borders(cell)


def set_row_height(row, cm_height):
    tr_pr = row._tr.get_or_add_trPr()
    for child in list(tr_pr):
        if child.tag == qn("w:trHeight"):
            tr_pr.remove(child)
    height = OxmlElement("w:trHeight")
    height.set(qn("w:val"), str(int(cm_height * 567)))
    height.set(qn("w:hRule"), "atLeast")
    tr_pr.append(height)


def add_heading_styled(doc, text, size=22):
    para = doc.add_paragraph()
    para.paragraph_format.space_after = Pt(6)
    run = para.add_run(text)
    set_run_font(run, size=size, bold=True, color=RGBColor(0x1A, 0x5A, 0x4A))
    return para


def add_body(doc, text, *, size=11, space_after=8):
    para = doc.add_paragraph()
    para.paragraph_format.space_after = Pt(space_after)
    para.paragraph_format.line_spacing = 1.15
    run = para.add_run(text)
    set_run_font(run, size=size)
    return para


def add_table(doc, headers, rows, col_widths):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    for i, header in enumerate(headers):
        cell = table.rows[0].cells[i]
        set_cell_text(cell, header, bold=True, size=10, color=RGBColor(0xFF, 0xFF, 0xFF), fill=TEAL)
        cell.width = col_widths[i]
    for r_index, row in enumerate(rows):
        fill = ROW_ALT if r_index % 2 else "FFFFFF"
        for c_index, value in enumerate(row):
            cell = table.rows[r_index + 1].cells[c_index]
            set_cell_text(cell, value, size=9, fill=fill)
            cell.width = col_widths[c_index]
    return table


def prevent_row_split(row):
    tr = row._tr
    trPr = tr.get_or_add_trPr()
    cant = OxmlElement("w:cantSplit")
    trPr.append(cant)


C01_FORMS = [
    ("1", "Articles of Incorporation (with share capital)", "byb"),
    ("2", "Articles of Incorporation (without share capital)", "byb"),
    ("3", "Application for Supplementary Letters Patent", "byb"),
    ("4", "", "blank"),
    ("5", "", "blank"),
    ("6", "", "blank"),
    ("7", "Articles of Amendment", "byb"),
    ("8", "", "blank"),
    ("9", "", "blank"),
    ("10", "Articles of Amalgamation", "byb"),
    ("11", "Application for Letters Patent of Amalgamation", "byb"),
]

C01_LEAD = {
    "1": "Please review the following information before starting your Articles of Incorporation of a Co-operative with Share Capital Form 1.",
    "2": "Please review the following information before starting your Articles of Incorporation of a Co-operative without Share Capital Form 2.",
    "3": "Please review the following information before starting your Application for Supplementary Letters Patent Form 3.",
    "7": "Please review the following information before starting your Articles of Amendment Form 7.",
    "10": "Please review the following information before starting your Articles of Amalgamation Form 10.",
    "11": "Please review the following information before starting your Application for Letters Patent of Amalgamation Form 11.",
}

C01_STEPS = {
    "1": "1 Contact information\n2 Co-operative sub-type, primary activity, official email\n3 Co-operative name\n4 Registered office address\n5 Add directors information\n6 Shares information\n7 Membership and provisions\n8 Add incorporators details\n9 Review and certify — I acknowledge",
    "2": "1 Contact information\n2 Co-operative sub-type, primary activity, official email\n3 Co-operative name\n4 Registered office address\n5 Add directors information\n6 Member loans and restrictions\n7 Membership and provisions\n8 Add incorporators details\n9 Review and certify — I acknowledge",
    "3": "1 Contact information\n2 Corporation details\n3 Corporation name\n4 Supplementary letters patent\n5 Review and certify",
    "7": "1 Contact information\n2 Business details\n3 Amendment details\n4 Supporting documents\n5 Review and certify",
    "10": "1 Contact information\n2 Business details\n3 Amalgamation details\n4 Co-operative name\n5 Supporting documents\n6 Review and certify",
    "11": "1 Contact information\n2 Corporation details\n3 Amalgamating corporations\n4 Amalgamated corporation name\n5 Head office address\n6 Directors\n7 Supporting documents\n8 Review and certify",
}

C01_CHECKLIST = {
    "1": "Intro: You should have the following information available…\nIncludes NAICS, director consent Form 3, Nuans (90 days), Nuans suppliers, Notice — Filings by Co-operative Corporations.",
    "2": "Same pattern as Form 1. Fee and non-profit notes sit in Payment, not here.",
    "3": "OCN, resolution date, requested provisions, Nuans if name change (90 days; separate EN/FR if used separately), similar-name consent, insolvency statement if new name, certified resolution.",
    "7": "Includes Nuans if name change, Affidavit of Solvency (Amendment) when required, certified resolution, authorizing subsections.",
    "10": "Certified amalgamation agreement (effective within 6 months), Affidavit of Solvency (Amalgamation) per co-operative, Nuans if new name, NAICS, Notice — CCA filings.",
    "11": "Legal name and OCN of each amalgamating corporation, approval dates, certified amalgamation agreement (s. 113(3)), Nuans if new name, NAICS, head office, first directors.",
}

C01_PAYMENT = {
    "1": "Lead: pay the applicable filing fee before submitting.\nChecklist intro: Before you begin, please ensure you have:\n• A valid payment method available.\n• Reviewed any applicable fees…\n• Articles of Incorporation: $335 for a standard co-operative.",
    "2": "Same lead and intro as Form 1.\n• $335 for a co-operative without share capital.\n• $155 for a non-profit co-operative without share capital.",
    "3": "No Payment section in the current prototype.",
    "7": "Lead adds: The fee depends on the type of amendment.\n• Name change or other amendment: $100\n• Convert to a business corporation: $200\n• Convert to a not-for-profit corporation: $100",
    "10": "No Payment section in the current prototype.",
    "11": "No Payment section in the current prototype.",
}

C01_TIME = {
    "1": "Approximately 10 minutes",
    "2": "Approximately 10 minutes",
    "3": "Approximately 10 minutes",
    "7": "Approximately 10 minutes",
    "10": "Approximately 10 minutes",
    "11": "Approximately 10 minutes",
}


def add_fill_table(doc, headers, rows, col_widths, *, fill_last=True, min_height=1.15):
    table = add_table(doc, headers, rows, col_widths)
    for r_index, row in enumerate(table.rows[1:]):
        prevent_row_split(row)
        set_row_height(row, min_height)
        if fill_last:
            last = row.cells[-1]
            shade_cell(last, FILL_IN)
    return table


def add_c01_content_worksheet(doc):
    doc.add_page_break()
    add_heading_styled(doc, "C01  Content worksheet — Before you begin", 16)
    add_body(
        doc,
        "Use this worksheet to write approved copy for each annotation, for Forms 1–11. "
        "Yellow cells are for you to fill in. Shared copy is written once. Form-specific copy has one table per annotation (one row per form). "
        "Forms 4, 5, 6, 8, and 9 are not in the prototype yet — add copy if those filings will use this page. "
        "Forms 14 and 15 use an instructions landing instead; they are at the end.",
        size=10,
        space_after=10,
    )

    add_heading_styled(doc, "Shared copy (same on every Before you begin)", 14)
    add_body(
        doc,
        "If a form must differ, note the exception in Comments. Otherwise this copy applies to Forms 1–11.",
        size=10,
        space_after=6,
    )
    shared_rows = [
        [
            "1",
            "Page title",
            "Before you begin",
            "",
        ],
        [
            "—",
            "Estimated time heading",
            "Estimated time to complete",
            "",
        ],
        [
            "6",
            "Instructions heading",
            "Instructions",
            "",
        ],
        [
            "6",
            "Instructions intro",
            "Please keep the following guidelines in mind while completing your submission.",
            "",
        ],
        [
            "6",
            "Instruction bullets",
            "• Do not use the Back button on your web browser\n"
            "• To cancel your request at any time, close your web browser or click ‘Cancel’\n"
            "• Use the ‘Save draft’ button to save a partially completed form to come back to it later\n"
            "• As a best practice, regularly use the ‘Save draft’ button to avoid losing any information entered during the submission process",
            "",
        ],
        [
            "7",
            "Contact heading",
            "Contact information",
            "",
        ],
        [
            "7",
            "Contact intro",
            "If you have any questions related to the submission process, please contact:",
            "",
        ],
        [
            "7",
            "Ministry / address / phone / email",
            "Ministry name\nFull address\nTelephone: 111-111-1111\nEmail: emailplaceholder@ontario.ca",
            "",
        ],
        [
            "8",
            "Buttons",
            "Continue\nCancel",
            "",
        ],
        [
            "3",
            "Steps heading + intro",
            "Steps in this process\nComplete the following steps for a successful submission:",
            "",
        ],
        [
            "4",
            "Checklist heading + intro",
            "Submission checklist\nYou should have the following information available to complete your submission:",
            "",
        ],
        [
            "5",
            "Payment heading + lead",
            "Payment\nTo complete your filing, you will be required to pay the applicable filing fee before submitting your application.\nBefore you begin, please ensure you have:",
            "",
        ],
    ]
    table = add_fill_table(
        doc,
        ["#", "Annotation", "Current copy", "Approved copy"],
        shared_rows,
        [Cm(1.3), Cm(4.2), Cm(6.6), Cm(5.5)],
        min_height=1.2,
    )
    set_row_height(table.rows[5], 2.6)
    set_row_height(table.rows[8], 1.8)

    def form_label(form_id, name):
        return f"Form {form_id}" if not name else f"Form {form_id}  {name}"

    def form_rows(current_map, blank=""):
        rows = []
        for form_id, name, kind in C01_FORMS:
            if kind == "blank":
                current = "Not in prototype"
            else:
                current = current_map.get(form_id, blank)
            rows.append([form_label(form_id, name), current, ""])
        return rows

    form_widths = [Cm(5.2), Cm(6.8), Cm(5.6)]

    add_body(doc, "", space_after=8)
    add_heading_styled(doc, "#2  Lead text — by form", 14)
    add_body(
        doc,
        "Pattern today: “Please review the following information before starting your {filing name}.”",
        size=10,
        space_after=6,
    )
    add_fill_table(
        doc,
        ["Form", "Current lead", "Approved lead"],
        form_rows(C01_LEAD),
        form_widths,
        min_height=1.35,
    )

    add_body(doc, "", space_after=8)
    add_heading_styled(doc, "Estimated time — by form", 14)
    add_body(
        doc,
        "Shown in the callout under the lead. Not a separate badge; include it here because the time may differ by form.",
        size=10,
        space_after=6,
    )
    add_fill_table(
        doc,
        ["Form", "Current time", "Approved time"],
        form_rows(C01_TIME),
        form_widths,
        min_height=1.0,
    )

    add_body(doc, "", space_after=8)
    add_heading_styled(doc, "#3  Steps in this process — by form", 14)
    add_body(
        doc,
        "Write the step titles (and descriptions if they should change). Heading and intro are in Shared copy.",
        size=10,
        space_after=6,
    )
    add_fill_table(
        doc,
        ["Form", "Current steps", "Approved steps"],
        form_rows(C01_STEPS),
        form_widths,
        min_height=2.4,
    )

    add_body(doc, "", space_after=8)
    add_heading_styled(doc, "#4  Submission checklist — by form", 14)
    add_body(
        doc,
        "Heading and intro are in Shared copy. Write the checklist items for each form.",
        size=10,
        space_after=6,
    )
    add_fill_table(
        doc,
        ["Form", "Current checklist (summary)", "Approved checklist items"],
        form_rows(C01_CHECKLIST),
        form_widths,
        min_height=2.2,
    )

    add_body(doc, "", space_after=8)
    add_heading_styled(doc, "#5  Payment — by form", 14)
    add_body(
        doc,
        "Heading, lead, and “Before you begin, please ensure you have:” are in Shared copy unless a form needs different lead text (Form 7 currently adds a sentence about the fee depending on amendment type).",
        size=10,
        space_after=6,
    )
    add_fill_table(
        doc,
        ["Form", "Current payment copy", "Approved payment copy"],
        form_rows(C01_PAYMENT),
        form_widths,
        min_height=2.0,
    )

    add_body(doc, "", space_after=8)
    add_heading_styled(doc, "Forms 14 and 15 — instructions landing (not Before you begin)", 14)
    add_body(
        doc,
        "These two filings do not use the Before you begin template. Fill in the instructions-page copy here if they should stay on a different landing.",
        size=10,
        space_after=6,
    )
    add_fill_table(
        doc,
        ["Form", "Current copy", "Approved copy"],
        [
            [
                "Form 14  Articles of Continuance as a Co-operative with Share Capital",
                "Title: Articles of Continuance as a Co-operative with Share Capital\n"
                "Act line: Co-operative Corporations Act — Form 14\n"
                "Body: Instructions for this filing will be added as later stories are provided. Continue to Step 1 to enter contact information.\n"
                "Buttons: Continue / Cancel",
                "",
            ],
            [
                "Form 15  Articles of Continuance as a Co-operative without Share Capital",
                "Title: Articles of Continuance as a Co-operative without Share Capital\n"
                "Act line: Co-operative Corporations Act — Form 15\n"
                "Body: Instructions for this filing will be added as later stories are provided. Continue to Step 2 to enter the co-operative’s type, primary activity, and official email.\n"
                "Buttons: Continue / Cancel",
                "",
            ],
        ],
        [Cm(5.2), Cm(6.8), Cm(5.6)],
        min_height=2.6,
    )


def add_c15_content_worksheet(doc):
    doc.add_page_break()
    add_heading_styled(doc, "C15  Content worksheet — Supporting documents", 16)
    add_body(
        doc,
        "Approve the documents and the page copy for each form. Yellow cells are for approved content. "
        "Forms 4, 5, 6, 8, and 9 are not in the prototype yet.",
        size=10,
        space_after=8,
    )
    add_fill_table(
        doc,
        ["Form", "Documents", "Current copy", "Approved content"],
        [
            [
                "Form 1  Articles of Incorporation (share)",
                "No Supporting documents page.\nNuans PDF + date — name step (always).\nDirector consent (Form 3) PDF — add director.\nSigned articles PDF — Submit.",
                "",
                "",
            ],
            [
                "Form 2  Articles of Incorporation (no share)",
                "No Supporting documents page.\nSame documents as Form 1: Nuans on the name step; director consent PDF; signed articles PDF on Submit.",
                "",
                "",
            ],
            [
                "Form 3  Supplementary Letters Patent",
                "Always on Step 4 (page is titled Supplementary letters patent).\nRequired: resolution confirmed date; typed provisions.\nOptional: additional supporting PDFs.\nIf name change: Nuans PDF on the name step.\nSigned articles PDF — Submit.",
                "Title: Supplementary letters patent\n"
                "Lead: Provide the date shareholders or members confirmed the resolution and describe the provisions being requested.\n"
                "Date: The resolution authorizing this application was confirmed by the shareholders/members of the corporation on:\n"
                "Help: Under section 34 or 131 of the Corporations Act.\n"
                "Provisions: The corporation applies for the issue of supplementary letters patent to provide as follows:\n"
                "Hint: What are supplementary letters patent? Supplementary letters patent change the corporation’s existing letters patent. Use this field to describe the provisions you are requesting, such as changes to the objects or special provisions of the corporation.\n"
                "Additional: Additional supporting documents. Upload any other document to support this application.",
                "",
            ],
            ["Form 4", "", "", ""],
            ["Form 5", "", "", ""],
            ["Form 6", "", "", ""],
            [
                "Form 7  Articles of Amendment",
                "Always on Step 4.\nRequired: certified resolution (type and/or PDF, more than one file); CCA s.151 subsections; resolution confirmed date.\nIf name change: affidavits of solvency (amendment) — two officers, or one officer and one director; Nuans PDF on the name step.\nOptional: additional supporting PDFs.\nSigned articles PDF — Submit.",
                "Title: Supporting documents\n"
                "Lead: Upload documentation required to support this Articles of Amendment filing. You can upload multiple files and remove them before submission. Uploads stay in this browser session until you clear site data or finish the filing.\n"
                "Callout heading: Required for this amendment\n"
                "Callout: Required documents: Certified copy of the resolution. If name change, also: Affidavits of solvency (amendment), of two officers or of one officer and one director.\n"
                "Certified resolution: The following is a certified copy of the resolution amending the articles of the co-operative:\n"
                "Hint: Upload or enter the certified resolution or certified special resolution authorizing the amendment. You can upload more than one file.\n"
                "Typed text: optional if a PDF is uploaded.\n"
                "Subsections: The above amendment has been duly authorized as required by subsections 151(1), (2), (2.1), (3) and/or (4) of the Co-operative Corporations Act. Please choose the applicable subsections below:\n"
                "Options: 151(1); 151(2); 151(2.1); 151(3); 151(4)\n"
                "Hint expander: Which subsections apply to my amendment? Content: TBD\n"
                "Affidavits (name change only): Affidavits of solvency (amendment). Affidavits of two officers, or of one officer and one director, are required for a name change. You can upload more than one file.\n"
                "Additional: Additional supporting documents. Optional. Upload any other documents that support this amendment. You can upload more than one file.\n"
                "Date: The resolution authorizing the amendment was confirmed by the members of the co-operative on:",
                "",
            ],
            ["Form 8", "", "", ""],
            ["Form 9", "", "", ""],
            [
                "Form 10  Articles of Amalgamation",
                "Always on Step 5.\nRequired: certified amalgamation agreement (type and/or 1 PDF; effective within 6 months of submission); affidavits of solvency (amalgamation) — exactly 2 PDFs for each amalgamating co-operative.\nIf new name: Nuans PDF on the name step.\nSigned articles PDF — Submit.",
                "Title: Supporting documents\n"
                "Lead: Upload one certified amalgamation agreement for this filing, and two Affidavits of Solvency for each amalgamating co-operative.\n"
                "Callout heading: Required for this amalgamation\n"
                "Callout: One Certified copy of the amalgamation agreement for this filing, and two Affidavits of solvency (amalgamation) for each amalgamating co-operative. PDF only, maximum 20 MB per file.\n"
                "Agreement: The following is a certified copy of the amalgamation agreement:\n"
                "Hint: Upload or enter the certified amalgamation agreement. You can upload one file. A certified copy of the amalgamation agreement approved by each of the amalgamating co-operatives. The effective date of the amalgamation agreement must be within six (6) months of the submission of the Articles of Amalgamation.\n"
                "Typed text: optional if a PDF is uploaded.\n"
                "Affidavits (repeat per co-operative, heading: legal name and OCN): Affidavits of solvency (amalgamation). Affidavits of solvency (amalgamation) of two officers or of one officer and one director for each of the co-operative corporations that are being amalgamated.",
                "",
            ],
            [
                "Form 11  Letters Patent of Amalgamation",
                "Always on Step 7.\nRequired: certified amalgamation agreement — 1 PDF (corporate seal, secretary of each amalgamating corporation).\nOptional: additional supporting PDFs.\nDirector consent (Form 3) PDF — add director.\nIf new name: Nuans PDF on the name step.\nSigned articles PDF — Submit.",
                "Title: Supporting documents\n"
                "Lead: Upload a copy of the approved amalgamation agreement. You may also attach other documents that support this application.\n"
                "Agreement: The following is a copy of the amalgamation agreement duly certified under corporate seal by the secretary of each of the amalgamating corporations:\n"
                "Additional: Upload any other document to support this application (optional). PDF only, maximum 20 MB per file.",
                "",
            ],
            [
                "Form 14  Continuance (share)",
                "No Supporting documents page yet.\nNuans PDF if a proposed co-operative name is entered (name step).\nDirectors: written-consent checkbox only (no PDF).",
                "",
                "",
            ],
            [
                "Form 15  Continuance (no share)",
                "No Supporting documents page yet.\nSame documents as Form 14.",
                "",
                "",
            ],
        ],
        [Cm(3.4), Cm(4.4), Cm(5.4), Cm(4.4)],
        min_height=3.2,
    )


def build():
    doc = Document()
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.left_margin = Inches(0.75)
    section.right_margin = Inches(0.75)
    section.top_margin = Inches(0.7)
    section.bottom_margin = Inches(0.7)

    header = section.header.paragraphs[0]
    header_run = header.add_run(
        "OPS Co-operative Corporations  ·  Common form components  ·  For approval"
    )
    set_run_font(header_run, size=9, color=MUTED)

    footer = section.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    footer_run = footer.add_run(
        "Prototype screenshots captured 6 November 2026  ·  For internal approval"
    )
    set_run_font(footer_run, size=9, color=MUTED)

    add_heading_styled(doc, PACK["title"], 26)
    add_body(doc, PACK["subtitle"], size=14, space_after=4)
    add_body(doc, f"Date: {PACK['date']}    Status: Draft for review", size=11, space_after=12)
    add_body(doc, PACK["purpose"], size=11, space_after=10)

    add_heading_styled(doc, "How to complete this pack", 16)
    add_body(
        doc,
        "Red numbered badges on each screenshot match the Annotation table underneath. "
        "For every row, tick one Decision (Approve / Revise / Defer) and add comments if you want a change. "
        "Complete the sign-off table at the end.",
        size=11,
        space_after=8,
    )

    add_heading_styled(doc, "Prototypes covered", 16)
    for form in PACK["forms"]:
        para = doc.add_paragraph(style="List Bullet")
        para.paragraph_format.space_after = Pt(2)
        run = para.add_run(form)
        set_run_font(run, size=11)

    add_body(doc, "", space_after=4)
    add_heading_styled(doc, "1. Inventory and decisions", 18)
    add_body(
        doc,
        "Use this table as the master sign-off. Screenshot IDs are in section 2.",
        size=11,
        space_after=8,
    )

    inventory_rows = []
    for component in PACK["components"]:
        inventory_rows.append(
            [
                component["id"],
                component["name"],
                component["forms"],
                "☐ Approve   ☐ Revise   ☐ Defer",
                "",
            ]
        )

    add_table(
        doc,
        ["ID", "Component", "Used on", "Decision", "Comments"],
        inventory_rows,
        [Cm(1.6), Cm(4.4), Cm(5.4), Cm(4.2), Cm(3.0)],
    )

    doc.add_page_break()
    add_heading_styled(doc, "2. Screenshots and annotation tables", 18)
    add_body(
        doc,
        "Each page is a representative example from the prototype. "
        "The same pattern is reused on the forms listed in Used on.",
        size=11,
        space_after=12,
    )

    for component in PACK["components"]:
        add_heading_styled(doc, f"{component['id']}  {component['name']}", 16)
        meta = doc.add_paragraph()
        meta.paragraph_format.space_after = Pt(4)
        run = meta.add_run(f"Source: {component['source']}")
        set_run_font(run, size=10, bold=True, color=MUTED)
        run = meta.add_run(f"    Used on: {component['forms']}")
        set_run_font(run, size=10, color=MUTED)
        add_body(doc, component["summary"], size=11, space_after=8)

        shot = SHOT_DIR / f"{component['id']}-{slug(component['name'])}.png"
        if not shot.exists():
            matches = list(SHOT_DIR.glob(f"{component['id']}-*.png"))
            shot = matches[0] if matches else None
        if shot and shot.exists():
            doc.add_picture(str(shot), width=Inches(7.0))
            caption = doc.add_paragraph()
            caption.paragraph_format.space_before = Pt(4)
            caption.paragraph_format.space_after = Pt(8)
            cap_run = caption.add_run(
                f"Figure {component['id']}. {component['name']} — numbered badges match the table below."
            )
            set_run_font(cap_run, size=9, color=MUTED)
        else:
            add_body(doc, f"[Screenshot {component['id']} missing]", size=11, space_after=8)

        rows = []
        for target in component["targets"]:
            rows.append(
                [
                    str(target["n"]),
                    target["label"],
                    target["note"],
                    "☐ Approve\n☐ Revise\n☐ Defer",
                    "",
                ]
            )
        table = add_table(
            doc,
            ["#", "UI element", "What it is", "Decision", "Comments"],
            rows,
            [Cm(1.2), Cm(3.8), Cm(6.4), Cm(2.8), Cm(3.4)],
        )
        for row in table.rows:
            prevent_row_split(row)

        if component["id"] == "C01":
            add_c01_content_worksheet(doc)
        if component["id"] == "C15":
            add_c15_content_worksheet(doc)

        doc.add_paragraph()

    add_heading_styled(doc, "3. Sign-off", 18)
    add_body(
        doc,
        "Sign when the inventory in section 1 is complete. A Revise mark means the component stays in the prototypes but needs the comments addressed before it is treated as approved.",
        size=11,
        space_after=8,
    )
    add_table(
        doc,
        ["Role", "Name", "Decision", "Date", "Signature"],
        [
            ["Product / business owner", "", "☐ Approve  ☐ Revise", "", ""],
            ["Service design / UX", "", "☐ Approve  ☐ Revise", "", ""],
            ["Policy / legal (if required)", "", "☐ Approve  ☐ Revise", "", ""],
            ["Development lead", "", "☐ Approve  ☐ Revise", "", ""],
        ],
        [Cm(4.2), Cm(3.6), Cm(3.8), Cm(2.6), Cm(3.4)],
    )

    add_body(doc, "", space_after=10)
    add_body(
        doc,
        "Notes: Screenshots were captured from the local OPS-RBAC prototype on 6 November 2026. "
        "Form 15 does not yet include a cover letter or submit step. Forms 14 and 15 use an instructions page instead of Before you begin, and they stop at Review.",
        size=9,
        space_after=4,
    )

    doc.save(OUT_PATH)
    print(f"Wrote {OUT_PATH}")


def slug(value: str) -> str:
    out = []
    for ch in value.lower():
        out.append(ch if ch.isalnum() else "-")
    compact = "".join(out)
    while "--" in compact:
        compact = compact.replace("--", "-")
    return compact.strip("-")[:60]


if __name__ == "__main__":
    build()
