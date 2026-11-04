import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioCheckboxes,
  OntarioIconAdd,
  OntarioIconDelete,
  OntarioInput,
  OntarioPageAlert,
  OntarioRadioButtons,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { FieldErrorMessage } from '../form1/FieldErrorMessage';
import { DIRECTOR_CONSENT_FORM_URL, type DirectorCountMode, type YesNoAnswer } from '../form1/form1DraftStorage';
import styles from '../form2/Form2Step1.module.scss';
import step4Styles from '../form1/Form1Step4.module.scss';
import {
  formatDirectorFullName,
  formatDirectorListDescription,
} from './ContinuanceDirectorEditor';
import { focusField, getEventValue } from './continuanceFocus';
import { useContinuanceReviewReturn } from './continuanceReviewReturn';
import {
  CONTINUANCE_STAKEHOLDER_GROUP_IDS,
  CONTINUANCE_TOTAL_STEPS,
  EMPTY_STEP6,
  emptyStakeholderGroups,
  ensureContinuanceStep6Draft,
  getDirectorLimit,
  getDirectorMinimum,
  readContinuanceDraft,
  stakeholderGroupIsEmpty,
  upsertContinuanceStep6,
  type ContinuanceFormId,
  type ContinuanceStakeholderGroup,
  type ContinuanceStakeholderGroupId,
  type ContinuanceStep6Data,
} from './continuanceDraftStorage';
import groupStyles from './ContinuanceStep6.module.scss';

const CURRENT_STEP = 6;
const REQUIRED_FIELD = 'Required Field.';
const WHOLE_NUMBER_ERROR = 'Please enter a whole number greater than 0.';
const MIN_MAX_ORDER_ERROR =
  'The minimum number of directors cannot be greater than the maximum.';
const GROUP_MIN_MAX_ORDER_ERROR =
  'The minimum number of directors a group may elect cannot be greater than the maximum.';
const TWO_GROUPS_ERROR = 'At least two stakeholder groups must be entered.';
const CONSENT_ERROR = 'Written consent for the first directors must be confirmed to continue.';
const FIXED_DIRECTORS_COUNT_ERROR =
  'The number of directors added must match the fixed number of directors.';

function minDirectorsCountError(minimum: number) {
  return `At least ${minimum} directors must be added.`;
}

function maxDirectorsCountError(maximum: number) {
  return `No more than ${maximum} directors may be added.`;
}

type GroupFieldSuffix = 'Name' | 'Min' | 'Max';
type GroupFieldKey = `group${ContinuanceStakeholderGroupId}${GroupFieldSuffix}`;
type PageFieldKey =
  | 'countMode'
  | 'fixedNumber'
  | 'minimumNumber'
  | 'maximumNumber'
  | 'multiStakeholder'
  | 'groups'
  | GroupFieldKey
  | 'consent'
  | 'directors';
type PageErrors = Partial<Record<PageFieldKey, string>>;

const FIELD_ANCHORS: Record<PageFieldKey, string> = {
  countMode: 'director-count-mode',
  fixedNumber: 'fixed-number-of-directors',
  minimumNumber: 'minimum-number-of-directors',
  maximumNumber: 'maximum-number-of-directors',
  multiStakeholder: 'multi-stakeholder',
  groups: 'stakeholder-groups',
  groupAName: 'group-a-name',
  groupAMin: 'group-a-minimum',
  groupAMax: 'group-a-maximum',
  groupBName: 'group-b-name',
  groupBMin: 'group-b-minimum',
  groupBMax: 'group-b-maximum',
  groupCName: 'group-c-name',
  groupCMin: 'group-c-minimum',
  groupCMax: 'group-c-maximum',
  groupDName: 'group-d-name',
  groupDMin: 'group-d-minimum',
  groupDMax: 'group-d-maximum',
  consent: 'written-consent',
  directors: 'first-directors',
};

