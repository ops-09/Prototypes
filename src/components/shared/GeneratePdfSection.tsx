import { OntarioButton, OntarioPageAlert } from '@ongov/ontario-design-system-component-library-react';
import reviewStyles from '../form7/Form7Step4.module.scss';

type GeneratePdfSectionProps = {
  idPrefix: string;
  onGenerate: () => void;
  pdfBlocked: boolean;
  pdfGenerated: boolean;
  bodyText?: string;
  successContent?: string;
};

export function GeneratePdfSection({
  idPrefix,
  onGenerate,
  pdfBlocked,
  pdfGenerated,
  bodyText = 'Generate a PDF of the information prepared for this filing. Print or save the PDF, then sign it. Continue to the next step to upload the signed copy and authorize the filing.',
  successContent = 'Sign the PDF, then continue to upload the signed copy and authorize the filing.',
}: GeneratePdfSectionProps) {
  return (
    <section
      id={`${idPrefix}-generate-pdf`}
      className={reviewStyles.pdfSection}
      aria-labelledby={`${idPrefix}-generate-pdf-heading`}
    >
      <h2 id={`${idPrefix}-generate-pdf-heading`} className={reviewStyles.sectionHeading}>
        Generate PDF
      </h2>
      <div className={reviewStyles.pdfSectionBody}>
        <div className={reviewStyles.pdfStep}>
          <p className={reviewStyles.pdfStepText}>{bodyText}</p>
          <OntarioButton
            type="secondary"
            htmlType="button"
            label="Generate PDF"
            onClick={onGenerate}
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
              content={successContent}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
