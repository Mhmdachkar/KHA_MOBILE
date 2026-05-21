/**
 * Standard flex/scroll contract for admin pages inside AdminLayout.
 * Parent outlet is h-full + overflow-hidden; pages must use min-h-0 on scroll regions.
 */
export const ADMIN_PAGE_ROOT =
  "h-full min-h-0 min-w-0 w-full flex flex-col overflow-hidden";

export const ADMIN_PAGE_HEADER = "shrink-0";

export const ADMIN_PAGE_SCROLL =
  "flex-1 min-h-0 overflow-y-auto overscroll-y-contain";

export const ADMIN_PAGE_TABS =
  "shrink-0 overflow-x-auto overscroll-x-contain touch-pan-x";
