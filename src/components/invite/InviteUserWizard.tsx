import {
  OntarioLoadingIndicator,
  OntarioPageAlert,
} from '@ongov/ontario-design-system-component-library-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  usesDynamicDomainInviteSteps,
  usesV2InviteSteps,
  usesV3InviteSteps,
  usesV5InviteSteps,
  usesCombinedPermissionsSteps,
  usesV6InviteSteps,
  usesV8InviteSteps,
  usesV9InviteSteps,
  usesV10InviteSteps,
  usesV11InviteSteps,
  usesV12InviteSteps,
  usesV13InviteSteps,
  usesV14InviteSteps,
  usesV15InviteSteps,
  usesAccessNeedsInviteStep,
} from '../../config/inviteWizardVersion';
import { roleSkipsServiceAccess } from '../../rbac/roles';
import { useRbac } from '../../rbac/RbacContext';
import type {
  InvitePrefillState,
  InviteStep,
  InviteUserInput,
  PermitApplicationAccess,
  RoleId,
  ServiceAccess,
} from '../../rbac/types';
import { createDefaultPermitApplicationAccess } from '../../rbac/permitApplicationAccess';
import { DEFAULT_SERVICE_ACCESS } from '../../rbac/services';
import { InviteErrorSummary } from './InviteErrorSummary';
import { InviteeCallout } from './InviteeCallout';
import styles from './InviteUserWizard.module.scss';
import {
  getInviteReviewStep,
  getInviteStepCount,
  getInviteDisplayStep,
} from './inviteWizardContent';
import {
  getInviteV4DisplayStep,
  getInviteV4Path,
  isMiningDomainOn,
  isPermitsDomainOn,
} from './inviteV4Path';
import { getInviteV7DisplayStep } from './inviteV7Path';
import {
  clearInviteWizardDraft,
  getInviteStepPath,
  readInviteWizardDraft,
  resolveInviteStepFromUrl,
  writeInviteWizardDraft,
  type InviteDynamicLogicalStep,
} from './inviteWizardPaths';
import {
  buildInviteErrorSummaryItems,
  type InviteFieldErrors,
  type InviteFieldKey,
  validateInviteDomainAccessStep,
  validateInviteEmailStep,
  validateInviteMiningStep,
  validateInvitePermitApplicationsStep,
  validateInviteAccessNeedsStep,
  validateInviteRoleStep,
  validateInviteServiceAccessStep,
  validateInviteV7PermissionsStep,
} from './inviteValidation';
import { useInviteWizardVersionContext } from './InviteWizardVersionContext';
import { AccessNeedsStep } from './steps/AccessNeedsStep';
import { DomainAccessStep } from './steps/DomainAccessStep';
import { DomainGatesStep } from './steps/DomainGatesStep';
import { MiningAccessStep } from './steps/MiningAccessStep';
import { PermitApplicationsStep } from './steps/PermitApplicationsStep';
import { PermissionsStep } from './steps/PermissionsStep';
import { ProvisionServicesStep } from './steps/ProvisionServicesStep';
import { RoleStep } from './steps/RoleStep';
import { ReviewStep, buildInvitePayload, type ReviewEditTargets } from './steps/ReviewStep';
import { ServiceAccessStep } from './steps/ServiceAccessStep';
import { ServicePermissionsStep } from './steps/ServicePermissionsStep';
import { UserDetailsStep } from './steps/UserDetailsStep';
import { WizardProgressTracker } from './WizardProgressTracker';
import { WizardStepActions } from './WizardStepActions';

type InviteUserWizardProps = {
  prefill?: InvitePrefillState;
};

