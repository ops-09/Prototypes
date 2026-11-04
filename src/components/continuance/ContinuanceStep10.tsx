import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { Form7SummaryList } from '../form7/Form7SummaryList';
import { focusField } from './continuanceFocus';
import {
  buildContinuanceReviewSections,
  type ReviewSectionKey,
} from './continuanceReviewModel';
import {
  CONTINUANCE_FILING_TITLE,
  CONTINUANCE_TOTAL_STEPS,
  ensureContinuanceStep10Draft,
  readContinuanceDraft,
  upsertContinuanceReview,
  type ContinuanceFormId,
} from './continuanceDraftStorage';
import styles from '../form2/Form2Step1.module.scss';

const CURRENT_STEP = 10;
const INCOMPLETE_ERROR =
  'One or more sections are incomplete. Use Change to correct the information before continuing.';

const SECTION_ORDER: ReviewSectionKey[] = [
  'contact',
  'corporationDetails',
  'cooperativeName',
  'originalAct',
  'headOffice',
  'directors',
  'restrictions',
  'membership',
  'declarations',
];

type ContinuanceStep10Props = {
  formId: ContinuanceFormId;
};

export function ContinuanceStep10({ formId }: ContinuanceStep10Props) {
  const navigate = useNavigate();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const draft = ensureContinuanceStep10Draft(formId);
  const [errors, setErrors] = useState<Partial<{ sections: string }>>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const sections = useMemo(
    () => buildContinuanceReviewSections(formId, draft),
    [draft, formId],
  );
  const incompleteKeys = useMemo(
    () => new Set(sections.filter((section) => !section.complete).map((section) => section.key)),
    [sections],
  );
  const firstIncompleteKey =
    SECTION_ORDER.find((key) => incompleteKeys.has(key)) ?? 'contact';

  const errorSummaryItems = errors.sections
    ? [{ key: 'sections', message: errors.sections, href: `#review-${firstIncompleteKey}` }]
    : [];

  function handleContinue() {
    const hasErrors = incompleteKeys.size > 0;
    setErrors(hasErrors ? { sections: INCOMPLETE_ERROR } : {});
    setShowErrorSummary(hasErrors);
    if (hasErrors) {
      window.requestAnimationFrame(() => {
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }
    upsertContinuanceReview(formId, 'continue');
  }

  function handleSaveAsDraft() {
    upsertContinuanceReview(
      formId,
      'draft',
      readContinuanceDraft(formId)?.lastCompletedStep ?? 9,
    );
    navigate(`/form-${formId}/draft-summary`);
  }

  function handleCancel() {
    const leave = window.confirm('Leave this filing without saving further changes?');
    if (leave) {
      navigate('/');
    }
  }

  function handleSummaryLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    focusField(href.replace('#', ''));
  }

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl={`/form-${formId}/step-9`}
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Review</h1>
          <p className={styles.lead}>
            Review the information entered for this {CONTINUANCE_FILING_TITLE[formId]} filing.
            Use Change to update a section. The page shows the latest saved information.
          </p>

          <div className={styles.formStack}>
            {sections.map((section) => (
              <div
                key={section.key}
                id={`review-${section.key}`}
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
