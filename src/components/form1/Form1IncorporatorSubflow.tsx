import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  OntarioButton,
  OntarioDropdownList,
  OntarioPageAlert,
} from '@ongov/ontario-design-system-component-library-react';
import { formatDirectorFullName } from './Form1DirectorEditor';
import {
  Form1IncorporatorBlock,
  validateIncorporator,
  type IncorporatorErrors,
} from './Form1IncorporatorEditor';
import {
  createEmptyIncorporator,
  EMPTY_STEP7,
  incorporatorFromDirector,
  readForm1Draft,
  syncIncorporatorsFromDirectors,
  upsertForm1Step7,
  type Form1Director,
  type Form1Incorporator,
  type Form1Step7Data,
} from './form1DraftStorage';
import styles from './Form1Step1.module.scss';

const SOURCE_NEW = 'new';
const SOURCE_REQUIRED = 'Select a first director or choose to add a new incorporator.';

function getEventValue(event: globalThis.Event) {
  const target = event.target as HTMLSelectElement | HTMLInputElement | null;
  return target?.value ?? '';
}

function readStep7Synced(): Form1Step7Data {
  const draft = readForm1Draft();
  const directors = draft?.step4?.directors ?? [];
  const incorporators = syncIncorporatorsFromDirectors(
    directors,
    draft?.step7?.incorporators ?? [],
  );
  return { ...EMPTY_STEP7, incorporators };
}

function readDirectors(): Form1Director[] {
  return readForm1Draft()?.step4?.directors ?? [];
}

export function Form1IncorporatorSubflow() {
  const navigate = useNavigate();
  const { incorporatorId } = useParams<{ incorporatorId: string }>();
  const isNew = !incorporatorId;

  const directors = useMemo(() => readDirectors(), []);
  const step7Baseline = useMemo(() => readStep7Synced(), []);

  const initialIncorporator = useMemo(() => {
    if (isNew) {
      return null;
    }
    const existing = step7Baseline.incorporators.find(
      (entry) => entry.id === incorporatorId,
    );
    return existing ? structuredClone(existing) : null;
  }, [incorporatorId, isNew, step7Baseline.incorporators]);

  const [sourceValue, setSourceValue] = useState(() => {
    if (!isNew && initialIncorporator?.linkedDirectorId) {
      return initialIncorporator.linkedDirectorId;
    }
    if (!isNew && initialIncorporator) {
      return SOURCE_NEW;
    }
    return '';
  });
  const [sourceError, setSourceError] = useState('');
  const [incorporator, setIncorporator] = useState<Form1Incorporator | null>(
    initialIncorporator,
  );
  const [errors, setErrors] = useState<IncorporatorErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  if (!isNew && !incorporator) {
    return <Navigate to="/form-1/step-8" replace />;
  }

  const usedDirectorIds = new Set(
    step7Baseline.incorporators
      .filter((entry) => entry.id !== incorporator?.id)
      .map((entry) => entry.linkedDirectorId)
      .filter(Boolean),
  );

  const availableDirectors = directors.filter((director) => {
    if (incorporator?.linkedDirectorId === director.id) {
      return true;
    }
    return !usedDirectorIds.has(director.id);
  });

  const sourceOptions = [
    { value: SOURCE_NEW, label: 'New incorporator' },
    ...availableDirectors.map((director) => ({
      value: director.id,
      label: formatDirectorFullName(director) || 'First director',
    })),
  ];

  function applySource(value: string) {
    setSourceValue(value);
    setSourceError('');
    setErrors({});
    setShowErrorSummary(false);

    if (!value) {
      setIncorporator(null);
      return;
    }

    if (value === SOURCE_NEW) {
      setIncorporator(createEmptyIncorporator('individual'));
      return;
    }

    const director = directors.find((item) => item.id === value);
    if (!director) {
      setIncorporator(null);
      return;
    }

    setIncorporator(
      incorporatorFromDirector(
        director,
        incorporator?.id && incorporator.linkedDirectorId === director.id
          ? incorporator.id
          : undefined,
      ),
    );
  }

  function handleSave() {
    if (isNew && !sourceValue) {
      setSourceError(SOURCE_REQUIRED);
      setShowErrorSummary(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!incorporator) {
      setSourceError(SOURCE_REQUIRED);
      setShowErrorSummary(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const current = incorporator;
    const existingOcns = readStep7Synced()
      .incorporators.filter((entry) => entry.id !== current.id)
      .map((entry) => entry.ocn)
      .filter(Boolean);

    const fieldErrors = validateIncorporator(current, { existingOcns });
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setShowErrorSummary(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const step7 = readStep7Synced();
    const nextIncorporators = isNew
      ? [...step7.incorporators, current]
      : step7.incorporators.map((entry) =>
          entry.id === current.id ? current : entry,
        );

    upsertForm1Step7({ incorporators: nextIncorporators }, 'continue', 6);
    navigate('/form-1/step-8');
  }

  function handleCancel() {
    navigate('/form-1/step-8');
  }

  const errorItems = [
    ...(sourceError ? [['source', sourceError] as const] : []),
    ...Object.entries(errors).filter(([, message]) => Boolean(message)),
  ];
  const isLinked = Boolean(incorporator?.linkedDirectorId);
  const showForm = Boolean(incorporator);

  return (
    <div className="ontario-row">
      <div className="ontario-columns ontario-small-12 ontario-medium-8">
        {showErrorSummary && errorItems.length > 0 ? (
          <div className={styles.alert} tabIndex={-1}>
            <OntarioPageAlert type="error" heading="There is a problem">
              <p>Errors were found on this page:</p>
              <ul>
                {errorItems.map(([key, message]) => (
                  <li key={key}>{message}</li>
                ))}
              </ul>
            </OntarioPageAlert>
          </div>
        ) : null}

        <h1 className={`ontario-h1 ${styles.subflowPageTitle}`}>
          {isNew
            ? 'Add an incorporator'
            : isLinked
              ? 'Enter shares for incorporator'
              : 'Edit incorporator'}
        </h1>

        <div className={styles.formStack}>
          {isNew ? (
            <OntarioDropdownList
              elementId="incorporator-source"
              caption="Who is this incorporator?"
              name="incorporator-source"
              required
              isEmptyStartOption
              options={sourceOptions}
              value={sourceValue}
              errorMessage={sourceError}
              hintText="Choose a first director to pre-fill their details, or add a new incorporator."
              customOnChange={(event) => applySource(getEventValue(event))}
            />
          ) : null}

          {showForm && incorporator ? (
            <Form1IncorporatorBlock
              incorporator={incorporator}
              allowTypeChange={isNew && sourceValue === SOURCE_NEW}
              existingOcns={readStep7Synced()
                .incorporators.filter((entry) => entry.id !== incorporator.id)
                .map((entry) => entry.ocn)
                .filter(Boolean)}
              errors={errors}
              onChange={(next) => {
                setIncorporator(next);
                setErrors({});
                setShowErrorSummary(false);
              }}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <div className={styles.buttonGroup}>
              <OntarioButton
                type="tertiary"
                htmlType="button"
                label="Cancel"
                onClick={handleCancel}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
