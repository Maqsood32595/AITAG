import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Button, Box, Chip, Stack, IconButton, Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedIcon from '@mui/icons-material/Verified';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SendIcon from '@mui/icons-material/Send';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { profileApi } from '../api';
import UniversalVideoPlayer, { parseVideoSource } from './UniversalVideoPlayer';
import AnimatedAvatar from './AnimatedAvatar';
import { useMobileDetect } from '../utils/useMobileDetect';

export function formatExternalUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

interface TalentShowcaseModalProps {
  open: boolean;
  onClose: () => void;
  talent: any | null;
  onInvite: (talent: any) => void;
}

const CATEGORY_MAP: Record<string, string> = {
  'Email Automation & Growth': 'Social & Marketing',
  'Growth & Ads': 'Social & Marketing',
  'Agentic Systems & SRE': 'Web & Digital Presence',
  'AI Video & Automation': 'Social & Marketing',
  'E-Commerce & Copy': 'Branding & Print',
  'Web & Funnels': 'Web & Digital Presence',
};

export const getWorkflowPackageInfo = (category?: string, title?: string) => {
  const normCategory = CATEGORY_MAP[category || ''] || category || '';
  const c = normCategory.toLowerCase();
  const t = (title || '').toLowerCase();

  // 1. Branding & Print (Logo Design) -> from ₹499
  if (
    c.includes('brand') ||
    c.includes('print') ||
    t.includes('logo') ||
    t.includes('identity') ||
    t.includes('visiting card') ||
    t.includes('invoice')
  ) {
    return {
      price: 499,
      formattedPrice: '₹499',
      slug: 'ai-logo-identity-kit',
      packageName: 'Logo Design & Branding Kit',
    };
  }

  // 2. Web & Digital Presence (Fast Business Website & Landing Page) -> from ₹1,999
  if (
    c.includes('web') ||
    c.includes('digital') ||
    c.includes('presence') ||
    c.includes('funnel') ||
    t.includes('website') ||
    t.includes('page') ||
    t.includes('cloudflare') ||
    t.includes('landing')
  ) {
    return {
      price: 1999,
      formattedPrice: '₹1,999',
      slug: 'ai-website-landing-page',
      packageName: 'Fast Business Website & Landing Page',
    };
  }

  // 3. Social & Marketing (Marketing Video & Promo Reels) -> from ₹1,499
  if (
    c.includes('social') ||
    c.includes('marketing') ||
    c.includes('video') ||
    c.includes('growth') ||
    c.includes('ad') ||
    t.includes('video') ||
    t.includes('reel') ||
    t.includes('promo') ||
    t.includes('instagram') ||
    t.includes('voiceover') ||
    t.includes('content')
  ) {
    return {
      price: 1499,
      formattedPrice: '₹1,499',
      slug: 'ai-marketing-video-reels',
      packageName: 'Marketing Video & Promo Reels',
    };
  }

  // 4. Product Visuals (AI Product Photo Makeover) -> from ₹1,499
  return {
    price: 1499,
    formattedPrice: '₹1,499',
    slug: 'ai-product-photo-makeover',
    packageName: 'AI Product Photo Makeover',
  };
};

const DEFAULT_WORKFLOWS = [
  {
    id: 'wf-1',
    title: 'AI Vector Logo & Complete Business Branding Kit',
    category: 'Branding & Print',
    demoVideoUrl: '/api/profile/workflows/stream-video?path=freelancers%2F0eaa9c88-d477-4308-bd37-f7ccf29c87f1%2Fworkflows%2Fwf-1%2F1794608454365_Gift_Wrapping_Video.mp4',
    mediaType: 'video'
  },
  {
    id: 'wf-2',
    title: 'Viral 9:16 Promotional Video Reels with Indian AI Voiceover',
    category: 'Social & Marketing',
    demoVideoUrl: '/api/profile/workflows/stream-video?path=freelancers%2F0eaa9c88-d477-4308-bd37-f7ccf29c87f1%2Fworkflows%2Fwf-2%2F1795101059170_Shark.mp4',
    mediaType: 'video'
  },
  {
    id: 'wf-3',
    title: 'High-Converting 5-Page Mobile Business Website with WhatsApp CTA',
    category: 'Web & Digital Presence',
    demoVideoUrl: '/api/profile/workflows/stream-video?path=freelancers%2F0eaa9c88-d477-4308-bd37-f7ccf29c87f1%2Fworkflows%2Fwf-3%2F1795100852475_Website_Built_By_Gemma.mp4',
    mediaType: 'video'
  },
  {
    id: 'wf-4',
    title: 'Studio-Grade AI Photo Transformation for Amazon & Meesho',
    category: 'Product Visuals',
    demoVideoUrl: '/api/profile/workflows/stream-video?path=freelancers%2F0eaa9c88-d477-4308-bd37-f7ccf29c87f1%2Fworkflows%2Fwf-4%2F1795251034494_Mountview_Flowers_With_Voice_Loud.mp4',
    mediaType: 'video'
  }
];

