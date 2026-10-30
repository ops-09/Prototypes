import { type MouseEvent, type ReactNode, type RefObject } from 'react';
import {
  OntarioButton,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import reviewStyles from '../form7/Form7Step4.module.scss';

type FilingSubmitStepProps = {
  currentStep: number;
  numberOfSteps: number;
  backButtonUrl: string;
  formIdPrefix: string;
  lead: string;
  stepIndicatorClassName: string;
  pageTitleClassName: string;
  leadClassName: string;
  formStackClassName: string;
  alertClassName: string;
  errorSummaryLinkClassName: string;
  buttonGroupClassName: string;
  showErrorSummary: boolean;
  errorSummaryRef: RefObject<HTMLDivElement | null>;
  signedPdfError?: string;
  authorizationError?: string;
  upload: ReactNode;
  authorization: ReactNode;
  onSubmit: () => void;
  onSaveAsDraft: () => void;
  onCancel: () => void;
};

function handleSummaryLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
  event.preventDefault();
  document.getElementById(href.replace('#', ''))?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

export function FilingSubmitStep({
  currentStep,
  numberOfSteps,
  backButtonUrl,
  formIdPrefix,
  lead,
  stepIndicatorClassName,
  pageTitleClassName,
  leadClassName,
  formStackClassName,
  alertClassName,
  errorSummaryLinkClassName,
  buttonGroupClassName,
  showErrorSummary,
  errorSummaryRef,
  signedPdfError,
  authorizationError,
  upload,
  authorization,
  onSubmit,
  onSaveAsDraft,
  onCancel,
}: FilingSubmitStepProps) {
  const signedPdfId = `${formIdPrefix}-signed-pdf`;
  const authorizationId = `${formIdPrefix}-authorization`;

  return (
    <>
      <div className={stepIndicatorClassName}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl={backButtonUrl}
          currentStep={currentStep}
          numberOfSteps={numberOfSteps}
        />
      </div>

      <div className="ontario-row">
        <div className="ontario-columns ontario-small-12 ontario-medium-8">
          {showErrorSummary && (signedPdfError || authorizationError) ? (
            <div ref={errorSummaryRef} className={alertClassName} tabIndex={-1}>
              <OntarioPageAlert type="error" heading="There is a problem">
                <p>Errors were found on this page:</p>
                <ul>
                  {signedPdfError ? (
                    <li>
                      <a
                        className={errorSummaryLinkClassName}
                        href={`#${signedPdfId}`}
                        onClick={(event) => handleSummaryLinkClick(event, `#${signedPdfId}`)}
                      >
                        {signedPdfError}
                      </a>
                    </li>
                  ) : null}
                  {authorizationError ? (
                    <li>
                      <a
                        className={errorSummaryLinkClassName}
                        href={`#${authorizationId}`}
                        onClick={(event) =>
                          handleSummaryLinkClick(event, `#${authorizationId}`)
                        }
                      >
                        {authorizationError}
                      </a>
                    </li>
                  ) : null}
                </ul>
              </OntarioPageAlert>
            </div>
          ) : null}

          <h1 className={`ontario-h1 ${pageTitleClassName}`}>Submit</h1>
          <p className={leadClassName}>{lead}</p>

          <div className={formStackClassName}>
            <section
              id={signedPdfId}
              className={reviewStyles.pdfSection}
              aria-label="Signed PDF"
            >
              <div className={reviewStyles.pdfSectionBody}>
                <div className={reviewStyles.pdfStep}>{upload}</div>
              </div>
            </section>

            <section
              id={authorizationId}
              className={reviewStyles.authSection}
              aria-label="Authorization"
            >
              {authorization}
            </section>
          </div>

          <div className={buttonGroupClassName}>
            <OntarioButton
              type="primary"
              htmlType="button"
              label="Submit"
              onClick={onSubmit}
            />
            <OntarioButton
              type="secondary"
              htmlType="button"
              label="Save as draft"
              onClick={onSaveAsDraft}
            />
            <OntarioButton
              type="tertiary"
              htmlType="button"
              label="Cancel"
              onClick={onCancel}
            />
          </div>
        </div>
      </div>
    </>
  );
}
