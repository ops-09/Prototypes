import { OntarioSearchBox } from '@ongov/ontario-design-system-component-library-react';
import { useEffect, useId, useRef } from 'react';
import styles from './MinistryPermitBrowseSearch.module.scss';

type MinistryPermitBrowseSearchProps = {
  value: string;
  onChange: (value: string) => void;
  elementId?: string;
  caption?: string;
  hintText?: string;
};

function getInputValue(event: Event) {
  const target = event.target as HTMLInputElement | null;
  return target?.value ?? '';
}

/**
 * Full-width OntarioSearchBox for ministry / permit browse filtering.
 * Clears reset the list; typing filters by ministry id, ministry name, or permit name.
 */
export function MinistryPermitBrowseSearch({
  value,
  onChange,
  elementId,
  caption = 'Search ministry or permit type',
  hintText,
}: MinistryPermitBrowseSearchProps) {
  const generatedId = useId();
  const searchId = elementId ?? `ministry-permit-browse-search-${generatedId}`;
  const searchBoxRef = useRef<HTMLOntarioSearchBoxElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    let inputEl: HTMLInputElement | null = null;
    let formEl: HTMLFormElement | null = null;

    const handleNativeInput = (event: Event) => {
      onChangeRef.current(getInputValue(event));
    };

    const handleNativeReset = () => {
      onChangeRef.current('');
    };

    const attach = () => {
      if (cancelled) {
        return;
      }

      const searchBoxEl = searchBoxRef.current;
      if (!searchBoxEl) {
        frame = requestAnimationFrame(attach);
        return;
      }

      const nextInput = searchBoxEl.shadowRoot?.querySelector<HTMLInputElement>(
        'input.ontario-search__input',
      );
      const nextForm = searchBoxEl.shadowRoot?.querySelector<HTMLFormElement>('form');

      if (nextInput && nextInput !== inputEl) {
        inputEl?.removeEventListener('input', handleNativeInput);
        inputEl = nextInput;
        inputEl.addEventListener('input', handleNativeInput);
      }

      if (nextForm && nextForm !== formEl) {
        formEl?.removeEventListener('reset', handleNativeReset);
        formEl = nextForm;
        formEl.addEventListener('reset', handleNativeReset);
      }

      if (!nextInput) {
        frame = requestAnimationFrame(attach);
      }
    };

    attach();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      inputEl?.removeEventListener('input', handleNativeInput);
      formEl?.removeEventListener('reset', handleNativeReset);
    };
  }, []);

  return (
    <div className={styles.root}>
      <OntarioSearchBox
        ref={searchBoxRef}
        elementId={searchId}
        caption={caption}
        {...(hintText ? { hintText } : {})}
        value={value}
        customOnInput={(event) => onChange(getInputValue(event))}
        customOnChange={(event) => onChange(getInputValue(event))}
        performSearch={async (nextValue) => {
          onChange((nextValue ?? '').trim());
        }}
      />
    </div>
  );
}
