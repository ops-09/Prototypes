import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioDropdownList,
  OntarioPageAlert,
  OntarioRadioButtons,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { validateCooperativeName } from '../form2/nameValidation';
import { syncDateFieldByAnchor } from '../form7/dateErrorSync';
import {
  emptyNameNuans,
  type NameNuansFields,
} from '../form7/form7DraftStorage';
import {
  nuansDateErrorKey,
  ProposedNameAndNuans,
  validateNameNuansFields,
  type NameNuansErrors,
} from '../form7/ProposedNameAndNuans';
import {
  EMPTY_NAME_CHANGE,
  FORM10_TOTAL_STEPS,
  MIN_AMALGAMATING_COOPS,
  readForm10Draft,
  upsertForm10NameChange,
  type Form10NameChangeData,
} from './form10DraftStorage';
import styles from './Form10Step1.module.scss';

const CURRENT_STEP = 4;
const ID_PREFIX = 'form10-name';

type FieldErrors = NameNuansErrors &
  Partial<{
    changeCooperativeName: string;
    selectedAmalgamatedCooperativeId: string;
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

function nameNuansErrorHref(key: string, reports: NameNuansFields['nuansReports']) {
  if (key === 'proposedName') {
    return `#${ID_PREFIX}-proposed-name`;
  }
  if (key.startsWith('nuansFile:')) {
    const reportId = key.slice('nuansFile:'.length);
    return `#${ID_PREFIX}-nuans-file-${reportId}`;
  }
  if (key.startsWith('nuansDate:')) {
    const reportId = key.slice('nuansDate:'.length);
    return `#${ID_PREFIX}-nuans-date-${reportId}`;
  }
  const firstId = reports[0]?.id;
  return firstId ? `#${ID_PREFIX}-nuans-date-${firstId}` : `#${ID_PREFIX}-proposed-name`;
}

function isNameChangeReady() {
  const existing = readForm10Draft();
  return Boolean(
    existing?.step1.cooperativeName &&
      existing.step2.amalgamatingCooperatives.length >= MIN_AMALGAMATING_COOPS &&
      existing.step2.agreementApproved,
  );
}

export function Form10NameChange() {
  const navigate = useNavigate();
  const draft = readForm10Draft();
  const ready = isNameChangeReady();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const dateErrorsRef = useRef<FieldErrors>({});

  const [nameChange, setNameChange] = useState<Form10NameChangeData>(() => ({
    ...EMPTY_NAME_CHANGE,
    ...draft?.nameChange,
    changeCooperativeName: draft?.nameChange.changeCooperativeName ?? '',
    nameNuans: draft?.nameChange.nameNuans ?? emptyNameNuans(),
    selectedAmalgamatedCooperativeId:
      draft?.nameChange.selectedAmalgamatedCooperativeId ?? '',
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  dateErrorsRef.current = errors;

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

  const amalgamatingNameOptions = useMemo(
    () =>
      (draft?.step2.amalgamatingCooperatives ?? [])
        .filter((coop) => coop.legalName.trim())
        .map((coop) => ({
          value: coop.id,
          label: coop.legalName.trim(),
        })),
    [draft?.step2.amalgamatingCooperatives],
  );

  const errorSummaryItems = useMemo(() => {
    const items: { key: string; message: string; href: string }[] = [];
    if (errors.changeCooperativeName) {
      items.push({
        key: 'changeCooperativeName',
        message: errors.changeCooperativeName,
        href: '#change-cooperative-name',
      });
    }
    if (errors.selectedAmalgamatedCooperativeId) {
      items.push({
        key: 'selectedAmalgamatedCooperativeId',
        message: errors.selectedAmalgamatedCooperativeId,
        href: '#amalgamated-cooperative-name',
      });
    }
    if (errors.proposedName) {
      items.push({
        key: 'proposedName',
        message: errors.proposedName,
        href: nameNuansErrorHref('proposedName', nameChange.nameNuans.nuansReports),
      });
    }
    nameChange.nameNuans.nuansReports.forEach((report) => {
      const fileKey = `nuansFile:${report.id}` as const;
      const dateKey = `nuansDate:${report.id}` as const;
      if (errors[fileKey]) {
        items.push({
          key: fileKey,
          message: errors[fileKey] ?? '',
          href: nameNuansErrorHref(fileKey, nameChange.nameNuans.nuansReports),
        });
      }
      if (errors[dateKey]) {
        items.push({
          key: dateKey,
          message: errors[dateKey] ?? '',
          href: nameNuansErrorHref(dateKey, nameChange.nameNuans.nuansReports),
        });
      }
    });
    return items;
  }, [errors, nameChange.nameNuans.nuansReports]);

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

  function patchNameChange(partial: Partial<Form10NameChangeData>) {
    setNameChange((prev) => ({ ...prev, ...partial }));
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
    for (const report of nameChange.nameNuans.nuansReports) {
      syncDateFieldByAnchor(
        `${ID_PREFIX}-nuans-date-${report.id}`,
        nextErrors[nuansDateErrorKey(report.id)],
      );
    }
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!nameChange.changeCooperativeName) {
      next.changeCooperativeName = 'Select Yes or No.';
    } else if (nameChange.changeCooperativeName === 'change') {
      Object.assign(
        next,
        validateNameNuansFields(
          nameChange.nameNuans,
          'cooperative',
          validateCooperativeName,
        ),
      );
    } else if (nameChange.changeCooperativeName === 'no') {
      const selected = draft?.step2.amalgamatingCooperatives.find(
        (coop) =>
          coop.id === nameChange.selectedAmalgamatedCooperativeId &&
          coop.legalName.trim(),
      );
      if (!selected) {
        next.selectedAmalgamatedCooperativeId =
          'Select the name of the amalgamated co-operative.';
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
    upsertForm10NameChange(nameChange, 'continue', 3);
    navigate('/form-10/step-5');
  }

  function handleSaveAsDraft() {
    upsertForm10NameChange(nameChange, 'draft', 2);
    navigate('/form-10/draft-summary');
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
    return <Navigate to="/form-10/step-3" replace />;
  }

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-10/step-3"
          currentStep={CURRENT_STEP}
          numberOfSteps={FORM10_TOTAL_STEPS}
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
            Confirm whether the amalgamated co-operative will use a new name.
          </p>

          <div className={styles.formStack}>
            <div id="change-cooperative-name">
              <OntarioRadioButtons
                caption={{
                  captionText: 'Do you want to change the co-operative name?',
                  captionType: 'default',
                }}
                name="change-cooperative-name"
                required
                value={nameChange.changeCooperativeName}
                options={changeNameOptions}
                errorMessage={errors.changeCooperativeName}
                customOnChange={(event) => {
                  const value = getEventValue(event) as 'change' | 'no';
                  patchNameChange({
                    changeCooperativeName: value,
                    nameNuans:
                      value === 'no' ? emptyNameNuans() : nameChange.nameNuans,
                  });
                  clearError('changeCooperativeName');
                  if (value === 'no') {
                    setErrors({});
                    dateErrorsRef.current = {};
                    window.requestAnimationFrame(() => syncDateErrors({}));
                  } else {
                    clearError('selectedAmalgamatedCooperativeId');
                  }
                }}
              />
            </div>

            {nameChange.changeCooperativeName === 'no' ? (
              <div id="amalgamated-cooperative-name">
                <OntarioDropdownList
                  elementId="amalgamated-cooperative-name"
                  caption="Please select the name of the amalgamated co-operative"
                  name="amalgamated-cooperative-name"
                  required
                  isEmptyStartOption
                  value={
                    amalgamatingNameOptions.some(
                      (option) =>
                        option.value === nameChange.selectedAmalgamatedCooperativeId,
                    )
                      ? nameChange.selectedAmalgamatedCooperativeId
                      : ''
                  }
                  options={amalgamatingNameOptions}
                  errorMessage={errors.selectedAmalgamatedCooperativeId}
                  customOnChange={(event) => {
                    patchNameChange({
                      selectedAmalgamatedCooperativeId: getEventValue(event),
                    });
                    clearError('selectedAmalgamatedCooperativeId');
                  }}
                />
              </div>
            ) : null}

            {nameChange.changeCooperativeName === 'change' ? (
              <ProposedNameAndNuans
                idPrefix={ID_PREFIX}
                nameKind="cooperative"
                leadText={[
                  'An Ontario NUANS name search report for the proposed name of the co-operative. The search report must be submitted with the application within 90 days of the production of the report.',
                  'The name of the co-operative must have “CO-OPERATIVE” or “COOPÉRATIVE” in the name. The name of the co-operative must end with one of the following legal elements: “INCORPORATED”, “INCORPORÉE”, “CORPORATION”, “INC.” or “CORP.”.',
                ]}
                value={nameChange.nameNuans}
                errors={errors}
                dateValidatorFor={dateValidatorFor}
                onChange={(next) => patchNameChange({ nameNuans: next })}
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
