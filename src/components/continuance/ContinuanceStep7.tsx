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
  EMPTY_STEP7,
  ensureContinuanceStep7Draft,
  readContinuanceDraft,
  upsertContinuanceStep7,
  type ContinuanceFormId,
  type ContinuanceStep7Data,
} from './continuanceDraftStorage';
import styles from '../form2/Form2Step1.module.scss';
import step5Styles from '../form1/Form1Step5.module.scss';

const CURRENT_STEP = 7;
const MAX_LENGTH_ERROR =
  'The text entered exceeds the maximum length of 900,000 characters.';
const NOT_APPLICABLE_VALUE = 'Not applicable';

type PageFieldKey = keyof ContinuanceStep7Data;
type PageErrors = Partial<Record<PageFieldKey, string>>;

const FIELD_ANCHORS: Record<PageFieldKey, string> = {
  businessPowersRestrictions: 'business-powers-restrictions',
  authorizedCapital: 'authorized-capital',
  preferenceShareTerms: 'preference-share-terms',
  issuedCapitalContinued: 'issued-capital-continued',
  shareTransferRestrictions: 'share-transfer-restrictions',
  minimumMemberLoan: 'minimum-member-loan',
  memberLoanTransferRestrictions: 'member-loan-transfer-restrictions',
  membershipFee: 'membership-fee',
};

const FORM14_FIELD_ORDER: PageFieldKey[] = [
  'businessPowersRestrictions',
  'authorizedCapital',
  'preferenceShareTerms',
  'issuedCapitalContinued',
  'shareTransferRestrictions',
];

const FORM15_FIELD_ORDER: PageFieldKey[] = [
  'businessPowersRestrictions',
  'minimumMemberLoan',
  'memberLoanTransferRestrictions',
  'membershipFee',
];

const FIELD_CAPTIONS: Record<PageFieldKey, string> = {
  businessPowersRestrictions: 'Restrictions on business and powers',
  authorizedCapital: 'Authorized capital',
  preferenceShareTerms: 'Preference share terms',
  issuedCapitalContinued: 'Issued capital continued',
  shareTransferRestrictions: 'Restrictions on allotment, issue or transfer of shares',
  minimumMemberLoan: 'Minimum member loan',
  memberLoanTransferRestrictions: 'Restrictions on transfer of member loans',
  membershipFee: 'Membership fee',
};

const FIELD_PAPER_HINTS: Record<PageFieldKey, string> = {
  businessPowersRestrictions:
    'Restrictions, if any, on the business the co-operative may carry on or on powers the co-operative may exercise.',
  authorizedCapital: 'The authorized capital for each class of share is.',
  preferenceShareTerms:
    'The designations, preferences, rights, conditions, restrictions, limitations or prohibitions attaching to the preference shares, if any, are.',
  issuedCapitalContinued:
    'The issued capital of the corporation is continued as issued capital of the co-operative as follows.',
  shareTransferRestrictions: 'The restrictions on the allotment, issue or transfer of shares are.',
  minimumMemberLoan: 'The amount of the minimum member loan, if any.',
  memberLoanTransferRestrictions: 'The restrictions on transfer of member loans are.',
  membershipFee: 'The amount of the membership fee, if any, is.',
};

const FIELD_REQUIRED_MESSAGES: Record<PageFieldKey, string> = {
  businessPowersRestrictions:
    'Restrictions on the business and powers must be entered. If none, enter Not applicable.',
  authorizedCapital:
    'The authorized capital for each class of share must be entered. If none, enter Not applicable.',
  preferenceShareTerms:
    'The terms attaching to the preference shares must be entered. If none, enter Not applicable.',
  issuedCapitalContinued:
    'The issued capital that is continued must be entered. If none, enter Not applicable.',
  shareTransferRestrictions:
    'The restrictions on the allotment, issue or transfer of shares must be entered. If none, enter Not applicable.',
  minimumMemberLoan:
    'The minimum member loan must be entered. If none, enter Not applicable.',
  memberLoanTransferRestrictions:
    'The restrictions on transfer of member loans must be entered. If none, enter Not applicable.',
  membershipFee: 'The membership fee must be entered. If none, enter Not applicable.',
};

function fieldsForForm(formId: ContinuanceFormId): PageFieldKey[] {
  return formId === 15 ? FORM15_FIELD_ORDER : FORM14_FIELD_ORDER;
}

function pageTitleForForm(formId: ContinuanceFormId) {
  return formId === 15
    ? 'Restrictions, member loans and membership fee'
    : 'Restrictions and share capital';
}


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

type ContinuanceStep7Props = {
  formId: ContinuanceFormId;
};

export function ContinuanceStep7({ formId }: ContinuanceStep7Props) {
  const navigate = useNavigate();
  const { afterSave } = useContinuanceReviewReturn(formId);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const [draft] = useState(() => ensureContinuanceStep7Draft(formId));
  const fieldOrder = fieldsForForm(formId);

  const [step7, setStep7] = useState<ContinuanceStep7Data>(() => ({
    ...EMPTY_STEP7,
    ...(draft.step7 ?? {}),
  }));
  const [textareaRevision, setTextareaRevision] = useState<Partial<Record<PageFieldKey, number>>>(
    () => Object.fromEntries(fieldOrder.map((key) => [key, 0])),
  );
  const [errors, setErrors] = useState<PageErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const errorSummaryItems = useMemo(
    () =>
      fieldOrder.flatMap((key) => {
        const message = errors[key];
        if (!message) {
          return [];
        }
        return [{ key, message, href: `#${FIELD_ANCHORS[key]}` }];
      }),
    [errors, fieldOrder],
  );

  function patchField(key: PageFieldKey, value: string) {
    setStep7((prev) => ({ ...prev, [key]: value }));
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
    setTextareaRevision((prev) => ({ ...prev, [fieldKey]: (prev[fieldKey] ?? 0) + 1 }));
    window.requestAnimationFrame(() => {
      writeOdsTextarea(FIELD_ANCHORS[fieldKey], NOT_APPLICABLE_VALUE);
    });
  }

  function validatePage(): PageErrors {
    const page: PageErrors = {};
    for (const key of fieldOrder) {
      const lengthError = lengthErrorIfNeeded(step7[key]);
      if (lengthError) {
        page[key] = lengthError;
        continue;
      }
      if (!step7[key].trim()) {
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
    upsertContinuanceStep7(formId, step7, 'continue');
    navigate(afterSave(`/form-${formId}/step-8`));
  }

  function handleSaveAsDraft() {
    upsertContinuanceStep7(
      formId,
      step7,
      'draft',
      readContinuanceDraft(formId)?.lastCompletedStep ?? 6,
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
          backButtonUrl={`/form-${formId}/step-6`}
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>{pageTitleForForm(formId)}</h1>

          {/* ODS gap: no rich-text WC in v8.1.0 — compose with OntarioTextarea. */}
          <div className={`${styles.formStack} ${step5Styles.fieldStack}`}>
            {fieldOrder.map((key) => (
              <div key={key} id={FIELD_ANCHORS[key]}>
                <OntarioTextarea
                  key={`${key}-${textareaRevision[key] ?? 0}`}
                  elementId={FIELD_ANCHORS[key]}
                  caption={FIELD_CAPTIONS[key]}
                  name={FIELD_ANCHORS[key]}
                  required
                  hintText={notApplicableHintText(FIELD_PAPER_HINTS[key])}
                  value={step7[key]}
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
