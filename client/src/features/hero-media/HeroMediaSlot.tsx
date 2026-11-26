import React, { Component, Suspense, lazy, ReactNode } from 'react';
import { Box, Paper } from '@mui/material';
import type { HeroMediaSlotProps } from './HeroMediaSlice';

const LazyHeroMediaSlice = lazy(() => import('./HeroMediaSlice'));

const INLINE_SUSPENSE_PLACEHOLDER = (
  <Paper
    elevation={0}
    sx={{
      width: '100%',
      p: { xs: 1.15, sm: 1.5, lg: 1.75 },
      borderRadius: { xs: '20px', md: '24px' },
      bgcolor: '#ffffff',
      border: '1px solid rgba(79,70,229,0.14)',
      boxShadow: '0 22px 50px rgba(79,70,229,0.09)',
    }}
  >
    <Box
      sx={{
        width: '100%',
        aspectRatio: `${1024 / 576}`,
        borderRadius: { xs: '14px', md: '16px' },
        bgcolor: '#0f172a',
      }}
    />
    <Box sx={{ height: { xs: 88, md: 108 } }} />
  </Paper>
);

interface BoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onErrorFallback?: () => void;
}

interface BoundaryState {
  hasError: boolean;
}

/**
 * Fault-isolation boundary around the HeroMedia fractal slice.
 * Ensures chunk load failures or runtime issues never affect HeroSection.
 */
class HeroMediaBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.warn('⚠️ [HeroMediaSlot] Slice isolated after fault:', error?.message);
    this.props.onErrorFallback?.();
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

export const HeroMediaSlot: React.FC<HeroMediaSlotProps> = ({
  onOverlayActiveChange,
  fallback = null,
}) => {
  return (
    <HeroMediaBoundary
      fallback={fallback}
      onErrorFallback={() => onOverlayActiveChange?.(false)}
    >
      <Suspense fallback={INLINE_SUSPENSE_PLACEHOLDER}>
        <LazyHeroMediaSlice
          onOverlayActiveChange={onOverlayActiveChange}
          fallback={fallback}
        />
      </Suspense>
    </HeroMediaBoundary>
  );
};

export default HeroMediaSlot;
