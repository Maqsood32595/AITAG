import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton, Slider, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import { useMobileDetect } from '../utils/useMobileDetect';

interface UniversalVideoPlayerProps {
  url?: string;
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  mediaType?: 'video' | 'image';
  aspectRatio?: string;
  maxHeight?: number | string;
  fillHeight?: boolean;
  enableDoubleTapSeek?: boolean;
  defaultObjectFit?: 'contain' | 'cover';
  soundPillTop?: number | string;
  onMutedChange?: (muted: boolean) => void;
  reelsOverlay?: React.ReactNode;
}

export function parseVideoSource(rawUrl?: string, explicitMediaType?: string) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { type: 'none', embedUrl: '', rawUrl: '', isImage: false, isShort: false };
  }

  const trimmed = rawUrl.trim();

  // Check if Image (or explicit image mediaType)
  const isImageFile = /\.(jpe?g|png|webp|svg|gif|avif)(\?.*)?$/i.test(trimmed);
  if (explicitMediaType === 'image' || isImageFile) {
    let streamUrl = trimmed;
    if (streamUrl.startsWith('/api')) {
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const isPort8000 = typeof window !== 'undefined' && window.location.port === '8000';
      const base = isLocal ? (isPort8000 ? '' : 'http://localhost:5005') : '';
      streamUrl = `${base}${streamUrl}`;
    }
    return {
      type: 'image',
      embedUrl: streamUrl,
      rawUrl: trimmed,
      isImage: true,
      isShort: false
    };
  }

  // YouTube detection: watch, youtu.be, shorts, embed
  const isShort = /youtube\.com\/shorts\//i.test(trimmed);
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&playsinline=1`,
      rawUrl: trimmed,
      isImage: false,
      isShort
    };
  }

  // Loom detection: loom.com/share/ID, loom.com/embed/ID
  const loomMatch = trimmed.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/i);
  if (loomMatch && loomMatch[1]) {
    const videoId = loomMatch[1];
    return {
      type: 'loom',
      videoId,
      embedUrl: `https://www.loom.com/embed/${videoId}?hide_owner=true&hide_share=true&hide_title=true`,
      rawUrl: trimmed,
      isImage: false,
      isShort: false
    };
  }

  // Direct MP4 / GCS Stream
  let streamUrl = trimmed;
  if (streamUrl.startsWith('/api')) {
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const isPort8000 = typeof window !== 'undefined' && window.location.port === '8000';
    const base = isLocal ? (isPort8000 ? '' : 'http://localhost:5005') : '';
    streamUrl = `${base}${streamUrl}`;
  }

  return {
    type: 'direct',
    embedUrl: streamUrl,
    rawUrl: trimmed,
    isImage: false,
    isShort: false
  };
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const UniversalVideoPlayer: React.FC<UniversalVideoPlayerProps> = ({
  url,
  title,
  autoPlay = false,
  muted = true,
  loop = true,
  controls = true,
  mediaType,
  maxHeight = 520,
  fillHeight = false,
  enableDoubleTapSeek = true,
  defaultObjectFit = 'contain',
  soundPillTop = 12,
  onMutedChange,
  reelsOverlay
}) => {
  const { isMobile } = useMobileDetect();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seekFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const singleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<{ time: number; zone: 'left' | 'right' | 'center' }>({ time: 0, zone: 'center' });
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const ignoreNextClickRef = useRef<boolean>(false);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [localMuted, setLocalMuted] = useState(muted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>(defaultObjectFit);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [centerFeedback, setCenterFeedback] = useState<'play' | 'pause' | null>(null);
  const [seekFeedback, setSeekFeedback] = useState<{ dir: 'back' | 'forward'; count: number } | null>(null);

  // Sync external muted prop -> local video
  useEffect(() => {
    setLocalMuted(muted);
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  // Reset playback states when URL changes
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(autoPlay);
    setIsPortrait(false);
    setFitMode(defaultObjectFit);
    setControlsVisible(true);
    setSeekFeedback(null);
  }, [url, autoPlay, defaultObjectFit]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
      if (seekFeedbackTimer.current) clearTimeout(seekFeedbackTimer.current);
      if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
    };
  }, []);

  // Auto-hide controls while playing on touch/desktop (YouTube UX)
  const scheduleHideControls = useCallback(() => {
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    setControlsVisible(true);
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => {
        setControlsVisible(false);
      }, 2600);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
      setControlsVisible(true);
    } else {
      scheduleHideControls();
    }
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, [isPlaying, scheduleHideControls]);

  // Track native fullscreen changes across browsers including iOS Safari <video>
  useEffect(() => {
    const onFsChange = () => {
      const fsEl = document.fullscreenElement || (document as any).webkitFullscreenElement;
      setIsFullscreen(Boolean(fsEl && (fsEl === containerRef.current || fsEl === videoRef.current)));
    };
    const vid = videoRef.current;
    const onIosFsBegin = () => setIsFullscreen(true);
    const onIosFsEnd = () => setIsFullscreen(false);

    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    vid?.addEventListener('webkitbeginfullscreen', onIosFsBegin);
    vid?.addEventListener('webkitendfullscreen', onIosFsEnd);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      vid?.removeEventListener('webkitbeginfullscreen', onIosFsBegin);
      vid?.removeEventListener('webkitendfullscreen', onIosFsEnd);
    };
  }, [url]);

  if (!url) {
    return (
      <Box
        sx={{
          width: '100%',
          height: fillHeight ? '100%' : 260,
          bgcolor: '#0f172a',
          borderRadius: fillHeight ? 0 : 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8'
        }}
      >
        <Typography variant="body2">No work sample or reel configured</Typography>
      </Box>
    );
  }

  const parsed = parseVideoSource(url, mediaType);

  // Picture / Image Reel
  if (parsed.type === 'image') {
    return (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: fillHeight ? '100%' : 'auto',
          maxHeight: fillHeight ? '100%' : maxHeight,
          borderRadius: fillHeight ? 0 : 2,
          overflow: 'hidden',
          bgcolor: '#090d16',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: fillHeight ? 0 : 1
        }}
      >
        <img
          src={parsed.embedUrl}
          alt={title || 'Work Reel Visual Showcase'}
          style={{
            width: fillHeight ? '100%' : undefined,
            height: fillHeight ? '100%' : undefined,
            maxWidth: '100%',
            maxHeight: fillHeight ? '100%' : (typeof maxHeight === 'number' ? maxHeight - 16 : maxHeight),
            objectFit: 'contain',
            borderRadius: fillHeight ? 0 : '8px',
            display: 'block'
          }}
          loading="lazy"
        />
        {reelsOverlay && (
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 12, pointerEvents: 'none' }}>
            {reelsOverlay}
          </Box>
        )}
      </Box>
    );
  }

  if (parsed.type === 'youtube') {
    return (
      <Box
        sx={{
          position: 'relative',
          width: parsed.isShort ? 'auto' : '100%',
          maxWidth: '100%',
          height: fillHeight ? '100%' : undefined,
          aspectRatio: parsed.isShort ? '9 / 16' : '16 / 9',
          mx: 'auto',
          borderRadius: fillHeight ? 0 : 2,
          overflow: 'hidden',
          bgcolor: '#000',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
        }}
      >
        <iframe
          src={parsed.embedUrl}
          title={title || 'YouTube Video Case Study'}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </Box>
    );
  }

  if (parsed.type === 'loom') {
    return (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: fillHeight ? undefined : '56.25%',
          height: fillHeight ? '100%' : undefined,
          borderRadius: fillHeight ? 0 : 2,
          overflow: 'hidden',
          bgcolor: '#000',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
        }}
      >
        <iframe
          src={parsed.embedUrl}
          title={title || 'Loom Video Case Study'}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </Box>
    );
  }

  const triggerFeedback = (kind: 'play' | 'pause') => {
    setCenterFeedback(kind);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setCenterFeedback(null), 550);
  };

  const seekBySeconds = (delta: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    const totalDur = vid.duration || duration || 0;
    const nextTime = Math.max(0, Math.min(totalDur || vid.currentTime + delta, vid.currentTime + delta));
    vid.currentTime = nextTime;
    setCurrentTime(nextTime);

    const dir: 'back' | 'forward' = delta < 0 ? 'back' : 'forward';
    setSeekFeedback(prev => ({
      dir,
      count: prev && prev.dir === dir ? prev.count + Math.abs(delta) : Math.abs(delta)
    }));
    if (seekFeedbackTimer.current) clearTimeout(seekFeedbackTimer.current);
    seekFeedbackTimer.current = setTimeout(() => setSeekFeedback(null), 650);
    scheduleHideControls();
  };

  const togglePlayPause = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused || vid.ended) {
      vid.play().catch(() => {});
      setIsPlaying(true);
      triggerFeedback('play');
    } else {
      vid.pause();
      setIsPlaying(false);
      triggerFeedback('pause');
    }
    scheduleHideControls();
  };

  const toggleMute = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    const vid = videoRef.current;
    const nextMuted = !localMuted;
    setLocalMuted(nextMuted);
    if (vid) vid.muted = nextMuted;
    onMutedChange?.(nextMuted);
    scheduleHideControls();
  };

  const handleSeek = (_: Event, val: number | number[]) => {
    const newTime = Array.isArray(val) ? val[0] : val;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
    scheduleHideControls();
  };

  const handleToggleFullscreen = async (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    const container = containerRef.current as any;
    const vid = videoRef.current as any;

    try {
      const activeFs = document.fullscreenElement || (document as any).webkitFullscreenElement;
      if (activeFs) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
        return;
      }

      if (container?.requestFullscreen) {
        await container.requestFullscreen();
      } else if (container?.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (vid?.webkitEnterFullscreen) {
        // iOS Safari native fullscreen fallback for <video>
        vid.webkitEnterFullscreen();
      }
    } catch {
      if (vid?.webkitEnterFullscreen) {
        try {
          vid.webkitEnterFullscreen();
        } catch {
          // ignore
        }
      }
    }
    scheduleHideControls();
  };

  const handleStageTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      ignoreNextClickRef.current = false;
    }
  };

  const handleStageTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPosRef.current || e.changedTouches.length === 0) return;
    const dx = Math.abs(e.changedTouches[0].clientX - touchStartPosRef.current.x);
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartPosRef.current.y);
    if (dx > 16 || dy > 16) {
      // Finger scrolled or swiped — skip tap playback toggle
      ignoreNextClickRef.current = true;
    }
    touchStartPosRef.current = null;
  };

  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!controls) return;
    if (ignoreNextClickRef.current) {
      ignoreNextClickRef.current = false;
      return;
    }

    if (!enableDoubleTapSeek || !containerRef.current || duration <= 0) {
      togglePlayPause(e);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const relX = rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0.5;
    const zone: 'left' | 'right' | 'center' = relX < 0.34 ? 'left' : relX > 0.66 ? 'right' : 'center';
    const now = Date.now();

    if (zone !== 'center' && lastTapRef.current.zone === zone && now - lastTapRef.current.time < 270) {
      if (singleTapTimer.current) {
        clearTimeout(singleTapTimer.current);
        singleTapTimer.current = null;
      }
      lastTapRef.current = { time: 0, zone: 'center' };
      seekBySeconds(zone === 'left' ? -5 : 5);
      return;
    }

    lastTapRef.current = { time: now, zone };

    if (zone === 'center') {
      togglePlayPause(e);
    } else {
      if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
      singleTapTimer.current = setTimeout(() => {
        togglePlayPause();
        singleTapTimer.current = null;
      }, 240);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!controls) return;
    const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    if (e.key === ' ' || e.key.toLowerCase() === 'k') {
      e.preventDefault();
      togglePlayPause();
    } else if (e.key.toLowerCase() === 'm') {
      e.preventDefault();
      toggleMute();
    } else if (e.key.toLowerCase() === 'f') {
      e.preventDefault();
      handleToggleFullscreen();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      seekBySeconds(-5);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      seekBySeconds(5);
    }
  };

  // Direct MP4 / GCS Stream (YouTube-style Custom Player)
  return (
    <Box
      ref={containerRef}
      tabIndex={controls ? 0 : undefined}
      onKeyDown={handleKeyDown}
      onMouseMove={scheduleHideControls}
      onMouseLeave={() => {
        if (isPlaying) setControlsVisible(false);
      }}
      onTouchStart={handleStageTouchStart}
      onTouchEnd={handleStageTouchEnd}
      onClick={handleStageClick}
      sx={{
        position: 'relative',
        width: '100%',
        height: isFullscreen ? '100dvh' : (fillHeight ? '100%' : 'auto'),
        maxHeight: isFullscreen ? '100dvh' : (fillHeight ? '100%' : maxHeight),
        minHeight: fillHeight ? '100%' : 200,
        borderRadius: isFullscreen || fillHeight ? 0 : 2,
        overflow: 'hidden',
        outline: 'none',
        background: isPortrait
          ? 'radial-gradient(circle at center, #1e1b4b 0%, #090d16 70%, #000000 100%)'
          : '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        touchAction: fillHeight && isMobile ? 'none' : undefined,
        overscrollBehavior: fillHeight ? 'none' : undefined,
        cursor: controls ? 'pointer' : 'default',
        boxShadow: isFullscreen || fillHeight ? 'none' : '0 4px 14px rgba(0,0,0,0.12)'
      }}
    >
      <video
        ref={videoRef}
        key={parsed.embedUrl}
        playsInline
        autoPlay={autoPlay}
        muted={localMuted}
        loop={loop}
        preload="metadata"
        src={parsed.embedUrl}
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          setDuration(v.duration || 0);
          setIsPortrait(v.videoHeight > v.videoWidth);
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{
          width: '100%',
          height: isFullscreen || fillHeight ? '100%' : 'auto',
          maxHeight: isFullscreen ? '100dvh' : (fillHeight ? '100%' : maxHeight),
          display: 'block',
          objectFit: fitMode
        }}
      >
        Your browser does not support HTML5 video playback.
      </video>

      {/* Floating YouTube Shorts–Style Unmute Prompt when autoplaying muted */}
      {controls && localMuted && isPlaying && (fillHeight || isMobile) && (
        <Box
          onClick={toggleMute}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          role="button"
          tabIndex={0}
          aria-label="Tap for sound"
          sx={{
            position: 'absolute',
            top: soundPillTop,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 18,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 0.55,
            borderRadius: '20px',
            bgcolor: 'rgba(15, 23, 42, 0.78)',
            border: '1px solid rgba(255,255,255,0.22)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
            '&:hover': { bgcolor: 'rgba(30, 41, 59, 0.92)' }
          }}
        >
          <VolumeOffIcon sx={{ fontSize: 15, color: '#38bdf8' }} />
          <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>
            Tap for sound
          </Typography>
        </Box>
      )}

      {/* Double-Tap Seek Rewind / Fast-Forward Overlay (YouTube Mobile UX) */}
      {seekFeedback && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: seekFeedback.dir === 'back' ? 0 : '55%',
            right: seekFeedback.dir === 'forward' ? 0 : '55%',
            bgcolor: 'rgba(255,255,255,0.12)',
            borderRadius: seekFeedback.dir === 'back' ? '0 50% 50% 0' : '50% 0 0 50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            pointerEvents: 'none',
            zIndex: 15
          }}
        >
          {seekFeedback.dir === 'back' ? (
            <FastRewindIcon sx={{ fontSize: 30 }} />
          ) : (
            <FastForwardIcon sx={{ fontSize: 30 }} />
          )}
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, mt: 0.25 }}>
            {seekFeedback.dir === 'back' ? `-${seekFeedback.count}s` : `+${seekFeedback.count}s`}
          </Typography>
        </Box>
      )}

      {/* Center Play / Pause Animated Tap Indicator (YouTube style) */}
      {(centerFeedback || (!isPlaying && controls)) && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 58,
            height: 58,
            borderRadius: '50%',
            bgcolor: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            pointerEvents: 'none',
            zIndex: 14,
            transition: 'opacity 0.2s ease'
          }}
        >
          {centerFeedback === 'pause' ? (
            <PauseIcon sx={{ fontSize: 30 }} />
          ) : (
            <PlayArrowIcon sx={{ fontSize: 32, ml: 0.3 }} />
          )}
        </Box>
      )}

      {/* Optional Reel Caption / Badge Overlay — positioned cleanly ABOVE the bottom control bar */}
      {reelsOverlay && (
        <Box
          sx={{
            position: 'absolute',
            bottom: controls ? { xs: 56, sm: 62 } : 0,
            left: 0,
            right: 0,
            zIndex: 12,
            pointerEvents: 'none',
            transition: 'bottom 0.2s ease'
          }}
        >
          {reelsOverlay}
        </Box>
      )}

      {/* Dedicated Unobstructed YouTube-Style Control Bar */}
      {controls && (
        <Box
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            pt: 3,
            pb: isFullscreen ? 'calc(8px + env(safe-area-inset-bottom, 0px))' : { xs: 0.75, sm: 1 },
            px: { xs: 1.2, sm: 2 },
            background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 65%, transparent 100%)',
            zIndex: 20,
            opacity: controlsVisible || !isPlaying ? 1 : 0,
            transition: 'opacity 0.25s ease',
            pointerEvents: controlsVisible || !isPlaying ? 'auto' : 'none'
          }}
        >
          {/* YouTube Red Seek Progress Bar */}
          <Slider
            size="small"
            min={0}
            max={duration || 1}
            step={0.1}
            value={Math.min(currentTime, duration || 1)}
            onChange={handleSeek}
            aria-label="Seek video timeline"
            sx={{
              color: '#ff0033',
              height: 4,
              py: 1,
              mb: -0.5,
              touchAction: 'none',
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
                transition: '0.15s',
                '&:hover, &.Mui-active': {
                  width: 15,
                  height: 15,
                  boxShadow: '0 0 0 6px rgba(255, 0, 51, 0.22)'
                }
              },
              '& .MuiSlider-rail': {
                bgcolor: 'rgba(255,255,255,0.3)',
                opacity: 1
              }
            }}
          />

          {/* Bottom Controls Row: Play/Pause, Mute, Timestamp, Fit/Fill, Fullscreen */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
              <Tooltip title={isPlaying ? 'Pause (k)' : 'Play (k)'}>
                <IconButton
                  size="small"
                  onClick={togglePlayPause}
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                  sx={{ color: '#ffffff', p: 0.75, '&:hover': { bgcolor: 'rgba(255,255,255,0.14)' } }}
                >
                  {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                </IconButton>
              </Tooltip>

              <Tooltip title={localMuted ? 'Unmute (m)' : 'Mute (m)'}>
                <IconButton
                  size="small"
                  onClick={toggleMute}
                  aria-label={localMuted ? 'Unmute video' : 'Mute video'}
                  sx={{ color: '#ffffff', p: 0.75, '&:hover': { bgcolor: 'rgba(255,255,255,0.14)' } }}
                >
                  {localMuted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
                </IconButton>
              </Tooltip>

              <Typography
                sx={{
                  color: '#e2e8f0',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  ml: 0.5
                }}
              >
                {formatTime(currentTime)} / {formatTime(duration)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {fillHeight && (
                <Tooltip title={fitMode === 'contain' ? 'Fill Screen' : 'Fit Video'}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFitMode(prev => (prev === 'contain' ? 'cover' : 'contain'));
                      scheduleHideControls();
                    }}
                    aria-label={fitMode === 'contain' ? 'Fill screen' : 'Fit video'}
                    sx={{
                      color: fitMode === 'cover' ? '#38bdf8' : '#ffffff',
                      p: 0.75,
                      bgcolor: 'rgba(255,255,255,0.08)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    <AspectRatioIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title={isFullscreen ? 'Exit Full Screen (f)' : 'Full Screen (f)'}>
                <IconButton
                  size="small"
                  onClick={handleToggleFullscreen}
                  aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
                  sx={{
                    color: '#ffffff',
                    p: 0.75,
                    bgcolor: 'rgba(255,255,255,0.08)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UniversalVideoPlayer;
