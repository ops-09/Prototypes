import { ContinuanceDirectorSubflow } from '../components/continuance/ContinuanceDirectorSubflow';
import formStyles from '../components/form2/Form2Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 15 add/edit first director subflow. */
export function Form15DirectorSubflowPage() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContinuanceDirectorSubflow formId={15} />
    </PlaygroundShell>
  );
}
