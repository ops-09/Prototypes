import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioDateInput,
  OntarioInput,
  OntarioPageAlert,
  OntarioRadioButtons,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { FileUpload, type UploadedFileMeta } from './FileUpload';
import {
  EMPTY_STEP1,
  readForm1Draft,
  upsertForm1Step1,
  type Form1Step1Data,
} from './form1DraftStorage';
import {
  COOPERATIVE_NAME_REQUIRED_ERROR,
  isSeparateLanguage,
  SECOND_NUANS_ERROR,
  toBlockCapitals,
  validateCooperativeName,
  type NameLanguageOption,
} from './nameValidation';
import { aggregateDateFromEvent } from '../form7/dateErrorSync';
import { validateNuansDate } from '../form7/nuansValidation';
import styles from './Form1Step1.module.scss';

const CURRENT_STEP = 2;
const TOTAL_STEPS = 9;

type FieldKey =
  | 'languageOption'
  | 'cooperativeName'
  | 'englishName'
  | 'frenchName'
  | 'nuansFile'
  | 'nuansFileEn'
  | 'nuansFileFr'
  | 'nuansDate'
  | 'nuansDateEn'
  | 'nuansDateFr';

type FieldErrors = Partial<Record<FieldKey, string>>;

const FIELD_ANCHORS: Record<FieldKey, string> = {
  languageOption: 'coop-name-language',
  cooperativeName: 'cooperative-name',
  englishName: 'cooperative-name-en',
  frenchName: 'cooperative-name-fr',
  nuansFile: 'nuans-file',
  nuansFileEn: 'nuans-file-en',
  nuansFileFr: 'nuans-file-fr',
  nuansDate: 'nuans-date',
  nuansDateEn: 'nuans-date-en',
  nuansDateFr: 'nuans-date-fr',
};

/** Stable display order for the error summary list. */
const FIELD_ORDER: FieldKey[] = [
  'languageOption',
  'cooperativeName',
  'englishName',
  'frenchName',
  'nuansFile',
  'nuansDate',
  'nuansFileEn',
  'nuansDateEn',
  'nuansFileFr',
  'nuansDateFr',
];

const DATE_FIELD_KEYS: FieldKey[] = ['nuansDate', 'nuansDateEn', 'nuansDateFr'];

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

function syncDateFieldErrors(nextErrors: FieldErrors) {
  DATE_FIELD_KEYS.forEach((key) => {
    const host = document
      .getElementById(FIELD_ANCHORS[key])
      ?.querySelector<HTMLElement>('ontario-date-input');
    if (!host) {
      return;
    }
    syncOntarioDateInputError(host, nextErrors[key]);
  });
}

