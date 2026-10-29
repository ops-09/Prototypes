import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioDropdownList,
  OntarioPageAlert,
  OntarioRadioButtons,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { validateCooperativeName } from '../form1/nameValidation';
import {
  NUMBER_NAME_LEGAL_ELEMENTS,
  validateCorporationName,
  validateNfpCorporationName,
} from './corpNameValidation';
import { syncDateFieldByAnchor } from './dateErrorSync';
import {
  createEmptyNuansReport,
  emptyNameNuans,
  EMPTY_STEP2,
  EMPTY_STEP3,
  EMPTY_STEP4,
  normalizeNameNuans,
  OBR_INCORPORATION_DATE,
  OBR_OCN,
  OBR_STEP1_DEFAULTS,
  readForm7Draft,
  saveForm7Draft,
  upsertForm7Step2,
  type AmendmentType,
  type Form7NameLanguage,
  type Form7Step2Data,
  type NameNuansFields,
} from './form7DraftStorage';
import { Form7RegistryCallout } from './Form7RegistryCallout';
import {
  nuansDateErrorKey,
  ProposedNameAndNuans,
  validateNameNuansFields,
  type NameNuansErrors,
} from './ProposedNameAndNuans';
import styles from './Form7Step1.module.scss';

const CURRENT_STEP = 3;
const TOTAL_STEPS = 5;

type Step2Errors = NameNuansErrors &
  Partial<{
    amendmentType: string;
    changeCooperativeName: string;
    hasNumberName: string;
    legalElement: string;
    nameLanguage: string;
    proposedNameFr: string;
  }> &
  Record<string, string | undefined>;

const LANGUAGE_OPTIONS: {
  value: Exclude<Form7NameLanguage, ''>;
  elementId: string;
  label: string;
}[] = [
  {
    value: 'english',
    elementId: 'name-language-en',
    label: 'an English name',
  },
  {
    value: 'french',
    elementId: 'name-language-fr',
    label: 'a French name',
  },
  {
    value: 'combined',
    elementId: 'name-language-combined',
    label: 'a combination of English and French',
  },
  {
    value: 'separate',
    elementId: 'name-language-separate',
    label: 'an English name and a French name used separately',
  },
];

function reportsForLanguage(
  language: Form7NameLanguage,
  current: NameNuansFields,
): NameNuansFields {
  const reports =
    current.nuansReports.length > 0
      ? current.nuansReports
      : [createEmptyNuansReport()];
  if (language !== 'separate') {
    return current;
  }
  if (reports.length >= 2) {
    return { ...current, nuansReports: reports };
  }
  return { ...current, nuansReports: [...reports, createEmptyNuansReport()] };
}

function getEventValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
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

function ensureStep2Draft() {
  const existing = readForm7Draft();
  if (existing?.step1.cooperativeName) {
    return existing;
  }

  // Prototype deep-link: seed Step 1 so /form-7/step-3 opens from the playground.
  const now = new Date().toISOString();
  const seeded = {
    step1: { ...OBR_STEP1_DEFAULTS },
    step2: existing?.step2 ?? { ...EMPTY_STEP2, nameNuans: emptyNameNuans() },
    step3: existing?.step3 ?? { ...EMPTY_STEP3 },
    step4: existing?.step4 ?? { ...EMPTY_STEP4 },
    savedAs: 'continue' as const,
    savedAt: now,
    lastCompletedStep: 1 as const,
  };
  saveForm7Draft(seeded);
  return seeded;
}

function nameNuansErrorHref(
  idPrefix: string,
  key: string,
  reports: NameNuansFields['nuansReports'],
) {
  if (key === 'proposedName') {
    return `#${idPrefix}-proposed-name`;
  }
  if (key.startsWith('nuansFile:')) {
    const reportId = key.slice('nuansFile:'.length);
    return `#${idPrefix}-nuans-file-${reportId}`;
  }
  if (key.startsWith('nuansDate:')) {
    const reportId = key.slice('nuansDate:'.length);
    return `#${idPrefix}-nuans-date-${reportId}`;
  }
  // Fallback: first report date block if present.
  const firstId = reports[0]?.id;
  return firstId ? `#${idPrefix}-nuans-date-${firstId}` : `#${idPrefix}-proposed-name`;
}

