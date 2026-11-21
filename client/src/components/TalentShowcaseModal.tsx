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

  // 2. Web & Digital Presence (5-Page Static Website) -> from ₹1,999
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
      packageName: '5-Page Static Business Website',
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          bgcolor: '#090d16',
          color: '#ffffff',
          boxShadow: '0 25px 60px -12px rgba(0,0,0,0.7)',
          border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden'
        }
      }}
    >
      {/* ── Top Header: Specialist & Work Reels Controls ── */}
      <DialogTitle
        sx={{
          m: 0,
          p: { xs: 2, sm: 2.5 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          bgcolor: '#0b1120'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <AnimatedAvatar
            name={talent.name}
            size={46}
            src={talent.avatar || talent.photo_url}
          />
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 850, color: '#ffffff', lineHeight: 1.2 }}>
                {talent.name}
              </Typography>
              <Chip
                icon={<VerifiedIcon sx={{ fontSize: '13px !important', color: '#38bdf8 !important' }} />}
                label="Verified"
                size="small"
                sx={{ bgcolor: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontWeight: 700, fontSize: '0.68rem', height: 22 }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profileData?.headline || talent.role || 'Senior AI Specialist'}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          {totalReels > 0 && (
            <Chip
              label={`Reel ${activeReelIndex + 1} of ${totalReels}`}
              size="small"
              sx={{
                bgcolor: 'rgba(79,70,229,0.25)',
                color: '#a5b4fc',
                fontWeight: 800,
                fontSize: '0.72rem',
                border: '1px solid rgba(79,70,229,0.4)'
              }}
            />
          )}

          {!isImageReel && (
            <Tooltip title={isMuted ? 'Tap to Unmute Audio' : 'Mute Audio'}>
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

          <IconButton onClick={onClose} sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: '#090d16', display: 'flex', flexDirection: 'column' }}>
        {/* Category Filters Bar */}
        <Box sx={{ p: 1.5, px: 2, display: 'flex', gap: 0.8, overflowX: 'auto', bgcolor: '#0d1527', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {['All', 'Branding & Print', 'Social & Marketing', 'Web & Digital Presence', 'Product Visuals'].map((cat) => (
            <Chip
              key={cat}
              label={cat}
              size="small"
              onClick={() => handleCategoryChange(cat)}
              sx={{
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.7rem',
                bgcolor: selectedCategory === cat ? '#4f46e5' : 'rgba(255,255,255,0.05)',
                color: selectedCategory === cat ? '#ffffff' : '#94a3b8',
                border: selectedCategory === cat ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.05)',
                '&:hover': {
                  bgcolor: selectedCategory === cat ? '#4338ca' : 'rgba(255,255,255,0.1)',
                }
              }}
            />
          ))}
        </Box>

        {loading ? (
          <Box sx={{ py: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 1.5 }}>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading Work Reels…</Typography>
          </Box>
        ) : totalReels === 0 ? (
          <Box sx={{ py: 10, px: 3, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>🎬</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', mb: 0.5 }}>
              Work Reels Coming Soon
            </Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: 360, mx: 'auto' }}>
              This specialist hasn't published work reels for this category yet.
            </Typography>
          </Box>
        ) : (
          /* ── THE WORK REELS STAGE (Interactive Glide Viewport) ── */
          <Box
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            sx={{
              position: 'relative',
              width: '100%',
              minHeight: { xs: 480, sm: 540 },
              maxHeight: 560,
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
              maxHeight={560}
            />

            {/* Floating Navigation Controls (Up / Down Arrows) */}
            <Box
              sx={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                zIndex: 12
              }}
            >
              <Tooltip title="Previous Reel (Press ↑)" placement="left">
                <span>
                  <IconButton
                    size="small"
                    disabled={activeReelIndex === 0}
                    onClick={handlePrevReel}
                    sx={{
                      bgcolor: 'rgba(15,23,42,0.75)',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(8px)',
                      '&:hover': { bgcolor: 'rgba(79,70,229,0.9)', borderColor: '#818cf8' },
                      '&.Mui-disabled': { opacity: 0.2, color: '#64748b' }
                    }}
                  >
                    <KeyboardArrowUpIcon />
                  </IconButton>
                </span>
              </Tooltip>

              {/* Vertical Reel Dots */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.6, my: 0.5 }}>
                {filteredReels.map((_, dotIdx) => (
                  <Box
                    key={dotIdx}
                    onClick={() => setActiveReelIndex(dotIdx)}
                    sx={{
                      width: dotIdx === activeReelIndex ? 8 : 5,
                      height: dotIdx === activeReelIndex ? 18 : 5,
                      borderRadius: '4px',
                      bgcolor: dotIdx === activeReelIndex ? '#38bdf8' : 'rgba(255,255,255,0.3)',
                      transition: 'all 0.25s ease',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#ffffff' }
                    }}
                  />
                ))}
              </Box>

              <Tooltip title="Next Reel (Press ↓)" placement="left">
                <span>
                  <IconButton
                    size="small"
                    disabled={activeReelIndex === totalReels - 1}
                    onClick={handleNextReel}
                    sx={{
                      bgcolor: 'rgba(15,23,42,0.75)',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(8px)',
                      '&:hover': { bgcolor: 'rgba(79,70,229,0.9)', borderColor: '#818cf8' },
                      '&.Mui-disabled': { opacity: 0.2, color: '#64748b' }
                    }}
                  >
                    <KeyboardArrowDownIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            {/* Bottom Scrim & Reel Heading Overlay (when displayHeadingOnVideo is enabled) */}
            {currentReel?.displayHeadingOnVideo !== false ? (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: { xs: 2, sm: 2.5 },
                  pr: 6,
                  background: 'linear-gradient(to top, rgba(9,13,22,0.97) 0%, rgba(9,13,22,0.85) 65%, transparent 100%)',
                  zIndex: 10
                }}
              >
                {/* Category & Media Badge */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.8, flexWrap: 'wrap', gap: 0.5 }}>
                  <Chip
                    label={currentReel?.category}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(79,70,229,0.3)',
                      color: '#c7d2fe',
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      border: '1px solid rgba(99,102,241,0.3)'
                    }}
                  />
                  <Chip
                    icon={isImageReel ? <PhotoCameraIcon sx={{ fontSize: '13px !important', color: '#38bdf8 !important' }} /> : <VideoLibraryIcon sx={{ fontSize: '13px !important', color: '#38bdf8 !important' }} />}
                    label={isImageReel ? 'Photo Reel' : 'Video Reel'}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.08)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.68rem'
                    }}
                  />
                </Stack>

                {/* Reel Heading — Selected or Typed Heading */}
                <Typography variant="h6" sx={{ fontWeight: 850, color: '#ffffff', lineHeight: 1.25, mb: 0.5, fontSize: { xs: '1rem', sm: '1.15rem' } }}>
                  {currentReel?.title}
                </Typography>

                {currentReel?.description && (
                  <Typography variant="body2" sx={{ color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.35, mt: 0.5 }}>
                    {currentReel.description}
                  </Typography>
                )}
              </Box>
            ) : (
              <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
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
            )}
          </Box>
        )}
      </DialogContent>

      {/* ── Bottom Action Footer: Direct Conversion CTAs ── */}
      {pkgInfo && (
        <DialogActions
          sx={{
            p: 2,
            px: 2.5,
            bgcolor: '#0b1120',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Specialist Package
            </Typography>
            <Typography sx={{ fontWeight: 850, color: '#ffffff', fontSize: '0.95rem' }}>
              From {pkgInfo.formattedPrice}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onInvite(talent)}
              startIcon={<SendIcon sx={{ fontSize: '13px !important' }} />}
              sx={{
                borderRadius: '8px',
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.78rem',
                '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255,255,255,0.05)' }
              }}
            >
              Invite Specialist
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
                fontSize: '0.78rem',
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
                px: 2
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
