import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { OntarioPageAlert } from '@ongov/ontario-design-system-component-library-react';
import {
  Form2DirectorBlock,
  validateDirector,
  type DirectorErrors,
} from './Form2DirectorEditor';
import {
  createEmptyDirector,
  EMPTY_STEP4,
  getDirectorLimit,
  readForm2Draft,
  upsertForm2Step4,
  type Form2Director,
  type Form2Step4Data,
} from './form2DraftStorage';
import styles from './Form2Step1.module.scss';

function readStep4(): Form2Step4Data {
  const draft = readForm2Draft();
  return { ...EMPTY_STEP4, ...(draft?.step4 ?? {}) };
}

export function Form2DirectorSubflow() {
  const navigate = useNavigate();
  const { directorId } = useParams<{ directorId: string }>();
  const isNew = !directorId;

  const initialDirector = useMemo(() => {
    if (isNew) {
      return createEmptyDirector();
    }
    const existing = readStep4().directors.find((entry) => entry.id === directorId);
    return existing ? structuredClone(existing) : null;
  }, [directorId, isNew]);

  const [director, setDirector] = useState<Form2Director | null>(initialDirector);
  const [errors, setErrors] = useState<DirectorErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  if (!director) {
    return <Navigate to="/form-2/step-5" replace />;
  }

  const current = director;

  function handleSave() {
    const fieldErrors = validateDirector(current);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setShowErrorSummary(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const step4 = readStep4();
    if (isNew) {
      const limit = getDirectorLimit(step4);
      if (limit !== null && step4.directors.length >= limit) {
        navigate('/form-2/step-5');
        return;
      }
    }

    const nextDirectors = isNew
      ? [...step4.directors, current]
      : step4.directors.map((entry) => (entry.id === current.id ? current : entry));

    upsertForm2Step4({ ...step4, directors: nextDirectors }, 'continue', 3);
    navigate('/form-2/step-5');
  }

  function handleCancel() {
    navigate('/form-2/step-5');
  }

  const errorItems = Object.entries(errors).filter(([, message]) => Boolean(message));

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
          {isNew ? 'Add director' : 'Edit director'}
        </h1>

        <div className={styles.formStack}>
          <Form2DirectorBlock
            director={current}
            expanded
            showChrome={false}
            errors={errors}
            onChange={(next) => {
              setDirector(next);
              setErrors({});
              setShowErrorSummary(false);
            }}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
