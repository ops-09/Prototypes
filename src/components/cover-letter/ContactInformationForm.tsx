import {
  OntarioButton,
  OntarioInput,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  contactFromSignedInProfile,
  type CoverLetterContact,
  writeCoverLetterContact,
} from './coverLetterContactStorage';
import {
  normalizePhoneNumber,
  validatePhoneFields,
} from './phoneValidation';
import styles from './ContactInformationForm.module.scss';

const WHY_CONTACT =
  'Please provide your full name and contact information. We will contact you if we require additional information about this filing. You will receive the official documents resulting from this filing.';

const FIELD_ANCHORS: Record<string, string> = {
  firstName: 'cover-letter-first-name',
  middleName: 'cover-letter-middle-name',
  lastName: 'cover-letter-last-name',
  phoneNumber: 'cover-letter-phone-number',
  phoneExtension: 'cover-letter-phone-extension',
  email: 'cover-letter-email',
  confirmEmail: 'cover-letter-confirm-email',
};

type FieldKey = keyof CoverLetterContact;

function getEventValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | null;
  return target?.value ?? '';
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function focusField(anchorId: string) {
  const target = document.getElementById(anchorId);
  if (!target) {
    return;
  }
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const shadowControl = target.shadowRoot?.querySelector<HTMLElement>(
    'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
  );
  if (shadowControl) {
    shadowControl.focus({ preventScroll: true });
    return;
  }

  if (typeof target.focus === 'function') {
    target.focus({ preventScroll: true });
  }
}

type ContactInformationFormProps = {
  /** When set, Continue saves contact info and navigates into the filing. */
  continueHref?: string;
  currentStep?: number;
  numberOfSteps?: number;
  backButtonUrl?: string;
  primaryButtonLabel?: string;
};

