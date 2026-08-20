import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Grid, TextField, Button,
  Chip, Divider, Stack, Alert, Card, CardContent,
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
import YouTubeIcon from '@mui/icons-material/YouTube';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
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

export const Workflows: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workflows, setWorkflows] = useState<DeliveredWorkflow[]>([]);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWfId, setEditingWfId] = useState<string | null>(null);
  const [wfTitle, setWfTitle] = useState('');
  const [wfCategory, setWfCategory] = useState('');
  const [wfImpact, setWfImpact] = useState('');
  const [wfVideoUrl, setWfVideoUrl] = useState('');
  const [wfTechInput, setWfTechInput] = useState('');
  const [wfLiveUrl, setWfLiveUrl] = useState('');
  const [videoInputMode, setVideoInputMode] = useState<'upload' | 'youtube' | 'loom'>('upload');

  // Upload feedback
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const res = await (profileApi.getProfile ? profileApi.getProfile() : profileApi.getMe());
      const list = res.data.deliveredWorkflows || [];
      setWorkflows(list);
      if (list.length > 0) {
        setActiveWorkflowId(list[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (wf?: DeliveredWorkflow) => {
    if (wf) {
      setEditingWfId(wf.id);
      setWfTitle(wf.title);
      setWfCategory(wf.category);
      setWfImpact(wf.businessImpact);
      setWfVideoUrl(wf.demoVideoUrl || '');
      setWfTechInput(wf.techStack ? wf.techStack.join(', ') : '');
      setWfLiveUrl(wf.liveUrl || '');
      const parsed = parseVideoSource(wf.demoVideoUrl);
      if (parsed.type === 'youtube') setVideoInputMode('youtube');
      else if (parsed.type === 'loom') setVideoInputMode('loom');
      else setVideoInputMode('upload');
    } else {
      setEditingWfId(null);
      setWfTitle('');
      setWfCategory('Email Automation & Growth');
      setWfImpact('');
      setWfVideoUrl('');
      setWfTechInput('Python, FastAPI, SendGrid');
      setWfLiveUrl('');
      setVideoInputMode('upload');
    }
    setErrorMsg(null);
    setUploadMsg(null);
    setIsModalOpen(true);
  };

  const handleSaveWorkflow = async () => {
    if (!wfTitle.trim()) {
      setErrorMsg('Please enter a workflow title');
      return;
    }

    const techStack = wfTechInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    let updatedList: DeliveredWorkflow[] = [];

    if (editingWfId) {
      updatedList = workflows.map(w => {
        if (w.id === editingWfId) {
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
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this delivered workflow case study?')) return;
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

    setErrorMsg(null);
    setUploadMsg(null);
    setUploading(true);

    const videoObj = document.createElement('video');
    videoObj.preload = 'metadata';
    videoObj.src = URL.createObjectURL(file);

    videoObj.onloadedmetadata = async () => {
      window.URL.revokeObjectURL(videoObj.src);
      const durationSeconds = Math.round(videoObj.duration);

      if (durationSeconds > 120) {
        setErrorMsg(`⚠️ Video is too long (${durationSeconds}s). Maximum allowed length is 2 minutes (120s).`);
        setUploading(false);
        return;
      }

      try {
        setUploadMsg(`Uploading ${file.name} (${durationSeconds}s) to Google Cloud...`);
        const formData = new FormData();
        formData.append('video', file);
        formData.append('workflowId', editingWfId || 'wf-draft');
        formData.append('durationSeconds', String(durationSeconds));

        const res = await profileApi.uploadVideoDirect(formData);
        const { publicUrl } = res.data;
        setWfVideoUrl(publicUrl);
        setUploadMsg('✅ Video uploaded successfully to Google Cloud Storage!');
      } catch (err: any) {
        setErrorMsg(err?.response?.data?.error || err.message || 'Upload failed');
      } finally {
        setUploading(false);
      }
    };

    videoObj.onerror = () => {
      setErrorMsg('Could not read video file. Please ensure it is a valid MP4/WebM video.');
      setUploading(false);
    };
  };

  const activeWf = workflows.find(w => w.id === activeWorkflowId) || workflows[0];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 10 }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ pt: 4 }}>
        {/* Header Navigation */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton onClick={() => navigate('/profile')} sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0' }}>
              <ArrowBackIcon sx={{ color: '#0f172a' }} />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight={800} color="#0f172a">
                🎬 Delivered Workflows & Video Case Studies
              </Typography>
              <Typography variant="body2" color="#64748b">
                Showcase working AI automations with Google Cloud MP4 videos, YouTube demos, or Loom walkthroughs.
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            sx={{
              bgcolor: '#2563eb',
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              py: 1.2,
              borderRadius: 2.5,
              '&:hover': { bgcolor: '#1d4ed8' }
            }}
          >
            Add New Workflow
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : workflows.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, bgcolor: '#fff', border: '1px dashed #cbd5e1' }}>
            <VideoLibraryIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
            <Typography variant="h6" fontWeight={700} color="#1e293b" gutterBottom>
              No Workflows Added Yet
            </Typography>
            <Typography variant="body2" color="#64748b" sx={{ mb: 3 }}>
              Add your first Delivered Workflow case study with a video demo to show clients your real-world AI automations.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()} sx={{ bgcolor: '#2563eb', textTransform: 'none' }}>
              Create Workflow
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {/* Active Video Player Showcase */}
            {activeWf && (
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', mb: 2 }}>
                  <Typography variant="overline" color="#2563eb" fontWeight={800} letterSpacing={1}>
                    ▶️ ACTIVE VIDEO DEMO
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="#0f172a" sx={{ mb: 2 }}>
                    {activeWf.title}
                  </Typography>

                  <UniversalVideoPlayer url={activeWf.demoVideoUrl} title={activeWf.title} />

                  <Box sx={{ mt: 3, p: 2.5, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
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
              </Grid>
            )}

            {/* Individual Workflow Cards */}
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
                          <IconButton size="small" onClick={() => handleOpenModal(wf)} sx={{ border: '1px solid #e2e8f0', color: '#2563eb' }}>
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
        )}

        {/* Workflow Creation & Editing Dialog */}
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>
            {editingWfId ? '✏️ Edit Delivered Workflow' : '✨ Add Delivered Workflow & Case Study'}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {errorMsg && <Alert severity="error" sx={{ mb: 2.5 }}>{errorMsg}</Alert>}
            {uploadMsg && <Alert severity="success" sx={{ mb: 2.5 }}>{uploadMsg}</Alert>}

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

              {/* Video Demo Section */}
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
            <Button onClick={() => setIsModalOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
              onClick={handleSaveWorkflow}
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

export default Workflows;
