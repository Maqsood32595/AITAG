import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton, Tooltip, Slider, useTheme, useMediaQuery } from '@mui/material';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import VolumeDownRoundedIcon from '@mui/icons-material/VolumeDownRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import { useMobileDetect, useBodyScrollLock } from '../../utils/useMobileDetect';

export interface HeroMediaSlotProps {
  onOverlayActiveChange?: (active: boolean) => void;
}

interface HeroMediaConfig {
  enabled: boolean;
  available: boolean;
  videoUrl: string;
  posterUrl: string | null;
  aspectRatio: number;
  label: string;
  mutedByDefault: boolean;
}

const HERO_VIDEO_MIN_KEY = 'aitag_hero_video_minimized';
const DEFAULT_ASPECT_RATIO = 1024 / 576;

const HeroMediaSlice: React.FC<HeroMediaSlotProps> = ({ onOverlayActiveChange }) => {
  const theme = useTheme();
  const { isMobile, isMobileLandscape } = useMobileDetect();
  const isBelowMd = useMediaQuery(theme.breakpoints.down('md'));
  const useCenteredMobileLayout = isMobile || isBelowMd;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const desktopContainerRef = useRef<HTMLDivElement | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userPausedRef = useRef(false);
  const savedTimeRef = useRef(0);

  const [config, setConfig] = useState<HeroMediaConfig | null>(null);
  const [hasMediaError, setHasMediaError] = useState(false);

  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && sessionStorage.getItem(HERO_VIDEO_MIN_KEY) === '1';
    } catch {
      return false;
    }
  });

  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number>(DEFAULT_ASPECT_RATIO);
  const [progress, setProgress] = useState(0);
  const [tapFeedback, setTapFeedback] = useState<'play' | 'pause' | null>(null);

  // Discover Fractal Kernel slice config safely; degrade silently if disabled/unreachable
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    fetch('/api/hero-media/config', {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) {
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.enabled !== false && data.available && data.videoUrl) {
          setConfig(data);
          if (typeof data.aspectRatio === 'number' && data.aspectRatio > 0) {
            setAspectRatio(data.aspectRatio);
          }
          setIsMuted(data.mutedByDefault !== false);
        } else {
          setConfig(null);
        }
      })
      .catch(() => {
        setConfig(null);
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const isSliceReady = Boolean(config && !hasMediaError);
  const isDesktopOverlayActive = isSliceReady && !useCenteredMobileLayout && !isMinimized;
  const isMobileOverlayActive = isSliceReady && useCenteredMobileLayout && !isMinimized;

  // Notify parent HeroSection whether the desktop overlay covers #hero-workflow-card
  useEffect(() => {
    onOverlayActiveChange?.(isDesktopOverlayActive);
    return () => {
      onOverlayActiveChange?.(false);
    };
  }, [isDesktopOverlayActive, onOverlayActiveChange]);

  // Freeze underlying scroll strictly while the mobile centered video dialog is visible
  useBodyScrollLock(isMobileOverlayActive);

  // Keep DOM muted & volume properties synced on mount and adjustments
  useEffect(() => {
    const vid = videoRef.current;
    if (vid) {
      vid.muted = isMuted;
      vid.volume = volume;
    }
  }, [isMuted, volume, isMinimized, useCenteredMobileLayout, isSliceReady]);

  const showFeedback = useCallback((state: 'play' | 'pause') => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setTapFeedback(state);
    feedbackTimerRef.current = setTimeout(() => setTapFeedback(null), 550);
  }, []);

  const handleMinimize = useCallback(() => {
    if (videoRef.current) {
      savedTimeRef.current = videoRef.current.currentTime;
      videoRef.current.pause();
    }
    setIsMuted(true);
    setIsPlaying(false);
    setIsMinimized(true);
    try {
      sessionStorage.setItem(HERO_VIDEO_MIN_KEY, '1');
    } catch {}
  }, []);

  const handleRestore = useCallback(() => {
    setIsMinimized(false);
    if (!hasEnded) {
      userPausedRef.current = false;
      setIsPlaying(true);
    }
    try {
      sessionStorage.setItem(HERO_VIDEO_MIN_KEY, '0');
    } catch {}
    if (!useCenteredMobileLayout && typeof window !== 'undefined' && window.scrollY > 140) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [useCenteredMobileLayout, hasEnded]);

  // Auto-pause desktop video when Hero scrolls out of viewport to save battery/CPU
  useEffect(() => {
    if (!isDesktopOverlayActive || !desktopContainerRef.current) return;
    const target = desktopContainerRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const vid = videoRef.current;
        if (!vid) return;
        if (!entries[0].isIntersecting) {
          vid.pause();
        } else if (!userPausedRef.current && !vid.ended) {
          vid.play().catch(() => {});
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [isDesktopOverlayActive]);

  // Escape key dismisses mobile centered floating video
  useEffect(() => {
    if (!isMobileOverlayActive) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleMinimize();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileOverlayActive, handleMinimize]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const handleReplay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    userPausedRef.current = false;
    savedTimeRef.current = 0;
    vid.currentTime = 0;
    setHasEnded(false);
    setProgress(0);
    setIsPlaying(true);
    vid.play().catch(() => {});
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;

    if (hasEnded || vid.ended) {
      handleReplay();
      return;
    }

    if (vid.paused) {
      userPausedRef.current = false;
      vid.play().catch(() => {});
      setIsPlaying(true);
      showFeedback('play');
    } else {
      userPausedRef.current = true;
      vid.pause();
      setIsPlaying(false);
      showFeedback('pause');
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    const nextVol = !nextMuted && volume === 0 ? 0.5 : volume;
    if (nextVol !== volume) setVolume(nextVol);
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.volume = nextVol;
      videoRef.current.muted = nextMuted;
    }
  };

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    const val = Array.isArray(newValue) ? newValue[0] : newValue;
    const clamped = Math.max(0, Math.min(1, val));
    setVolume(clamped);
    const shouldMute = clamped === 0;
    setIsMuted(shouldMute);
    if (videoRef.current) {
      videoRef.current.volume = clamped;
      videoRef.current.muted = shouldMute;
    }
  };

  const handleMinimizeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMinimize();
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const vid = e.currentTarget;
    if (vid.videoWidth > 0 && vid.videoHeight > 0) {
      setAspectRatio(vid.videoWidth / vid.videoHeight);
    }
    vid.volume = volume;
    vid.muted = isMuted;
    if (hasEnded && vid.duration > 0) {
      vid.currentTime = vid.duration;
    } else if (savedTimeRef.current > 0 && savedTimeRef.current < vid.duration) {
      vid.currentTime = savedTimeRef.current;
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const vid = e.currentTarget;
    savedTimeRef.current = vid.currentTime;
    if (vid.duration > 0) {
      setProgress((vid.currentTime / vid.duration) * 100);
    }
  };

  const handleVideoEnded = () => {
    userPausedRef.current = true;
    setHasEnded(true);
    setIsPlaying(false);
    setProgress(100);
  };

  // Graceful no-op when backend slice is disabled, offline, or asset failed
  if (!config || hasMediaError) {
    return null;
  }

  const renderPlayerCard = () => (
    <Box
      onClick={handleTogglePlay}
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: `${aspectRatio}`,
        borderRadius: '18px',
        overflow: 'hidden',
        bgcolor: '#000000',
        cursor: 'pointer',
        boxShadow:
          '0 24px 60px -12px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.22)',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease',
        '&:hover': {
          boxShadow:
            '0 28px 68px -12px rgba(79, 70, 229, 0.36), 0 0 0 1px rgba(129, 140, 248, 0.45)',
        },
      }}
    >
      <video
        ref={videoRef}
        src={config.videoUrl}
        poster={config.posterUrl || undefined}
        autoPlay={!hasEnded}
        muted={isMuted}
        playsInline
        preload="auto"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => {
          setHasEnded(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={handleVideoEnded}
        onError={() => setHasMediaError(true)}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          aspectRatio: `${aspectRatio}`,
          objectFit: 'contain',
          backgroundColor: '#000000',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          background:
            'linear-gradient(180deg, rgba(2, 6, 23, 0.72) 0%, rgba(2, 6, 23, 0.24) 60%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          right: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          zIndex: 3,
          pointerEvents: 'none',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.2,
            py: 0.45,
            borderRadius: '20px',
            bgcolor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
          }}
        >
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: '#22c55e',
              boxShadow: '0 0 8px #22c55e',
            }}
          />
          <Typography
            sx={{
              color: '#f8fafc',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.2px',
              lineHeight: 1,
            }}
          >
            {config.label || 'AITAG Intro'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, pointerEvents: 'auto' }}>
          {/* Compact Mute + Volume Level Control */}
          <Box
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.65,
              px: 0.85,
              pr: 1.25,
              height: 30,
              borderRadius: '20px',
              bgcolor: isMuted ? 'rgba(15, 23, 42, 0.72)' : 'rgba(79, 70, 229, 0.88)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              transition: 'background-color 0.2s ease',
            }}
          >
            <Tooltip title={isMuted ? 'Unmute sound' : 'Mute sound'} arrow>
              <IconButton
                size="small"
                onClick={handleToggleMute}
                aria-label={isMuted ? 'Unmute hero video' : 'Mute hero video'}
                sx={{
                  p: 0.25,
                  color: '#ffffff',
                }}
              >
                {isMuted || volume === 0 ? (
                  <VolumeOffRoundedIcon sx={{ fontSize: 16 }} />
                ) : volume < 0.5 ? (
                  <VolumeDownRoundedIcon sx={{ fontSize: 16 }} />
                ) : (
                  <VolumeUpRoundedIcon sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </Tooltip>
            <Slider
              size="small"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              aria-label="Adjust hero video volume"
              sx={{
                width: { xs: 48, sm: 62 },
                color: '#ffffff',
                py: 0,
                '& .MuiSlider-thumb': {
                  width: 11,
                  height: 11,
                  bgcolor: '#ffffff',
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0 0 0 5px rgba(255,255,255,0.22)',
                  },
                },
                '& .MuiSlider-rail': {
                  opacity: 0.35,
                },
              }}
            />
          </Box>

          <Box
            component="button"
            type="button"
            onClick={handleMinimizeClick}
            aria-label="Minimize hero video"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.45,
              px: 1.15,
              py: 0.5,
              height: 30,
              borderRadius: '20px',
              bgcolor: 'rgba(15, 23, 42, 0.74)',
              color: '#ffffff',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.24)',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.7rem',
              fontWeight: 700,
              lineHeight: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(15, 23, 42, 0.94)',
                borderColor: 'rgba(255, 255, 255, 0.45)',
              },
            }}
          >
            <RemoveRoundedIcon sx={{ fontSize: 15 }} />
            <span>Minimize</span>
          </Box>
        </Box>
      </Box>

      {hasEnded ? (
        <Box
          component="button"
          type="button"
          onClick={handleReplay}
          aria-label="Watch AITAG intro again"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.8,
            px: 2.2,
            py: 1,
            borderRadius: '28px',
            bgcolor: 'rgba(15, 23, 42, 0.86)',
            color: '#ffffff',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.28)',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.35)',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.82rem',
            fontWeight: 800,
            zIndex: 3,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: '#4f46e5',
              transform: 'translate(-50%, -50%) scale(1.04)',
            },
          }}
        >
          <ReplayRoundedIcon sx={{ fontSize: 19 }} />
          <span>Watch Again</span>
        </Box>
      ) : (
        (!isPlaying || tapFeedback) && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 52,
              height: 52,
              borderRadius: '50%',
              bgcolor: 'rgba(15, 23, 42, 0.72)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          >
            {(!isPlaying && tapFeedback !== 'play') || tapFeedback === 'pause' ? (
              <PlayArrowRoundedIcon sx={{ fontSize: 30, ml: 0.3 }} />
            ) : (
              <PauseRoundedIcon sx={{ fontSize: 28 }} />
            )}
          </Box>
        )
      )}

      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 3,
          bgcolor: 'rgba(255, 255, 255, 0.2)',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      >
        <Box
          sx={{
            width: `${Math.min(100, Math.max(0, progress))}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)',
            transition: 'width 0.2s linear',
          }}
        />
      </Box>
    </Box>
  );

  // Minimized pill (shared across Desktop/Windows & Mobile)
  if (isMinimized) {
    return (
      <Box
        role="button"
        tabIndex={0}
        aria-label="Open AITAG intro video"
        onClick={handleRestore}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleRestore();
          }
        }}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, md: 24 },
          right: { xs: 16, md: 24 },
          zIndex: 1250,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1.25,
          p: 0.75,
          pr: 1.75,
          borderRadius: '50px',
          bgcolor: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(99, 102, 241, 0.45)',
          boxShadow: '0 14px 36px rgba(15, 23, 42, 0.32)',
          cursor: 'pointer',
          color: '#ffffff',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            transform: 'translateY(-3px)',
            borderColor: '#818cf8',
            boxShadow: '0 18px 42px rgba(79, 70, 229, 0.36)',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: 52,
            aspectRatio: `${aspectRatio}`,
            borderRadius: '20px',
            overflow: 'hidden',
            flexShrink: 0,
            bgcolor: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {config.posterUrl && (
            <Box
              component="img"
              src={config.posterUrl}
              alt="Watch AITAG video"
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(15, 23, 42, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlayArrowRoundedIcon sx={{ fontSize: 16, color: '#ffffff' }} />
          </Box>
        </Box>

        <Box sx={{ textAlign: 'left', lineHeight: 1.15 }}>
          <Typography
            sx={{
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#ffffff',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.2,
            }}
          >
            Watch AITAG
          </Typography>
          <Typography
            sx={{
              fontSize: '0.66rem',
              color: '#94a3b8',
              fontWeight: 500,
              lineHeight: 1.2,
            }}
          >
            Tap to open video
          </Typography>
        </Box>

        <OpenInFullRoundedIcon sx={{ fontSize: 15, color: '#818cf8', ml: 0.25 }} />
      </Box>
    );
  }

  // Mobile / stacked viewport: centered floating hero overlay
  if (useCenteredMobileLayout) {
    const mobileWidth = isMobileLandscape
      ? `min(92vw, calc((100dvh - 88px) * ${aspectRatio}))`
      : 'min(92vw, 520px)';

    return (
      <Box
        onClick={handleMinimize}
        role="dialog"
        aria-modal="true"
        aria-label="AITAG intro floating video"
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 1300,
          bgcolor: 'rgba(15, 23, 42, 0.56)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 1.5,
          pt: 'calc(56px + env(safe-area-inset-top, 0px))',
          pb: 2,
          touchAction: 'none',
        }}
      >
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            width: mobileWidth,
            maxWidth: '100%',
            animation: 'fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {renderPlayerCard()}
          <Typography
            onClick={handleMinimize}
            sx={{
              mt: 1.25,
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.82)',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            Tap outside or Minimize to continue browsing
          </Typography>
        </Box>
      </Box>
    );
  }

  // Desktop / Windows: floats centered over #hero-workflow-card at exact native ratio
  return (
    <Box
      ref={desktopContainerRef}
      sx={{
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        transform: 'translateY(-50%)',
        zIndex: 10,
      }}
    >
      {renderPlayerCard()}
    </Box>
  );
};

export default HeroMediaSlice;