export function ContactInformationForm({
  continueHref,
  currentStep,
  numberOfSteps,
  backButtonUrl = '/',
  primaryButtonLabel = 'Start',
}: ContactInformationFormProps = {}) {
  const navigate = useNavigate();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const stepIndicatorRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<CoverLetterContact>(() => contactFromSignedInProfile());
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [saved, setSaved] = useState(false);
  const showFilingSteps =
    typeof currentStep === 'number' && typeof numberOfSteps === 'number';

  // Standalone cover letter omits step counts — ODS still renders a “Step ? of ?”
  // placeholder without those props, so hide that label only in standalone mode.
  useLayoutEffect(() => {
    if (showFilingSteps) {
      return;
    }

    let cancelled = false;
    let frame = 0;

    const hideStepLabel = () => {
      if (cancelled) {
        return;
      }
      const host = stepIndicatorRef.current?.querySelector('ontario-step-indicator');
      const label = host?.shadowRoot?.querySelector<HTMLElement>('.ontario-h4');
      if (!label) {
        frame = requestAnimationFrame(hideStepLabel);
        return;
      }
      label.hidden = true;
      label.style.display = 'none';
    };

    hideStepLabel();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [showFilingSteps]);

  const errorSummaryItems = useMemo(
    () =>
      (Object.entries(errors) as [FieldKey, string][])
        .filter(([, message]) => Boolean(message))
        .map(([field, message]) => ({
          key: field,
          message,
          href: `#${FIELD_ANCHORS[field] ?? field}`,
        })),
    [errors],
  );

  function patchField(field: FieldKey, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validate(): Partial<Record<FieldKey, string>> {
    const next: Partial<Record<FieldKey, string>> = {};

    if (!form.firstName.trim()) {
      next.firstName = 'Enter your first name.';
    }
    if (!form.middleName.trim()) {
      next.middleName = 'Enter your middle name(s).';
    }
    if (!form.lastName.trim()) {
      next.lastName = 'Enter your last name.';
    }

    if (!form.email.trim()) {
      next.email = 'Enter your email address.';
    } else if (!isValidEmail(form.email.trim())) {
      next.email = 'Enter a valid email address.';
    }

    if (!form.confirmEmail.trim()) {
      next.confirmEmail = 'Confirm your email address.';
    } else if (form.email.trim() !== form.confirmEmail.trim()) {
      next.confirmEmail = 'Email addresses must match exactly.';
    }

    Object.assign(
      next,
      validatePhoneFields({
        phoneNumber: form.phoneNumber,
        phoneExtension: form.phoneExtension,
      }),
    );

    return next;
  }

  function handleContinue() {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => {
        errorSummaryRef.current?.focus();
      });
      return;
    }

    const savedContact: CoverLetterContact = {
      ...form,
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim(),
      lastName: form.lastName.trim(),
      phoneNumber: normalizePhoneNumber(form.phoneNumber),
      phoneExtension: form.phoneExtension.trim(),
      email: form.email.trim(),
      confirmEmail: form.confirmEmail.trim(),
    };

    writeCoverLetterContact(savedContact);

    if (continueHref) {
      navigate(continueHref);
      return;
    }

    setSaved(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancel() {
    // Discard edits — do not write sessionStorage.
    navigate('/');
  }

  function handleSummaryLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    focusField(href.replace('#', ''));
  }

  return (
    <>
      <div className={styles.stepIndicator} ref={stepIndicatorRef}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl={backButtonUrl}
          currentStep={showFilingSteps ? currentStep : undefined}
          numberOfSteps={showFilingSteps ? numberOfSteps : undefined}
        />
      </div>

      <div className="ontario-row">
        <div className="ontario-columns ontario-small-12 ontario-medium-8">
          {errorSummaryItems.length > 0 ? (
            <div ref={errorSummaryRef} className={styles.alert} tabIndex={-1}>
              <OntarioPageAlert type="error" heading="There is a problem">
                <p>Errors were found on this page:</p>
                <ul>
                  {errorSummaryItems.map((item) => (
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

          {saved ? (
            <div className={styles.alert}>
              <OntarioPageAlert
                type="success"
                heading="Contact information saved"
                content="Your contact details were saved for this browser session. You can continue to a filing form when ready."
              />
            </div>
          ) : null}

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Contact information</h1>

          <p className={styles.lead}>{WHY_CONTACT}</p>

          <div className={styles.formStack}>
            <OntarioInput
              elementId={FIELD_ANCHORS.firstName}
              caption="First name"
              name="cover-letter-first-name"
              type="text"
              required
              requiredValidationMessage="Enter your first name."
              value={form.firstName}
              errorMessage={errors.firstName}
              customOnInput={(event) => patchField('firstName', getEventValue(event))}
            />
            <OntarioInput
              elementId={FIELD_ANCHORS.middleName}
              caption="Middle name(s)"
              name="cover-letter-middle-name"
              type="text"
              required
              requiredValidationMessage="Enter your middle name(s)."
              value={form.middleName}
              errorMessage={errors.middleName}
              customOnInput={(event) => patchField('middleName', getEventValue(event))}
            />
            <OntarioInput
              elementId={FIELD_ANCHORS.lastName}
              caption="Last name"
              name="cover-letter-last-name"
              type="text"
              required
              requiredValidationMessage="Enter your last name."
              value={form.lastName}
              errorMessage={errors.lastName}
              customOnInput={(event) => patchField('lastName', getEventValue(event))}
            />
            <OntarioInput
              elementId={FIELD_ANCHORS.email}
              caption="Email"
              name="cover-letter-email"
              type="email"
              required
              requiredValidationMessage="Enter your email address."
              value={form.email}
              errorMessage={errors.email}
              customOnInput={(event) => {
                patchField('email', getEventValue(event));
                setErrors((prev) => {
                  if (!prev.confirmEmail) {
                    return prev;
                  }
                  const next = { ...prev };
                  delete next.confirmEmail;
                  return next;
                });
              }}
            />
            <OntarioInput
              elementId={FIELD_ANCHORS.confirmEmail}
              caption="Confirm Email Address"
              name="cover-letter-confirm-email"
              type="email"
              required
              requiredValidationMessage="Confirm your email address."
              value={form.confirmEmail}
              errorMessage={errors.confirmEmail}
              customOnInput={(event) => patchField('confirmEmail', getEventValue(event))}
            />
            <div className={styles.shortField}>
              <OntarioInput
                elementId={FIELD_ANCHORS.phoneNumber}
                caption="Phone number"
                name="cover-letter-phone-number"
                type="tel"
                required
                requiredValidationMessage="Enter your phone number."
                value={form.phoneNumber}
                errorMessage={errors.phoneNumber}
                customOnInput={(event) => patchField('phoneNumber', getEventValue(event))}
              />
            </div>
            <div className={styles.shortField}>
              <OntarioInput
                elementId={FIELD_ANCHORS.phoneExtension}
                caption="Ext"
                name="cover-letter-phone-extension"
                type="tel"
                value={form.phoneExtension}
                errorMessage={errors.phoneExtension}
                customOnInput={(event) =>
                  patchField('phoneExtension', getEventValue(event))
                }
              />
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <OntarioButton type="primary" htmlType="button" onClick={handleContinue}>
              {primaryButtonLabel}
            </OntarioButton>
            <OntarioButton type="tertiary" htmlType="button" onClick={handleCancel}>
              Cancel
            </OntarioButton>
          </div>
        </div>
      </div>
    </>
  );
}
