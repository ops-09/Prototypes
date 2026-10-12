import { sideNavigationItems } from './navigation.config';

export function resolveActiveNav(pathname: string) {
  if (pathname.startsWith('/user-management')) {
    return { activeItemId: 'manage-business-profile', activeChildId: 'user-management' };
  }

  for (const item of sideNavigationItems) {
    if (item.children?.length) {
      const activeChild = item.children.find((child) => child.href === pathname);
      if (activeChild) {
        return { activeItemId: item.id, activeChildId: activeChild.id };
      }
    }

    if (item.href === pathname) {
      return { activeItemId: item.id };
    }
  }

  return { activeItemId: 'manage-business-profile', activeChildId: 'user-management' };
}
