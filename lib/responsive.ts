export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export function useResponsive() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < BREAKPOINTS.md
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= BREAKPOINTS.lg

  return { isMobile, isTablet, isDesktop }
}

export const TOUCH_TARGET_SIZE = 48 // 48px は推奨最小サイズ

export function getTouchSizeClass(size: 'sm' | 'md' | 'lg' = 'md'): string {
  switch (size) {
    case 'sm':
      return 'min-h-[40px] min-w-[40px]'
    case 'md':
      return 'min-h-[48px] min-w-[48px]'
    case 'lg':
      return 'min-h-[56px] min-w-[56px]'
  }
}
