import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioPageAlert,
  OntarioRadioButtons,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { FORM3_CORP_NAME_INFO, validateForm3CorpName } from './form3ReviewModel';
import { syncDateFieldByAnchor } from '../form7/dateErrorSync';
import { emptyNameNuans, type NameNuansFields } from '../form7/form7DraftStorage';
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
} from './form3DraftStorage';
import styles from './Form3Step1.module.scss';

const CURRENT_STEP = 3;
const ID_PREFIX = 'form3-name';
const SIMILAR_NAME_HELP =
  'If the proposed name of the corporation is similar to the name of an existing corporation, organization, registered business or includes the name of a person, we may require consent to the use of the proposed name from the corporation, organization, business or individual.';

type FieldErrors = NameNuansErrors &
  Partial<{
    changeCorporationName: string;
  }>;

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

  const errorSummaryItems = useMemo(() => {
    const items: { key: string; message: string; href: string }[] = [];
    if (errors.changeCorporationName) {
      items.push({
        key: 'changeCorporationName',
        message: errors.changeCorporationName,
        href: '#change-corporation-name',
      });
    }
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
      Object.assign(
        next,
        validateNameNuansFields(
          nameChange.nameNuans,
          'corporation',
          validateForm3CorpName,
        ),
      );
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

  const showNameAndNuans = nameChange.changeCorporationName === 'change';

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
                    hasNumberName: '',
                    legalElement: '',
                    nameLanguage: '',
                    proposedNameFr: '',
                    nameNuans: value === 'no' ? emptyNameNuans() : nameChange.nameNuans,
                  });
                  clearError('changeCorporationName');
                }}
              />
            </div>

            {showNameAndNuans ? (
              <>
                <div className={styles.infoAlert}>
                  <OntarioPageAlert
                    type="informational"
                    heading="Proposed corporation name"
                    content={SIMILAR_NAME_HELP}
                  />
                </div>
                <p className={styles.helpText}>{FORM3_CORP_NAME_INFO}</p>
                <ProposedNameAndNuans
                  idPrefix={ID_PREFIX}
                  nameKind="corporation"
                  value={nameChange.nameNuans}
                  errors={errors}
                  dateValidatorFor={dateValidatorFor}
                  onChange={setNameNuans}
                  onClearError={clearError}
                />
              </>
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
