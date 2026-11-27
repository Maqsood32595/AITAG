import React from 'react';
import { Box } from '@mui/material';
import UniversalVideoPlayer, { parseVideoSource } from './UniversalVideoPlayer';

interface DeliverablePreviewProps {
  url?: string;
  posterUrl?: string;
  title?: string;
  maxHeight?: number;
}

/**
 * Renders an inline image thumbnail or lazy video player for authenticated order/task deliverables.
 * Keeps external links (PDFs/Drive folders) as text links only so non-media URLs never render blank boxes.
 */
export const DeliverablePreview: React.FC<DeliverablePreviewProps> = ({
  url,
  posterUrl,
  title,
  maxHeight = 240,
}) => {
  if (!url || typeof url !== 'string') return null;

  const parsed = parseVideoSource(url);
  if (parsed.type === 'none') return null;

  if (parsed.isImage) {
    return (
      <Box
        sx={{
          mt: 1,
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          bgcolor: '#f8fafc',
          maxWidth: 420,
        }}
      >
        <Box
          component="img"
          src={parsed.embedUrl}
          alt={title || 'Delivered image preview'}
          loading="lazy"
          decoding="async"
          sx={{
            width: '100%',
            maxHeight,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </Box>
    );
  }

  const isDirectVideo =
    parsed.type === 'youtube' ||
    parsed.type === 'vimeo' ||
    parsed.type === 'loom' ||
    /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url) ||
    /\/stream(-video)?/i.test(url);

  if (!isDirectVideo) return null;

  return (
    <Box
      sx={{
        mt: 1,
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        maxWidth: 460,
      }}
    >
      <UniversalVideoPlayer
        url={url}
        posterUrl={posterUrl}
        title={title || 'Deliverable Video Preview'}
        autoPlay={false}
        muted={false}
        maxHeight={maxHeight}
      />
    </Box>
  );
};

export default DeliverablePreview;
