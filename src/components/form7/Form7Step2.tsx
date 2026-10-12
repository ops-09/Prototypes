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
  EMPTY_NAME_NUANS,
  EMPTY_STEP2,
  OBR_INCORPORATION_DATE,
  OBR_OCN,
  readForm7Draft,
  upsertForm7Step2,
  type AmendmentType,
  type Form7Step2Data,
  type NameNuansFields,
} from './form7DraftStorage';
import { Form7RegistryCallout } from './Form7RegistryCallout';
import {
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
  }>;

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

function nameNuansErrorAnchors(idPrefix: string): Record<keyof NameNuansErrors, string> {
  return {
    languageOption: `${idPrefix}-language`,
    proposedName: `${idPrefix}-proposed-name`,
    proposedNameEn: `${idPrefix}-proposed-name-en`,
    proposedNameFr: `${idPrefix}-proposed-name-fr`,
    nuansFile: `${idPrefix}-nuans-file`,
    nuansFileEn: `${idPrefix}-nuans-file-en`,
    nuansFileFr: `${idPrefix}-nuans-file-fr`,
    nuansDate: `${idPrefix}-nuans-date`,
    nuansDateEn: `${idPrefix}-nuans-date-en`,
    nuansDateFr: `${idPrefix}-nuans-date-fr`,
  };
}

export function Form7Step2() {
  const navigate = useNavigate();
  const draft = readForm7Draft();

  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const dateErrorsRef = useRef<Step2Errors>({});

  const [step2, setStep2] = useState<Form7Step2Data>(() => ({
    ...EMPTY_STEP2,
    ...(draft?.step2 ?? {}),
    nameNuans: { ...EMPTY_NAME_NUANS, ...(draft?.step2?.nameNuans ?? {}) },
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
        nameNuans: { ...EMPTY_NAME_NUANS, ...draft.step2.nameNuans },
        changeCooperativeName: draft.step2.changeCooperativeName ?? '',
      });
    }
    // Load once from session on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const idPrefix = 'form7-step2';
  const nameAnchors = nameNuansErrorAnchors(idPrefix);

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
          'Articles of Amendment (converting to a Business Corporations Act Corporation)',
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
    const order: Array<{ key: keyof Step2Errors; href: string }> = [
      { key: 'amendmentType', href: '#amendment-type' },
      { key: 'changeCooperativeName', href: '#change-cooperative-name' },
      { key: 'hasNumberName', href: '#corp-has-name' },
      { key: 'legalElement', href: '#legal-element' },
      { key: 'languageOption', href: `#${nameAnchors.languageOption}` },
      { key: 'proposedName', href: `#${nameAnchors.proposedName}` },
      { key: 'proposedNameEn', href: `#${nameAnchors.proposedNameEn}` },
      { key: 'proposedNameFr', href: `#${nameAnchors.proposedNameFr}` },
      { key: 'nuansFile', href: `#${nameAnchors.nuansFile}` },
      { key: 'nuansDate', href: `#${nameAnchors.nuansDate}` },
      { key: 'nuansFileEn', href: `#${nameAnchors.nuansFileEn}` },
      { key: 'nuansDateEn', href: `#${nameAnchors.nuansDateEn}` },
      { key: 'nuansFileFr', href: `#${nameAnchors.nuansFileFr}` },
      { key: 'nuansDateFr', href: `#${nameAnchors.nuansDateFr}` },
    ];

    return order.flatMap(({ key, href }) => {
      const message = errors[key];
      if (!message) {
        return [];
      }
      return [{ key, message, href }];
    });
  }, [errors, nameAnchors]);

  if (!draft?.step1.cooperativeName) {
    return <Navigate to="/form-7" replace />;
  }

  function clearError(key: keyof Step2Errors) {
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      // Keep dateValidator in sync immediately; also clear forced ODS shadow styles
      // (OntarioDateInput has no errorMessage prop — submit injects borders via sync).
      dateErrorsRef.current = next;
      if (key === 'nuansDate' || key === 'nuansDateEn' || key === 'nuansDateFr') {
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

  function dateValidatorFor(key: 'nuansDate' | 'nuansDateEn' | 'nuansDateFr') {
    return (_day: string, _month: string, _year: string) => {
      const message = dateErrorsRef.current[key];
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
        Object.assign(
          next,
          validateNameNuansFields(step2.nameNuans, 'nfp', validateNfpCorporationName),
        );
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
      } else {
        Object.assign(
          next,
          validateNameNuansFields(step2.nameNuans, 'corporation', validateCorporationName),
        );
      }
    }

    return next;
  }

  function syncDateErrors(nextErrors: Step2Errors) {
    syncDateFieldByAnchor(`${idPrefix}-nuans-date`, nextErrors.nuansDate);
    syncDateFieldByAnchor(`${idPrefix}-nuans-date-en`, nextErrors.nuansDateEn);
    syncDateFieldByAnchor(`${idPrefix}-nuans-date-fr`, nextErrors.nuansDateFr);
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
    navigate('/form-7/step-3');
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
      numberNameNuansFile: null,
      numberNameNuansDate: '',
      nameNuans: { ...EMPTY_NAME_NUANS },
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
          backButtonUrl="/form-7/step-1"
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
                  captionText: 'Select the Amendment type:',
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
                          value === 'no' ? { ...EMPTY_NAME_NUANS } : step2.nameNuans,
                      });
                      clearError('changeCooperativeName');
                      if (value === 'no') {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.languageOption;
                          delete next.proposedName;
                          delete next.proposedNameEn;
                          delete next.proposedNameFr;
                          delete next.nuansFile;
                          delete next.nuansFileEn;
                          delete next.nuansFileFr;
                          delete next.nuansDate;
                          delete next.nuansDateEn;
                          delete next.nuansDateFr;
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
                    leadText="Every co-operative must have a name. You need a NUANS report for the proposed name."
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
                        numberNameNuansFile: null,
                        numberNameNuansDate: '',
                        nameNuans: value === 'no' ? step2.nameNuans : { ...EMPTY_NAME_NUANS },
                      });
                      clearError('hasNumberName');
                      if (value !== 'yes') {
                        clearError('legalElement');
                      }
                    }}
                  />
                </div>

                {step2.hasNumberName === 'yes' ? (
                  <div id="legal-element">
                    <OntarioDropdownList
                      elementId="legal-element-select"
                      caption="Legal element for the Number Name"
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
                  <ProposedNameAndNuans
                    idPrefix={idPrefix}
                    nameKind="corporation"
                    value={step2.nameNuans}
                    errors={errors}
                    dateValidatorFor={dateValidatorFor}
                    onChange={setNameNuans}
                    onClearError={clearError}
                  />
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
                        numberNameNuansFile: null,
                        numberNameNuansDate: '',
                        nameNuans: value === 'no' ? step2.nameNuans : { ...EMPTY_NAME_NUANS },
                      });
                      clearError('hasNumberName');
                    }}
                  />
                </div>

                {step2.hasNumberName === 'no' ? (
                  <ProposedNameAndNuans
                    idPrefix={idPrefix}
                    nameKind="nfp"
                    leadText="Every Not-for-Profit corporation must have a name. You need a NUANS report for the proposed name."
                    value={step2.nameNuans}
                    errors={errors}
                    dateValidatorFor={dateValidatorFor}
                    onChange={setNameNuans}
                    onClearError={clearError}
                  />
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
