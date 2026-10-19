import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioDateInput,
  OntarioIconAdd,
  OntarioIconDelete,
  OntarioInput,
  OntarioPageAlert,
  OntarioRadioButtons,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { FileUpload, type UploadedFileMeta } from './FileUpload';
import {
  createEmptyNuansReport,
  emptyStep1,
  MAX_NUANS_REPORTS,
  normalizeStep1,
  readForm2Draft,
  upsertForm2Step1,
  type Form2Step1Data,
  type NuansReportEntry,
  type YesNoAnswer,
} from './form2DraftStorage';
import {
  COOPERATIVE_NAME_REQUIRED_ERROR,
  toBlockCapitals,
  validateCooperativeName,
} from './nameValidation';
import { aggregateDateFromEvent } from '../form7/dateErrorSync';
import { validateNuansDate } from '../form7/nuansValidation';
import styles from './Form2Step1.module.scss';

const CURRENT_STEP = 2;
const TOTAL_STEPS = 9;

const NON_PROFIT_REQUIRED = 'Select whether this is a non-profit organization.';

const YES_NO_OPTIONS = [
  { value: 'yes', elementId: 'non-profit-yes', label: 'Yes' },
  { value: 'no', elementId: 'non-profit-no', label: 'No' },
];

type FieldErrors = Partial<{
  nonProfitOrganization: string;
  cooperativeName: string;
}> &
  Record<string, string | undefined>;

function nuansFileErrorKey(reportId: string) {
  return `nuansFile:${reportId}`;
}

function nuansDateErrorKey(reportId: string) {
  return `nuansDate:${reportId}`;
}

function getEventValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | null;
  return target?.value ?? '';
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

/**
 * OntarioDateInput only paints red field borders after blur validation when
 * `isDateTyped` is true. Force that path so submit-time errors match OntarioInput.
 */
function syncOntarioDateInputError(host: HTMLElement | null, message?: string) {
  if (!host) {
    return;
  }
  const typedHost = host as HTMLElement & { isDateTyped?: boolean };
  typedHost.isDateTyped = true;
  const input = host.shadowRoot?.querySelector('input');
  input?.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

  // Fallback: if Stencil state did not update, apply the same error chrome ODS uses.
  const root = host.shadowRoot;
  if (!root) {
    return;
  }
  const wrappers = root.querySelectorAll('.ontario-date__group-input');
  const errBox = root.querySelector('.ontario-error-messaging');
  const errContent = root.querySelector('.ontario-error-messaging__content');
  if (message) {
    wrappers.forEach((wrap) => wrap.classList.add('ontario-date--error'));
    errBox?.classList.remove('ontario-error__hidden');
    if (errContent) {
      errContent.textContent = message;
    }
  } else {
    wrappers.forEach((wrap) => wrap.classList.remove('ontario-date--error'));
    errBox?.classList.add('ontario-error__hidden');
    if (errContent) {
      errContent.textContent = '';
    }
  }
}

function syncDateFieldErrors(nextErrors: FieldErrors, reports: NuansReportEntry[]) {
  for (const report of reports) {
    const host = document
      .getElementById(`nuans-date-${report.id}`)
      ?.querySelector<HTMLElement>('ontario-date-input');
    if (!host) {
      continue;
    }
    syncOntarioDateInputError(host, nextErrors[nuansDateErrorKey(report.id)]);
  }
}

