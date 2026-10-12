import { useMemo } from 'react';
import {
  OntarioDateInput,
  OntarioInput,
  OntarioRadioButtons,
} from '@ongov/ontario-design-system-component-library-react';
import { FileUpload, type UploadedFileMeta } from '../form1/FileUpload';
import {
  COOPERATIVE_NAME_REQUIRED_ERROR,
  isSeparateLanguage,
  type NameLanguageOption,
} from '../form1/nameValidation';
import { aggregateDateFromEvent } from './dateErrorSync';
import type { NameNuansFields } from './form7DraftStorage';
import { validateNuansDate } from './nuansValidation';
import styles from './Form7Step1.module.scss';

export type NameNuansErrors = Partial<{
  languageOption: string;
  proposedName: string;
  proposedNameEn: string;
  proposedNameFr: string;
  nuansFile: string;
  nuansFileEn: string;
  nuansFileFr: string;
  nuansDate: string;
  nuansDateEn: string;
  nuansDateFr: string;
}>;

type ProposedNameAndNuansProps = {
  idPrefix: string;
  nameKind: 'cooperative' | 'corporation' | 'nfp';
  leadText?: string;
  value: NameNuansFields;
  errors: NameNuansErrors;
  dateValidatorFor: (
    key: 'nuansDate' | 'nuansDateEn' | 'nuansDateFr',
  ) => (day: string, month: string, year: string) => {
    day: string;
    month: string;
    year: string;
    errorMessage?: string;
  };
  onChange: (next: NameNuansFields) => void;
  onClearError: (key: keyof NameNuansErrors) => void;
};

function getEventValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | null;
  return target?.value ?? '';
}

function toBlockCapitals(value: string) {
  return value.toUpperCase();
}

