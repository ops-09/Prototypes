/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_BATCH_INVITE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '@ongov/ontario-design-system-global-styles/styles/css/compiled/ontario-theme.min.css';
declare module '@ongov/ontario-design-system-design-tokens/css';
declare module '*.module.scss';
