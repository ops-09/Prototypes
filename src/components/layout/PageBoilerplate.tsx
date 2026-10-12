import type { ReactNode } from 'react';
import styles from './AppShell.module.scss';

type PageBoilerplateProps = {
  title: string;
  description?: string;
  containerLabel?: string;
  children: ReactNode;
};

export function PageBoilerplate({
  title,
  description,
  containerLabel,
  children,
}: PageBoilerplateProps) {
  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeading}>
        <h1 className={`ontario-h3 ${styles.pageTitle}`}>{title}</h1>
        {description ? <p className={styles.pageDescription}>{description}</p> : null}
      </div>
      {containerLabel ? (
        <section className={styles.pageContainer} aria-label={containerLabel}>
          {children}
        </section>
      ) : (
        children
      )}
    </div>
  );
}
