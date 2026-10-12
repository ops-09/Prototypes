import {
  OntarioCard,
  OntarioCardCollection,
} from '@ongov/ontario-design-system-component-library-react';
import { withBasePath } from '../config/basePath';
import { PageBoilerplate } from '../components/layout/PageBoilerplate';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

export function HomePage() {
  return (
    <PlaygroundShell>
      <PageBoilerplate
        title="Prototyping playground"
        description="Choose a prototype to open. Each screen follows the Ontario Design System."
      >
        <OntarioCardCollection cardsPerRow={2}>
          <OntarioCard
            headingLevel="h2"
            label="User management"
            description="Manage users, roles, and invitations for an Ontario Business Account profile."
            cardLink={withBasePath('/user-management')}
            ariaLabelText="Open the User management prototype"
          />
          <OntarioCard
            headingLevel="h2"
            label="Cover letter — Contact information"
            description="Confirm name, telephone, and email before starting a filing. Pre-filled from the signed-in account profile."
            cardLink={withBasePath('/cover-letter')}
            ariaLabelText="Open the Cover letter Contact information prototype"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 1"
            description="Articles of Incorporation — starts with cover letter contact information, then co-operative name and NUANS."
            cardLink={withBasePath('/form-1')}
            ariaLabelText="Open the Form 1 prototype"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 1 — Step 3"
            description="Co-operative sub-type, primary activity (NAICS), and official email."
            cardLink={withBasePath('/form-1/step-2')}
            ariaLabelText="Open Form 1 Step 3 type and contact"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 1 — Step 4"
            description="Head office address — postal code lookup and Ontario address fields."
            cardLink={withBasePath('/form-1/step-3')}
            ariaLabelText="Open Form 1 Step 4 head office address"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 1 — Step 5"
            description="First directors — board size, multi-stakeholder rules, and director details."
            cardLink={withBasePath('/form-1/step-4')}
            ariaLabelText="Open Form 1 Step 5 first directors"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 7"
            description="Articles of Amendment — starts with cover letter contact information, then co-operative details."
            cardLink={withBasePath('/form-7')}
            ariaLabelText="Open the Form 7 Articles of Amendment prototype"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 7 — Step 4"
            description="Supporting documents upload for Articles of Amendment."
            cardLink={withBasePath('/form-7/step-3')}
            ariaLabelText="Open Form 7 Step 4 Supporting documents"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 7 — Step 5"
            description="Review and validation — summary, authorization, and submit."
            cardLink={withBasePath('/form-7/step-4')}
            ariaLabelText="Open Form 7 Step 5 Review and validation"
          />
        </OntarioCardCollection>
      </PageBoilerplate>
    </PlaygroundShell>
  );
}