const TalentShowcaseModal: React.FC<TalentShowcaseModalProps> = ({
  open,
  onClose,
  talent,
  onInvite,
}) => {
  const { isMobile, isMobileLandscape } = useMobileDetect();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeReelIndex, setActiveReelIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Touch Swipe tracking
  const touchStartY = useRef<number>(0);

  useEffect(() => {
    if (open && talent) {
      setLoading(true);
      setActiveReelIndex(0);

      const isCuratedPlaceholder = /^curated-/.test(talent.id);
      const initialWorkflows = (!isCuratedPlaceholder && talent.deliveredWorkflows && talent.deliveredWorkflows.length > 0)
        ? talent.deliveredWorkflows
        : DEFAULT_WORKFLOWS;

      setProfileData({
        ...talent,
        deliveredWorkflows: initialWorkflows,
        links: talent.links || {},
      });

      profileApi.getById(talent.id)
        .then(res => {
          if (res.data) {
            setProfileData((prev: any) => ({
              ...prev,
              ...res.data,
              deliveredWorkflows:
                (res.data.deliveredWorkflows && res.data.deliveredWorkflows.length > 0)
                  ? res.data.deliveredWorkflows
                  : DEFAULT_WORKFLOWS,
            }));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open, talent]);

  const rawWorkflows = profileData?.deliveredWorkflows ?? [];
  const workflows = rawWorkflows.map((wf: any) => ({
    ...wf,
    category: CATEGORY_MAP[wf.category] || wf.category || 'Product Visuals'
  }));

  const filteredReels = workflows.filter((wf: any) => selectedCategory === 'All' || wf.category === selectedCategory);
  const totalReels = filteredReels.length;
  const currentReel = filteredReels[activeReelIndex] || filteredReels[0];

  // Reset index when category changes
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setActiveReelIndex(0);
  };

  const handleNextReel = () => {
    if (activeReelIndex < totalReels - 1) {
      setActiveReelIndex(prev => prev + 1);
    }
  };

  const handlePrevReel = () => {
    if (activeReelIndex > 0) {
      setActiveReelIndex(prev => prev - 1);
    }
  };

  // Keyboard Down / Up Arrow Listener
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        handleNextReel();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevReel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, activeReelIndex, totalReels]);

  // Touch Swipe Handlers (Swipe Up -> Next Reel, Swipe Down -> Prev Reel)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    if (diff > 45) {
      // Swiped Up
      handleNextReel();
    } else if (diff < -45) {
      // Swiped Down
      handlePrevReel();
    }
  };

  if (!talent) return null;

  const pkgInfo = currentReel ? getWorkflowPackageInfo(currentReel.category, currentReel.title) : null;
  const mediaParsed = currentReel ? parseVideoSource(currentReel.demoVideoUrl || currentReel.mediaUrl, currentReel.mediaType) : { isImage: false };
  const isImageReel = currentReel?.mediaType === 'image' || mediaParsed.isImage;

  const reelCaptionOverlay = currentReel ? (
    currentReel?.displayHeadingOnVideo !== false ? (
      <Box
        sx={{
          px: { xs: 1.8, sm: 2.5 },
          py: { xs: 1.2, sm: 1.5 },
          pr: { xs: 6.5, sm: 7 },
          background: 'linear-gradient(to top, rgba(9,13,22,0.88) 0%, rgba(9,13,22,0.5) 75%, transparent 100%)',
        }}
      >
        <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mb: 0.6, flexWrap: 'wrap', gap: 0.5 }}>
          <Chip
            label={currentReel?.category}
            size="small"
            sx={{
              bgcolor: 'rgba(79,70,229,0.45)',
              color: '#e0e7ff',
              fontWeight: 800,
              fontSize: '0.66rem',
              height: 20,
              border: '1px solid rgba(129,140,248,0.4)'
            }}
          />
          <Chip
            icon={isImageReel ? <PhotoCameraIcon sx={{ fontSize: '12px !important', color: '#38bdf8 !important' }} /> : <VideoLibraryIcon sx={{ fontSize: '12px !important', color: '#38bdf8 !important' }} />}
            label={isImageReel ? 'Photo Reel' : 'Video Reel'}
            size="small"
            sx={{
              bgcolor: 'rgba(15,23,42,0.75)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.66rem',
              height: 20
            }}
          />
        </Stack>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff', lineHeight: 1.22, fontSize: { xs: '0.92rem', sm: '1.05rem' } }}>
          {currentReel?.title}
        </Typography>
        {currentReel?.description && (
          <Typography
            variant="body2"
            sx={{
              color: '#cbd5e1',
              fontSize: '0.78rem',
              lineHeight: 1.3,
              mt: 0.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {currentReel.description}
          </Typography>
        )}
      </Box>
    ) : (
      <Box sx={{ px: 2, pb: 1.5 }}>
        <Chip
          label={currentReel?.category}
          size="small"
          sx={{
            bgcolor: 'rgba(15,23,42,0.85)',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.68rem',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)'
          }}
        />
      </Box>
    )
  ) : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          width: isMobile ? '100vw' : undefined,
          maxWidth: isMobile ? '100vw' : undefined,
          borderRadius: isMobile ? 0 : '22px',
          bgcolor: '#090d16',
          color: '#ffffff',
          boxShadow: isMobile ? 'none' : '0 25px 60px -12px rgba(0,0,0,0.7)',
          border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)',
          height: isMobile ? '100dvh' : 'min(90vh, 760px)',
          maxHeight: isMobile ? '100dvh' : '90vh',
          m: isMobile ? 0 : 2,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }
      }}
    >
      {/* ── Desktop Header & Category Filters (Mobile uses translucent Shorts overlay inside stage) ── */}
      {!isMobile && (
        <>
          <DialogTitle
            sx={{
              m: 0,
              py: 1.8,
              px: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              bgcolor: '#0b1120',
              flexShrink: 0
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
              <AnimatedAvatar
                name={talent.name}
                size={44}
                src={talent.avatar || talent.photo_url}
              />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'nowrap' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 850, color: '#ffffff', lineHeight: 1.2, fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {talent.name}
                  </Typography>
                  <Chip
                    icon={<VerifiedIcon sx={{ fontSize: '12px !important', color: '#38bdf8 !important' }} />}
                    label="Verified"
                    size="small"
                    sx={{ bgcolor: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontWeight: 700, fontSize: '0.64rem', height: 20, flexShrink: 0 }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                  {profileData?.headline || talent.role || 'Senior AI Specialist'}
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
              {totalReels > 0 && (
                <Chip
                  label={`Reel ${activeReelIndex + 1} of ${totalReels}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(79,70,229,0.25)',
                    color: '#a5b4fc',
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    height: 24,
                    border: '1px solid rgba(79,70,229,0.4)'
                  }}
                />
              )}

              {!isImageReel && (
                <Tooltip title={isMuted ? 'Click to Unmute Audio' : 'Mute Audio'}>
                  <IconButton
                    size="small"
                    onClick={() => setIsMuted(!isMuted)}
                    sx={{
                      color: isMuted ? '#94a3b8' : '#38bdf8',
                      bgcolor: 'rgba(255,255,255,0.06)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' }
                    }}
                  >
                    {isMuted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              )}

              <IconButton onClick={onClose} size="small" aria-label="Close reels viewer" sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          </DialogTitle>

          <Box
            sx={{
              py: 1,
              px: 2,
              display: 'flex',
              gap: 0.75,
              overflowX: 'auto',
              flexShrink: 0,
              bgcolor: '#0d1527',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none'
            }}
          >
            {['All', 'Branding & Print', 'Social & Marketing', 'Web & Digital Presence', 'Product Visuals'].map((cat) => (
              <Chip
                key={cat}
                label={cat}
                size="small"
                onClick={() => handleCategoryChange(cat)}
                sx={{
                  flexShrink: 0,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  height: 26,
                  bgcolor: selectedCategory === cat ? '#4f46e5' : 'rgba(255,255,255,0.06)',
                  color: selectedCategory === cat ? '#ffffff' : '#94a3b8',
                  border: selectedCategory === cat ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.06)',
                  '&:hover': {
                    bgcolor: selectedCategory === cat ? '#4338ca' : 'rgba(255,255,255,0.12)',
                  }
                }}
              />
            ))}
          </Box>
        </>
      )}

      <DialogContent sx={{ p: 0, bgcolor: '#000000', flex: 1, minHeight: 0, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* ── Mobile YouTube Shorts–Style Floating Translucent Header + Filter Pills ── */}
        {isMobile && (
          <Box
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 25,
              pt: 'calc(8px + env(safe-area-inset-top, 0px))',
              pb: isMobileLandscape ? 1.5 : 3,
              px: 1.5,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.48) 68%, transparent 100%)',
              pointerEvents: 'none'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, pointerEvents: 'auto' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                <AnimatedAvatar
                  name={talent.name}
                  size={34}
                  src={talent.avatar || talent.photo_url}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        color: '#ffffff',
                        lineHeight: 1.2,
                        fontSize: '0.9rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {talent.name}
                    </Typography>
                    <VerifiedIcon sx={{ fontSize: 15, color: '#38bdf8', flexShrink: 0 }} />
                  </Box>
                  {!isMobileLandscape && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(226,232,240,0.88)',
                        fontWeight: 500,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '0.7rem'
                      }}
                    >
                      {profileData?.headline || talent.role || 'Senior AI Specialist'}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
                {totalReels > 0 && (
                  <Chip
                    label={`${activeReelIndex + 1}/${totalReels}`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(15,23,42,0.75)',
                      color: '#e0e7ff',
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      height: 22,
                      border: '1px solid rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(6px)'
                    }}
                  />
                )}
                {!isImageReel && (
                  <IconButton
                    size="small"
                    onClick={() => setIsMuted(!isMuted)}
                    aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                    sx={{
                      width: 34,
                      height: 34,
                      color: isMuted ? '#e2e8f0' : '#38bdf8',
                      bgcolor: 'rgba(15,23,42,0.65)',
                      border: '1px solid rgba(255,255,255,0.16)',
                      backdropFilter: 'blur(6px)'
                    }}
                  >
                    {isMuted ? <VolumeOffIcon sx={{ fontSize: 18 }} /> : <VolumeUpIcon sx={{ fontSize: 18 }} />}
                  </IconButton>
                )}
                <IconButton
                  onClick={onClose}
                  size="small"
                  aria-label="Close reels viewer"
                  sx={{
                    width: 34,
                    height: 34,
                    color: '#ffffff',
                    bgcolor: 'rgba(15,23,42,0.65)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    backdropFilter: 'blur(6px)'
                  }}
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Stack>
            </Box>

            {!isMobileLandscape && (
              <Box
                sx={{
                  mt: 0.9,
                  display: 'flex',
                  gap: 0.65,
                  overflowX: 'auto',
                  pointerEvents: 'auto',
                  '&::-webkit-scrollbar': { display: 'none' },
                  scrollbarWidth: 'none'
                }}
              >
                {['All', 'Branding & Print', 'Social & Marketing', 'Web & Digital Presence', 'Product Visuals'].map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    size="small"
                    onClick={() => handleCategoryChange(cat)}
                    sx={{
                      flexShrink: 0,
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      height: 24,
                      bgcolor: selectedCategory === cat ? '#4f46e5' : 'rgba(15,23,42,0.65)',
                      color: selectedCategory === cat ? '#ffffff' : '#e2e8f0',
                      border: selectedCategory === cat ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.16)',
                      backdropFilter: 'blur(6px)'
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}

        {loading ? (
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 1.5 }}>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading Work Reels…</Typography>
          </Box>
        ) : totalReels === 0 ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', px: 3, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>🎬</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', mb: 0.5 }}>
              Work Reels Coming Soon
            </Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: 360, mx: 'auto' }}>
              This specialist hasn't published work reels for this category yet.
            </Typography>
          </Box>
        ) : (
          /* ── THE WORK REELS STAGE (Interactive YouTube-Shorts Style Viewport) ── */
          <Box
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            sx={{
              position: 'relative',
              width: '100%',
              flex: 1,
              minHeight: 0,
              bgcolor: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {/* The Active Media Player / Viewer */}
            <UniversalVideoPlayer
              key={currentReel?.id || activeReelIndex}
              url={currentReel?.demoVideoUrl || currentReel?.mediaUrl}
              title={currentReel?.title}
              mediaType={currentReel?.mediaType}
              autoPlay={true}
              muted={isMuted}
              loop={true}
              controls={!isImageReel}
              fillHeight={true}
              soundPillTop={isMobile ? (isMobileLandscape ? 54 : 92) : 14}
              onMutedChange={(m) => setIsMuted(m)}
              reelsOverlay={reelCaptionOverlay}
            />

            {/* Floating Navigation Controls (Up / Down Shorts Rail — safely above bottom controls) */}
            {totalReels > 1 && (
              <Box
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                sx={{
                  position: 'absolute',
                  right: { xs: 8, sm: 14 },
                  top: isMobile ? '48%' : '44%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  zIndex: 15
                }}
              >
                <Tooltip title="Previous Reel (↑)" placement="left">
                  <span>
                    <IconButton
                      size="small"
                      disabled={activeReelIndex === 0}
                      onClick={handlePrevReel}
                      aria-label="Previous reel"
                      sx={{
                        width: isMobile ? 36 : undefined,
                        height: isMobile ? 36 : undefined,
                        bgcolor: 'rgba(15,23,42,0.72)',
                        color: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(8px)',
                        '&:hover': { bgcolor: 'rgba(79,70,229,0.9)', borderColor: '#818cf8' },
                        '&.Mui-disabled': { opacity: 0.25, color: '#64748b' }
                      }}
                    >
                      <KeyboardArrowUpIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>

                {/* Vertical Reel Dots */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, my: 0.3 }}>
                  {filteredReels.map((_: any, dotIdx: number) => (
                    <Box
                      key={dotIdx}
                      onClick={() => setActiveReelIndex(dotIdx)}
                      sx={{
                        width: dotIdx === activeReelIndex ? 7 : 5,
                        height: dotIdx === activeReelIndex ? 16 : 5,
                        borderRadius: '4px',
                        bgcolor: dotIdx === activeReelIndex ? '#38bdf8' : 'rgba(255,255,255,0.35)',
                        transition: 'all 0.25s ease',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#ffffff' }
                      }}
                    />
                  ))}
                </Box>

                <Tooltip title="Next Reel (↓)" placement="left">
                  <span>
                    <IconButton
                      size="small"
                      disabled={activeReelIndex === totalReels - 1}
                      onClick={handleNextReel}
                      aria-label="Next reel"
                      sx={{
                        width: isMobile ? 36 : undefined,
                        height: isMobile ? 36 : undefined,
                        bgcolor: 'rgba(15,23,42,0.72)',
                        color: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(8px)',
                        '&:hover': { bgcolor: 'rgba(79,70,229,0.9)', borderColor: '#818cf8' },
                        '&.Mui-disabled': { opacity: 0.25, color: '#64748b' }
                      }}
                    >
                      <KeyboardArrowDownIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      {/* ── Bottom Action Footer: Single-Row Conversion CTAs ── */}
      {pkgInfo && (
        <DialogActions
          sx={{
            py: isMobileLandscape ? 0.65 : { xs: 1, sm: 1.6 },
            px: { xs: 1.5, sm: 2.5 },
            pb: isMobile ? 'calc(10px + env(safe-area-inset-bottom, 0px))' : undefined,
            bgcolor: '#0b1120',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
            flexShrink: 0
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: { xs: '0.6rem', sm: '0.68rem' }, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1.1 }}>
              Package
            </Typography>
            <Typography sx={{ fontWeight: 850, color: '#ffffff', fontSize: { xs: '0.86rem', sm: '0.95rem' }, whiteSpace: 'nowrap' }}>
              From {pkgInfo.formattedPrice}
            </Typography>
          </Box>

          <Stack direction="row" spacing={{ xs: 0.75, sm: 1.5 }} sx={{ flexShrink: 0 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onInvite(talent)}
              startIcon={<SendIcon sx={{ fontSize: '12px !important' }} />}
              sx={{
                borderRadius: '8px',
                borderColor: 'rgba(255,255,255,0.22)',
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: { xs: '0.74rem', sm: '0.78rem' },
                px: { xs: 1.15, sm: 1.6 },
                py: isMobile ? 0.6 : undefined,
                whiteSpace: 'nowrap',
                '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255,255,255,0.05)' }
              }}
            >
              Invite
            </Button>

            <Button
              component="a"
              href={`/#package-${pkgInfo.slug}`}
              onClick={() => {
                onClose();
                if (window.location.pathname === '/' || window.location.pathname === '') {
                  const el = document.getElementById(`package-${pkgInfo.slug}`);
                  if (el) {
                    const navOffset = 90;
                    const elementPosition = el.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - navOffset;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth',
                    });
                  }
                }
              }}
              variant="contained"
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: { xs: '0.74rem', sm: '0.78rem' },
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
                px: { xs: 1.3, sm: 2 },
                py: isMobile ? 0.6 : undefined,
                whiteSpace: 'nowrap'
              }}
            >
              Order Package →
            </Button>
          </Stack>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default TalentShowcaseModal;
