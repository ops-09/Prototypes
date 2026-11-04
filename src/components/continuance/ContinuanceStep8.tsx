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
import { FILL_NOT_APPLICABLE_ATTR, notApplicableHintText } from './continuanceNotApplicableHint';
import { focusField, getEventValue } from './continuanceFocus';
import { useContinuanceReviewReturn } from './continuanceReviewReturn';
import {
  CONTINUANCE_RICH_TEXT_MAX_CHARS,
  CONTINUANCE_TOTAL_STEPS,
  EMPTY_STEP8,
  ensureContinuanceStep8Draft,
  readContinuanceDraft,
  upsertContinuanceStep8,
  type ContinuanceFormId,
  type ContinuanceStep8Data,
} from './continuanceDraftStorage';
import styles from '../form2/Form2Step1.module.scss';
import step5Styles from '../form1/Form1Step5.module.scss';

const CURRENT_STEP = 8;
const MAX_LENGTH_ERROR =
  'The text entered exceeds the maximum length of 900,000 characters.';
const NOT_APPLICABLE_VALUE = 'Not applicable';

type PageFieldKey = keyof ContinuanceStep8Data;
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

const FIELD_CAPTIONS: Record<PageFieldKey, string> = {
  membershipClasses: 'Classes of membership',
  membershipClassTerms: 'Terms and conditions of each class of membership',
  stakeholderGroups: 'Stakeholder groups',
  stakeholderGroupTerms: 'Terms and conditions of membership in each stakeholder group',
  specialProvisions: 'Special provisions',
};

const FIELD_PAPER_HINTS: Record<PageFieldKey, string> = {
  membershipClasses: 'The classes of membership, if any, are.',
  membershipClassTerms: 'The terms and conditions attaching to each class of membership are.',
  stakeholderGroups: 'The stakeholder groups, if any, are.',
  stakeholderGroupTerms: 'The terms and conditions for membership in each stakeholder group are.',
  specialProvisions: 'Special provisions, if any, are.',
};

const FIELD_REQUIRED_MESSAGES: Record<PageFieldKey, string> = {
  membershipClasses:
    'The classes of membership must be entered. If none, enter Not applicable.',
  membershipClassTerms:
    'The terms and conditions of each class of membership must be entered. If none, enter Not applicable.',
  stakeholderGroups: 'The stakeholder groups must be entered. If none, enter Not applicable.',
  stakeholderGroupTerms:
    'The terms and conditions of membership in each stakeholder group must be entered. If none, enter Not applicable.',
  specialProvisions: 'The special provisions must be entered. If none, enter Not applicable.',
};


const ANCHOR_TO_FIELD = Object.fromEntries(
  (Object.entries(FIELD_ANCHORS) as [PageFieldKey, string][]).map(([key, anchor]) => [
    anchor,
    key,
  ]),
) as Record<string, PageFieldKey>;

function fieldKeyFromComposedPath(path: EventTarget[]): PageFieldKey | null {
  for (const node of path) {
    if (!(node instanceof Element)) {
      continue;
    }
    const hostElementId = (node as HTMLElement & { elementId?: string }).elementId;
    const candidates = [hostElementId, node.getAttribute('element-id'), node.id || null];
    for (const candidate of candidates) {
      if (candidate && ANCHOR_TO_FIELD[candidate]) {
        return ANCHOR_TO_FIELD[candidate];
      }
    }
  }
  return null;
}

function lengthErrorIfNeeded(value: string): string | undefined {
  if (value.length > CONTINUANCE_RICH_TEXT_MAX_CHARS) {
    return MAX_LENGTH_ERROR;
  }
  return undefined;
}

type ContinuanceStep8Props = {
  formId: ContinuanceFormId;
};

export function ContinuanceStep8({ formId }: ContinuanceStep8Props) {
  const navigate = useNavigate();
  const { afterSave } = useContinuanceReviewReturn(formId);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const [draft] = useState(() => ensureContinuanceStep8Draft(formId));

  const [step8, setStep8] = useState<ContinuanceStep8Data>(() => ({
    ...EMPTY_STEP8,
    ...(draft.step8 ?? {}),
  }));
  const [textareaRevision, setTextareaRevision] = useState<Record<PageFieldKey, number>>(
    () => Object.fromEntries(FIELD_ORDER.map((key) => [key, 0])) as Record<PageFieldKey, number>,
  );
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
    setStep8((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const lengthError = lengthErrorIfNeeded(value);
      if (lengthError) {
        return { ...prev, [key]: lengthError };
      }
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function writeOdsTextarea(anchorId: string, value: string) {
    const host = [...document.querySelectorAll('ontario-textarea')].find((element) => {
      const candidate = element as HTMLElement & { elementId?: string };
      return candidate.elementId === anchorId || element.getAttribute('element-id') === anchorId;
    }) as (HTMLElement & { value: string }) | undefined;
    if (!host) {
      return;
    }
    host.value = value;
    const textarea = host.shadowRoot?.querySelector('textarea');
    if (!textarea) {
      return;
    }
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
    setter?.call(textarea, value);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function fillNotApplicable(fieldKey: PageFieldKey) {
    patchField(fieldKey, NOT_APPLICABLE_VALUE);
    setTextareaRevision((prev) => ({ ...prev, [fieldKey]: prev[fieldKey] + 1 }));
    window.requestAnimationFrame(() => {
      writeOdsTextarea(FIELD_ANCHORS[fieldKey], NOT_APPLICABLE_VALUE);
    });
  }

  function validatePage(): PageErrors {
    const page: PageErrors = {};
    for (const key of FIELD_ORDER) {
      const lengthError = lengthErrorIfNeeded(step8[key]);
      if (lengthError) {
        page[key] = lengthError;
        continue;
      }
      if (!step8[key].trim()) {
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
    upsertContinuanceStep8(formId, step8, 'continue');
    navigate(afterSave(`/form-${formId}/step-9`));
  }

  function handleSaveAsDraft() {
    upsertContinuanceStep8(
      formId,
      step8,
      'draft',
      readContinuanceDraft(formId)?.lastCompletedStep ?? 7,
    );
    navigate(`/form-${formId}/draft-summary`);
  }

  function handleCancel() {
    const leave = window.confirm('Leave this filing without saving further changes?');
    if (leave) {
      navigate('/');
    }
  }

  function handleSummaryLinkClick(event: ReactMouseEvent<HTMLAnchorElement>, href: string) {
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
      fillNotApplicable(fieldKey);
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
          backButtonUrl={`/form-${formId}/step-7`}
          currentStep={CURRENT_STEP}
          numberOfSteps={CONTINUANCE_TOTAL_STEPS}
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Membership and provisions</h1>

          {/* ODS gap: no rich-text WC in v8.1.0 — compose with OntarioTextarea. */}
          <div className={`${styles.formStack} ${step5Styles.fieldStack}`}>
            {FIELD_ORDER.map((key) => (
              <div key={key} id={FIELD_ANCHORS[key]}>
                <OntarioTextarea
                  key={`${key}-${textareaRevision[key]}`}
                  elementId={FIELD_ANCHORS[key]}
                  caption={FIELD_CAPTIONS[key]}
                  name={FIELD_ANCHORS[key]}
                  required
                  hintText={notApplicableHintText(FIELD_PAPER_HINTS[key])}
                  value={step8[key]}
                  errorMessage={errors[key]}
                  customOnInput={(event) => patchField(key, getEventValue(event))}
                />
              </div>
            ))}
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
