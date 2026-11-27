import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Paper, Grid, TextField, Button,
  Chip, Divider, Stack, Alert, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
  Tab, Tabs, IconButton, Tooltip, MenuItem, Select, FormControl, InputLabel,
  Checkbox, FormControlLabel, ToggleButton, ToggleButtonGroup
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
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import UniversalVideoPlayer, { parseVideoSource } from '../components/UniversalVideoPlayer';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../api';
import { useMobileDetect, useBodyScrollLock } from '../utils/useMobileDetect';

export interface DeliveredWorkflow {
  id: string;
  title: string;
  category: string;
  description?: string;
  displayHeadingOnVideo?: boolean;
  demoVideoUrl: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  posterUrl?: string;
  mediaType?: 'video' | 'image';
  videoDurationSeconds?: number;
  businessImpact?: string;
  techStack?: string[];
  liveUrl?: string;
}

const WORKFLOW_DROPDOWN_OPTIONS = [
  {
    title: 'AI Vector Logo & Complete Business Branding Kit',
    category: 'Branding & Print'
  },
  {
    title: 'Viral 9:16 Promotional Video Reels with Indian AI Voiceover',
    category: 'Social & Marketing'
  },
  {
    title: 'High-Converting 5-Page Mobile Business Website with WhatsApp CTA',
    category: 'Web & Digital Presence'
  },
  {
    title: 'Studio-Grade AI Photo Transformation for Amazon & Meesho',
    category: 'Product Visuals'
  },
  {
    title: 'E-Commerce Product Listing Copy & A+ Content',
    category: 'Branding & Print'
  },
  {
    title: 'Automated Email Funnel & Customer Reactivation Sequence',
    category: 'Social & Marketing'
  }
];