export function Form2Step1() {
  const navigate = useNavigate();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const dateErrorsRef = useRef<FieldErrors>({});
  const existing = readForm2Draft();

  const [step1, setStep1] = useState<Form2Step1Data>(() =>
    normalizeStep1(existing?.step1 ?? emptyStep1()),
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  dateErrorsRef.current = errors;

  const reports =
    step1.nuansReports.length > 0 ? step1.nuansReports : [createEmptyNuansReport()];

  const errorSummaryItems = useMemo(() => {
    const items: Array<{ key: string; message: string; href: string }> = [];
    if (errors.nonProfitOrganization) {
      items.push({
        key: 'nonProfitOrganization',
        message: errors.nonProfitOrganization,
        href: '#non-profit-organization',
      });
    }
    if (errors.cooperativeName) {
      items.push({
        key: 'cooperativeName',
        message: errors.cooperativeName,
        href: '#cooperative-name',
      });
    }
    for (const report of reports) {
      const fileKey = nuansFileErrorKey(report.id);
      const dateKey = nuansDateErrorKey(report.id);
      if (errors[fileKey]) {
        items.push({
          key: fileKey,
          message: errors[fileKey]!,
          href: `#nuans-file-${report.id}`,
        });
      }
      if (errors[dateKey]) {
        items.push({
          key: dateKey,
          message: errors[dateKey]!,
          href: `#nuans-date-${report.id}`,
        });
      }
    }
    return items;
  }, [errors, reports]);

  function patchStep1(partial: Partial<Form2Step1Data>) {
    setStep1((prev) => ({
      ...prev,
      nuansReports: reports,
      ...partial,
    }));
  }

  function updateReport(reportId: string, partial: Partial<NuansReportEntry>) {
    patchStep1({
      nuansReports: reports.map((report) =>
        report.id === reportId ? { ...report, ...partial } : report,
      ),
    });
  }

  function setReportFile(reportId: string, meta: UploadedFileMeta | null) {
    updateReport(reportId, { file: meta });
    clearError(nuansFileErrorKey(reportId));
  }

  function addReport() {
    if (reports.length >= MAX_NUANS_REPORTS) {
      return;
    }
    patchStep1({ nuansReports: [...reports, createEmptyNuansReport()] });
  }

  function removeReport(reportId: string) {
    if (reports.length <= 1) {
      return;
    }
    patchStep1({ nuansReports: reports.filter((report) => report.id !== reportId) });
    clearError(nuansFileErrorKey(reportId));
    clearError(nuansDateErrorKey(reportId));
  }

  function makeDateValidator(reportId: string) {
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

  function clearError(key: string) {
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      dateErrorsRef.current = next;
      if (key.startsWith('nuansDate:')) {
        window.requestAnimationFrame(() => syncDateFieldErrors(next, reports));
      }
      return next;
    });
  }

  function validateAll(): FieldErrors {
    const next: FieldErrors = {};
    if (!step1.nonProfitOrganization) {
      next.nonProfitOrganization = NON_PROFIT_REQUIRED;
    }
    const nameError = validateCooperativeName(step1.cooperativeName);
    if (nameError) {
      next.cooperativeName = nameError;
    }

    for (const report of reports) {
      if (!report.file) {
        next[nuansFileErrorKey(report.id)] = 'Upload a NUANS report.';
      }
      const dateError = validateNuansDate(report.date);
      if (dateError) {
        next[nuansDateErrorKey(report.id)] = dateError;
      }
    }

    return next;
  }

  function buildStep1(): Form2Step1Data {
    return {
      nonProfitOrganization: step1.nonProfitOrganization,
      cooperativeName: step1.cooperativeName,
      nuansReports: reports,
    };
  }

  function handleContinue() {
    const nextErrors = validateAll();
    dateErrorsRef.current = nextErrors;
    setErrors(nextErrors);
    const hasErrors = Object.keys(nextErrors).length > 0;
    setShowErrorSummary(hasErrors);

    if (hasErrors) {
      window.requestAnimationFrame(() => {
        syncDateFieldErrors(nextErrors, reports);
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }

    upsertForm2Step1(buildStep1(), 'continue', 1);
    navigate('/form-2/step-3');
  }

  function handleSaveAsDraft() {
    upsertForm2Step1(buildStep1(), 'draft', existing?.lastCompletedStep ?? 0);
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

  function handleSummaryLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    focusField(href.replace('#', ''));
  }

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-2/step-1"
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Co-operative name</h1>

          <p className={styles.lead}>
            Enter the co-operative&apos;s proposed name as it should appear on the official
            record (in block capital letters), and provide the NUANS report that confirms the
            name is available. Obtain your NUANS name search report before completing this
            step.
          </p>

          <p className={styles.body}>
            An Ontario NUANS name search report for the proposed name of the co-operative. The
            search report must be submitted with the application within 90 days of the
            production of the report.
          </p>
          <p className={styles.body}>
            The name of the co-operative must have “CO-OPERATIVE” or “COOPÉRATIVE” in the
            name. The name of the co-operative must end with one of the following legal
            elements: “INCORPORATED”, “INCORPORÉE”, “CORPORATION”, “LIMITED”, “LIMITÉE”,
            “INC.”, “CORP.”, “LTD.” or “LTÉE”.
          </p>

          <div className={styles.formStack}>
            <div id="non-profit-organization">
              <OntarioRadioButtons
                caption="Is this a non profit organization?"
                name="non-profit-organization"
                required
                value={step1.nonProfitOrganization}
                options={YES_NO_OPTIONS}
                errorMessage={errors.nonProfitOrganization}
                customOnChange={(event) => {
                  patchStep1({
                    nonProfitOrganization: getEventValue(event) as YesNoAnswer,
                  });
                  clearError('nonProfitOrganization');
                }}
              />
            </div>

            <OntarioInput
              elementId="cooperative-name"
              caption="Co-operative name (proposed)"
              name="cooperative-name"
              required
              requiredValidationMessage={COOPERATIVE_NAME_REQUIRED_ERROR}
              hintText="Enter the name in block capital letters, as it should appear on the official record. Example: GREEN INSTITUTE CO-OPERATIVE INC."
              value={step1.cooperativeName}
              errorMessage={errors.cooperativeName}
              customOnInput={(event) => {
                patchStep1({ cooperativeName: getEventValue(event) });
                clearError('cooperativeName');
              }}
              customOnBlur={(event) =>
                patchStep1({ cooperativeName: toBlockCapitals(getEventValue(event)) })
              }
            />

            {reports.map((report, index) => {
              const ordinal = reports.length > 1 ? ` ${index + 1}` : '';
              const fileKey = nuansFileErrorKey(report.id);
              const dateKey = nuansDateErrorKey(report.id);

              return (
                <div key={report.id} className={styles.nuansReportBlock}>
                  {index > 0 ? <hr className={styles.nuansReportDivider} /> : null}
                  {reports.length > 1 ? (
                    <div className={styles.nuansReportHeader}>
                      <h2 className={`ontario-h4 ${styles.nuansReportHeading}`}>
                        NUANS report{ordinal}
                      </h2>
                      <button
                        type="button"
                        className={styles.removeLink}
                        onClick={() => removeReport(report.id)}
                        aria-label={`Remove NUANS report ${index + 1}`}
                      >
                        <OntarioIconDelete colour="blue" iconWidth={24} isDecorative />
                        Remove
                      </button>
                    </div>
                  ) : null}

                  <FileUpload
                    label={
                      reports.length > 1
                        ? `Upload NUANS report${ordinal}`
                        : 'Upload NUANS report'
                    }
                    required
                    hintText="Upload the NUANS report that confirms the proposed name is available."
                    value={report.file}
                    errorMessage={errors[fileKey]}
                    onChange={(meta) => setReportFile(report.id, meta)}
                    inputId={`nuans-file-${report.id}`}
                  />

                  <div id={`nuans-date-${report.id}`}>
                    <OntarioDateInput
                      elementId={`nuans-date-${report.id}-input`}
                      caption={
                        reports.length > 1
                          ? `NUANS report${ordinal} date`
                          : 'NUANS report date'
                      }
                      required
                      value={report.date || undefined}
                      dateValidator={makeDateValidator(report.id)}
                      onInputOnInput={(event) => {
                        const next = aggregateDateFromEvent(event);
                        if (next !== null) {
                          updateReport(report.id, { date: next });
                        }
                        clearError(dateKey);
                      }}
                      onInputOnChange={(event) => {
                        const next = aggregateDateFromEvent(event);
                        if (next !== null) {
                          updateReport(report.id, { date: next });
                        }
                        clearError(dateKey);
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {reports.length < MAX_NUANS_REPORTS ? (
              <div className={styles.addActions}>
                <button type="button" className={styles.addLink} onClick={addReport}>
                  <OntarioIconAdd colour="blue" iconWidth={24} isDecorative />
                  Add another NUANS report
                </button>
              </div>
            ) : (
              <p className={styles.nuansMaxNote}>
                You can upload up to {MAX_NUANS_REPORTS} NUANS reports. Remove a report to
                add another.
              </p>
            )}
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
              label="Cancel / Exit"
              onClick={handleCancel}
            />
          </div>
        </div>
      </div>
    </>
  );
}
