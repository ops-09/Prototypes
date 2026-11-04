import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContinuanceReviewReturn } from './continuanceReviewReturn';
import {
  OntarioButton,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import {
  COOPERATIVE_NAME_REQUIRED_ERROR,
  NAME_VALIDATION_ERROR,
  validateCooperativeName,
} from '../form2/nameValidation';
import { syncDateFieldByAnchor } from '../form7/dateErrorSync';
import {
  nuansDateErrorKey,
  ProposedNameAndNuans,
  validateNameNuansFields,
  type NameNuansErrors,
} from '../form7/ProposedNameAndNuans';
import {
  CONTINUANCE_MAX_NUANS_REPORTS,
  CONTINUANCE_NAME_VALIDATION_ERROR,
  CONTINUANCE_NUANS_DATE_HINT,
  CONTINUANCE_NUANS_EXPIRED_ERROR,
  CONTINUANCE_PROPOSED_NAME_LEAD,
  CONTINUANCE_TOTAL_STEPS,
  ensureContinuanceStep3Draft,
  OBR_CORPORATION_NAME,
  readContinuanceDraft,
  upsertContinuanceStep3,
  type ContinuanceFormId,
  type ContinuanceStep3Data,
} from './continuanceDraftStorage';
import styles from '../form2/Form2Step1.module.scss';

const CURRENT_STEP = 3;

type FieldErrors = NameNuansErrors;

function validateContinuanceCooperativeName(value: string): string | undefined {
  const error = validateCooperativeName(value);
  if (!error) {
    return undefined;
  }
  if (error === NAME_VALIDATION_ERROR || error === COOPERATIVE_NAME_REQUIRED_ERROR) {
    return CONTINUANCE_NAME_VALIDATION_ERROR;
  }
  return error;
}

function idPrefix(formId: ContinuanceFormId) {
  return `form${formId}-name`;
}

function nameNuansErrorHref(key: string, reports: ContinuanceStep3Data['nuansReports'], prefix: string) {
  if (key === 'proposedName') {
    return `#${prefix}-proposed-name`;
  }
  if (key.startsWith('nuansFile:')) {
    const reportId = key.slice('nuansFile:'.length);
    return `#${prefix}-nuans-file-${reportId}`;
  }
  if (key.startsWith('nuansDate:')) {
    const reportId = key.slice('nuansDate:'.length);
    return `#${prefix}-nuans-date-${reportId}`;
  }
  const firstId = reports[0]?.id;
  return firstId ? `#${prefix}-nuans-date-${firstId}` : `#${prefix}-proposed-name`;
}

function focusField(anchorId: string) {
  const target = document.getElementById(anchorId);
  if (!target) {
    return;
  }
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const focusable = target.matches('input, select, textarea, button, a, [tabindex]')
    ? target
    : target.querySelector<HTMLElement>(
        'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
      );
  focusable?.focus({ preventScroll: true });
}

type ContinuanceStep3Props = {
  formId: ContinuanceFormId;
};

export function ContinuanceStep3({ formId }: ContinuanceStep3Props) {
  const navigate = useNavigate();
  const { afterSave } = useContinuanceReviewReturn(formId);
  const draft = ensureContinuanceStep3Draft(formId);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const dateErrorsRef = useRef<FieldErrors>({});
  const prefix = idPrefix(formId);
  const backHref = `/form-${formId}/step-2`;
  const continueHref = `/form-${formId}/step-4`;
  const draftSummaryHref = `/form-${formId}/draft-summary`;

  const [step3, setStep3] = useState<ContinuanceStep3Data>(() => ({
    proposedName: draft.step3.proposedName,
    nuansReports: draft.step3.nuansReports,
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const errorSummaryItems = useMemo(() => {
    const items: { key: string; message: string; href: string }[] = [];
    if (errors.proposedName) {
      items.push({
        key: 'proposedName',
        message: errors.proposedName,
        href: nameNuansErrorHref('proposedName', step3.nuansReports, prefix),
      });
    }
    step3.nuansReports.forEach((report) => {
      const fileKey = `nuansFile:${report.id}` as const;
      const dateKey = nuansDateErrorKey(report.id);
      if (errors[fileKey]) {
        items.push({
          key: fileKey,
          message: errors[fileKey] ?? '',
          href: nameNuansErrorHref(fileKey, step3.nuansReports, prefix),
        });
      }
      if (errors[dateKey]) {
        items.push({
          key: dateKey,
          message: errors[dateKey] ?? '',
          href: nameNuansErrorHref(dateKey, step3.nuansReports, prefix),
        });
      }
    });
    return items;
  }, [errors, prefix, step3.nuansReports]);

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
    for (const report of step3.nuansReports) {
      syncDateFieldByAnchor(`${prefix}-nuans-date-${report.id}`, nextErrors[nuansDateErrorKey(report.id)]);
    }
  }

  function validateAll(): FieldErrors {
    return validateNameNuansFields(
      step3,
      'cooperative',
      validateContinuanceCooperativeName,
      {
        expiredError: CONTINUANCE_NUANS_EXPIRED_ERROR,
        emptyNameError: CONTINUANCE_NAME_VALIDATION_ERROR,
      },
    );
  }

  function handleContinue() {
    const nextErrors = validateAll();
    dateErrorsRef.current = nextErrors;
    setErrors(nextErrors);
    const hasErrors = Object.keys(nextErrors).length > 0;
    setShowErrorSummary(hasErrors);

    window.requestAnimationFrame(() => syncDateErrors(nextErrors));

    if (hasErrors) {
      window.requestAnimationFrame(() => {
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }

    upsertContinuanceStep3(formId, step3, 'continue');
    navigate(afterSave(continueHref));
  }

  function handleSaveAsDraft() {
    const existing = readContinuanceDraft(formId);
    upsertContinuanceStep3(formId, step3, 'draft', existing?.lastCompletedStep ?? 0);
    navigate(draftSummaryHref);
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
          backButtonUrl={backHref}
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Co-operative name</h1>

          <div className={styles.formStack}>
            {/* ODS has no read-only input — composed from tokens used by Form 2 field labels. */}
            <div>
              <p className={styles.naicsLabel}>The name of the corporation is:</p>
              <p className={styles.naicsSelectedValue}>{OBR_CORPORATION_NAME}</p>
            </div>

            <p className={styles.body}>
              The corporation is to be continued as a co-operative under the name:
            </p>

            <ProposedNameAndNuans
              idPrefix={prefix}
              nameKind="cooperative"
              proposedNameCaption="New co-operative name"
              leadText={[...CONTINUANCE_PROPOSED_NAME_LEAD]}
              maxReports={CONTINUANCE_MAX_NUANS_REPORTS}
              nuansDateHint={CONTINUANCE_NUANS_DATE_HINT}
              nameRequiredMessage={CONTINUANCE_NAME_VALIDATION_ERROR}
              value={step3}
              errors={errors}
              dateValidatorFor={dateValidatorFor}
              onChange={setStep3}
              onClearError={clearError}
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
