import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioIconAddAlt,
  OntarioIconDelete,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import {
  formatIncorporatorFullName,
  formatIncorporatorListDescription,
  validateIncorporator,
} from './Form2IncorporatorEditor';
import { FieldErrorMessage } from './FieldErrorMessage';
import {
  createEmptyDirector,
  createSeedStep1,
  EMPTY_STEP2,
  EMPTY_STEP3,
  EMPTY_STEP4,
  EMPTY_STEP5,
  EMPTY_STEP6,
  EMPTY_STEP7,
  hasForm2Step1Data,
  INCORPORATOR_INFO,
  readForm2Draft,
  saveForm2Draft,
  syncIncorporatorsFromDirectors,
  upsertForm2Step7,
  type Form2Draft,
  type Form2Step7Data,
  hasForm2Step2Data,
} from './form2DraftStorage';
import styles from './Form2Step1.module.scss';
import step4Styles from './Form2Step4.module.scss';

const CURRENT_STEP = 8;
const TOTAL_STEPS = 9;

const MIN_INCORPORATORS = 3;
const MIN_WORKER_INCORPORATORS = 5;
const WORKER_COOPERATIVE = 'Worker Co-operative';
const INCORPORATOR_COUNT_INFO =
  'All co-operative sub-types require at least 3 incorporators. The Worker Co-operative sub-type requires at least 5 incorporators.';
const AT_LEAST_ONE = 'At least one incorporator must be added.';
const INCOMPLETE_DETAILS =
  'Complete the required details for each incorporator before continuing.';

/** Minimum count applies only when a co-operative sub-type was selected on step 3. */
function incorporatorsCountError(
  count: number,
  cooperativeSubtype: string,
): string | undefined {
  const subtype = cooperativeSubtype.trim();
  if (!subtype) {
    return count === 0 ? AT_LEAST_ONE : undefined;
  }
  if (subtype === WORKER_COOPERATIVE) {
    return count < MIN_WORKER_INCORPORATORS
      ? 'At least 5 incorporators are required to incorporate a Worker Co-operative.'
      : undefined;
  }
  return count < MIN_INCORPORATORS
    ? 'At least 3 incorporators are required.'
    : undefined;
}

type PageFieldKey = 'incorporators';
type PageErrors = Partial<Record<PageFieldKey, string>>;

const FIELD_ANCHORS: Record<PageFieldKey, string> = {
  incorporators: 'incorporators-list',
};

/** Prototype deep-link: seed Steps 1–6 so /form-2/step-8 opens from the playground. */
function ensureStep7Draft(): Form2Draft {
  const existing = readForm2Draft();
  if (
    hasForm2Step1Data(existing?.step1) &&
    hasForm2Step2Data(existing.step2) &&
    existing.step3.streetNumber &&
    existing.step4.directors.length > 0 &&
    existing.step5.membershipFee.trim()
  ) {
    const incorporators = syncIncorporatorsFromDirectors(
      existing.step4.directors,
      existing.step7?.incorporators ?? [],
    );
    const draft: Form2Draft = {
      ...existing,
      step5: { ...EMPTY_STEP5, ...(existing.step5 ?? {}) },
      step6: { ...EMPTY_STEP6, ...(existing.step6 ?? {}) },
      step7: { incorporators },
    };
    saveForm2Draft(draft);
    return draft;
  }

  const seedDirector = createEmptyDirector('seed-director-1');
  seedDirector.firstName = 'Alex';
  seedDirector.lastName = 'Rivera';
  seedDirector.email = 'alex.rivera@example.com';
  seedDirector.residentCanadian = 'yes';
  seedDirector.alsoIncorporator = 'yes';
  seedDirector.numberOfShares = '100';
  seedDirector.classDesignation = 'Common';
  seedDirector.amountToBePaid = '1000.00';
  seedDirector.address = {
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
  };

  const directors =
    existing?.step4?.directors?.length ? existing.step4.directors : [seedDirector];

  const now = new Date().toISOString();
  const seeded: Form2Draft = {
    step1: createSeedStep1(),
    step2: {
      ...EMPTY_STEP2,
      cooperativeSubtype: 'Worker Co-operative',
      primaryActivity: '4521 - Department stores',
      email: 'registry@greeninstitute.coop',
      confirmEmail: 'registry@greeninstitute.coop',
    },
    step3: {
      ...EMPTY_STEP3,
      enterManually: true,
      streetNumber: '100',
      streetName: 'Queen',
      streetType: 'St',
      streetDirection: 'W',
      cityTown: 'Toronto',
      province: 'Ontario',
      postalCode: 'M5H 2N2',
      country: 'Canada',
      municipalityStatus: 'City',
      municipalityName: 'Toronto',
      countyStatus: 'Regional Municipality',
      countyName: 'Toronto',
    },
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
    savedAt: now,
    mode: 'continue',
    lastCompletedStep: 6,
  };
  saveForm2Draft(seeded);
  return seeded;
}

