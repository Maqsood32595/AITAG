import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Paper, Chip, CircularProgress,
  Avatar, Button, Divider, Stack, Alert
} from '@mui/material';
import TaskIcon from '@mui/icons-material/Assignment';
import BidIcon from '@mui/icons-material/Gavel';
import PostIcon from '@mui/icons-material/PostAdd';
import MailIcon from '@mui/icons-material/Mail';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Navbar from '../components/Navbar';
import { tasksApi, bidsApi, invitationsApi } from '../api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [allCount, setAllCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDashboardData = () => {
    Promise.all([
      tasksApi.getMy().then(r => setMyTasks(r.data || [])),
      tasksApi.getAll().then(r => setAllCount((r.data || []).length)),
      bidsApi.getMy().then(r => setMyBids(r.data.bids || [])),
      invitationsApi.getMy().then(r => setInvitations(r.data || [])).catch(() => setInvitations([])),
    ]).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAcceptInvite = async (inviteId: string) => {
    setActionLoading(inviteId);
    try {
      await invitationsApi.accept(inviteId);
      setActionSuccess('🎉 Invitation accepted! Your proposal has been submitted to the client.');
      fetchDashboardData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: any) {
      console.error('Accept invite error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    setActionLoading(inviteId);
    try {
      await invitationsApi.decline(inviteId);
      fetchDashboardData();
    } catch (err: any) {
      console.error('Decline invite error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingInvites = invitations.filter(inv => inv.status === 'pending');

  const stats = [
    { icon: <TaskIcon sx={{ color: '#4f46e5' }} />, label: 'All Platform Tasks', value: allCount, color: '#4f46e5', bg: 'rgba(79,70,229,0.08)' },
    { icon: <PostIcon sx={{ color: '#0891b2' }} />, label: 'My Posted Tasks', value: myTasks.length, color: '#0891b2', bg: 'rgba(8,145,178,0.08)' },
    { icon: <BidIcon sx={{ color: '#10b981' }} />, label: 'My Bids', value: myBids.length, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  ];

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress sx={{ color: '#4f46e5' }} /></Box>;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ pt: 12, pb: 6 }}>
        {/* Welcome */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', mb: 4, background: 'linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(8,145,178,0.06) 100%)', border: '1px solid rgba(79,70,229,0.1)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Avatar src={user?.photo_url || undefined} sx={{ width: 56, height: 56, bgcolor: '#4f46e5', fontSize: '1.3rem', fontWeight: 700, border: '3px solid rgba(79,70,229,0.2)' }}>
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.5px' }}>
                  Welcome back, {user?.name}!
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>{user?.email}</Typography>
                <Chip label={user?.role} size="small" sx={{ mt: 0.5, bgcolor: 'rgba(79,70,229,0.1)', color: '#4f46e5', fontWeight: 700, fontSize: '0.72rem', textTransform: 'capitalize' }} />
              </Box>
            </Box>

            <Button
              component={Link}
              to="/profile"
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                borderRadius: '12px',
                fontWeight: 700,
                px: 3,
                py: 1.2,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(79,70,229,0.25)',
              }}
            >
              🎬 Manage Delivered Workflows & Profile
            </Button>
          </Box>
        </Paper>

        {actionSuccess && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
            {actionSuccess}
          </Alert>
        )}

        {/* Pending Task Invitations Banner */}
        {pendingInvites.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: '16px',
              border: '1px solid rgba(79,70,229,0.25)',
              bgcolor: '#ffffff',
              mb: 4,
              boxShadow: '0 8px 30px rgba(79,70,229,0.06)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <MailIcon sx={{ color: '#4f46e5' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>
                Direct Task Invitations ({pendingInvites.length})
              </Typography>
            </Box>

            <Stack spacing={2}>
              {pendingInvites.map(inv => (
                <Paper
                  key={inv.id}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    bgcolor: 'rgba(79,70,229,0.03)',
                    border: '1px solid rgba(79,70,229,0.1)',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                      {inv.task_title}
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.85rem', mt: 0.5 }}>
                      Invited by: <strong>{inv.client_email}</strong> • Budget: <strong>₹{inv.task_budget?.toLocaleString() || 'Negotiable'}</strong>
                    </Typography>
                    {inv.message && (
                      <Typography sx={{ color: '#475569', fontSize: '0.85rem', fontStyle: 'italic', mt: 1 }}>
                        "{inv.message}"
                      </Typography>
                    )}
                  </Box>

                  <Stack direction="row" spacing={1.5}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="small"
                      disabled={actionLoading === inv.id}
                      onClick={() => handleDeclineInvite(inv.id)}
                      startIcon={<CancelIcon />}
                      sx={{ borderRadius: '8px', color: '#64748b', textTransform: 'none' }}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={actionLoading === inv.id}
                      onClick={() => handleAcceptInvite(inv.id)}
                      startIcon={actionLoading === inv.id ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon />}
                      sx={{
                        background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                        borderRadius: '8px',
                        fontWeight: 700,
                        textTransform: 'none',
                        px: 2,
                      }}
                    >
                      Accept & Place Bid
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Paper>
        )}

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map(s => (
            <Grid xs={12} md={4} key={s.label}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(79,70,229,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</Box>
                <Box>
                  <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8' }}>{s.label}</Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.8rem', color: s.color, lineHeight: 1.2, fontFamily: 'Inter, sans-serif' }}>{s.value}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Recent Tasks */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', border: '1px solid rgba(79,70,229,0.08)', mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Recent Activity</Typography>
            <Button component={Link} to="/my_tasks" size="small" sx={{ color: '#4f46e5', fontWeight: 600 }}>View all →</Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {[...myTasks.map(t => ({ type: 'Posted Task', title: t.title, date: t.created_at })),
            ...myBids.map(b => ({ type: 'Placed Bid', title: b.task_title, date: b.created_at }))]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
            .map((item, i) => (
              <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip label={item.type} size="small" sx={{ bgcolor: item.type === 'Posted Task' ? 'rgba(8,145,178,0.08)' : 'rgba(16,185,129,0.08)', color: item.type === 'Posted Task' ? '#0891b2' : '#10b981', fontWeight: 600, fontSize: '0.7rem' }} />
                  <Typography sx={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500 }}>{item.title}</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.date ? new Date(item.date).toLocaleDateString() : '—'}</Typography>
              </Box>
            ))}
          {myTasks.length === 0 && myBids.length === 0 && (
            <Typography sx={{ color: '#94a3b8', textAlign: 'center', py: 3 }}>No activity yet. Post a task or place a bid to get started.</Typography>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard;
