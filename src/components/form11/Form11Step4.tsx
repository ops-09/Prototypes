import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioDropdownList,
  OntarioPageAlert,
  OntarioRadioButtons,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { validateNfpCorporationName } from '../form7/corpNameValidation';
import { syncDateFieldByAnchor } from '../form7/dateErrorSync';
import { emptyNameNuans } from '../form7/form7DraftStorage';
import {
  nuansDateErrorKey,
  ProposedNameAndNuans,
  validateNameNuansFields,
  type NameNuansErrors,
} from '../form7/ProposedNameAndNuans';
import { focusField, getEventValue } from './form11Focus';
import {
  FORM11_TOTAL_STEPS,
  MIN_AMALGAMATING_NFPS,
  readForm11Draft,
  upsertForm11Step4,
  type Form11NameChangeChoice,
  type Form11Step4Data,
} from './form11DraftStorage';
import styles from './Form11Step2.module.scss';

const CURRENT_STEP = 4;
const ID_PREFIX = 'form11-name';
const SELECT_NAME_ERROR =
  'Select the name that will be used for the amalgamated not-for-profit corporation.';

type FieldErrors = NameNuansErrors &
  Partial<{
    changeName: string;
    selectedAmalgamatedCorporationId: string;
  }>;

function isStep4Ready() {
  const existing = readForm11Draft();
  return Boolean(
    existing?.step2.email &&
      existing.step3.corporations.filter((entry) => entry.legalName.trim()).length >=
        MIN_AMALGAMATING_NFPS,
  );
}

