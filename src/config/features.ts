// Batch invite is gated by VITE_ENABLE_BATCH_INVITE. In dev, localStorage key
// 'ops-rbac:batch-invite' = '1' also enables it without redeploying.
const DEV_BATCH_INVITE_KEY = 'ops-rbac:batch-invite';

export function isBatchInviteEnabled(): boolean {
  if (import.meta.env.VITE_ENABLE_BATCH_INVITE === 'true') {
    return true;
  }

  if (import.meta.env.DEV && typeof localStorage !== 'undefined') {
    return localStorage.getItem(DEV_BATCH_INVITE_KEY) === '1';
  }

  return false;
}
