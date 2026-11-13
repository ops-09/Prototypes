import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { OntarioFooter } from '@ongov/ontario-design-system-component-library-react';
import { withBasePath } from '../../config/basePath';
import { resolveActiveNav } from '../navigation/navigation.utils';
import { SideNavigation } from '../navigation/SideNavigation';
import { AppHeader } from './AppHeader';
import styles from './AppShell.module.scss';

type AppShellProps = {
  children: ReactNode;
  /** Focused task layouts (e.g. invite V3) hide the left navigation. */
  hideSideNav?: boolean;
  /** Let ODS step indicator sit flush under the header, matching form pages. */
  flushContentTop?: boolean;
};

export function AppShell({
  children,
  hideSideNav = false,
  flushContentTop = false,
}: AppShellProps) {
  const { pathname } = useLocation();
  const { activeItemId, activeChildId } = resolveActiveNav(pathname);
  const mainClassName = [
    styles.mainContent,
    flushContentTop ? styles.mainContentFlushTop : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.appShell}>
      <AppHeader
        serviceTitle="ServiceOntario"
        serviceHref={withBasePath('/')}
        frenchLink={withBasePath('/fr')}
      />

      <div className={styles.body}>
        {!hideSideNav && (
          <>
            <div className={styles.sidebarColumn}>
              <SideNavigation activeItemId={activeItemId} activeChildId={activeChildId} />
            </div>
            <div className={styles.bodyDivider} aria-hidden="true" data-testid="app-body-divider" />
          </>
        )}
        <main className={mainClassName}>{children}</main>
      </div>

      <div className={styles.footerRegion}>
        <OntarioFooter
          type="default"
          assetBasePath={withBasePath('/assets/')}
          topMargin={false}
          footerLinks={{
            accessibilityLink: { text: 'Accessibility', href: withBasePath('/accessibility') },
            privacyLink: { text: 'Privacy', href: withBasePath('/privacy') },
            contactLink: { text: 'Contact us', href: withBasePath('/contact') },
            termsOfUseLink: { text: 'Terms of use', href: withBasePath('/terms') },
            printerLink: {
              text: "© King's Printer for Ontario, 2012–26",
              href: withBasePath('/copyright'),
            },
          }}
          socialLinks={{}}
        />
      </div>
    </div>
  );
}
