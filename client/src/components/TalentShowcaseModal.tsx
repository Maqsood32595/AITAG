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

const DEFAULT_WORKFLOWS = [
  {
    id: 'wf-1',
    title: 'AITAG Video Showcase & Automated AI Pipeline',
    category: 'AI Video & Automation',
    businessImpact: 'Built zero-latency streaming proxy and video case study showcase with sub-second playback and multi-tier GCS storage.',
    demoVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    techStack: ['Node.js', 'Google Cloud Storage', 'React', 'TypeScript', 'TailwindCSS'],
    liveUrl: 'https://aitag.onrender.com'
  },
  {
    id: 'wf-2',
    title: 'Facebook & Meta Ads AI Optimization Engine',
    category: 'Growth & Ads',
    businessImpact: 'Automated dynamic ad copy variation testing and ROAS tracking, increasing campaign conversion by 34%.',
    demoVideoUrl: '',
    techStack: ['Meta Graph API', 'OpenAI GPT-4o', 'Zapier', 'Supabase'],
    liveUrl: 'https://user1.ai/meta-ads-case-study'
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

  useEffect(() => {
    if (open && talent) {
      setLoading(true);
      
      const initialWorkflows = talent.deliveredWorkflows && talent.deliveredWorkflows.length > 0 
        ? talent.deliveredWorkflows 
        : DEFAULT_WORKFLOWS;

      setProfileData({
        ...talent,
        deliveredWorkflows: initialWorkflows,
        links: talent.links || {
          github: 'https://github.com/Maqsood32595',
          linkedin: 'https://linkedin.com/in/maqsood',
          website: 'https://aitag.in'
        }
      });

      // Set initial video from workflows if available
      const firstValidVideo = initialWorkflows.find((w: any) => w.demoVideoUrl)?.demoVideoUrl;
      setActiveVideoUrl(firstValidVideo || null);

      // Fetch dynamic profile from backend
      profileApi.getById(talent.id)
        .then(res => {
          if (res.data) {
            setProfileData(res.data);
            const wfs = res.data.deliveredWorkflows || [];
            const videoToPlay = wfs.find((w: any) => w.demoVideoUrl)?.demoVideoUrl;
            if (videoToPlay) {
              setActiveVideoUrl(videoToPlay);
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open, talent]);

  if (!talent) return null;

  const workflows = profileData?.deliveredWorkflows || DEFAULT_WORKFLOWS;

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
          <Avatar
            src={talent.avatar || talent.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(talent.name || 'user')}`}
            sx={{ width: 60, height: 60, border: '2px solid #4f46e5' }}
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
                🎬 Delivered Workflows & Video Case Studies ({workflows.length})
              </Typography>
            </Box>

            <Typography sx={{ color: '#64748b', fontSize: '0.9rem', mb: 2.5 }}>
              Watch verified video walkthroughs of production automations, pipelines, and tools delivered by this specialist.
            </Typography>

            {/* Active Universal Video Player */}
            {activeVideoUrl && (
              <Box sx={{ mb: 3 }}>
                <UniversalVideoPlayer url={activeVideoUrl} title="Delivered Workflow Video Walkthrough" />
              </Box>
            )}

            {/* Workflows Cards List */}
            <Stack spacing={2.5}>
              {workflows.map((wf: any, idx: number) => {
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
                  </Card>
                );
              })}
            </Stack>
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
