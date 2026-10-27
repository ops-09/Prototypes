import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { SubflowErrorSummary, personFieldCandidates } from '../shared/SubflowErrorSummary';
import {
  Form1IncorporatorBlock,
  validateIncorporator,
  type IncorporatorErrors,
} from './Form1IncorporatorEditor';
import {
  createEmptyIncorporator,
  EMPTY_STEP7,
  readForm1Draft,
  syncIncorporatorsFromDirectors,
  upsertForm1Step7,
  type Form1Incorporator,
  type Form1Step7Data,
} from './form1DraftStorage';
import styles from './Form1Step1.module.scss';

function readStep7Synced(): Form1Step7Data {
  const draft = readForm1Draft();
  const directors = draft?.step4?.directors ?? [];
  const incorporators = syncIncorporatorsFromDirectors(
    directors,
    draft?.step7?.incorporators ?? [],
  );
  return { ...EMPTY_STEP7, incorporators };
}

export function Form1IncorporatorSubflow() {
  const navigate = useNavigate();
  const { incorporatorId } = useParams<{ incorporatorId: string }>();
  const isNew = !incorporatorId;

  const step7Baseline = useMemo(() => readStep7Synced(), []);

  const initialIncorporator = useMemo(() => {
    if (isNew) {
      return createEmptyIncorporator('individual');
    }
    const existing = step7Baseline.incorporators.find(
      (entry) => entry.id === incorporatorId,
    );
    return existing ? structuredClone(existing) : null;
  }, [incorporatorId, isNew, step7Baseline.incorporators]);

  const [incorporator, setIncorporator] = useState<Form1Incorporator | null>(
    initialIncorporator,
  );
  const [errors, setErrors] = useState<IncorporatorErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  if (!isNew && !incorporator) {
    return <Navigate to="/form-1/step-8" replace />;
  }

  function handleSave() {
    if (!incorporator) {
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

  const isLinked = Boolean(incorporator?.linkedDirectorId);

  return (
    <div className="ontario-row">
      <div className="ontario-columns ontario-small-12 ontario-medium-8">
        {showErrorSummary ? (
          <SubflowErrorSummary
            errors={errors}
            anchorCandidates={personFieldCandidates(`inc-${incorporator?.id ?? ''}`)}
            alertClassName={styles.alert}
            linkClassName={styles.errorSummaryLink}
          />
        ) : null}

        <h1 className={`ontario-h1 ${styles.subflowPageTitle}`}>
          {isNew
            ? 'Add an incorporator'
            : isLinked
              ? 'Edit incorporator shares'
              : 'Edit incorporator'}
        </h1>

        <div className={styles.formStack}>
          {incorporator ? (
            <Form1IncorporatorBlock
              incorporator={incorporator}
              allowTypeChange={isNew}
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
          ) : null}
        </div>
      </div>
    </div>
  );
}
