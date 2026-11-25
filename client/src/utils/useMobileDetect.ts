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

export default useMobileDetect;
