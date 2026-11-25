import { useEffect } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';

export interface MobileDetectState {
  /** True for mobile phones in portrait (< 600px) OR compact touch landscape (rotated phone) */
  isMobile: boolean;
  /** True strictly for narrow portrait-width screens (< 600px / MUI sm breakpoint) */
  isSmallScreen: boolean;
  /** True when a touch/mobile-sized device is rotated into landscape orientation */
  isMobileLandscape: boolean;
  /** True when the primary input device is touch / coarse pointer */
  isTouchDevice: boolean;
}

/**
 * Shared mobile capability & viewport hook.
 * Combines MUI breakpoints with pointer/orientation media queries so mobile phones stay
 * in optimized viewing mode even when rotated from portrait to landscape.
 */
export function useMobileDetect(): MobileDetectState {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isCoarsePointer = useMediaQuery('(pointer: coarse)');
  const isCompactLandscape = useMediaQuery(
    '(max-height: 520px) and (max-width: 960px) and (orientation: landscape)'
  );
  const isLandscape = useMediaQuery('(orientation: landscape)');
  const isUnderTabletWidth = useMediaQuery('(max-width: 960px)');

  const hasMobileUa =
    typeof navigator !== 'undefined' &&
    /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const hasTouchPoints =
    typeof navigator !== 'undefined' && (navigator.maxTouchPoints || 0) > 0;

  const isTouchDevice = Boolean(isCoarsePointer || (hasMobileUa && hasTouchPoints));
  const isMobileLandscape = Boolean(
    isCompactLandscape || ((isCoarsePointer || hasMobileUa) && isLandscape && isUnderTabletWidth)
  );
  const isMobile = Boolean(isSmallScreen || isMobileLandscape);

  return {
    isMobile,
    isSmallScreen,
    isMobileLandscape,
    isTouchDevice,
  };
}

/**
 * Strictly freezes underlying page scroll and browser pull-to-refresh / overscroll
 * while a fullscreen mobile modal is open, restoring exact scroll position on close.
 */
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked || typeof window === 'undefined' || typeof document === 'undefined') return;

    const scrollY = window.scrollY || window.pageYOffset || 0;
    const html = document.documentElement;
    const body = document.body;

    const prev = {
      htmlOverflow: html.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyOverflow: body.style.overflow,
      bodyOverscroll: body.style.overscrollBehavior,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
    };

    html.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';

    return () => {
      html.style.overflow = prev.htmlOverflow;
      html.style.overscrollBehavior = prev.htmlOverscroll;
      body.style.overflow = prev.bodyOverflow;
      body.style.overscrollBehavior = prev.bodyOverscroll;
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.left = prev.bodyLeft;
      body.style.right = prev.bodyRight;
      body.style.width = prev.bodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}

export default useMobileDetect;
