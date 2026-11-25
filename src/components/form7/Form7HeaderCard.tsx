import { FormNameCard } from '../shared/FormNameCard';
import { BYB_FORM_NAME } from './form7BeforeYouBeginContent';

/** Form 7 filing context header — shared FormNameCard with Form 7 title. */
export function Form7HeaderCard() {
  return <FormNameCard applicationType={BYB_FORM_NAME} />;
}
