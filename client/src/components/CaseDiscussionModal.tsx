import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Box, Typography,
  TextField, Button, IconButton, Chip, Stack, Paper,
  CircularProgress, Alert, Tooltip, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { caseDiscussionsApi } from '../api';

interface Attachment {
  id: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
  uploaded_at?: string;
}

interface MessageRecord {
  id: string;
  order_id: string;
  sender_email: string;
  sender_name: string;
  sender_role: 'admin' | 'freelancer' | 'client';
  message: string;
  attachments: Attachment[];
  created_at: string;
}

interface CaseDiscussionModalProps {
  open: boolean;
  onClose: () => void;
  order?: any;
  task?: any;
  currentUser: any;
}

export const CaseDiscussionModal: React.FC<CaseDiscussionModalProps> = ({
  open,
  onClose,
  order,
  task,
  currentUser
}) => {
  const target = order || task;
  const targetId = target?.id;
  const isTask = !order && !!task;

  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newMsg, setNewMsg] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!targetId) return;
    try {
      const res = await caseDiscussionsApi.getMessages(targetId);
      if (res.data?.success && Array.isArray(res.data.messages)) {
        setMessages(res.data.messages);
      }
    } catch (err: any) {
      console.warn('Could not refresh case messages:', err.message);
    }
  };

  useEffect(() => {
    if (open && targetId) {
      setLoading(true);
      setError(null);
      setNewMsg('');
      setAttachments([]);
      caseDiscussionsApi
        .getMessages(targetId)
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data.messages)) {
            setMessages(res.data.messages);
          }
        })
        .catch((err) => {
          setError(err.response?.data?.error || err.message || 'Failed to load messages');
        })
        .finally(() => {
          setLoading(false);
          setTimeout(scrollToBottom, 150);
        });

      // Poll messages every 6 seconds while modal is open
      const interval = setInterval(fetchMessages, 6000);
      return () => clearInterval(interval);
    }
  }, [open, targetId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !targetId) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const res = await caseDiscussionsApi.uploadAttachments(targetId, formData);
      if (res.data?.success && Array.isArray(res.data.attachments)) {
        setAttachments((prev) => [...prev, ...res.data.attachments]);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'File upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePendingAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetId) return;

    const trimmed = newMsg.trim();
    if (!trimmed && attachments.length === 0) return;

    setSending(true);
    setError(null);
    try {
      const res = await caseDiscussionsApi.postMessage(targetId, {
        message: trimmed,
        attachments
      });

      if (res.data?.success && res.data.message) {
        setMessages((prev) => [...prev, res.data.message]);
        setNewMsg('');
        setAttachments([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to send message');
    } finally {
      setSending(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!target) return null;

  const itemTag = isTask
    ? `Task #${String(task?.id || '').replace('task-', '').slice(-6)}`
    : `Order ${order?.order_number || ''}`;
  const statusLabel = isTask ? (task?.status || 'open') : (order?.status || 'REQUESTED');
  const subtitle = isTask
    ? `${task?.category || 'Custom Task'} • Budget: ₹${Number(task?.budget || 0).toLocaleString()}`
    : `${order?.package_title || 'Service Package'} • ${order?.tier_name?.startsWith('package_') ? order?.tier_name.replace('package_', 'Package ').toUpperCase() : order?.tier_name?.toUpperCase() || ''} Tier`;

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
      {/* Header */}
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
              {isTask ? 'Task Discussion' : 'Case Discussion'}
            </Typography>
            <Chip
              label={itemTag}
              size="small"
              sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 800, fontSize: '0.75rem' }}
            />
            <Chip
              label={statusLabel}
              size="small"
              sx={{
                bgcolor: statusLabel === 'COMPLETED' || statusLabel === 'completed' ? '#ecfdf5' : statusLabel === 'ACTIVE' || statusLabel === 'in-progress' ? '#eff6ff' : '#fef3c7',
                color: statusLabel === 'COMPLETED' || statusLabel === 'completed' ? '#047857' : statusLabel === 'ACTIVE' || statusLabel === 'in-progress' ? '#1d4ed8' : '#b45309',
                fontWeight: 700,
                fontSize: '0.72rem',
                textTransform: 'capitalize'
              }}
            />
          </Stack>
          <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mt: 0.5 }}>
            {subtitle}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#0f172a' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '620px' }}>
        {/* Parties Dossier Banner */}
        {isTask ? (
          <Box
            sx={{
              px: 3,
              py: 1.75,
              bgcolor: '#f1f5f9',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonIcon sx={{ fontSize: 18, color: '#475569' }} />
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                  Client: {task?.user_name || 'Client'}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {task?.user_email || ''}
                </Typography>
              </Box>
            </Stack>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

            <Stack direction="row" spacing={1} alignItems="center">
              <AdminPanelSettingsIcon sx={{ fontSize: 18, color: '#4f46e5' }} />
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#4338ca' }}>
                  Admin Support & Direct Communication
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#6366f1' }}>
                  Real-time Platform Oversight
                </Typography>
              </Box>
            </Stack>
          </Box>
        ) : (
          <Box
            sx={{
              px: 3,
              py: 1.75,
              bgcolor: '#f1f5f9',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonIcon sx={{ fontSize: 18, color: '#475569' }} />
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                  Customer: {order?.customer_name || 'Customer'}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {order?.customer_email || ''}
                </Typography>
              </Box>
            </Stack>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

            <Stack direction="row" spacing={1} alignItems="center">
              <PsychologyIcon sx={{ fontSize: 18, color: '#059669' }} />
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46' }}>
                  Matched Expert: {order?.assigned_expert_name || 'AI Specialist'}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#047857' }}>
                  {order?.assigned_expert_email || 'Pending assignment'}
                </Typography>
              </Box>
            </Stack>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

            <Stack direction="row" spacing={1} alignItems="center">
              <AdminPanelSettingsIcon sx={{ fontSize: 18, color: '#4f46e5' }} />
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#4338ca' }}>
                  AITAG Operations
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#6366f1' }}>
                  Active Case Oversight
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mx: 3, mt: 2, borderRadius: '10px' }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Message Bubble Feed */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            bgcolor: '#fafafa'
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress size={32} sx={{ color: '#4f46e5' }} />
            </Box>
          ) : messages.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
              sx={{ color: '#94a3b8', textAlign: 'center', py: 6 }}
            >
              <PsychologyIcon sx={{ fontSize: 52, color: '#cbd5e1', mb: 1.5 }} />
              <Typography variant="subtitle1" fontWeight={700} color="#475569">
                Case Discussion Channel Open
              </Typography>
              <Typography variant="body2" sx={{ maxWidth: 440, mt: 0.5 }}>
                {isTask
                  ? `Direct communication stream with Admin for Task "${task?.title || 'Custom Task'}". Send messages, asset attachments, or project clarifications below.`
                  : `Direct communication stream between Admin and Assigned Specialist for Order #${order?.order_number || ''}. Send directives, asset attachments, or project clarifications below.`}
              </Typography>
            </Box>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_email?.toLowerCase() === currentUser?.email?.toLowerCase();
              const isAdmin = msg.sender_role === 'admin';
              const isExpert = msg.sender_role === 'freelancer';

              return (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    alignSelf: isMe ? 'flex-end' : 'flex-start'
                  }}
                >
                  {/* Sender identity & timestamp */}
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, px: 0.5 }}>
                    <Typography sx={{ fontSize: '0.725rem', fontWeight: 700, color: '#334155' }}>
                      {msg.sender_name} ({msg.sender_email})
                    </Typography>
                    <Chip
                      label={isAdmin ? 'Admin / Ops' : isExpert ? 'AI Specialist' : 'Customer'}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.625rem',
                        fontWeight: 800,
                        bgcolor: isAdmin ? '#e0e7ff' : isExpert ? '#d1fae5' : '#f1f5f9',
                        color: isAdmin ? '#3730a3' : isExpert ? '#065f46' : '#475569'
                      }}
                    />
                    <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                      {new Date(msg.created_at).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Stack>

                  {/* Message Bubble */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                      bgcolor: isMe ? '#4f46e5' : '#ffffff',
                      color: isMe ? '#ffffff' : '#0f172a',
                      border: isMe ? 'none' : '1px solid #e2e8f0',
                      boxShadow: isMe
                        ? '0 4px 14px rgba(79, 70, 229, 0.25)'
                        : '0 2px 8px rgba(0, 0, 0, 0.04)',
                      wordBreak: 'break-word'
                    }}
                  >
                    {msg.message && (
                      <Typography
                        sx={{
                          fontSize: '0.875rem',
                          lineHeight: 1.55,
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'Inter, sans-serif'
                        }}
                      >
                        {msg.message}
                      </Typography>
                    )}

                    {/* Attachments within bubble */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <Stack spacing={1} sx={{ mt: msg.message ? 1.5 : 0 }}>
                        {msg.attachments.map((att, i) => {
                          const isImage = att.type?.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(att.name || '');

                          return (
                            <Box
                              key={att.id || i}
                              sx={{
                                p: 1,
                                borderRadius: '10px',
                                bgcolor: isMe ? 'rgba(255, 255, 255, 0.15)' : '#f8fafc',
                                border: isMe ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1.5
                              }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                                <InsertDriveFileIcon sx={{ fontSize: 20, color: isMe ? '#ffffff' : '#64748b' }} />
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography
                                    noWrap
                                    sx={{
                                      fontSize: '0.8rem',
                                      fontWeight: 600,
                                      color: isMe ? '#ffffff' : '#0f172a',
                                      maxWidth: '220px'
                                    }}
                                  >
                                    {att.name}
                                  </Typography>
                                  {att.size && (
                                    <Typography sx={{ fontSize: '0.68rem', color: isMe ? 'rgba(255,255,255,0.75)' : '#94a3b8' }}>
                                      {formatFileSize(att.size)}
                                    </Typography>
                                  )}
                                </Box>
                              </Stack>

                              <Tooltip title="Download / Open Asset">
                                <IconButton
                                  size="small"
                                  component="a"
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={att.name}
                                  sx={{
                                    color: isMe ? '#ffffff' : '#4f46e5',
                                    bgcolor: isMe ? 'rgba(255,255,255,0.2)' : '#eef2ff',
                                    '&:hover': {
                                      bgcolor: isMe ? 'rgba(255,255,255,0.3)' : '#e0e7ff'
                                    }
                                  }}
                                >
                                  <DownloadIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          );
                        })}
                      </Stack>
                    )}
                  </Paper>
                </Box>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Pending Attachments Tray */}
        {attachments.length > 0 && (
          <Box sx={{ px: 3, py: 1, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', mb: 0.5, display: 'block' }}>
              Pending Attachments ({attachments.length}):
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {attachments.map((att, idx) => (
                <Chip
                  key={att.id || idx}
                  icon={<InsertDriveFileIcon sx={{ fontSize: 16 }} />}
                  label={`${att.name} (${formatFileSize(att.size)})`}
                  size="small"
                  onDelete={() => handleRemovePendingAttachment(idx)}
                  sx={{ bgcolor: '#e0e7ff', color: '#3730a3', fontWeight: 600, fontSize: '0.72rem' }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Composer Footer */}
        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            p: 2,
            bgcolor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            style={{ display: 'none' }}
          />

          <Tooltip title="Attach Files (Images, PDFs, ZIPs, Prompts)">
            <span>
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || sending}
                sx={{
                  bgcolor: '#f1f5f9',
                  color: '#475569',
                  '&:hover': { bgcolor: '#e2e8f0' }
                }}
              >
                {uploading ? <CircularProgress size={20} sx={{ color: '#4f46e5' }} /> : <AttachFileIcon />}
              </IconButton>
            </span>
          </Tooltip>

          <TextField
            fullWidth
            size="small"
            placeholder="Type a case update or message... (Shift + Enter for new line)"
            multiline
            maxRows={3}
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={sending}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#f8fafc',
                fontSize: '0.875rem'
              }
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={sending || (!newMsg.trim() && attachments.length === 0)}
            sx={{
              bgcolor: '#4f46e5',
              '&:hover': { bgcolor: '#4338ca' },
              borderRadius: '12px',
              px: 2.5,
              py: 1,
              fontWeight: 700,
              textTransform: 'none',
              minWidth: '90px'
            }}
          >
            {sending ? <CircularProgress size={18} sx={{ color: '#ffffff' }} /> : <SendIcon sx={{ fontSize: 18 }} />}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
