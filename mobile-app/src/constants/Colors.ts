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

// Theme token guide (quick use):
// - text: main readable text, textMuted: secondary/meta, textSoft: subtle/placeholder, textInverse: text on colored/dark backgrounds.
// - surface/card/background: base layers, surfaceAlt: alternate section backgrounds.
// - border: default, borderStrong: emphasized boundaries, divider: thin separators.
// - primary/success/danger/warning/info: strong semantic intent.
// - *Soft variants: low-emphasis backgrounds for chips, alerts, badges, and info blocks.
// - disabledBg/disabledText: disabled controls, link: tappable text, overlay: modal/drawer backdrop.

export const light = {
  background: ColorPalette.gray50,
  surface: ColorPalette.white,
  surfaceAlt: ColorPalette.gray100,
  card: ColorPalette.white,

  text: ColorPalette.gray900,
  textMuted: ColorPalette.gray600,
  textSoft: ColorPalette.gray500,
  textInverse: ColorPalette.white,
  subText: ColorPalette.gray500,

  border: ColorPalette.gray200,
  borderStrong: ColorPalette.gray300,
  divider: ColorPalette.gray200,

  primary: ColorPalette.primary,
  primarySoft: '#DBEAFE',
  success: ColorPalette.success,
  successSoft: '#DCFCE7',
  danger: ColorPalette.danger,
  dangerSoft: '#FEE2E2',
  warning: ColorPalette.warning,
  warningSoft: '#FEF3C7',
  info: '#0EA5E9',
  infoSoft: '#E0F2FE',

  link: '#1D4ED8',
  disabledBg: ColorPalette.gray100,
  disabledText: ColorPalette.gray400,
  overlay: 'rgba(17, 24, 39, 0.45)',

  // scoreboard specific
  scoreBg: ColorPalette.gray100,
  highlight: '#DBEAFE', // light blue highlight
}

export const dark = {
  background: ColorPalette.gray900,
  surface: ColorPalette.gray800,
  surfaceAlt: ColorPalette.gray700,
  card: ColorPalette.gray800,

  text: ColorPalette.gray100,
  textMuted: ColorPalette.gray300,
  textSoft: ColorPalette.gray400,
  textInverse: ColorPalette.gray900,
  subText: ColorPalette.gray400,

  border: ColorPalette.gray700,
  borderStrong: ColorPalette.gray600,
  divider: ColorPalette.gray700,

  primary: '#3B82F6',
  primarySoft: '#1E3A8A',
  success: '#22C55E',
  successSoft: '#14532D',
  danger: '#F87171',
  dangerSoft: '#7F1D1D',
  warning: '#FBBF24',
  warningSoft: '#78350F',
  info: '#38BDF8',
  infoSoft: '#0C4A6E',

  link: '#60A5FA',
  disabledBg: ColorPalette.gray700,
  disabledText: ColorPalette.gray500,
  overlay: 'rgba(0, 0, 0, 0.55)',

  // scoreboard specific
  scoreBg: ColorPalette.gray800,
  highlight: '#1E3A8A', // deep blue
}

export const getTheme = (theme: 'light' | 'dark') => {
    return theme === 'light' ? light : dark
}