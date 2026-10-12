import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  getInviteWizardVersion,
  setInviteWizardVersion,
  type InviteWizardVersion,
} from '../../config/inviteWizardVersion';

type InviteWizardVersionContextValue = {
  version: InviteWizardVersion;
  setVersion: (version: InviteWizardVersion) => void;
  toggleVisible: boolean;
  setToggleVisible: (visible: boolean) => void;
  registerVersionSwitchHandler: (handler: (next: InviteWizardVersion) => void) => () => void;
};

const InviteWizardVersionContext = createContext<InviteWizardVersionContextValue | null>(null);

export function InviteWizardVersionProvider({ children }: { children: ReactNode }) {
  const [version, setVersionState] = useState<InviteWizardVersion>(getInviteWizardVersion);
  const [toggleVisible, setToggleVisible] = useState(false);
  const versionSwitchHandlerRef = useRef<(next: InviteWizardVersion) => void>(() => {});

  const setVersion = useCallback((next: InviteWizardVersion) => {
    setInviteWizardVersion(next);
    setVersionState((current: InviteWizardVersion) => {
      if (current !== next) {
        versionSwitchHandlerRef.current(next);
      }
      return next;
    });
  }, []);

  const registerVersionSwitchHandler = useCallback(
    (handler: (next: InviteWizardVersion) => void) => {
      versionSwitchHandlerRef.current = handler;
      return () => {
        versionSwitchHandlerRef.current = () => {};
      };
    },
    [],
  );

  const value = useMemo(
    () => ({
      version,
      setVersion,
      toggleVisible,
      setToggleVisible,
      registerVersionSwitchHandler,
    }),
    [version, setVersion, toggleVisible, registerVersionSwitchHandler],
  );

  return (
    <InviteWizardVersionContext.Provider value={value}>{children}</InviteWizardVersionContext.Provider>
  );
}

export function useInviteWizardVersionContext() {
  const context = useContext(InviteWizardVersionContext);

  if (!context) {
    throw new Error('useInviteWizardVersionContext must be used within InviteWizardVersionProvider');
  }

  return context;
}

export function useOptionalInviteWizardVersionContext() {
  return useContext(InviteWizardVersionContext);
}
