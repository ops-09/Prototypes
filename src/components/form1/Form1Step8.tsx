import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioCheckboxes,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { Form7SummaryList } from '../form7/Form7SummaryList';
import reviewStyles from '../form7/Form7Step4.module.scss';
import { FileUpload } from './FileUpload';
import {
  createForm1ConfirmationNumber,
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
  resolveCoverLetterContact,
  type ReviewSectionKey,
} from './form1ReviewModel';
import styles from './Form1Step1.module.scss';

const CURRENT_STEP = 9;
const TOTAL_STEPS = 9;
const AUTH_OPTION_VALUE = 'authorized';

type ReviewErrors = Partial<{
  sections: string;
  signedPdf: string;
  authorization: string;
}>;

const SIGNED_PDF_REQUIRED =
  'Upload the signed PDF before submitting this filing.';

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

function ensureStep8Draft(): Form1Draft {
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

  const [step8, setStep8] = useState<Form1Step8Data>(() => ({
    ...EMPTY_STEP8,
    ...(draft.step8 ?? {}),
  }));
  const [errors, setErrors] = useState<ReviewErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pdfBlocked, setPdfBlocked] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  const contact = resolveCoverLetterContact();
  const filerName = [contact.firstName, contact.lastName]
    .filter(Boolean)
    .join(' ');
  const sections = useMemo(() => buildReviewSections(draft), [draft]);
  const incompleteKeys = useMemo(
    () =>
      new Set(
        sections.filter((section) => !section.complete).map((section) => section.key),
      ),
    [sections],
  );
  const authOptions = useMemo(
    () => [
      {
        value: AUTH_OPTION_VALUE,
        elementId: 'form1-authorization-confirm',
        label: `I, ${filerName}, confirm that I am authorized to file these Articles of Incorporation and that the information in this filing is true and complete.`,
      },
    ],
    [filerName],
  );

  if (!hasForm1Step1Data(draft.step1) || !draft.step7.incorporators.length) {
    return <Navigate to="/form-1" replace />;
  }

  function clearError(key: keyof ReviewErrors) {
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validate(): ReviewErrors {
    const next: ReviewErrors = {};
    if (incompleteKeys.size > 0) {
      next.sections =
        'One or more sections are incomplete. Use Change to correct the information before submitting.';
    }
    if (!step8.signedPdf) {
      next.signedPdf = SIGNED_PDF_REQUIRED;
    }
    if (!step8.authorizationConfirmed) {
      next.authorization =
        'Confirm the authorization statement before submitting the filing.';
    }
    return next;
  }

  function handleSubmit() {
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

    const confirmationNumber = createForm1ConfirmationNumber();
    upsertForm1Step8(step8, 'submitted', 8, confirmationNumber);
    navigate('/form-1/draft-summary');
  }

  function handleSaveAsDraft() {
    upsertForm1Step8(step8, 'draft', 7);
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

  function patchStep8(partial: Partial<Form1Step8Data>) {
    setStep8((prev) => ({ ...prev, ...partial }));
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
                  {errors.signedPdf ? (
                    <li>
                      <a
                        className={styles.errorSummaryLink}
                        href="#form1-signed-pdf"
                        onClick={(event) =>
                          handleSummaryLinkClick(event, '#form1-signed-pdf')
                        }
                      >
                        {errors.signedPdf}
                      </a>
                    </li>
                  ) : null}
                  {errors.authorization ? (
                    <li>
                      <a
                        className={styles.errorSummaryLink}
                        href="#form1-authorization"
                        onClick={(event) =>
                          handleSummaryLinkClick(event, '#form1-authorization')
                        }
                      >
                        {errors.authorization}
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
            Use Change to correct a section, generate a PDF to sign, upload the signed copy,
            then authorize and submit.
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

            <section
              id="form1-generate-upload"
              className={reviewStyles.pdfSection}
              aria-labelledby="form1-generate-upload-heading"
            >
              <h2
                id="form1-generate-upload-heading"
                className={reviewStyles.sectionHeading}
              >
                Generate and upload PDF
              </h2>
              <div className={reviewStyles.pdfSectionBody}>
                <div className={reviewStyles.pdfStep}>
                  <h3 className={reviewStyles.pdfStepTitle}>1. Generate PDF</h3>
                  <p className={reviewStyles.pdfStepText}>
                    Generate a PDF of the information prepared for this filing. Print or save
                    the PDF, then sign it. After signing, upload the signed PDF below.
                  </p>
                  <OntarioButton
                    type="secondary"
                    htmlType="button"
                    label="Generate PDF"
                    onClick={handleGeneratePdf}
                  />
                  {pdfBlocked ? (
                    <OntarioPageAlert
                      type="warning"
                      heading="Pop-up blocked"
                      content="Allow pop-ups for this site to open the printable PDF preview."
                    />
                  ) : null}
                  {pdfGenerated && !pdfBlocked ? (
                    <OntarioPageAlert
                      type="success"
                      heading="PDF generated"
                      content="Sign the PDF, then upload the signed copy below."
                    />
                  ) : null}
                </div>

                <div id="form1-signed-pdf" className={reviewStyles.pdfStep}>
                  <FileUpload
                    inputId="form1-signed-pdf-upload"
                    label="2. Upload signed PDF"
                    required
                    hintText="Upload the signed copy of the generated PDF. PDF only, maximum 20 MB."
                    buttonLabel="Upload signed PDF"
                    value={step8.signedPdf}
                    errorMessage={errors.signedPdf}
                    onChange={(file) => {
                      patchStep8({ signedPdf: file });
                      clearError('signedPdf');
                    }}
                  />
                </div>
              </div>
            </section>

            <section
              id="form1-authorization"
              className={reviewStyles.authSection}
              aria-labelledby="form1-authorization-heading"
            >
              <h2
                id="form1-authorization-heading"
                className={reviewStyles.sectionHeading}
              >
                Authorization
              </h2>
              <OntarioCheckboxes
                caption={{
                  captionText: 'Authorization declaration',
                  captionType: 'default',
                }}
                name="form1-authorization"
                required
                options={authOptions}
                value={step8.authorizationConfirmed ? [AUTH_OPTION_VALUE] : []}
                errorMessage={errors.authorization}
                customOnChange={(event) => {
                  const selected = (event.target as HTMLInputElement | null)?.checked;
                  const nextChecked =
                    typeof selected === 'boolean'
                      ? selected
                      : !step8.authorizationConfirmed;
                  patchStep8({ authorizationConfirmed: nextChecked });
                  clearError('authorization');
                }}
              />
            </section>
          </div>

          <div className={styles.buttonGroup}>
            <OntarioButton
              type="primary"
              htmlType="button"
              label="Submit"
              onClick={handleSubmit}
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
