import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioCheckboxes,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { SupportingDocumentsUpload } from '../form7/SupportingDocumentsUpload';
import { emptyNameNuans, type SupportingDocMeta } from '../form7/form7DraftStorage';
import { Form7SummaryList } from '../form7/Form7SummaryList';
import { SIGNED_IN_INDIVIDUAL } from '../../mock/signedInIndividual';
import { focusField } from './form11Focus';
import { generateForm11ReviewPdf } from './form11GeneratePdf';
import { buildReviewSections, type ReviewSectionKey } from './form11ReviewModel';
import {
  createAccountAmalgamatingNfp,
  createEmptyAmalgamatingNfp,
  createForm11ConfirmationNumber,
  createSeedDirector,
  EMPTY_STEP5,
  EMPTY_STEP6,
  EMPTY_STEP7,
  EMPTY_STEP8,
  FORM11_TOTAL_STEPS,
  hasForm11Agreement,
  hasForm11DirectorsComplete,
  hasForm11HeadOffice,
  MIN_AMALGAMATING_NFPS,
  OBR_STEP2_DEFAULTS,
  readForm11Draft,
  saveForm11Draft,
  upsertForm11Step8,
  type Form11Draft,
  type Form11Step8Data,
} from './form11DraftStorage';
import styles from './Form11Step2.module.scss';
import reviewStyles from './Form11Step8.module.scss';

const CURRENT_STEP = 8;
const AUTH_OPTION_VALUE = 'authorized';
const SIGNED_PDF_REQUIRED = 'Upload the signed PDF before submitting this filing.';

type ReviewErrors = Partial<{
  sections: string;
  signedPdf: string;
  authorization: string;
}>;

function hasPriorSteps(draft: Form11Draft | null) {
  return Boolean(
    draft?.step2.email.trim() &&
      draft.step3.corporations.filter((entry) => entry.legalName.trim()).length >=
        MIN_AMALGAMATING_NFPS &&
      (draft.step4.changeName === 'yes' || draft.step4.changeName === 'no') &&
      hasForm11HeadOffice(draft.step5) &&
      hasForm11DirectorsComplete(draft.step6) &&
      hasForm11Agreement(draft.step7),
  );
}

function ensureStep8Draft(): Form11Draft {
  const existing = readForm11Draft();
  if (hasPriorSteps(existing)) {
    return existing as Form11Draft;
  }

  const account = createAccountAmalgamatingNfp();
  const other = {
    ...createEmptyAmalgamatingNfp(),
    legalName: 'RIVERDALE COMMUNITY HEALTH CENTRE',
    ocn: '100009001',
    membersApprovalDate: '2026-03-01',
  };
  const draft: Form11Draft = {
    step2: { ...OBR_STEP2_DEFAULTS },
    step3: {
      corporations: [account, other],
      agreementApproved: true,
    },
    step4: {
      changeName: 'no',
      nameNuans: emptyNameNuans(),
      selectedAmalgamatedCorporationId: account.id,
    },
    step5: {
      ...EMPTY_STEP5,
      postalCodeLookup: 'M5H 2N2',
      selectedAddressId: 'm5h-1',
      streetAndNumber: '100 Queen St W',
      municipality: 'Toronto',
      province: 'Ontario',
      postalCode: 'M5H 2N2',
    },
    step6: {
      ...EMPTY_STEP6,
      countMode: 'fixed',
      fixedNumber: '3',
      directors: [createSeedDirector(0), createSeedDirector(1), createSeedDirector(2)],
    },
    step7: {
      ...EMPTY_STEP7,
      amalgamationAgreement:
        existing?.step7.amalgamationAgreement.trim() ||
        'Certified copy of the amalgamation agreement approved by the members of each amalgamating corporation.',
      additionalDocuments: existing?.step7.additionalDocuments ?? [],
    },
    step8: existing?.step8 ?? { ...EMPTY_STEP8 },
    savedAs: 'continue',
    savedAt: new Date().toISOString(),
    lastCompletedStep: 7,
    confirmationNumber: existing?.confirmationNumber,
  };
  saveForm11Draft(draft);
  return draft;
}

