import { OntarioSearchBox } from '@ongov/ontario-design-system-component-library-react';
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
import type { ProjectDefinition } from '../../rbac/types';
// Match forms OCN / NAICS search chrome and suggestion list.
import styles from '../form7/NaicsSearchAutosuggest.module.scss';

const MAX_SUGGESTIONS = 8;

type ProjectSearchAutosuggestProps = {
  projects: ProjectDefinition[];
  value: string;
  onChange: (value: string) => void;
  namePrefix: string;
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

function filterProjects(projects: ProjectDefinition[], query: string): ProjectDefinition[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return projects
    .filter((project) => {
      const label = project.label.toLowerCase();
      const initials = project.initials.toLowerCase();
      return label.includes(normalized) || initials.includes(normalized);
    })
    .slice(0, MAX_SUGGESTIONS);
}

export function ProjectSearchAutosuggest({
  projects,
  value,
  onChange,
  namePrefix,
}: ProjectSearchAutosuggestProps) {
  const listboxId = useId();
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

  const suggestions = useMemo(() => filterProjects(projects, value), [projects, value]);

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

    // ODS clear control is type="reset" — empties the DOM input without an `input` event.
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

  function selectSuggestion(project: ProjectDefinition) {
    onChange(project.label);
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
            aria-label="Project suggestions"
            style={{
              top: suggestionsPosition.top,
              left: suggestionsPosition.left,
              width: suggestionsPosition.width,
            }}
          >
            {suggestions.map((project, index) => (
              <li key={project.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  className={styles.suggestion}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(project)}
                >
                  {highlightMatch(project.label, value)}
                </button>
              </li>
            ))}
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
      <div className={styles.fieldControl}>
        <div className={styles.inputClip} ref={clipRef}>
          <OntarioSearchBox
            ref={searchBoxRef}
            elementId={`${namePrefix}-project-search`}
            caption={{
              captionText: '\u200B',
              captionType: 'default',
            }}
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
