import React, { useState, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Box, Typography,
  Button, IconButton, Chip, Stack, Paper, CircularProgress,
  Alert, Tooltip, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import { tasksApi } from '../api';

interface Attachment {
  id: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
  uploaded_at?: string;
}

interface TaskAssetsModalProps {
  open: boolean;
  onClose: () => void;
  task: any;
  onTaskUpdated?: (updatedTask: any) => void;
  isOwner?: boolean;
}

export const TaskAssetsModal: React.FC<TaskAssetsModalProps> = ({
  open,
  onClose,
  task,
  onTaskUpdated,
  isOwner = true
}) => {
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!task) return null;

  const attachments: Attachment[] = Array.isArray(task.attachments) ? task.attachments : [];

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type?: string, name?: string) => {
    const ext = (name || '').split('.').pop()?.toLowerCase();
    if (type?.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext || '')) {
      return <ImageIcon sx={{ color: '#0891b2', fontSize: 24 }} />;
    }
    if (type === 'application/pdf' || ext === 'pdf') {
      return <PictureAsPdfIcon sx={{ color: '#ef4444', fontSize: 24 }} />;
    }
    if (['zip', 'rar', 'tar', '7z', 'gz'].includes(ext || '')) {
      return <FolderZipIcon sx={{ color: '#f59e0b', fontSize: 24 }} />;
    }
    return <InsertDriveFileIcon sx={{ color: '#4f46e5', fontSize: 24 }} />;
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isOwner) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const added = Array.from(e.dataTransfer.files);
      setPendingFiles(prev => [...prev, ...added]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwner) return;
    if (e.target.files && e.target.files.length > 0) {
      const added = Array.from(e.target.files);
      setPendingFiles(prev => [...prev, ...added]);
    }
  };

  const handleRemovePending = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadPending = async () => {
    if (pendingFiles.length === 0 || !task.id) return;
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      for (const file of pendingFiles) {
        formData.append('files', file);
      }
      const res = await tasksApi.appendAttachments(task.id, formData);
      if (res.data?.success && res.data.task) {
        setSuccess(`Successfully added ${pendingFiles.length} new asset${pendingFiles.length > 1 ? 's' : ''}!`);
        setPendingFiles([]);
        if (onTaskUpdated) onTaskUpdated(res.data.task);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to upload assets');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAttachment = async (assetId: string) => {
    if (!isOwner || !confirm('Remove this asset from the task?')) return;
    setDeletingId(assetId);
    setError(null);
    try {
      const res = await tasksApi.removeAttachment(task.id, assetId);
      if (res.data?.success && res.data.task) {
        setSuccess('Asset removed.');
        if (onTaskUpdated) onTaskUpdated(res.data.task);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to remove asset');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)',
          bgcolor: '#ffffff',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle
        sx={{
          p: 2.5,
          bgcolor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
              Project Assets & References
            </Typography>
            <Chip
              label={`${attachments.length} ${attachments.length === 1 ? 'Asset' : 'Assets'}`}
              size="small"
              sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 800, fontSize: '0.75rem' }}
            />
          </Stack>
          <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mt: 0.5 }}>
            {task.title}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#0f172a' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px' }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2.5, borderRadius: '10px' }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Existing Assets Section */}
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', mb: 1.5 }}>
          Current Attached Materials
        </Typography>

        {attachments.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '14px',
              mb: 3
            }}
          >
            <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              No reference files or assets attached to this task yet.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            {attachments.map((asset) => (
              <Paper
                key={asset.id}
                elevation={0}
                sx={{
                  p: 1.75,
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
                  {getFileIcon(asset.type, asset.name)}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        color: '#0f172a',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {asset.name}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {formatFileSize(asset.size)} {asset.uploaded_at ? `• ${new Date(asset.uploaded_at).toLocaleDateString()}` : ''}
                    </Typography>
                  </Box>
                </Box>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    variant="outlined"
                    size="small"
                    component="a"
                    href={asset.url}
                    download={asset.name}
                    target="_blank"
                    startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: '8px',
                      color: '#4f46e5',
                      borderColor: 'rgba(79, 70, 229, 0.3)',
                      fontSize: '0.75rem',
                      py: 0.4
                    }}
                  >
                    Download
                  </Button>

                  {isOwner && (
                    <Tooltip title="Delete asset">
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={deletingId === asset.id}
                          onClick={() => handleDeleteAttachment(asset.id)}
                          sx={{ '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.08)' } }}
                        >
                          {deletingId === asset.id ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}

        {/* Upload More Section (Owner Only) */}
        {isOwner && (
          <Box>
            <Divider sx={{ my: 2 }} />
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', mb: 1 }}>
              Upload Additional Materials
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#64748b', mb: 1.5 }}>
              Attach more product photos, logos, guidelines (PDF, PNG, JPG, ZIP up to 25MB).
            </Typography>

            <Box
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                p: 3,
                border: '2px dashed rgba(79, 70, 229, 0.35)',
                borderRadius: '14px',
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
              <CloudUploadIcon sx={{ fontSize: 36, color: '#4f46e5', mb: 0.5 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                Drag & drop files here, or click to browse
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748b', mt: 0.5 }}>
                Product Cutouts, RAW Photographs, Spec Sheets & Brand Guides
              </Typography>
            </Box>

            {pendingFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 1 }}>
                  Pending Files ({pendingFiles.length}):
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                  {pendingFiles.map((f, i) => (
                    <Chip
                      key={i}
                      label={`${f.name} (${formatFileSize(f.size)})`}
                      size="small"
                      onDelete={() => handleRemovePending(i)}
                      sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 600, fontSize: '0.72rem' }}
                    />
                  ))}
                </Stack>

                <Button
                  variant="contained"
                  disabled={uploading}
                  onClick={handleUploadPending}
                  startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                    fontWeight: 700,
                    borderRadius: '10px',
                    textTransform: 'none',
                    px: 3,
                    py: 1,
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)'
                  }}
                >
                  {uploading ? 'Uploading...' : 'Save & Attach to Task'}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