export function Form2Step7() {
  const navigate = useNavigate();
  const draft = ensureStep7Draft();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [step7, setStep7] = useState<Form2Step7Data>(() => ({
    incorporators: syncIncorporatorsFromDirectors(
      draft.step4.directors,
      draft.step7?.incorporators ?? EMPTY_STEP7.incorporators,
    ),
  }));
  const [errors, setErrors] = useState<PageErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const errorSummaryItems = useMemo(
    () =>
      errors.incorporators
        ? [
            {
              key: 'incorporators' as const,
              message: errors.incorporators,
              href: `#${FIELD_ANCHORS.incorporators}`,
            },
          ]
        : [],
    [errors],
  );

  function clearError(key: PageFieldKey) {
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function persistStep7(next: Form2Step7Data) {
    upsertForm2Step7(next, 'continue', 6);
  }

  function validatePage(): PageErrors {
    const page: PageErrors = {};
    const countError = incorporatorsCountError(
      step7.incorporators.length,
      draft.step2.cooperativeSubtype,
    );
    if (countError) {
      page.incorporators = countError;
      return page;
    }

    const incomplete = step7.incorporators.some(
      (entry) => Object.keys(validateIncorporator(entry)).length > 0,
    );
    if (incomplete) {
      page.incorporators = INCOMPLETE_DETAILS;
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

    upsertForm2Step7(step7, 'continue', 7);
    navigate('/form-2/step-9');
  }

  function handleSaveAsDraft() {
    upsertForm2Step7(
      step7,
      'draft',
      draft.lastCompletedStep >= 7 ? 7 : draft.lastCompletedStep >= 6 ? 6 : 5,
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

  function startAddSubflow() {
    clearError('incorporators');
    persistStep7(step7);
    navigate('/form-2/step-8/incorporators/new');
  }

  function editIncorporator(id: string) {
    persistStep7(step7);
    navigate(`/form-2/step-8/incorporators/${id}`);
  }

  function removeIncorporator(id: string) {
    setStep7((prev) => {
      const next = {
        incorporators: prev.incorporators.filter((entry) => entry.id !== id),
      };
      persistStep7(next);
      return next;
    });
    clearError('incorporators');
  }

  function handleSummaryLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    document.getElementById(href.replace('#', ''))?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-2/step-7"
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Incorporators</h1>
          <p className={styles.lead}>{INCORPORATOR_INFO}</p>

          <div className={styles.alert}>
            <OntarioPageAlert
              type="informational"
              heading="Number of incorporators"
              content={INCORPORATOR_COUNT_INFO}
            />
          </div>

          <div className={styles.formStack}>
            <div id={FIELD_ANCHORS.incorporators} className={step4Styles.directorsSection}>
              <FieldErrorMessage message={errors.incorporators} />

              {step7.incorporators.length > 0 ? (
                <ul className={step4Styles.summaryList}>
                  {step7.incorporators.map((entry) => {
                    const name =
                      entry.type === 'corporation'
                        ? entry.corporationName || 'Corporation'
                        : formatIncorporatorFullName(entry) || 'Incorporator';
                    const linked = Boolean(entry.linkedDirectorId);
                    const linkedDirector = linked
                      ? draft.step4.directors.find(
                          (director) => director.id === entry.linkedDirectorId,
                        )
                      : null;
                    const description = formatIncorporatorListDescription(
                      entry,
                      linkedDirector,
                    );
                    const detailsLine = [
                      linked ? 'First director' : '',
                      description.details,
                    ]
                      .filter(Boolean)
                      .join(' · ');
                    return (
                      <li key={entry.id} className={step4Styles.summaryItem}>
                        <div className={step4Styles.summaryMain}>
                          <button
                            type="button"
                            className={step4Styles.summaryTitle}
                            onClick={() => editIncorporator(entry.id)}
                          >
                            {name}
                          </button>
                          <div className={step4Styles.summaryDescription}>
                            <div>{detailsLine}</div>
                            {description.address ? (
                              <div>{description.address}</div>
                            ) : null}
                          </div>
                        </div>
                        {!linked ? (
                          <button
                            type="button"
                            className={step4Styles.summaryRemove}
                            onClick={() => removeIncorporator(entry.id)}
                            aria-label={`Remove ${name}`}
                          >
                            <OntarioIconDelete colour="blue" iconWidth={24} isDecorative />
                            Remove
                          </button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : null}

              <div
                className={
                  step7.incorporators.length === 0
                    ? `${step4Styles.addActions} ${step4Styles.addActionsAlone}`
                    : step4Styles.addActions
                }
              >
                <button
                  type="button"
                  className={step4Styles.addLink}
                  onClick={startAddSubflow}
                >
                  <OntarioIconAddAlt colour="blue" iconWidth={24} isDecorative />
                  Add an Incorporator
                </button>
              </div>
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
              label="Save as Draft"
              onClick={handleSaveAsDraft}
            />
            <OntarioButton
              type="tertiary"
              htmlType="button"
              label="Cancel/Exit"
              onClick={handleCancel}
            />
          </div>
        </div>
      </div>
    </>
  );
}
