import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioPageAlert,
  OntarioStepIndicator,
  OntarioTextarea,
} from '@ongov/ontario-design-system-component-library-react';
import {
  createSeedStep1,
  EMPTY_STEP2,
  EMPTY_STEP3,
  EMPTY_STEP4,
  EMPTY_STEP5,
  EMPTY_STEP6,
  EMPTY_STEP7,
  FORM1_RICH_TEXT_MAX_CHARS,
  hasForm1Step1Data,
  readForm1Draft,
  saveForm1Draft,
  upsertForm1Step5,
  type Form1Draft,
  type Form1Step5Data,
  hasForm1Step2Data,
} from './form1DraftStorage';
import styles from './Form1Step1.module.scss';
import step5Styles from './Form1Step5.module.scss';

const CURRENT_STEP = 6;
const TOTAL_STEPS = 9;

const MAX_LENGTH_ERROR =
  'Enter 900,000 characters or fewer.';
const BUSINESS_POWERS_REQUIRED =
  'Enter the restrictions on the business or powers of the co-operative, or enter “Not applicable”.';
const AUTHORIZED_CAPITAL_REQUIRED =
  'Enter the authorized capital for each class of share.';
const PREFERENCE_SHARE_TERMS_REQUIRED =
  'Enter the designations, preferences, rights, conditions, restrictions, limitations or prohibitions attaching to the preference shares, or enter “Not applicable”.';
const SHARE_TRANSFER_REQUIRED =
  'Enter the restrictions on the allotment, issue or transfer of shares.';

type PageFieldKey =
  | 'businessPowersRestrictions'
  | 'authorizedCapital'
  | 'preferenceShareTerms'
  | 'shareTransferRestrictions';

type PageErrors = Partial<Record<PageFieldKey, string>>;

const FIELD_ANCHORS: Record<PageFieldKey, string> = {
  businessPowersRestrictions: 'business-powers-restrictions',
  authorizedCapital: 'authorized-capital',
  preferenceShareTerms: 'preference-share-terms',
  shareTransferRestrictions: 'share-transfer-restrictions',
};

const FIELD_ORDER: PageFieldKey[] = [
  'businessPowersRestrictions',
  'authorizedCapital',
  'preferenceShareTerms',
  'shareTransferRestrictions',
];

const FIELD_REQUIRED_MESSAGES: Record<PageFieldKey, string> = {
  businessPowersRestrictions: BUSINESS_POWERS_REQUIRED,
  authorizedCapital: AUTHORIZED_CAPITAL_REQUIRED,
  preferenceShareTerms: PREFERENCE_SHARE_TERMS_REQUIRED,
  shareTransferRestrictions: SHARE_TRANSFER_REQUIRED,
};

const NOT_APPLICABLE_VALUE = 'Not applicable';
const FILL_NOT_APPLICABLE_ATTR = 'data-fill-not-applicable';

/**
 * ODS parses hintText via JSON when passed as a string (constructHintTextObject).
 * HTML lives in shadow DOM, so fill clicks use a document composedPath listener.
 */
const NOT_APPLICABLE_HINT = JSON.stringify({
  hint: `Enter <a href="#" ${FILL_NOT_APPLICABLE_ATTR}>“Not applicable”</a> if none.`,
  hintContentType: 'html',
});

const ANCHOR_TO_FIELD = Object.fromEntries(
  (Object.entries(FIELD_ANCHORS) as [PageFieldKey, string][]).map(
    ([key, anchor]) => [anchor, key],
  ),
) as Record<string, PageFieldKey>;

function fieldKeyFromComposedPath(path: EventTarget[]): PageFieldKey | null {
  for (const node of path) {
    if (!(node instanceof Element)) {
      continue;
    }
    const hostElementId = (node as HTMLElement & { elementId?: string }).elementId;
    const candidates = [
      hostElementId,
      node.getAttribute('element-id'),
      node.id || null,
    ];
    for (const candidate of candidates) {
      if (candidate && ANCHOR_TO_FIELD[candidate]) {
        return ANCHOR_TO_FIELD[candidate];
      }
    }
  }
  return null;
}

const ODS_FOCUSABLE = 'ontario-textarea';

function getEventValue(event: globalThis.Event) {
  const target = event.target as HTMLTextAreaElement | HTMLInputElement | null;
  return target?.value ?? '';
}

function focusShadowControl(host: HTMLElement) {
  const nested = host.shadowRoot?.querySelector<HTMLElement>(
    'textarea, input:not([type="hidden"])',
  );
  nested?.focus({ preventScroll: true });
}

