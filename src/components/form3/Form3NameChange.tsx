import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioCheckboxes,
  OntarioDropdownList,
  OntarioPageAlert,
  OntarioRadioButtons,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import {
  FORM3_CORP_NAME_INFO,
  FORM3_NUMBER_NAME_LEGAL_ELEMENTS,
  validateForm3CorpName,
} from './form3ReviewModel';
import { syncDateFieldByAnchor } from '../form7/dateErrorSync';
import {
  createEmptyNuansReport,
  emptyNameNuans,
  type NameNuansFields,
} from '../form7/form7DraftStorage';
import {
  nuansDateErrorKey,
  ProposedNameAndNuans,
  validateNameNuansFields,
  type NameNuansErrors,
} from '../form7/ProposedNameAndNuans';
import { focusField, getEventValue } from './form3Focus';
import {
  EMPTY_NAME_CHANGE,
  FORM3_TOTAL_STEPS,
  readForm3Draft,
  upsertForm3NameChange,
  type Form3NameChangeData,
  type Form3NameLanguage,
} from './form3DraftStorage';
import styles from './Form3Step1.module.scss';

const CURRENT_STEP = 3;
const ID_PREFIX = 'form3-name';
const INSOLVENCY_ERROR =
  'You must confirm that the corporation is not insolvent within the meaning of subsection 1(3) of the Filings Regulation (O. Reg 393/21) under the Act.';
const SIMILAR_NAME_HELP =
  'If the proposed name of the corporation is similar to the name of an existing corporation, organization, registered business or includes the name of a person, we may require consent to the use of the proposed name from the corporation, organization, business or individual.';

type FieldErrors = NameNuansErrors &
  Partial<{
    changeCorporationName: string;
    hasNumberName: string;
    legalElement: string;
    nameLanguage: string;
    proposedNameFr: string;
    notInsolvent: string;
  }>;

