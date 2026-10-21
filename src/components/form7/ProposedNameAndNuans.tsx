import {
  OntarioDateInput,
  OntarioIconAdd,
  OntarioIconDelete,
  OntarioInput,
} from '@ongov/ontario-design-system-component-library-react';
import { FileUpload, type UploadedFileMeta } from '../form1/FileUpload';
import { COOPERATIVE_NAME_REQUIRED_ERROR } from '../form1/nameValidation';
import { aggregateDateFromEvent } from './dateErrorSync';
import {
  createEmptyNuansReport,
  MAX_NUANS_REPORTS,
  type NameNuansFields,
  type NuansReportEntry,
} from './form7DraftStorage';
import { validateNuansDate } from './nuansValidation';
import styles from './Form7Step1.module.scss';

export type NameNuansErrors = Partial<{
  proposedName: string;
}> & {
  /** Per-report file errors keyed as `nuansFile:<reportId>`. */
  [key: `nuansFile:${string}`]: string | undefined;
  /** Per-report date errors keyed as `nuansDate:<reportId>`. */
  [key: `nuansDate:${string}`]: string | undefined;
};

export function nuansFileErrorKey(reportId: string): `nuansFile:${string}` {
  return `nuansFile:${reportId}`;
}

export function nuansDateErrorKey(reportId: string): `nuansDate:${string}` {
  return `nuansDate:${reportId}`;
}

type ProposedNameAndNuansProps = {
  idPrefix: string;
  nameKind: 'cooperative' | 'corporation' | 'nfp';
  /** One or more lead paragraphs shown above the proposed name field. */
  leadText?: string | readonly string[];
  /** Overrides the default proposed-name caption. */
  proposedNameCaption?: string;
  /** Optional second proposed-name field (English/French used separately). */
  secondaryName?: {
    elementId: string;
    caption: string;
    hintText?: string;
    value: string;
    errorMessage?: string;
    onInput: (value: string) => void;
    onBlur: (value: string) => void;
  };
  value: NameNuansFields;
  errors: NameNuansErrors;
  dateValidatorFor: (reportId: string) => (
    day: string,
    month: string,
    year: string,
  ) => {
    errorMessage?: string;
    dayInvalid?: boolean;
    monthInvalid?: boolean;
    yearInvalid?: boolean;
  };
  onChange: (next: NameNuansFields) => void;
  onClearError: (key: keyof NameNuansErrors | string) => void;
};

function getEventValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | null;
  return target?.value ?? '';
}

function toBlockCapitals(value: string) {
  return value.toUpperCase();
}

