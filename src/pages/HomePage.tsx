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
            description="Articles of Incorporation — Before you begin, then cover letter, name and NUANS, and remaining steps."
            cardLink={withBasePath('/form-1')}
            ariaLabelText="Open the Form 1 prototype"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 1 — Step 1"
            description="Cover letter — contact information before the filing steps."
            cardLink={withBasePath('/form-1/step-1')}
            ariaLabelText="Open Form 1 Step 1 cover letter"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 1 — Step 2"
            description="Co-operative name and NUANS report upload."
            cardLink={withBasePath('/form-1/step-2')}
            ariaLabelText="Open Form 1 Step 2 name and NUANS"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 1 — Step 3"
            description="Co-operative sub-type, primary activity (NAICS), and official email."
            cardLink={withBasePath('/form-1/step-3')}
            ariaLabelText="Open Form 1 Step 3 type and contact"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 1 — Step 4"
            description="Head office address — postal code lookup and Ontario address fields."
            cardLink={withBasePath('/form-1/step-4')}
            ariaLabelText="Open Form 1 Step 4 head office address"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 1 — Step 5"
            description="First directors — board size, multi-stakeholder rules, and director details."
            cardLink={withBasePath('/form-1/step-5')}
            ariaLabelText="Open Form 1 Step 5 first directors"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 1 — Step 6"
            description="Share information — authorized capital, preference terms, and share restrictions."
            cardLink={withBasePath('/form-1/step-6')}
            ariaLabelText="Open Form 1 Step 6 share information"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 1 — Step 7"
            description="Membership and provisions — classes, stakeholder groups, and special provisions."
            cardLink={withBasePath('/form-1/step-7')}
            ariaLabelText="Open Form 1 Step 7 membership and provisions"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 1 — Step 8"
            description="Incorporators — individuals or corporations, shares taken, and list management."
            cardLink={withBasePath('/form-1/step-8')}
            ariaLabelText="Open Form 1 Step 8 incorporators"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 1 — Step 9"
            description="Review and validation — summary, generate PDF, authorize, and submit."
            cardLink={withBasePath('/form-1/step-9')}
            ariaLabelText="Open Form 1 Step 9 review and validation"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 2"
            description="Articles of Incorporation of a Co-operative without Share Capital — Before you begin, then filing steps."
            cardLink={withBasePath('/form-2')}
            ariaLabelText="Open the Form 2 prototype"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 2 — Step 1"
            description="Cover letter — contact information before the filing steps."
            cardLink={withBasePath('/form-2/step-1')}
            ariaLabelText="Open Form 2 Step 1 cover letter"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 2 — Step 2"
            description="Non-profit question, co-operative name, and NUANS report upload."
            cardLink={withBasePath('/form-2/step-2')}
            ariaLabelText="Open Form 2 Step 2 name and NUANS"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 2 — Step 3"
            description="Co-operative sub-type, primary activity (NAICS), and official email."
            cardLink={withBasePath('/form-2/step-3')}
            ariaLabelText="Open Form 2 Step 3 type and contact"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 2 — Step 4"
            description="Head office address — postal code lookup and Ontario address fields."
            cardLink={withBasePath('/form-2/step-4')}
            ariaLabelText="Open Form 2 Step 4 head office address"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 2 — Step 5"
            description="First directors — board size, multi-stakeholder rules, and director details."
            cardLink={withBasePath('/form-2/step-5')}
            ariaLabelText="Open Form 2 Step 5 first directors"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 2 — Step 6"
            description="Member loans and restrictions — business powers, member loans, and membership fee."
            cardLink={withBasePath('/form-2/step-6')}
            ariaLabelText="Open Form 2 Step 6 member loans and restrictions"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 2 — Step 7"
            description="Membership and provisions — classes, stakeholder groups, and special provisions."
            cardLink={withBasePath('/form-2/step-7')}
            ariaLabelText="Open Form 2 Step 7 membership and provisions"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 2 — Step 8"
            description="Incorporators — individuals or corporations and list management."
            cardLink={withBasePath('/form-2/step-8')}
            ariaLabelText="Open Form 2 Step 8 incorporators"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 2 — Step 9"
            description="Review and validation — summary, generate PDF, authorize, and submit."
            cardLink={withBasePath('/form-2/step-9')}
            ariaLabelText="Open Form 2 Step 9 review and validation"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 7"
            description="Articles of Amendment — Before you begin, then cover letter and filing steps."
            cardLink={withBasePath('/form-7')}
            ariaLabelText="Open the Form 7 Articles of Amendment prototype"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 7 — Step 1"
            description="Cover letter — contact information before the filing steps."
            cardLink={withBasePath('/form-7/step-1')}
            ariaLabelText="Open Form 7 Step 1 cover letter"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 7 — Step 4"
            description="Supporting documents upload for Articles of Amendment."
            cardLink={withBasePath('/form-7/step-4')}
            ariaLabelText="Open Form 7 Step 4 Supporting documents"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 7 — Step 5"
            description="Review and validation — summary, authorization, and submit."
            cardLink={withBasePath('/form-7/step-5')}
            ariaLabelText="Open Form 7 Step 5 Review and validation"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 10"
            description="Articles of Amalgamation — Before you begin, then cover letter."
            cardLink={withBasePath('/form-10')}
            ariaLabelText="Open the Form 10 Articles of Amalgamation prototype"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 10 — Step 1"
            description="Cover letter — contact information before the filing steps."
            cardLink={withBasePath('/form-10/step-1')}
            ariaLabelText="Open Form 10 Step 1 cover letter"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 10 — Step 2"
            description="Business details — primary activity, official email, and type of co-operative."
            cardLink={withBasePath('/form-10/step-2')}
            ariaLabelText="Open Form 10 Step 2 business details"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 10 — Step 3"
            description="Amalgamation details — amalgamating co-operatives and section 156 confirmation."
            cardLink={withBasePath('/form-10/step-3')}
            ariaLabelText="Open Form 10 Step 3 amalgamation details"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 10 — Step 4"
            description="Supporting documents — amalgamation agreements and affidavits of solvency."
            cardLink={withBasePath('/form-10/step-4')}
            ariaLabelText="Open Form 10 Step 4 supporting documents"
          />
          <OntarioCard
            headingLevel="h2"
            label="Form 10 — Step 5"
            description="Review and validation — summary, generate PDF, authorize, and submit."
            cardLink={withBasePath('/form-10/step-5')}
            ariaLabelText="Open Form 10 Step 5 review and validation"
          />
        </OntarioCardCollection>
      </PageBoilerplate>
    </PlaygroundShell>
  );
}
