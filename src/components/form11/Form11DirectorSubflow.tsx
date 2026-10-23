import { useMemo, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { OntarioPageAlert } from '@ongov/ontario-design-system-component-library-react';
import {
  DIRECTOR_ERROR_FIELD_ORDER,
  Form11DirectorEditor,
  getDirectorFieldAnchor,
  validateDirector,
  type DirectorErrors,
} from './Form11DirectorEditor';
import { focusField } from './form11Focus';
import {
  createAccountDirector,
  createEmptyDirector,
  EMPTY_STEP6,
  getDirectorLimit,
  hasForm11HeadOffice,
  readForm11Draft,
  upsertForm11Step6,
  type Form11Director,
  type Form11Step6Data,
} from './form11DraftStorage';
import styles from './Form11Step2.module.scss';

const LIST_HREF = '/form-11/step-6';

function readStep6(): Form11Step6Data {
  const draft = readForm11Draft();
  return { ...EMPTY_STEP6, ...(draft?.step6 ?? {}) };
}

export function Form11DirectorSubflow() {
  const navigate = useNavigate();
  const { directorId } = useParams<{ directorId: string }>();
  const [searchParams] = useSearchParams();
  const isNew = !directorId;
  const fromAccount = isNew && searchParams.get('fromAccount') === '1';
  const draft = readForm11Draft();

  const initialDirector = useMemo(() => {
    if (isNew) {
      return fromAccount ? createAccountDirector() : createEmptyDirector();
    }
    const existing = readStep6().directors.find((entry) => entry.id === directorId);
    return existing ? structuredClone(existing) : null;
  }, [directorId, fromAccount, isNew]);

  const [director, setDirector] = useState<Form11Director | null>(initialDirector);
  const [errors, setErrors] = useState<DirectorErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  if (!draft || !hasForm11HeadOffice(draft.step5)) {
    return <Navigate to="/form-11/step-5" replace />;
  }

  if (!director) {
    return <Navigate to={LIST_HREF} replace />;
  }

  const current = director;
  const errorItems = DIRECTOR_ERROR_FIELD_ORDER.flatMap((key) => {
    const message = errors[key];
    if (!message) {
      return [];
    }
    return [{ key, message, href: `#${getDirectorFieldAnchor(current.id, key)}` }];
  });

  function handleSave() {
    const fieldErrors = validateDirector(current);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setShowErrorSummary(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const step6 = readStep6();
    if (isNew) {
      const limit = getDirectorLimit(step6);
      if (limit !== null && step6.directors.length >= limit) {
        navigate(LIST_HREF);
        return;
      }
    }

    const nextDirectors = isNew
      ? [...step6.directors, current]
      : step6.directors.map((entry) => (entry.id === current.id ? current : entry));

    upsertForm11Step6({ ...step6, directors: nextDirectors }, 'draft', draft.lastCompletedStep);
    navigate(LIST_HREF);
  }

  function handleCancel() {
    navigate(LIST_HREF);
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

        <h1 className={`ontario-h1 ${styles.subflowPageTitle}`}>
          {isNew ? 'Add a Director' : 'Edit director'}
        </h1>

        <div className={styles.formStack}>
          <Form11DirectorEditor
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
