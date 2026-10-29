import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
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
  FORM2_RICH_TEXT_MAX_CHARS,
  hasForm2Step1Data,
  readForm2Draft,
  saveForm2Draft,
  syncIncorporatorsFromDirectors,
  upsertForm2Step6,
  type Form2Draft,
  type Form2Step6Data,
  hasForm2Step2Data,
} from './form2DraftStorage';
import styles from './Form2Step1.module.scss';
import step5Styles from './Form2Step5.module.scss';

const CURRENT_STEP = 7;
const TOTAL_STEPS = 9;

const MAX_LENGTH_ERROR =
  'Enter 900,000 characters or fewer.';
const FIELD_REQUIRED =
  'Enter the required information, or enter “Not applicable” if none.';
const MEMBERSHIP_CLASSES_REQUIRED = 'Enter the classes of membership.';
const MEMBERSHIP_CLASS_TERMS_REQUIRED =
  'Enter the terms and conditions attaching to each class of membership.';
const STAKEHOLDER_GROUPS_REQUIRED = 'Enter the stakeholder groups.';
const STAKEHOLDER_GROUP_TERMS_REQUIRED =
  'Enter the terms and conditions for membership in each stakeholder group.';

type PageFieldKey =
  | 'membershipClasses'
  | 'membershipClassTerms'
  | 'stakeholderGroups'
  | 'stakeholderGroupTerms'
  | 'specialProvisions';

type PageErrors = Partial<Record<PageFieldKey, string>>;

const FIELD_ANCHORS: Record<PageFieldKey, string> = {
  membershipClasses: 'membership-classes',
  membershipClassTerms: 'membership-class-terms',
  stakeholderGroups: 'stakeholder-groups',
  stakeholderGroupTerms: 'stakeholder-group-terms',
  specialProvisions: 'special-provisions',
};

const FIELD_ORDER: PageFieldKey[] = [
  'membershipClasses',
  'membershipClassTerms',
  'stakeholderGroups',
  'stakeholderGroupTerms',
  'specialProvisions',
];

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
  if (value.length > FORM2_RICH_TEXT_MAX_CHARS) {
    return MAX_LENGTH_ERROR;
  }
  return undefined;
}

function hasContent(value: string) {
  return value.trim().length > 0;
}

