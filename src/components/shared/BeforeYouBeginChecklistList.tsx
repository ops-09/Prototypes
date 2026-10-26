import type { BeforeYouBeginChecklistItem } from './beforeYouBeginChecklist';

type BeforeYouBeginChecklistListProps = {
  items: readonly BeforeYouBeginChecklistItem[];
  className: string;
};

export function BeforeYouBeginChecklistList({
  items,
  className,
}: BeforeYouBeginChecklistListProps) {
  return (
    <ul className={className}>
      {items.map((item, index) => (
        <li key={item.text ?? item.linkLabel ?? index}>
          {item.text && !item.linkLabel ? (
            item.text
          ) : (
            <>
              {item.beforeLink}
              {item.linkLabel && item.linkHref ? (
                <a
                  href={item.linkHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.linkLabel}
                </a>
              ) : null}
              {item.afterLink}
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