function getInitialDraft(prefill?: InvitePrefillState) {
  const stored = readInviteWizardDraft();
  return {
    email: stored?.email ?? '',
    confirmEmail: stored?.confirmEmail ?? '',
    roleId: (prefill?.roleId ?? stored?.roleId ?? '') as RoleId | '',
    accessNeedIds: stored?.accessNeedIds ?? [],
    serviceAccess: structuredClone(
      prefill?.serviceAccess ?? stored?.serviceAccess ?? DEFAULT_SERVICE_ACCESS,
    ),
    permitApplicationAccess: structuredClone(
      prefill?.permitApplicationAccess ??
        stored?.permitApplicationAccess ??
        createDefaultPermitApplicationAccess(),
    ),
  };
}

export function InviteUserWizard({ prefill }: InviteUserWizardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ step?: string }>();
  // Params.step is the full segment ("step-1"); path fallback is the number only.
  const stepFromPath = location.pathname.match(/\/invite\/(step-\d+)\/?$/i)?.[1];
  const stepParam = params.step ?? stepFromPath;
  const { inviteBusinessUser, isLoading, pageAlert } = useRbac();
  const { version, setToggleVisible, registerVersionSwitchHandler } =
    useInviteWizardVersionContext();

  const [email, setEmail] = useState(() => getInitialDraft(prefill).email);
  const [confirmEmail, setConfirmEmail] = useState(() => getInitialDraft(prefill).confirmEmail);
  const [roleId, setRoleId] = useState<RoleId | ''>(() => getInitialDraft(prefill).roleId);
  const [accessNeedIds, setAccessNeedIds] = useState<string[]>(
    () => getInitialDraft(prefill).accessNeedIds,
  );
  const [serviceAccess, setServiceAccess] = useState<ServiceAccess>(
    () => getInitialDraft(prefill).serviceAccess,
  );
  const [permitApplicationAccess, setPermitApplicationAccess] = useState<PermitApplicationAccess>(
    () => getInitialDraft(prefill).permitApplicationAccess,
  );
  const [fieldErrors, setFieldErrors] = useState<InviteFieldErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const pageTitleRef = useRef<HTMLHeadingElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const hasMountedStepRef = useRef(false);
  const lastFocusedStepRef = useRef<InviteStep | null>(null);

  const miningOn = isMiningDomainOn(serviceAccess);
  const permitsOn = isPermitsDomainOn(permitApplicationAccess);
  const pathOptions = useMemo(
    () => ({
      roleId,
      miningOn,
      permitsOn,
      includeAccessNeeds: usesAccessNeedsInviteStep(version),
    }),
    [miningOn, permitsOn, roleId, version],
  );

  const reviewStep = getInviteReviewStep(version, pathOptions);
  const resolved = resolveInviteStepFromUrl(stepParam, version, roleId, pathOptions);
  const currentStep = resolved.internalStep;
  const displayStep = resolved.displayStep;
  const stepCount = getInviteStepCount(version, roleId, pathOptions);
  const logicalStep: InviteDynamicLogicalStep | null = resolved.logicalStep;

  const reviewEditTargets = useMemo<ReviewEditTargets>(() => {
    if (!usesDynamicDomainInviteSteps(version)) {
      return { email: 1, role: 2, mining: 3, permits: 3, domains: 3 };
    }

    if (usesCombinedPermissionsSteps(version)) {
      const permissionsStep = getInviteV7DisplayStep('permissions', pathOptions) as InviteStep;
      return {
        email: getInviteV7DisplayStep('email', pathOptions) as InviteStep,
        role: getInviteV7DisplayStep('role', pathOptions) as InviteStep,
        domains: permissionsStep,
        mining: permissionsStep,
        permits: permissionsStep,
        accessNeeds: usesAccessNeedsInviteStep(version)
          ? (getInviteV7DisplayStep('accessNeeds', pathOptions) as InviteStep)
          : undefined,
      };
    }

    return {
      email: getInviteV4DisplayStep('email', pathOptions) as InviteStep,
      role: getInviteV4DisplayStep('role', pathOptions) as InviteStep,
      domains: getInviteV4DisplayStep('domains', pathOptions) as InviteStep,
      mining: getInviteV4DisplayStep('mining', pathOptions) as InviteStep,
      permits: getInviteV4DisplayStep('permits', pathOptions) as InviteStep,
    };
  }, [pathOptions, version]);

  useEffect(() => {
    setToggleVisible(true);
    return () => {
      setToggleVisible(false);
    };
  }, [setToggleVisible]);

  useEffect(() => {
    return registerVersionSwitchHandler(() => {
      clearStepErrors();
      navigate(getInviteStepPath(1), { replace: true });
    });
  }, [navigate, registerVersionSwitchHandler]);

  useEffect(() => {
    clearStepErrors();
  }, [currentStep]);

  // Persist draft so refresh / deep links keep entered values (forms-style).
  useEffect(() => {
    writeInviteWizardDraft({
      email,
      confirmEmail,
      roleId,
      accessNeedIds,
      serviceAccess,
      permitApplicationAccess,
    });
  }, [accessNeedIds, confirmEmail, email, permitApplicationAccess, roleId, serviceAccess]);

  // Keep URL in the valid 1..N range for the current version/role/path. Do not block jumps.
  useEffect(() => {
    if (!resolved.needsUrlSync) {
      return;
    }

    navigate(getInviteStepPath(resolved.displayStep), { replace: true });
  }, [navigate, resolved.displayStep, resolved.needsUrlSync]);

  useEffect(() => {
    if (!hasMountedStepRef.current) {
      hasMountedStepRef.current = true;
      lastFocusedStepRef.current = currentStep;
      return;
    }

    if (lastFocusedStepRef.current === currentStep) {
      return;
    }

    lastFocusedStepRef.current = currentStep;
    window.scrollTo(0, 0);
    pageTitleRef.current?.focus();
  }, [currentStep]);

  const draft = useMemo<InviteUserInput | null>(() => {
    if (!roleId) {
      return null;
    }

    return buildInvitePayload(email, roleId, serviceAccess, permitApplicationAccess);
  }, [email, permitApplicationAccess, roleId, serviceAccess]);

  function clearStepErrors() {
    setFieldErrors({});
    setShowErrorSummary(false);
  }

  function clearFieldError(key: InviteFieldKey) {
    setFieldErrors((current) => {
      if (!current[key]) {
        return current;
      }
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function showStepErrors(errors: InviteFieldErrors) {
    setFieldErrors(errors);
    setShowErrorSummary(true);
    window.requestAnimationFrame(() => {
      errorSummaryRef.current?.focus();
      errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function cancelFlow() {
    clearInviteWizardDraft();
    navigate('/user-management');
  }

  function goToStep(step: InviteStep) {
    clearStepErrors();
    const nextDisplayStep = getInviteDisplayStep(step, version, roleId, pathOptions);
    navigate(getInviteStepPath(nextDisplayStep));
  }

  function goToDisplayStep(nextDisplay: number) {
    clearStepErrors();
    navigate(getInviteStepPath(nextDisplay));
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    clearFieldError('email');
  }

  function handleConfirmEmailChange(value: string) {
    setConfirmEmail(value);
    clearFieldError('confirmEmail');
  }

  function handleRoleChange(nextRoleId: RoleId) {
    setRoleId(nextRoleId);
    clearFieldError('role');
  }

  function handleServiceAccessChange(access: ServiceAccess) {
    setServiceAccess(access);
    clearFieldError('serviceAccess');
  }

  function handlePermitApplicationAccessChange(access: PermitApplicationAccess) {
    setPermitApplicationAccess(access);
    clearFieldError('permitAccess');
  }

  function handleNextFromProvision() {
    if (usesV3InviteSteps(version)) {
      handleNextFromMiningAccess();
      return;
    }

    const errors = validateInviteServiceAccessStep(serviceAccess, 'service');
    if (Object.keys(errors).length > 0) {
      showStepErrors(errors);
      return;
    }

    if (usesV2InviteSteps(version)) {
      goToStep(4);
      return;
    }

    goToStep(reviewStep);
  }

  function handleNextFromServiceAccess() {
    const errors = validateInviteServiceAccessStep(serviceAccess, 'service');
    if (Object.keys(errors).length > 0) {
      showStepErrors(errors);
      return;
    }

    goToStep(4);
  }

  function handleNextFromPermissions() {
    const errors = validateInviteServiceAccessStep(serviceAccess, 'permissions');
    if (Object.keys(errors).length > 0) {
      showStepErrors(errors);
      return;
    }

    goToStep(5);
  }

  function handleNextFromEmail() {
    const errors = validateInviteEmailStep(email, confirmEmail);
    if (Object.keys(errors).length > 0) {
      showStepErrors(errors);
      return;
    }

    goToStep(2);
  }

  function handleNextFromRole() {
    const errors = validateInviteRoleStep(roleId);
    if (Object.keys(errors).length > 0) {
      showStepErrors(errors);
      return;
    }

    if (roleId && roleSkipsServiceAccess(roleId)) {
      goToStep(reviewStep);
      return;
    }

    goToStep(3);
  }

  function handleNextFromMiningAccess() {
    const errors = validateInviteDomainAccessStep(serviceAccess, permitApplicationAccess);
    if (Object.keys(errors).length > 0) {
      showStepErrors(errors);
      return;
    }

    goToStep(reviewStep);
  }

  function handleV4Next() {
    const currentLogical =
      logicalStep ??
      (usesCombinedPermissionsSteps(version)
        ? null
        : getInviteV4Path(pathOptions)[displayStep - 1]);

    if (currentLogical === 'email') {
      handleNextFromEmail();
      return;
    }

    if (currentLogical === 'role') {
      handleNextFromRole();
      return;
    }

    if (currentLogical === 'accessNeeds') {
      const errors = validateInviteAccessNeedsStep(accessNeedIds);
      if (Object.keys(errors).length > 0) {
        showStepErrors(errors);
        return;
      }
      goToDisplayStep(displayStep + 1);
      return;
    }

    if (currentLogical === 'domains') {
      // Neither / mining / permits / both — advance along resolved path.
      goToDisplayStep(displayStep + 1);
      return;
    }

    if (currentLogical === 'permissions') {
      const errors = validateInviteV7PermissionsStep(
        serviceAccess,
        permitApplicationAccess,
      );
      if (Object.keys(errors).length > 0) {
        showStepErrors(errors);
        return;
      }
      goToDisplayStep(displayStep + 1);
      return;
    }

    if (currentLogical === 'mining') {
      const errors = validateInviteMiningStep(serviceAccess);
      if (Object.keys(errors).length > 0) {
        showStepErrors(errors);
        return;
      }
      goToDisplayStep(displayStep + 1);
      return;
    }

    if (currentLogical === 'permits') {
      const errors = validateInvitePermitApplicationsStep(permitApplicationAccess);
      if (Object.keys(errors).length > 0) {
        showStepErrors(errors);
        return;
      }
      goToDisplayStep(displayStep + 1);
      return;
    }
  }

  function handleV4Back() {
    if (displayStep <= 1) {
      cancelFlow();
      return;
    }
    goToDisplayStep(displayStep - 1);
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

    if (usesDynamicDomainInviteSteps(version)) {
      goToDisplayStep(Math.max(displayStep - 1, 1));
      return;
    }

    goToStep(usesV2InviteSteps(version) ? 4 : 3);
  }

  function handleStepIndicatorBack() {
    if (currentStep === 1) {
      cancelFlow();
      return;
    }

    if (usesDynamicDomainInviteSteps(version)) {
      handleV4Back();
      return;
    }

    if (currentStep === 2) {
      handleBackFromRole();
      return;
    }

    if (currentStep === 3) {
      if (usesV2InviteSteps(version) || usesV3InviteSteps(version)) {
        handleBackFromProvision();
      } else {
        handleBackFromServiceAccess();
      }
      return;
    }

    if (currentStep === 4 && usesV2InviteSteps(version)) {
      handleBackFromPermissions();
      return;
    }

    if (currentStep === reviewStep) {
      handleBackFromReview();
    }
  }

  async function handleSubmit() {
    const emailErrors = validateInviteEmailStep(email, confirmEmail);
    if (Object.keys(emailErrors).length > 0) {
      goToStep(1);
      return;
    }

    const roleErrors = validateInviteRoleStep(roleId);
    if (Object.keys(roleErrors).length > 0) {
      goToStep(2);
      return;
    }

    if (roleId && !roleSkipsServiceAccess(roleId)) {
      if (usesDynamicDomainInviteSteps(version)) {
        if (usesCombinedPermissionsSteps(version)) {
          if (usesAccessNeedsInviteStep(version)) {
            const accessNeedsErrors = validateInviteAccessNeedsStep(accessNeedIds);
            if (Object.keys(accessNeedsErrors).length > 0) {
              goToDisplayStep(getInviteV7DisplayStep('accessNeeds', pathOptions));
              return;
            }
          }
          const errors = validateInviteV7PermissionsStep(
            serviceAccess,
            permitApplicationAccess,
          );
          if (Object.keys(errors).length > 0) {
            goToDisplayStep(getInviteV7DisplayStep('permissions', pathOptions));
            return;
          }
        } else {
          if (miningOn) {
            const miningErrors = validateInviteMiningStep(serviceAccess);
            if (Object.keys(miningErrors).length > 0) {
              goToDisplayStep(getInviteV4DisplayStep('mining', pathOptions));
              return;
            }
          }

          if (permitsOn) {
            const permitErrors = validateInvitePermitApplicationsStep(permitApplicationAccess);
            if (Object.keys(permitErrors).length > 0) {
              goToDisplayStep(getInviteV4DisplayStep('permits', pathOptions));
              return;
            }
          }
        }
      } else if (usesV3InviteSteps(version)) {
        const domainErrors = validateInviteDomainAccessStep(
          serviceAccess,
          permitApplicationAccess,
        );
        if (Object.keys(domainErrors).length > 0) {
          goToStep(3);
          return;
        }
      } else {
        const accessMode = usesV2InviteSteps(version) ? 'service' : 'permissions';
        const accessErrors = validateInviteServiceAccessStep(serviceAccess, accessMode);
        if (Object.keys(accessErrors).length > 0) {
          goToStep(3);
          return;
        }

        if (usesV2InviteSteps(version)) {
          const permissionErrors = validateInviteServiceAccessStep(serviceAccess, 'permissions');
          if (Object.keys(permissionErrors).length > 0) {
            goToStep(4);
            return;
          }
        }
      }
    }

    if (!draft) {
      return;
    }

    try {
      await inviteBusinessUser(draft);
      clearInviteWizardDraft();
      navigate('/user-management', {
        replace: true,
        state: { inviteSuccessEmail: draft.email },
      });
    } catch {
      // Error alert is shown via RBAC context on this page.
    }
  }

  const errorSummaryItems = buildInviteErrorSummaryItems(fieldErrors);
  const useWideColumn =
    currentStep === reviewStep ||
    (usesV3InviteSteps(version) && currentStep === 3) ||
    (usesDynamicDomainInviteSteps(version) &&
      (logicalStep === 'mining' ||
        logicalStep === 'permits' ||
        logicalStep === 'permissions' ||
        logicalStep === 'domains'));

  return (
    <div className={styles.wizard}>
      <OntarioLoadingIndicator
        isLoading={isLoading}
        type="large"
        fullScreenOverlay
        message="Sending invitation"
      />

      <WizardProgressTracker
        currentStep={displayStep}
        numberOfSteps={stepCount}
        onBack={handleStepIndicatorBack}
      />

      <div className="ontario-row">
        <div
          className={
            useWideColumn
              ? 'ontario-columns ontario-small-12'
              : 'ontario-columns ontario-small-12 ontario-medium-8'
          }
        >
          {showErrorSummary && errorSummaryItems.length > 0 ? (
            <InviteErrorSummary items={errorSummaryItems} summaryRef={errorSummaryRef} />
          ) : null}

          <h1
            ref={pageTitleRef}
            tabIndex={-1}
            className={`ontario-h1 ${styles.pageTitle}`}
          >
            Invite users
          </h1>
          <p className={styles.lead}>
            Complete each step to configure access for the new user.
          </p>

          {(usesV13InviteSteps(version) ||
            usesV14InviteSteps(version) ||
            usesV15InviteSteps(version)) &&
          (logicalStep === 'role' ||
            logicalStep === 'accessNeeds' ||
            logicalStep === 'permissions') ? (
            <InviteeCallout
              email={email}
              roleId={roleId}
              accessNeedIds={accessNeedIds}
              logicalStep={logicalStep}
            />
          ) : null}

          <div className={styles.wizardMain}>
            {pageAlert && (
              <div className={styles.wizardStepError}>
                <OntarioPageAlert
                  type={pageAlert.type}
                  heading={pageAlert.heading}
                  content={pageAlert.content}
                />
              </div>
            )}

            <div className={styles.stepContent}>
              {currentStep === 1 && (
                <UserDetailsStep
                  email={email}
                  confirmEmail={confirmEmail}
                  emailError={fieldErrors.email}
                  confirmEmailError={fieldErrors.confirmEmail}
                  onEmailChange={handleEmailChange}
                  onConfirmEmailChange={handleConfirmEmailChange}
                />
              )}

              {currentStep === 2 && (
                <RoleStep
                  selectedRoleId={roleId}
                  roleError={fieldErrors.role}
                  onSelectRole={handleRoleChange}
                />
              )}

              {usesCombinedPermissionsSteps(version) && logicalStep === 'accessNeeds' && (
                <AccessNeedsStep
                  selectedIds={accessNeedIds}
                  errorMessage={fieldErrors.accessNeeds}
                  onChange={(nextIds) => {
                    setAccessNeedIds(nextIds);
                    clearFieldError('accessNeeds');
                  }}
                />
              )}

              {usesDynamicDomainInviteSteps(version) && logicalStep === 'domains' && (
                <DomainGatesStep
                  serviceAccess={serviceAccess}
                  permitApplicationAccess={permitApplicationAccess}
                  onServiceAccessChange={handleServiceAccessChange}
                  onPermitApplicationAccessChange={handlePermitApplicationAccessChange}
                />
              )}

              {usesCombinedPermissionsSteps(version) && logicalStep === 'permissions' && (
                <PermissionsStep
                  serviceAccess={serviceAccess}
                  permitApplicationAccess={permitApplicationAccess}
                  accessNeedIds={accessNeedIds}
                  serviceAccessError={fieldErrors.serviceAccess}
                  permitAccessError={fieldErrors.permitAccess}
                  onServiceAccessChange={handleServiceAccessChange}
                  onPermitApplicationAccessChange={handlePermitApplicationAccessChange}
                  onAccessNeedIdsChange={(nextIds) => {
                    setAccessNeedIds(nextIds);
                    clearFieldError('accessNeeds');
                  }}
                  createVariant={
                    usesV15InviteSteps(version) ||
                    usesV14InviteSteps(version) ||
                    usesV13InviteSteps(version) ||
                    usesV12InviteSteps(version)
                      ? 'v12'
                      : usesV11InviteSteps(version)
                        ? 'v11'
                        : usesV10InviteSteps(version)
                          ? 'v10'
                          : usesV9InviteSteps(version)
                            ? 'v9'
                            : usesV8InviteSteps(version)
                              ? 'v8'
                              : 'v6'
                  }
                  catalogReturnDisplayStep={displayStep}
                  catalogShowAccessNeedsFilter={usesV14InviteSteps(version)}
                  useAccordionSections={usesV15InviteSteps(version)}
                />
              )}

              {!usesCombinedPermissionsSteps(version) &&
                usesDynamicDomainInviteSteps(version) &&
                logicalStep === 'mining' && (
                  <MiningAccessStep
                    serviceAccess={serviceAccess}
                    serviceAccessError={fieldErrors.serviceAccess}
                    onChange={handleServiceAccessChange}
                  />
                )}

              {!usesCombinedPermissionsSteps(version) &&
                usesDynamicDomainInviteSteps(version) &&
                logicalStep === 'permits' && (
                  <PermitApplicationsStep
                    permitApplicationAccess={permitApplicationAccess}
                    permitAccessError={fieldErrors.permitAccess}
                    onChange={handlePermitApplicationAccessChange}
                    createVariant={
                      usesV6InviteSteps(version)
                        ? 'v6'
                        : usesV5InviteSteps(version)
                          ? 'v5'
                          : 'v4'
                    }
                  />
                )}

              {usesV3InviteSteps(version) && currentStep === 3 && (
                <DomainAccessStep
                  serviceAccess={serviceAccess}
                  permitApplicationAccess={permitApplicationAccess}
                  serviceAccessError={fieldErrors.serviceAccess}
                  permitAccessError={fieldErrors.permitAccess}
                  onServiceAccessChange={handleServiceAccessChange}
                  onPermitApplicationAccessChange={handlePermitApplicationAccessChange}
                />
              )}

              {usesV2InviteSteps(version) && currentStep === 3 && (
                <ProvisionServicesStep
                  serviceAccess={serviceAccess}
                  serviceAccessError={fieldErrors.serviceAccess}
                  onChange={handleServiceAccessChange}
                />
              )}

              {usesV2InviteSteps(version) && currentStep === 4 && (
                <ServicePermissionsStep
                  serviceAccess={serviceAccess}
                  serviceAccessError={fieldErrors.serviceAccess}
                  onChange={handleServiceAccessChange}
                />
              )}

              {version === 'v1' && currentStep === 3 && (
                <ServiceAccessStep
                  serviceAccess={serviceAccess}
                  serviceAccessError={fieldErrors.serviceAccess}
                  onChange={handleServiceAccessChange}
                />
              )}

              {currentStep === reviewStep && draft && (
                <ReviewStep
                  draft={draft}
                  accessNeedIds={accessNeedIds}
                  onEditStep={goToStep}
                  editTargets={reviewEditTargets}
                />
              )}

              {currentStep === reviewStep && !draft && (
                <OntarioPageAlert
                  type="warning"
                  heading="Review unavailable"
                  content="Complete the earlier steps before you can review and send this invite."
                />
              )}
            </div>

            <WizardStepActions
              wizardVersion={version}
              currentStep={currentStep}
              reviewStep={reviewStep}
              roleId={roleId}
              pathOptions={pathOptions}
              onNextFromEmail={handleNextFromEmail}
              onNextFromRole={handleNextFromRole}
              onNextFromProvision={handleNextFromProvision}
              onNextFromServiceAccess={handleNextFromServiceAccess}
              onNextFromPermissions={handleNextFromPermissions}
              onV4Next={handleV4Next}
              onSubmit={handleSubmit}
              onBackFromRole={handleBackFromRole}
              onBackFromProvision={handleBackFromProvision}
              onBackFromServiceAccess={handleBackFromServiceAccess}
              onBackFromPermissions={handleBackFromPermissions}
              onV4Back={handleV4Back}
              onBackFromReview={handleBackFromReview}
              onCancel={cancelFlow}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
