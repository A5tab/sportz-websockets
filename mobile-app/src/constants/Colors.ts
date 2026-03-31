export const ColorPalette = {
  primary: '#2563EB',      // blue (main brand)
  success: '#22C55E',      // green (score up / win)
  danger: '#EF4444',       // red (wicket / loss)
  warning: '#F59E0B',      // yellow (alerts)
  
  // neutrals
  white: '#FFFFFF',
  black: '#000000',

  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
}

export const light = {
  background: ColorPalette.gray50,
  card: ColorPalette.white,
  text: ColorPalette.gray900,
  subText: ColorPalette.gray500,
  border: ColorPalette.gray200,

  primary: ColorPalette.primary,
  success: ColorPalette.success,
  danger: ColorPalette.danger,
  warning: ColorPalette.warning,

  // scoreboard specific
  scoreBg: ColorPalette.gray100,
  highlight: '#DBEAFE', // light blue highlight
}

export const dark = {
  background: ColorPalette.gray900,
  card: ColorPalette.gray800,
  text: ColorPalette.gray100,
  subText: ColorPalette.gray400,
  border: ColorPalette.gray700,

  primary: '#3B82F6',
  success: '#22C55E',
  danger: '#F87171',
  warning: '#FBBF24',

  // scoreboard specific
  scoreBg: ColorPalette.gray800,
  highlight: '#1E3A8A', // deep blue
}

export const getTheme = (theme: 'light' | 'dark') => {
    return theme === 'light' ? light : dark
}