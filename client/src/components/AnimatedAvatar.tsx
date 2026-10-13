import React from 'react';
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
 * - Circular 64x64px (or responsive via `size` prop)
 * - Gradient background shifting from deep cobalt blue (#1e293b) to soft amethyst purple (#3b0764)
 * - Elegant bold silver-white text (#f8fafc) with subtle 3D metallic/iridescent finish
 * - 3D Vertical Coin-Flip Y-axis spin animation inside static circle every 5s
 */
export const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({
  name = 'AI Specialist',
  size = 64,
  src,
  className
}) => {
  const initials = getInitials(name);
  const fontSize = Math.round(size * 0.38);

  // If a real non-dicebear custom photo URL is provided, display it directly
  const hasRealPhoto = src && !src.includes('dicebear.com') && !src.includes('multiavatar.com');

  if (hasRealPhoto) {
    return (
      <Box
        className={className}
        component="img"
        src={src}
        alt={name}
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 4px 14px rgba(30, 41, 59, 0.25)',
          flexShrink: 0
        }}
      />
    );
  }

  return (
    <Box
      className={className}
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #1e293b 0%, #3b0764 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        border: '2px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 6px 18px rgba(30, 41, 59, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
        perspective: '600px',
        flexShrink: 0,
        userSelect: 'none',
        // Keyframes for the 5-second 3D vertical coin-flip (Y-axis spin)
        '@keyframes verticalSpin': {
          '0%': {
            transform: 'rotateY(0deg)'
          },
          '20%': {
            transform: 'rotateY(360deg)'
          },
          '100%': {
            transform: 'rotateY(360deg)'
          }
        }
      }}
    >
      <Box
        component="span"
        className="avatar-initials"
        sx={{
          display: 'inline-block',
          transformStyle: 'preserve-3d',
          animation: 'verticalSpin 5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
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
  );
};

export default AnimatedAvatar;
