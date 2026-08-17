import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Button, TextField, FormControl, InputLabel,
  Select, MenuItem, Box, Alert, CircularProgress, Avatar, Stack
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import { tasksApi, invitationsApi } from '../api';

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  talent: {
    name: string;
    email?: string;
    role: string;
    avatar: string;
  } | null;
}

const InviteModal: React.FC<InviteModalProps> = ({ open, onClose, talent }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [message, setMessage] = useState('');
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setLoadingTasks(true);
      setError('');
      setSuccess(false);
      setSelectedTaskId('');
      setMessage(talent ? `Hi ${talent.name}, I reviewed your AI specialist profile on AITAG and would like to invite you to collaborate on this task!` : '');

      tasksApi.getMy()
        .then(res => {
          const openTasks = (res.data || []).filter((t: any) => t.status !== 'completed' && t.status !== 'in-progress');
          setTasks(openTasks);
          if (openTasks.length > 0) {
            setSelectedTaskId(openTasks[0].id);
          }
        })
        .catch(err => {
          console.error('Error fetching my tasks:', err);
        })
        .finally(() => setLoadingTasks(false));
    }
  }, [open, talent]);

  const handleSendInvite = async () => {
    if (!selectedTaskId) {
      setError('Please select a task to invite this specialist.');
      return;
    }
    if (!talent?.email) {
      setError('Selected talent does not have an active registered email.');
      return;
    }

    setSending(true);
    setError('');

    try {
      await invitationsApi.send({
        taskId: selectedTaskId,
        freelancerEmail: talent.email,
        message,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  const handleCreateNewTask = () => {
    onClose();
    navigate('/add_task', { state: { preferredTalent: talent?.name } });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '20px', p: 1 }
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
        Invite Talent to Your Task
      </DialogTitle>

      <DialogContent dividers sx={{ borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
        {talent && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#f8fafc', borderRadius: '14px', mb: 3 }}>
            <Avatar src={talent.avatar} alt={talent.name} sx={{ width: 48, height: 48, bgcolor: '#4f46e5' }}>
              {talent.name[0]}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>{talent.name}</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>{talent.role}</Typography>
            </Box>
          </Box>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2.5, borderRadius: '12px' }}>
            🎉 Invitation successfully sent to {talent?.name}! They will receive an inbox notification.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        {loadingTasks ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={32} sx={{ color: '#4f46e5' }} />
          </Box>
        ) : tasks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography sx={{ color: '#64748b', mb: 2 }}>
              You do not have any open tasks to invite this specialist to right now.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateNewTask}
              sx={{
                background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                borderRadius: '12px',
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              + Create New Task for {talent?.name}
            </Button>
          </Box>
        ) : (
          <Stack spacing={2.5}>
            <FormControl fullWidth>
              <InputLabel>Select Open Task</InputLabel>
              <Select
                value={selectedTaskId}
                label="Select Open Task"
                onChange={(e) => setSelectedTaskId(e.target.value)}
                sx={{ borderRadius: '12px' }}
              >
                {tasks.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.title} (Budget: ₹{t.budget?.toLocaleString()})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Personal Invitation Note"
              multiline
              rows={3}
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain why their profile matches your project requirements..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#64748b', borderRadius: '10px' }}>
          Cancel
        </Button>
        {tasks.length > 0 && (
          <Button
            variant="contained"
            disabled={sending || success || !selectedTaskId}
            onClick={handleSendInvite}
            startIcon={sending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            sx={{
              background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
              borderRadius: '10px',
              fontWeight: 700,
              px: 3,
              textTransform: 'none',
            }}
          >
            {sending ? 'Sending...' : 'Send Invitation'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default InviteModal;
