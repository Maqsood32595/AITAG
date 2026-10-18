import React, { useMemo, useState } from 'react';
import { Box } from '@mui/material';

interface AnimatedAvatarProps {
  name?: string;
  size?: number;
  src?: string | null;
  className?: string;
}

/**
 * Extracts clean, modern 1-2 letter initials from a user's full name.
 * e.g.:
 * "Dr. Aarav Sharma" -> "AS"
 * "Priya Mukherjee" -> "PM"
 * "Maqs" -> "MQ"
 * "User1 Admin" -> "UA"
 */
export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'AI';
  const clean = name.trim().replace(/^(dr\.|mr\.|mrs\.|ms\.)\s+/i, '');
  const parts = clean.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    const single = parts[0];
    return single.length >= 2 ? single.slice(0, 2).toUpperCase() : single.toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * AnimatedAvatar Component
 * Visual Style:
 * - Circular 3D coin-flip on Y-axis every 5s
 * - ALL circles (small navbar 36px/38px, medium 48/64px, large 72px) rotate in PERFECT SYNCHRONIZATION
 *   using shared wall-clock phase delay: -((Date.now() % 5000) / 1000)s.
 * - The entire circle rotates (both user photo and cobalt-amethyst metallic initials).
 */
export const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({
  name = 'AI Specialist',
  size = 64,
  src,
  className
}) => {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(name);
  const fontSize = Math.max(10, Math.round(size * 0.38));

  // Determine if valid non-dicebear/non-multiavatar custom photo URL is provided
  const hasRealPhoto = Boolean(
    src &&
    !imageError &&
    !src.includes('dicebear.com') &&
    !src.includes('multiavatar.com')
  );

  // Clock-Phase Lock: Computes exact negative animation delay relative to current 5000ms wall-clock cycle.
  // Every avatar mounted anywhere in the app locks onto the exact same millisecond of the 5s loop.
  const syncDelay = useMemo(() => {
    const phaseOffsetSeconds = (Date.now() % 5000) / 1000;
    return `-${phaseOffsetSeconds.toFixed(3)}s`;
  }, []);

  return (
    <Box
      className={className}
      sx={{
        width: size,
        height: size,
        perspective: '800px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        userSelect: 'none',
        position: 'relative'
      }}
    >
      {hasRealPhoto ? (
        <Box
          component="img"
          src={src as string}
          alt={name}
          onError={() => setImageError(true)}
          className="aitag-avatar-coin"
          sx={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 4px 14px rgba(30, 41, 59, 0.25)',
            display: 'block',
            animationDelay: syncDelay,
            backfaceVisibility: 'visible'
          }}
        />
      ) : (
        <Box
          className="aitag-avatar-coin"
          sx={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e293b 0%, #3b0764 100%)',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 6px 18px rgba(30, 41, 59, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animationDelay: syncDelay,
            backfaceVisibility: 'visible',
            flexShrink: 0
          }}
        >
          <Box
            component="span"
            className="avatar-initials"
            sx={{
              display: 'inline-block',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              fontWeight: 800,
              fontSize: `${fontSize}px`,
              letterSpacing: '0.5px',
              color: '#f8fafc',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5), 0 0 8px rgba(248, 250, 252, 0.3)',
              background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 60%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1
            }}
          >
            {initials}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AnimatedAvatar;
