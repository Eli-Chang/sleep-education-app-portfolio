export const TAB_BAR_CONTENT_HEIGHT = 84;
export const VELA_CHROME_GAP = 12;

export function getVelaBottomOffset({ isTabRoute, bottomInset }: { isTabRoute: boolean; bottomInset: number }) {
  return bottomInset + (isTabRoute ? TAB_BAR_CONTENT_HEIGHT : 0) + VELA_CHROME_GAP;
}
