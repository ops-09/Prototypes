import { useRef, useState } from 'react';
import {
  OntarioButton,
  OntarioCheckboxes,
  OntarioDateInput,
  OntarioInput,
  OntarioPageAlert,
} from '@ongov/ontario-design-system-component-library-react';
import { isIsoDateComplete } from '../form1/nameValidation';
import { OntarioCorporationSearchAutosuggest } from '../form1/OntarioCorporationSearchAutosuggest';
import {
  formatCorporationSuggestion,
  type OntarioCorporationResult,
} from '../form1/ontarioCorporationLookup';
import step4Styles from '../form1/Form1Step4.module.scss';
import { aggregateDateFromEvent, syncDateFieldByAnchor } from '../form7/dateErrorSync';
import { getEventValue } from './form11Focus';
import {
  normalizeOcn,
  OBR_OCN,
  type AmalgamatingNfp,
} from './form11DraftStorage';
import pageStyles from './Form11Step2.module.scss';
import styles from './Form11Step3.module.scss';

const CORP_NOT_FOUND_ALERT =
  'No not-for-profit corporation was found for that search. Enter the corporation name and OCN below, or try a different search.';
const SELECT_REQUIRED =
  'Search for and select a not-for-profit corporation, or enter its details manually.';
export const INVALID_DATE_ERROR = "Please enter a valid Date of Members' Approval.";
export const DUPLICATE_ERROR = 'This corporation has already been added.';

export type CorporationEditorErrors = Partial<{
  name: string;
  ocn: string;
  date: string;
  search: string;
}>;

type Form11CorporationEditorProps = {
  corporation: AmalgamatingNfp;
  existingOcns: string[];
  errors: CorporationEditorErrors;
  onChange: (next: AmalgamatingNfp) => void;
  onSave: (next: AmalgamatingNfp, manual: boolean) => void;
  onCancel: () => void;
};

function isOcnLikeQuery(value: string) {
  return /^\d[\d\s]*$/.test(value.trim());
}

function selectedLabel(corp: AmalgamatingNfp) {
  if (!corp.ocn || !corp.legalName) {
    return '';
  }
  return formatCorporationSuggestion({
    ocn: corp.ocn,
    legalName: corp.legalName,
    status: 'Active',
  });
}

export function validateAmalgamatingNfp(
  corp: AmalgamatingNfp,
  options: { manual: boolean; existingOcns: string[] },
): CorporationEditorErrors {
  const next: CorporationEditorErrors = {};
  if (!options.manual && !corp.legalName.trim() && !corp.ocn.trim()) {
    next.search = SELECT_REQUIRED;
  } else {
    if (!corp.legalName.trim()) {
      next.name = 'Enter the legal name.';
    }
    if (!corp.ocn.trim()) {
      next.ocn = 'Enter the Ontario Corporation Number (OCN).';
    } else if (options.existingOcns.includes(normalizeOcn(corp.ocn))) {
      next.ocn = DUPLICATE_ERROR;
      if (!options.manual) {
        next.search = DUPLICATE_ERROR;
      }
    }
  }
  if (!corp.membersApprovalDate.trim() || !isIsoDateComplete(corp.membersApprovalDate)) {
    next.date = INVALID_DATE_ERROR;
  }
  return next;
}