function focusField(anchorId: string) {
  const byId = document.getElementById(anchorId);
  if (byId) {
    byId.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const host = byId.matches(ODS_FOCUSABLE)
      ? byId
      : byId.querySelector<HTMLElement>(ODS_FOCUSABLE);
    if (host) {
      focusShadowControl(host);
    }
    return;
  }

  const byElementId = document.querySelector<HTMLElement>(
    `[element-id="${CSS.escape(anchorId)}"]`,
  );
  if (byElementId) {
    byElementId.scrollIntoView({ behavior: 'smooth', block: 'center' });
    focusShadowControl(byElementId);
  }
}

function lengthErrorIfNeeded(value: string): string | undefined {
  if (value.length > FORM1_RICH_TEXT_MAX_CHARS) {
    return MAX_LENGTH_ERROR;
  }
  return undefined;
}

/** Prototype deep-link: seed Steps 1–4 so /form-1/step-6 opens from the playground. */
function ensureStep5Draft(): Form1Draft {
  const existing = readForm1Draft();
  if (
    hasForm1Step1Data(existing?.step1) &&
    hasForm1Step2Data(existing.step2) &&
    existing.step4.directors.length > 0
  ) {
    return {
      ...existing,
      step5: { ...EMPTY_STEP5, ...(existing.step5 ?? {}) },
      step6: existing.step6 ?? { ...EMPTY_STEP6 },
      step7: existing.step7 ?? { ...EMPTY_STEP7 },
    };
  }

  const now = new Date().toISOString();
  const seeded: Form1Draft = {
    step1: createSeedStep1(),
    step2: {
      ...EMPTY_STEP2,
      cooperativeSubtype: 'Worker Co-operative',
      primaryActivity: '4521 - Department stores',
      email: 'registry@greeninstitute.coop',
      confirmEmail: 'registry@greeninstitute.coop',
    },
    step3: existing?.step3 ?? { ...EMPTY_STEP3 },
    step4: {
      ...EMPTY_STEP4,
      ...(existing?.step4 ?? {}),
      countMode: existing?.step4?.countMode || 'fixed',
      fixedNumber: existing?.step4?.fixedNumber || '1',
      multiStakeholder: existing?.step4?.multiStakeholder || 'no',
      directors:
        existing?.step4?.directors?.length
          ? existing.step4.directors
          : [
              {
                id: 'seed-director-1',
                firstName: 'Alex',
                middleName: '',
                lastName: 'Rivera',
                email: 'alex.rivera@example.com',
                residentCanadian: 'yes',
                alsoIncorporator: 'yes',
                numberOfShares: '100',
                classDesignation: 'Common',
                amountToBePaid: '1000.00',
                address: {
                  addressType: 'canadian',
                  postalCodeLookup: '',
                  enterManually: true,
                  selectedAddressId: '',
                  unitNumber: '',
                  streetNumber: '100',
                  streetName: 'Queen',
                  streetNumberSuffix: '',
                  streetType: 'St',
                  streetDirection: 'W',
                  addressLine1: '',
                  addressLine2: '',
                  cityTown: 'Toronto',
                  provinceState: 'Ontario',
                  postalCode: 'M5H 2N2',
                  country: 'Canada',
                },
                consentConfirmed: false,
                consentFile: null,
              },
            ],
    },
    step5: { ...EMPTY_STEP5, ...(existing?.step5 ?? {}) },
    step6: existing?.step6 ?? { ...EMPTY_STEP6 },
    step7: existing?.step7 ?? { ...EMPTY_STEP7 },
    savedAt: now,
    mode: 'continue',
    lastCompletedStep: 4,
  };
  saveForm1Draft(seeded);
  return seeded;
}

