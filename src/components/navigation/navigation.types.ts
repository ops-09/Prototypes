import type { ComponentType } from 'react';

export type NavIconColour = 'inherit' | 'black' | 'blue' | 'grey' | 'white';

export type NavIconProps = {
  colour?: NavIconColour;
};

export type NavChildItem = {
  id: string;
  label: string;
  href: string;
};

export type NavItem = {
  id: string;
  label: string;
  href?: string;
  icon: ComponentType<NavIconProps>;
  badgeLabel?: string;
  children?: NavChildItem[];
};
