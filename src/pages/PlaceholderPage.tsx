import { AppShell } from '../components/layout/AppShell';
import { PageBoilerplate } from '../components/layout/PageBoilerplate';
import styles from '../components/layout/AppShell.module.scss';

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <AppShell>
      <PageBoilerplate title={title} description={description} containerLabel={`${title} content`}>
        <p className={styles.contentPlaceholder}>{title} content placeholder</p>
      </PageBoilerplate>
    </AppShell>
  );
}
