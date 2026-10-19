import { useRef, useState } from 'react';
import {
  OntarioButton,
  OntarioCheckboxes,
  OntarioDateInput,
  OntarioInput,
  OntarioPageAlert,
} from '@ongov/ontario-design-system-component-library-react';
import { isIsoDateComplete } from '../form1/nameValidation';
import {
  formatCorporationSuggestion,
  type OntarioCorporationResult,
} from '../form1/ontarioCorporationLookup';
import { OntarioCorporationSearchAutosuggest } from '../form1/OntarioCorporationSearchAutosuggest';
import step4Styles from '../form1/Form1Step4.module.scss';
import { aggregateDateFromEvent, syncDateFieldByAnchor } from '../form7/dateErrorSync';
import type { AmalgamatingCooperative } from './form10DraftStorage';
import styles from './Form10Step1.module.scss';

const COOP_NOT_FOUND_ALERT =
  'No co-operative was found for that search. Enter the co-operative name and OCN below, or try a different search.';
const COOP_DUPLICATE = 'This co-operative has already been added.';
const COOP_SELECT_REQUIRED =
  'Search for and select a co-operative, or enter its details manually.';

export type CooperativeEditorErrors = Partial<{
  name: string;
  ocn: string;
  date: string;
  search: string;
}>;

type Form10CooperativeEditorProps = {
  cooperative: AmalgamatingCooperative;
  existingOcns: string[];
  errors: CooperativeEditorErrors;
  onChange: (next: AmalgamatingCooperative) => void;
  onSave: (next: AmalgamatingCooperative, manual: boolean) => void;
  onCancel: () => void;
};

function getEventValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
  return target?.value ?? '';
}

function isOcnLikeQuery(value: string) {
  return /^\d[\d\s]*$/.test(value.trim());
}

function selectedLabel(coop: AmalgamatingCooperative) {
  if (!coop.ocn || !coop.legalName) {
    return '';
  }
  return formatCorporationSuggestion({
    ocn: coop.ocn,
    legalName: coop.legalName,
    status: 'Active',
  });
}

export function validateAmalgamatingCooperative(
  coop: AmalgamatingCooperative,
  options: { manual: boolean; existingOcns: string[] },
): CooperativeEditorErrors {
  const next: CooperativeEditorErrors = {};
  if (!options.manual && !coop.legalName.trim() && !coop.ocn.trim()) {
    next.search = COOP_SELECT_REQUIRED;
  } else {
    if (!coop.legalName.trim()) {
      next.name = 'Enter the legal name.';
    }
    if (!coop.ocn.trim()) {
      next.ocn = 'Enter the Ontario Corporation Number (OCN).';
    } else if (options.existingOcns.includes(coop.ocn.trim())) {
      next.ocn = COOP_DUPLICATE;
      if (!options.manual) {
        next.search = COOP_DUPLICATE;
      }
    }
  }
  if (!coop.membersApprovalDate.trim()) {
    next.date = 'Enter the date of members’ approval.';
  } else if (!isIsoDateComplete(coop.membersApprovalDate)) {
    next.date = 'Enter a complete date of members’ approval.';
  }
  return next;
}

