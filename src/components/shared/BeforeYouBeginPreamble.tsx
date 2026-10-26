import {
  OntarioCallout,
  OntarioIconClock,
} from '@ongov/ontario-design-system-component-library-react';
import {
  BYB_ESTIMATED_TIME_HEADING,
  BYB_PAGE_TITLE,
  buildBybLead,
} from './beforeYouBeginPreambleContent';
import styles from './BeforeYouBeginPreamble.module.scss';

export type BeforeYouBeginPreambleProps = {
  formName: string;
  estimatedTime: string;
};

export function BeforeYouBeginPreamble({
  formName,
  estimatedTime,
}: BeforeYouBeginPreambleProps) {
  return (
    <div className={styles.preamble}>
      <h1 className={`ontario-h1 ${styles.pageTitle}`}>{BYB_PAGE_TITLE}</h1>
      <p className={styles.lead}>{buildBybLead(formName)}</p>
      <div className={styles.timeEstimateCallout}>
        <OntarioCallout
          headingType="h2"
          headingContent={BYB_ESTIMATED_TIME_HEADING}
          headingContentType="string"
          highlightColour="sky"
        >
          <div className={styles.timeEstimateBody}>
            <OntarioIconClock colour="black" iconWidth={24} isDecorative />
            <p className={styles.timeEstimateText}>{estimatedTime}</p>
          </div>
        </OntarioCallout>
      </div>
    </div>
  );
}
