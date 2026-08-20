import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Grid, TextField, Button,
  Chip, Avatar, Divider, Stack, Alert, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
  Tab, Tabs, IconButton, Tooltip
} from '@mui/material';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LanguageIcon from '@mui/icons-material/Language';
import YouTubeIcon from '@mui/icons-material/YouTube';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import Navbar from '../components/Navbar';
import UniversalVideoPlayer, { parseVideoSource } from '../components/UniversalVideoPlayer';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../api';

interface DeliveredWorkflow {
  id: string;
  title: string;
  category: string;
  businessImpact: string;
  demoVideoUrl: string;
  videoDurationSeconds?: number;
  techStack: string[];
  liveUrl: string;
}

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Profile Fields
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState(2800);
  const [skillsInput, setSkillsInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Workflows State
  const [workflows, setWorkflows] = useState<DeliveredWorkflow[]>([]);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);

  // Workflow Dialog State
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
  const [wfTitle, setWfTitle] = useState('');
  const [wfCategory, setWfCategory] = useState('');
  const [wfImpact, setWfImpact] = useState('');
  const [wfVideoUrl, setWfVideoUrl] = useState('');
  const [wfTechInput, setWfTechInput] = useState('');
  const [wfLiveUrl, setWfLiveUrl] = useState('');
  const [videoInputMode, setVideoInputMode] = useState<'upload' | 'youtube' | 'loom'>('upload');

  // Video Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await (profileApi.getProfile ? profileApi.getProfile() : profileApi.getMe());
      const p = res.data;
      setHeadline(p.headline || '');
      setBio(p.bio || '');
      setHourlyRate(p.hourlyRate || 2800);
      setSkillsInput(p.skills ? p.skills.join(', ') : '');
      setGithubUrl(p.links?.github || '');
      setLinkedinUrl(p.links?.linkedin || '');
      setWebsiteUrl(p.links?.website || '');
      
      const wfs = p.deliveredWorkflows || [];
      setWorkflows(wfs);
      if (wfs.length > 0) {
        setActiveWorkflowId(wfs[0].id);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
      await (profileApi.updateProfile ? profileApi.updateProfile : profileApi.updateMe)({
        headline,
        bio,
        hourlyRate: Number(hourlyRate),
        skills,
        links: { github: githubUrl, linkedin: linkedinUrl, website: websiteUrl },
        deliveredWorkflows: workflows,
      });
      setSuccessMessage('✅ Profile & Delivered Workflows saved successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAddWorkflow = () => {
    setEditingWorkflowId(null);
    setWfTitle('');
    setWfCategory('Email Automation & Growth');
    setWfImpact('');
    setWfVideoUrl('');
    setWfTechInput('Python, FastAPI, SendGrid API, PostgreSQL');
    setWfLiveUrl('');
    setVideoInputMode('upload');
    setUploadErrorMsg(null);
    setUploadSuccessMsg(null);
    setWorkflowDialogOpen(true);
  };

  const handleOpenEditWorkflow = (wf: DeliveredWorkflow) => {
    setEditingWorkflowId(wf.id);
    setWfTitle(wf.title);
    setWfCategory(wf.category);
    setWfImpact(wf.businessImpact);
    setWfVideoUrl(wf.demoVideoUrl);
    setWfTechInput(wf.techStack ? wf.techStack.join(', ') : '');
    setWfLiveUrl(wf.liveUrl);

    const parsed = parseVideoSource(wf.demoVideoUrl);
    if (parsed.type === 'youtube') setVideoInputMode('youtube');
    else if (parsed.type === 'loom') setVideoInputMode('loom');
    else setVideoInputMode('upload');

    setUploadErrorMsg(null);
    setUploadSuccessMsg(null);
    setWorkflowDialogOpen(true);
  };

  const handleSaveWorkflowDialog = async () => {
    if (!wfTitle.trim()) {
      setUploadErrorMsg('Please enter a title for the workflow');
      return;
    }

    const techStack = wfTechInput.split(',').map(s => s.trim()).filter(Boolean);
    let updatedList: DeliveredWorkflow[] = [];

    if (editingWorkflowId) {
      updatedList = workflows.map(w => {
        if (w.id === editingWorkflowId) {
          return {
            ...w,
            title: wfTitle,
            category: wfCategory,
            businessImpact: wfImpact,
            demoVideoUrl: wfVideoUrl,
            techStack,
            liveUrl: wfLiveUrl
          };
        }
        return w;
      });
    } else {
      const newWf: DeliveredWorkflow = {
        id: `wf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: wfTitle,
        category: wfCategory,
        businessImpact: wfImpact,
        demoVideoUrl: wfVideoUrl,
        techStack,
        liveUrl: wfLiveUrl
      };
      updatedList = [...workflows, newWf];
      setActiveWorkflowId(newWf.id);
    }

    try {
      setSaving(true);
      await (profileApi.updateProfile ? profileApi.updateProfile : profileApi.updateMe)({ deliveredWorkflows: updatedList });
      setWorkflows(updatedList);
      setWorkflowDialogOpen(false);
      setSuccessMessage('✅ Workflow case study updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setUploadErrorMsg(err.message || 'Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this delivered workflow?')) return;
    const updatedList = workflows.filter(w => w.id !== id);
    try {
      setSaving(true);
      await (profileApi.updateProfile ? profileApi.updateProfile : profileApi.updateMe)({ deliveredWorkflows: updatedList });
      setWorkflows(updatedList);
      if (activeWorkflowId === id) {
        setActiveWorkflowId(updatedList[0]?.id || null);
      }
    } catch (err: any) {
      alert('Failed to delete workflow: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGcsFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadErrorMsg(null);
    setUploadSuccessMsg(null);
    setUploading(true);

    const videoObj = document.createElement('video');
    videoObj.preload = 'metadata';
    videoObj.src = URL.createObjectURL(file);

    videoObj.onloadedmetadata = async () => {
      window.URL.revokeObjectURL(videoObj.src);
      const durationSeconds = Math.round(videoObj.duration);

      if (durationSeconds > 120) {
        setUploadErrorMsg(`⚠️ Video is too long (${durationSeconds}s). Maximum allowed length is 2 minutes (120s).`);
        setUploading(false);
        return;
      }

      try {
        setUploadSuccessMsg(`Uploading ${file.name} (${durationSeconds}s) to Google Cloud Storage...`);
        const formData = new FormData();
        formData.append('video', file);
        formData.append('workflowId', editingWorkflowId || 'wf-draft');
        formData.append('durationSeconds', String(durationSeconds));

        const res = await profileApi.uploadVideoDirect(formData);
        const { publicUrl } = res.data;
        setWfVideoUrl(publicUrl);
        setUploadSuccessMsg('✅ Video uploaded successfully to Google Cloud bucket!');
      } catch (err: any) {
        setUploadErrorMsg(err?.response?.data?.error || err.message || 'Upload failed');
      } finally {
        setUploading(false);
      }
    };

    videoObj.onerror = () => {
      setUploadErrorMsg('Could not read video file. Please ensure it is a valid MP4/WebM video.');
      setUploading(false);
    };
  };

  const activeWf = workflows.find(w => w.id === activeWorkflowId) || workflows[0];

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 12 }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ pt: 5 }}>
        {/* Header User Card */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            mb: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar
              src={user?.photoURL}
              sx={{ width: 72, height: 72, bgcolor: '#2563eb', fontSize: '1.8rem', fontWeight: 800 }}
            >
              {user?.name?.[0] || 'M'}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={800} color="#0f172a">
                {user?.name || 'Maqs'}
              </Typography>
              <Typography variant="body2" color="#64748b">
                {user?.email || 'l.maqsood.m@gmail.com'}
              </Typography>
              <Chip
                label={`Role: ${user?.role || 'freelancer'}`}
                size="small"
                sx={{ mt: 1, bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: '0.75rem' }}
              />
            </Box>
          </Stack>

          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
            onClick={handleSaveAll}
            disabled={saving}
            sx={{
              bgcolor: '#2563eb',
              textTransform: 'none',
              fontWeight: 700,
              px: 3.5,
              py: 1.2,
              borderRadius: 2.5,
              '&:hover': { bgcolor: '#1d4ed8' }
            }}
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </Paper>

        {successMessage && <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>{successMessage}</Alert>}

        {/* 🎬 DELIVERED WORKFLOWS & VIDEO CASE STUDIES */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            mb: 5,
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={800} color="#0f172a">
                🎬 Delivered Workflows & Video Case Studies ({workflows.length})
              </Typography>
              <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
                Showcase working AI automations with Google Cloud MP4 videos, YouTube demos, or Loom walkthroughs.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                onClick={() => window.location.href = '/profile/workflows'}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, borderColor: '#cbd5e1', color: '#334155' }}
              >
                Dedicated Page ➔
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddWorkflow}
                sx={{
                  bgcolor: '#2563eb',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 2.5,
                  borderRadius: 2,
                  '&:hover': { bgcolor: '#1d4ed8' }
                }}
              >
                + Add Delivered Workflow
              </Button>
            </Stack>
          </Box>

          {/* Active Featured Video Player */}
          {activeWf && (
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', mb: 4 }}>
              <Typography variant="overline" color="#2563eb" fontWeight={800} letterSpacing={1}>
                ▶️ ACTIVE VIDEO DEMO
              </Typography>
              <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ mb: 2 }}>
                {activeWf.title}
              </Typography>

              <UniversalVideoPlayer url={activeWf.demoVideoUrl} title={activeWf.title} />

              <Box sx={{ mt: 2.5, p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <TrendingUpIcon sx={{ color: '#16a34a' }} />
                  <Typography variant="subtitle2" fontWeight={700} color="#166534">
                    Business Impact:
                  </Typography>
                  <Typography variant="body2" color="#166534">
                    {activeWf.businessImpact}
                  </Typography>
                </Stack>
              </Box>
            </Paper>
          )}

          {/* Workflow Cards Grid */}
          <Grid container spacing={2.5}>
            {workflows.map((wf) => {
              const isSelected = activeWf?.id === wf.id;
              const videoParsed = parseVideoSource(wf.demoVideoUrl);

              return (
                <Grid size={{ xs: 12, md: 6 }} key={wf.id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      boxShadow: isSelected ? '0 8px 25px rgba(37,99,235,0.1)' : '0 2px 10px rgba(0,0,0,0.02)',
                      transition: 'all 0.2s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: '#fff'
                    }}
                  >
                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                        <Chip
                          label={wf.category}
                          size="small"
                          sx={{ bgcolor: '#e0e7ff', color: '#3730a3', fontWeight: 700, fontSize: '0.75rem' }}
                        />
                        <Chip
                          icon={videoParsed.type === 'youtube' ? <YouTubeIcon sx={{ fontSize: 16 }} /> : <VideoLibraryIcon sx={{ fontSize: 16 }} />}
                          label={videoParsed.type === 'youtube' ? 'YouTube' : videoParsed.type === 'loom' ? 'Loom' : 'GCS MP4'}
                          size="small"
                          sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: '0.7rem' }}
                        />
                      </Stack>

                      <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ mb: 1.5, lineHeight: 1.3 }}>
                        {wf.title}
                      </Typography>

                      <Typography variant="body2" color="#475569" sx={{ mb: 2, minHeight: 40 }}>
                        {wf.businessImpact}
                      </Typography>

                      <Stack direction="row" flexWrap="wrap" gap={0.8} sx={{ mb: 3 }}>
                        {wf.techStack?.map(t => (
                          <Chip key={t} label={t} size="small" variant="outlined" sx={{ borderColor: '#cbd5e1', color: '#334155', fontSize: '0.75rem' }} />
                        ))}
                      </Stack>

                      <Divider sx={{ my: 2 }} />

                      <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                        <Button
                          variant={isSelected ? 'contained' : 'outlined'}
                          size="small"
                          startIcon={<PlayCircleFilledWhiteIcon />}
                          onClick={() => setActiveWorkflowId(wf.id)}
                          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                        >
                          {isSelected ? 'Playing' : 'Play Demo'}
                        </Button>

                        <Stack direction="row" spacing={1}>
                          <IconButton size="small" onClick={() => handleOpenEditWorkflow(wf)} sx={{ border: '1px solid #e2e8f0', color: '#2563eb' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteWorkflow(wf.id)} sx={{ border: '1px solid #e2e8f0', color: '#ef4444' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>

        {/* General Profile Info */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
          <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ mb: 3 }}>
            General Profile & Contact Links
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Professional Headline / Specialty"
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Detailed Bio / Background"
                value={bio}
                onChange={e => setBio(e.target.value)}
                multiline
                rows={3}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Skills & Frameworks (comma-separated)"
                value={skillsInput}
                onChange={e => setSkillsInput(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Hourly Rate (₹/hr)"
                type="number"
                value={hourlyRate}
                onChange={e => setHourlyRate(Number(e.target.value))}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="GitHub URL"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="LinkedIn URL"
                value={linkedinUrl}
                onChange={e => setLinkedinUrl(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Portfolio / Website URL"
                value={websiteUrl}
                onChange={e => setWebsiteUrl(e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Workflow Dialog Modal */}
        <Dialog open={workflowDialogOpen} onClose={() => setWorkflowDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>
            {editingWorkflowId ? '✏️ Edit Delivered Workflow' : '✨ Add Delivered Workflow & Case Study'}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {uploadErrorMsg && <Alert severity="error" sx={{ mb: 2.5 }}>{uploadErrorMsg}</Alert>}
            {uploadSuccessMsg && <Alert severity="success" sx={{ mb: 2.5 }}>{uploadSuccessMsg}</Alert>}

            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                label="Workflow Title"
                placeholder="e.g. Automated Cold Email Sending & DNS Deliverability Pipeline"
                value={wfTitle}
                onChange={e => setWfTitle(e.target.value)}
                fullWidth
                required
              />

              <TextField
                label="Category / Niche"
                placeholder="e.g. Email Automation, Computer Vision, LLM & RAG, Meta Ads"
                value={wfCategory}
                onChange={e => setWfCategory(e.target.value)}
                fullWidth
              />

              <TextField
                label="Business Impact Metrics"
                placeholder="e.g. Scaled personalized outreach to 10,000 verified leads/day with automated SPF/DKIM rotation and 99.2% inbox deliverability."
                value={wfImpact}
                onChange={e => setWfImpact(e.target.value)}
                multiline
                rows={2}
                fullWidth
              />

              <TextField
                label="Tech Stack (comma separated)"
                placeholder="Python, FastAPI, SendGrid API, PostgreSQL, Docker"
                value={wfTechInput}
                onChange={e => setWfTechInput(e.target.value)}
                fullWidth
              />

              <TextField
                label="Live Project / GitHub Repository Link"
                placeholder="https://github.com/username/project"
                value={wfLiveUrl}
                onChange={e => setWfLiveUrl(e.target.value)}
                fullWidth
              />

              {/* Video Demo Tabs Section */}
              <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" fontWeight={800} color="#0f172a" gutterBottom>
                  🎬 Video Demo Integration (GCS MP4, YouTube, or Loom)
                </Typography>

                <Tabs
                  value={videoInputMode}
                  onChange={(_, val) => setVideoInputMode(val)}
                  sx={{ mb: 2, borderBottom: '1px solid #e2e8f0' }}
                >
                  <Tab label="Direct GCS Video (< 2 min)" value="upload" sx={{ textTransform: 'none', fontWeight: 700 }} />
                  <Tab label="YouTube URL" value="youtube" sx={{ textTransform: 'none', fontWeight: 700 }} />
                  <Tab label="Loom URL" value="loom" sx={{ textTransform: 'none', fontWeight: 700 }} />
                </Tabs>

                {videoInputMode === 'upload' && (
                  <Box>
                    <Typography variant="body2" color="#64748b" sx={{ mb: 2 }}>
                      Upload an MP4 video demo directly into Google Cloud Storage (limit: strictly under 2 minutes / 120 seconds).
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={uploading ? <CircularProgress size={18} /> : <CloudUploadIcon />}
                      disabled={uploading}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                    >
                      {uploading ? 'Uploading to GCS...' : 'Choose MP4 Video (< 2 min)'}
                      <input type="file" hidden accept="video/mp4,video/webm" onChange={handleGcsFileUpload} />
                    </Button>
                  </Box>
                )}

                {videoInputMode === 'youtube' && (
                  <TextField
                    label="YouTube Video Link"
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    value={wfVideoUrl}
                    onChange={e => setWfVideoUrl(e.target.value)}
                    fullWidth
                    helperText="Enter any YouTube public or unlisted video URL."
                  />
                )}

                {videoInputMode === 'loom' && (
                  <TextField
                    label="Loom Share Link"
                    placeholder="https://www.loom.com/share/..."
                    value={wfVideoUrl}
                    onChange={e => setWfVideoUrl(e.target.value)}
                    fullWidth
                    helperText="Enter any Loom video share link."
                  />
                )}

                {wfVideoUrl && (
                  <Box sx={{ mt: 2.5 }}>
                    <Typography variant="caption" fontWeight={700} color="#475569" display="block" sx={{ mb: 1 }}>
                      Live Preview:
                    </Typography>
                    <UniversalVideoPlayer url={wfVideoUrl} title={wfTitle} />
                  </Box>
                )}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
            <Button onClick={() => setWorkflowDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
              onClick={handleSaveWorkflowDialog}
              disabled={saving || uploading}
              sx={{ bgcolor: '#2563eb', textTransform: 'none', fontWeight: 700, px: 3, borderRadius: 2 }}
            >
              {saving ? 'Saving...' : 'Save Workflow'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Profile;
