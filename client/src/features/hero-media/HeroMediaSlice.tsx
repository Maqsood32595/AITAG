import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton, Tooltip, Slider, Paper, Grid } from '@mui/material';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import VolumeDownRoundedIcon from '@mui/icons-material/VolumeDownRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';

export interface HeroMediaSlotProps {
  onOverlayActiveChange?: (active: boolean) => void;
  fallback?: React.ReactNode;
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

const DEFAULT_ASPECT_RATIO = 1024 / 576;

const INITIAL_HERO_CONFIG: HeroMediaConfig = {
  enabled: true,
  available: true,
  videoUrl: '/hero-floating-video.mp4',
  posterUrl: '/hero-floating-poster.webp',
  aspectRatio: DEFAULT_ASPECT_RATIO,
  label: 'AITAG Intro',
  mutedByDefault: false,
};

const HERO_HIGHLIGHTS = [
  {
    title: 'Starts at ₹499',
    subtitle: 'clear flat pricing',
    color: '#059669',
    bgcolor: '#ecfdf5',
    borderColor: '#d1fae5',
  },
  {
    title: '24–48 hrs',
    subtitle: 'fast turnaround',
    color: '#2563eb',
    bgcolor: '#eff6ff',
    borderColor: '#dbeafe',
  },
  {
    title: 'Safe escrow',
    subtitle: 'pay on approval',
    color: '#7c3aed',
    bgcolor: '#faf5ff',
    borderColor: '#f3e8ff',
  },
];

const HeroMediaSlice: React.FC<HeroMediaSlotProps> = ({
  onOverlayActiveChange,
  fallback = null,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const inlineContainerRef = useRef<HTMLDivElement | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userPausedRef = useRef(true);
  const hasStartedRef = useRef(false);
  const savedTimeRef = useRef(0);

  const [config, setConfig] = useState<HeroMediaConfig | null>(INITIAL_HERO_CONFIG);
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [hasMediaError, setHasMediaError] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number>(DEFAULT_ASPECT_RATIO);
  const [progress, setProgress] = useState(0);
  const [tapFeedback, setTapFeedback] = useState<'play' | 'pause' | null>(null);

  // Discover Fractal Kernel slice config safely; degrade silently if disabled/unreachable
  useEffect(() => {
    let isActive = true;
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
        if (!isActive) return;
        if (data && data.enabled !== false && data.available && data.videoUrl) {
          setConfig(data);
          if (typeof data.aspectRatio === 'number' && data.aspectRatio > 0) {
            setAspectRatio(data.aspectRatio);
          }
          setIsMuted(data.mutedByDefault === true);
        } else {
          setConfig(null);
        }
      })
      .catch(() => {
        if (isActive) setConfig(null);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        if (isActive) setIsConfigLoading(false);
      });

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const isSliceReady = Boolean(config && !hasMediaError);

  // Inline fixed layout renders without covering sibling content on mobile or desktop
  useEffect(() => {
    onOverlayActiveChange?.(false);
  }, [isSliceReady, onOverlayActiveChange]);

  // Keep DOM muted & volume properties synced on mount and adjustments
  useEffect(() => {
    const vid = videoRef.current;
    if (vid) {
      vid.muted = isMuted;
      vid.volume = volume;
    }
  }, [isMuted, volume, isSliceReady]);

  const showFeedback = useCallback((state: 'play' | 'pause') => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setTapFeedback(state);
    feedbackTimerRef.current = setTimeout(() => setTapFeedback(null), 550);
  }, []);

  // Auto-pause active video when Hero scrolls out of viewport; never auto-start unprompted
  useEffect(() => {
    if (!isSliceReady || !inlineContainerRef.current) return;
    const target = inlineContainerRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const vid = videoRef.current;
        if (!vid) return;
        if (!entries[0].isIntersecting) {
          if (!vid.paused) vid.pause();
        } else if (hasStartedRef.current && !userPausedRef.current && !vid.ended) {
          vid.play().catch(() => {});
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [isSliceReady]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const handleReplay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    hasStartedRef.current = true;
    userPausedRef.current = false;
    savedTimeRef.current = 0;
    vid.currentTime = 0;
    vid.muted = isMuted;
    vid.volume = volume;
    setHasStarted(true);
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
      hasStartedRef.current = true;
      userPausedRef.current = false;
      vid.muted = isMuted;
      vid.volume = volume;
      vid.play().catch(() => {});
      setHasStarted(true);
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

  if (isConfigLoading) {
    return (
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
            aspectRatio: `${aspectRatio}`,
            borderRadius: { xs: '14px', md: '16px' },
            bgcolor: '#0f172a',
          }}
        />
        <Box sx={{ height: { xs: 88, md: 108 } }} />
      </Paper>
    );
  }

  // Graceful degrade when backend slice is disabled, offline, or asset failed
  if (!config || hasMediaError) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <Box
      ref={inlineContainerRef}
      sx={{
        position: 'relative',
        width: '100%',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#ffffff',
          borderRadius: { xs: '20px', md: '24px' },
          p: { xs: 1.15, sm: 1.5, lg: 1.75 },
          border: '1px solid rgba(79,70,229,0.14)',
          boxShadow: '0 22px 50px rgba(79,70,229,0.09)',
        }}
      >
        <Box
          onClick={handleTogglePlay}
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: `${aspectRatio}`,
            borderRadius: { xs: '14px', md: '16px' },
            overflow: 'hidden',
            bgcolor: '#000000',
            cursor: 'pointer',
            boxShadow: '0 10px 28px -8px rgba(15, 23, 42, 0.28)',
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease',
            '&:hover': {
              boxShadow: '0 14px 34px -8px rgba(79, 70, 229, 0.28)',
            },
          }}
        >
          <video
            ref={videoRef}
            src={config.videoUrl}
            poster={config.posterUrl || '/hero-floating-poster.webp'}
            muted={isMuted}
            playsInline
            preload="none"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => {
              hasStartedRef.current = true;
              setHasStarted(true);
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
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
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
                    touchAction: 'none',
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
          ) : !hasStarted && !isPlaying ? (
            <Box
              component="button"
              type="button"
              onClick={handleTogglePlay}
              aria-label="Play AITAG intro video"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 2.3,
                py: 1.05,
                borderRadius: '30px',
                bgcolor: 'rgba(15, 23, 42, 0.84)',
                color: '#ffffff',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 14px 34px rgba(15, 23, 42, 0.42)',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.84rem',
                fontWeight: 800,
                zIndex: 3,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#4f46e5',
                  transform: 'translate(-50%, -50%) scale(1.05)',
                },
              }}
            >
              <PlayArrowRoundedIcon sx={{ fontSize: 22 }} />
              <span>Watch Intro</span>
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

        <Box sx={{ mt: { xs: 1.15, sm: 1.5 }, px: 0.4 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              mb: { xs: 1, sm: 1.25 },
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: '0.74rem', sm: '0.8rem', lg: '0.84rem' },
                color: '#0f172a',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              See how AITAG delivers studio-grade AI work
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '0.64rem', sm: '0.7rem' },
                fontWeight: 700,
                color: '#4f46e5',
                bgcolor: 'rgba(79,70,229,0.08)',
                px: { xs: 0.85, sm: 1 },
                py: 0.3,
                borderRadius: '12px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              No tech skills needed
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 0.75, sm: 1.2 }}>
            {HERO_HIGHLIGHTS.map((item) => (
              <Grid key={item.title} size={{ xs: 4 }}>
                <Box
                  sx={{
                    py: { xs: 0.8, sm: 1 },
                    px: { xs: 0.45, sm: 0.9 },
                    textAlign: 'center',
                    borderRadius: '12px',
                    bgcolor: item.bgcolor,
                    border: `1px solid ${item.borderColor}`,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '0.72rem', sm: '0.78rem', lg: '0.84rem' },
                      color: item.color,
                      lineHeight: 1.2,
                      mb: 0.2,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography sx={{ fontSize: { xs: '0.6rem', sm: '0.67rem' }, color: '#64748b', lineHeight: 1.2 }}>
                    {item.subtitle}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default HeroMediaSlice;