export const Workflows: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile, isSmallScreen, isMobileLandscape } = useMobileDetect();
  const touchStartY = useRef<number>(0);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workflows, setWorkflows] = useState<DeliveredWorkflow[]>([]);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWfId, setEditingWfId] = useState<string | null>(null);
  const [entryMode, setEntryMode] = useState<'catalog' | 'manual'>('catalog');
  const [selectedDropdownWorkflow, setSelectedDropdownWorkflow] = useState<string>('');
  const [wfCustomTitle, setWfCustomTitle] = useState('');
  const [wfCategory, setWfCategory] = useState('Branding & Print');
  const [wfDescription, setWfDescription] = useState('');
  const [displayHeadingOnVideo, setDisplayHeadingOnVideo] = useState(true);
  const [wfVideoUrl, setWfVideoUrl] = useState('');
  const [wfMediaType, setWfMediaType] = useState<'video' | 'image'>('video');
  const [mediaUploadTab, setMediaUploadTab] = useState<'upload' | 'youtube' | 'loom'>('upload');

  // Preview Reel Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewReelIndex, setPreviewReelIndex] = useState(0);
  const [previewMuted, setPreviewMuted] = useState(true);
  useBodyScrollLock(Boolean(previewModalOpen && isMobile));

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
      console.error('Failed to load work reels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (wf?: DeliveredWorkflow) => {
    if (wf) {
      setEditingWfId(wf.id);
      const isPreset = WORKFLOW_DROPDOWN_OPTIONS.some(opt => opt.title === wf.title);
      if (isPreset) {
        setEntryMode('catalog');
        setSelectedDropdownWorkflow(wf.title);
        setWfCustomTitle('');
      } else {
        setEntryMode('manual');
        setSelectedDropdownWorkflow(WORKFLOW_DROPDOWN_OPTIONS[0].title);
        setWfCustomTitle(wf.title);
      }
      setWfCategory(wf.category);
      setWfDescription(wf.description || '');
      setDisplayHeadingOnVideo(wf.displayHeadingOnVideo !== false);
      setWfVideoUrl(wf.demoVideoUrl || wf.mediaUrl || '');
      setWfMediaType(wf.mediaType || (parseVideoSource(wf.demoVideoUrl || wf.mediaUrl).isImage ? 'image' : 'video'));
      const parsed = parseVideoSource(wf.demoVideoUrl || wf.mediaUrl);
      if (parsed.type === 'youtube') setMediaUploadTab('youtube');
      else if (parsed.type === 'loom') setMediaUploadTab('loom');
      else setMediaUploadTab('upload');
    } else {
      setEditingWfId(null);
      setEntryMode('catalog');
      setSelectedDropdownWorkflow(WORKFLOW_DROPDOWN_OPTIONS[0].title);
      setWfCategory(WORKFLOW_DROPDOWN_OPTIONS[0].category);
      setWfCustomTitle('');
      setWfDescription('');
      setDisplayHeadingOnVideo(true);
      setWfVideoUrl('');
      setWfMediaType('video');
      setMediaUploadTab('upload');
    }
    setErrorMsg(null);
    setUploadMsg(null);
    setIsModalOpen(true);
  };

  // Dropdown template selection auto-populates category
  const handleDropdownSelect = (templateTitle: string) => {
    setSelectedDropdownWorkflow(templateTitle);
    const found = WORKFLOW_DROPDOWN_OPTIONS.find(opt => opt.title === templateTitle);
    if (found) {
      setWfCategory(found.category);
    }
  };

  const handleSaveWorkflow = async () => {
    const finalTitle = entryMode === 'catalog' ? selectedDropdownWorkflow : wfCustomTitle.trim();
    if (!finalTitle) {
      setErrorMsg(entryMode === 'catalog' ? 'Please select a workflow preset' : 'Please enter a heading for your Work Reel');
      return;
    }

    let updatedList: DeliveredWorkflow[] = [];

    if (editingWfId) {
      updatedList = workflows.map(w => {
        if (w.id === editingWfId) {
          return {
            ...w,
            title: finalTitle,
            category: wfCategory,
            description: wfDescription.trim(),
            displayHeadingOnVideo,
            demoVideoUrl: wfVideoUrl,
            mediaUrl: wfVideoUrl,
            mediaType: wfMediaType,
          };
        }
        return w;
      });
    } else {
      const newWf: DeliveredWorkflow = {
        id: `wf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: finalTitle,
        category: wfCategory,
        description: wfDescription.trim(),
        displayHeadingOnVideo,
        demoVideoUrl: wfVideoUrl,
        mediaUrl: wfVideoUrl,
        mediaType: wfMediaType,
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
      setErrorMsg(err.message || 'Failed to save work reel');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Work Reel?')) return;
    const updatedList = workflows.filter(w => w.id !== id);
    try {
      setSaving(true);
      await (profileApi.updateProfile ? profileApi.updateProfile : profileApi.updateMe)({ deliveredWorkflows: updatedList });
      setWorkflows(updatedList);
      if (activeWorkflowId === id) {
        setActiveWorkflowId(updatedList[0]?.id || null);
      }
    } catch (err: any) {
      alert('Failed to delete work reel: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handles both video and picture uploads to cloud storage
  const handleMediaFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setUploadMsg(null);
    setUploading(true);

    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|svg|gif)$/i.test(file.name);

    if (isImage) {
      try {
        setUploadMsg(`Uploading ${file.name} to Cloud Storage...`);
        const formData = new FormData();
        formData.append('media', file);
        formData.append('workflowId', editingWfId || 'wf-draft');
        formData.append('mediaType', 'image');

        const res = await profileApi.uploadVideoDirect(formData);
        const { publicUrl } = res.data;
        setWfVideoUrl(publicUrl);
        setWfMediaType('image');
        setUploadMsg('✅ Photo / Picture Reel uploaded successfully!');
      } catch (err: any) {
        setErrorMsg(err?.response?.data?.error || err.message || 'Upload failed');
      } finally {
        setUploading(false);
      }
      return;
    }

    // Handle Video File
    const videoObj = document.createElement('video');
    videoObj.preload = 'metadata';
    videoObj.src = URL.createObjectURL(file);

    videoObj.onloadedmetadata = async () => {
      window.URL.revokeObjectURL(videoObj.src);
      const durationSeconds = Math.round(videoObj.duration);

      if (durationSeconds > 120) {
        setErrorMsg(`⚠️ Video is too long (${durationSeconds}s). Maximum allowed length for reels is 2 minutes (120s).`);
        setUploading(false);
        return;
      }

      try {
        setUploadMsg(`Uploading ${file.name} (${durationSeconds}s) to Google Cloud...`);
        const formData = new FormData();
        formData.append('media', file);
        formData.append('workflowId', editingWfId || 'wf-draft');
        formData.append('mediaType', 'video');
        formData.append('durationSeconds', String(durationSeconds));

        const res = await profileApi.uploadVideoDirect(formData);
        const { publicUrl } = res.data;
        setWfVideoUrl(publicUrl);
        setWfMediaType('video');
        setUploadMsg('✅ Video Reel uploaded successfully to Cloud Storage!');
      } catch (err: any) {
        setErrorMsg(err?.response?.data?.error || err.message || 'Upload failed');
      } finally {
        setUploading(false);
      }
    };

    videoObj.onerror = () => {
      setErrorMsg('Could not read media file. Please ensure it is a valid MP4/WebM video or PNG/JPG image.');
      setUploading(false);
    };
  };

  const handleOpenPreview = (index: number) => {
    setPreviewReelIndex(index);
    setPreviewModalOpen(true);
  };

  // Keyboard Down/Up arrow listener for preview reel modal
  useEffect(() => {
    if (!previewModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        setPreviewReelIndex(prev => Math.min(prev + 1, workflows.length - 1));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        setPreviewReelIndex(prev => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewModalOpen, workflows.length]);

  const activeWf = workflows.find(w => w.id === activeWorkflowId) || workflows[0];
  const currentPreviewReel = workflows[previewReelIndex] || workflows[0];

  return (
    <DashboardLayout>
      <Container maxWidth="lg">
        {/* Header Navigation */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton onClick={() => navigate('/profile')} sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0' }}>
              <ArrowBackIcon sx={{ color: '#0f172a' }} />
            </IconButton>
            <Box>
              <Typography variant="h5" fontWeight={850} color="#0f172a" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                🎬 Work Reels Studio
              </Typography>
              <Typography variant="body2" color="#64748b">
                Upload and manage delivered video reels and high-resolution picture deliverables. Visible in the public Work Reels feed.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            {workflows.length > 0 && (
              <Button
                variant="outlined"
                startIcon={<VisibilityIcon />}
                onClick={() => handleOpenPreview(0)}
                sx={{
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  borderColor: 'rgba(79,70,229,0.3)',
                  color: '#4f46e5',
                  '&:hover': { borderColor: '#4f46e5', bgcolor: 'rgba(79,70,229,0.04)' }
                }}
              >
                Preview Reels Feed
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
              sx={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                py: 1.1,
                borderRadius: 2.5,
                boxShadow: '0 4px 14px rgba(79,70,229,0.25)'
              }}
            >
              + Upload Work Reel
            </Button>
          </Stack>
        </Stack>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#4f46e5' }} />
          </Box>
        ) : workflows.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, bgcolor: '#fff', border: '1px dashed #cbd5e1' }}>
            <VideoLibraryIcon sx={{ fontSize: 52, color: '#94a3b8', mb: 2 }} />
            <Typography variant="h6" fontWeight={800} color="#0f172a" gutterBottom>
              No Work Reels Uploaded Yet
            </Typography>
            <Typography variant="body2" color="#64748b" sx={{ mb: 3, maxWidth: 460, mx: 'auto' }}>
              Upload your first video reel or image case study. Potential clients browsing the Verified Experts directory can scroll down through your reels to see your quality.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
              sx={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 2.5,
                px: 3
              }}
            >
              Upload Your First Reel
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {workflows.map((wf, idx) => {
              const mediaParsed = parseVideoSource(wf.demoVideoUrl || wf.mediaUrl, wf.mediaType);
              const isImage = wf.mediaType === 'image' || mediaParsed.isImage;

              return (
                <Grid item xs={12} md={6} key={wf.id}>
                  <Card
                    sx={{
                      borderRadius: 3.5,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: '#fff',
                      '&:hover': {
                        borderColor: 'rgba(79,70,229,0.3)',
                        boxShadow: '0 8px 24px rgba(79,70,229,0.08)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                        <Chip
                          label={`Reel #${idx + 1} • ${wf.category}`}
                          size="small"
                          sx={{ bgcolor: 'rgba(79,70,229,0.08)', color: '#4f46e5', fontWeight: 800, fontSize: '0.72rem' }}
                        />
                        <Chip
                          icon={isImage ? <PhotoCameraIcon sx={{ fontSize: '14px !important' }} /> : <VideoLibraryIcon sx={{ fontSize: '14px !important' }} />}
                          label={isImage ? 'Photo Reel' : mediaParsed.type === 'youtube' ? 'YouTube' : mediaParsed.type === 'loom' ? 'Loom' : 'Cloud Video'}
                          size="small"
                          sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '0.7rem' }}
                        />
                      </Stack>

                      {/* Prominent Reel Heading */}
                      <Typography variant="h6" fontWeight={850} color="#0f172a" sx={{ mb: 1.5, lineHeight: 1.3 }}>
                        {wf.title}
                      </Typography>

                      {/* In-Card Media Player */}
                      <Box sx={{ my: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0', bgcolor: '#090d16' }}>
                        <UniversalVideoPlayer
                          url={wf.demoVideoUrl || wf.mediaUrl}
                          posterUrl={wf.thumbnailUrl || wf.posterUrl}
                          title={wf.title}
                          mediaType={wf.mediaType}
                          autoPlay={false}
                          muted={true}
                          maxHeight={260}
                        />
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleOpenPreview(idx)}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            borderRadius: 2,
                            color: '#4f46e5',
                            borderColor: 'rgba(79,70,229,0.3)'
                          }}
                        >
                          Preview as Reel
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

        {/* ================================================================= */}
        {/* WORK REEL UPLOAD & EDIT DIALOG                                     */}
        {/* ================================================================= */}
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} fullScreen={isSmallScreen} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 850, color: '#0f172a', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" fontWeight={850}>
                {editingWfId ? '✏️ Edit Work Reel' : '✨ Upload Work Reel (Video or Photo)'}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setIsModalOpen(false)} sx={{ color: '#94a3b8' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {errorMsg && <Alert severity="error" sx={{ mb: 2.5 }}>{errorMsg}</Alert>}
            {uploadMsg && <Alert severity="success" sx={{ mb: 2.5 }}>{uploadMsg}</Alert>}

            <Stack spacing={2.5} sx={{ mt: 1 }}>
              {/* Option Selector Toggle: Catalog Workflow vs Manual Entry */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Workflow Entry Mode
                </Typography>
                <ToggleButtonGroup
                  value={entryMode}
                  exclusive
                  onChange={(_, newMode) => {
                    if (newMode) setEntryMode(newMode);
                  }}
                  fullWidth
                  size="small"
                  sx={{
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 2.5,
                    p: 0.5,
                    '& .MuiToggleButton-root': {
                      borderRadius: '8px !important',
                      border: 'none',
                      textTransform: 'none',
                      fontWeight: 700,
                      py: 1,
                      color: '#64748b',
                      '&.Mui-selected': {
                        bgcolor: '#ffffff',
                        color: '#4f46e5',
                        boxShadow: '0 2px 8px rgba(79,70,229,0.15)',
                        fontWeight: 800,
                      }
                    }
                  }}
                >
                  <ToggleButton value="catalog">
                    🎯 Select from Catalog Workflows
                  </ToggleButton>
                  <ToggleButton value="manual">
                    ✍️ Manual Entry (Custom Deliverable)
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* MODE 1: Catalog Workflow Preset Dropdown */}
              {entryMode === 'catalog' && (
                <Box sx={{ p: 2, bgcolor: 'rgba(79,70,229,0.03)', borderRadius: 2.5, border: '1px solid rgba(79,70,229,0.18)' }}>
                  <Typography variant="subtitle2" fontWeight={800} color="#4f46e5" sx={{ mb: 0.5 }}>
                    🎯 Select Workflow Preset
                  </Typography>
                  <Typography variant="caption" color="#64748b" display="block" sx={{ mb: 1.5 }}>
                    Choose an official catalog workflow. Category is automatically linked to your selection.
                  </Typography>

                  <FormControl fullWidth size="small">
                    <InputLabel id="workflow-template-label">Choose Workflow Preset</InputLabel>
                    <Select
                      labelId="workflow-template-label"
                      label="Choose Workflow Preset"
                      value={selectedDropdownWorkflow}
                      onChange={(e) => handleDropdownSelect(e.target.value)}
                    >
                      {WORKFLOW_DROPDOWN_OPTIONS.map((opt) => (
                        <MenuItem key={opt.title} value={opt.title}>
                          <strong>{opt.category}</strong>: {opt.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}

              {/* MODE 2: Manual Custom Entry */}
              {entryMode === 'manual' && (
                <Stack spacing={2} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                    ✍️ Custom Deliverable / Reel Details
                  </Typography>

                  <TextField
                    label="Reel Heading (Custom Topic) *"
                    placeholder="e.g. 3D Architectural AI Walkthrough for Luxury Villa"
                    value={wfCustomTitle}
                    onChange={e => setWfCustomTitle(e.target.value)}
                    helperText="This custom heading will be associated with this reel."
                    fullWidth
                    required
                  />

                  <TextField
                    select
                    size="small"
                    label="Service Category"
                    value={wfCategory || 'Branding & Print'}
                    onChange={e => setWfCategory(e.target.value)}
                    fullWidth
                  >
                    <MenuItem value="Branding & Print">Branding & Print (Logo Design & Branding Kit)</MenuItem>
                    <MenuItem value="Social & Marketing">Social & Marketing (Promo Reels & Videos)</MenuItem>
                    <MenuItem value="Web & Digital Presence">Web & Digital Presence (Fast Business Website & Landing Page)</MenuItem>
                    <MenuItem value="Product Visuals">Product Visuals (AI Photo Makeover)</MenuItem>
                  </TextField>
                </Stack>
              )}

              {/* Description / Deliverable Notes (Optional) */}
              <TextField
                label="Reel Description / Case Notes (Optional)"
                placeholder="e.g. Generated vector logo and complete visual kit for an organic grocery brand..."
                value={wfDescription}
                onChange={e => setWfDescription(e.target.value)}
                multiline
                rows={2}
                fullWidth
                helperText="Optional context or client results for this deliverable."
              />

              {/* "Display this heading on video" Checkbox */}
              <Box sx={{ p: 1.5, bgcolor: '#f1f5f9', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={displayHeadingOnVideo}
                      onChange={e => setDisplayHeadingOnVideo(e.target.checked)}
                      sx={{ color: '#4f46e5', '&.Mui-checked': { color: '#4f46e5' } }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={800} color="#0f172a">
                        Display this heading on the video reel overlay
                      </Typography>
                      <Typography variant="caption" color="#64748b" display="block">
                        When enabled, the heading & description appear neatly over the video. Uncheck for pure edge-to-edge media without any overlay.
                      </Typography>
                    </Box>
                  }
                />
              </Box>

              {/* 7. Media Upload Section (Videos & Pictures) */}
              <Box sx={{ p: 2.5, bgcolor: '#0f172a', borderRadius: 2.5, color: '#fff' }}>
                <Typography variant="subtitle2" fontWeight={850} color="#fff" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🎬 Upload Reel Media (Video or High-Res Picture)
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', mb: 2, display: 'block' }}>
                  Supports MP4, WebM, MOV videos (&lt; 2 min) AND PNG, JPG, WebP pictures.
                </Typography>

                <Tabs
                  value={mediaUploadTab}
                  onChange={(_, val) => setMediaUploadTab(val)}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{
                    mb: 2,
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    '& .MuiTab-root': { color: '#94a3b8', '&.Mui-selected': { color: '#38bdf8' } }
                  }}
                >
                  <Tab label="Direct File Upload (Video or Picture)" value="upload" sx={{ textTransform: 'none', fontWeight: 700 }} />
                  <Tab label="YouTube Video Link" value="youtube" sx={{ textTransform: 'none', fontWeight: 700 }} />
                  <Tab label="Loom Video Link" value="loom" sx={{ textTransform: 'none', fontWeight: 700 }} />
                </Tabs>

                {mediaUploadTab === 'upload' && (
                  <Box>
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={uploading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <CloudUploadIcon />}
                      disabled={uploading}
                      sx={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: 2
                      }}
                    >
                      {uploading ? 'Uploading to Cloud...' : 'Choose File (Video or Photo)'}
                      <input
                        type="file"
                        hidden
                        accept="video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp,image/svg+xml"
                        onChange={handleMediaFileUpload}
                      />
                    </Button>
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 1 }}>
                      Accepted formats: MP4, MOV, WebM (under 120s) OR JPG, PNG, WebP (under 25MB)
                    </Typography>
                  </Box>
                )}

                {mediaUploadTab === 'youtube' && (
                  <TextField
                    label="YouTube Video Link"
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    value={wfVideoUrl}
                    onChange={e => {
                      setWfVideoUrl(e.target.value);
                      setWfMediaType('video');
                    }}
                    fullWidth
                    sx={{ input: { color: '#fff' }, label: { color: '#94a3b8' } }}
                  />
                )}

                {mediaUploadTab === 'loom' && (
                  <TextField
                    label="Loom Video Link"
                    placeholder="https://www.loom.com/share/..."
                    value={wfVideoUrl}
                    onChange={e => {
                      setWfVideoUrl(e.target.value);
                      setWfMediaType('video');
                    }}
                    fullWidth
                    sx={{ input: { color: '#fff' }, label: { color: '#94a3b8' } }}
                  />
                )}

                {wfVideoUrl && (
                  <Box sx={{ mt: 2.5 }}>
                    <Typography variant="caption" fontWeight={700} color="#38bdf8" display="block" sx={{ mb: 1 }}>
                      Live Media Preview:
                    </Typography>
                    <UniversalVideoPlayer url={wfVideoUrl} title={wfTitle} mediaType={wfMediaType} autoPlay={false} muted={true} />
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
              startIcon={saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SaveIcon />}
              onClick={handleSaveWorkflow}
              disabled={saving || uploading}
              sx={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                borderRadius: 2
              }}
            >
              {saving ? 'Saving...' : 'Save & Publish Reel'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ================================================================= */}
        {/* INTERACTIVE WORK REEL VIEWER PREVIEW MODAL                        */}
        {/* ================================================================= */}
        <Dialog
          open={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          fullScreen={isMobile}
          maxWidth="sm"
          fullWidth
          sx={{
            overscrollBehavior: 'none',
            touchAction: isMobile ? 'none' : undefined,
          }}
          PaperProps={{
            sx: {
              width: isMobile ? '100vw' : undefined,
              maxWidth: isMobile ? '100vw' : undefined,
              borderRadius: isMobile ? 0 : '22px',
              bgcolor: '#090d16',
              color: '#ffffff',
              boxShadow: isMobile ? 'none' : '0 25px 50px -12px rgba(0,0,0,0.5)',
              height: isMobile ? '100dvh' : 'min(88vh, 720px)',
              maxHeight: isMobile ? '100dvh' : '88vh',
              m: isMobile ? 0 : 2,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              overscrollBehavior: 'none',
              touchAction: isMobile ? 'none' : undefined,
            }
          }}
        >
          {/* Top Bar */}
          <Box sx={{ pt: isMobile ? 'calc(10px + env(safe-area-inset-top, 0px))' : 2, pb: isMobileLandscape ? 0.75 : { xs: 1.1, sm: 2 }, px: { xs: 1.5, sm: 2.5 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38bdf8', whiteSpace: 'nowrap' }}>
                🎞️ Work Reel {previewReelIndex + 1} / {workflows.length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: { xs: 'none', sm: 'inline' } }}>
                (Use [↑ / ↓] keys)
              </Typography>
            </Box>

            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton size="small" onClick={() => setPreviewMuted(!previewMuted)} sx={{ color: previewMuted ? '#94a3b8' : '#38bdf8' }}>
                {previewMuted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
              </IconButton>
              <IconButton size="small" onClick={() => setPreviewModalOpen(false)} sx={{ color: '#94a3b8' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {/* Reel Stage */}
          {currentPreviewReel && (
            <Box
              onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
              onTouchEnd={(e) => {
                const diff = touchStartY.current - e.changedTouches[0].clientY;
                if (diff > 45) setPreviewReelIndex(prev => Math.min(prev + 1, workflows.length - 1));
                else if (diff < -45) setPreviewReelIndex(prev => Math.max(prev - 1, 0));
              }}
              sx={{
                position: 'relative',
                width: '100%',
                flex: 1,
                minHeight: 0,
                bgcolor: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                touchAction: 'none',
                overscrollBehavior: 'none',
              }}
            >
              <UniversalVideoPlayer
                key={currentPreviewReel.id || previewReelIndex}
                url={currentPreviewReel.demoVideoUrl || currentPreviewReel.mediaUrl}
                posterUrl={currentPreviewReel.thumbnailUrl || currentPreviewReel.posterUrl}
                title={currentPreviewReel.title}
                mediaType={currentPreviewReel.mediaType}
                autoPlay={true}
                muted={previewMuted}
                loop={true}
                fillHeight={true}
                onMutedChange={(m) => setPreviewMuted(m)}
                reelsOverlay={
                  currentPreviewReel.displayHeadingOnVideo !== false ? (
                    <Box
                      sx={{
                        px: { xs: 1.8, sm: 2.5 },
                        py: 1.3,
                        pr: { xs: 6.5, sm: 7 },
                        background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.5) 70%, transparent 100%)'
                      }}
                    >
                      <Stack direction="row" spacing={0.8} sx={{ mb: 0.6, flexWrap: 'wrap', gap: 0.5 }}>
                        <Chip
                          label={currentPreviewReel.category}
                          size="small"
                          sx={{ bgcolor: 'rgba(79,70,229,0.45)', color: '#e0e7ff', fontWeight: 800, fontSize: '0.66rem', height: 20 }}
                        />
                        <Chip
                          label={currentPreviewReel.mediaType === 'image' ? '🖼️ Photo Reel' : '🎬 Video Reel'}
                          size="small"
                          sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 700, fontSize: '0.66rem', height: 20 }}
                        />
                      </Stack>
                      <Typography variant="subtitle1" sx={{ fontWeight: 850, color: '#ffffff', mb: 0.3, lineHeight: 1.25, fontSize: { xs: '0.94rem', sm: '1.05rem' } }}>
                        {currentPreviewReel.title}
                      </Typography>
                      {currentPreviewReel.description && (
                        <Typography variant="body2" sx={{ color: '#cbd5e1', fontSize: '0.78rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {currentPreviewReel.description}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ px: 2, pb: 1.5 }}>
                      <Chip
                        label={currentPreviewReel.category}
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
                }
              />

              {/* Floating Up / Down Navigation Controls */}
              {workflows.length > 1 && (
                <Box sx={{ position: 'absolute', right: { xs: 8, sm: 14 }, top: '44%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 1.2, zIndex: 15 }}>
                  <IconButton
                    size="small"
                    disabled={previewReelIndex === 0}
                    onClick={() => setPreviewReelIndex(prev => Math.max(prev - 1, 0))}
                    sx={{
                      bgcolor: 'rgba(0,0,0,0.65)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.2)',
                      '&:hover': { bgcolor: 'rgba(79,70,229,0.8)' },
                      '&.Mui-disabled': { opacity: 0.25, color: '#666' }
                    }}
                  >
                    <KeyboardArrowUpIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    disabled={previewReelIndex === workflows.length - 1}
                    onClick={() => setPreviewReelIndex(prev => Math.min(prev + 1, workflows.length - 1))}
                    sx={{
                      bgcolor: 'rgba(0,0,0,0.65)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.2)',
                      '&:hover': { bgcolor: 'rgba(79,70,229,0.8)' },
                      '&.Mui-disabled': { opacity: 0.25, color: '#666' }
                    }}
                  >
                    <KeyboardArrowDownIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
          )}
        </Dialog>
      </Container>
    </DashboardLayout>
  );
};

export default Workflows;
