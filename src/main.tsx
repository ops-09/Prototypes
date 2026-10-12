import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { setAssetPath } from '@ongov/ontario-design-system-component-library-react';
import '@ongov/ontario-design-system-global-styles/styles/css/compiled/ontario-theme.min.css';
import './styles/tokens.css';
import App from './App.tsx';
import { RbacProvider } from './rbac/RbacContext';
import { installOntarioRadioErrorStyles } from './ods/ensureOntarioRadioErrorStyles';

// Stencil getAssetPath joins this base with `./assets/<file>`.
// Include Vite BASE_URL so GitHub Pages assets resolve under /Prototypes/.
const assetBase = `${window.location.origin}${import.meta.env.BASE_URL}`;
setAssetPath(assetBase.endsWith('/') ? assetBase : `${assetBase}/`);

installOntarioRadioErrorStyles();

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <RbacProvider>
        <App />
      </RbacProvider>
    </BrowserRouter>
  </StrictMode>,
);
