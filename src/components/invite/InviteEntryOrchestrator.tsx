import { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  OntarioButton,
  OntarioIconChevronRight,
  OntarioPageAlert,
} from '@ongov/ontario-design-system-component-library-react';
import { isBatchInviteEnabled } from '../../config/features';
import type { BatchInviteMode, InvitePrefillState } from '../../rbac/types';
import { InviteBatchWizard } from './InviteBatchWizard';
import { InviteModeStep, type InviteAudience } from './InviteModeStep';
import { InviteUserWizard } from './InviteUserWizard';
import { getInviteStepPath } from './inviteWizardPaths';
import styles from './InviteUserWizard.module.scss';

type InviteFlow = 'choose' | 'single' | 'batch';

export function InviteEntryOrchestrator() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ step?: string }>();
  const stepFromPath = location.pathname.match(/\/invite\/(step-\d+)\/?$/i)?.[1];
  const stepParam = params.step ?? stepFromPath;
  const [searchParams] = useSearchParams();
  const batchEnabled = isBatchInviteEnabled();

  const prefill = (location.state as { inviteAnotherSameAccess?: InvitePrefillState } | null)
    ?.inviteAnotherSameAccess;

  const initialFlow = useMemo<InviteFlow>(() => {
    if (!batchEnabled) {
      return 'single';
    }

    if (stepParam) {
      return 'single';
    }

    const mode = searchParams.get('mode');
    if (mode === 'single') {
      return 'single';
    }
    if (mode === 'batch') {
      return 'batch';
    }
    if (prefill) {
      return 'batch';
    }

    return 'choose';
  }, [batchEnabled, prefill, searchParams, stepParam]);

  const [flow, setFlow] = useState<InviteFlow>(initialFlow);
  const [audience, setAudience] = useState<InviteAudience | ''>(
    prefill ? 'multiple' : '',
  );
  const [batchMode, setBatchMode] = useState<BatchInviteMode | ''>(
    prefill ? 'same' : '',
  );
  const [chooseError, setChooseError] = useState('');

  const canContinue =
    audience === 'single' || (audience === 'multiple' && batchMode !== '');
  const isSingleFlow = !batchEnabled || flow === 'single' || Boolean(stepParam);

  // Single-user flow always lives on /invite/step-N (forms-style deep links).
  if (isSingleFlow && !stepParam) {
    return <Navigate to={getInviteStepPath(1)} replace state={location.state} />;
  }

  if (isSingleFlow) {
    return <InviteUserWizard prefill={prefill} />;
  }

  if (flow === 'batch' && batchMode) {
    return <InviteBatchWizard mode={batchMode} prefill={prefill} />;
  }

  function startBatchFlow() {
    if (!canContinue) {
      setChooseError('Select who you are inviting and how access should be assigned.');
      return;
    }

    setChooseError('');

    if (audience === 'single') {
      navigate(getInviteStepPath(1), { state: location.state });
      return;
    }

    if (audience === 'multiple' && batchMode) {
      setFlow('batch');
    }
  }

  return (
    <div className={styles.wizard}>
      <div className={styles.wizardPageHeading}>
        <h1 className={`ontario-h3 ${styles.wizardPageTitle}`}>Invite users</h1>
        <p className={styles.wizardPageDescription}>
          Choose whether you are inviting one user or multiple users.
        </p>
      </div>

      <div className={styles.wizardMain}>
        {chooseError && (
          <OntarioPageAlert type="error" heading="Selection required" content={chooseError} />
        )}

        <InviteModeStep
          audience={audience}
          batchMode={batchMode}
          onAudienceChange={(value) => {
            setChooseError('');
            setAudience(value);
          }}
          onBatchModeChange={(value) => {
            setChooseError('');
            setBatchMode(value);
          }}
        />

        <div className={styles.wizardStickyActions}>
          <OntarioButton
            type="primary"
            htmlType="button"
            onClick={startBatchFlow}
            {...(!canContinue ? { 'aria-disabled': true } : {})}
          >
            Continue
            <OntarioIconChevronRight colour="white" />
          </OntarioButton>
          <OntarioButton
            type="tertiary"
            htmlType="button"
            onClick={() => navigate('/user-management')}
          >
            Cancel
          </OntarioButton>
        </div>
      </div>
    </div>
  );
}
