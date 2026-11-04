import { useMemo, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { OntarioPageAlert } from '@ongov/ontario-design-system-component-library-react';
import {
  DIRECTOR_ERROR_FIELD_ORDER,
  ContinuanceDirectorEditor,
  getDirectorFieldAnchor,
  validateDirector,
  type DirectorErrors,
} from './ContinuanceDirectorEditor';
import { focusField } from './continuanceFocus';
import {
  continuanceReviewPath,
  isReviewReturn,
} from './continuanceReviewReturn';
import {
  createAccountDirector,
  createEmptyDirector,
  EMPTY_STEP6,
  ensureContinuanceStep6Draft,
  getDirectorLimit,
  upsertContinuanceStep6,
  type ContinuanceDirector,
  type ContinuanceFormId,
  type ContinuanceStep6Data,
} from './continuanceDraftStorage';
import styles from '../form2/Form2Step1.module.scss';

type ContinuanceDirectorSubflowProps = {
  formId: ContinuanceFormId;
};

function readStep6(formId: ContinuanceFormId): ContinuanceStep6Data {
  const draft = ensureContinuanceStep6Draft(formId);
  return { ...EMPTY_STEP6, ...draft.step6, groups: draft.step6.groups };
}

export function ContinuanceDirectorSubflow({ formId }: ContinuanceDirectorSubflowProps) {
  const navigate = useNavigate();
  const { directorId } = useParams<{ directorId: string }>();
  const [searchParams] = useSearchParams();
  const isNew = !directorId;
  const fromAccount = isNew && searchParams.get('fromAccount') === '1';
  const listHref = `/form-${formId}/step-6`;
  const doneHref = isReviewReturn(searchParams)
    ? continuanceReviewPath(formId)
    : listHref;
  const draft = ensureContinuanceStep6Draft(formId);

  const initialDirector = useMemo(() => {
    if (isNew) {
      return fromAccount ? createAccountDirector() : createEmptyDirector();
    }
    const existing = readStep6(formId).directors.find((entry) => entry.id === directorId);
    return existing ? structuredClone(existing) : null;
  }, [directorId, formId, fromAccount, isNew]);

  const [director, setDirector] = useState<ContinuanceDirector | null>(initialDirector);
  const [errors, setErrors] = useState<DirectorErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  if (!director) {
    return <Navigate to={listHref} replace />;
  }

  const current = director;
  const errorItems = DIRECTOR_ERROR_FIELD_ORDER.flatMap((key) => {
    const message = errors[key];
    if (!message) {
      return [];
    }
    return [
      {
        key,
        message,
        href: `#${getDirectorFieldAnchor(current.id, key, current.address.addressType)}`,
      },
    ];
  });

  function handleSave() {
    const fieldErrors = validateDirector(current);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setShowErrorSummary(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const step6 = readStep6(formId);
    if (isNew) {
      const limit = getDirectorLimit(step6);
      if (limit !== null && step6.directors.length >= limit) {
        navigate(listHref);
        return;
      }
    }

    const nextDirectors = isNew
      ? [...step6.directors, current]
      : step6.directors.map((entry) => (entry.id === current.id ? current : entry));

    upsertContinuanceStep6(
      formId,
      { ...step6, directors: nextDirectors },
      'draft',
      draft.lastCompletedStep,
    );
    navigate(doneHref);
  }

  function handleCancel() {
    navigate(doneHref);
  }

  function handleSummaryLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    focusField(href.replace('#', ''));
  }

  return (
    <div className="ontario-row">
      <div className="ontario-columns ontario-small-12 ontario-medium-8">
        {showErrorSummary && errorItems.length > 0 ? (
          <div className={styles.alert} tabIndex={-1}>
            <OntarioPageAlert type="error" heading="There is a problem">
              <p>Errors were found on this page:</p>
              <ul>
                {errorItems.map((item) => (
                  <li key={item.key}>
                    <a
                      className={styles.errorSummaryLink}
                      href={item.href}
                      onClick={(event) => handleSummaryLinkClick(event, item.href)}
                    >
                      {item.message}
                    </a>
                  </li>
                ))}
              </ul>
            </OntarioPageAlert>
          </div>
        ) : null}

        <h1 className={`ontario-h1 ${styles.pageTitle}`}>
          {isNew ? 'Add a Director' : 'Edit director'}
        </h1>

        <div className={styles.formStack}>
          <ContinuanceDirectorEditor
            director={current}
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
