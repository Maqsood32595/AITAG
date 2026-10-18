import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Paper, Typography, TextField, Button, Alert,
  MenuItem, Select, InputLabel, FormControl, Chip, Stack, CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Navbar from '../components/Navbar';
import { tasksApi } from '../api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Product Visuals', 'E-Commerce & Copy', 'Social & Marketing', 'Web & Funnels'];

const AddTask = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', category: 'Product Visuals', description: '', deadline: '', budget: '', image: '' });
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setPendingFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPendingFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const handleRemovePending = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let uploadedAttachments: any[] = [];
      if (pendingFiles.length > 0) {
        const formData = new FormData();
        for (const f of pendingFiles) {
          formData.append('files', f);
        }
        const uploadRes = await tasksApi.uploadFiles(formData);
        if (uploadRes.data?.success && Array.isArray(uploadRes.data.attachments)) {
          uploadedAttachments = uploadRes.data.attachments;
        }
      }

      await tasksApi.create({
        ...form,
        attachments: uploadedAttachments
      });
      navigate('/my_tasks');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />
      <Container maxWidth="sm" sx={{ pt: 14, pb: 6 }}>
        <Paper elevation={0} sx={{ p: 5, borderRadius: '20px', border: '1px solid rgba(79,70,229,0.1)', boxShadow: '0 8px 40px rgba(79,70,229,0.08)' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, fontFamily: 'Inter, sans-serif', letterSpacing: '-1px' }}>Post a Task</Typography>
          <Typography sx={{ color: '#64748b', mb: 4, fontSize: '0.95rem' }}>Describe what you need — AI talent will bid on it</Typography>
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Task Title *" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} sx={fieldStyle} />
            <FormControl sx={fieldStyle}>
              <InputLabel>Category</InputLabel>
              <Select value={form.category} label="Category" onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Description *" required multiline rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} sx={fieldStyle} />
            <TextField
              label="Deadline *"
              type="date"
              required
              value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              sx={{
                ...fieldStyle,
                '& .MuiInputLabel-root': {
                  transform: 'translate(14px, -9px) scale(0.75) !important',
                  bgcolor: '#ffffff',
                  px: 0.8,
                  borderRadius: '4px',
                  fontWeight: 600,
                  zIndex: 2,
                }
              }}
            />
            <TextField
              label="Budget (₹) *"
              type="number"
              required
              value={form.budget}
              onChange={e => setForm({ ...form, budget: e.target.value })}
              placeholder="e.g. 1500"
              sx={fieldStyle}
            />

            {/* Attach Assets & Reference Materials */}
            <Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', mb: 1 }}>
                Attach Assets & References (Optional)
              </Typography>
              <Box
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  p: 3,
                  border: '2px dashed rgba(79, 70, 229, 0.3)',
                  borderRadius: '12px',
                  bgcolor: 'rgba(79, 70, 229, 0.02)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#4f46e5',
                    bgcolor: 'rgba(79, 70, 229, 0.05)'
                  }
                }}
              >
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <CloudUploadIcon sx={{ fontSize: 32, color: '#4f46e5', mb: 0.5 }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                  Drag & drop files here, or click to browse
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.5 }}>
                  Photos, Brand Logos, Specifications, Briefs (PNG, JPG, PDF, ZIP up to 25MB)
                </Typography>
              </Box>

              {pendingFiles.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', mb: 0.8 }}>
                    Attached Assets ({pendingFiles.length}):
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {pendingFiles.map((file, i) => (
                      <Chip
                        key={i}
                        icon={<AttachFileIcon sx={{ fontSize: 14 }} />}
                        label={`${file.name} (${formatFileSize(file.size)})`}
                        size="small"
                        onDelete={() => handleRemovePending(i)}
                        sx={{
                          bgcolor: '#e0e7ff',
                          color: '#4338ca',
                          fontWeight: 600,
                          fontSize: '0.72rem'
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>

            <Box sx={{ p: 2, bgcolor: 'rgba(79,70,229,0.04)', borderRadius: '10px', border: '1px solid rgba(79,70,229,0.08)' }}>
              <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>Posting as: <strong style={{ color: '#0f172a' }}>{user?.name}</strong> ({user?.email})</Typography>
            </Box>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 1,
                background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                fontWeight: 700,
                borderRadius: '12px',
                py: 1.5,
                boxShadow: '0 6px 20px rgba(79,70,229,0.3)',
                textTransform: 'none',
                fontSize: '0.95rem'
              }}
            >
              {loading ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={18} color="inherit" />
                  <span>{pendingFiles.length > 0 ? 'Uploading Assets & Posting...' : 'Posting Task...'}</span>
                </Stack>
              ) : (
                'Post Task'
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

const fieldStyle = { '& .MuiOutlinedInput-root': { borderRadius: '10px', '&:hover fieldset': { borderColor: '#4f46e5' }, '&.Mui-focused fieldset': { borderColor: '#4f46e5' } }, '& label.Mui-focused': { color: '#4f46e5' } };

export default AddTask;
