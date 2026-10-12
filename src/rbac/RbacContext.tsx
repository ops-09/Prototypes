import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  inviteUser,
  inviteUsers,
  listUsers,
  removeUser,
  updateUser,
} from './rbacService';
import { getRoleById } from './roles';
import type {
  BusinessUser,
  InviteBatchInput,
  InviteBatchResult,
  InviteUserInput,
  PageAlertState,
  UpdateUserInput,
} from './types';

type RbacContextValue = {
  users: BusinessUser[];
  pageAlert: PageAlertState;
  isLoading: boolean;
  refreshUsers: () => void;
  clearPageAlert: () => void;
  setPageAlert: (alert: PageAlertState) => void;
  inviteBusinessUser: (input: InviteUserInput) => Promise<BusinessUser>;
  inviteBusinessUsers: (batch: InviteBatchInput) => Promise<InviteBatchResult>;
  updateBusinessUser: (userId: string, input: UpdateUserInput) => Promise<BusinessUser>;
  removeBusinessUser: (userId: string) => Promise<BusinessUser>;
};

const RbacContext = createContext<RbacContextValue | null>(null);

export function RbacProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<BusinessUser[]>(() => listUsers());
  const [pageAlert, setPageAlertState] = useState<PageAlertState>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshUsers = useCallback(() => {
    setUsers(listUsers());
  }, []);

  const clearPageAlert = useCallback(() => {
    setPageAlertState(null);
  }, []);

  const setPageAlert = useCallback((alert: PageAlertState) => {
    setPageAlertState(alert);
  }, []);

  const runAction = useCallback(
    async <T,>(action: () => T, successAlert: PageAlertState): Promise<T> => {
      setIsLoading(true);
      clearPageAlert();

      try {
        const result = action();
        refreshUsers();
        setPageAlertState(successAlert);
        return result;
      } catch (error) {
        setPageAlertState({
          type: 'error',
          heading: 'Something went wrong',
          content:
            error instanceof Error
              ? error.message
              : 'Unable to complete this action. Try again.',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [clearPageAlert, refreshUsers],
  );

  const inviteBusinessUser = useCallback(
    async (input: InviteUserInput) => {
      setIsLoading(true);
      clearPageAlert();

      try {
        const result = inviteUser(input);
        refreshUsers();
        return result;
      } catch (error) {
        setPageAlertState({
          type: 'error',
          heading: 'Unable to send invitation',
          content:
            error instanceof Error
              ? error.message
              : 'Unable to complete this action. Try again.',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [clearPageAlert, refreshUsers],
  );

  const inviteBusinessUsers = useCallback(
    async (batch: InviteBatchInput) => {
      setIsLoading(true);
      clearPageAlert();

      try {
        const result = inviteUsers(batch);
        refreshUsers();
        return result;
      } catch (error) {
        setPageAlertState({
          type: 'error',
          heading: 'Unable to send invitations',
          content:
            error instanceof Error
              ? error.message
              : 'Unable to complete this action. Try again.',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [clearPageAlert, refreshUsers],
  );

  const updateBusinessUser = useCallback(
    (userId: string, input: UpdateUserInput) =>
      runAction(
        () => updateUser(userId, input),
        {
          type: 'success',
          heading: 'User updated',
          content: `${input.email}'s access was updated.`,
        },
      ),
    [runAction],
  );

  const removeBusinessUser = useCallback(
    (userId: string) => {
      const user = listUsers().find((entry) => entry.id === userId);
      return runAction(
        () => removeUser(userId),
        {
          type: 'success',
          heading: 'User removed',
          content: `${user?.email ?? 'This user'} no longer has access to this business profile.`,
        },
      );
    },
    [runAction],
  );

  const value = useMemo(
    () => ({
      users,
      pageAlert,
      isLoading,
      refreshUsers,
      clearPageAlert,
      setPageAlert,
      inviteBusinessUser,
      inviteBusinessUsers,
      updateBusinessUser,
      removeBusinessUser,
    }),
    [
      users,
      pageAlert,
      isLoading,
      refreshUsers,
      clearPageAlert,
      setPageAlert,
      inviteBusinessUser,
      inviteBusinessUsers,
      updateBusinessUser,
      removeBusinessUser,
    ],
  );

  return <RbacContext.Provider value={value}>{children}</RbacContext.Provider>;
}

export function useRbac() {
  const context = useContext(RbacContext);
  if (!context) {
    throw new Error('useRbac must be used within RbacProvider');
  }
  return context;
}

export function useRoleLabel(roleId: BusinessUser['roleId']) {
  return getRoleById(roleId)?.label ?? roleId;
}
