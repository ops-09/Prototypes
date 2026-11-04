export const FILL_NOT_APPLICABLE_ATTR = 'data-fill-not-applicable';

/**
 * ODS parses hintText via JSON (constructHintTextObject). The HTML is rendered
 * in shadow DOM, so wrap styles must live on this markup — not a page stylesheet.
 */
export function notApplicableHintText(paperHint: string) {
  return JSON.stringify({
    hint: `<span style="display:block;width:100%;max-width:100%;box-sizing:border-box;text-wrap:pretty">${paperHint} If none, enter <a href="#" ${FILL_NOT_APPLICABLE_ATTR} style="white-space:nowrap">“Not applicable”</a>.</span>`,
    hintContentType: 'html',
  });
}
