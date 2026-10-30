import {
  OntarioCard,
  OntarioCardCollection,
} from '@ongov/ontario-design-system-component-library-react';
import { withBasePath } from '../config/basePath';
import { PageBoilerplate } from '../components/layout/PageBoilerplate';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';
import styles from './HomePage.module.scss';

type PlaygroundCard = {
  label: string;
  description: string;
  href: string;
  ariaLabelText: string;
};

type PageCategory = {
  heading: string;
  cards: PlaygroundCard[];
};

const PROTOTYPES: PlaygroundCard[] = [
  {
    label: 'Cover letter — Contact information',
    description:
      'Confirm name, telephone, and email before starting a filing. Pre-filled from the signed-in account profile.',
    href: '/cover-letter',
    ariaLabelText: 'Open the Cover letter Contact information prototype',
  },
  {
    label: 'Form 1',
    description:
      'Articles of Incorporation — Before you begin, then cover letter, name and NUANS, and remaining steps.',
    href: '/form-1',
    ariaLabelText: 'Open the Form 1 prototype',
  },
  {
    label: 'Form 2',
    description:
      'Articles of Incorporation of a Co-operative without Share Capital — Before you begin, then filing steps.',
    href: '/form-2',
    ariaLabelText: 'Open the Form 2 prototype',
  },
  {
    label: 'Form 3',
    description:
      'Application for Supplementary Letters Patent — Before you begin, then cover letter and filing steps.',
    href: '/form-3',
    ariaLabelText: 'Open the Form 3 prototype',
  },
  {
    label: 'Form 7',
    description:
      'Articles of Amendment — Before you begin, then cover letter and filing steps.',
    href: '/form-7',
    ariaLabelText: 'Open the Form 7 Articles of Amendment prototype',
  },
  {
    label: 'Form 10',
    description: 'Articles of Amalgamation — Before you begin, then cover letter.',
    href: '/form-10',
    ariaLabelText: 'Open the Form 10 Articles of Amalgamation prototype',
  },
  {
    label: 'Form 11',
    description:
      'Application for Letters Patent of Amalgamation — corporation details through directors, then supporting documents.',
    href: '/form-11',
    ariaLabelText:
      'Open the Form 11 Application for Letters Patent of Amalgamation prototype',
  },
];

