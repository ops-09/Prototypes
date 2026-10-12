import { OntarioLoadingIndicator, OntarioPageAlert } from '@ongov/ontario-design-system-component-library-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roleSkipsServiceAccess } from '../../rbac/roles';
import { useRbac } from '../../rbac/RbacContext';
import { DEFAULT_SERVICE_ACCESS, hasServiceAccessSelection } from '../../rbac/services';
import type {
  BatchCustomInviteStep,
  BatchInviteMode,
  BatchInviteStep,
  BatchUserEntry,
  InvitePrefillState,
  RoleId,
  ServiceAccess,
} from '../../rbac/types';
import styles from './InviteUserWizard.module.scss';
import { BatchWizardStepActions } from './BatchWizardStepActions';
import { BatchReviewStep } from './steps/BatchReviewStep';
import { MultiEmailStep } from './steps/MultiEmailStep';
import { PerUserAccessStep } from './steps/PerUserAccessStep';
import { RoleStep } from './steps/RoleStep';
import { ServiceAccessStep } from './steps/ServiceAccessStep';
import { BatchWizardProgressTracker } from './BatchWizardProgressTracker';

type InviteBatchWizardProps = {
  mode: BatchInviteMode;
  prefill?: InvitePrefillState;
};

function createEntriesFromEmails(emails: string[], prefill?: InvitePrefillState): BatchUserEntry[] {
  const roleId = prefill?.roleId ?? 'delegate';
  const serviceAccess = structuredClone(prefill?.serviceAccess ?? DEFAULT_SERVICE_ACCESS);

  return emails.map((email) => ({
    email,
    roleId,
    serviceAccess: structuredClone(serviceAccess),
  }));
}

