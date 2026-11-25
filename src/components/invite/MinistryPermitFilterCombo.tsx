import {
  OntarioButton,
  OntarioCheckboxes,
  OntarioIconChevronDown,
  OntarioIconChevronUp,
  OntarioIconClose,
} from '@ongov/ontario-design-system-component-library-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  listPermitTypesByMinistry,
  type CdpsMinistry,
  type CdpsMinistryId,
  type CdpsPermitType,
} from '../../rbac/cdpsPermitCatalog';
import styles from './MinistryPermitFilterCombo.module.scss';

const TAG_PREVIEW_LIMIT = 10;

export type MinistryPermitFilterTag = {
  key: string;
  kind: 'permit';
  ministryId: CdpsMinistryId;
  permitTypeId: string;
  permitShortName: string;
};

type MinistryPermitFilterComboProps = {
  ministries: CdpsMinistry[];
  /** Permit selection tags (synced with create grants). */
  tags: MinistryPermitFilterTag[];
  onChange: (tags: MinistryPermitFilterTag[]) => void;
  /** Ministry-only browse filter — does not create tags. Empty = show all. */
  ministryBrowseIds?: CdpsMinistryId[];
  onMinistryBrowseChange?: (ministryIds: CdpsMinistryId[]) => void;
  /**
   * When true (V11), checking a ministry with no permit-name matches selects
   * every permit for that ministry as tags instead of browse-filtering cards.
   */
  selectAllPermitsOnMinistryCheck?: boolean;
  hintText?: string;
};

function ministryFullName(label: string) {
  return label.replace(/\s*\([^)]+\)\s*$/, '');
}

function permitTagKey(permitTypeId: string) {
  return `permit:${permitTypeId}`;
}

type MinistrySearchRow = {
  ministry: CdpsMinistry;
  matchedPermits: CdpsPermitType[];
  matchedByMinistryName: boolean;
};

/**
 * Searchable filter combo: ministries with permit match context + permit tags.
 * V10: ministry-only checks filter cards (no tags). Permit matches / card grants show tags.
 * V11: selectAllPermitsOnMinistryCheck — ministry check selects all permits as tags (no cards).
 * ODS has no multi-select combo — compose tokens + OntarioCheckboxes / icons.
 */