export function Form11Step4() {
  const navigate = useNavigate();
  const draft = readForm11Draft();
  const ready = isStep4Ready();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const dateErrorsRef = useRef<FieldErrors>({});

  const [step4, setStep4] = useState<Form11Step4Data>(() => ({
    changeName: draft?.step4.changeName ?? '',
    nameNuans: draft?.step4.nameNuans ?? emptyNameNuans(),
    selectedAmalgamatedCorporationId:
      draft?.step4.selectedAmalgamatedCorporationId ?? '',
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  dateErrorsRef.current = errors;

  const changeNameOptions = useMemo(
    () => [
      { value: 'yes', elementId: 'form11-name-change-yes', label: 'Yes' },
      { value: 'no', elementId: 'form11-name-change-no', label: 'No' },
    ],
    [],
  );

  const amalgamatingNameOptions = useMemo(
    () =>
      (draft?.step3.corporations ?? [])
        .filter((entry) => entry.legalName.trim())
        .map((entry) => ({
          value: entry.id,
          label: entry.legalName.trim(),
        })),
    [draft?.step3.corporations],
  );

  const errorSummaryItems = useMemo(() => {
    const items: { key: string; message: string; href: string }[] = [];
    if (errors.changeName) {
      items.push({
        key: 'changeName',
        message: errors.changeName,
        href: '#change-nfp-name',
      });
    }
    if (errors.selectedAmalgamatedCorporationId) {
      items.push({
        key: 'selectedAmalgamatedCorporationId',
        message: errors.selectedAmalgamatedCorporationId,
        href: '#amalgamated-nfp-name',
      });
    }
    if (errors.proposedName) {
      items.push({
        key: 'proposedName',
        message: errors.proposedName,
        href: `#${ID_PREFIX}-proposed-name`,
      });
    }
    step4.nameNuans.nuansReports.forEach((report) => {
      const fileKey = `nuansFile:${report.id}` as const;
      const dateKey = `nuansDate:${report.id}` as const;
      if (errors[fileKey]) {
        items.push({
          key: fileKey,
          message: errors[fileKey] ?? '',
          href: `#${ID_PREFIX}-nuans-file-${report.id}`,
        });
      }
      if (errors[dateKey]) {
        items.push({
          key: dateKey,
          message: errors[dateKey] ?? '',
          href: `#${ID_PREFIX}-nuans-date-${report.id}`,
        });
      }
    });
    return items;
  }, [errors, step4.nameNuans.nuansReports]);

  function clearError(key: keyof FieldErrors | string) {
    setErrors((prev) => {
      if (!prev[key as keyof FieldErrors]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key as keyof FieldErrors];
      dateErrorsRef.current = next;
      if (String(key).startsWith('nuansDate:')) {
        window.requestAnimationFrame(() => syncDateErrors(next));
      }
      return next;
    });
  }

  function patchStep4(partial: Partial<Form11Step4Data>) {
    setStep4((prev) => ({ ...prev, ...partial }));
  }

  function dateValidatorFor(reportId: string) {
    return (_day: string, _month: string, _year: string) => {
      const message = dateErrorsRef.current[nuansDateErrorKey(reportId)];
      if (message) {
        return {
          errorMessage: message,
          dayInvalid: true,
          monthInvalid: true,
          yearInvalid: true,
        };
      }
      return {
        errorMessage: '',
        dayInvalid: false,
        monthInvalid: false,
        yearInvalid: false,
      };
    };
  }

  function syncDateErrors(nextErrors: FieldErrors) {
    for (const report of step4.nameNuans.nuansReports) {
      syncDateFieldByAnchor(
        `${ID_PREFIX}-nuans-date-${report.id}`,
        nextErrors[nuansDateErrorKey(report.id)],
      );
    }
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!step4.changeName) {
      next.changeName = 'Select Yes or No.';
    } else if (step4.changeName === 'yes') {
      Object.assign(
        next,
        validateNameNuansFields(step4.nameNuans, 'nfp', validateNfpCorporationName),
      );
    } else if (step4.changeName === 'no') {
      const selected = draft?.step3.corporations.find(
        (entry) =>
          entry.id === step4.selectedAmalgamatedCorporationId && entry.legalName.trim(),
      );
      if (!selected) {
        next.selectedAmalgamatedCorporationId = SELECT_NAME_ERROR;
      }
    }
    return next;
  }

  function handleContinue() {
    const nextErrors = validate();
    const hasErrors = Object.keys(nextErrors).length > 0;
    setErrors(nextErrors);
    dateErrorsRef.current = nextErrors;
    setShowErrorSummary(hasErrors);
    window.requestAnimationFrame(() => {
      syncDateErrors(nextErrors);
      if (hasErrors) {
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    if (hasErrors) {
      return;
    }
    upsertForm11Step4(step4, 'continue');
    navigate('/form-11/step-5');
  }

  function handleSaveAsDraft() {
    upsertForm11Step4(step4, 'draft', readForm11Draft()?.lastCompletedStep ?? 3);
    navigate('/form-11/draft-summary');
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

  if (!ready || !draft) {
    return <Navigate to="/form-11/step-3" replace />;
  }

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-11/step-3"
          currentStep={CURRENT_STEP}
          numberOfSteps={FORM11_TOTAL_STEPS}
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
            Amalgamated not-for-profit corporation name
          </h1>
          <p className={styles.lead}>
            Specify whether the amalgamated not-for-profit corporation will use a new name
            or keep the name of one of the amalgamating corporations.
          </p>

          <div className={styles.formStack}>
            <div id="change-nfp-name">
              <OntarioRadioButtons
                caption="Will there be a name change for the Not-for-Profit corporation?"
                name="change-nfp-name"
                required
                value={step4.changeName}
                options={changeNameOptions}
                errorMessage={errors.changeName}
                customOnChange={(event) => {
                  const value = getEventValue(event) as Form11NameChangeChoice;
                  patchStep4({
                    changeName: value,
                    nameNuans: value === 'no' ? emptyNameNuans() : step4.nameNuans,
                    selectedAmalgamatedCorporationId:
                      value === 'yes' ? '' : step4.selectedAmalgamatedCorporationId,
                  });
                  clearError('changeName');
                  if (value === 'no') {
                    setErrors({});
                    dateErrorsRef.current = {};
                    window.requestAnimationFrame(() => syncDateErrors({}));
                  } else {
                    clearError('selectedAmalgamatedCorporationId');
                  }
                }}
              />
            </div>

            {step4.changeName === 'no' ? (
              <div id="amalgamated-nfp-name">
                <OntarioDropdownList
                  elementId="amalgamated-nfp-name"
                  caption="Please select the name of the amalgamated not-for-profit corporation."
                  name="amalgamated-nfp-name"
                  required
                  isEmptyStartOption
                  value={
                    amalgamatingNameOptions.some(
                      (option) => option.value === step4.selectedAmalgamatedCorporationId,
                    )
                      ? step4.selectedAmalgamatedCorporationId
                      : ''
                  }
                  options={amalgamatingNameOptions}
                  errorMessage={errors.selectedAmalgamatedCorporationId}
                  customOnChange={(event) => {
                    patchStep4({
                      selectedAmalgamatedCorporationId: getEventValue(event),
                    });
                    clearError('selectedAmalgamatedCorporationId');
                  }}
                />
              </div>
            ) : null}

            {step4.changeName === 'yes' ? (
              <ProposedNameAndNuans
                idPrefix={ID_PREFIX}
                nameKind="nfp"
                leadText="An Ontario NUANS name search report for the proposed name of the not-for-profit corporation. The search report must be submitted with the application within 90 days of the production of the report."
                value={step4.nameNuans}
                errors={errors}
                dateValidatorFor={dateValidatorFor}
                onChange={(next) => patchStep4({ nameNuans: next })}
                onClearError={clearError}
              />
            ) : null}
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
              label="Cancel"
              onClick={handleCancel}
            />
          </div>
        </div>
      </div>
    </>
  );
}
