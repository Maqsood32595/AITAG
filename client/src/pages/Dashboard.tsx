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
import { DashboardLayout } from '../layouts/DashboardLayout';
import { tasksApi, bidsApi, invitationsApi, serviceOrdersApi } from '../api';
import { useAuth } from '../context/AuthContext';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

import { getHappyPastelAvatar } from '../utils/avatar';

const Dashboard = () => {
  const { user } = useAuth();
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [serviceOrders, setServiceOrders] = useState<any[]>([]);
  const [allCount, setAllCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDashboardData = () => {
    const ordersPromise = user?.role === 'admin'
      ? serviceOrdersApi.getAll()
      : serviceOrdersApi.getAll({ email: user?.email });

    Promise.all([
      tasksApi.getMy().then(r => setMyTasks(r.data || [])),
      tasksApi.getAll().then(r => setAllCount((r.data || []).length)),
      bidsApi.getMy().then(r => setMyBids(r.data.bids || [])),
      invitationsApi.getMy().then(r => setInvitations(r.data || [])).catch(() => setInvitations([])),
      ordersPromise.then(r => setServiceOrders(r.data?.orders || [])).catch(() => setServiceOrders([])),
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
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ pb: 6 }}>
        {/* Welcome */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', mb: 4, background: 'linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(8,145,178,0.06) 100%)', border: '1px solid rgba(79,70,229,0.1)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Avatar src={user?.photo_url || getHappyPastelAvatar(user?.name || user?.email)} sx={{ width: 56, height: 56, bgcolor: '#c0aede', fontSize: '1.3rem', fontWeight: 700, border: '3px solid rgba(79,70,229,0.2)' }}>
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

        {/* AI Service Package Orders (Pilot Packages & Outcomes) */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: '20px',
            border: '1px solid rgba(79,70,229,0.15)',
            bgcolor: '#ffffff',
            mb: 4,
            boxShadow: '0 8px 30px rgba(79,70,229,0.04)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBagIcon sx={{ color: '#4f46e5', fontSize: 22 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                  {user?.role === 'admin' ? 'All Pilot Service Package Requests' : 'My AI Service Package Requests'}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.825rem' }}>
                  {user?.role === 'admin'
                    ? 'Review customer briefs, lock pricing, and assign vetted AI specialists'
                    : 'Track your requested outcome packages, status updates, and deliverables'}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={`${serviceOrders.length} ${serviceOrders.length === 1 ? 'Order' : 'Orders'}`}
              sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 700, fontSize: '0.8rem' }}
            />
          </Box>
          <Divider sx={{ mb: 3 }} />

          {serviceOrders.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
              <Typography sx={{ color: '#64748b', fontWeight: 600, mb: 1 }}>No Service Package Requests Yet</Typography>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', mb: 2 }}>
                Browse our fixed-scope pilot packages and request an outcome today.
              </Typography>
              <Button component={Link} to="/" variant="contained" size="small" sx={{ bgcolor: '#4f46e5', textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                Explore Service Packages
              </Button>
            </Box>
          ) : (
            <Stack spacing={2.5}>
              {serviceOrders.map((ord: any) => {
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'REQUESTED': return { bg: '#fef3c7', text: '#b45309' };
                    case 'MATCHED': return { bg: '#e0e7ff', text: '#4338ca' };
                    case 'ACTIVE': return { bg: '#dcfce7', text: '#15803d' };
                    case 'DRAFT_SUBMITTED': return { bg: '#f3e8ff', text: '#7e22ce' };
                    case 'COMPLETED': return { bg: '#ecfdf5', text: '#047857' };
                    default: return { bg: '#f1f5f9', text: '#475569' };
                  }
                };
                const statusStyle = getStatusColor(ord.status);

                return (
                  <Paper
                    key={ord.id}
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s ease',
                      '&:hover': { borderColor: '#c7d2fe', boxShadow: '0 4px 15px rgba(79,70,229,0.06)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                            {ord.package_title}
                          </Typography>
                          <Chip
                            label={
                              ord.tier_name?.startsWith('package_')
                                ? ord.tier_name.replace('package_', 'Package ').toUpperCase()
                                : (ord.tier_name ? `${ord.tier_name.toUpperCase()} TIER` : 'PACKAGE 1')
                            }
                            size="small"
                            sx={{ bgcolor: '#ede9fe', color: '#6d28d9', fontWeight: 700, fontSize: '0.65rem' }}
                          />
                        </Stack>
                        <Typography sx={{ color: '#64748b', fontSize: '0.825rem' }}>
                          Order: <strong>{ord.order_number}</strong> • Customer: <strong>{ord.customer_name}</strong> ({ord.customer_email})
                          {ord.customer_phone ? ` • Tel: ${ord.customer_phone}` : ''}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#4f46e5' }}>
                          ₹{Number(ord.agreed_price || 0).toLocaleString('en-IN')}
                        </Typography>
                        <Chip
                          label={ord.status}
                          size="small"
                          sx={{ bgcolor: statusStyle.bg, color: statusStyle.text, fontWeight: 800, fontSize: '0.72rem', mt: 0.5 }}
                        />
                      </Box>
                    </Box>

                    {(ord.business_name || ord.brief_notes) && (
                      <Box sx={{ mt: 1.5, p: 2, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        {ord.business_name && (
                          <Typography sx={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600, mb: 0.5 }}>
                            Business: {ord.business_name} {ord.business_type ? `(${ord.business_type})` : ''}
                          </Typography>
                        )}
                        {ord.brief_notes && (
                          <Typography sx={{ fontSize: '0.825rem', color: '#64748b' }}>
                            <strong>Brief Notes:</strong> "{ord.brief_notes}"
                          </Typography>
                        )}
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Requested on {new Date(ord.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </Typography>
                      <Chip
                        label={ord.assigned_expert_email ? `Expert: ${ord.assigned_expert_name || ord.assigned_expert_email}` : 'Pending Expert Matching'}
                        size="small"
                        sx={{ bgcolor: ord.assigned_expert_email ? '#e0f2fe' : '#fef3c7', color: ord.assigned_expert_email ? '#0369a1' : '#b45309', fontSize: '0.72rem', fontWeight: 600 }}
                      />
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Paper>

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
    </DashboardLayout>
  );
};

export default Dashboard;