const LANGUAGE_OPTIONS: {
  value: Exclude<Form3NameLanguage, ''>;
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
  language: Form3NameLanguage,
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

function isNameChangeReady() {
  return Boolean(readForm3Draft()?.step1.corporationName);
}

export function Form3NameChange() {
  const navigate = useNavigate();
  const draft = readForm3Draft();
  const ready = isNameChangeReady();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const dateErrorsRef = useRef<FieldErrors>({});

  const [nameChange, setNameChange] = useState<Form3NameChangeData>(() => ({
    ...EMPTY_NAME_CHANGE,
    ...draft?.nameChange,
    nameNuans: draft?.nameChange.nameNuans ?? emptyNameNuans(),
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  dateErrorsRef.current = errors;

  const changeNameOptions = useMemo(
    () => [
      { value: 'change', elementId: 'corp-name-change-yes', label: 'Yes' },
      { value: 'no', elementId: 'corp-name-change-no', label: 'No' },
    ],
    [],
  );
  const hasNameOptions = useMemo(
    () => [
      { value: 'yes', elementId: 'corp-number-name-yes', label: 'Yes' },
      { value: 'no', elementId: 'corp-number-name-no', label: 'No' },
    ],
    [],
  );
  const legalElementOptions = useMemo(
    () =>
      FORM3_NUMBER_NAME_LEGAL_ELEMENTS.map((element) => ({
        value: element,
        label: element,
      })),
    [],
  );

  const errorSummaryItems = useMemo(() => {
    const items: { key: string; message: string; href: string }[] = [];
    const add = (key: string, href: string) => {
      const message = errors[key as keyof FieldErrors];
      if (message) {
        items.push({ key, message, href });
      }
    };
    add('changeCorporationName', '#change-corporation-name');
    add('hasNumberName', '#corp-has-name');
    add('legalElement', '#legal-element');
    add('nameLanguage', '#name-language');
    add('proposedNameFr', '#form3-name-proposed-name-fr');
    if (errors.proposedName) {
      items.push({
        key: 'proposedName',
        message: errors.proposedName,
        href: `#${ID_PREFIX}-proposed-name`,
      });
    }
    for (const report of nameChange.nameNuans.nuansReports) {
      const fileKey = `nuansFile:${report.id}`;
      const dateKey = nuansDateErrorKey(report.id);
      if (errors[fileKey]) {
        items.push({
          key: fileKey,
          message: errors[fileKey] as string,
          href: `#${ID_PREFIX}-nuans-file-${report.id}`,
        });
      }
      if (errors[dateKey]) {
        items.push({
          key: dateKey,
          message: errors[dateKey] as string,
          href: `#${ID_PREFIX}-nuans-date-${report.id}`,
        });
      }
    }
    add('notInsolvent', '#not-insolvent');
    return items;
  }, [errors, nameChange.nameNuans.nuansReports]);

  function clearError(key: string) {
    setErrors((prev) => {
      if (!prev[key as keyof FieldErrors]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key as keyof FieldErrors];
      dateErrorsRef.current = next;
      if (key.startsWith('nuansDate:')) {
        window.requestAnimationFrame(() => syncDateErrors(next));
      }
      return next;
    });
  }

  function patch(partial: Partial<Form3NameChangeData>) {
    setNameChange((prev) => ({ ...prev, ...partial }));
  }

  function setNameNuans(next: NameNuansFields) {
    patch({ nameNuans: next });
  }

  function dateValidatorFor(reportId: string) {
    return () => {
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
    for (const report of nameChange.nameNuans.nuansReports) {
      syncDateFieldByAnchor(
        `${ID_PREFIX}-nuans-date-${report.id}`,
        nextErrors[nuansDateErrorKey(report.id)],
      );
    }
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!nameChange.changeCorporationName) {
      next.changeCorporationName = 'Select Yes or No.';
    } else if (nameChange.changeCorporationName === 'change') {
      if (!nameChange.hasNumberName) {
        next.hasNumberName =
          'Select whether this business corporation will have a number name.';
      } else if (nameChange.hasNumberName === 'yes') {
        if (!nameChange.legalElement) {
          next.legalElement = 'Select a legal element for the number name.';
        }
      } else {
        if (!nameChange.nameLanguage) {
          next.nameLanguage = 'Select the language of the corporation name.';
        } else {
          Object.assign(
            next,
            validateNameNuansFields(
              nameChange.nameNuans,
              'corporation',
              validateForm3CorpName,
            ),
          );
          if (nameChange.nameLanguage === 'separate') {
            const frenchError = validateForm3CorpName(nameChange.proposedNameFr);
            if (frenchError) {
              next.proposedNameFr =
                frenchError === 'Enter the corporation name.'
                  ? 'Enter the French corporation name.'
                  : frenchError;
            }
          }
        }
      }
    }
    if (!nameChange.notInsolvent) {
      next.notInsolvent = INSOLVENCY_ERROR;
    }
    return next;
  }

  function handleContinue() {
    const nextErrors = validate();
    dateErrorsRef.current = nextErrors;
    setErrors(nextErrors);
    const hasErrors = Object.keys(nextErrors).length > 0;
    setShowErrorSummary(hasErrors);
    if (hasErrors) {
      window.requestAnimationFrame(() => {
        syncDateErrors(nextErrors);
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }
    upsertForm3NameChange(nameChange, 'continue', 2);
    navigate('/form-3/step-4');
  }

  function handleSaveAsDraft() {
    upsertForm3NameChange(nameChange, 'draft');
    navigate('/form-3/draft-summary');
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

  if (!ready || !draft) {
    return <Navigate to="/form-3/step-2" replace />;
  }

  const showWordName =
    nameChange.changeCorporationName === 'change' && nameChange.hasNumberName === 'no';
  const showNumberName =
    nameChange.changeCorporationName === 'change' && nameChange.hasNumberName === 'yes';

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-3/step-2"
          currentStep={CURRENT_STEP}
          numberOfSteps={FORM3_TOTAL_STEPS}
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Corporation name</h1>
          <p className={styles.lead}>
            Indicate whether this application includes a change to the corporation&apos;s
            name.
          </p>

          <div className={styles.formStack}>
            <div id="change-corporation-name">
              <OntarioRadioButtons
                caption="Do you want to change the name of the corporation?"
                name="change-corporation-name"
                required
                value={nameChange.changeCorporationName}
                options={changeNameOptions}
                errorMessage={errors.changeCorporationName}
                customOnChange={(event) => {
                  const value = getEventValue(event) as 'change' | 'no';
                  patch({
                    changeCorporationName: value,
                    hasNumberName: value === 'change' ? nameChange.hasNumberName : '',
                    legalElement: value === 'change' ? nameChange.legalElement : '',
                    nameLanguage: value === 'change' ? nameChange.nameLanguage : '',
                    proposedNameFr: value === 'change' ? nameChange.proposedNameFr : '',
                    nameNuans: value === 'no' ? emptyNameNuans() : nameChange.nameNuans,
                  });
                  clearError('changeCorporationName');
                }}
              />
            </div>

            {nameChange.changeCorporationName === 'change' ? (
              <div id="corp-has-name">
                <OntarioRadioButtons
                  caption="Will this business corporation have a number name?"
                  name="corp-has-name"
                  required
                  value={nameChange.hasNumberName}
                  options={hasNameOptions}
                  errorMessage={errors.hasNumberName}
                  customOnChange={(event) => {
                    const value = getEventValue(event) as 'yes' | 'no';
                    patch({
                      hasNumberName: value,
                      legalElement: value === 'yes' ? nameChange.legalElement : '',
                      nameLanguage: value === 'no' ? nameChange.nameLanguage : '',
                      proposedNameFr: value === 'no' ? nameChange.proposedNameFr : '',
                      nameNuans: value === 'no' ? nameChange.nameNuans : emptyNameNuans(),
                    });
                    clearError('hasNumberName');
                  }}
                />
              </div>
            ) : null}

            {showNumberName ? (
              <div id="legal-element">
                <OntarioDropdownList
                  elementId="legal-element-select"
                  caption="Legal element for the Number Name"
                  name="legal-element"
                  required
                  isEmptyStartOption
                  value={nameChange.legalElement}
                  options={legalElementOptions}
                  errorMessage={errors.legalElement}
                  customOnChange={(event) => {
                    patch({ legalElement: getEventValue(event) });
                    clearError('legalElement');
                  }}
                />
              </div>
            ) : null}

            {showWordName ? (
              <>
                <div className={styles.infoAlert}>
                  <OntarioPageAlert
                    type="informational"
                    heading="Proposed corporation name"
                    content={SIMILAR_NAME_HELP}
                  />
                </div>
                <div id="name-language">
                  <OntarioRadioButtons
                    caption="The corporation will have"
                    name="name-language"
                    required
                    value={nameChange.nameLanguage}
                    options={LANGUAGE_OPTIONS}
                    errorMessage={errors.nameLanguage}
                    customOnChange={(event) => {
                      const value = getEventValue(event) as Exclude<
                        Form3NameLanguage,
                        ''
                      >;
                      patch({
                        nameLanguage: value,
                        proposedNameFr:
                          value === 'separate' ? nameChange.proposedNameFr : '',
                        nameNuans: reportsForLanguage(value, nameChange.nameNuans),
                      });
                      clearError('nameLanguage');
                      if (value !== 'separate') {
                        clearError('proposedNameFr');
                      }
                    }}
                  />
                </div>
                {nameChange.nameLanguage ? (
                  <>
                    <p className={styles.helpText}>{FORM3_CORP_NAME_INFO}</p>
                    <ProposedNameAndNuans
                      idPrefix={ID_PREFIX}
                      nameKind="corporation"
                      proposedNameCaption={
                        nameChange.nameLanguage === 'separate'
                          ? 'New Corporation Name (Proposed) — English'
                          : undefined
                      }
                      secondaryName={
                        nameChange.nameLanguage === 'separate'
                          ? {
                              elementId: `${ID_PREFIX}-proposed-name-fr`,
                              caption:
                                'New Corporation Name (Proposed) — French',
                              value: nameChange.proposedNameFr,
                              errorMessage: errors.proposedNameFr,
                              onInput: (value) => {
                                patch({ proposedNameFr: value });
                                clearError('proposedNameFr');
                              },
                              onBlur: (value) => patch({ proposedNameFr: value }),
                            }
                          : undefined
                      }
                      value={nameChange.nameNuans}
                      errors={errors}
                      dateValidatorFor={dateValidatorFor}
                      onChange={setNameNuans}
                      onClearError={clearError}
                    />
                  </>
                ) : null}
              </>
            ) : null}

            <div id="not-insolvent">
              <OntarioCheckboxes
                caption={{
                  captionText: 'Insolvency confirmation',
                  captionType: 'default',
                }}
                name="not-insolvent"
                required
                options={[
                  {
                    value: 'confirmed',
                    elementId: 'not-insolvent-yes',
                    label:
                      'The corporation is not insolvent within the meaning of subsection 1(3) of the Filings Regulation (O. Reg 393/21) under the Act.',
                  },
                ]}
                value={nameChange.notInsolvent ? ['confirmed'] : []}
                errorMessage={errors.notInsolvent}
                customOnChange={(event) => {
                  const checked = Boolean(
                    (event.target as HTMLInputElement | null)?.checked,
                  );
                  patch({ notInsolvent: checked });
                  clearError('notInsolvent');
                }}
              />
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
              label="Cancel"
              onClick={handleCancel}
            />
          </div>
        </div>
      </div>
    </>
  );
}
