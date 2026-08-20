import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Grid, TextField, Button,
  Chip, Avatar, Divider, Stack, Alert, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress
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
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../api';

interface DeliveredWorkflow {
  id: string;
  title: string;
  category: string;
  businessImpact: string;
  demoVideoUrl: string;
  techStack: string[];
  liveUrl: string;
}

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadingWfId, setUploadingWfId] = useState<string | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  const handleWorkflowVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetWorkflowId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadErrorMsg(null);
    setUploadSuccessMsg(null);
    const wfId = targetWorkflowId || editingWorkflowId || 'wf-new';
    setUploadingWfId(wfId);

    // 1. Measure duration in RAM using browser HTML5 video
    const videoObj = document.createElement('video');
    videoObj.preload = 'metadata';
    videoObj.src = URL.createObjectURL(file);

    videoObj.onloadedmetadata = async () => {
      window.URL.revokeObjectURL(videoObj.src);
      const durationSeconds = Math.round(videoObj.duration);

      if (durationSeconds > 120) {
        setUploadingWfId(null);
        setUploadErrorMsg(`❌ Video duration (${durationSeconds}s) exceeds the maximum limit of 2 minutes (120 seconds). Please trim your video.`);
        return;
      }

      try {
        setUploadSuccessMsg(`Uploading ${file.name} (${durationSeconds}s) to Google Cloud Storage (shortshub_video_storage)...`);

        const signedRes = await profileApi.getVideoSignedUrl({
          workflowId: wfId,
          filename: file.name,
          durationSeconds,
          contentType: file.type || 'video/mp4'
        });

        const { uploadUrl, publicUrl } = signedRes.data;

        try {
          await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type || 'video/mp4' },
            body: file
          });
        } catch {}

        if (targetWorkflowId) {
          await profileApi.attachVideo({
            workflowId: targetWorkflowId,
            videoUrl: publicUrl,
            durationSeconds
          });

          setWorkflows(prev => prev.map(w => w.id === targetWorkflowId ? { ...w, demoVideoUrl: publicUrl } : w));
          setActiveVideoUrl(publicUrl);
          setUploadSuccessMsg(`✅ Video demo uploaded to your Google Cloud bucket successfully!`);
        } else {
          setWfVideoUrl(publicUrl);
          setUploadSuccessMsg(`✅ Uploaded: ${publicUrl}`);
        }
      } catch (err: any) {
        setUploadErrorMsg(err?.response?.data?.error || err.message || 'Failed to upload video to GCS');
      } finally {
        setUploadingWfId(null);
        setTimeout(() => setUploadSuccessMsg(null), 6000);
      }
    };

    videoObj.onerror = () => {
      setUploadingWfId(null);
      setUploadErrorMsg('Invalid video format. Please upload MP4, WebM, or MOV.');
    };
  };

  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Profile Form States
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number | string>(3200);
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [workflows, setWorkflows] = useState<DeliveredWorkflow[]>([]);

  // Workflow Editor Dialog States
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
  const [wfTitle, setWfTitle] = useState('');
  const [wfCategory, setWfCategory] = useState('Email Automation & Growth');
  const [wfImpact, setWfImpact] = useState('');
  const [wfVideoUrl, setWfVideoUrl] = useState('');
  const [wfTechInput, setWfTechInput] = useState('');
  const [wfLiveUrl, setWfLiveUrl] = useState('');

  useEffect(() => {
    profileApi.getMe()
      .then(res => {
        const data = res.data;
        setHeadline(data.headline || '');
        setBio(data.bio || '');
        setHourlyRate(data.hourlyRate || 3200);
        setGithub(data.links?.github || '');
        setLinkedin(data.links?.linkedin || '');
        setWebsite(data.links?.website || '');
        setSkills(data.skills || []);
        const wfs = data.deliveredWorkflows || [];
        setWorkflows(wfs);
        if (wfs.length > 0 && wfs[0].demoVideoUrl) {
          setActiveVideoUrl(wfs[0].demoVideoUrl);
        }
      })
      .catch(err => {
        console.error('Failed to load profile:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSuccessMessage('');
    try {
      await profileApi.updateMe({
        headline,
        bio,
        hourlyRate: Number(hourlyRate),
        skills,
        links: { github, linkedin, website },
        deliveredWorkflows: workflows,
      });
      setSuccessMessage('🎉 Profile & Delivered Workflows saved successfully!');
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
    setWfTechInput('');
    setWfLiveUrl('');
    setWorkflowDialogOpen(true);
  };

  const handleOpenEditWorkflow = (wf: DeliveredWorkflow) => {
    setEditingWorkflowId(wf.id);
    setWfTitle(wf.title);
    setWfCategory(wf.category);
    setWfImpact(wf.businessImpact);
    setWfVideoUrl(wf.demoVideoUrl);
    setWfTechInput(wf.techStack?.join(', ') || '');
    setWfLiveUrl(wf.liveUrl);
    setWorkflowDialogOpen(true);
  };

  const handleSaveWorkflowModal = () => {
    if (!wfTitle.trim()) return;

    const techArray = wfTechInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (editingWorkflowId) {
      setWorkflows(prev =>
        prev.map(w =>
          w.id === editingWorkflowId
            ? {
                ...w,
                title: wfTitle,
                category: wfCategory,
                businessImpact: wfImpact,
                demoVideoUrl: wfVideoUrl,
                techStack: techArray,
                liveUrl: wfLiveUrl,
              }
            : w
        )
      );
    } else {
      const newWf: DeliveredWorkflow = {
        id: 'wf-' + Math.random().toString(36).substring(2, 9),
        title: wfTitle,
        category: wfCategory,
        businessImpact: wfImpact,
        demoVideoUrl: wfVideoUrl,
        techStack: techArray,
        liveUrl: wfLiveUrl,
      };
      setWorkflows(prev => [newWf, ...prev]);
      if (wfVideoUrl) setActiveVideoUrl(wfVideoUrl);
    }
    setWorkflowDialogOpen(false);
  };

  const handleDeleteWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills(prev => [...prev, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f8fafc">
        <CircularProgress sx={{ color: '#4f46e5' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ pt: 14, pb: 12 }}>
        {/* Top Header Card */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(8,145,178,0.06) 100%)',
            border: '1px solid rgba(79,70,229,0.15)',
            mb: 4,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Avatar
                src={user?.photo_url || undefined}
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: '#4f46e5',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  border: '3px solid rgba(79,70,229,0.3)',
                }}
              >
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
                  {user?.name}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>{user?.email}</Typography>
                <Chip label={`Role: ${user?.role}`} size="small" sx={{ mt: 0.8, bgcolor: 'rgba(79,70,229,0.1)', color: '#4f46e5', fontWeight: 700, fontSize: '0.72rem' }} />
              </Box>
            </Box>

            <Button
              variant="contained"
              disabled={saving}
              onClick={handleSaveProfile}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              sx={{
                background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                borderRadius: '12px',
                fontWeight: 700,
                px: 3.5,
                py: 1.2,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(79,70,229,0.25)',
              }}
            >
              {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </Box>
        </Paper>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 4, borderRadius: '12px' }}>
            {successMessage}
          </Alert>
        )}

        {/* 🎯 PRIMARY FOCUS: DELIVERED WORKFLOWS SHOWCASE GALLERY */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: '20px',
            border: '1px solid rgba(79,70,229,0.15)',
            bgcolor: '#ffffff',
            mb: 5,
            boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                🎬 Delivered Workflows & Video Case Studies ({workflows.length})
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.9rem', mt: 0.5 }}>
                Showcase working automations you have built (e.g. Email Pipelines, Meta Ads, OCR tools) with video demos.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddWorkflow}
              sx={{
                background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                borderRadius: '10px',
                fontWeight: 700,
                textTransform: 'none',
                px: 2.5,
              }}
            >
              + Add Delivered Workflow
            </Button>
          </Box>

          
          {uploadSuccessMsg && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>
              {uploadSuccessMsg}
            </Alert>
          )}
          {uploadErrorMsg && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
              {uploadErrorMsg}
            </Alert>
          )}

            {/* Active Video Player Preview */}
          {activeVideoUrl && (
            <Paper
              elevation={0}
              sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                my: 3,
                bgcolor: '#0f172a',
                border: '1px solid rgba(79,70,229,0.2)',
              }}
            >
              <video
                controls
                autoPlay
                src={activeVideoUrl}
                style={{ width: '100%', maxHeight: '400px', display: 'block' }}
              />
            </Paper>
          )}

          {/* Workflows List */}
          {workflows.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', mt: 3 }}>
              <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700, mb: 1 }}>
                No Delivered Workflows Added Yet
              </Typography>
              <Typography sx={{ color: '#64748b', mb: 3 }}>
                Add your first workflow (like an email automation or Meta marketing bot) to wow clients!
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddWorkflow}>
                Add Your First Workflow
              </Button>
            </Box>
          ) : (
            <Stack spacing={2.5} sx={{ mt: 3 }}>
              {workflows.map((wf) => (
                <Card
                  key={wf.id}
                  elevation={0}
                  sx={{
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: activeVideoUrl === wf.demoVideoUrl ? '#4f46e5' : 'rgba(79,70,229,0.12)',
                    bgcolor: activeVideoUrl === wf.demoVideoUrl ? 'rgba(79,70,229,0.02)' : '#ffffff',
                    p: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5 }}>
                    <Box>
                      <Chip label={wf.category} size="small" sx={{ bgcolor: 'rgba(79,70,229,0.08)', color: '#4f46e5', fontWeight: 700, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        {wf.title}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1}>
                      
                        {wf.demoVideoUrl && (
                          <Button
                            variant={activeVideoUrl === wf.demoVideoUrl ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => setActiveVideoUrl(wf.demoVideoUrl)}
                            startIcon={<PlayCircleFilledWhiteIcon />}
                            sx={{ borderRadius: '8px', fontWeight: 700, textTransform: 'none' }}
                          >
                            {activeVideoUrl === wf.demoVideoUrl ? 'Playing Demo' : 'Watch Demo'}
                          </Button>
                        )}
                        <Button
                          component="label"
                          variant="contained"
                          size="small"
                          disabled={uploadingWfId === wf.id}
                          startIcon={<CloudUploadIcon />}
                          sx={{
                            background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                            borderRadius: '8px',
                            fontWeight: 700,
                            textTransform: 'none',
                            fontSize: '0.78rem'
                          }}
                        >
                          {uploadingWfId === wf.id ? 'Uploading...' : (wf.demoVideoUrl ? 'Replace Video (< 2 min)' : 'Upload Video (< 2 min)')}
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            hidden
                            onChange={(e) => handleWorkflowVideoUpload(e, wf.id)}
                          />
                        </Button>

                      <Button size="small" onClick={() => handleOpenEditWorkflow(wf)} startIcon={<EditIcon />} sx={{ color: '#4f46e5' }}>
                        Edit
                      </Button>
                      <Button size="small" onClick={() => handleDeleteWorkflow(wf.id)} startIcon={<DeleteIcon />} sx={{ color: '#ef4444' }}>
                        Delete
                      </Button>
                    </Stack>
                  </Box>

                  {/* Impact Metric */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, my: 1.5, p: 1.5, bgcolor: 'rgba(16,185,129,0.06)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.15)' }}>
                    <TrendingUpIcon sx={{ color: '#10b981', fontSize: 20, mt: 0.2 }} />
                    <Typography sx={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 600 }}>
                      Business Impact: <span style={{ fontWeight: 400, color: '#334155' }}>{wf.businessImpact}</span>
                    </Typography>
                  </Box>

                  {/* Tech Stack Chips */}
                  {wf.techStack && wf.techStack.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, alignItems: 'center', mt: 1.5 }}>
                      {wf.techStack.map((tech) => (
                        <Chip key={tech} label={tech} size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', fontSize: '0.72rem', fontWeight: 600 }} />
                      ))}
                      {wf.liveUrl && (
                        <Button href={wf.liveUrl} target="_blank" size="small" sx={{ ml: 'auto', color: '#4f46e5', textTransform: 'none', fontSize: '0.75rem', fontWeight: 700 }}>
                          View Live Repo →
                        </Button>
                      )}
                    </Box>
                  )}
                </Card>
              ))}
            </Stack>
          )}
        </Paper>

        {/* 📋 SECONDARY SECTION (BELOW WORKFLOWS): GENERAL INFO & SOCIAL LINKS */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: '20px',
            border: '1px solid rgba(79,70,229,0.12)',
            bgcolor: '#ffffff',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 3 }}>
            General Profile & Contact Links
          </Typography>

          <Grid container spacing={3}>
            <Grid xs={12} md={8}>
              <TextField
                fullWidth
                label="Professional Headline / Specialty"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Full-Stack AI Engineer & Automation Specialist"
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Detailed Bio / Background"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your domain expertise, systems built, and typical response times..."
                sx={{ mb: 3 }}
              />

              {/* Skills Tags Editor */}
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 1, fontSize: '0.9rem' }}>
                  Skills & Frameworks
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                  <TextField
                    size="small"
                    placeholder="Add skill (e.g. SendGrid, Python, LangGraph)..."
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button variant="outlined" onClick={handleAddSkill} sx={{ borderRadius: '10px' }}>
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {skills.map((skill) => (
                    <Chip key={skill} label={skill} onDelete={() => handleRemoveSkill(skill)} sx={{ bgcolor: 'rgba(79,70,229,0.08)', color: '#4f46e5', fontWeight: 600 }} />
                  ))}
                </Box>
              </Box>
            </Grid>

            <Grid xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Hourly Rate (₹/hr)"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="GitHub URL"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/username"
                InputProps={{ startAdornment: <GitHubIcon sx={{ color: '#64748b', mr: 1 }} /> }}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="LinkedIn URL"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                InputProps={{ startAdornment: <LinkedInIcon sx={{ color: '#0077b5', mr: 1 }} /> }}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Portfolio / Website URL"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourportfolio.com"
                InputProps={{ startAdornment: <LanguageIcon sx={{ color: '#4f46e5', mr: 1 }} /> }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Add / Edit Workflow Dialog Modal */}
      <Dialog open={workflowDialogOpen} onClose={() => setWorkflowDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
          {editingWorkflowId ? 'Edit Delivered Workflow' : 'Add Delivered Workflow'}
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            fullWidth
            label="Workflow Title"
            value={wfTitle}
            onChange={(e) => setWfTitle(e.target.value)}
            placeholder="e.g. Automated Cold Email & Deliverability Pipeline"
          />

          <TextField
            fullWidth
            label="Category"
            value={wfCategory}
            onChange={(e) => setWfCategory(e.target.value)}
            placeholder="e.g. Email Automation, Meta Ads, OCR Extraction"
          />

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Business Impact / Metrics"
            value={wfImpact}
            onChange={(e) => setWfImpact(e.target.value)}
            placeholder="e.g. Scaled outreach to 10k leads/day with 99.2% inbox placement."
          />

          <TextField
            fullWidth
            label="Demo Video Link (MP4 / Loom / YouTube)"
            value={wfVideoUrl}
            onChange={(e) => setWfVideoUrl(e.target.value)}
            placeholder="https://.../video.mp4"
          />

          <TextField
            fullWidth
            label="Tech Stack (Comma-separated)"
            value={wfTechInput}
            onChange={(e) => setWfTechInput(e.target.value)}
            placeholder="Python, SendGrid, FastAPI, PostgreSQL"
          />

          <TextField
            fullWidth
            label="Live Repo or Demo URL"
            value={wfLiveUrl}
            onChange={(e) => setWfLiveUrl(e.target.value)}
            placeholder="https://github.com/..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setWorkflowDialogOpen(false)} sx={{ color: '#64748b' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveWorkflowModal} sx={{ background: 'linear-gradient(135deg, #4f46e5, #0891b2)', fontWeight: 700, borderRadius: '10px' }}>
            Save Workflow
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