const PROTOTYPE_PAGES: PageCategory[] = [
  {
    heading: 'Form 1 pages',
    cards: [
      {
        label: 'Form 1 — Step 1',
        description: 'Cover letter — contact information before the filing steps.',
        href: '/form-1/step-1',
        ariaLabelText: 'Open Form 1 Step 1 cover letter',
      },
      {
        label: 'Form 1 — Step 2',
        description: 'Co-operative name and NUANS report upload.',
        href: '/form-1/step-2',
        ariaLabelText: 'Open Form 1 Step 2 name and NUANS',
      },
      {
        label: 'Form 1 — Step 3',
        description: 'Co-operative sub-type, primary activity (NAICS), and official email.',
        href: '/form-1/step-3',
        ariaLabelText: 'Open Form 1 Step 3 type and contact',
      },
      {
        label: 'Form 1 — Step 4',
        description: 'Head office address — postal code lookup and Ontario address fields.',
        href: '/form-1/step-4',
        ariaLabelText: 'Open Form 1 Step 4 head office address',
      },
      {
        label: 'Form 1 — Step 5',
        description: 'First directors — board size, multi-stakeholder rules, and director details.',
        href: '/form-1/step-5',
        ariaLabelText: 'Open Form 1 Step 5 first directors',
      },
      {
        label: 'Form 1 — Step 6',
        description:
          'Share information — authorized capital, preference terms, and share restrictions.',
        href: '/form-1/step-6',
        ariaLabelText: 'Open Form 1 Step 6 share information',
      },
      {
        label: 'Form 1 — Step 7',
        description:
          'Membership and provisions — classes, stakeholder groups, and special provisions.',
        href: '/form-1/step-7',
        ariaLabelText: 'Open Form 1 Step 7 membership and provisions',
      },
      {
        label: 'Form 1 — Step 8',
        description:
          'Incorporators — individuals or corporations, shares taken, and list management.',
        href: '/form-1/step-8',
        ariaLabelText: 'Open Form 1 Step 8 incorporators',
      },
      {
        label: 'Form 1 — Step 9',
        description: 'Review — summary and generate PDF.',
        href: '/form-1/step-9',
        ariaLabelText: 'Open Form 1 Step 9 review',
      },
      {
        label: 'Form 1 — Step 10',
        description: 'Submit — upload the signed PDF, authorize, and submit.',
        href: '/form-1/step-10',
        ariaLabelText: 'Open Form 1 Step 10 submit',
      },
    ],
  },
  {
    heading: 'Form 2 pages',
    cards: [
      {
        label: 'Form 2 — Step 1',
        description: 'Cover letter — contact information before the filing steps.',
        href: '/form-2/step-1',
        ariaLabelText: 'Open Form 2 Step 1 cover letter',
      },
      {
        label: 'Form 2 — Step 2',
        description: 'Non-profit question, co-operative name, and NUANS report upload.',
        href: '/form-2/step-2',
        ariaLabelText: 'Open Form 2 Step 2 name and NUANS',
      },
      {
        label: 'Form 2 — Step 3',
        description: 'Co-operative sub-type, primary activity (NAICS), and official email.',
        href: '/form-2/step-3',
        ariaLabelText: 'Open Form 2 Step 3 type and contact',
      },
      {
        label: 'Form 2 — Step 4',
        description: 'Head office address — postal code lookup and Ontario address fields.',
        href: '/form-2/step-4',
        ariaLabelText: 'Open Form 2 Step 4 head office address',
      },
      {
        label: 'Form 2 — Step 5',
        description: 'First directors — board size, multi-stakeholder rules, and director details.',
        href: '/form-2/step-5',
        ariaLabelText: 'Open Form 2 Step 5 first directors',
      },
      {
        label: 'Form 2 — Step 6',
        description:
          'Member loans and restrictions — business powers, member loans, and membership fee.',
        href: '/form-2/step-6',
        ariaLabelText: 'Open Form 2 Step 6 member loans and restrictions',
      },
      {
        label: 'Form 2 — Step 7',
        description:
          'Membership and provisions — classes, stakeholder groups, and special provisions.',
        href: '/form-2/step-7',
        ariaLabelText: 'Open Form 2 Step 7 membership and provisions',
      },
      {
        label: 'Form 2 — Step 8',
        description: 'Incorporators — individuals or corporations and list management.',
        href: '/form-2/step-8',
        ariaLabelText: 'Open Form 2 Step 8 incorporators',
      },
      {
        label: 'Form 2 — Step 9',
        description: 'Review — summary and generate PDF.',
        href: '/form-2/step-9',
        ariaLabelText: 'Open Form 2 Step 9 review',
      },
      {
        label: 'Form 2 — Step 10',
        description: 'Submit — upload the signed PDF, authorize, and submit.',
        href: '/form-2/step-10',
        ariaLabelText: 'Open Form 2 Step 10 submit',
      },
    ],
  },
  {
    heading: 'Form 3 pages',
    cards: [
      {
        label: 'Form 3 — Step 1',
        description: 'Cover letter — contact information before the filing steps.',
        href: '/form-3/step-1',
        ariaLabelText: 'Open Form 3 Step 1 cover letter',
      },
      {
        label: 'Form 3 — Step 2',
        description: 'Corporation details — primary activity and official email.',
        href: '/form-3/step-2',
        ariaLabelText: 'Open Form 3 Step 2 corporation details',
      },
      {
        label: 'Form 3 — Step 3',
        description: 'Corporation name — change the name and upload a NUANS report when required.',
        href: '/form-3/step-3',
        ariaLabelText: 'Open Form 3 Step 3 corporation name',
      },
      {
        label: 'Form 3 — Step 4',
        description: 'Resolution date, requested provisions, and optional supporting documents.',
        href: '/form-3/step-4',
        ariaLabelText: 'Open Form 3 Step 4 resolution and provisions',
      },
      {
        label: 'Form 3 — Step 5',
        description: 'Review — summary and generate PDF.',
        href: '/form-3/step-5',
        ariaLabelText: 'Open Form 3 Step 5 review',
      },
      {
        label: 'Form 3 — Step 6',
        description: 'Submit — upload the signed PDF, authorize, and submit.',
        href: '/form-3/step-6',
        ariaLabelText: 'Open Form 3 Step 6 submit',
      },
    ],
  },
  {
    heading: 'Form 7 pages',
    cards: [
      {
        label: 'Form 7 — Step 1',
        description: 'Cover letter — contact information before the filing steps.',
        href: '/form-7/step-1',
        ariaLabelText: 'Open Form 7 Step 1 cover letter',
      },
      {
        label: 'Form 7 — Step 2',
        description:
          'Business details — primary activity, official email, and type of co-operative.',
        href: '/form-7/step-2',
        ariaLabelText: 'Open Form 7 Step 2 business details',
      },
      {
        label: 'Form 7 — Step 3',
        description:
          'Amendment details — type of amendment, name change, and NUANS when required.',
        href: '/form-7/step-3',
        ariaLabelText: 'Open Form 7 Step 3 amendment details',
      },
      {
        label: 'Form 7 — Step 4',
        description:
          'Supporting documents — certified resolution, authorization subsections, and optional uploads.',
        href: '/form-7/step-4',
        ariaLabelText: 'Open Form 7 Step 4 supporting documents',
      },
      {
        label: 'Form 7 — Step 5',
        description: 'Review — summary and generate PDF.',
        href: '/form-7/step-5',
        ariaLabelText: 'Open Form 7 Step 5 review',
      },
      {
        label: 'Form 7 — Step 6',
        description: 'Submit — upload the signed PDF, authorize, and submit.',
        href: '/form-7/step-6',
        ariaLabelText: 'Open Form 7 Step 6 submit',
      },
    ],
  },
  {
    heading: 'Form 10 pages',
    cards: [
      {
        label: 'Form 10 — Step 1',
        description: 'Cover letter — contact information before the filing steps.',
        href: '/form-10/step-1',
        ariaLabelText: 'Open Form 10 Step 1 cover letter',
      },
      {
        label: 'Form 10 — Step 2',
        description:
          'Business details — primary activity, official email, and type of co-operative.',
        href: '/form-10/step-2',
        ariaLabelText: 'Open Form 10 Step 2 business details',
      },
      {
        label: 'Form 10 — Step 3',
        description:
          'Amalgamation details — amalgamating co-operatives and section 156 confirmation.',
        href: '/form-10/step-3',
        ariaLabelText: 'Open Form 10 Step 3 amalgamation details',
      },
      {
        label: 'Form 10 — Step 4',
        description:
          'Co-operative name — change the amalgamated name and upload NUANS if needed.',
        href: '/form-10/step-4',
        ariaLabelText: 'Open Form 10 Step 4 co-operative name',
      },
      {
        label: 'Form 10 — Step 5',
        description: 'Supporting documents — amalgamation agreements and affidavits of solvency.',
        href: '/form-10/step-5',
        ariaLabelText: 'Open Form 10 Step 5 supporting documents',
      },
      {
        label: 'Form 10 — Step 6',
        description: 'Review — summary and generate PDF.',
        href: '/form-10/step-6',
        ariaLabelText: 'Open Form 10 Step 6 review',
      },
      {
        label: 'Form 10 — Step 7',
        description: 'Submit — upload the signed PDF, authorize, and submit.',
        href: '/form-10/step-7',
        ariaLabelText: 'Open Form 10 Step 7 submit',
      },
    ],
  },
  {
    heading: 'Form 11 pages',
    cards: [
      {
        label: 'Form 11 — Step 2',
        description:
          'Corporation details — primary activity and official email, pre-populated from OBR.',
        href: '/form-11/step-2',
        ariaLabelText: 'Open Form 11 Step 2 corporation details',
      },
      {
        label: 'Form 11 — Step 3',
        description:
          'Amalgamation details — amalgamating not-for-profit corporations and section 113(3) confirmation.',
        href: '/form-11/step-3',
        ariaLabelText: 'Open Form 11 Step 3 amalgamation details',
      },
      {
        label: 'Form 11 — Step 4',
        description:
          'Amalgamated name — keep an existing amalgamating name or propose a new name with NUANS.',
        href: '/form-11/step-4',
        ariaLabelText: 'Open Form 11 Step 4 amalgamated corporation name',
      },
      {
        label: 'Form 11 — Step 5',
        description:
          'Head office address — Ontario postal-code lookup for the amalgamated not-for-profit corporation.',
        href: '/form-11/step-5',
        ariaLabelText: 'Open Form 11 Step 5 head office address',
      },
      {
        label: 'Form 11 — Step 6',
        description:
          'Directors — fixed or min/max count, add first directors and addresses for service.',
        href: '/form-11/step-6',
        ariaLabelText: 'Open Form 11 Step 6 directors',
      },
      {
        label: 'Form 11 — Step 7',
        description:
          'Supporting documents — amalgamation agreement copy and optional additional PDFs.',
        href: '/form-11/step-7',
        ariaLabelText: 'Open Form 11 Step 7 supporting documents',
      },
      {
        label: 'Form 11 — Step 8',
        description: 'Review — application details and generate PDF.',
        href: '/form-11/step-8',
        ariaLabelText: 'Open Form 11 Step 8 review',
      },
      {
        label: 'Form 11 — Step 9',
        description: 'Submit — upload the signed PDF, authorize, and submit.',
        href: '/form-11/step-9',
        ariaLabelText: 'Open Form 11 Step 9 submit',
      },
    ],
  },
];

