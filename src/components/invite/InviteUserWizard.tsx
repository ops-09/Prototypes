import { OntarioLoadingIndicator, OntarioPageAlert } from '@ongov/ontario-design-system-component-library-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roleSkipsServiceAccess } from '../../rbac/roles';
import { useRbac } from '../../rbac/RbacContext';
import type { InvitePrefillState, InviteStep, InviteUserInput, RoleId, ServiceAccess } from '../../rbac/types';
import { DEFAULT_SERVICE_ACCESS, hasServiceAccessSelection } from '../../rbac/services';
import styles from './InviteUserWizard.module.scss';
import { getInviteReviewStep, getInviteStepCount, getInviteDisplayStep } from './inviteWizardContent';
import { useInviteWizardVersionContext } from './InviteWizardVersionContext';
import { ProvisionServicesStep } from './steps/ProvisionServicesStep';
import { RoleStep } from './steps/RoleStep';
import { ReviewStep, buildInvitePayload } from './steps/ReviewStep';
import { ServiceAccessStep } from './steps/ServiceAccessStep';
import { ServicePermissionsStep } from './steps/ServicePermissionsStep';
import { UserDetailsStep } from './steps/UserDetailsStep';
import { WizardProgressTracker } from './WizardProgressTracker';
import { WizardStepActions } from './WizardStepActions';

type InviteUserWizardProps = {
  prefill?: InvitePrefillState;
};

