import { OntarioSearchBox } from '@ongov/ontario-design-system-component-library-react';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import type { ProjectDefinition } from '../../rbac/types';
import styles from './ProjectSearchAutosuggest.module.scss';

const MAX_SUGGESTIONS = 8;

type ProjectSearchAutosuggestProps = {
  projects: ProjectDefinition[];
  value: string;
  onChange: (value: string) => void;
  namePrefix: string;
};

function getInputValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | null;
  return target?.value ?? '';
}

type SuggestionsPosition = {
  top: number;
  left: number;
  width: number;
};

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

  clipEl.style.setProperty('--search-input-offset', `${inputContainer.offsetTop}px`);
  clipEl.style.setProperty('--search-input-height', `${inputContainer.offsetHeight}px`);
  return true;
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
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestionsPosition, setSuggestionsPosition] = useState<SuggestionsPosition | null>(null);

  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) {
      return [];
    }

    return projects
      .filter((project) => project.label.toLowerCase().includes(query))
      .slice(0, MAX_SUGGESTIONS);
  }, [projects, value]);

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

  function selectSuggestion(label: string) {
    onChange(label);
    closeSuggestions();
  }

  function handleInput(event: globalThis.Event) {
    onChange(getInputValue(event));
    openSuggestions();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
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
      selectSuggestion(suggestions[activeIndex].label);
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
            className={styles.projectSearchSuggestions}
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
                  className={styles.projectSearchSuggestion}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(project.label)}
                >
                  {project.label}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div
      className={styles.projectSearchAutosuggest}
      ref={containerRef}
      onKeyDownCapture={handleKeyDown}
    >
      {/* ODS SearchBox includes a visible label and 6-column grid width; clip + offset below. */}
      <div className={styles.projectSearchInputClip} ref={clipRef}>
        <OntarioSearchBox
          ref={searchBoxRef}
          caption={{
            captionText: 'Search projects',
            captionType: 'default',
          }}
          elementId={`${namePrefix}-project-search`}
          value={value}
          customOnInput={handleInput}
          customOnFocus={openSuggestions}
          performSearch={async (nextValue) => {
            onChange(nextValue ?? '');
            closeSuggestions();
          }}
        />
      </div>

      {suggestionsList}
    </div>
  );
}
