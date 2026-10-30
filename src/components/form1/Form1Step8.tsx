import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { Form7SummaryList } from '../form7/Form7SummaryList';
import { GeneratePdfSection } from '../shared/GeneratePdfSection';
import {
  createSeedStep1,
  EMPTY_STEP2,
  EMPTY_STEP3,
  EMPTY_STEP4,
  EMPTY_STEP5,
  EMPTY_STEP6,
  EMPTY_STEP7,
  EMPTY_STEP8,
  hasForm1Step1Data,
  readForm1Draft,
  saveForm1Draft,
  syncIncorporatorsFromDirectors,
  upsertForm1Step8,
  type Form1Draft,
  type Form1Step8Data,
  hasForm1Step2Data,
} from './form1DraftStorage';
import { generateForm1ReviewPdf } from './form1GeneratePdf';
import {
  buildReviewSections,
  type ReviewSectionKey,
} from './form1ReviewModel';
import styles from './Form1Step1.module.scss';

const CURRENT_STEP = 9;
const TOTAL_STEPS = 10;

type ReviewErrors = Partial<{
  sections: string;
}>;

const SECTION_ORDER: ReviewSectionKey[] = [
  'contact',
  'cooperativeName',
  'typeAndContact',
  'headOffice',
  'firstDirectors',
  'shareInformation',
  'membershipProvisions',
  'incorporators',
];

export function ensureStep8Draft(): Form1Draft {
  const existing = readForm1Draft();
  if (
    hasForm1Step1Data(existing?.step1) &&
    hasForm1Step2Data(existing.step2) &&
    existing.step4.directors.length > 0 &&
    existing.step5.authorizedCapital.trim() &&
    existing.step7.incorporators.length > 0
  ) {
    const draft: Form1Draft = {
      ...existing,
      step6: { ...EMPTY_STEP6, ...(existing.step6 ?? {}) },
      step7: {
        incorporators: syncIncorporatorsFromDirectors(
          existing.step4.directors,
          existing.step7.incorporators,
        ),
      },
      step8: { ...EMPTY_STEP8, ...(existing.step8 ?? {}) },
    };
    saveForm1Draft(draft);
    return draft;
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
      directors,
    },
    step5: { ...EMPTY_STEP5, ...(existing?.step5 ?? {}) },
    step6: { ...EMPTY_STEP6, ...(existing?.step6 ?? {}) },
    step7: {
      incorporators: syncIncorporatorsFromDirectors(
        directors,
        existing?.step7?.incorporators ?? [],
      ),
    },
    step8: { ...EMPTY_STEP8, ...(existing?.step8 ?? {}) },
    savedAt: now,
    mode: 'continue',
    lastCompletedStep: 7,
  };
  saveForm1Draft(seeded);
  return seeded;
}

export function Form1Step8() {
  const navigate = useNavigate();
  const draft = ensureStep8Draft();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [step8] = useState<Form1Step8Data>(() => ({
    ...EMPTY_STEP8,
    ...(draft.step8 ?? {}),
  }));
  const [errors, setErrors] = useState<ReviewErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pdfBlocked, setPdfBlocked] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  const sections = useMemo(() => buildReviewSections(draft), [draft]);
  const incompleteKeys = useMemo(
    () =>
      new Set(
        sections.filter((section) => !section.complete).map((section) => section.key),
      ),
    [sections],
  );
  if (!hasForm1Step1Data(draft.step1) || !draft.step7.incorporators.length) {
    return <Navigate to="/form-1" replace />;
  }

  function validate(): ReviewErrors {
    const next: ReviewErrors = {};
    if (incompleteKeys.size > 0) {
      next.sections =
        'One or more sections are incomplete. Use Change to correct the information before continuing.';
    }
    return next;
  }

  function handleContinue() {
    const nextErrors = validate();
    const hasErrors = Object.keys(nextErrors).length > 0;
    setErrors(nextErrors);
    setShowErrorSummary(hasErrors);

    if (hasErrors) {
      window.requestAnimationFrame(() => {
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }

    upsertForm1Step8(step8, 'continue', 8);
    navigate('/form-1/step-10');
  }

  function handleSaveAsDraft() {
    upsertForm1Step8(step8, 'draft', 8);
    navigate('/form-1/draft-summary');
  }

  function handleCancel() {
    navigate('/');
  }

  function handleGeneratePdf() {
    const opened = generateForm1ReviewPdf({ draft });
    setPdfBlocked(!opened);
    if (opened) {
      setPdfGenerated(true);
    }
  }

  const firstIncompleteKey =
    SECTION_ORDER.find((key) => incompleteKeys.has(key)) ?? 'contact';

  function handleSummaryLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    const target = document.getElementById(href.replace('#', ''));
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const sectionAnchor = (key: ReviewSectionKey) => `review-${key}`;

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-1/step-8"
          currentStep={CURRENT_STEP}
          numberOfSteps={TOTAL_STEPS}
        />
      </div>

      <div className="ontario-row">
        <div className="ontario-columns ontario-small-12 ontario-medium-8">
          {showErrorSummary && Object.keys(errors).length > 0 ? (
            <div ref={errorSummaryRef} className={styles.alert} tabIndex={-1}>
              <OntarioPageAlert type="error" heading="There is a problem">
                <p>Errors were found on this page:</p>
                <ul>
                  {errors.sections ? (
                    <li>
                      <a
                        className={styles.errorSummaryLink}
                        href={`#${sectionAnchor(firstIncompleteKey)}`}
                        onClick={(event) =>
                          handleSummaryLinkClick(
                            event,
                            `#${sectionAnchor(firstIncompleteKey)}`,
                          )
                        }
                      >
                        {errors.sections}
                      </a>
                    </li>
                  ) : null}
                </ul>
              </OntarioPageAlert>
            </div>
          ) : null}

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Review</h1>
          <p className={styles.lead}>
            Review the information you entered for this Articles of Incorporation filing.
            Use Change to correct a section, then generate a PDF to sign. Continue to the
            next step to upload the signed copy and authorize the filing.
          </p>

          <div className={styles.formStack}>
            {sections.map((section) => (
              <div
                key={section.key}
                id={sectionAnchor(section.key)}
                className={section.groups?.length ? styles.formStack : undefined}
              >
                {section.rows.length > 0 || !section.groups?.length ? (
                  <Form7SummaryList
                    caption={section.caption}
                    headingLevel="h2"
                    captionActionLink={{ href: section.editHref, label: 'Change' }}
                    items={section.rows}
                    columnRatio="1-2"
                  />
                ) : null}
                {section.groups?.map((group) => (
                  <Form7SummaryList
                    key={group.key}
                    caption={group.caption}
                    headingLevel="h2"
                    captionActionLink={{ href: group.editHref, label: 'Change' }}
                    items={group.rows}
                    columnRatio="1-2"
                  />
                ))}
              </div>
            ))}

            <GeneratePdfSection
              idPrefix="form1"
              pdfBlocked={pdfBlocked}
              pdfGenerated={pdfGenerated}
              onGenerate={handleGeneratePdf}
            />
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
