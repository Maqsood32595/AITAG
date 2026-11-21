import React from 'react';
import { Box, Typography } from '@mui/material';

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
}

export function parseVideoSource(rawUrl?: string, explicitMediaType?: string) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { type: 'none', embedUrl: '', rawUrl: '', isImage: false };
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
      isImage: true
    };
  }

  // YouTube detection: watch, youtu.be, shorts, embed
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`,
      rawUrl: trimmed,
      isImage: false
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
      isImage: false
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
    isImage: false
  };
}

export const UniversalVideoPlayer: React.FC<UniversalVideoPlayerProps> = ({
  url,
  title,
  autoPlay = false,
  muted = true,
  loop = true,
  controls = true,
  mediaType,
  maxHeight = 520
}) => {
  if (!url) {
    return (
      <Box sx={{ width: '100%', height: 260, bgcolor: '#0f172a', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
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
          width: '100%',
          maxHeight,
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: '#090d16',
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1
        }}
      >
        <img
          src={parsed.embedUrl}
          alt={title || 'Work Reel Visual Showcase'}
          style={{
            maxWidth: '100%',
            maxHeight: typeof maxHeight === 'number' ? maxHeight - 16 : maxHeight,
            objectFit: 'contain',
            borderRadius: '8px',
            display: 'block'
          }}
          loading="lazy"
        />
      </Box>
    );
  }

  if (parsed.type === 'youtube') {
    return (
      <Box sx={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 2, overflow: 'hidden', bgcolor: '#000', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>
        <iframe
          src={parsed.embedUrl}
          title={title || 'YouTube Video Case Study'}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </Box>
    );
  }

  if (parsed.type === 'loom') {
    return (
      <Box sx={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 2, overflow: 'hidden', bgcolor: '#000', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>
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

  // Direct MP4 / GCS Stream (Video Reel)
  return (
    <Box sx={{ width: '100%', borderRadius: 2, overflow: 'hidden', bgcolor: '#000', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>
      <video
        key={parsed.embedUrl}
        controls={controls}
        playsInline
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        preload="metadata"
        style={{ width: '100%', maxHeight, display: 'block', objectFit: 'contain' }}
        src={parsed.embedUrl}
      >
        Your browser does not support HTML5 video playback.
      </video>
    </Box>
  );
};

export default UniversalVideoPlayer;
