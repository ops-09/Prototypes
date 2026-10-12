import type { ReactNode } from 'react';
import { OntarioFooter } from '@ongov/ontario-design-system-component-library-react';
import { withBasePath } from '../../config/basePath';
import { AppHeader } from './AppHeader';
import styles from './AppShell.module.scss';

type PlaygroundShellProps = {
  children: ReactNode;
  serviceTitle?: string;
  serviceHref?: string;
  /** Extra class on `<main>` for page-specific padding (e.g. form layout). */
  mainClassName?: string;
};

export function PlaygroundShell({
  children,
  serviceTitle = 'Prototyping playground',
  serviceHref = withBasePath('/'),
  mainClassName,
}: PlaygroundShellProps) {
  // Prefer page-specific main class so form padding is not overridden by .mainContent.
  const mainClass = mainClassName ?? styles.mainContent;

  return (
    <div className={styles.appShell}>
      <AppHeader
        serviceTitle={serviceTitle}
        serviceHref={serviceHref}
        frenchLink={withBasePath('/fr')}
      />

      <main className={mainClass}>{children}</main>

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
