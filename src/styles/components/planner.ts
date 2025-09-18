import { paperTheme } from '../themes/paper-theme';

export const plannerStyles = {
  // Main planner container
  container: `${paperTheme.colors.background.white} ${paperTheme.colors.borders.amberStrong} ${paperTheme.radius.lg} ${paperTheme.effects.shadow.sm}`,

  // Sticky header
  header: {
    container: `sticky top-0 z-10 ${paperTheme.spacing.padding.compact} ${paperTheme.colors.borders.amberStrong} ${paperTheme.colors.background.white} backdrop-blur-sm`,
    titleRow: 'flex items-center gap-2 mb-2',
    title: `font-bold text-lg ${paperTheme.fonts.handwriting}`,
    tabsContainer: 'relative bg-amber-100/50 rounded-lg p-1',
    indicator: 'absolute top-1 h-8 rounded-md bg-white shadow-sm transition-all duration-300 ease-in-out',
    tabsWrapper: 'relative flex',
    tab: `relative z-10 flex-1 h-8 text-sm font-medium rounded-md transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${paperTheme.fonts.handwriting}`,
    tabActive: 'text-stone-900',
    tabInactive: 'text-stone-600 hover:text-stone-800',
  },

  // Content sections
  content: {
    container: 'px-3 pb-3 space-y-4',
    weekSection: 'space-y-3',
    weekHeader: `flex items-center justify-between ${paperTheme.spacing.margin.compact}`,
    weekTitle: `text-base font-bold ${paperTheme.colors.text.secondary} ${paperTheme.fonts.handwriting}`,
    weekBadge: `px-2 py-1 ${paperTheme.radius.sm} text-xs font-medium`,
    currentWeek: 'bg-amber-200/80 text-amber-800',
    otherWeek: 'bg-stone-100 text-stone-600',
  },

  // Two-column layout for week view
  weekLayout: {
    container: 'grid grid-cols-1 lg:grid-cols-2 gap-4',
    leftColumn: 'space-y-3',
    rightColumn: 'space-y-3',
    columnHeader: `text-sm font-semibold ${paperTheme.colors.text.muted} uppercase tracking-wide mb-2 ${paperTheme.fonts.handwriting}`,
  },

  // Add form
  addForm: {
    container: `${paperTheme.colors.background.whiteTransparent} ${paperTheme.radius.md} ${paperTheme.spacing.padding.dialog} ${paperTheme.colors.borders.amber} space-y-3`,
    title: `text-sm font-semibold ${paperTheme.colors.text.secondary} mb-2 ${paperTheme.fonts.handwriting}`,
    row: 'flex gap-2',
    column: 'flex-1',
    inputGroup: 'space-y-1',
    label: `text-xs font-medium ${paperTheme.colors.text.secondary}`,
    input: `w-full px-2 py-1.5 text-sm ${paperTheme.radius.sm} ${paperTheme.colors.borders.amber} bg-white/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-200`,
    select: `w-full px-2 py-1.5 text-sm ${paperTheme.radius.sm} ${paperTheme.colors.borders.amber} bg-white/80`,
    datePickerWrapper: 'relative',
    dateInput: `w-full px-2 py-1.5 text-sm ${paperTheme.radius.sm} ${paperTheme.colors.borders.amber} bg-white/80`,
    calendarIcon: `absolute inset-0 w-9 h-9 ${paperTheme.colors.background.cardGradient} ${paperTheme.colors.borders.paper} ${paperTheme.radius.md} ${paperTheme.effects.shadow.sm} ${paperTheme.animations.hover} flex items-center justify-center pointer-events-none`,
    addButton: `${paperTheme.radius.md} ${paperTheme.colors.interactive.amber} ${paperTheme.effects.shadow.sm} ${paperTheme.animations.hover} px-2 cursor-pointer h-9 w-9`,
  },

  // Plan items
  planItem: {
    container: `flex items-center justify-between ${paperTheme.radius.md} border border-stone-200 bg-white px-2 py-1.5 mt-1 ${paperTheme.animations.hover}`,
    content: 'min-w-0 flex-1',
    amount: 'text-sm font-semibold',
    category: 'ml-1 text-xs text-stone-500',
    note: 'text-xs text-stone-500 truncate',
    actions: 'flex gap-1',
    button: `h-7 cursor-pointer ${paperTheme.effects.shadow.sm}`,
    markPaidButton: `h-7 cursor-pointer`,
    deleteButton: 'h-7 w-7 hover:bg-red-50 cursor-pointer',
    moveButton: 'h-7 w-7 hover:bg-blue-50 cursor-pointer',
  },

  // Empty states
  empty: {
    container: `text-center py-8 ${paperTheme.colors.text.muted}`,
    icon: 'text-4xl mb-2',
    title: `text-lg font-semibold mb-1 ${paperTheme.fonts.handwriting}`,
    subtitle: `text-sm ${paperTheme.fonts.handwriting}`,
  },

  // Scrollable content
  scrollable: 'max-h-64 overflow-y-auto space-y-2',
} as const;