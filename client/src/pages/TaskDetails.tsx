import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Chip, Paper, Grid,
  CircularProgress, Alert, Divider, Avatar, Card, CardContent, Stack
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import GavelIcon from '@mui/icons-material/Gavel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
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
  const [bids, setBids] = useState<any[]>([]);
  const [acceptingBidId, setAcceptingBidId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTaskAndBids = async () => {
    try {
      const taskRes = await tasksApi.getById(id!);
      setTask(taskRes.data);
      if (user && taskRes.data.user_email === user.email) {
        const bidsRes = await bidsApi.getForTask(id!);
        setBids(bidsRes.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskAndBids();
    if (user && id) {
      bidsApi.checkBid(id).then(res => setHasBid(res.data.hasBid)).catch(() => {});
    }
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

  const handleAcceptBid = async (bidId: string) => {
    setAcceptingBidId(bidId);
    try {
      const res = await bidsApi.accept(bidId);
      setMessage({
        type: 'success',
        text: `Bid accepted! Escrow secured: Gross ₹${res.data.escrow?.grossAmount?.toLocaleString()} (1% TDS: ₹${res.data.escrow?.section194OTDS})`
      });
      await fetchTaskAndBids();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to accept bid' });
    } finally {
      setAcceptingBidId(null);
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
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip label={task.category} sx={{ bgcolor: 'rgba(79,70,229,0.08)', color: '#4f46e5', fontWeight: 700 }} />
              <Chip label={`Status: ${task.status || 'open'}`} sx={{
                bgcolor: task.status === 'in-progress' ? 'rgba(79,70,229,0.1)' : task.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
                color: task.status === 'in-progress' ? '#4f46e5' : task.status === 'completed' ? '#10b981' : '#64748b',
                fontWeight: 700, textTransform: 'capitalize'
              }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, fontFamily: 'Inter, sans-serif', letterSpacing: '-1px' }}>{task.title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: '#4f46e5', fontSize: '0.75rem' }}>{task.user_name?.[0]}</Avatar>
              <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>Posted by <strong>{task.user_name}</strong></Typography>
            </Box>

            <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(79,70,229,0.08)', mb: 3 }}>
              <Typography sx={{ fontWeight: 700, mb: 1.5, color: '#0f172a' }}>Task Description</Typography>
              <Typography sx={{ color: '#475569', lineHeight: 1.8 }}>{task.description}</Typography>
            </Paper>

            {message && <Alert severity={message.type} sx={{ borderRadius: '12px', mb: 3 }}>{message.text}</Alert>}

            {/* Owner Proposals & Bids Section */}
            {isOwner && (
              <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(79,70,229,0.12)', mb: 3, bgcolor: '#ffffff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Proposals & Bids ({bids.length})
                  </Typography>
                  <Chip icon={<SecurityIcon sx={{ fontSize: '14px !important' }} />} label="Escrow Protected" size="small" sx={{ bgcolor: 'rgba(16,185,129,0.08)', color: '#10b981', fontWeight: 600 }} />
                </Box>
                <Divider sx={{ mb: 2.5 }} />

                {bids.length === 0 ? (
                  <Typography sx={{ color: '#94a3b8', py: 2, textAlign: 'center' }}>No proposals received yet.</Typography>
                ) : (
                  <Stack spacing={2}>
                    {bids.map((b) => (
                      <Card key={b.id} variant="outlined" sx={{ borderRadius: '12px', borderColor: b.status === 'accepted' ? '#10b981' : '#e2e8f0', bgcolor: b.status === 'accepted' ? 'rgba(16,185,129,0.03)' : '#ffffff' }}>
                        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: '#4f46e5', fontWeight: 700 }}>{b.user_name?.[0] || 'U'}</Avatar>
                              <Box>
                                <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>{b.user_name}</Typography>
                                <Typography sx={{ color: '#64748b', fontSize: '0.8rem' }}>{b.user_email}</Typography>
                                <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem', mt: 0.5 }}>
                                  Submitted: {new Date(b.created_at).toLocaleString()}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Chip
                                label={b.status.toUpperCase()}
                                size="small"
                                sx={{
                                  bgcolor: b.status === 'accepted' ? 'rgba(16,185,129,0.1)' : b.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
                                  color: b.status === 'accepted' ? '#10b981' : b.status === 'rejected' ? '#ef4444' : '#ca8a04',
                                  fontWeight: 700
                                }}
                              />
                              {b.status === 'pending' && task.status === 'open' && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleAcceptBid(b.id)}
                                  disabled={acceptingBidId === b.id}
                                  startIcon={<CheckCircleIcon />}
                                  sx={{
                                    bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' },
                                    fontWeight: 700, borderRadius: '8px', textTransform: 'none'
                                  }}
                                >
                                  {acceptingBidId === b.id ? 'Accepting...' : 'Accept & Hire'}
                                </Button>
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Paper>
            )}

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
            {deadlinePassed && !isOwner && <Alert severity="warning" sx={{ borderRadius: '12px' }}>This task's deadline has passed.</Alert>}
          </Grid>

          <Grid xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(79,70,229,0.08)', position: 'sticky', top: 90 }}>
              <Typography sx={{ fontWeight: 700, mb: 2.5, color: '#0f172a' }}>Task Overview</Typography>
              <Divider sx={{ mb: 2 }} />
              {[
                { icon: <AttachMoneyIcon sx={{ color: '#10b981' }} />, label: 'Budget', value: `₹${task.budget}`, color: '#10b981' },
                { icon: <CalendarMonthIcon sx={{ color: '#4f46e5' }} />, label: 'Deadline', value: new Date(task.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), color: '#4f46e5' },
                { icon: <PeopleIcon sx={{ color: '#0891b2' }} />, label: 'Total Bids', value: task.total_bids || bids.length || 0, color: '#0891b2' },
              ].map(item => (
                <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: '10px', mb: 1, bgcolor: 'rgba(248,250,252,0.8)' }}>
                  {item.icon}
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.label}</Typography>
                    <Typography sx={{ fontWeight: 800, color: item.color, fontSize: '1.1rem' }}>{item.value}</Typography>
                  </Box>
                </Box>
              ))}

              {/* Escrow Breakdown Card */}
              <Box sx={{ mt: 3, p: 2, borderRadius: '12px', bgcolor: 'rgba(79,70,229,0.04)', border: '1px dashed rgba(79,70,229,0.2)' }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5', mb: 1 }}>
                  🛡️ Section 194-O Escrow Breakdown
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', mb: 0.5 }}>
                  <span>Gross Escrow:</span>
                  <strong>₹{Number(task.budget).toLocaleString()}</strong>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', mb: 0.5 }}>
                  <span>10% Platform Fee:</span>
                  <strong>₹{(Number(task.budget) * 0.10).toLocaleString()}</strong>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', mb: 0.5 }}>
                  <span>1% TDS (Sec 194-O):</span>
                  <strong>₹{(Number(task.budget) * 0.01).toLocaleString()}</strong>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>
                  <span>Net Payout:</span>
                  <span>₹{(Number(task.budget) * 0.89).toLocaleString()}</span>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default TaskDetails;
