export const motionConfig = {
  revealRootMargin: '0px 0px -8% 0px',
  revealThreshold: 0.01,
  maxDelayIndex: 5,
  delayStepMs: 92,
  mobileDelayStepMs: 48,
  countDurationMs: 820,
  magneticStrength: 7,
  revealFailsafeDelayMs: 1250
} as const;

export type RevealVariant = 'fade' | 'up' | 'down' | 'scale' | 'media' | 'line';