export function ProposedNameAndNuans({
  idPrefix,
  nameKind,
  leadText,
  value,
  errors,
  dateValidatorFor,
  onChange,
  onClearError,
}: ProposedNameAndNuansProps) {
  const separate = isSeparateLanguage(value.languageOption);
  const isCoop = nameKind === 'cooperative';
  const isNfp = nameKind === 'nfp';

  const languageCaption = isCoop
    ? 'The co-operative will have:'
    : isNfp
      ? 'The Not-for-Profit corporation will have:'
      : 'The corporation will have:';

  const singleNameCaption = isCoop
    ? 'New Co-operative Name (Proposed)'
    : isNfp
      ? 'New Not-for-Profit Corporation Name (Proposed)'
      : 'New Corporation Name (Proposed)';

  const languageOptions = useMemo(() => {
    if (isCoop) {
      return [
        {
          value: 'english',
          elementId: `${idPrefix}-lang-english`,
          label:
            'an English name (example: "Green Institute Co-operative Inc.")',
        },
        {
          value: 'french',
          elementId: `${idPrefix}-lang-french`,
          label:
            'a French name (example: "Institut Green Coopérative Inc.")',
        },
        {
          value: 'combined',
          elementId: `${idPrefix}-lang-combined`,
          label:
            'a combination of English and French (example: "Institut Green Institute Co-operative Inc.")',
        },
        {
          value: 'separate',
          elementId: `${idPrefix}-lang-separate`,
          label:
            'an English and a French name that are equivalent but used separately (example: "Green Institute Co-operative Inc./Institut Green Coopérative Inc."). Note: This option requires two separate Nuans reports.',
        },
      ];
    }

    return [
      {
        value: 'english',
        elementId: `${idPrefix}-lang-english`,
        label: 'an English name (example: "Green Institute Inc.")',
      },
      {
        value: 'french',
        elementId: `${idPrefix}-lang-french`,
        label: 'a French name (example: "Institut Green Inc.")',
      },
      {
        value: 'combined',
        elementId: `${idPrefix}-lang-combined`,
        label:
          'a combination of English and French (example: "Institut Green Institute Inc.")',
      },
      {
        value: 'separate',
        elementId: `${idPrefix}-lang-separate`,
        label:
          'an English and a French name that are equivalent but used separately (example: "Green Institute Inc./Institut Green Inc."). Note: This option requires two separate Nuans reports.',
      },
    ];
  }, [idPrefix, isCoop]);

  function patch(partial: Partial<NameNuansFields>) {
    onChange({ ...value, ...partial });
  }

  function setFile(
    key: 'nuansFile' | 'nuansFileEn' | 'nuansFileFr',
    meta: UploadedFileMeta | null,
  ) {
    patch({ [key]: meta });
    onClearError(key);
  }

  function nameLabel(scope: 'single' | 'en' | 'fr') {
    if (isCoop) {
      if (scope === 'en') return 'English co-operative name (proposed)';
      if (scope === 'fr') return 'French co-operative name (proposed)';
      return singleNameCaption;
    }
    if (isNfp) {
      if (scope === 'en') return 'English Not-for-Profit corporation name (proposed)';
      if (scope === 'fr') return 'French Not-for-Profit corporation name (proposed)';
      return singleNameCaption;
    }
    if (scope === 'en') return 'English corporation name (proposed)';
    if (scope === 'fr') return 'French corporation name (proposed)';
    return singleNameCaption;
  }

  function emptyMessage(scope: 'single' | 'en' | 'fr') {
    if (isCoop) {
      return COOPERATIVE_NAME_REQUIRED_ERROR;
    }
    if (isNfp) {
      if (scope === 'en') return 'Enter the English Not-for-Profit corporation name.';
      if (scope === 'fr') return 'Enter the French Not-for-Profit corporation name.';
      return 'Enter the Not-for-Profit corporation name.';
    }
    if (scope === 'en') return 'Enter the English corporation name.';
    if (scope === 'fr') return 'Enter the French corporation name.';
    return 'Enter the corporation name.';
  }

  function nameHintText() {
    if (isCoop) {
      return 'Enter the name in block capital letters, as it should appear on the official record. Example: GREEN INSTITUTE CO-OPERATIVE INC.';
    }
    if (isNfp) {
      return 'Enter the name in block capital letters, as it should appear on the official record.';
    }
    return 'Enter the name in block capital letters, as it should appear on the official record. Example: GREEN INSTITUTE INC.';
  }

  return (
    <div className={styles.formStack}>
      {leadText ? <p className={styles.lead}>{leadText}</p> : null}

      <div id={`${idPrefix}-language`}>
        <OntarioRadioButtons
          caption={{
            captionText: languageCaption,
            captionType: 'default',
          }}
          name={`${idPrefix}-language`}
          required
          value={value.languageOption}
          options={languageOptions}
          errorMessage={errors.languageOption}
          customOnChange={(event) => {
            patch({ languageOption: getEventValue(event) as NameLanguageOption });
            onClearError('languageOption');
          }}
        />
      </div>

      {value.languageOption && !separate ? (
        <>
          <OntarioInput
            elementId={`${idPrefix}-proposed-name`}
            caption={nameLabel('single')}
            name={`${idPrefix}-proposed-name`}
            required
            requiredValidationMessage={emptyMessage('single')}
            hintText={nameHintText()}
            value={value.proposedName}
            errorMessage={errors.proposedName}
            customOnInput={(event) => {
              patch({ proposedName: getEventValue(event) });
              onClearError('proposedName');
            }}
            customOnBlur={(event) =>
              patch({ proposedName: toBlockCapitals(getEventValue(event)) })
            }
          />
          <FileUpload
            label="Upload NUANS report"
            required
            hintText="Upload the NUANS report that confirms the proposed name is available."
            value={value.nuansFile}
            errorMessage={errors.nuansFile}
            onChange={(meta) => setFile('nuansFile', meta)}
            inputId={`${idPrefix}-nuans-file`}
          />
          <div id={`${idPrefix}-nuans-date`}>
            <OntarioDateInput
              elementId={`${idPrefix}-nuans-date-input`}
              caption="NUANS report date"
              required
              value={value.nuansDate || undefined}
              dateValidator={dateValidatorFor('nuansDate')}
              onInputOnInput={(event) => {
                const next = aggregateDateFromEvent(event);
                if (next !== null) {
                  patch({ nuansDate: next });
                }
                onClearError('nuansDate');
              }}
              onInputOnChange={(event) => {
                const next = aggregateDateFromEvent(event);
                if (next !== null) {
                  patch({ nuansDate: next });
                }
                onClearError('nuansDate');
              }}
            />
          </div>
        </>
      ) : null}

      {separate ? (
        <>
          <OntarioInput
            elementId={`${idPrefix}-proposed-name-en`}
            caption={nameLabel('en')}
            name={`${idPrefix}-proposed-name-en`}
            required
            requiredValidationMessage={emptyMessage('en')}
            hintText={nameHintText()}
            value={value.proposedNameEn}
            errorMessage={errors.proposedNameEn}
            customOnInput={(event) => {
              patch({ proposedNameEn: getEventValue(event) });
              onClearError('proposedNameEn');
            }}
            customOnBlur={(event) =>
              patch({ proposedNameEn: toBlockCapitals(getEventValue(event)) })
            }
          />
          <FileUpload
            label="Upload English NUANS report"
            required
            hintText="Upload the NUANS report for the English name."
            value={value.nuansFileEn}
            errorMessage={errors.nuansFileEn}
            onChange={(meta) => setFile('nuansFileEn', meta)}
            inputId={`${idPrefix}-nuans-file-en`}
          />
          <div id={`${idPrefix}-nuans-date-en`}>
            <OntarioDateInput
              elementId={`${idPrefix}-nuans-date-en-input`}
              caption="English NUANS report date"
              required
              value={value.nuansDateEn || undefined}
              dateValidator={dateValidatorFor('nuansDateEn')}
              onInputOnInput={(event) => {
                const next = aggregateDateFromEvent(event);
                if (next !== null) {
                  patch({ nuansDateEn: next });
                }
                onClearError('nuansDateEn');
              }}
              onInputOnChange={(event) => {
                const next = aggregateDateFromEvent(event);
                if (next !== null) {
                  patch({ nuansDateEn: next });
                }
                onClearError('nuansDateEn');
              }}
            />
          </div>

          <OntarioInput
            elementId={`${idPrefix}-proposed-name-fr`}
            caption={nameLabel('fr')}
            name={`${idPrefix}-proposed-name-fr`}
            required
            requiredValidationMessage={emptyMessage('fr')}
            hintText={
              isCoop
                ? 'Enter the name in block capital letters, as it should appear on the official record. Example: INSTITUT GREEN COOPÉRATIVE INC.'
                : nameHintText()
            }
            value={value.proposedNameFr}
            errorMessage={errors.proposedNameFr}
            customOnInput={(event) => {
              patch({ proposedNameFr: getEventValue(event) });
              onClearError('proposedNameFr');
            }}
            customOnBlur={(event) =>
              patch({ proposedNameFr: toBlockCapitals(getEventValue(event)) })
            }
          />
          <FileUpload
            label="Upload French NUANS report"
            required
            hintText="Upload the NUANS report for the French name."
            value={value.nuansFileFr}
            errorMessage={errors.nuansFileFr}
            onChange={(meta) => setFile('nuansFileFr', meta)}
            inputId={`${idPrefix}-nuans-file-fr`}
          />
          <div id={`${idPrefix}-nuans-date-fr`}>
            <OntarioDateInput
              elementId={`${idPrefix}-nuans-date-fr-input`}
              caption="French NUANS report date"
              required
              value={value.nuansDateFr || undefined}
              dateValidator={dateValidatorFor('nuansDateFr')}
              onInputOnInput={(event) => {
                const next = aggregateDateFromEvent(event);
                if (next !== null) {
                  patch({ nuansDateFr: next });
                }
                onClearError('nuansDateFr');
              }}
              onInputOnChange={(event) => {
                const next = aggregateDateFromEvent(event);
                if (next !== null) {
                  patch({ nuansDateFr: next });
                }
                onClearError('nuansDateFr');
              }}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

export function validateNameNuansFields(
  value: NameNuansFields,
  nameKind: 'cooperative' | 'corporation' | 'nfp',
  validateName: (name: string) => string | undefined,
): NameNuansErrors {
  const next: NameNuansErrors = {};
  if (!value.languageOption) {
    next.languageOption = 'Select a name language option.';
    return next;
  }

  const separate = isSeparateLanguage(value.languageOption);
  const emptySingle =
    nameKind === 'cooperative'
      ? COOPERATIVE_NAME_REQUIRED_ERROR
      : nameKind === 'nfp'
        ? 'Enter the Not-for-Profit corporation name.'
        : 'Enter the corporation name.';
  const emptyEn =
    nameKind === 'cooperative'
      ? COOPERATIVE_NAME_REQUIRED_ERROR
      : nameKind === 'nfp'
        ? 'Enter the English Not-for-Profit corporation name.'
        : 'Enter the English corporation name.';
  const emptyFr =
    nameKind === 'cooperative'
      ? COOPERATIVE_NAME_REQUIRED_ERROR
      : nameKind === 'nfp'
        ? 'Enter the French Not-for-Profit corporation name.'
        : 'Enter the French corporation name.';

  if (!separate) {
    if (!value.proposedName.trim()) {
      next.proposedName = emptySingle;
    } else {
      const nameError = validateName(value.proposedName);
      if (nameError) {
        next.proposedName = nameError;
      }
    }
    if (!value.nuansFile) {
      next.nuansFile = 'Upload a NUANS report.';
    }
    const dateError = validateNuansDate(value.nuansDate);
    if (dateError) {
      next.nuansDate = dateError;
    }
    return next;
  }

  if (!value.proposedNameEn.trim()) {
    next.proposedNameEn = emptyEn;
  } else {
    const enError = validateName(value.proposedNameEn);
    if (enError) {
      next.proposedNameEn = enError;
    }
  }
  if (!value.nuansFileEn) {
    next.nuansFileEn = 'Upload the English NUANS report.';
  }
  const enDateError = validateNuansDate(value.nuansDateEn);
  if (enDateError) {
    next.nuansDateEn = enDateError;
  }

  if (!value.proposedNameFr.trim()) {
    next.proposedNameFr = emptyFr;
  } else {
    const frError = validateName(value.proposedNameFr);
    if (frError) {
      next.proposedNameFr = frError;
    }
  }
  if (!value.nuansFileFr) {
    next.nuansFileFr = 'Upload the French NUANS report.';
  }
  const frDateError = validateNuansDate(value.nuansDateFr);
  if (frDateError) {
    next.nuansDateFr = frDateError;
  }

  return next;
}
