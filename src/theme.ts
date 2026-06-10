export const theme = {
  // Core
  background:    '#0F0F10',
  surface:       '#1A1A1C',
  surface2:      '#222225',
  border:        '#2A2A2E',
  // Silver accent scale
  silver:        '#C0C0C8',
  silverDim:     '#7A7A85',
  silverBright:  '#E8E8F0',
  // Text
  text:          '#F0F0F2',
  textSecondary: '#8A8A95',
  textTertiary:  '#55555E',
  // State
  success:       '#4CAF7D',
  danger:        '#E05C5C',
  // Legacy aliases — keeps existing components working
  card:          '#222225',
  accent:        '#C0C0C8',
  textMuted:     '#8A8A95',
  error:         '#E05C5C',
} as const;

export type Theme = typeof theme;
