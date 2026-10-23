import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { OntarioPageAlert } from '@ongov/ontario-design-system-component-library-react';
import {
  Form11CorporationEditor,
  validateAmalgamatingNfp,
  type CorporationEditorErrors,
} from './Form11CorporationEditor';
import { focusField } from './form11Focus';
import {
  createAccountAmalgamatingNfp,
  createEmptyAmalgamatingNfp,
  EMPTY_STEP3,
  normalizeOcn,
  OBR_STEP2_DEFAULTS,
  readForm11Draft,
  upsertForm11Step2,
  upsertForm11Step3,
  type AmalgamatingNfp,
  type Form11Step3Data,
} from './form11DraftStorage';
import styles from './Form11Step2.module.scss';

const LIST_HREF = '/form-11/step-3';

function ensureStep2Draft() {
  const existing = readForm11Draft();
  if (existing?.step2.email) {
    return existing;
  }
  return upsertForm11Step2({ ...OBR_STEP2_DEFAULTS }, 'continue');
}

function readStep3(): Form11Step3Data {
  const draft = readForm11Draft();
  return { ...EMPTY_STEP3, ...(draft?.step3 ?? {}) };
}

export function Form11CorporationSubflow() {
  const navigate = useNavigate();
  const { corporationId } = useParams<{ corporationId: string }>();
  const [searchParams] = useSearchParams();
  const isNew = !corporationId;
  const fromAccount = isNew && searchParams.get('fromAccount') === '1';

  const draft = ensureStep2Draft();

  const initialCorporation = useMemo(() => {
    if (isNew) {
      return fromAccount ? createAccountAmalgamatingNfp() : createEmptyAmalgamatingNfp();
    }
    const existing = readStep3().corporations.find((entry) => entry.id === corporationId);
    return existing ? structuredClone(existing) : null;
  }, [corporationId, fromAccount, isNew]);

  const [corporation, setCorporation] = useState<AmalgamatingNfp | null>(initialCorporation);
  const [errors, setErrors] = useState<CorporationEditorErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  if (!draft?.step2.email) {
    return <Navigate to="/form-11/step-2" replace />;
  }

  if (!corporation) {
    return <Navigate to={LIST_HREF} replace />;
  }

  const current = corporation;
  const existingOcns = readStep3()
    .corporations.filter((entry) => entry.id !== current.id)
    .map((entry) => normalizeOcn(entry.ocn))
    .filter((ocn) => ocn.length > 0);

  function handleSave(next: AmalgamatingNfp, manual: boolean) {
    const fieldErrors = validateAmalgamatingNfp(next, { manual, existingOcns });
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setShowErrorSummary(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.requestAnimationFrame(() => {
        if (fieldErrors.name) {
          focusField(`nfp-${next.id}-name`);
        } else if (fieldErrors.ocn) {
          focusField(`nfp-${next.id}-ocn`);
        } else if (fieldErrors.search) {
          focusField(`form11-ocn-search-${next.id}`);
        }
      });
      return;
    }

    const step3 = readStep3();
    const nextCorporations = isNew
      ? [...step3.corporations, next]
      : step3.corporations.map((entry) => (entry.id === next.id ? next : entry));

    upsertForm11Step3(
      { ...step3, corporations: nextCorporations },
      'continue',
      readForm11Draft()?.lastCompletedStep ?? 2,
    );
    navigate(LIST_HREF);
  }

  function handleCancel() {
    navigate(LIST_HREF);
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
          {isNew
            ? 'Add amalgamating not-for-profit corporation'
            : 'Edit amalgamating not-for-profit corporation'}
        </h1>

        <Form11CorporationEditor
          corporation={current}
          existingOcns={existingOcns}
          errors={errors}
          onChange={(next) => {
            setCorporation(next);
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