export function InviteUserWizard({ prefill }: InviteUserWizardProps) {
  const navigate = useNavigate();
  const { inviteBusinessUser, isLoading, pageAlert } = useRbac();
  const { version, setToggleVisible, registerVersionSwitchHandler } = useInviteWizardVersionContext();
  const reviewStep = getInviteReviewStep(version);

  const [currentStep, setCurrentStep] = useState<InviteStep>(1);
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [roleId, setRoleId] = useState<RoleId | ''>(prefill?.roleId ?? '');
  const [serviceAccess, setServiceAccess] = useState<ServiceAccess>(
    structuredClone(prefill?.serviceAccess ?? DEFAULT_SERVICE_ACCESS),
  );
  const [emailError, setEmailError] = useState<string | undefined>();
  const [confirmEmailError, setConfirmEmailError] = useState<string | undefined>();
  const [serviceAccessError, setServiceAccessError] = useState<string | undefined>();

  const stepCount = getInviteStepCount(version, roleId);
  const displayStep = getInviteDisplayStep(currentStep, version, roleId);

  useEffect(() => {
    setToggleVisible(true);
    return () => {
      setToggleVisible(false);
    };
  }, [setToggleVisible]);

  useEffect(() => {
    return registerVersionSwitchHandler(() => {
      setCurrentStep(1);
      setServiceAccessError(undefined);
    });
  }, [registerVersionSwitchHandler]);

  const draft = useMemo<InviteUserInput | null>(() => {
    if (!roleId) {
      return null;
    }

    return buildInvitePayload(email, roleId, serviceAccess);
  }, [email, roleId, serviceAccess]);

  function cancelFlow() {
    navigate('/user-management');
  }

  function validateEmailStep() {
    const trimmedEmail = email.trim();
    const trimmedConfirm = confirmEmail.trim();
    let valid = true;

    if (!trimmedEmail) {
      setEmailError('Enter an email address.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Enter a valid email address.');
      valid = false;
    } else {
      setEmailError(undefined);
    }

    if (!trimmedConfirm) {
      setConfirmEmailError('Confirm the email address.');
      valid = false;
    } else if (trimmedEmail.toLowerCase() !== trimmedConfirm.toLowerCase()) {
      setConfirmEmailError('Email addresses must match.');
      valid = false;
    } else {
      setConfirmEmailError(undefined);
    }

    return valid;
  }

  function goToStep(step: InviteStep) {
    const leavesServiceStep =
      version === 'v2'
        ? (currentStep === 3 || currentStep === 4) && step !== currentStep
        : currentStep === 3 && step !== currentStep;

    if (leavesServiceStep) {
      setServiceAccessError(undefined);
    }

    setCurrentStep(step);
  }

  function handleServiceAccessChange(access: ServiceAccess) {
    setServiceAccess(access);
    setServiceAccessError(undefined);
  }

  function handleNextFromProvision() {
    if (!hasServiceAccessSelection(serviceAccess)) {
      setServiceAccessError('Enable at least one service before you continue.');
      return;
    }

    goToStep(4);
  }

  function handleNextFromServiceAccess() {
    if (!hasServiceAccessSelection(serviceAccess)) {
      setServiceAccessError('Enable at least one service before you continue.');
      return;
    }

    goToStep(4);
  }

  function handleNextFromPermissions() {
    goToStep(5);
  }

  function handleNextFromEmail() {
    if (!validateEmailStep()) {
      return;
    }
    goToStep(2);
  }

  function handleNextFromRole() {
    if (!roleId) {
      return;
    }

    if (roleSkipsServiceAccess(roleId)) {
      goToStep(reviewStep);
      return;
    }

    goToStep(3);
  }

  function handleBackFromRole() {
    goToStep(1);
  }

  function handleBackFromProvision() {
    goToStep(2);
  }

  function handleBackFromServiceAccess() {
    goToStep(2);
  }

  function handleBackFromPermissions() {
    goToStep(3);
  }

  function handleBackFromReview() {
    if (roleId && roleSkipsServiceAccess(roleId)) {
      goToStep(2);
      return;
    }

    goToStep(version === 'v2' ? 4 : 3);
  }

  async function handleSubmit() {
    if (!draft || !validateEmailStep()) {
      return;
    }

    if (roleId && !roleSkipsServiceAccess(roleId) && !hasServiceAccessSelection(serviceAccess)) {
      setServiceAccessError('Enable at least one service before you continue.');
      goToStep(3);
      return;
    }

    try {
      await inviteBusinessUser(draft);
      navigate('/user-management', {
        replace: true,
        state: { inviteSuccessEmail: draft.email },
      });
    } catch {
      // Error alert is shown via RBAC context on this page.
    }
  }

  return (
    <div className={styles.wizard}>
      <OntarioLoadingIndicator
        isLoading={isLoading}
        type="large"
        fullScreenOverlay
        message="Sending invitation"
      />

      <div className={styles.wizardPageHeading}>
        <h1 className={`ontario-h3 ${styles.wizardPageTitle}`}>Invite user</h1>
        <p className={styles.wizardPageDescription}>
          Complete each step to configure access for the new user.
        </p>
      </div>

      <div className={styles.wizardMain}>
        <WizardProgressTracker currentStep={displayStep} numberOfSteps={stepCount} />

        {pageAlert && (
          <div className={styles.wizardStepError}>
            <OntarioPageAlert
              type={pageAlert.type}
              heading={pageAlert.heading}
              content={pageAlert.content}
            />
          </div>
        )}

        {currentStep === 3 && serviceAccessError && (
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
            <UserDetailsStep
              email={email}
              confirmEmail={confirmEmail}
              emailError={emailError}
              confirmEmailError={confirmEmailError}
              onEmailChange={setEmail}
              onConfirmEmailChange={setConfirmEmail}
            />
          )}

          {currentStep === 2 && (
            <RoleStep selectedRoleId={roleId} onSelectRole={setRoleId} />
          )}

          {version === 'v2' && currentStep === 3 && roleId && (
            <ProvisionServicesStep
              serviceAccess={serviceAccess}
              onChange={handleServiceAccessChange}
            />
          )}

          {version === 'v2' && currentStep === 4 && roleId && (
            <ServicePermissionsStep
              serviceAccess={serviceAccess}
              onChange={handleServiceAccessChange}
            />
          )}

          {version === 'v1' && currentStep === 3 && roleId && (
            <ServiceAccessStep
              serviceAccess={serviceAccess}
              onChange={handleServiceAccessChange}
            />
          )}

          {currentStep === reviewStep && draft && (
            <ReviewStep draft={draft} onEditStep={goToStep} />
          )}
        </div>

        <WizardStepActions
          wizardVersion={version}
          currentStep={currentStep}
          reviewStep={reviewStep}
          roleId={roleId}
          onNextFromEmail={handleNextFromEmail}
          onNextFromRole={handleNextFromRole}
          onNextFromProvision={handleNextFromProvision}
          onNextFromServiceAccess={handleNextFromServiceAccess}
          onNextFromPermissions={handleNextFromPermissions}
          onSubmit={handleSubmit}
          onBackFromRole={handleBackFromRole}
          onBackFromProvision={handleBackFromProvision}
          onBackFromServiceAccess={handleBackFromServiceAccess}
          onBackFromPermissions={handleBackFromPermissions}
          onBackFromReview={handleBackFromReview}
          onCancel={cancelFlow}
        />
      </div>
    </div>
  );
}