/** Prototype deep-link: seed Steps 1–5 so /form-2/step-7 opens from the playground. */
function ensureStep6Draft(): Form2Draft {
  const existing = readForm2Draft();
  if (
    hasForm2Step1Data(existing?.step1) &&
    hasForm2Step2Data(existing.step2) &&
    existing.step4.directors.length > 0 &&
    existing.step5.membershipFee.trim()
  ) {
    return {
      ...existing,
      step5: { ...EMPTY_STEP5, ...(existing.step5 ?? {}) },
      step6: { ...EMPTY_STEP6, ...(existing.step6 ?? {}) },
      step7: {
        incorporators: syncIncorporatorsFromDirectors(
          existing.step4.directors,
          existing.step7?.incorporators ?? [],
        ),
      },
    };
  }

  const now = new Date().toISOString();
  const directors =
    existing?.step4?.directors?.length
      ? existing.step4.directors
      : [
          {
            id: 'seed-director-1',
            firstName: 'Alex',
            middleName: '',
            lastName: 'Rivera',
            email: 'alex.rivera@example.com',
            residentCanadian: 'yes' as const,
            alsoIncorporator: 'yes' as const,
            numberOfShares: '100',
            classDesignation: 'Common',
            amountToBePaid: '1000.00',
            address: {
              addressType: 'canadian' as const,
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
        ];

  const seeded: Form2Draft = {
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
      directors,
    },
    step5: { ...EMPTY_STEP5, ...(existing?.step5 ?? {}) },
    step6: { ...EMPTY_STEP6, ...(existing?.step6 ?? {}) },
    step7: {
      ...EMPTY_STEP7,
      incorporators: syncIncorporatorsFromDirectors(
        directors,
        existing?.step7?.incorporators ?? [],
      ),
    },
    savedAt: now,
    mode: 'continue',
    lastCompletedStep: 5,
  };
  saveForm2Draft(seeded);
  return seeded;
}

export function Form2Step6() {
  const navigate = useNavigate();
  const draft = ensureStep6Draft();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const stakeholderFieldsRequired = draft.step4.multiStakeholder === 'yes';

  const [step6, setStep6] = useState<Form2Step6Data>(() => ({
    ...EMPTY_STEP6,
    ...(draft.step6 ?? {}),
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
    setStep6((prev) => ({ ...prev, [key]: value }));
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
      const lengthError = lengthErrorIfNeeded(step6[key]);
      if (lengthError) {
        page[key] = lengthError;
      }
    }

    if (
      !page.membershipClassTerms &&
      hasContent(step6.membershipClasses) &&
      !hasContent(step6.membershipClassTerms)
    ) {
      page.membershipClassTerms = MEMBERSHIP_CLASS_TERMS_REQUIRED;
    }
    if (
      !page.membershipClasses &&
      hasContent(step6.membershipClassTerms) &&
      !hasContent(step6.membershipClasses)
    ) {
      page.membershipClasses = MEMBERSHIP_CLASSES_REQUIRED;
    }

    if (
      !page.stakeholderGroupTerms &&
      hasContent(step6.stakeholderGroups) &&
      !hasContent(step6.stakeholderGroupTerms)
    ) {
      page.stakeholderGroupTerms = STAKEHOLDER_GROUP_TERMS_REQUIRED;
    }
    if (
      !page.stakeholderGroups &&
      hasContent(step6.stakeholderGroupTerms) &&
      !hasContent(step6.stakeholderGroups)
    ) {
      page.stakeholderGroups = STAKEHOLDER_GROUPS_REQUIRED;
    }

    for (const key of FIELD_ORDER) {
      if (page[key] || hasContent(step6[key])) {
        continue;
      }
      if (
        !stakeholderFieldsRequired &&
        (key === 'stakeholderGroups' || key === 'stakeholderGroupTerms')
      ) {
        continue;
      }
      page[key] = FIELD_REQUIRED;
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

    upsertForm2Step6(step6, 'continue', 6);
    navigate('/form-2/step-8');
  }

  function handleSaveAsDraft() {
    upsertForm2Step6(
      step6,
      'draft',
      draft.lastCompletedStep >= 6 ? 6 : draft.lastCompletedStep >= 5 ? 5 : 4,
    );
    navigate('/form-2/draft-summary');
  }

  function handleCancel() {
    const leave = window.confirm(
      'Leave this filing without saving further changes?',
    );
    if (leave) {
      navigate('/');
    }
  }

  function handleSummaryLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    focusField(href.replace('#', ''));
  }

  useEffect(() => {
    function handleDocumentClick(event: globalThis.MouseEvent) {
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
          backButtonUrl="/form-2/step-6"
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>
            Membership and provisions
          </h1>

          {/* ODS gap: no rich-text WC in v8.1.0 — compose with OntarioTextarea + counts. */}
          <div className={`${styles.formStack} ${step5Styles.fieldStack}`}>
            <div id={FIELD_ANCHORS.membershipClasses}>
              <OntarioTextarea
                elementId={FIELD_ANCHORS.membershipClasses}
                caption="The classes of membership, if any, are:"
                name={FIELD_ANCHORS.membershipClasses}
                required
                hintText={NOT_APPLICABLE_HINT}
                value={step6.membershipClasses}
                errorMessage={errors.membershipClasses}
                customOnInput={(event) =>
                  patchField('membershipClasses', getEventValue(event))
                }
              />
            </div>

            <div id={FIELD_ANCHORS.membershipClassTerms}>
              <OntarioTextarea
                elementId={FIELD_ANCHORS.membershipClassTerms}
                caption="The terms and conditions attaching to each class of membership are:"
                name={FIELD_ANCHORS.membershipClassTerms}
                required
                hintText={NOT_APPLICABLE_HINT}
                value={step6.membershipClassTerms}
                errorMessage={errors.membershipClassTerms}
                customOnInput={(event) =>
                  patchField('membershipClassTerms', getEventValue(event))
                }
              />
            </div>

            <div id={FIELD_ANCHORS.stakeholderGroups}>
              <OntarioTextarea
                elementId={FIELD_ANCHORS.stakeholderGroups}
                caption="The stakeholder groups, if any, are:"
                name={FIELD_ANCHORS.stakeholderGroups}
                required={stakeholderFieldsRequired}
                hintText={
                  stakeholderFieldsRequired
                    ? NOT_APPLICABLE_HINT
                    : 'Optional. Only required if this is a multi-stakeholder co-operative.'
                }
                value={step6.stakeholderGroups}
                errorMessage={errors.stakeholderGroups}
                customOnInput={(event) =>
                  patchField('stakeholderGroups', getEventValue(event))
                }
              />
            </div>

            <div id={FIELD_ANCHORS.stakeholderGroupTerms}>
              <OntarioTextarea
                elementId={FIELD_ANCHORS.stakeholderGroupTerms}
                caption="The terms and conditions for membership in each stakeholder group are:"
                name={FIELD_ANCHORS.stakeholderGroupTerms}
                required={stakeholderFieldsRequired}
                hintText={
                  stakeholderFieldsRequired
                    ? NOT_APPLICABLE_HINT
                    : 'Optional. Only required if this is a multi-stakeholder co-operative.'
                }
                value={step6.stakeholderGroupTerms}
                errorMessage={errors.stakeholderGroupTerms}
                customOnInput={(event) =>
                  patchField('stakeholderGroupTerms', getEventValue(event))
                }
              />
            </div>

            <div id={FIELD_ANCHORS.specialProvisions}>
              <OntarioTextarea
                elementId={FIELD_ANCHORS.specialProvisions}
                caption="Special provisions, if any, are:"
                name={FIELD_ANCHORS.specialProvisions}
                required
                hintText={NOT_APPLICABLE_HINT}
                value={step6.specialProvisions}
                errorMessage={errors.specialProvisions}
                customOnInput={(event) =>
                  patchField('specialProvisions', getEventValue(event))
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
