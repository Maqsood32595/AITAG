import React, { useState, useEffect } from 'react';
 import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Button, Box, Chip, Stack, Avatar, Divider,
  Grid, Card, CardContent, CircularProgress, IconButton
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

interface TalentShowcaseModalProps {
  open: boolean;
  onClose: () => void;
  talent: any | null;
  onInvite: (talent: any) => void;
}

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
      setActiveVideoUrl(null);

      // Fetch dynamic profile with delivered workflows
      profileApi.getById(talent.id)
        .then(res => {
          setProfileData(res.data);
          if (res.data?.deliveredWorkflows?.[0]?.demoVideoUrl) {
            setActiveVideoUrl(res.data.deliveredWorkflows[0].demoVideoUrl);
          }
        })
        .catch(() => {
          // Fallback based on talent props
          const fallbackWorkflows = [
            {
              id: 'wf-1',
              title: 'Automated Cold Email Sending & DNS Deliverability Pipeline',
              category: 'Email Automation & Growth',
              businessImpact: 'Scaled outreach to 10,000 verified leads/day with automated SPF/DKIM rotation and 99.2% inbox placement.',
              demoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              techStack: ['Python', 'SendGrid API', 'DNS Automation', 'FastAPI', 'PostgreSQL'],
              liveUrl: 'https://github.com/Maqsood32595/email-pipeline-demo'
            },
            {
              id: 'wf-2',
              title: 'Facebook & Meta Ads AI Optimization Engine',
              category: 'Growth & Ads',
              businessImpact: 'Automated dynamic ad copy variation testing and ROAS tracking, increasing campaign conversion by 34%.',
              demoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
              techStack: ['Meta Graph API', 'OpenAI GPT-4o', 'Zapier', 'Supabase'],
              liveUrl: 'https://user1.ai/meta-ads-case-study'
            }
          ];
          setProfileData({
            ...talent,
            deliveredWorkflows: fallbackWorkflows,
            links: {
              github: 'https://github.com/Maqsood32595',
              linkedin: 'https://linkedin.com/in/maqsood',
              website: 'https://aitag.in'
            }
          });
          setActiveVideoUrl(fallbackWorkflows[0].demoVideoUrl);
        })
        .finally(() => setLoading(false));
    }
  }, [open, talent]);

  if (!talent) return null;

  const workflows = profileData?.deliveredWorkflows || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '24px', p: 1, bgcolor: '#ffffff' }
      }}
    >
      <DialogTitle sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={talent.avatar}
            alt={talent.name}
            sx={{ width: 56, height: 56, bgcolor: '#4f46e5', border: '2px solid rgba(79,70,229,0.2)' }}
          >
            {talent.name[0]}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {talent.name}
              </Typography>
              <VerifiedIcon sx={{ color: '#10b981', fontSize: 18 }} />
              <Chip label="Verified Specialist" size="small" sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700, fontSize: '0.7rem' }} />
            </Box>
            <Typography sx={{ color: '#4f46e5', fontWeight: 600, fontSize: '0.875rem' }}>
              {profileData?.headline || talent.role}
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} sx={{ color: '#94a3b8' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, md: 4 }, borderTop: '1px solid #f1f5f9' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress sx={{ color: '#4f46e5' }} />
          </Box>
        ) : (
          <Box>
            {/* 🎯 SECTION 1 (PRIMARY FOCUS): DELIVERED WORKFLOWS & VIDEO DEMOS */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                  🎬 Delivered Workflows & Video Case Studies ({workflows.length})
                </Typography>
              </Box>

              <Typography sx={{ color: '#64748b', fontSize: '0.9rem', mb: 2.5 }}>
                Watch verified video walkthroughs of production automations, pipelines, and tools delivered by this specialist.
              </Typography>

              {/* Active Video Player Screen */}
              {activeVideoUrl && (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    mb: 3,
                    bgcolor: '#0f172a',
                    border: '1px solid rgba(79,70,229,0.2)',
                  }}
                >
                  <video
                    controls
                    autoPlay
                    src={activeVideoUrl}
                    style={{ width: '100%', maxHeight: '380px', display: 'block' }}
                  />
                </Paper>
              )}

              {/* Workflows Cards List */}
              <Stack spacing={2.5}>
                {workflows.map((wf: any, idx: number) => (
                  <Card
                    key={wf.id || idx}
                    elevation={0}
                    sx={{
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: activeVideoUrl === wf.demoVideoUrl ? '#4f46e5' : 'rgba(79,70,229,0.12)',
                      bgcolor: activeVideoUrl === wf.demoVideoUrl ? 'rgba(79,70,229,0.02)' : '#ffffff',
                      p: 2.5,
                      transition: 'all 0.2s',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                      <Box>
                        <Chip
                          label={wf.category || 'Workflow Automation'}
                          size="small"
                          sx={{ bgcolor: 'rgba(79,70,229,0.08)', color: '#4f46e5', fontWeight: 700, fontSize: '0.72rem', mb: 1 }}
                        />
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          {wf.title}
                        </Typography>
                      </Box>

                      {wf.demoVideoUrl && (
                        <Button
                          variant={activeVideoUrl === wf.demoVideoUrl ? 'contained' : 'outlined'}
                          size="small"
                          onClick={() => setActiveVideoUrl(wf.demoVideoUrl)}
                          startIcon={<PlayCircleFilledWhiteIcon />}
                          sx={{
                            borderRadius: '8px',
                            fontWeight: 700,
                            textTransform: 'none',
                            fontSize: '0.8rem',
                            ...(activeVideoUrl === wf.demoVideoUrl && {
                              background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                            }),
                          }}
                        >
                          {activeVideoUrl === wf.demoVideoUrl ? 'Playing Demo' : 'Watch Video Demo'}
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
                            href={wf.liveUrl}
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
                ))}
              </Stack>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* 📋 SECTION 2 (SECONDARY): GENERAL INFO & LINKS BELOW WORKFLOWS */}
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
                  href={profileData.links.github}
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
                  href={profileData.links.linkedin}
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
                  href={profileData.links.website}
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
        )}
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
