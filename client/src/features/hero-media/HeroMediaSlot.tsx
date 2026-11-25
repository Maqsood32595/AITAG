import React, { Component, Suspense, lazy, ReactNode } from 'react';
import type { HeroMediaSlotProps } from './HeroMediaSlice';

const LazyHeroMediaSlice = lazy(() => import('./HeroMediaSlice'));

interface BoundaryProps {
  children: ReactNode;
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
      return null;
    }
    return this.props.children;
  }
}

export const HeroMediaSlot: React.FC<HeroMediaSlotProps> = ({ onOverlayActiveChange }) => {
  return (
    <HeroMediaBoundary onErrorFallback={() => onOverlayActiveChange?.(false)}>
      <Suspense fallback={null}>
        <LazyHeroMediaSlice onOverlayActiveChange={onOverlayActiveChange} />
      </Suspense>
    </HeroMediaBoundary>
  );
};

export default HeroMediaSlot;
