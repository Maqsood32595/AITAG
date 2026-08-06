import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Chip, Paper, Grid,
  CircularProgress, Alert, Divider, Avatar
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import GavelIcon from '@mui/icons-material/Gavel';
import Navbar from '../components/Navbar';
import { tasksApi, bidsApi } from '../api';
import { useAuth } from '../context/AuthContext';

const TaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [hasBid, setHasBid] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    tasksApi.getById(id!).then(res => setTask(res.data)).catch(console.error).finally(() => setLoading(false));
    if (user && id) bidsApi.checkBid(id).then(res => setHasBid(res.data.hasBid)).catch(() => {});
  }, [id, user]);

  const handleBid = async () => {
    if (!user) return navigate('/signin');
    setBidding(true);
    try {
      await bidsApi.place(id!);
      setHasBid(true);
      setTask((t: any) => ({ ...t, total_bids: (t.total_bids || 0) + 1 }));
      setMessage({ type: 'success', text: 'Your bid has been placed successfully! 🎉' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to place bid' });
    } finally {
      setBidding(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress sx={{ color: '#4f46e5' }} /></Box>;
  if (!task) return <Box sx={{ pt: 14, textAlign: 'center' }}><Typography>Task not found.</Typography></Box>;

  const isOwner = user?.email === task.user_email;
  const deadlinePassed = new Date() > new Date(task.deadline);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ pt: 12, pb: 6 }}>
        <Box component="img" src={task.image} alt={task.title} sx={{ width: '100%', height: 320, objectFit: 'cover', borderRadius: '20px', mb: 4 }} />

        <Grid container spacing={4}>
          <Grid xs={12} md={8}>
            <Chip label={task.category} sx={{ mb: 2, bgcolor: 'rgba(79,70,229,0.08)', color: '#4f46e5', fontWeight: 700 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, fontFamily: 'Inter, sans-serif', letterSpacing: '-1px' }}>{task.title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: '#4f46e5', fontSize: '0.75rem' }}>{task.user_name?.[0]}</Avatar>
              <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>Posted by <strong>{task.user_name}</strong></Typography>
            </Box>

            <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(79,70,229,0.08)', mb: 3 }}>
              <Typography sx={{ fontWeight: 700, mb: 1.5, color: '#0f172a' }}>Task Description</Typography>
              <Typography sx={{ color: '#475569', lineHeight: 1.8 }}>{task.description}</Typography>
            </Paper>

            {message && <Alert severity={message.type} sx={{ borderRadius: '12px', mb: 2 }}>{message.text}</Alert>}

            {!isOwner && !deadlinePassed && (
              <Button onClick={handleBid} variant="contained" size="large" fullWidth disabled={bidding || hasBid}
                startIcon={<GavelIcon />}
                sx={{
                  background: hasBid ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5, #0891b2)',
                  fontWeight: 700, borderRadius: '14px', py: 2, fontSize: '1rem',
                  boxShadow: hasBid ? 'none' : '0 8px 24px rgba(79,70,229,0.3)',
                }}>
                {hasBid ? 'Bid Already Placed ✓' : bidding ? 'Placing Bid...' : 'Place Your Bid'}
              </Button>
            )}
            {isOwner && <Alert severity="info" sx={{ borderRadius: '12px' }}>This is your task — you cannot bid on it.</Alert>}
            {deadlinePassed && !isOwner && <Alert severity="warning" sx={{ borderRadius: '12px' }}>This task's deadline has passed.</Alert>}
          </Grid>

          <Grid xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(79,70,229,0.08)', position: 'sticky', top: 90 }}>
              <Typography sx={{ fontWeight: 700, mb: 2.5, color: '#0f172a' }}>Task Overview</Typography>
              <Divider sx={{ mb: 2 }} />
              {[
                { icon: <AttachMoneyIcon sx={{ color: '#10b981' }} />, label: 'Budget', value: `$${task.budget}`, color: '#10b981' },
                { icon: <CalendarMonthIcon sx={{ color: '#4f46e5' }} />, label: 'Deadline', value: new Date(task.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), color: '#4f46e5' },
                { icon: <PeopleIcon sx={{ color: '#0891b2' }} />, label: 'Total Bids', value: task.total_bids || 0, color: '#0891b2' },
              ].map(item => (
                <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: '10px', mb: 1, bgcolor: 'rgba(248,250,252,0.8)' }}>
                  {item.icon}
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.label}</Typography>
                    <Typography sx={{ fontWeight: 800, color: item.color, fontSize: '1.1rem' }}>{item.value}</Typography>
                  </Box>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default TaskDetails;