export function Form1Step5() {
  const navigate = useNavigate();
  const draft = ensureStep5Draft();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [step5, setStep5] = useState<Form1Step5Data>(() => ({
    ...EMPTY_STEP5,
    ...(draft.step5 ?? {}),
  }));
  const [errors, setErrors] = useState<PageErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const errorSummaryItems = useMemo(
    () =>
      FIELD_ORDER.flatMap((key) => {
        const message = errors[key];
        if (!message) {
          return [];
        }
        return [{ key, message, href: `#${FIELD_ANCHORS[key]}` }];
      }),
    [errors],
  );

  function patchField(key: PageFieldKey, value: string) {
    setStep5((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validatePage(): PageErrors {
    const page: PageErrors = {};

    for (const key of FIELD_ORDER) {
      const lengthError = lengthErrorIfNeeded(step5[key]);
      if (lengthError) {
        page[key] = lengthError;
        continue;
      }
      if (!step5[key].trim()) {
        page[key] = FIELD_REQUIRED_MESSAGES[key];
      }
    }

    return page;
  }

  function handleContinue() {
    const page = validatePage();
    setErrors(page);
    const hasErrors = Object.keys(page).length > 0;
    setShowErrorSummary(hasErrors);

    if (hasErrors) {
      window.requestAnimationFrame(() => {
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }

    upsertForm1Step5(step5, 'continue', 5);
    navigate('/form-1/step-7');
  }

  function handleSaveAsDraft() {
    upsertForm1Step5(
      step5,
      'draft',
      draft.lastCompletedStep >= 5 ? 5 : draft.lastCompletedStep >= 4 ? 4 : 3,
    );
    navigate('/form-1/draft-summary');
  }

  function handleCancel() {
    const leave = window.confirm(
      'Leave this filing without saving further changes?',
    );
    if (leave) {
      navigate('/');
    }
  }

  function handleSummaryLinkClick(
    event: ReactMouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    event.preventDefault();
    focusField(href.replace('#', ''));
  }

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      const path = event.composedPath();
      const hit = path.find(
        (node): node is Element =>
          node instanceof Element && node.hasAttribute(FILL_NOT_APPLICABLE_ATTR),
      );
      if (!hit) {
        return;
      }
      const fieldKey = fieldKeyFromComposedPath(path);
      if (!fieldKey) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      patchField(fieldKey, NOT_APPLICABLE_VALUE);
    }

    document.addEventListener('click', handleDocumentClick, true);
    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, []);

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-1/step-5"
          currentStep={CURRENT_STEP}
          numberOfSteps={TOTAL_STEPS}
        />
      </div>

      <div className="ontario-row">
        <div className="ontario-columns ontario-small-12 ontario-medium-8">
          {showErrorSummary && errorSummaryItems.length > 0 ? (
            <div ref={errorSummaryRef} className={styles.alert} tabIndex={-1}>
              <OntarioPageAlert type="error" heading="There is a problem">
                <p>Errors were found on this page:</p>
                <ul>
                  {errorSummaryItems.map((item) => (
                    <li key={item.key}>
                      <a
                        className={styles.errorSummaryLink}
                        href={item.href}
                        onClick={(event) => handleSummaryLinkClick(event, item.href)}
                      >
                        {item.message}
                      </a>
                    </li>
                  ))}
                </ul>
              </OntarioPageAlert>
            </div>
          ) : null}

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Share information</h1>

          <div className={`${styles.formStack} ${step5Styles.fieldStack}`}>
            <div id={FIELD_ANCHORS.businessPowersRestrictions}>
              <OntarioTextarea
                elementId={FIELD_ANCHORS.businessPowersRestrictions}
                caption="Restrictions on the business the co-operative may carry on or on the powers the co-operative may exercise, if any"
                name={FIELD_ANCHORS.businessPowersRestrictions}
                required
                hintText={NOT_APPLICABLE_HINT}
                value={step5.businessPowersRestrictions}
                errorMessage={errors.businessPowersRestrictions}
                customOnInput={(event) =>
                  patchField('businessPowersRestrictions', getEventValue(event))
                }
              />
            </div>

            <div id={FIELD_ANCHORS.authorizedCapital}>
              <OntarioTextarea
                elementId={FIELD_ANCHORS.authorizedCapital}
                caption="Authorized capital for each class of share"
                name={FIELD_ANCHORS.authorizedCapital}
                required
                hintText={NOT_APPLICABLE_HINT}
                value={step5.authorizedCapital}
                errorMessage={errors.authorizedCapital}
                customOnInput={(event) =>
                  patchField('authorizedCapital', getEventValue(event))
                }
              />
            </div>

            <div id={FIELD_ANCHORS.preferenceShareTerms}>
              <OntarioTextarea
                elementId={FIELD_ANCHORS.preferenceShareTerms}
                caption="Designations, preferences, rights, conditions, restrictions, limitations or prohibitions attaching to the preference shares, if any"
                name={FIELD_ANCHORS.preferenceShareTerms}
                required
                hintText={NOT_APPLICABLE_HINT}
                value={step5.preferenceShareTerms}
                errorMessage={errors.preferenceShareTerms}
                customOnInput={(event) =>
                  patchField('preferenceShareTerms', getEventValue(event))
                }
              />
            </div>

            <div id={FIELD_ANCHORS.shareTransferRestrictions}>
              <OntarioTextarea
                elementId={FIELD_ANCHORS.shareTransferRestrictions}
                caption="Restrictions on the allotment, issue or transfer of shares"
                name={FIELD_ANCHORS.shareTransferRestrictions}
                required
                hintText={NOT_APPLICABLE_HINT}
                value={step5.shareTransferRestrictions}
                errorMessage={errors.shareTransferRestrictions}
                customOnInput={(event) =>
                  patchField('shareTransferRestrictions', getEventValue(event))
                }
              />
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <OntarioButton
              type="primary"
              htmlType="button"
              label="Continue"
              onClick={handleContinue}
            />
            <OntarioButton
              type="secondary"
              htmlType="button"
              label="Save as draft"
              onClick={handleSaveAsDraft}
            />
            <OntarioButton
              type="tertiary"
              htmlType="button"
              label="Cancel"
              onClick={handleCancel}
            />
          </div>
        </div>
      </div>
    </>
  );
}
