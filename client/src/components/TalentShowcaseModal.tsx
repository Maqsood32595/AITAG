import PaletteIcon from '@mui/icons-material/Palette';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Button, Box, Chip, Stack, Avatar, Divider,
  Card, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import VerifiedIcon from '@mui/icons-material/Verified';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LanguageIcon from '@mui/icons-material/Language';
import SendIcon from '@mui/icons-material/Send';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CodeIcon from '@mui/icons-material/Code';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
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

const getServiceCategoryIcon = (category: string) => {
  const norm = CATEGORY_MAP[category] || category;
  if (norm?.includes('Visual')) return <CameraAltIcon sx={{ fontSize: '13px !important', color: '#0891b2' }} />;
  if (norm?.includes('Branding') || norm?.includes('Print')) return <PaletteIcon sx={{ fontSize: '13px !important', color: '#7c3aed' }} />;
  if (norm?.includes('Social') || norm?.includes('Marketing') || norm?.includes('Video')) return <VideoCameraBackIcon sx={{ fontSize: '13px !important', color: '#e11d48' }} />;
  return <LanguageIcon sx={{ fontSize: '13px !important', color: '#10b981' }} />;
};

const DEFAULT_WORKFLOWS = [
  {
    id: 'wf-1',
    title: 'AI Vector Logo & Complete Indian SMB Identity Kit',
    category: 'Branding & Print',
    businessImpact: 'Generated scalable vector SVG brand logo, visiting cards (CMYK 300 DPI), and WhatsApp DP for an ethnic retail boutique in 48 hours.',
    demoVideoUrl: '',
    techStack: ['Recraft V3', 'Vectorizer.ai', 'Figma', 'Print CMYK PDF', 'WhatsApp DP'],
    liveUrl: 'https://aitag.in/#packages'
  },
  {
    id: 'wf-2',
    title: 'Viral 9:16 Promotional Video Reels with Indian AI Voiceover',
    category: 'Social & Marketing',
    businessImpact: 'Produced 5 direct-response vertical promo reels with ElevenLabs Hinglish voiceover and dynamic animated captions, boosting organic engagement by 3.5×.',
    demoVideoUrl: '',
    techStack: ['ElevenLabs Indian AI', 'CapCut AI', 'HeyGen', 'Dynamic Captions', 'HD MP4'],
    liveUrl: 'https://aitag.in/#packages'
  },
  {
    id: 'wf-3',
    title: 'High-Converting 5-Page Mobile Business Website with WhatsApp CTA',
    category: 'Web & Digital Presence',
    businessImpact: 'Built mobile-first static business website deployed to Cloudflare Pages in <1s load time with instant WhatsApp click-to-chat, generating 24 customer enquiries in week 1.',
    demoVideoUrl: '',
    techStack: ['Mobile-First HTML5', 'Cloudflare Pages', 'WhatsApp API', 'Local SEO', 'Zero Hosting Fees'],
    liveUrl: 'https://aitag.in/#packages'
  },
  {
    id: 'wf-4',
    title: 'Studio-Grade AI Photo Transformation for Amazon & Meesho',
    category: 'Product Visuals',
    businessImpact: 'Converted 20 smartphone cosmetic photos into studio-lit catalogue listings with pure RGB(255,255,255) backgrounds and ambient contact shadows with 100% marketplace approval.',
    demoVideoUrl: '',
    techStack: ['Photoroom AI', 'FLUX.1', 'Photoshop Generative Fill', 'Amazon 2000px', 'Clean Cutouts'],
    liveUrl: 'https://aitag.in/#packages'
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
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (open && talent) {
      setLoading(true);
      setActiveVideoUrl(null);

      // For curated placeholder IDs, start with empty workflows so we don't show fake data
      const isCuratedPlaceholder = /^curated-/.test(talent.id);
      const initialWorkflows = (!isCuratedPlaceholder && talent.deliveredWorkflows && talent.deliveredWorkflows.length > 0)
        ? talent.deliveredWorkflows
        : [];

      setProfileData({
        ...talent,
        deliveredWorkflows: initialWorkflows,
        links: talent.links || {},
      });

      const firstValidVideo = initialWorkflows.find((w: any) => w.demoVideoUrl)?.demoVideoUrl;
      setActiveVideoUrl(firstValidVideo || null);

      // Fetch live profile — always use the server's data as source of truth
      profileApi.getById(talent.id)
        .then(res => {
          if (res.data) {
            setProfileData(prev => ({
              ...prev,
              ...res.data,
              // Merge: prefer server's workflows; fall back to initial if server returns empty AND we already had real ones
              deliveredWorkflows:
                (res.data.deliveredWorkflows && res.data.deliveredWorkflows.length > 0)
                  ? res.data.deliveredWorkflows
                  : initialWorkflows,
            }));
            const wfs = res.data.deliveredWorkflows || [];
            const videoToPlay = wfs.find((w: any) => w.demoVideoUrl)?.demoVideoUrl;
            if (videoToPlay) setActiveVideoUrl(videoToPlay);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open, talent]);

  if (!talent) return null;

  const workflows = profileData?.deliveredWorkflows ?? [];
  const hasWorkflows = workflows.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          bgcolor: '#ffffff',
          boxShadow: '0 24px 48px -12px rgba(0,0,0,0.18)',
          border: '1px solid #e2e8f0',
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AnimatedAvatar
            name={talent.name}
            size={60}
            src={talent.avatar || talent.photo_url}
          />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {talent.name}
              </Typography>
              <Chip
                icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: '#0284c7 !important' }} />}
                label="Verified Specialist"
                size="small"
                sx={{ bgcolor: 'rgba(2,132,199,0.08)', color: '#0284c7', fontWeight: 700, fontSize: '0.72rem' }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: '#4f46e5', fontWeight: 700, mt: 0.2 }}>
              {profileData?.headline || talent.role || 'Senior AI Automation Specialist'}
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} sx={{ color: '#94a3b8' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, md: 4 }, borderTop: '1px solid #f1f5f9' }}>
        <Box>
          {/* SECTION 1: DELIVERED WORKFLOWS & VIDEO DEMOS */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                🎬 Delivered Services & Work Samples {hasWorkflows ? `(${workflows.length})` : ''}
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 1.5 }}>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading specialist profile…</Typography>
              </Box>
            ) : !hasWorkflows ? (
              /* ── Empty state: specialist hasn't published workflows yet ── */
              <Box
                sx={{
                  py: 5,
                  px: 3,
                  textAlign: 'center',
                  borderRadius: '16px',
                  border: '2px dashed rgba(79,70,229,0.2)',
                  bgcolor: 'rgba(79,70,229,0.02)',
                }}
              >
                <Typography sx={{ fontSize: '2rem', mb: 1.5 }}>🎬</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                  Workflows coming soon
                </Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', maxWidth: 360, mx: 'auto' }}>
                  This specialist hasn't published any delivered workflow demos yet.
                  Once they update their profile, videos and case studies will appear here.
                </Typography>
              </Box>
            ) : (
              <>

            {/* Active Universal Video Player */}
            {activeVideoUrl && (
              <Box sx={{ mb: 3 }}>
                <UniversalVideoPlayer url={activeVideoUrl} title="Delivered Workflow Video Walkthrough" />
              </Box>
            )}

            {/* 4 Core Services Filter Chips */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
              {['All', 'Branding & Print', 'Social & Marketing', 'Web & Digital Presence', 'Product Visuals'].map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  size="small"
                  onClick={() => setSelectedCategory(cat)}
                  sx={{
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    bgcolor: selectedCategory === cat ? '#4f46e5' : '#f1f5f9',
                    color: selectedCategory === cat ? '#ffffff' : '#475569',
                    '&:hover': {
                      bgcolor: selectedCategory === cat ? '#4338ca' : '#e2e8f0',
                    }
                  }}
                />
              ))}
            </Box>

            {/* Workflows Cards List */}
            <Stack spacing={2.5}>
              {workflows
                .map((wf: any) => ({
                  ...wf,
                  category: CATEGORY_MAP[wf.category] || wf.category || 'Product Visuals'
                }))
                .filter((wf: any) => selectedCategory === 'All' || wf.category === selectedCategory)
                .map((wf: any, idx: number) => {
                const isSelected = activeVideoUrl === wf.demoVideoUrl && !!wf.demoVideoUrl;
                const parsedVideo = parseVideoSource(wf.demoVideoUrl);

                return (
                  <Card
                    key={wf.id || idx}
                    elevation={0}
                    sx={{
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: isSelected ? '#4f46e5' : 'rgba(79,70,229,0.15)',
                      bgcolor: isSelected ? 'rgba(79,70,229,0.03)' : '#ffffff',
                      p: 2.5,
                      transition: 'all 0.2s',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Chip
                            label={wf.category || 'Workflow Automation'}
                            size="small"
                            sx={{ bgcolor: 'rgba(79,70,229,0.08)', color: '#4f46e5', fontWeight: 700, fontSize: '0.72rem' }}
                          />
                          {parsedVideo.type === 'youtube' && (
                            <Chip label="YouTube Walkthrough" size="small" sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: '0.7rem' }} />
                          )}
                          {parsedVideo.type === 'loom' && (
                            <Chip label="Loom Walkthrough" size="small" sx={{ bgcolor: '#f3e8ff', color: '#9333ea', fontWeight: 700, fontSize: '0.7rem' }} />
                          )}
                          {parsedVideo.type === 'direct' && wf.demoVideoUrl && (
                            <Chip label="GCS Cloud Video" size="small" sx={{ bgcolor: '#ecfdf5', color: '#059669', fontWeight: 700, fontSize: '0.7rem' }} />
                          )}
                        </Stack>

                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          {wf.title}
                        </Typography>
                      </Box>

                      {wf.demoVideoUrl && (
                        <Button
                          variant={isSelected ? 'contained' : 'outlined'}
                          size="small"
                          onClick={() => setActiveVideoUrl(wf.demoVideoUrl)}
                          startIcon={<PlayCircleFilledWhiteIcon />}
                          sx={{
                            borderRadius: '8px',
                            fontWeight: 700,
                            textTransform: 'none',
                            fontSize: '0.8rem',
                            ...(isSelected && {
                              background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                            }),
                          }}
                        >
                          {isSelected ? 'Playing Video' : 'Play Video Demo'}
                        </Button>
                      )}
                    </Box>

                    {/* Business Impact Metric */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, my: 1.5, p: 1.5, bgcolor: 'rgba(16,185,129,0.06)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.15)' }}>
                      <TrendingUpIcon sx={{ color: '#10b981', fontSize: 20, mt: 0.2 }} />
                      <Typography sx={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 600 }}>
                        Impact: <span style={{ fontWeight: 400, color: '#334155' }}>{wf.businessImpact}</span>
                      </Typography>
                    </Box>

                    {/* Tech Stack Chips */}
                    {wf.techStack && wf.techStack.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, alignItems: 'center', mt: 1.5 }}>
                        <CodeIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                        {wf.techStack.map((tech: string) => (
                          <Chip
                            key={tech}
                            label={tech}
                            size="small"
                            sx={{ bgcolor: '#f1f5f9', color: '#475569', fontSize: '0.72rem', fontWeight: 600, borderRadius: '6px' }}
                          />
                        ))}
                        {wf.liveUrl && (
                          <Button
                            href={formatExternalUrl(wf.liveUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                            sx={{ ml: 'auto', color: '#4f46e5', textTransform: 'none', fontSize: '0.75rem', fontWeight: 700 }}
                          >
                            Live Repo / Demo
                          </Button>
                        )}
                      </Box>
                    )}

                    {/* Direct Action to Order Service */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, pt: 1.5, borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 1 }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                        Want this outcome for your business?
                      </Typography>
                      <Button
                        component="a"
                        href="/#packages"
                        onClick={onClose}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: '8px',
                          color: '#4f46e5',
                          borderColor: 'rgba(79,70,229,0.3)',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          textTransform: 'none',
                          py: 0.4,
                          px: 1.5,
                          '&:hover': {
                            borderColor: '#4f46e5',
                            bgcolor: 'rgba(79,70,229,0.06)'
                          }
                        }}
                      >
                        Order Package (From ₹499) →
                      </Button>
                    </Box>
                  </Card>
                );
              })}
            </Stack>
          </>
        )}
      </Box>

          <Divider sx={{ my: 3 }} />

          {/* SECTION 2: ABOUT SPECIALIST & VERIFIED CREDENTIALS */}
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
            About Specialist & Verified Credentials
          </Typography>

          <Typography sx={{ color: '#475569', fontSize: '0.925rem', lineHeight: 1.6, mb: 2.5 }}>
            {profileData?.bio || talent.bio}
          </Typography>

          {/* Social & Portfolio Links */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
            {profileData?.links?.github && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<GitHubIcon />}
                href={formatExternalUrl(profileData.links.github)}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ borderRadius: '8px', color: '#0f172a', borderColor: '#cbd5e1', textTransform: 'none', fontWeight: 600 }}
              >
                GitHub
              </Button>
            )}
            {profileData?.links?.linkedin && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<LinkedInIcon />}
                href={formatExternalUrl(profileData.links.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ borderRadius: '8px', color: '#0077b5', borderColor: '#cbd5e1', textTransform: 'none', fontWeight: 600 }}
              >
                LinkedIn
              </Button>
            )}
            {profileData?.links?.website && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<LanguageIcon />}
                href={formatExternalUrl(profileData.links.website)}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ borderRadius: '8px', color: '#4f46e5', borderColor: '#cbd5e1', textTransform: 'none', fontWeight: 600 }}
              >
                Portfolio
              </Button>
            )}
          </Box>

          {/* Skills Tags */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
            {(profileData?.skills || talent.skills || []).map((skill: string) => (
              <Chip
                key={skill}
                label={skill}
                size="small"
                sx={{ bgcolor: 'rgba(79,70,229,0.06)', color: '#4f46e5', fontWeight: 600, borderRadius: '8px' }}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Hourly Rate
          </Typography>
          <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.2rem' }}>
            ₹{(profileData?.hourlyRate || talent.hourlyRate)?.toLocaleString()}
            <Typography component="span" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
              /hr
            </Typography>
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => {
            onClose();
            onInvite(talent);
          }}
          startIcon={<SendIcon />}
          sx={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
            color: '#ffffff',
            fontWeight: 700,
            borderRadius: '12px',
            px: 3.5,
            py: 1.2,
            boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
            textTransform: 'none',
          }}
        >
          Invite to Task
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TalentShowcaseModal;