export function Form10CooperativeEditor({
  cooperative,
  existingOcns,
  errors,
  onChange,
  onSave,
  onCancel,
}: Form10CooperativeEditorProps) {
  const dateErrorsRef = useRef<CooperativeEditorErrors>({});
  dateErrorsRef.current = errors;
  const [query, setQuery] = useState(() => selectedLabel(cooperative));
  const [manual, setManual] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [searchError, setSearchError] = useState('');

  const nameKey = `coop-${cooperative.id}-name`;
  const ocnKey = `coop-${cooperative.id}-ocn`;
  const dateKey = `coop-${cooperative.id}-date`;

  function patch(next: Partial<AmalgamatingCooperative>) {
    onChange({ ...cooperative, ...next });
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setSearchError('');
    setNotFound(false);
    const label = selectedLabel(cooperative);
    if (label && value !== label && !manual) {
      patch({ legalName: '', ocn: '' });
    }
  }

  function selectCoop(result: OntarioCorporationResult) {
    if (existingOcns.includes(result.ocn)) {
      setSearchError(COOP_DUPLICATE);
      return;
    }
    setQuery(formatCorporationSuggestion(result));
    setSearchError('');
    setNotFound(false);
    setManual(false);
    patch({ legalName: result.legalName, ocn: result.ocn });
  }

  function handleNoResults(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    setNotFound(true);
    setManual(true);
    setSearchError('');
    if (isOcnLikeQuery(trimmed)) {
      patch({ ocn: trimmed.replace(/\s/g, '') });
    } else {
      patch({ legalName: trimmed });
    }
  }

  function handleSave() {
    const fieldErrors = validateAmalgamatingCooperative(cooperative, {
      manual,
      existingOcns,
    });
    window.requestAnimationFrame(() => {
      syncDateFieldByAnchor(dateKey, fieldErrors.date);
    });
    onSave(cooperative, manual);
  }

  return (
    <>
      <div className={styles.formStack}>
        <div id={manual ? undefined : nameKey} className={styles.naicsBlock}>
          <label
            className={styles.naicsLabel}
            htmlFor={`${cooperative.id}-corporation-search-input`}
          >
            Co-operative name or OCN
            <span className={styles.requiredFlag}> (required)</span>
          </label>
          <div className={styles.naicsSearch}>
            <OntarioCorporationSearchAutosuggest
              elementId={`${cooperative.id}-corporation-search-input`}
              value={query}
              errorMessage={
                manual
                  ? undefined
                  : searchError || errors.search || errors.name || errors.ocn
              }
              hintText="Example: 1001234, maple, or GREEN INSTITUTE. If you cannot find the co-operative, select “Enter the co-operative name and OCN manually” below."
              onChange={handleQueryChange}
              onSelect={selectCoop}
              onNoResults={handleNoResults}
            />
          </div>
          <div className={styles.manualToggle}>
            <OntarioCheckboxes
              caption="Manual co-operative entry"
              name={`${cooperative.id}-enter-manually`}
              value={manual ? ['manual'] : []}
              options={[
                {
                  value: 'manual',
                  elementId: `${cooperative.id}-enter-manually`,
                  label: 'Enter the co-operative name and OCN manually',
                },
              ]}
              customOnChange={(event) => {
                const target = event.target as HTMLInputElement | null;
                setManual(Boolean(target?.checked));
                setSearchError('');
                if (!target?.checked) {
                  setNotFound(false);
                }
              }}
            />
          </div>
        </div>

        {notFound ? (
          <div className={styles.alert}>
            <OntarioPageAlert
              type="informational"
              heading="Co-operative not found"
              content={COOP_NOT_FOUND_ALERT}
            />
          </div>
        ) : null}

        {manual ? (
          <>
            <div id={nameKey}>
              <OntarioInput
                elementId={`${nameKey}-input`}
                caption="Legal name"
                name={nameKey}
                type="text"
                required
                hintText="Enter the legal name of the co-operative."
                value={cooperative.legalName}
                errorMessage={errors.name}
                customOnInput={(event) =>
                  patch({ legalName: getEventValue(event) })
                }
              />
            </div>
            <div id={ocnKey}>
              <OntarioInput
                elementId={`${ocnKey}-input`}
                caption="Ontario Corporation Number (OCN)"
                name={ocnKey}
                type="text"
                required
                hintText="Enter the Ontario corporation number."
                value={cooperative.ocn}
                errorMessage={searchError || errors.ocn}
                customOnInput={(event) => {
                  const nextOcn = getEventValue(event).trim();
                  if (nextOcn && existingOcns.includes(nextOcn)) {
                    setSearchError(COOP_DUPLICATE);
                  } else {
                    setSearchError('');
                  }
                  patch({ ocn: getEventValue(event) });
                }}
              />
            </div>
          </>
        ) : cooperative.legalName ? (
          <div className={styles.selectedCoop}>
            <h2 className={`ontario-h5 ${styles.selectedCoopLabel}`}>
              Selected co-operative
            </h2>
            <p className={styles.selectedCoopValue}>{cooperative.legalName}</p>
            <p className={styles.selectedCoopValue}>OCN {cooperative.ocn}</p>
          </div>
        ) : null}

        <div id={dateKey}>
          <p className={styles.resolutionDateLabel}>
            Dates of Members’ Approval
            <span className={styles.requiredFlag}> (required)</span>
          </p>
          <div className={styles.resolutionDateInputClip}>
            <OntarioDateInput
              elementId={`${dateKey}-input`}
              caption={{
                captionText: '\u200B',
                captionType: 'default',
              }}
              required
              value={cooperative.membersApprovalDate || undefined}
              dateValidator={(_day, _month, _year) => {
                const message = dateErrorsRef.current.date;
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
              }}
              onInputOnInput={(event) => {
                const next = aggregateDateFromEvent(event);
                if (next !== null) {
                  patch({ membersApprovalDate: next });
                }
              }}
              onInputOnChange={(event) => {
                const next = aggregateDateFromEvent(event);
                if (next !== null) {
                  patch({ membersApprovalDate: next });
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.editorActions}>
        <div className={step4Styles.doneButtons}>
          <OntarioButton
            type="primary"
            htmlType="button"
            label="Save"
            onClick={handleSave}
          />
          <OntarioButton
            type="tertiary"
            htmlType="button"
            label="Cancel"
            onClick={onCancel}
          />
        </div>
      </div>
    </>
  );
}