export function ProposedNameAndNuans({
  idPrefix,
  nameKind,
  leadText,
  proposedNameCaption,
  secondaryName,
  value,
  errors,
  dateValidatorFor,
  onChange,
  onClearError,
}: ProposedNameAndNuansProps) {
  const isCoop = nameKind === 'cooperative';
  const isNfp = nameKind === 'nfp';
  const reports =
    value.nuansReports.length > 0 ? value.nuansReports : [createEmptyNuansReport()];

  const singleNameCaption = isCoop
    ? 'New Co-operative Name (Proposed)'
    : isNfp
      ? 'New Not-for-Profit Corporation Name (Proposed)'
      : 'New Corporation Name (Proposed)';

  function patch(partial: Partial<NameNuansFields>) {
    onChange({ ...value, nuansReports: reports, ...partial });
  }

  function updateReport(reportId: string, partial: Partial<NuansReportEntry>) {
    patch({
      nuansReports: reports.map((report) =>
        report.id === reportId ? { ...report, ...partial } : report,
      ),
    });
  }

  function setReportFile(reportId: string, meta: UploadedFileMeta | null) {
    updateReport(reportId, { file: meta });
    onClearError(nuansFileErrorKey(reportId));
  }

  function addReport() {
    if (reports.length >= MAX_NUANS_REPORTS) {
      return;
    }
    patch({ nuansReports: [...reports, createEmptyNuansReport()] });
  }

  function removeReport(reportId: string) {
    if (reports.length <= 1) {
      return;
    }
    patch({ nuansReports: reports.filter((report) => report.id !== reportId) });
    onClearError(nuansFileErrorKey(reportId));
    onClearError(nuansDateErrorKey(reportId));
  }

  function emptyMessage() {
    if (isCoop) {
      return COOPERATIVE_NAME_REQUIRED_ERROR;
    }
    if (isNfp) {
      return 'Enter the Not-for-Profit corporation name.';
    }
    return 'Enter the corporation name.';
  }

  function nameHintText() {
    if (isCoop) {
      return 'Enter the name in block capital letters, as it should appear on the official record. Example: GREEN INSTITUTE CO-OPERATIVE INC.';
    }
    if (isNfp) {
      return 'Enter the name in block capital letters, as it should appear on the official record.';
    }
    return 'Enter the name in block capital letters, as it should appear on the official record. Example: GREEN INSTITUTE INC.';
  }

  return (
    <div className={styles.formStack}>
      {leadText ? (
        <div className={styles.leadGroup}>
          {(Array.isArray(leadText) ? leadText : [leadText]).map((paragraph) => (
            <p key={paragraph} className={styles.lead}>
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}

      <OntarioInput
        elementId={`${idPrefix}-proposed-name`}
        caption={proposedNameCaption ?? singleNameCaption}
        name={`${idPrefix}-proposed-name`}
        required
        requiredValidationMessage={emptyMessage()}
        hintText={nameHintText()}
        value={value.proposedName}
        errorMessage={errors.proposedName}
        customOnInput={(event) => {
          patch({ proposedName: getEventValue(event) });
          onClearError('proposedName');
        }}
        customOnBlur={(event) =>
          patch({ proposedName: toBlockCapitals(getEventValue(event)) })
        }
      />

      {secondaryName ? (
        <OntarioInput
          elementId={secondaryName.elementId}
          caption={secondaryName.caption}
          name={secondaryName.elementId}
          required
          hintText={secondaryName.hintText ?? nameHintText()}
          value={secondaryName.value}
          errorMessage={secondaryName.errorMessage}
          customOnInput={(event) => secondaryName.onInput(getEventValue(event))}
          customOnBlur={(event) =>
            secondaryName.onBlur(toBlockCapitals(getEventValue(event)))
          }
        />
      ) : null}

      {reports.map((report, index) => {
        const ordinal = reports.length > 1 ? ` ${index + 1}` : '';
        const fileKey = nuansFileErrorKey(report.id);
        const dateKey = nuansDateErrorKey(report.id);

        return (
          <div key={report.id} className={styles.nuansReportBlock}>
            {index > 0 ? <hr className={styles.nuansReportDivider} /> : null}
            {reports.length > 1 ? (
              <div className={styles.nuansReportHeader}>
                <h3 className={`ontario-h4 ${styles.nuansReportHeading}`}>
                  NUANS report{ordinal}
                </h3>
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
              inputId={`${idPrefix}-nuans-file-${report.id}`}
            />

            <div id={`${idPrefix}-nuans-date-${report.id}`}>
              <OntarioDateInput
                elementId={`${idPrefix}-nuans-date-${report.id}-input`}
                caption={
                  reports.length > 1
                    ? `NUANS report${ordinal} date`
                    : 'NUANS report date'
                }
                required
                value={report.date || undefined}
                dateValidator={dateValidatorFor(report.id)}
                onInputOnInput={(event) => {
                  const next = aggregateDateFromEvent(event);
                  if (next !== null) {
                    updateReport(report.id, { date: next });
                  }
                  onClearError(dateKey);
                }}
                onInputOnChange={(event) => {
                  const next = aggregateDateFromEvent(event);
                  if (next !== null) {
                    updateReport(report.id, { date: next });
                  }
                  onClearError(dateKey);
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
  );
}

export function validateNameNuansFields(
  value: NameNuansFields,
  nameKind: 'cooperative' | 'corporation' | 'nfp',
  validateName: (name: string) => string | undefined,
): NameNuansErrors {
  const next: NameNuansErrors = {};
  const emptySingle =
    nameKind === 'cooperative'
      ? COOPERATIVE_NAME_REQUIRED_ERROR
      : nameKind === 'nfp'
        ? 'Enter the Not-for-Profit corporation name.'
        : 'Enter the corporation name.';

  if (!value.proposedName.trim()) {
    next.proposedName = emptySingle;
  } else {
    const nameError = validateName(value.proposedName);
    if (nameError) {
      next.proposedName = nameError;
    }
  }

  const reports =
    value.nuansReports.length > 0 ? value.nuansReports : [createEmptyNuansReport()];

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