export function Form7Step2() {
  const navigate = useNavigate();
  const draft = ensureStep2Draft();

  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const dateErrorsRef = useRef<Step2Errors>({});

  const [step2, setStep2] = useState<Form7Step2Data>(() => ({
    ...EMPTY_STEP2,
    ...(draft?.step2 ?? {}),
    nameNuans: normalizeNameNuans(draft?.step2?.nameNuans),
    changeCooperativeName: draft?.step2?.changeCooperativeName ?? '',
  }));
  const [errors, setErrors] = useState<Step2Errors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  dateErrorsRef.current = errors;

  const amendmentType = step2.amendmentType;
  const cooperativeName = draft?.step1.cooperativeName ?? '';
  const ocn = draft?.step1.ocn || OBR_OCN;
  const incorporationDate = draft?.step1.incorporationDate || OBR_INCORPORATION_DATE;

  useEffect(() => {
    if (draft?.step2) {
      setStep2({
        ...EMPTY_STEP2,
        ...draft.step2,
        nameNuans: normalizeNameNuans(draft.step2.nameNuans),
        changeCooperativeName: draft.step2.changeCooperativeName ?? '',
      });
    }
    // Load once from session on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const idPrefix = 'form7-step2';

  const amendmentOptions = useMemo(
    () => [
      {
        value: 'change-name',
        elementId: 'amendment-change-name',
        label: 'Articles of Amendment',
      },
      {
        value: 'convert-business-corp',
        elementId: 'amendment-convert-business-corp',
        label:
          'Articles of Amendment (converting to a business corporation under the Business Corporations Act)',
      },
      {
        value: 'convert-not-for-profit',
        elementId: 'amendment-convert-not-for-profit',
        label:
          'Articles of Amendment (converting to a Not-for-Profit Corporations Act, 2010 Corporation)',
      },
    ],
    [],
  );

  const legalElementOptions = useMemo(
    () =>
      NUMBER_NAME_LEGAL_ELEMENTS.map((element) => ({
        value: element,
        label: element,
      })),
    [],
  );

  const changeNameOptions = useMemo(
    () => [
      {
        value: 'change',
        elementId: 'coop-name-change',
        label: 'Yes',
      },
      {
        value: 'no',
        elementId: 'coop-name-no-change',
        label: 'No',
      },
    ],
    [],
  );

  const hasNameOptions = useMemo(
    () => [
      {
        value: 'yes',
        elementId: 'corp-has-name-yes',
        label: 'Yes',
      },
      {
        value: 'no',
        elementId: 'corp-has-name-no',
        label: 'No',
      },
    ],
    [],
  );

  const errorSummaryItems = useMemo(() => {
    const fixedOrder: Array<{ key: keyof Step2Errors; href: string }> = [
      { key: 'amendmentType', href: '#amendment-type' },
      { key: 'changeCooperativeName', href: '#change-cooperative-name' },
      { key: 'hasNumberName', href: '#corp-has-name' },
      { key: 'legalElement', href: '#legal-element' },
      { key: 'nameLanguage', href: '#name-language' },
      { key: 'proposedNameFr', href: `#${idPrefix}-proposed-name-fr` },
      {
        key: 'proposedName',
        href: nameNuansErrorHref(idPrefix, 'proposedName', step2.nameNuans.nuansReports),
      },
    ];

    const fixedItems = fixedOrder.flatMap(({ key, href }) => {
      const message = errors[key];
      if (!message) {
        return [];
      }
      return [{ key: String(key), message, href }];
    });

    const reportItems = step2.nameNuans.nuansReports.flatMap((report) => {
      const fileKey = `nuansFile:${report.id}` as const;
      const dateKey = `nuansDate:${report.id}` as const;
      const items: Array<{ key: string; message: string; href: string }> = [];
      const fileMessage = errors[fileKey];
      if (fileMessage) {
        items.push({
          key: fileKey,
          message: fileMessage,
          href: nameNuansErrorHref(idPrefix, fileKey, step2.nameNuans.nuansReports),
        });
      }
      const dateMessage = errors[dateKey];
      if (dateMessage) {
        items.push({
          key: dateKey,
          message: dateMessage,
          href: nameNuansErrorHref(idPrefix, dateKey, step2.nameNuans.nuansReports),
        });
      }
      return items;
    });

    return [...fixedItems, ...reportItems];
  }, [errors, idPrefix, step2.nameNuans.nuansReports]);

  if (!draft?.step1.cooperativeName) {
    return <Navigate to="/form-7/step-2" replace />;
  }

  function clearError(key: keyof Step2Errors | string) {
    setErrors((prev) => {
      if (!prev[key as keyof Step2Errors]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key as keyof Step2Errors];
      // Keep dateValidator in sync immediately; also clear forced ODS shadow styles
      // (OntarioDateInput has no errorMessage prop — submit injects borders via sync).
      dateErrorsRef.current = next;
      if (String(key).startsWith('nuansDate:')) {
        window.requestAnimationFrame(() => syncDateErrors(next));
      }
      return next;
    });
  }

  function patchStep2(partial: Partial<Form7Step2Data>) {
    setStep2((prev) => ({ ...prev, ...partial }));
  }

  function setNameNuans(next: NameNuansFields) {
    patchStep2({ nameNuans: next });
  }

  function dateValidatorFor(reportId: string) {
    return (_day: string, _month: string, _year: string) => {
      const message = dateErrorsRef.current[nuansDateErrorKey(reportId)];
      // Match Form1: set day/month/yearInvalid so ODS resetErrorState can clear on typing.
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

  function validate(): Step2Errors {
    const next: Step2Errors = {};

    if (!amendmentType) {
      next.amendmentType = 'Select an amendment type.';
      return next;
    }

    if (amendmentType === 'change-name') {
      if (!step2.changeCooperativeName) {
        next.changeCooperativeName = 'Select Yes or No.';
      } else if (step2.changeCooperativeName === 'change') {
        Object.assign(
          next,
          validateNameNuansFields(step2.nameNuans, 'cooperative', validateCooperativeName),
        );
      }
    }

    if (amendmentType === 'convert-not-for-profit') {
      if (!step2.hasNumberName) {
        next.hasNumberName =
          'Select whether this Not-for-Profit corporation will have a number name.';
      } else if (step2.hasNumberName === 'no') {
        if (!step2.nameLanguage) {
          next.nameLanguage = 'Select the language of the corporation name.';
        } else {
          Object.assign(
            next,
            validateNameNuansFields(step2.nameNuans, 'nfp', validateNfpCorporationName),
          );
          if (step2.nameLanguage === 'separate') {
            const frenchError = validateNfpCorporationName(step2.proposedNameFr);
            if (frenchError) {
              next.proposedNameFr =
                frenchError === 'Enter the not-for-profit corporation name.'
                  ? 'Enter the French not-for-profit corporation name.'
                  : frenchError;
            }
          }
        }
      }
    }

    if (amendmentType === 'convert-business-corp') {
      if (!step2.hasNumberName) {
        next.hasNumberName =
          'Select whether this business corporation will have a number name.';
      } else if (step2.hasNumberName === 'yes') {
        if (!step2.legalElement) {
          next.legalElement = 'Select a legal element for the number name.';
        }
      } else if (!step2.nameLanguage) {
        next.nameLanguage = 'Select the language of the corporation name.';
      } else {
        Object.assign(
          next,
          validateNameNuansFields(step2.nameNuans, 'corporation', validateCorporationName),
        );
        if (step2.nameLanguage === 'separate') {
          const frenchError = validateCorporationName(step2.proposedNameFr);
          if (frenchError) {
            next.proposedNameFr =
              frenchError === 'Enter the corporation name.'
                ? 'Enter the French corporation name.'
                : frenchError;
          }
        }
      }
    }

    return next;
  }

  function syncDateErrors(nextErrors: Step2Errors) {
    for (const report of step2.nameNuans.nuansReports) {
      const key = nuansDateErrorKey(report.id);
      syncDateFieldByAnchor(`${idPrefix}-nuans-date-${report.id}`, nextErrors[key]);
    }
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

    upsertForm7Step2(step2, 'continue', 2);
    navigate('/form-7/step-4');
  }

  function handleSaveAsDraft() {
    upsertForm7Step2(step2, 'draft', 1);
    navigate('/form-7/draft-summary');
  }

  function handleCancel() {
    navigate('/');
  }

  function handleSummaryLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    focusField(href.replace('#', ''));
  }

  function handleAmendmentTypeChange(nextType: AmendmentType) {
    patchStep2({
      amendmentType: nextType,
      changeCooperativeName: '',
      hasNumberName: '',
      legalElement: '',
      nameLanguage: '',
      proposedNameFr: '',
      numberNameNuansFile: null,
      numberNameNuansDate: '',
      nameNuans: emptyNameNuans(),
    });
    setErrors({});
    dateErrorsRef.current = {};
    setShowErrorSummary(false);
    window.requestAnimationFrame(() => syncDateErrors({}));
  }

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-7/step-2"
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Amendment details</h1>

          <p className={styles.lead}>
            Select the amendment type, then complete the details for that amendment.
          </p>

          <div className={styles.alert}>
            <Form7RegistryCallout
              cooperativeName={cooperativeName}
              ocn={ocn}
              incorporationDate={incorporationDate}
            />
          </div>

          <div className={styles.formStack}>
            <div id="amendment-type">
              <OntarioRadioButtons
                caption={{
                  captionText: 'Select the amendment type:',
                  captionType: 'default',
                }}
                name="amendment-type"
                required
                value={amendmentType}
                options={amendmentOptions}
                errorMessage={errors.amendmentType}
                customOnChange={(event) => {
                  handleAmendmentTypeChange(getEventValue(event) as AmendmentType);
                }}
              />
            </div>

            {amendmentType === 'change-name' ? (
              <div className={styles.formStack}>
                <div id="change-cooperative-name">
                  <OntarioRadioButtons
                    caption={{
                      captionText: 'Do you want to change the co-operative name?',
                      captionType: 'default',
                    }}
                    name="change-cooperative-name"
                    required
                    value={step2.changeCooperativeName}
                    options={changeNameOptions}
                    errorMessage={errors.changeCooperativeName}
                    customOnChange={(event) => {
                      const value = getEventValue(event) as 'change' | 'no';
                      patchStep2({
                        changeCooperativeName: value,
                        nameNuans:
                          value === 'no' ? emptyNameNuans() : step2.nameNuans,
                      });
                      clearError('changeCooperativeName');
                      if (value === 'no') {
                        setErrors((prev) => {
                          const next: Step2Errors = {
                            amendmentType: prev.amendmentType,
                            changeCooperativeName: prev.changeCooperativeName,
                            hasNumberName: prev.hasNumberName,
                            legalElement: prev.legalElement,
                          };
                          return next;
                        });
                      }
                    }}
                  />
                </div>

                {step2.changeCooperativeName === 'change' ? (
                  <ProposedNameAndNuans
                    idPrefix={idPrefix}
                    nameKind="cooperative"
                    leadText={[
                      'An Ontario NUANS name search report for the proposed name of the co-operative. The search report must be submitted with the application within 90 days of the production of the report.',
                      'The name of the co-operative must have “CO-OPERATIVE” or “COOPÉRATIVE” in the name. The name of the co-operative must end with one of the following legal elements: “INCORPORATED”, “INCORPORÉE”, “CORPORATION”, “LIMITED”, “LIMITÉE”, “INC.”, “CORP.”, “LTD.” or “LTÉE”.',
                    ]}
                    value={step2.nameNuans}
                    errors={errors}
                    dateValidatorFor={dateValidatorFor}
                    onChange={setNameNuans}
                    onClearError={clearError}
                  />
                ) : null}
              </div>
            ) : null}

            {amendmentType === 'convert-business-corp' ? (
              <div className={styles.formStack}>
                <div id="corp-has-name">
                  <OntarioRadioButtons
                    caption={{
                      captionText: 'Will this business corporation have a number name?',
                      captionType: 'default',
                    }}
                    name="corp-has-name"
                    required
                    value={step2.hasNumberName}
                    options={hasNameOptions}
                    errorMessage={errors.hasNumberName}
                    customOnChange={(event) => {
                      const value = getEventValue(event) as 'yes' | 'no';
                      patchStep2({
                        hasNumberName: value,
                        legalElement: value === 'yes' ? step2.legalElement : '',
                        nameLanguage: value === 'no' ? step2.nameLanguage : '',
                        proposedNameFr: value === 'no' ? step2.proposedNameFr : '',
                        numberNameNuansFile: null,
                        numberNameNuansDate: '',
                        nameNuans: value === 'no' ? step2.nameNuans : emptyNameNuans(),
                      });
                      clearError('hasNumberName');
                      if (value !== 'yes') {
                        clearError('legalElement');
                      }
                      if (value !== 'no') {
                        clearError('nameLanguage');
                        clearError('proposedNameFr');
                      }
                    }}
                  />
                </div>

                {step2.hasNumberName === 'yes' ? (
                  <div id="legal-element">
                    <OntarioDropdownList
                      elementId="legal-element-select"
                      caption="Legal element for the number name"
                      name="legal-element"
                      required
                      isEmptyStartOption
                      value={step2.legalElement}
                      options={legalElementOptions}
                      errorMessage={errors.legalElement}
                      customOnChange={(event) => {
                        patchStep2({ legalElement: getEventValue(event) });
                        clearError('legalElement');
                      }}
                    />
                  </div>
                ) : null}

                {step2.hasNumberName === 'no' ? (
                  <>
                    <div id="name-language">
                      <OntarioRadioButtons
                        caption="The corporation will have"
                        name="name-language"
                        required
                        value={step2.nameLanguage}
                        options={LANGUAGE_OPTIONS}
                        errorMessage={errors.nameLanguage}
                        customOnChange={(event) => {
                          const value = getEventValue(event) as Exclude<
                            Form7NameLanguage,
                            ''
                          >;
                          patchStep2({
                            nameLanguage: value,
                            proposedNameFr:
                              value === 'separate' ? step2.proposedNameFr : '',
                            nameNuans: reportsForLanguage(value, step2.nameNuans),
                          });
                          clearError('nameLanguage');
                          if (value !== 'separate') {
                            clearError('proposedNameFr');
                          }
                        }}
                      />
                    </div>
                    {step2.nameLanguage ? (
                      <ProposedNameAndNuans
                        idPrefix={idPrefix}
                        nameKind="corporation"
                        proposedNameCaption={
                          step2.nameLanguage === 'separate'
                            ? 'New corporation name (proposed) — English'
                            : undefined
                        }
                        secondaryName={
                          step2.nameLanguage === 'separate'
                            ? {
                                elementId: `${idPrefix}-proposed-name-fr`,
                                caption: 'New corporation name (proposed) — French',
                                value: step2.proposedNameFr,
                                errorMessage: errors.proposedNameFr,
                                onInput: (value) => {
                                  patchStep2({ proposedNameFr: value });
                                  clearError('proposedNameFr');
                                },
                                onBlur: (value) => patchStep2({ proposedNameFr: value }),
                              }
                            : undefined
                        }
                        value={step2.nameNuans}
                        errors={errors}
                        dateValidatorFor={dateValidatorFor}
                        onChange={setNameNuans}
                        onClearError={clearError}
                      />
                    ) : null}
                  </>
                ) : null}
              </div>
            ) : null}

            {amendmentType === 'convert-not-for-profit' ? (
              <div className={styles.formStack}>
                <div id="corp-has-name">
                  <OntarioRadioButtons
                    caption={{
                      captionText:
                        'Will this Not-for-Profit corporation have a number name?',
                      captionType: 'default',
                    }}
                    name="nfp-has-name"
                    required
                    value={step2.hasNumberName}
                    options={hasNameOptions}
                    errorMessage={errors.hasNumberName}
                    customOnChange={(event) => {
                      const value = getEventValue(event) as 'yes' | 'no';
                      patchStep2({
                        hasNumberName: value,
                        legalElement: '',
                        nameLanguage: value === 'no' ? step2.nameLanguage : '',
                        proposedNameFr: value === 'no' ? step2.proposedNameFr : '',
                        numberNameNuansFile: null,
                        numberNameNuansDate: '',
                        nameNuans: value === 'no' ? step2.nameNuans : emptyNameNuans(),
                      });
                      clearError('hasNumberName');
                      if (value !== 'no') {
                        clearError('nameLanguage');
                        clearError('proposedNameFr');
                      }
                    }}
                  />
                </div>

                {step2.hasNumberName === 'no' ? (
                  <>
                    <p className={styles.lead}>
                      Every Not-for-Profit corporation must have a name. You need a NUANS
                      report for the proposed name.
                    </p>
                    <div id="name-language">
                      <OntarioRadioButtons
                        caption="The corporation will have"
                        name="name-language"
                        required
                        value={step2.nameLanguage}
                        options={LANGUAGE_OPTIONS}
                        errorMessage={errors.nameLanguage}
                        customOnChange={(event) => {
                          const value = getEventValue(event) as Exclude<
                            Form7NameLanguage,
                            ''
                          >;
                          patchStep2({
                            nameLanguage: value,
                            proposedNameFr:
                              value === 'separate' ? step2.proposedNameFr : '',
                            nameNuans: reportsForLanguage(value, step2.nameNuans),
                          });
                          clearError('nameLanguage');
                          if (value !== 'separate') {
                            clearError('proposedNameFr');
                          }
                        }}
                      />
                    </div>
                    {step2.nameLanguage ? (
                      <ProposedNameAndNuans
                        idPrefix={idPrefix}
                        nameKind="nfp"
                        proposedNameCaption={
                          step2.nameLanguage === 'separate'
                            ? 'New not-for-profit corporation name (proposed) — English'
                            : undefined
                        }
                        secondaryName={
                          step2.nameLanguage === 'separate'
                            ? {
                                elementId: `${idPrefix}-proposed-name-fr`,
                                caption:
                                  'New not-for-profit corporation name (proposed) — French',
                                value: step2.proposedNameFr,
                                errorMessage: errors.proposedNameFr,
                                onInput: (value) => {
                                  patchStep2({ proposedNameFr: value });
                                  clearError('proposedNameFr');
                                },
                                onBlur: (value) => patchStep2({ proposedNameFr: value }),
                              }
                            : undefined
                        }
                        value={step2.nameNuans}
                        errors={errors}
                        dateValidatorFor={dateValidatorFor}
                        onChange={setNameNuans}
                        onClearError={clearError}
                      />
                    ) : null}
                  </>
                ) : null}
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