export function MinistryPermitFilterCombo({
  ministries,
  tags,
  onChange,
  ministryBrowseIds = [],
  onMinistryBrowseChange,
  selectAllPermitsOnMinistryCheck = false,
  hintText = 'Search by ministry or permit type. Leave empty to show all.',
}: MinistryPermitFilterComboProps) {
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [allTagsOpen, setAllTagsOpen] = useState(false);

  const browseSet = useMemo(() => new Set(ministryBrowseIds), [ministryBrowseIds]);
  const visibleTags = tags.slice(0, TAG_PREVIEW_LIMIT);
  const hiddenTagCount = Math.max(0, tags.length - TAG_PREVIEW_LIMIT);

  const ministriesWithPermitTags = useMemo(() => {
    return new Set(tags.map((tag) => tag.ministryId));
  }, [tags]);

  const searchRows = useMemo((): MinistrySearchRow[] => {
    const normalized = query.trim().toLowerCase();
    return ministries
      .map((ministry) => {
        const matchedByMinistryName =
          !normalized ||
          ministry.ministryId.toLowerCase().includes(normalized) ||
          ministry.label.toLowerCase().includes(normalized) ||
          ministryFullName(ministry.label).toLowerCase().includes(normalized);

        const matchedPermits = normalized
          ? listPermitTypesByMinistry(ministry.ministryId).filter((permit) =>
              permit.permitShortName.toLowerCase().includes(normalized),
            )
          : [];

        return { ministry, matchedPermits, matchedByMinistryName };
      })
      .filter((row) => {
        if (!normalized) {
          return true;
        }
        return row.matchedByMinistryName || row.matchedPermits.length > 0;
      });
  }, [ministries, query]);

  useEffect(() => {
    if (!open && !allTagsOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (allTagsOpen) {
        return;
      }
      const target = event.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return;
      }
      if (allTagsOpen) {
        setAllTagsOpen(false);
        return;
      }
      if (open) {
        setOpen(false);
        inputRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, allTagsOpen]);

  useEffect(() => {
    if (tags.length <= TAG_PREVIEW_LIMIT) {
      setAllTagsOpen(false);
    }
  }, [tags.length]);

  function removeTag(key: string) {
    onChange(tags.filter((tag) => tag.key !== key));
  }

  function renderTag(tag: MinistryPermitFilterTag) {
    return (
      <span className={styles.tag}>
        <span className={styles.tagLabel}>{tag.permitShortName}</span>
        <button
          type="button"
          className={styles.tagRemove}
          aria-label={`Remove ${tag.permitShortName}`}
          onClick={() => removeTag(tag.key)}
        >
          <OntarioIconClose colour="inherit" iconWidth={16} isDecorative />
        </button>
      </span>
    );
  }

  function isRowChecked(ministryId: CdpsMinistryId) {
    return browseSet.has(ministryId) || ministriesWithPermitTags.has(ministryId);
  }

  function permitsToTags(
    ministryId: CdpsMinistryId,
    permits: CdpsPermitType[],
  ): MinistryPermitFilterTag[] {
    return permits.map((permit) => ({
      key: permitTagKey(permit.permitTypeId),
      kind: 'permit' as const,
      ministryId,
      permitTypeId: permit.permitTypeId,
      permitShortName: permit.permitShortName,
    }));
  }

  function toggleMinistryRow(row: MinistrySearchRow) {
    const { ministry, matchedPermits } = row;
    const ministryId = ministry.ministryId;
    const checked = isRowChecked(ministryId);

    if (checked) {
      onMinistryBrowseChange?.(ministryBrowseIds.filter((id) => id !== ministryId));
      onChange(tags.filter((tag) => tag.ministryId !== ministryId));
      return;
    }

    // V11: checking a category always tags every permit for that ministry.
    if (selectAllPermitsOnMinistryCheck) {
      const allPermits = listPermitTypesByMinistry(ministryId);
      const withoutMinistry = tags.filter((tag) => tag.ministryId !== ministryId);
      onChange([...withoutMinistry, ...permitsToTags(ministryId, allPermits)]);
      return;
    }

    if (matchedPermits.length > 0) {
      const withoutMinistry = tags.filter((tag) => tag.ministryId !== ministryId);
      onChange([...withoutMinistry, ...permitsToTags(ministryId, matchedPermits)]);
      return;
    }

    // V10: ministry-only filters cards, does not add tags.
    if (!browseSet.has(ministryId)) {
      onMinistryBrowseChange?.([...ministryBrowseIds, ministryId]);
    }
  }

  const listboxId = `${baseId}-listbox`;
  const inputId = `${baseId}-input`;
  const hintId = `${baseId}-hint`;

  return (
    <div className={styles.root} ref={rootRef}>
      <p className={styles.hint} id={hintId}>
        {hintText}
      </p>

      {tags.length > 0 ? (
        <div className={styles.tagRow}>
          <ul className={styles.tagList} aria-label="Selected permit filters">
            {visibleTags.map((tag) => (
              <li key={tag.key}>{renderTag(tag)}</li>
            ))}
          </ul>
          {hiddenTagCount > 0 ? (
            <button
              type="button"
              className={styles.viewMore}
              onClick={() => {
                setOpen(false);
                setAllTagsOpen(true);
              }}
            >
              View more ({hiddenTagCount})
            </button>
          ) : null}
        </div>
      ) : null}

      {allTagsOpen
        ? createPortal(
            <div
              className={styles.overlay}
              role="presentation"
              onMouseDown={() => setAllTagsOpen(false)}
            >
              <div
                className={styles.panel}
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${baseId}-all-tags-title`}
                onMouseDown={(event) => event.stopPropagation()}
              >
                <div className={styles.panelHeader}>
                  <h2 className={styles.panelTitle} id={`${baseId}-all-tags-title`}>
                    Selected permits ({tags.length})
                  </h2>
                  <OntarioButton
                    type="tertiary"
                    htmlType="button"
                    onClick={() => setAllTagsOpen(false)}
                  >
                    Close
                  </OntarioButton>
                </div>
                <div className={styles.panelBody}>
                  <ul className={styles.panelTagList} aria-label="All selected permits">
                    {tags.map((tag) => (
                      <li key={tag.key}>{renderTag(tag)}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.panelActions}>
                  <OntarioButton
                    type="primary"
                    htmlType="button"
                    onClick={() => setAllTagsOpen(false)}
                  >
                    Done
                  </OntarioButton>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      <div className={styles.comboShell}>
        <div className={styles.inputRow}>
          <input
            ref={inputRef}
            id={inputId}
            className={styles.input}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-label="Filter by ministry or permit type"
            aria-describedby={hintId}
            autoComplete="off"
            placeholder="Search ministries or permit types"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
          />
          <button
            type="button"
            className={styles.toggle}
            aria-label={open ? 'Close filter list' : 'Open filter list'}
            aria-expanded={open}
            aria-controls={listboxId}
            onClick={() => {
              setOpen((current) => !current);
              inputRef.current?.focus();
            }}
          >
            {open ? (
              <OntarioIconChevronUp colour="black" isDecorative />
            ) : (
              <OntarioIconChevronDown colour="black" isDecorative />
            )}
          </button>
        </div>

        {open ? (
          <div
            id={listboxId}
            className={styles.listbox}
            role="listbox"
            aria-multiselectable="true"
            aria-label="Ministries and matching permits"
          >
            {searchRows.length === 0 ? (
              <p className={styles.empty}>No ministries or permits match this search.</p>
            ) : (
              <ul className={styles.optionList}>
                {searchRows.map((row) => {
                  const checked = isRowChecked(row.ministry.ministryId);
                  return (
                    <li key={row.ministry.ministryId} className={styles.optionRow}>
                      <OntarioCheckboxes
                        // Hide optional flag on blank caption (combo list is not a form fieldset).
                        required
                        caption={{
                          captionText: '\u200B',
                          captionType: 'default',
                        }}
                        name={`${baseId}-ministry-${row.ministry.ministryId}`}
                        value={checked ? [row.ministry.ministryId] : []}
                        options={[
                          {
                            value: row.ministry.ministryId,
                            elementId: `${baseId}-option-${row.ministry.ministryId}`,
                            label: `${row.ministry.ministryId} — ${ministryFullName(row.ministry.label)}`,
                          },
                        ]}
                        customOnChange={() => toggleMinistryRow(row)}
                      />
                      {row.matchedPermits.length > 0 ? (
                        <p className={styles.matchHint}>
                          Matches:{' '}
                          {row.matchedPermits.map((permit) => permit.permitShortName).join('; ')}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