export function Form11Step8() {
  const navigate = useNavigate();
  const existing = readForm11Draft();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const [draft] = useState(() => {
    if (hasPriorSteps(existing)) {
      return existing as Form11Draft;
    }
    if (!existing) {
      return ensureStep8Draft();
    }
    return existing;
  });

  const [step8, setStep8] = useState<Form11Step8Data>(() => ({
    ...EMPTY_STEP8,
    ...(draft.step8 ?? {}),
    signedPdf: draft.step8?.signedPdf ?? null,
  }));
  const [errors, setErrors] = useState<ReviewErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pdfBlocked, setPdfBlocked] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  const filerName = [SIGNED_IN_INDIVIDUAL.firstName, SIGNED_IN_INDIVIDUAL.lastName]
    .filter(Boolean)
    .join(' ');
  const sections = useMemo(
    () => (hasPriorSteps(draft) ? buildReviewSections(draft) : []),
    [draft],
  );
  const incompleteKeys = useMemo(
    () => new Set(sections.filter((section) => !section.complete).map((section) => section.key)),
    [sections],
  );
  const authOptions = useMemo(
    () => [
      {
        value: AUTH_OPTION_VALUE,
        elementId: 'form11-authorization-confirm',
        label: `I, ${filerName}, confirm that: I have printed or saved the PDF document and it has been signed by all the required person(s) in accordance with the Act, Regulations and Director’s/Registrar’s Requirements. I also agree to the Terms and Conditions and confirm that all required person(s) and/or entities agree to them.`,
      },
    ],
    [filerName],
  );

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
        'One or more sections are incomplete. Use Edit to correct the information before submitting.';
    }
    if (!step8.signedPdf) {
      next.signedPdf = SIGNED_PDF_REQUIRED;
    }
    if (!step8.authorizationConfirmed) {
      next.authorization = 'Confirm the authorization statement before submitting the filing.';
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
    const confirmationNumber = createForm11ConfirmationNumber();
    upsertForm11Step8(step8, 'submitted', 8, confirmationNumber);
    navigate('/form-11/draft-summary');
  }

  function handleSaveAsDraft() {
    upsertForm11Step8(step8, 'draft', readForm11Draft()?.lastCompletedStep ?? 7);
    navigate('/form-11/draft-summary');
  }

  function handleCancel() {
    const leave = window.confirm('Leave this filing without saving further changes?');
    if (leave) {
      navigate('/');
    }
  }

  function handleGeneratePdf() {
    const opened = generateForm11ReviewPdf({ draft });
    setPdfBlocked(!opened);
    if (opened) {
      setPdfGenerated(true);
    }
  }

  const firstIncompleteKey =
    (
      [
        'corporation',
        'amalgamating',
        'amalgamatedName',
        'headOffice',
        'directors',
        'agreement',
        'supportingDocuments',
      ] as const
    ).find((key) => incompleteKeys.has(key)) ?? 'corporation';

  function handleSummaryLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    focusField(href.replace('#', ''));
  }

  const sectionAnchor = (key: ReviewSectionKey) => `review-${key}`;

  if (!hasPriorSteps(draft)) {
    if (!draft.step2.email.trim()) {
      return <Navigate to="/form-11/step-2" replace />;
    }
    if (
      draft.step3.corporations.filter((entry) => entry.legalName.trim()).length <
      MIN_AMALGAMATING_NFPS
    ) {
      return <Navigate to="/form-11/step-3" replace />;
    }
    if (draft.step4.changeName !== 'yes' && draft.step4.changeName !== 'no') {
      return <Navigate to="/form-11/step-4" replace />;
    }
    if (!hasForm11HeadOffice(draft.step5)) {
      return <Navigate to="/form-11/step-5" replace />;
    }
    if (!hasForm11DirectorsComplete(draft.step6)) {
      return <Navigate to="/form-11/step-6" replace />;
    }
    return <Navigate to="/form-11/step-7" replace />;
  }

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-11/step-7"
          currentStep={CURRENT_STEP}
          numberOfSteps={FORM11_TOTAL_STEPS}
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
                          handleSummaryLinkClick(event, `#${sectionAnchor(firstIncompleteKey)}`)
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
                        href="#form11-signed-pdf"
                        onClick={(event) => handleSummaryLinkClick(event, '#form11-signed-pdf')}
                      >
                        {errors.signedPdf}
                      </a>
                    </li>
                  ) : null}
                  {errors.authorization ? (
                    <li>
                      <a
                        className={styles.errorSummaryLink}
                        href="#form11-authorization"
                        onClick={(event) =>
                          handleSummaryLinkClick(event, '#form11-authorization')
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
            Review the information you entered for this Application for Letters Patent of
            Amalgamation. Use Edit to correct a section, generate a PDF to sign, upload the
            signed copy, then authorize and submit.
          </p>

          <div className={styles.formStack}>
            {sections.map((section) => (
              <div key={section.key} id={sectionAnchor(section.key)}>
                <Form7SummaryList
                  caption={section.caption}
                  headingLevel="h2"
                  captionActionLink={{ href: section.editHref, label: 'Edit' }}
                  items={section.rows}
                  columnRatio="1-2"
                />
              </div>
            ))}

            <section
              id="form11-generate-upload"
              className={reviewStyles.pdfSection}
              aria-labelledby="generate-upload-heading"
            >
              <h2 id="generate-upload-heading" className={reviewStyles.sectionHeading}>
                Generate and upload PDF
              </h2>
              <div className={reviewStyles.pdfSectionBody}>
                <div className={reviewStyles.pdfStep}>
                  <h3 className={reviewStyles.pdfStepTitle}>1. Generate PDF</h3>
                  <p className={reviewStyles.pdfStepText}>
                    Generate a PDF to review the information that you have prepared to be
                    filed.
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
                      content="Sign the PDF, then upload the signed copy below. Two signatures are required for each amalgamating corporation."
                    />
                  ) : null}
                </div>

                <div id="form11-signed-pdf" className={reviewStyles.pdfStep}>
                  <SupportingDocumentsUpload
                    inputId="form11-signed-pdf-upload"
                    label="2. Upload signed PDF"
                    required
                    hintText="Upload the signed copy of the generated PDF. PDF only, maximum 20 MB. (required)"
                    maxFiles={1}
                    showUploadedAt
                    value={step8.signedPdf ? [step8.signedPdf] : []}
                    errorMessage={errors.signedPdf}
                    onChange={(files: SupportingDocMeta[]) => {
                      setStep8((prev) => ({ ...prev, signedPdf: files[0] ?? null }));
                      clearError('signedPdf');
                    }}
                  />
                </div>
              </div>
            </section>

            <section
              id="form11-authorization"
              className={reviewStyles.authSection}
              aria-labelledby="authorization-heading"
            >
              <h2 id="authorization-heading" className={reviewStyles.sectionHeading}>
                Authorization
              </h2>
              <OntarioCheckboxes
                caption={{
                  captionText: 'Authorization declaration',
                  captionType: 'default',
                }}
                name="form11-authorization"
                required
                options={authOptions}
                value={step8.authorizationConfirmed ? [AUTH_OPTION_VALUE] : []}
                errorMessage={errors.authorization}
                customOnChange={(event) => {
                  const selected = (event.target as HTMLInputElement | null)?.checked;
                  const nextChecked =
                    typeof selected === 'boolean' ? selected : !step8.authorizationConfirmed;
                  setStep8((prev) => ({ ...prev, authorizationConfirmed: nextChecked }));
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
              label="Save as Draft"
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
