import {
  OntarioBadge,
  OntarioIconChevronDown,
  OntarioIconChevronRight,
  OntarioIconChevronUp,
} from '@ongov/ontario-design-system-component-library-react';
import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { sideNavigationItems } from './navigation.config';
import type { NavItem } from './navigation.types';
import styles from './SideNavigation.module.scss';

type SideNavigationProps = {
  activeItemId: string;
  activeChildId?: string;
};

type IndicatorLayout = {
  stemX: number;
  lineStartY: number;
  stemEndY: number;
  branchY: number;
  branchEndX: number;
  svgHeight: number;
  showBranch: boolean;
};

const BRANCH_END_X = 34;
const CHEVRON_LEFT_PX = 32;

const EMPTY_LAYOUT: IndicatorLayout = {
  stemX: 24,
  lineStartY: 24,
  stemEndY: 0,
  branchY: 0,
  branchEndX: BRANCH_END_X,
  svgHeight: 0,
  showBranch: false,
};

type SubMenuTreeIndicatorProps = {
  menuItemRef: RefObject<HTMLLIElement | null>;
  activeChildIndex: number;
};

function SubMenuTreeIndicator({ menuItemRef, activeChildIndex }: SubMenuTreeIndicatorProps) {
  const [layout, setLayout] = useState<IndicatorLayout>(EMPTY_LAYOUT);

  useLayoutEffect(() => {
    const menuItem = menuItemRef.current;
    if (!menuItem) {
      return;
    }

    const measure = () => {
      const menuItemRect = menuItem.getBoundingClientRect();
      const icon = menuItem.querySelector('[data-nav-icon]');
      const iconRect = icon?.getBoundingClientRect();
      const links = menuItem.querySelectorAll<HTMLElement>(`.${styles.subMenuLink}`);

      const stemX = iconRect
        ? iconRect.left + iconRect.width / 2 - menuItemRect.left
        : 24;
      const lineStartY = iconRect ? iconRect.bottom - menuItemRect.top : 24;
      const svgHeight = menuItem.offsetHeight;

      if (activeChildIndex < 0 || !links[activeChildIndex]) {
        setLayout({
          stemX,
          lineStartY,
          stemEndY: svgHeight,
          branchY: 0,
          branchEndX: BRANCH_END_X,
          svgHeight,
          showBranch: false,
        });
        return;
      }

      const activeLink = links[activeChildIndex];
      const activeLinkRect = activeLink.getBoundingClientRect();
      const branchY = activeLinkRect.top + activeLinkRect.height / 2 - menuItemRect.top;

      setLayout({
        stemX,
        lineStartY,
        stemEndY: branchY,
        branchY,
        branchEndX: BRANCH_END_X,
        svgHeight,
        showBranch: true,
      });
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(menuItem);

    return () => {
      resizeObserver.disconnect();
    };
  }, [activeChildIndex, menuItemRef]);

  if (layout.svgHeight <= 0) {
    return null;
  }

  return (
    <>
      <svg
        className={styles.subMenuTree}
        width="278"
        height={layout.svgHeight}
        viewBox={`0 0 278 ${layout.svgHeight}`}
        aria-hidden="true"
      >
        <line
          x1={layout.stemX}
          y1={layout.lineStartY}
          x2={layout.stemX}
          y2={layout.showBranch ? layout.stemEndY : layout.svgHeight}
          stroke="var(--ontario-colour-greyscale-black, #1a1a1a)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {layout.showBranch && (
          <line
            x1={layout.stemX}
            y1={layout.branchY}
            x2={layout.branchEndX}
            y2={layout.branchY}
            stroke="var(--ontario-colour-greyscale-black, #1a1a1a)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        )}
      </svg>
      {layout.showBranch && (
        <span
          className={styles.subMenuChevron}
          style={{ top: `${layout.branchY}px`, left: `${CHEVRON_LEFT_PX}px` }}
          aria-hidden="true"
        >
          <OntarioIconChevronRight colour="black" iconWidth={16} isDecorative />
        </span>
      )}
    </>
  );
}

type ExpandedMenuItemProps = {
  item: NavItem;
  isExpanded: boolean;
  isParentActive: boolean;
  activeChildIndex: number;
  activeChildId?: string;
};

function ExpandedMenuItem({
  item,
  isExpanded,
  isParentActive,
  activeChildIndex,
  activeChildId,
}: ExpandedMenuItemProps) {
  const menuItemRef = useRef<HTMLLIElement>(null);
  const Icon = item.icon;

  return (
    <li
      ref={menuItemRef}
      className={`${styles.menuItem} ${isExpanded ? styles.menuItemExpanded : ''}`}
    >
      <div
        className={`${styles.menuButton} ${isParentActive ? styles.menuButtonActive : ''}`}
        aria-current={isParentActive ? 'page' : undefined}
      >
        <span className={styles.menuIcon} data-nav-icon>
          {Icon ? <Icon colour="black" /> : null}
        </span>
        <span className={styles.menuLabel}>{item.label}</span>
      </div>

      {isExpanded && item.children && (
        <>
          <SubMenuTreeIndicator menuItemRef={menuItemRef} activeChildIndex={activeChildIndex} />
          <ul className={styles.subMenuList}>
            {item.children.map((child) => {
              const isChildActive = child.id === activeChildId;

              return (
                <li key={child.id}>
                  <Link
                    to={child.href}
                    className={`${styles.subMenuLink} ${isChildActive ? styles.subMenuLinkActive : ''}`}
                    aria-current={isChildActive ? 'page' : undefined}
                  >
                    <span className={styles.subMenuLabel}>{child.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </li>
  );
}

export function SideNavigation({ activeItemId, activeChildId }: SideNavigationProps) {
  return (
    <nav className={styles.sideNav} aria-label="Account navigation">
      <div className={styles.contextSelector}>
        <p className={styles.contextSelectorText}>Ontario Business Corporation - 48525334</p>
        <div className={styles.contextSelectorActions} aria-hidden="true">
          <OntarioIconChevronUp colour="black" />
          <OntarioIconChevronDown colour="black" />
        </div>
      </div>

      <ul className={styles.menuList}>
        {sideNavigationItems.map((item) => {
          const isParent = Boolean(item.children?.length);
          const isExpanded = isParent && item.id === activeItemId;
          const isParentActive = item.id === activeItemId && !activeChildId;

          if (isParent) {
            const activeChildIndex =
              item.children?.findIndex((child) => child.id === activeChildId) ?? -1;

            return (
              <ExpandedMenuItem
                key={item.id}
                item={item}
                isExpanded={isExpanded}
                isParentActive={isParentActive}
                activeChildIndex={activeChildIndex}
                activeChildId={activeChildId}
              />
            );
          }

          const Icon = item.icon;
          const isActive = item.id === activeItemId;

          return (
            <li key={item.id} className={styles.menuItem}>
              <Link
                to={item.href ?? '/'}
                className={`${styles.menuLink} ${isActive ? styles.menuLinkActive : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={styles.menuIcon} data-nav-icon>
                  {Icon ? <Icon colour="black" /> : null}
                </span>
                <span className={styles.menuLabel}>{item.label}</span>
                {item.badgeLabel && (
                  <span className={styles.badgeWrap}>
                    <OntarioBadge
                      colour="teal"
                      label={item.badgeLabel}
                      ariaLabelText={`${item.badgeLabel} notifications`}
                    />
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
