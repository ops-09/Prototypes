import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { SubflowErrorSummary } from '../shared/SubflowErrorSummary';
import {
  Form10CooperativeEditor,
  validateAmalgamatingCooperative,
  type CooperativeEditorErrors,
} from './Form10CooperativeEditor';
import {
  createEmptyAmalgamatingCooperative,
  EMPTY_STEP2,
  readForm10Draft,
  upsertForm10Step2,
  type AmalgamatingCooperative,
  type Form10Step2Data,
} from './form10DraftStorage';
import styles from './Form10Step1.module.scss';

function readStep2(): Form10Step2Data {
  const draft = readForm10Draft();
  return { ...EMPTY_STEP2, ...(draft?.step2 ?? {}) };
}

export function Form10CooperativeSubflow() {
  const navigate = useNavigate();
  const { cooperativeId } = useParams<{ cooperativeId: string }>();
  const isNew = !cooperativeId;
  const listHref = '/form-10/step-3';

  const initialCooperative = useMemo(() => {
    if (isNew) {
      return createEmptyAmalgamatingCooperative();
    }
    const existing = readStep2().amalgamatingCooperatives.find(
      (entry) => entry.id === cooperativeId,
    );
    return existing ? structuredClone(existing) : null;
  }, [cooperativeId, isNew]);

  const [cooperative, setCooperative] = useState<AmalgamatingCooperative | null>(
    initialCooperative,
  );
  const [errors, setErrors] = useState<CooperativeEditorErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const draft = readForm10Draft();
  if (!draft?.step1.cooperativeName) {
    return <Navigate to="/form-10/step-2" replace />;
  }

  if (!cooperative) {
    return <Navigate to={listHref} replace />;
  }

  const current = cooperative;
  const existingOcns = readStep2()
    .amalgamatingCooperatives.filter((entry) => entry.id !== current.id)
    .map((entry) => entry.ocn)
    .filter((ocn) => ocn.length > 0);

  function handleSave(next: AmalgamatingCooperative, manual: boolean) {
    const fieldErrors = validateAmalgamatingCooperative(next, {
      manual,
      existingOcns,
    });
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setShowErrorSummary(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const step2 = readStep2();
    const nextCooperatives = isNew
      ? [...step2.amalgamatingCooperatives, next]
      : step2.amalgamatingCooperatives.map((entry) =>
          entry.id === next.id ? next : entry,
        );

    upsertForm10Step2(
      { ...step2, amalgamatingCooperatives: nextCooperatives },
      'continue',
      1,
    );
    navigate(listHref);
  }

  function handleCancel() {
    navigate(listHref);
  }


  return (
    <div className="ontario-row">
      <div className="ontario-columns ontario-small-12 ontario-medium-8">
        {showErrorSummary ? (
          <SubflowErrorSummary
            errors={errors}
            anchorCandidates={(key) => {
            const base = `coop-${current.id}`;
            if (key === 'search') return [`${current.id}-corporation-search-input`, `${base}-name`];
            return [`${base}-${key}`, `${current.id}-corporation-search-input`];
          }}
            alertClassName={styles.alert}
            linkClassName={styles.errorSummaryLink}
          />
        ) : null}

        <h1 className={`ontario-h1 ${styles.subflowPageTitle}`}>
          {isNew ? 'Add amalgamating co-operative' : 'Edit amalgamating co-operative'}
        </h1>

        <Form10CooperativeEditor
          cooperative={current}
          existingOcns={existingOcns}
          errors={errors}
          onChange={(next) => {
            setCooperative(next);
            setErrors({});
            setShowErrorSummary(false);
          }}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
