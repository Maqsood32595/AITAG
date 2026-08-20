import React from 'react';
import { Box, Typography } from '@mui/material';

interface UniversalVideoPlayerProps {
  url?: string;
  title?: string;
  autoPlay?: boolean;
}

export function parseVideoSource(rawUrl?: string) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { type: 'none', embedUrl: '', rawUrl: '' };
  }

  const trimmed = rawUrl.trim();

  // YouTube detection: watch, youtu.be, shorts, embed
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`,
      rawUrl: trimmed
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
      rawUrl: trimmed
    };
  }

  // Direct MP4 / GCS Stream
  let streamUrl = trimmed;
  if (streamUrl.startsWith('/api')) {
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const base = isLocal ? 'http://localhost:5005' : '';
    streamUrl = `${base}${streamUrl}`;
  }

  return {
    type: 'direct',
    embedUrl: streamUrl,
    rawUrl: trimmed
  };
}

export const UniversalVideoPlayer: React.FC<UniversalVideoPlayerProps> = ({ url, title }) => {
  if (!url) {
    return (
      <Box sx={{ width: '100%', height: 260, bgcolor: '#0f172a', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        <Typography variant="body2">No video demo configured</Typography>
      </Box>
    );
  }

  const parsed = parseVideoSource(url);

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

  // Direct MP4 / GCS Stream
  return (
    <Box sx={{ width: '100%', borderRadius: 2, overflow: 'hidden', bgcolor: '#000', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>
      <video
        key={parsed.embedUrl}
        controls
        playsInline
        preload="metadata"
        style={{ width: '100%', maxHeight: 420, display: 'block' }}
        src={parsed.embedUrl}
      >
        Your browser does not support HTML5 video playback.
      </video>
    </Box>
  );
};

export default UniversalVideoPlayer;