function PlaygroundCardGrid({
  cards,
  headingLevel,
}: {
  cards: PlaygroundCard[];
  headingLevel: 'h3' | 'h4';
}) {
  return (
    <OntarioCardCollection cardsPerRow={2}>
      {cards.map((card) => (
        <OntarioCard
          key={card.href}
          headingLevel={headingLevel}
          label={card.label}
          description={card.description}
          cardLink={withBasePath(card.href)}
          ariaLabelText={card.ariaLabelText}
        />
      ))}
    </OntarioCardCollection>
  );
}

export function HomePage() {
  return (
    <PlaygroundShell>
      <PageBoilerplate
        title="Prototyping playground"
        description="Open a form from Prototypes, or jump to a specific page under Prototype pages."
      >
        <div className={styles.pageStack}>
          <section className={styles.section} aria-labelledby="prototypes-heading">
            <h2 id="prototypes-heading" className={`ontario-h2 ${styles.sectionHeading}`}>
              Prototypes
            </h2>
            <PlaygroundCardGrid cards={PROTOTYPES} headingLevel="h3" />
          </section>

          <section className={styles.section} aria-labelledby="prototype-pages-heading">
            <h2 id="prototype-pages-heading" className={`ontario-h2 ${styles.sectionHeading}`}>
              Prototype pages
            </h2>
            <div className={styles.categoryList}>
              {PROTOTYPE_PAGES.map((category) => (
                <div key={category.heading} className={styles.category}>
                  <h3 className={`ontario-h3 ${styles.categoryHeading}`}>{category.heading}</h3>
                  <PlaygroundCardGrid cards={category.cards} headingLevel="h4" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </PageBoilerplate>
    </PlaygroundShell>
  );
}
