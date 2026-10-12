import { OntarioHintText, OntarioSearchBox } from '@ongov/ontario-design-system-component-library-react';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { FieldErrorMessage } from '../form1/FieldErrorMessage';
import {
  filterNaicsExamples,
  formatNaicsLabel,
  type NaicsExample,
} from './naicsExampleCodes';
import styles from './NaicsSearchAutosuggest.module.scss';

type NaicsSearchAutosuggestProps = {
  elementId: string;
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
};

type SuggestionsPosition = {
  top: number;
  left: number;
  width: number;
};

function getInputValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | null;
  return target?.value ?? '';
}

function getScrollableAncestors(element: HTMLElement | null): HTMLElement[] {
  const ancestors: HTMLElement[] = [];
  let parent = element?.parentElement ?? null;

  while (parent) {
    const style = window.getComputedStyle(parent);
    if (/(auto|scroll|overlay)/.test(`${style.overflow} ${style.overflowY} ${style.overflowX}`)) {
      ancestors.push(parent);
    }
    parent = parent.parentElement;
  }

  return ancestors;
}

function syncSearchBoxClipMetrics(
  clipEl: HTMLDivElement,
  searchBoxEl: HTMLOntarioSearchBoxElement,
): boolean {
  const inputContainer = searchBoxEl.shadowRoot?.querySelector('.ontario-search__input-container');
  if (!(inputContainer instanceof HTMLElement)) {
    return false;
  }

  // Clip to the input row only (blank caption + any internal margins stay hidden).
  const hostRect = searchBoxEl.getBoundingClientRect();
  const inputRect = inputContainer.getBoundingClientRect();
  const offset = Math.max(0, inputRect.top - hostRect.top);
  const height = Math.max(0, inputRect.height);

  clipEl.style.setProperty('--search-input-offset', `${offset}px`);
  clipEl.style.setProperty('--search-input-height', `${height}px`);
  return true;
}

