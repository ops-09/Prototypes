import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { SubflowErrorSummary, personFieldCandidates } from '../shared/SubflowErrorSummary';
import {
  Form1DirectorBlock,
  validateDirector,
  type DirectorErrors,
} from './Form1DirectorEditor';
import {
  createEmptyDirector,
  EMPTY_STEP4,
  getDirectorLimit,
  readForm1Draft,
  upsertForm1Step4,
  type Form1Director,
  type Form1Step4Data,
} from './form1DraftStorage';
import styles from './Form1Step1.module.scss';

function readStep4(): Form1Step4Data {
  const draft = readForm1Draft();
  return { ...EMPTY_STEP4, ...(draft?.step4 ?? {}) };
}

export function Form1DirectorSubflow() {
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

  const [director, setDirector] = useState<Form1Director | null>(initialDirector);
  const [errors, setErrors] = useState<DirectorErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  if (!director) {
    return <Navigate to="/form-1/step-5" replace />;
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
        navigate('/form-1/step-5');
        return;
      }
    }

    const nextDirectors = isNew
      ? [...step4.directors, current]
      : step4.directors.map((entry) => (entry.id === current.id ? current : entry));

    upsertForm1Step4({ ...step4, directors: nextDirectors }, 'continue', 3);
    navigate('/form-1/step-5');
  }

  function handleCancel() {
    navigate('/form-1/step-5');
  }


  return (
    <div className="ontario-row">
      <div className="ontario-columns ontario-small-12 ontario-medium-8">
        {showErrorSummary ? (
          <SubflowErrorSummary
            errors={errors}
            anchorCandidates={personFieldCandidates(`dir-${current.id}`)}
            alertClassName={styles.alert}
            linkClassName={styles.errorSummaryLink}
          />
        ) : null}

        <h1 className={`ontario-h1 ${styles.subflowPageTitle}`}>
          {isNew ? 'Add director' : 'Edit director'}
        </h1>

        <div className={styles.formStack}>
          <Form1DirectorBlock
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