export function InviteBatchWizard({ mode, prefill }: InviteBatchWizardProps) {
  const navigate = useNavigate();
  const { users, inviteBusinessUsers, isLoading, pageAlert } = useRbac();

  const totalSteps = mode === 'same' ? 4 : 3;
  const [currentStep, setCurrentStep] = useState<BatchInviteStep | BatchCustomInviteStep>(1);
  const [emails, setEmails] = useState<string[]>([]);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [roleId, setRoleId] = useState<RoleId | ''>(prefill?.roleId ?? '');
  const [serviceAccess, setServiceAccess] = useState<ServiceAccess>(
    structuredClone(prefill?.serviceAccess ?? DEFAULT_SERVICE_ACCESS),
  );
  const [serviceAccessError, setServiceAccessError] = useState<string | undefined>();
  const [customEntries, setCustomEntries] = useState<BatchUserEntry[]>([]);

  const existingEmails = useMemo(() => users.map((user) => user.email), [users]);

  const reviewEntries = useMemo<BatchUserEntry[]>(() => {
    if (mode === 'custom') {
      return customEntries;
    }

    if (!roleId) {
      return [];
    }

    return emails.map((email) => ({
      email,
      roleId,
      serviceAccess: structuredClone(serviceAccess),
    }));
  }, [customEntries, emails, mode, roleId, serviceAccess]);

  function cancelFlow() {
    navigate('/user-management');
  }

  function goToStep(step: BatchInviteStep | BatchCustomInviteStep) {
    if (mode === 'same' && currentStep === 3 && step !== 3) {
      setServiceAccessError(undefined);
    }
    setCurrentStep(step);
  }

  function validateEmailsStep() {
    if (emails.length === 0) {
      setEmailError('Add at least one email address.');
      return false;
    }

    setEmailError(undefined);

    if (mode === 'custom' && customEntries.length !== emails.length) {
      setCustomEntries(createEntriesFromEmails(emails, prefill));
    }

    return true;
  }

  function handleNext() {
    if (currentStep === 1) {
      if (!validateEmailsStep()) {
        return;
      }
      if (mode === 'custom') {
        setCustomEntries(createEntriesFromEmails(emails, prefill));
      }
      goToStep(2);
      return;
    }

    if (mode === 'same') {
      if (currentStep === 2) {
        if (!roleId) {
          return;
        }
        if (roleSkipsServiceAccess(roleId)) {
          goToStep(4);
          return;
        }
        goToStep(3);
        return;
      }

      if (currentStep === 3) {
        if (!hasServiceAccessSelection(serviceAccess)) {
          setServiceAccessError('Enable at least one service before you continue.');
          return;
        }
        goToStep(4);
      }
      return;
    }

    if (mode === 'custom' && currentStep === 2) {
      goToStep(3);
    }
  }

  function handleBack() {
    if (currentStep === 1) {
      return;
    }

    if (mode === 'same') {
      if (currentStep === 4 && roleId && roleSkipsServiceAccess(roleId)) {
        goToStep(2);
        return;
      }
      goToStep((currentStep - 1) as BatchInviteStep);
      return;
    }

    goToStep((currentStep - 1) as BatchCustomInviteStep);
  }

  async function handleSubmit() {
    if (reviewEntries.length === 0) {
      return;
    }

    if (mode === 'same' && roleId && !roleSkipsServiceAccess(roleId) && !hasServiceAccessSelection(serviceAccess)) {
      setServiceAccessError('Enable at least one service before you continue.');
      goToStep(3);
      return;
    }

    try {
      const result = await inviteBusinessUsers({
        users: reviewEntries.map((entry) => ({
          email: entry.email,
          roleId: entry.roleId,
          serviceAccess: entry.serviceAccess,
        })),
      });

      navigate('/user-management', {
        replace: true,
        state: {
          inviteBatchSuccess: {
            invitedCount: result.invited.length,
            skipped: result.skipped,
          },
          inviteAnotherSameAccess:
            mode === 'same' && roleId
              ? { roleId, serviceAccess: structuredClone(serviceAccess) }
              : undefined,
        },
      });
    } catch {
      // Error alert shown via context.
    }
  }

  return (
    <div className={styles.wizard}>
      <OntarioLoadingIndicator
        isLoading={isLoading}
        type="large"
        fullScreenOverlay
        message="Sending invitations"
      />

      <div className={styles.wizardPageHeading}>
        <h1 className={`ontario-h3 ${styles.wizardPageTitle}`}>Invite users</h1>
        <p className={styles.wizardPageDescription}>
          {mode === 'same'
            ? 'Add multiple users who will share the same role and service access.'
            : 'Add multiple users and assign access individually.'}
        </p>
      </div>

      <div className={styles.wizardMain}>
        <BatchWizardProgressTracker
          mode={mode}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />

        {pageAlert && (
          <div className={styles.wizardStepError}>
            <OntarioPageAlert
              type={pageAlert.type}
              heading={pageAlert.heading}
              content={pageAlert.content}
            />
          </div>
        )}

        {mode === 'same' && currentStep === 3 && serviceAccessError && (
          <div className={styles.wizardStepError}>
            <OntarioPageAlert
              type="error"
              heading="Service access required"
              content={serviceAccessError}
            />
          </div>
        )}

        <div className={styles.stepContent}>
          {currentStep === 1 && (
            <MultiEmailStep
              emails={emails}
              existingEmails={existingEmails}
              errorMessage={emailError}
              onChange={setEmails}
            />
          )}

          {mode === 'same' && currentStep === 2 && (
            <RoleStep selectedRoleId={roleId} onSelectRole={setRoleId} />
          )}

          {mode === 'same' && currentStep === 3 && roleId && (
            <ServiceAccessStep
              serviceAccess={serviceAccess}
              onChange={(access) => {
                setServiceAccess(access);
                setServiceAccessError(undefined);
              }}
            />
          )}

          {mode === 'custom' && currentStep === 2 && (
            <PerUserAccessStep
              entries={customEntries}
              users={users}
              onChange={setCustomEntries}
            />
          )}

          {currentStep === totalSteps && reviewEntries.length > 0 && (
            <BatchReviewStep
              entries={reviewEntries}
              sharedRoleId={mode === 'same' && roleId ? roleId : undefined}
              sharedServiceAccess={mode === 'same' ? serviceAccess : undefined}
            />
          )}
        </div>

        <BatchWizardStepActions
          mode={mode}
          currentStep={currentStep}
          totalSteps={totalSteps}
          roleId={roleId}
          inviteCount={reviewEntries.length || emails.length}
          onNext={handleNext}
          onBack={handleBack}
          onSubmit={handleSubmit}
          onCancel={cancelFlow}
        />
      </div>
    </div>
  );
}
