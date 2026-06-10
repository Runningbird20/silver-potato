export const theme = {
  background: '#0F0F0F',
  surface: '#1A1A1A',
  card: '#222222',
  text: '#F5F5F5',
  textMuted: '#888888',
  accent: '#C8FF57',
  border: '#2E2E2E',
  success: '#4ADE80',
  error: '#F87171',
} as const;

export type Theme = typeof theme;
