export const TAB_BAR_CONTENT_HEIGHT = 84;
// The lesson screen keeps Previous and Next in a fixed bottom bar; the launcher sits above it.
export const LESSON_FOOTER_CONTENT_HEIGHT = 88;
export const VELA_CHROME_GAP = 12;

export function getVelaBottomOffset({ isTabRoute, bottomInset, hasLessonFooter = false }: { isTabRoute: boolean; bottomInset: number; hasLessonFooter?: boolean }) {
  return bottomInset + (isTabRoute ? TAB_BAR_CONTENT_HEIGHT : 0) + (hasLessonFooter ? LESSON_FOOTER_CONTENT_HEIGHT : 0) + VELA_CHROME_GAP;
}

/** Routes the chat may return to. The lesson route carries its current step in the screenId query. */
export const isVelaReturnRoute = (route: string) => route === '/'
  || route === '/settings'
  || /^\/module\/[^/?]+$/.test(route)
  || /^\/module\/[^/?]+\/complete$/.test(route)
  || /^\/lesson\/[^/?]+(?:\/[^/?]+)?(?:\?[A-Za-z0-9_=&%.-]*)?$/.test(route);
