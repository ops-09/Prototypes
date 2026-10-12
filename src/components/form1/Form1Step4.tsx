import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioIconAdd,
  OntarioInput,
  OntarioPageAlert,
  OntarioRadioButtons,
  OntarioStepIndicator,
  OntarioTextarea,
} from '@ongov/ontario-design-system-component-library-react';
import { contactFromSignedInProfile } from '../cover-letter/coverLetterContactStorage';
import {
  DIRECTOR_ERROR_FIELD_ORDER,
  Form1DirectorBlock,
  getDirectorFieldAnchor,
  getDirectorFieldLabel,
  isDirectorComplete,
  validateDirector,
  type DirectorErrors,
} from './Form1DirectorEditor';
import { FieldErrorMessage } from './FieldErrorMessage';
import {
  createEmptyDirector,
  EMPTY_STEP1,
  EMPTY_STEP2,
  EMPTY_STEP3,
  EMPTY_STEP4,
  getDirectorLimit,
  getDirectorMinimum,
  readForm1Draft,
  saveForm1Draft,
  upsertForm1Step4,
  type DirectorCountMode,
  type Form1Director,
  type Form1Draft,
  type Form1Step4Data,
  type YesNoAnswer,
} from './form1DraftStorage';
import styles from './Form1Step1.module.scss';
import step4Styles from './Form1Step4.module.scss';

const CURRENT_STEP = 5;
const TOTAL_STEPS = 8;

const REQUIRED = 'Required Field.';
const REQUIRED_RETRY = 'Required Field. Please try again.';
const MIN_MAX_ORDER_ERROR =
  'The minimum number of directors cannot be greater than the maximum.';

type PageFieldKey =
  | 'countMode'
  | 'fixedNumber'
  | 'minimumNumber'
  | 'maximumNumber'
  | 'multiStakeholder'
  | 'stakeholderDirectorsText'
  | 'directors';

type PageErrors = Partial<Record<PageFieldKey, string>>;

const FIELD_ANCHORS: Record<PageFieldKey, string> = {
  countMode: 'director-count-mode',
  fixedNumber: 'fixed-number-of-directors',
  minimumNumber: 'minimum-number-of-directors',
  maximumNumber: 'maximum-number-of-directors',
  multiStakeholder: 'multi-stakeholder',
  stakeholderDirectorsText: 'stakeholder-directors-text',
  directors: 'first-directors',
};

const FIELD_ORDER: PageFieldKey[] = [
  'countMode',
  'fixedNumber',
  'minimumNumber',
  'maximumNumber',
  'multiStakeholder',
  'stakeholderDirectorsText',
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

function getEventValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement | null;
  return target?.value ?? '';
}

const ODS_FOCUSABLE =
  'ontario-input, ontario-radio-buttons, ontario-textarea, ontario-checkboxes, ontario-dropdown-list, ontario-button';

function focusShadowControl(host: HTMLElement) {
  const nested = host.shadowRoot?.querySelector<HTMLElement>(
    'input:not([type="hidden"]), select, textarea, button',
  );
  nested?.focus({ preventScroll: true });
}

/**
 * ODS puts `elementId` on the inner shadow input, so document.getElementById often fails.
 * Resolve light-DOM wrappers, `[element-id]`, or the host that owns the shadow id.
 */