export function Form11CorporationEditor({
  corporation,
  existingOcns,
  errors,
  onChange,
  onSave,
  onCancel,
}: Form11CorporationEditorProps) {
  const dateErrorsRef = useRef<CorporationEditorErrors>({});
  dateErrorsRef.current = errors;
  const [query, setQuery] = useState(() => selectedLabel(corporation));
  const [manual, setManual] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [searchError, setSearchError] = useState('');

  const nameKey = `nfp-${corporation.id}-name`;
  const ocnKey = `nfp-${corporation.id}-ocn`;
  const dateKey = `amalgamating-date-${corporation.id}`;
  const selected = Boolean(corporation.legalName.trim() && corporation.ocn.trim());

  function patch(next: Partial<AmalgamatingNfp>) {
    onChange({ ...corporation, ...next });
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setSearchError('');
    setNotFound(false);
    const label = selectedLabel(corporation);
    if (label && value !== label && !manual) {
      patch({ legalName: '', ocn: '', addedFromAccount: false });
    }
  }

  function applySearchResult(result: OntarioCorporationResult) {
    const ocn = normalizeOcn(result.ocn);
    if (existingOcns.includes(ocn)) {
      setSearchError(DUPLICATE_ERROR);
      return;
    }
    setQuery(formatCorporationSuggestion(result));
    setSearchError('');
    setNotFound(false);
    setManual(false);
    patch({
      legalName: result.legalName,
      ocn,
      addedFromAccount: ocn === OBR_OCN,
    });
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
      patch({ ocn: trimmed.replace(/\s/g, ''), addedFromAccount: false });
    } else {
      patch({ legalName: trimmed, addedFromAccount: false });
    }
  }

  function handleSave() {
    const fieldErrors = validateAmalgamatingNfp(corporation, {
      manual,
      existingOcns,
    });
    window.requestAnimationFrame(() => {
      syncDateFieldByAnchor(dateKey, fieldErrors.date);
    });
    onSave(corporation, manual);
  }

  return (
    <>
      <div className={pageStyles.formStack}>
        <div id={manual ? undefined : nameKey} className={pageStyles.naicsBlock}>
          <label
            className={pageStyles.naicsLabel}
            htmlFor={`form11-ocn-search-${corporation.id}`}
          >
            Ontario Corporation Number
            <span className={pageStyles.requiredFlag}> (required)</span>
          </label>
          <div className={pageStyles.naicsSearch}>
            <OntarioCorporationSearchAutosuggest
              elementId={`form11-ocn-search-${corporation.id}`}
              value={query}
              errorMessage={
                manual
                  ? undefined
                  : searchError || errors.search || errors.name || errors.ocn
              }
              hintText="Please search for the Not-for-Profit corporation using the Ontario Corporation Number. If you cannot find the corporation, select “Enter the not-for-profit corporation name and OCN manually” below."
              onChange={handleQueryChange}
              onSelect={applySearchResult}
              onNoResults={handleNoResults}
            />
          </div>
          <div className={styles.manualToggle}>
            <OntarioCheckboxes
              caption="Manual corporation entry"
              name={`${corporation.id}-enter-manually`}
              value={manual ? ['manual'] : []}
              options={[
                {
                  value: 'manual',
                  elementId: `${corporation.id}-enter-manually`,
                  label: 'Enter the not-for-profit corporation name and OCN manually',
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
          <div className={pageStyles.alert}>
            <OntarioPageAlert
              type="informational"
              heading="Corporation not found"
              content={CORP_NOT_FOUND_ALERT}
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
                hintText="Enter the legal name of the not-for-profit corporation."
                value={corporation.legalName}
                errorMessage={errors.name}
                customOnInput={(event) =>
                  patch({ legalName: getEventValue(event), addedFromAccount: false })
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
                value={corporation.ocn}
                errorMessage={searchError || errors.ocn}
                customOnInput={(event) => {
                  const nextOcn = getEventValue(event);
                  const normalized = normalizeOcn(nextOcn);
                  if (normalized && existingOcns.includes(normalized)) {
                    setSearchError(DUPLICATE_ERROR);
                  } else {
                    setSearchError('');
                  }
                  patch({
                    ocn: nextOcn,
                    addedFromAccount: normalized === OBR_OCN,
                  });
                }}
              />
            </div>
          </>
        ) : selected ? (
          <div className={styles.selectedCorp}>
            <h2 className={`ontario-h5 ${styles.selectedLabel}`}>Selected corporation</h2>
            <p className={styles.selectedValue}>{corporation.legalName}</p>
            <p className={styles.selectedValue}>OCN {corporation.ocn}</p>
          </div>
        ) : null}

        <div id={dateKey}>
          <p className={styles.resolutionDateLabel}>
            Date of Shareholders/Members&apos; Approval
            <span className={pageStyles.requiredFlag}> (required)</span>
          </p>
          <div className={styles.resolutionDateInputClip}>
            <OntarioDateInput
              elementId={`${dateKey}-input`}
              caption={{
                captionText: '\u200B',
                captionType: 'default',
              }}
              required
              value={corporation.membersApprovalDate || undefined}
              dateValidator={() => {
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