const FIELD_ORDER: PageFieldKey[] = [
  'countMode',
  'fixedNumber',
  'minimumNumber',
  'maximumNumber',
  'multiStakeholder',
  'groups',
  'groupAName',
  'groupAMin',
  'groupAMax',
  'groupBName',
  'groupBMin',
  'groupBMax',
  'groupCName',
  'groupCMin',
  'groupCMax',
  'groupDName',
  'groupDMin',
  'groupDMax',
  'consent',
  'directors',
];

const COUNT_MODE_OPTIONS = [
  { value: 'fixed', elementId: 'count-fixed', label: 'Fixed number' },
  { value: 'minMax', elementId: 'count-min-max', label: 'Minimum and maximum' },
];

const YES_NO_OPTIONS = [
  { value: 'yes', elementId: 'multi-yes', label: 'Yes' },
  { value: 'no', elementId: 'multi-no', label: 'No' },
];

function groupFieldKeys(id: ContinuanceStakeholderGroupId) {
  return {
    name: `group${id}Name` as GroupFieldKey,
    min: `group${id}Min` as GroupFieldKey,
    max: `group${id}Max` as GroupFieldKey,
  };
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function parseDirectorCount(value: string) {
  if (!value.trim()) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function wholeNumberError(value: string, required: boolean): string | undefined {
  if (!value.trim()) {
    return required ? REQUIRED_FIELD : undefined;
  }
  const parsed = parseDirectorCount(value);
  if (parsed === null || parsed < 1) {
    return WHOLE_NUMBER_ERROR;
  }
  return undefined;
}

function areDirectorCountFieldsValid(data: ContinuanceStep6Data) {
  if (data.countMode === 'fixed') {
    const fixed = parseDirectorCount(data.fixedNumber);
    return fixed !== null && fixed > 0;
  }
  if (data.countMode === 'minMax') {
    const min = parseDirectorCount(data.minimumNumber);
    const max = parseDirectorCount(data.maximumNumber);
    return min !== null && max !== null && min > 0 && max > 0 && min <= max;
  }
  return false;
}

function getDirectorsCountError(data: ContinuanceStep6Data): string | undefined {
  const addedCount = data.directors.length;
  const minimum = getDirectorMinimum(data);
  const maximum = getDirectorLimit(data);

  if (data.countMode === 'fixed' && minimum !== null && addedCount !== minimum) {
    return FIXED_DIRECTORS_COUNT_ERROR;
  }
  if (data.countMode === 'minMax' && minimum !== null && addedCount < minimum) {
    return minDirectorsCountError(minimum);
  }
  if (data.countMode === 'minMax' && maximum !== null && addedCount > maximum) {
    return maxDirectorsCountError(maximum);
  }
  return undefined;
}

function applyGroupErrors(
  group: ContinuanceStakeholderGroup,
  id: ContinuanceStakeholderGroupId,
  page: PageErrors,
  required: boolean,
) {
  const keys = groupFieldKeys(id);
  if (!group.name.trim()) {
    if (required) {
      page[keys.name] = REQUIRED_FIELD;
    }
  }
  const minError = wholeNumberError(group.minimumNumber, required);
  if (minError) {
    page[keys.min] = minError;
  }
  const maxError = wholeNumberError(group.maximumNumber, required);
  if (maxError) {
    page[keys.max] = maxError;
  }
  const min = parseDirectorCount(group.minimumNumber);
  const max = parseDirectorCount(group.maximumNumber);
  if (min !== null && max !== null && min > 0 && max > 0 && min > max) {
    page[keys.min] = GROUP_MIN_MAX_ORDER_ERROR;
  }
}

function formatDirectorSelectionSummary(data: ContinuanceStep6Data) {
  if (data.countMode === 'fixed') {
    return `You selected a fixed number of ${data.fixedNumber.trim()} directors.`;
  }
  return `You selected a minimum of ${data.minimumNumber.trim()} and a maximum of ${data.maximumNumber.trim()} directors.`;
}

type ContinuanceStep6Props = {
  formId: ContinuanceFormId;
};

export function ContinuanceStep6({ formId }: ContinuanceStep6Props) {
  const navigate = useNavigate();
  const { afterSave, hrefWithReturn } = useContinuanceReviewReturn(formId);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const [draft] = useState(() => ensureContinuanceStep6Draft(formId));

  const [step6, setStep6] = useState<ContinuanceStep6Data>(() => ({
    ...EMPTY_STEP6,
    ...draft.step6,
    groups: draft.step6?.groups ?? emptyStakeholderGroups(),
    directors: draft.step6?.directors ?? [],
  }));
  const [errors, setErrors] = useState<PageErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

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

  const directorLimit = getDirectorLimit(step6);
  const atDirectorLimit = directorLimit !== null && step6.directors.length >= directorLimit;
  const accountAlreadyAdded = step6.directors.some((entry) => entry.addedFromAccount);
  const showDirectorList = areDirectorCountFieldsValid(step6);

  function patchStep6(partial: Partial<ContinuanceStep6Data>) {
    setStep6((prev) => ({ ...prev, ...partial }));
  }

  function patchGroup(
    id: ContinuanceStakeholderGroupId,
    partial: Partial<ContinuanceStakeholderGroup>,
  ) {
    setStep6((prev) => ({
      ...prev,
      groups: {
        ...prev.groups,
        [id]: { ...prev.groups[id], ...partial },
      },
    }));
  }

  function clearError(key: PageFieldKey) {
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function clearGroupErrors(id: ContinuanceStakeholderGroupId) {
    const keys = groupFieldKeys(id);
    clearError(keys.name);
    clearError(keys.min);
    clearError(keys.max);
    clearError('groups');
  }

  function syncLiveMinMaxCountErrors(data: ContinuanceStep6Data) {
    const minError = wholeNumberError(data.minimumNumber, false);
    if (minError) {
      setErrors((prev) => ({ ...prev, minimumNumber: minError }));
      return;
    }
    const min = parseDirectorCount(data.minimumNumber);
    const max = parseDirectorCount(data.maximumNumber);
    if (min !== null && max !== null && min > max) {
      setErrors((prev) => ({ ...prev, minimumNumber: MIN_MAX_ORDER_ERROR }));
      return;
    }
    clearError('minimumNumber');
  }

  function validatePage(): PageErrors {
    const page: PageErrors = {};
    if (!step6.countMode) {
      page.countMode = REQUIRED_FIELD;
    }
    if (step6.countMode === 'fixed') {
      const error = wholeNumberError(step6.fixedNumber, true);
      if (error) {
        page.fixedNumber = error;
      }
    }
    if (step6.countMode === 'minMax') {
      const minError = wholeNumberError(step6.minimumNumber, true);
      if (minError) {
        page.minimumNumber = minError;
      }
      const maxError = wholeNumberError(step6.maximumNumber, true);
      if (maxError) {
        page.maximumNumber = maxError;
      }
      const min = parseDirectorCount(step6.minimumNumber);
      const max = parseDirectorCount(step6.maximumNumber);
      if (min !== null && max !== null && min > 0 && max > 0 && min > max) {
        page.minimumNumber = MIN_MAX_ORDER_ERROR;
      }
    }
    if (!step6.multiStakeholder) {
      page.multiStakeholder = REQUIRED_FIELD;
    }
    if (step6.multiStakeholder === 'yes') {
      let missingRequiredGroup = false;
      for (const id of ['A', 'B'] as const) {
        const group = step6.groups[id];
        if (stakeholderGroupIsEmpty(group)) {
          missingRequiredGroup = true;
        }
        applyGroupErrors(group, id, page, true);
      }
      for (const id of ['C', 'D'] as const) {
        const group = step6.groups[id];
        if (stakeholderGroupIsEmpty(group)) {
          continue;
        }
        applyGroupErrors(group, id, page, true);
      }
      if (missingRequiredGroup) {
        page.groups = TWO_GROUPS_ERROR;
      }
    }
    if (!step6.consentConfirmed) {
      page.consent = CONSENT_ERROR;
    }
    const directorsError = getDirectorsCountError(step6);
    if (directorsError) {
      page.directors = directorsError;
    }
    return page;
  }

  function persistStep6(next: ContinuanceStep6Data) {
    upsertContinuanceStep6(
      formId,
      next,
      'draft',
      readContinuanceDraft(formId)?.lastCompletedStep ?? 5,
    );
  }

  function handleContinue() {
    const page = validatePage();
    setErrors(page);
    const hasErrors = Object.keys(page).length > 0;
    setShowErrorSummary(hasErrors);
    if (hasErrors) {
      window.requestAnimationFrame(() => {
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }
    upsertContinuanceStep6(formId, step6, 'continue');
    navigate(afterSave(`/form-${formId}/step-7`));
  }

  function handleSaveAsDraft() {
    upsertContinuanceStep6(
      formId,
      step6,
      'draft',
      readContinuanceDraft(formId)?.lastCompletedStep ?? 5,
    );
    navigate(`/form-${formId}/draft-summary`);
  }

  function handleCancel() {
    const leave = window.confirm('Leave this filing without saving further changes?');
    if (leave) {
      navigate('/');
    }
  }

  function startAddDirector(fromAccount = false) {
    if (atDirectorLimit) {
      return;
    }
    clearError('directors');
    persistStep6(step6);
    navigate(
      hrefWithReturn(
        fromAccount
          ? `/form-${formId}/step-6/directors/new?fromAccount=1`
          : `/form-${formId}/step-6/directors/new`,
      ),
    );
  }

  function editDirector(id: string) {
    persistStep6(step6);
    navigate(hrefWithReturn(`/form-${formId}/step-6/directors/${id}`));
  }

  function removeDirector(id: string) {
    setStep6((prev) => {
      const next = {
        ...prev,
        directors: prev.directors.filter((entry) => entry.id !== id),
      };
      persistStep6(next);
      return next;
    });
    clearError('directors');
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
          backButtonUrl={`/form-${formId}/step-5`}
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Directors</h1>

          <div className={styles.formStack}>
            <div id={FIELD_ANCHORS.countMode}>
              <OntarioRadioButtons
                caption="Number of directors is/are"
                name="director-count-mode"
                required
                hintText="Please provide us how many directors the co-operative can have."
                value={step6.countMode}
                options={COUNT_MODE_OPTIONS}
                errorMessage={errors.countMode}
                customOnChange={(event) => {
                  const value = getEventValue(event) as DirectorCountMode;
                  patchStep6({
                    countMode: value,
                    ...(value === 'fixed'
                      ? { minimumNumber: '', maximumNumber: '' }
                      : { fixedNumber: '' }),
                  });
                  clearError('countMode');
                  clearError('fixedNumber');
                  clearError('minimumNumber');
                  clearError('maximumNumber');
                  clearError('directors');
                }}
              />
            </div>

            {step6.countMode === 'fixed' ? (
              <div id={FIELD_ANCHORS.fixedNumber} className={step4Styles.countFields}>
                <OntarioInput
                  elementId={FIELD_ANCHORS.fixedNumber}
                  caption="Fixed number of directors"
                  name="fixed-number-of-directors"
                  type="text"
                  required
                  requiredValidationMessage={REQUIRED_FIELD}
                  hintText="Enter a whole number greater than 0."
                  inputWidth="5-char-width"
                  value={step6.fixedNumber}
                  errorMessage={errors.fixedNumber}
                  customOnInput={(event) => {
                    const fixedNumber = digitsOnly(getEventValue(event));
                    patchStep6({ fixedNumber });
                    clearError('directors');
                    const countError = wholeNumberError(fixedNumber, false);
                    if (countError) {
                      setErrors((prev) => ({ ...prev, fixedNumber: countError }));
                    } else {
                      clearError('fixedNumber');
                    }
                  }}
                />
              </div>
            ) : null}

            {step6.countMode === 'minMax' ? (
              <div className={step4Styles.countFields}>
                <div id={FIELD_ANCHORS.minimumNumber}>
                  <OntarioInput
                    elementId={FIELD_ANCHORS.minimumNumber}
                    caption="Minimum number of directors"
                    name="minimum-number-of-directors"
                    type="text"
                    required
                    requiredValidationMessage={REQUIRED_FIELD}
                    hintText="Enter a whole number greater than 0."
                    inputWidth="5-char-width"
                    value={step6.minimumNumber}
                    errorMessage={errors.minimumNumber}
                    customOnInput={(event) => {
                      const minimumNumber = digitsOnly(getEventValue(event));
                      const next = { ...step6, minimumNumber };
                      patchStep6({ minimumNumber });
                      clearError('directors');
                      syncLiveMinMaxCountErrors(next);
                    }}
                  />
                </div>
                <div id={FIELD_ANCHORS.maximumNumber}>
                  <OntarioInput
                    elementId={FIELD_ANCHORS.maximumNumber}
                    caption="Maximum number of directors"
                    name="maximum-number-of-directors"
                    type="text"
                    required
                    requiredValidationMessage={REQUIRED_FIELD}
                    hintText="Enter a whole number greater than 0."
                    inputWidth="5-char-width"
                    value={step6.maximumNumber}
                    errorMessage={errors.maximumNumber}
                    customOnInput={(event) => {
                      const maximumNumber = digitsOnly(getEventValue(event));
                      const next = { ...step6, maximumNumber };
                      patchStep6({ maximumNumber });
                      clearError('maximumNumber');
                      clearError('directors');
                      syncLiveMinMaxCountErrors(next);
                    }}
                  />
                </div>
              </div>
            ) : null}

            <div id={FIELD_ANCHORS.multiStakeholder}>
              <OntarioRadioButtons
                caption="Is this a multi-stakeholder co-operative?"
                name="multi-stakeholder"
                required
                value={step6.multiStakeholder}
                options={YES_NO_OPTIONS}
                errorMessage={errors.multiStakeholder}
                customOnChange={(event) => {
                  const value = getEventValue(event) as YesNoAnswer;
                  patchStep6({
                    multiStakeholder: value,
                    ...(value === 'no' ? { groups: emptyStakeholderGroups() } : {}),
                  });
                  clearError('multiStakeholder');
                  clearError('groups');
                  for (const id of CONTINUANCE_STAKEHOLDER_GROUP_IDS) {
                    clearGroupErrors(id);
                  }
                }}
              />
            </div>

            {step6.multiStakeholder === 'yes' ? (
              <div id={FIELD_ANCHORS.groups} className={groupStyles.groupsSection}>
                <div>
                  <p className={step4Styles.sectionLabel}>
                    The number of directors each stakeholder group in a multi-stakeholder
                    co-operative may elect is{' '}
                    <span className={step4Styles.sectionLabelFlag}>(required)</span>
                  </p>
                  <p className={groupStyles.groupsLead}>
                    Enter at least Group A and Group B. Group C and Group D are optional.
                  </p>
                </div>
                <FieldErrorMessage message={errors.groups} />
                {CONTINUANCE_STAKEHOLDER_GROUP_IDS.map((id) => {
                  const group = step6.groups[id];
                  const keys = groupFieldKeys(id);
                  const optional = id === 'C' || id === 'D';
                  return (
                    <div key={id} className={groupStyles.groupBlock}>
                      <h2 className={`ontario-h3 ${groupStyles.groupHeading}`}>Group {id}</h2>
                      <OntarioInput
                        elementId={FIELD_ANCHORS[keys.name]}
                        caption="Group name"
                        name={`group-${id.toLowerCase()}-name`}
                        type="text"
                        required={!optional}
                        requiredValidationMessage={REQUIRED_FIELD}
                        hintText={
                          optional ? 'Optional. Complete this group only if needed.' : undefined
                        }
                        value={group.name}
                        errorMessage={errors[keys.name]}
                        customOnInput={(event) => {
                          patchGroup(id, { name: getEventValue(event) });
                          clearError(keys.name);
                          clearError('groups');
                        }}
                      />
                      <OntarioInput
                        elementId={FIELD_ANCHORS[keys.min]}
                        caption="Minimum number of directors"
                        name={`group-${id.toLowerCase()}-minimum`}
                        type="text"
                        required={!optional}
                        requiredValidationMessage={REQUIRED_FIELD}
                        hintText="Enter a whole number greater than 0."
                        inputWidth="5-char-width"
                        value={group.minimumNumber}
                        errorMessage={errors[keys.min]}
                        customOnInput={(event) => {
                          patchGroup(id, { minimumNumber: digitsOnly(getEventValue(event)) });
                          clearError(keys.min);
                          clearError('groups');
                        }}
                      />
                      <OntarioInput
                        elementId={FIELD_ANCHORS[keys.max]}
                        caption="Maximum number of directors"
                        name={`group-${id.toLowerCase()}-maximum`}
                        type="text"
                        required={!optional}
                        requiredValidationMessage={REQUIRED_FIELD}
                        hintText="Enter a whole number greater than 0."
                        inputWidth="5-char-width"
                        value={group.maximumNumber}
                        errorMessage={errors[keys.max]}
                        customOnInput={(event) => {
                          patchGroup(id, { maximumNumber: digitsOnly(getEventValue(event)) });
                          clearError(keys.max);
                          clearError('groups');
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            ) : null}

            <div id={FIELD_ANCHORS.consent} className={step4Styles.consentBlock}>
              <OntarioCheckboxes
                caption="Written consent"
                name="written-consent"
                required
                value={step6.consentConfirmed ? ['consent'] : []}
                options={[
                  {
                    value: 'consent',
                    elementId: 'written-consent-given',
                    label:
                      'Written consent has been received and is available in the corporate records for the first directors.',
                  },
                ]}
                errorMessage={errors.consent}
                customOnChange={(event) => {
                  const target = event.target as HTMLInputElement | null;
                  patchStep6({ consentConfirmed: Boolean(target?.checked) });
                  clearError('consent');
                }}
              />
              <p className={step4Styles.consentLink}>
                <a href={DIRECTOR_CONSENT_FORM_URL} target="_blank" rel="noopener noreferrer">
                  Download a copy of the approved form to consent to act as first director
                </a>
              </p>
            </div>

            {showDirectorList ? (
              <div id={FIELD_ANCHORS.directors} className={step4Styles.directorsSection}>
                <div>
                  <p className={step4Styles.sectionLabel}>
                    The first directors are:{' '}
                    <span className={step4Styles.sectionLabelFlag}>(required)</span>
                  </p>
                  <p className={step4Styles.sectionLead}>
                    {formatDirectorSelectionSummary(step6)}
                  </p>
                </div>

                <FieldErrorMessage message={errors.directors} />

                {step6.directors.length > 0 ? (
                  <ul className={step4Styles.summaryList}>
                    {step6.directors.map((director) => {
                      const name = formatDirectorFullName(director) || 'Director';
                      const description = formatDirectorListDescription(director);
                      return (
                        <li key={director.id} className={step4Styles.summaryItem}>
                          <div className={step4Styles.summaryMain}>
                            <button
                              type="button"
                              className={step4Styles.summaryTitle}
                              onClick={() => editDirector(director.id)}
                            >
                              {name}
                            </button>
                            <div className={step4Styles.summaryDescription}>
                              {description.details.map((line) => (
                                <div key={line}>{line}</div>
                              ))}
                              {description.address ? <div>{description.address}</div> : null}
                            </div>
                          </div>
                          <button
                            type="button"
                            className={step4Styles.summaryRemove}
                            onClick={() => removeDirector(director.id)}
                            aria-label={`Remove ${name}`}
                          >
                            <OntarioIconDelete colour="blue" iconWidth={24} isDecorative />
                            Remove
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}

                {!atDirectorLimit ? (
                  <div
                    className={
                      step6.directors.length === 0
                        ? `${step4Styles.addActions} ${step4Styles.addActionsAlone}`
                        : step4Styles.addActions
                    }
                  >
                    <button
                      type="button"
                      className={step4Styles.addLink}
                      onClick={() => startAddDirector(false)}
                    >
                      <OntarioIconAdd colour="blue" iconWidth={24} isDecorative />
                      Add a Director
                    </button>
                    {!accountAlreadyAdded ? (
                      <button
                        type="button"
                        className={step4Styles.addLink}
                        onClick={() => startAddDirector(true)}
                      >
                        <OntarioIconAdd colour="blue" iconWidth={24} isDecorative />
                        Add Me as Director
                      </button>
                    ) : null}
                  </div>
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