function focusField(anchorId: string) {
  const byId = document.getElementById(anchorId);
  if (byId) {
    byId.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const host = byId.matches(ODS_FOCUSABLE)
      ? byId
      : byId.querySelector<HTMLElement>(ODS_FOCUSABLE);
    if (host) {
      focusShadowControl(host);
      return;
    }
    if (typeof byId.focus === 'function') {
      byId.focus({ preventScroll: true });
    }
    return;
  }

  const byElementId = document.querySelector<HTMLElement>(
    `[element-id="${CSS.escape(anchorId)}"]`,
  );
  if (byElementId) {
    byElementId.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (byElementId.matches(ODS_FOCUSABLE)) {
      focusShadowControl(byElementId);
    } else {
      const nestedHost = byElementId.querySelector<HTMLElement>(ODS_FOCUSABLE);
      if (nestedHost) {
        focusShadowControl(nestedHost);
      } else if (typeof byElementId.focus === 'function') {
        byElementId.focus({ preventScroll: true });
      }
    }
    return;
  }

  for (const host of document.querySelectorAll<HTMLElement>(ODS_FOCUSABLE)) {
    const inner = host.shadowRoot?.getElementById(anchorId);
    if (inner) {
      host.scrollIntoView({ behavior: 'smooth', block: 'center' });
      inner.focus({ preventScroll: true });
      return;
    }
  }
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function fixedDirectorsMessage(fixed: number, addedCount: number) {
  if (addedCount < fixed) {
    return `You set a fixed number of ${fixed} directors. Add another director, add yourself as a director, or change the fixed number of directors.`;
  }
  return `You set a fixed number of ${fixed} directors. Remove a director or change the fixed number of directors.`;
}

function minDirectorsMessage(minimum: number) {
  return `You set a minimum of ${minimum} directors. Add another director, add yourself as a director, or change the minimum number of directors.`;
}

function maxDirectorsMessage(maximum: number) {
  return `You set a maximum of ${maximum} directors. Remove a director or change the maximum number of directors.`;
}

function directorHasContent(director: Form1Director) {
  return Boolean(
    director.firstName.trim() ||
      director.lastName.trim() ||
      director.email.trim() ||
      director.residentCanadian ||
      director.alsoIncorporator ||
      director.address.addressType,
  );
}

/** Prototype deep-link: seed Steps 1–3 so /form-1/step-4 opens from the playground. */
function ensureStep4Draft(): Form1Draft {
  const existing = readForm1Draft();
  if (
    existing?.step1.languageOption &&
    existing.step2.cooperativeSubtype &&
    existing.step3.streetNumber
  ) {
    const step4 = { ...EMPTY_STEP4, ...(existing.step4 ?? {}) };
    return {
      ...existing,
      step4: {
        ...step4,
        directors:
          step4.directors.length > 0 ? step4.directors : [createEmptyDirector()],
      },
    };
  }

  const now = new Date().toISOString();
  const seeded: Form1Draft = {
    step1: {
      ...EMPTY_STEP1,
      languageOption: 'english',
      cooperativeName: 'GREEN INSTITUTE CO-OPERATIVE INC.',
      nuansFile: {
        name: 'NUANS-Green-Institute.pdf',
        size: 184320,
        type: 'application/pdf',
      },
      nuansDate: '2026-08-15',
    },
    step2: {
      ...EMPTY_STEP2,
      cooperativeSubtype: 'Worker Co-operative',
      primaryActivity: '4521 - Department stores',
      email: 'registry@greeninstitute.coop',
      confirmEmail: 'registry@greeninstitute.coop',
    },
    step3: {
      ...EMPTY_STEP3,
      enterManually: true,
      streetNumber: '100',
      streetName: 'Queen',
      streetType: 'St',
      streetDirection: 'W',
      cityTown: 'Toronto',
      province: 'Ontario',
      postalCode: 'M5H 2N2',
      country: 'Canada',
      municipalityStatus: 'City',
      municipalityName: 'Toronto',
      countyStatus: 'Regional Municipality',
      countyName: 'Toronto',
    },
    step4: {
      ...EMPTY_STEP4,
      ...(existing?.step4 ?? {}),
      directors:
        existing?.step4?.directors?.length
          ? existing.step4.directors
          : [createEmptyDirector()],
    },
    savedAt: now,
    mode: 'continue',
    lastCompletedStep: 3,
  };
  saveForm1Draft(seeded);
  return seeded;
}

export function Form1Step4() {
  const navigate = useNavigate();
  const draft = ensureStep4Draft();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [step4, setStep4] = useState<Form1Step4Data>(() => {
    const initial = { ...EMPTY_STEP4, ...(draft.step4 ?? {}) };
    return {
      ...initial,
      directors:
        initial.directors.length > 0 ? initial.directors : [createEmptyDirector()],
    };
  });
  const [errors, setErrors] = useState<PageErrors>({});
  const [directorErrors, setDirectorErrors] = useState<Record<string, DirectorErrors>>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [showContinueSuccess, setShowContinueSuccess] = useState(false);
  /** IDs currently shown expanded. Complete directors collapse on Save / Cancel. */
  const [expandedIds, setExpandedIds] = useState<string[]>(() =>
    step4.directors
      .filter((director) => !isDirectorComplete(director))
      .map((director) => director.id),
  );
  /** Snapshot taken when Edit opens a complete director — restored on Cancel. */
  const [editSnapshots, setEditSnapshots] = useState<Record<string, Form1Director>>(
    {},
  );

  const directorLimit = getDirectorLimit(step4);
  const atDirectorLimit =
    directorLimit !== null && step4.directors.length >= directorLimit;

  const errorSummaryItems = useMemo(() => {
    const pageItems = FIELD_ORDER.flatMap((key) => {
      const message = errors[key];
      if (!message) {
        return [];
      }
      return [{ key, message, href: `#${FIELD_ANCHORS[key]}` }];
    });

    const directorItems = step4.directors.flatMap((director, index) => {
      const fieldErrors = directorErrors[director.id];
      if (!fieldErrors) {
        return [];
      }
      const missingFields = DIRECTOR_ERROR_FIELD_ORDER.filter((field) =>
        Boolean(fieldErrors[field]),
      );
      if (missingFields.length === 0) {
        return [];
      }
      const labels = missingFields.map((field) => getDirectorFieldLabel(field));
      const firstField = missingFields[0];
      return [
        {
          key: `director-${director.id}`,
          message: `Director ${index + 1} Required Field(s): ${labels.join(', ')}`,
          href: `#${getDirectorFieldAnchor(director.id, firstField, director.address.addressType)}`,
          directorId: director.id,
        },
      ];
    });

    return [...pageItems, ...directorItems];
  }, [directorErrors, errors, step4.directors]);

  function patchStep4(partial: Partial<Form1Step4Data>) {
    setStep4((prev) => ({ ...prev, ...partial }));
    setShowContinueSuccess(false);
  }

  function isDirectorExpanded(director: Form1Director) {
    // Incomplete directors always show the form; complete ones collapse only after Save.
    if (!isDirectorComplete(director)) {
      return true;
    }
    return expandedIds.includes(director.id);
  }

  function openDirector(id: string) {
    setExpandedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function beginDirectorEdit(id: string) {
    const director = step4.directors.find((entry) => entry.id === id);
    if (director && isDirectorComplete(director) && !editSnapshots[id]) {
      setEditSnapshots((prev) => ({
        ...prev,
        [id]: structuredClone(director),
      }));
    }
    openDirector(id);
  }

  function collapseDirector(id: string) {
    setExpandedIds((prev) => prev.filter((entry) => entry !== id));
  }

  function clearDirectorSnapshot(id: string) {
    setEditSnapshots((prev) => {
      if (!prev[id]) {
        return prev;
      }
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function updateDirector(id: string, next: Form1Director) {
    const previous = step4.directors.find((entry) => entry.id === id);
    const wasComplete = previous ? isDirectorComplete(previous) : false;
    const nowComplete = isDirectorComplete(next);

    patchStep4({
      directors: step4.directors.map((entry) => (entry.id === id ? next : entry)),
    });
    setDirectorErrors((prev) => {
      if (!prev[id]) {
        return prev;
      }
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    // Stay open until Save. Do not re-open already-complete cards (blur after Save
    // would otherwise expand them again).
    if (!nowComplete || !wasComplete) {
      openDirector(id);
    }

    clearError('directors');
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

  function validatePage(): { page: PageErrors; byDirector: Record<string, DirectorErrors> } {
    const page: PageErrors = {};
    const byDirector: Record<string, DirectorErrors> = {};

    if (!step4.countMode) {
      page.countMode = REQUIRED;
    }

    if (step4.countMode === 'fixed' && !step4.fixedNumber.trim()) {
      page.fixedNumber = REQUIRED;
    }

    if (step4.countMode === 'minMax') {
      if (!step4.minimumNumber.trim()) {
        page.minimumNumber = REQUIRED;
      }
      if (!step4.maximumNumber.trim()) {
        page.maximumNumber = REQUIRED;
      }
      const min = Number.parseInt(step4.minimumNumber, 10);
      const max = Number.parseInt(step4.maximumNumber, 10);
      if (
        step4.minimumNumber.trim() &&
        step4.maximumNumber.trim() &&
        Number.isFinite(min) &&
        Number.isFinite(max) &&
        min > max
      ) {
        page.minimumNumber = MIN_MAX_ORDER_ERROR;
      }
    }

    if (!step4.multiStakeholder) {
      page.multiStakeholder = REQUIRED;
    }

    if (step4.multiStakeholder === 'yes' && !step4.stakeholderDirectorsText.trim()) {
      page.stakeholderDirectorsText = REQUIRED_RETRY;
    }

    for (const director of step4.directors) {
      const fieldErrors = validateDirector(director);
      if (Object.keys(fieldErrors).length > 0) {
        byDirector[director.id] = fieldErrors;
      }
    }

    // Count errors use cards added, not completion — incomplete directors already get field errors.
    const addedCount = step4.directors.length;
    const minimum = getDirectorMinimum(step4);
    const maximum = getDirectorLimit(step4);

    if (step4.countMode === 'fixed' && minimum !== null && addedCount !== minimum) {
      page.directors = fixedDirectorsMessage(minimum, addedCount);
    }

    if (step4.countMode === 'minMax' && minimum !== null) {
      if (addedCount < minimum) {
        page.directors = minDirectorsMessage(minimum);
      } else if (maximum !== null && addedCount > maximum) {
        page.directors = maxDirectorsMessage(maximum);
      }
    }

    return { page, byDirector };
  }

  function handleContinue() {
    const { page, byDirector } = validatePage();
    setErrors(page);
    setDirectorErrors(byDirector);
    const hasErrors =
      Object.keys(page).length > 0 || Object.keys(byDirector).length > 0;
    setShowErrorSummary(hasErrors);

    if (hasErrors) {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        for (const id of Object.keys(byDirector)) {
          next.add(id);
        }
        return [...next];
      });
      window.requestAnimationFrame(() => {
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }

    upsertForm1Step4(step4, 'continue', 4);
    setShowContinueSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSaveAsDraft() {
    upsertForm1Step4(
      step4,
      'draft',
      draft.lastCompletedStep >= 4 ? 4 : draft.lastCompletedStep >= 3 ? 3 : 2,
    );
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

  function addDirector(prefillFromProfile: boolean) {
    if (atDirectorLimit) {
      return;
    }
    const next = createEmptyDirector();
    if (prefillFromProfile) {
      const profile = contactFromSignedInProfile();
      next.firstName = profile.firstName;
      next.middleName = profile.middleName;
      next.lastName = profile.lastName;
      next.email = profile.email;
    }
    // Collapse completed directors; keep the new card open.
    setExpandedIds([
      ...step4.directors
        .filter((entry) => !isDirectorComplete(entry))
        .map((entry) => entry.id),
      next.id,
    ]);
    patchStep4({ directors: [...step4.directors, next] });
    clearError('directors');
  }

  function removeDirector(id: string) {
    if (step4.directors.length <= 1) {
      // Keep one empty card — clear it instead of removing the last block.
      const cleared = createEmptyDirector(id);
      patchStep4({ directors: [cleared] });
      setExpandedIds([cleared.id]);
      setDirectorErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      clearError('directors');
      return;
    }

    patchStep4({
      directors: step4.directors.filter((entry) => entry.id !== id),
    });
    collapseDirector(id);
    setDirectorErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    clearError('directors');
  }

  function handleDirectorSave(id: string) {
    const director = step4.directors.find((entry) => entry.id === id);
    if (!director) {
      return;
    }
    const fieldErrors = validateDirector(director);
    if (Object.keys(fieldErrors).length > 0) {
      setDirectorErrors((prev) => ({ ...prev, [id]: fieldErrors }));
      openDirector(id);
      const firstField = DIRECTOR_ERROR_FIELD_ORDER.find((field) => fieldErrors[field]);
      if (firstField) {
        window.requestAnimationFrame(() => {
          focusField(getDirectorFieldAnchor(id, firstField, director.address.addressType));
        });
      }
      return;
    }
    clearDirectorSnapshot(id);
    setDirectorErrors((prev) => {
      if (!prev[id]) {
        return prev;
      }
      const next = { ...prev };
      delete next[id];
      return next;
    });
    // Force collapsed summary (Edit) state for a valid director.
    setExpandedIds((prev) => prev.filter((entry) => entry !== id));
  }

  function handleDirectorCancel(id: string) {
    const snapshot = editSnapshots[id];
    if (snapshot) {
      patchStep4({
        directors: step4.directors.map((entry) =>
          entry.id === id ? structuredClone(snapshot) : entry,
        ),
      });
      clearDirectorSnapshot(id);
      setDirectorErrors((prev) => {
        if (!prev[id]) {
          return prev;
        }
        const next = { ...prev };
        delete next[id];
        return next;
      });
      collapseDirector(id);
      return;
    }

    setDirectorErrors((prev) => {
      if (!prev[id]) {
        return prev;
      }
      const next = { ...prev };
      delete next[id];
      return next;
    });

    const director = step4.directors.find((entry) => entry.id === id);
    if (director && isDirectorComplete(director)) {
      collapseDirector(id);
    }
  }

  function handleSummaryLinkClick(
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
    directorId?: string,
  ) {
    event.preventDefault();
    if (directorId) {
      openDirector(directorId);
    }
    // Wait for expanded director fields to paint, then focus the first error.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        focusField(href.replace('#', ''));
      });
    });
  }

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-1/step-3"
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
                        onClick={(event) =>
                          handleSummaryLinkClick(
                            event,
                            item.href,
                            'directorId' in item ? item.directorId : undefined,
                          )
                        }
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

          {showContinueSuccess ? (
            <div className={styles.alert}>
              <OntarioPageAlert
                type="success"
                heading="Step 5 saved"
                content="Your directors were saved. The next step is not available in this prototype yet."
              />
            </div>
          ) : null}

          <div className={styles.formStack}>
            <div id={FIELD_ANCHORS.countMode}>
              <OntarioRadioButtons
                caption="How is the number of directors determined?"
                name="director-count-mode"
                required
                hintText="Please provide us how many directors the co-operative can have."
                value={step4.countMode}
                options={COUNT_MODE_OPTIONS}
                errorMessage={errors.countMode}
                customOnChange={(event) => {
                  const value = getEventValue(event) as DirectorCountMode;
                  patchStep4({
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

            {step4.countMode === 'fixed' ? (
              <div id={FIELD_ANCHORS.fixedNumber} className={step4Styles.countFields}>
                <OntarioInput
                  elementId={FIELD_ANCHORS.fixedNumber}
                  caption="Fixed number of directors"
                  name="fixed-number-of-directors"
                  type="text"
                  required
                  requiredValidationMessage={REQUIRED}
                  hintText="Please enter the fixed number of directors."
                  inputWidth="5-char-width"
                  value={step4.fixedNumber}
                  errorMessage={errors.fixedNumber}
                  customOnInput={(event) => {
                    patchStep4({ fixedNumber: digitsOnly(getEventValue(event)) });
                    clearError('fixedNumber');
                    clearError('directors');
                  }}
                />
              </div>
            ) : null}

            {step4.countMode === 'minMax' ? (
              <div className={step4Styles.countFields}>
                <div id={FIELD_ANCHORS.minimumNumber}>
                  <OntarioInput
                    elementId={FIELD_ANCHORS.minimumNumber}
                    caption="Minimum number of directors"
                    name="minimum-number-of-directors"
                    type="text"
                    required
                    requiredValidationMessage={REQUIRED}
                    hintText="Please enter the minimum number of directors."
                    inputWidth="5-char-width"
                    value={step4.minimumNumber}
                    errorMessage={errors.minimumNumber}
                    customOnInput={(event) => {
                      patchStep4({ minimumNumber: digitsOnly(getEventValue(event)) });
                      clearError('minimumNumber');
                      clearError('directors');
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
                    requiredValidationMessage={REQUIRED}
                    hintText="Please enter the maximum number of directors."
                    inputWidth="5-char-width"
                    value={step4.maximumNumber}
                    errorMessage={errors.maximumNumber}
                    customOnInput={(event) => {
                      patchStep4({ maximumNumber: digitsOnly(getEventValue(event)) });
                      clearError('maximumNumber');
                      clearError('directors');
                    }}
                  />
                </div>
              </div>
            ) : null}

            <div id={FIELD_ANCHORS.multiStakeholder}>
              <OntarioRadioButtons
                caption="Is this multi-stakeholder co-operative?"
                name="multi-stakeholder"
                required
                value={step4.multiStakeholder}
                options={YES_NO_OPTIONS}
                errorMessage={errors.multiStakeholder}
                customOnChange={(event) => {
                  const value = getEventValue(event) as YesNoAnswer;
                  patchStep4({
                    multiStakeholder: value,
                    ...(value === 'no' ? { stakeholderDirectorsText: '' } : {}),
                  });
                  clearError('multiStakeholder');
                  clearError('stakeholderDirectorsText');
                }}
              />
            </div>

            {step4.multiStakeholder === 'yes' ? (
              <div id={FIELD_ANCHORS.stakeholderDirectorsText}>
                <OntarioTextarea
                  elementId={FIELD_ANCHORS.stakeholderDirectorsText}
                  caption="The number (or minimum and maximum number) of directors each stakeholder group may elect"
                  name="stakeholder-directors-text"
                  required
                  value={step4.stakeholderDirectorsText}
                  errorMessage={errors.stakeholderDirectorsText}
                  customOnInput={(event) => {
                    patchStep4({ stakeholderDirectorsText: getEventValue(event) });
                    clearError('stakeholderDirectorsText');
                  }}
                />
              </div>
            ) : null}

            <div id={FIELD_ANCHORS.directors} className={step4Styles.directorsSection}>
              <div>
                <h2 className={`ontario-h2 ${step4Styles.sectionHeading}`}>
                  Who are the directors?
                  <span className={styles.requiredFlag}> (required)</span>
                </h2>
                <p className={step4Styles.sectionLead}>
                  Please add the information for each first director.
                </p>
                {directorLimit !== null ? (
                  <p className={step4Styles.sectionLead}>
                    {step4.directors.length} of {directorLimit} director
                    {directorLimit === 1 ? '' : 's'} added
                    {step4.countMode === 'minMax' && getDirectorMinimum(step4) !== null
                      ? ` (minimum ${getDirectorMinimum(step4)})`
                      : ''}
                    .
                  </p>
                ) : null}
              </div>

              <ul className={step4Styles.directorList}>
                {step4.directors.map((director, index) => (
                  <li key={director.id}>
                    <Form1DirectorBlock
                      director={director}
                      index={index}
                      errors={directorErrors[director.id]}
                      expanded={isDirectorExpanded(director)}
                      canRemove={
                        step4.directors.length > 1 || directorHasContent(director)
                      }
                      onChange={(next) => updateDirector(director.id, next)}
                      onRemove={() => removeDirector(director.id)}
                      onEdit={() => beginDirectorEdit(director.id)}
                      onSave={() => handleDirectorSave(director.id)}
                      onCancel={() => handleDirectorCancel(director.id)}
                    />
                  </li>
                ))}
              </ul>

              <FieldErrorMessage message={errors.directors} />

              {atDirectorLimit ? (
                <p className={step4Styles.limitHint}>
                  The maximum number of first directors for this filing has been reached.
                </p>
              ) : (
                <div className={step4Styles.addActions}>
                  <button
                    type="button"
                    className={step4Styles.addLink}
                    onClick={() => addDirector(false)}
                  >
                    <OntarioIconAdd colour="blue" iconWidth={24} isDecorative />
                    Add another director
                  </button>
                  <button
                    type="button"
                    className={step4Styles.addLink}
                    onClick={() => addDirector(true)}
                  >
                    <OntarioIconAdd colour="blue" iconWidth={24} isDecorative />
                    Add Me as Director
                  </button>
                </div>
              )}
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
              label="Cancel/Exit"
              onClick={handleCancel}
            />
          </div>
        </div>
      </div>
    </>
  );
}
