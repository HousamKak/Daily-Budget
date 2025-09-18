import { paperStyles, paperTheme } from '../themes/paper-theme';

export const layoutStyles = {
  // Main app container
  appContainer: `min-h-screen w-full bg-[${paperTheme.colors.background.paper}] ${paperTheme.colors.text.primary} no-scroll-container`,

  // Header section
  header: {
    container: 'mx-auto max-w-6xl px-2 sm:px-4 pt-4 sm:pt-6 pb-3 scale-header',
    topRow: 'flex items-center justify-between flex-wrap gap-3',
    navigation: 'flex items-center gap-1 sm:gap-2',
    monthTitle: `text-lg sm:text-2xl lg:text-3xl font-bold tracking-wide drop-shadow-[0_1px_0_rgba(0,0,0,0.1)] ${paperTheme.fonts.handwriting}`,
    controls: 'flex items-center gap-1 sm:gap-3',
  },

  // Navigation buttons
  navButton: `apple-button ${paperTheme.radius.lg} ${paperTheme.effects.shadow.sm} bg-white/60 hover:bg-white/80 ${paperTheme.colors.borders.amber} h-8 w-8 sm:h-10 sm:w-10 p-0`,

  // Budget input section
  budgetInput: {
    container: `flex items-center gap-1 sm:gap-2 bg-white/80 ${paperTheme.radius.md} px-2 sm:px-3 py-1 sm:py-2 ${paperTheme.effects.shadow.sm} ${paperTheme.colors.borders.amber}`,
    input: 'h-6 sm:h-8 w-20 sm:w-28 bg-transparent border-none focus-visible:ring-0 p-0 text-right font-semibold text-sm',
    label: 'text-xs sm:text-sm opacity-70 hidden sm:inline',
  },

  // Clear month button
  clearButton: `relative ${paperTheme.colors.interactive.red} ${paperTheme.radius.lg} px-4 py-2 ${paperTheme.effects.shadow.md} ${paperTheme.animations.scale} cursor-pointer ${paperTheme.fonts.handwriting}`,

  // Summary cards
  summaryGrid: 'mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm scale-cards',

  // Main content area
  mainContent: {
    container: 'mx-auto max-w-6xl px-2 sm:px-4 pb-2 lg:pb-12 mobile-content-area lg:flex-1 scale-content',
    grid: 'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start h-full lg:h-auto',
    calendarArea: 'mobile-calendar-area lg:h-auto lg:flex lg:flex-col',
    plannerArea: 'mobile-planner-area lg:mt-0',
  },

  // Footer
  footer: {
    container: 'mx-auto max-w-6xl px-2 sm:px-4 pb-16 pt-4 hidden sm:block',
    tip: 'text-xs sm:text-sm opacity-80 flex items-center gap-1 text-left',
  },

  // Mobile tabs
  mobileTabs: {
    container: 'lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-amber-200 p-2 z-50 safe-area-inset-bottom shadow-lg',
    wrapper: 'relative bg-amber-100/50 rounded-lg p-1 max-w-md mx-auto',
    indicator: 'absolute top-1 h-10 w-1/2 bg-white shadow-sm rounded-md transition-all duration-300 ease-in-out',
    tabsContainer: 'relative flex',
    tab: 'relative z-10 flex-1 h-10 text-sm font-medium rounded-md transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2',
    tabActive: 'text-stone-900',
    tabInactive: 'text-stone-600 hover:text-stone-800',
  },

  // Notification stickers
  notifications: {
    authSticker: paperStyles.authSticker,
    authStickerWrapper: paperStyles.authStickerWrapper,
    authStickerTexture: paperStyles.authStickerTexture,
    authStickerTape: paperStyles.authStickerTape,
    betaBadge: paperStyles.betaBadge,
    betaBadgeWrapper: paperStyles.betaBadgeWrapper,
    betaBadgeTexture: paperStyles.betaBadgeTexture,
    betaBadgeTape: paperStyles.betaBadgeTape,
  },
} as const;