export function Form1Step1() {
  const navigate = useNavigate();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const dateErrorsRef = useRef<FieldErrors>({});
  const existing = readForm1Draft();

  const [languageOption, setLanguageOption] = useState<NameLanguageOption | ''>(
    () => existing?.step1.languageOption ?? '',
  );
  const [cooperativeName, setCooperativeName] = useState(
    () => existing?.step1.cooperativeName ?? '',
  );
  const [englishName, setEnglishName] = useState(() => existing?.step1.englishName ?? '');
  const [frenchName, setFrenchName] = useState(() => existing?.step1.frenchName ?? '');
  const [nuansFile, setNuansFile] = useState<UploadedFileMeta | null>(
    () => existing?.step1.nuansFile ?? null,
  );
  const [nuansFileEn, setNuansFileEn] = useState<UploadedFileMeta | null>(
    () => existing?.step1.nuansFileEn ?? null,
  );
  const [nuansFileFr, setNuansFileFr] = useState<UploadedFileMeta | null>(
    () => existing?.step1.nuansFileFr ?? null,
  );
  const [nuansDate, setNuansDate] = useState(() => existing?.step1.nuansDate ?? '');
  const [nuansDateEn, setNuansDateEn] = useState(() => existing?.step1.nuansDateEn ?? '');
  const [nuansDateFr, setNuansDateFr] = useState(() => existing?.step1.nuansDateFr ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  dateErrorsRef.current = errors;

  const separate = isSeparateLanguage(languageOption);

  const languageOptions = useMemo(
    () => [
      {
        value: 'english',
        elementId: 'coop-name-english',
        label: 'an English name (example: "Green Institute Co-operative Inc.")',
      },
      {
        value: 'french',
        elementId: 'coop-name-french',
        label: 'a French name (example: "Institut Green Coopérative Inc.")',
      },
      {
        value: 'combined',
        elementId: 'coop-name-combined',
        label:
          'a combination English and French name (example: "Institut Green Institute Co-operative Inc.")',
      },
      {
        value: 'separate',
        elementId: 'coop-name-separate',
        label:
          'an English and a French name that are equivalent but used separately (example: "Green Institute Co-operative Inc./Institut Green Coopérative Inc."). This option requires two separate NUANS reports.',
      },
    ],
    [],
  );

  const errorSummaryItems = useMemo(
    () =>
      FIELD_ORDER.flatMap((key) => {
        const message = errors[key];
        if (!message) {
          return [];
        }
        return [{ key, message, href: `#${FIELD_ANCHORS[key]}` }];
      }),
    [errors],
  );

  function makeDateValidator(fieldKey: FieldKey) {
    return (_day: string, _month: string, _year: string) => {
      const message = dateErrorsRef.current[fieldKey];
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

  function clearOppositeBranch(next: NameLanguageOption) {
    if (next === 'separate') {
      setCooperativeName('');
      setNuansFile(null);
      setNuansDate('');
    } else {
      setEnglishName('');
      setFrenchName('');
      setNuansFileEn(null);
      setNuansFileFr(null);
      setNuansDateEn('');
      setNuansDateFr('');
    }
  }

  function handleLanguageChange(value: string) {
    const next = value as NameLanguageOption;
    setLanguageOption(next);
    clearOppositeBranch(next);
    setErrors({});
    dateErrorsRef.current = {};
    setShowErrorSummary(false);
  }

  function clearError(key: FieldKey) {
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      dateErrorsRef.current = next;
      if (DATE_FIELD_KEYS.includes(key)) {
        window.requestAnimationFrame(() => syncDateFieldErrors(next));
      }
      return next;
    });
  }

  function validateAll(): FieldErrors {
    const next: FieldErrors = {};

    if (!languageOption) {
      next.languageOption = 'Select how the co-operative name will appear.';
    }

    if (separate) {
      const enError = validateCooperativeName(englishName);
      const frError = validateCooperativeName(frenchName);
      if (enError) {
        next.englishName = enError;
      }
      if (frError) {
        next.frenchName = frError;
      }
      if (!nuansFileEn) {
        next.nuansFileEn = 'Upload the English NUANS report.';
      }
      if (!nuansFileFr) {
        next.nuansFileFr = nuansFileEn
          ? SECOND_NUANS_ERROR
          : 'Upload the French NUANS report.';
      }
      const enDateError = validateNuansDate(nuansDateEn);
      if (enDateError) {
        next.nuansDateEn = enDateError;
      }
      const frDateError = validateNuansDate(nuansDateFr);
      if (frDateError) {
        next.nuansDateFr = frDateError;
      }
    } else if (languageOption) {
      const nameError = validateCooperativeName(cooperativeName);
      if (nameError) {
        next.cooperativeName = nameError;
      }
      if (!nuansFile) {
        next.nuansFile = 'Upload the NUANS report.';
      }
      const dateError = validateNuansDate(nuansDate);
      if (dateError) {
        next.nuansDate = dateError;
      }
    }

    return next;
  }

  function buildStep1(): Form1Step1Data {
    return {
      ...EMPTY_STEP1,
      languageOption,
      cooperativeName,
      englishName,
      frenchName,
      nuansDate,
      nuansDateEn,
      nuansDateFr,
      nuansFile,
      nuansFileEn,
      nuansFileFr,
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
        syncDateFieldErrors(nextErrors);
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }

    upsertForm1Step1(buildStep1(), 'continue', 1);
    navigate('/form-1/step-3');
  }

  function handleSaveAsDraft() {
    upsertForm1Step1(buildStep1(), 'draft', existing?.lastCompletedStep ?? 0);
    navigate('/form-1/draft-summary');
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
          backButtonUrl="/form-1"
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
            First select how the co-operative&apos;s name will appear. That choice determines
            whether you enter one name and one NUANS report, or two names and two NUANS
            reports.
          </p>

          <div className={styles.formStack}>
            <div id={FIELD_ANCHORS.languageOption}>
              <OntarioRadioButtons
                caption={{
                  captionText: "The co-operative's name will have:",
                  captionType: 'default',
                }}
                name="coop-name-language"
                required
                value={languageOption}
                options={languageOptions}
                errorMessage={errors.languageOption}
                customOnChange={(event) => handleLanguageChange(getEventValue(event))}
              />
            </div>

            {languageOption && !separate ? (
              <OntarioInput
                elementId={FIELD_ANCHORS.cooperativeName}
                caption="Co-operative name (proposed)"
                name="cooperative-name"
                required
                requiredValidationMessage={COOPERATIVE_NAME_REQUIRED_ERROR}
                hintText="Enter the name in block capital letters, as it should appear on the official record. Example: GREEN INSTITUTE CO-OPERATIVE INC."
                value={cooperativeName}
                errorMessage={errors.cooperativeName}
                customOnInput={(event) => {
                  setCooperativeName(getEventValue(event));
                  clearError('cooperativeName');
                }}
                customOnBlur={(event) => setCooperativeName(toBlockCapitals(getEventValue(event)))}
              />
            ) : null}

            {separate ? (
              <>
                <OntarioInput
                  elementId={FIELD_ANCHORS.englishName}
                  caption="English name (proposed)"
                  name="cooperative-name-en"
                  required
                  requiredValidationMessage="Enter the English co-operative name. Example: GREEN INSTITUTE CO-OPERATIVE INC."
                  hintText="Enter the name in block capital letters, as it should appear on the official record. Example: GREEN INSTITUTE CO-OPERATIVE INC."
                  value={englishName}
                  errorMessage={errors.englishName}
                  customOnInput={(event) => {
                    setEnglishName(getEventValue(event));
                    clearError('englishName');
                  }}
                  customOnBlur={(event) => setEnglishName(toBlockCapitals(getEventValue(event)))}
                />
                <OntarioInput
                  elementId={FIELD_ANCHORS.frenchName}
                  caption="French name (proposed)"
                  name="cooperative-name-fr"
                  required
                  requiredValidationMessage="Enter the French co-operative name. Example: INSTITUT GREEN COOPÉRATIVE INC."
                  hintText="Enter the name in block capital letters, as it should appear on the official record. Example: INSTITUT GREEN COOPÉRATIVE INC."
                  value={frenchName}
                  errorMessage={errors.frenchName}
                  customOnInput={(event) => {
                    setFrenchName(getEventValue(event));
                    clearError('frenchName');
                  }}
                  customOnBlur={(event) => setFrenchName(toBlockCapitals(getEventValue(event)))}
                />
              </>
            ) : null}

            {languageOption ? (
              <div className={styles.nuansSection}>
                {!separate ? (
                  <>
                    <FileUpload
                      label="Upload NUANS report"
                      required
                      hintText="Upload the NUANS report that confirms the proposed name is available."
                      value={nuansFile}
                      errorMessage={errors.nuansFile}
                      onChange={(meta) => {
                        setNuansFile(meta);
                        clearError('nuansFile');
                      }}
                      inputId={FIELD_ANCHORS.nuansFile}
                    />
                    <div id={FIELD_ANCHORS.nuansDate}>
                      <OntarioDateInput
                        elementId={`${FIELD_ANCHORS.nuansDate}-input`}
                        caption="NUANS report date"
                        required
                        value={nuansDate || undefined}
                        dateValidator={makeDateValidator('nuansDate')}
                        onInputOnInput={(event) => {
                          const next = aggregateDateFromEvent(event);
                          if (next !== null) {
                            setNuansDate(next);
                          }
                          clearError('nuansDate');
                        }}
                        onInputOnChange={(event) => {
                          const next = aggregateDateFromEvent(event);
                          if (next !== null) {
                            setNuansDate(next);
                          }
                          clearError('nuansDate');
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <FileUpload
                      label="Upload English NUANS report"
                      required
                      hintText="Upload the NUANS report for the English name."
                      value={nuansFileEn}
                      errorMessage={errors.nuansFileEn}
                      onChange={(meta) => {
                        setNuansFileEn(meta);
                        clearError('nuansFileEn');
                      }}
                      inputId={FIELD_ANCHORS.nuansFileEn}
                    />
                    <div id={FIELD_ANCHORS.nuansDateEn}>
                      <OntarioDateInput
                        elementId={`${FIELD_ANCHORS.nuansDateEn}-input`}
                        caption="English NUANS report date"
                        required
                        value={nuansDateEn || undefined}
                        dateValidator={makeDateValidator('nuansDateEn')}
                        onInputOnInput={(event) => {
                          const next = aggregateDateFromEvent(event);
                          if (next !== null) {
                            setNuansDateEn(next);
                          }
                          clearError('nuansDateEn');
                        }}
                        onInputOnChange={(event) => {
                          const next = aggregateDateFromEvent(event);
                          if (next !== null) {
                            setNuansDateEn(next);
                          }
                          clearError('nuansDateEn');
                        }}
                      />
                    </div>

                    <FileUpload
                      label="Upload French NUANS report"
                      required
                      hintText="Upload the NUANS report for the French name."
                      value={nuansFileFr}
                      errorMessage={errors.nuansFileFr}
                      onChange={(meta) => {
                        setNuansFileFr(meta);
                        clearError('nuansFileFr');
                      }}
                      inputId={FIELD_ANCHORS.nuansFileFr}
                    />
                    <div id={FIELD_ANCHORS.nuansDateFr}>
                      <OntarioDateInput
                        elementId={`${FIELD_ANCHORS.nuansDateFr}-input`}
                        caption="French NUANS report date"
                        required
                        value={nuansDateFr || undefined}
                        dateValidator={makeDateValidator('nuansDateFr')}
                        onInputOnInput={(event) => {
                          const next = aggregateDateFromEvent(event);
                          if (next !== null) {
                            setNuansDateFr(next);
                          }
                          clearError('nuansDateFr');
                        }}
                        onInputOnChange={(event) => {
                          const next = aggregateDateFromEvent(event);
                          if (next !== null) {
                            setNuansDateFr(next);
                          }
                          clearError('nuansDateFr');
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
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
              label="Cancel / Exit"
              onClick={handleCancel}
            />
          </div>
        </div>
      </div>
    </>
  );
}