function highlightMatch(text: string, query: string): ReactNode {
  const normalized = query.trim();
  if (!normalized) {
    return text;
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = normalized.toLowerCase();
  const nodes: ReactNode[] = [];
  let start = 0;
  let matchIndex = lowerText.indexOf(lowerQuery);
  let key = 0;

  while (matchIndex !== -1) {
    if (matchIndex > start) {
      nodes.push(text.slice(start, matchIndex));
    }
    nodes.push(
      <strong key={key} className={styles.match}>
        {text.slice(matchIndex, matchIndex + lowerQuery.length)}
      </strong>,
    );
    key += 1;
    start = matchIndex + lowerQuery.length;
    matchIndex = lowerText.indexOf(lowerQuery, start);
  }

  if (start < text.length) {
    nodes.push(text.slice(start));
  }

  return nodes;
}

export function NaicsSearchAutosuggest({
  elementId,
  value,
  onChange,
  errorMessage,
}: NaicsSearchAutosuggestProps) {
  const listboxId = useId();
  const errorId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const searchBoxRef = useRef<HTMLOntarioSearchBoxElement>(null);
  const onChangeRef = useRef(onChange);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestionsPosition, setSuggestionsPosition] = useState<SuggestionsPosition | null>(
    null,
  );

  onChangeRef.current = onChange;

  // ODS SearchBox has no errorMessage prop — mirror ontario-input__error on the inner input.
  useLayoutEffect(() => {
    const input = searchBoxRef.current?.shadowRoot?.querySelector<HTMLInputElement>(
      'input.ontario-search__input',
    );
    if (!input) {
      return;
    }
    if (errorMessage) {
      input.classList.add('ontario-input__error');
      input.style.borderColor = 'var(--ontario-colour-dark-red, #b51d22)';
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', errorId);
    } else {
      input.classList.remove('ontario-input__error');
      input.style.borderColor = '';
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
  }, [errorId, errorMessage, value]);

  const suggestions = useMemo(() => filterNaicsExamples(value), [value]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target) ||
        suggestionsRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
      setActiveIndex(-1);
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (!isOpen || activeIndex >= suggestions.length) {
      setActiveIndex(-1);
    }
  }, [activeIndex, isOpen, suggestions.length]);

  useLayoutEffect(() => {
    let cancelled = false;
    let frame = 0;
    let observingSearchBox = false;
    let inputEl: HTMLInputElement | null = null;
    let formEl: HTMLFormElement | null = null;

    const handleNativeInput = (event: Event) => {
      onChangeRef.current(getInputValue(event));
      setIsOpen(true);
    };

    const handleNativeFocus = () => {
      setIsOpen(true);
    };

    // ODS clear control is type="reset" — it empties the DOM input without an `input` event.
    const handleNativeReset = () => {
      onChangeRef.current('');
      setIsOpen(false);
      setActiveIndex(-1);
    };

    const attachNativeListeners = (searchBoxEl: HTMLOntarioSearchBoxElement) => {
      const nextInput = searchBoxEl.shadowRoot?.querySelector<HTMLInputElement>(
        'input.ontario-search__input',
      );
      const nextForm = searchBoxEl.shadowRoot?.querySelector<HTMLFormElement>('form');

      if (nextInput && nextInput !== inputEl) {
        inputEl?.removeEventListener('input', handleNativeInput);
        inputEl?.removeEventListener('focus', handleNativeFocus);
        inputEl = nextInput;
        inputEl.addEventListener('input', handleNativeInput);
        inputEl.addEventListener('focus', handleNativeFocus);
      }

      if (nextForm && nextForm !== formEl) {
        formEl?.removeEventListener('reset', handleNativeReset);
        formEl = nextForm;
        formEl.addEventListener('reset', handleNativeReset);
      }

      return Boolean(nextInput);
    };

    const syncClipMetrics = () => {
      if (cancelled) {
        return;
      }

      const clipEl = clipRef.current;
      const searchBoxEl = searchBoxRef.current;
      if (!clipEl || !searchBoxEl) {
        frame = requestAnimationFrame(syncClipMetrics);
        return;
      }

      if (!observingSearchBox) {
        observer.observe(searchBoxEl);
        observingSearchBox = true;
      }

      attachNativeListeners(searchBoxEl);

      if (!syncSearchBoxClipMetrics(clipEl, searchBoxEl)) {
        frame = requestAnimationFrame(syncClipMetrics);
      }
    };

    const observer = new ResizeObserver(syncClipMetrics);

    syncClipMetrics();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      inputEl?.removeEventListener('input', handleNativeInput);
      inputEl?.removeEventListener('focus', handleNativeFocus);
      formEl?.removeEventListener('reset', handleNativeReset);
    };
  }, []);

  const showSuggestions = isOpen && value.trim().length > 0 && suggestions.length > 0;

  const updateSuggestionsPosition = useCallback(() => {
    const anchor = clipRef.current;
    if (!anchor) {
      return;
    }

    const rect = anchor.getBoundingClientRect();
    setSuggestionsPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useLayoutEffect(() => {
    if (!showSuggestions) {
      setSuggestionsPosition(null);
      return;
    }

    updateSuggestionsPosition();

    const anchor = clipRef.current;
    const scrollParents = getScrollableAncestors(anchor);
    window.addEventListener('resize', updateSuggestionsPosition);
    window.addEventListener('scroll', updateSuggestionsPosition, { passive: true });

    for (const parent of scrollParents) {
      parent.addEventListener('scroll', updateSuggestionsPosition, { passive: true });
    }

    return () => {
      window.removeEventListener('resize', updateSuggestionsPosition);
      window.removeEventListener('scroll', updateSuggestionsPosition);

      for (const parent of scrollParents) {
        parent.removeEventListener('scroll', updateSuggestionsPosition);
      }
    };
  }, [showSuggestions, updateSuggestionsPosition]);

  function openSuggestions() {
    setIsOpen(true);
  }

  function closeSuggestions() {
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function selectSuggestion(entry: NaicsExample) {
    onChange(formatNaicsLabel(entry));
    closeSuggestions();
  }

  function handleInput(event: globalThis.Event) {
    onChange(getInputValue(event));
    openSuggestions();
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (!isOpen || suggestions.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
      return;
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
      return;
    }

    if (event.key === 'Escape') {
      closeSuggestions();
    }
  }

  const suggestionsList =
    showSuggestions && suggestionsPosition
      ? createPortal(
          <ul
            ref={suggestionsRef}
            id={listboxId}
            className={styles.suggestions}
            role="listbox"
            aria-label="NAICS suggestions"
            style={{
              top: suggestionsPosition.top,
              left: suggestionsPosition.left,
              width: suggestionsPosition.width,
            }}
          >
            {suggestions.map((entry, index) => {
              const label = formatNaicsLabel(entry);
              return (
                <li key={`${entry.code}-${entry.description}`} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    className={styles.suggestion}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectSuggestion(entry)}
                  >
                    {highlightMatch(label, value)}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div
      className={styles.autosuggest}
      ref={containerRef}
      onKeyDownCapture={handleKeyDown}
    >
      <OntarioHintText hint="Example: childcare, housing, or manufacturing" />
      <div className={styles.fieldControl}>
        <FieldErrorMessage id={errorId} message={errorMessage} />
        <div className={styles.inputClip} ref={clipRef}>
          <OntarioSearchBox
            ref={searchBoxRef}
            elementId={elementId}
            caption={{
              captionText: '\u200B',
              captionType: 'default',
            }}
            required
            value={value}
            customOnInput={handleInput}
            customOnFocus={openSuggestions}
            performSearch={async (nextValue) => {
              onChange((nextValue ?? '').trim());
              closeSuggestions();
            }}
          />
        </div>
      </div>

      {suggestionsList}
    </div>
  );
}
