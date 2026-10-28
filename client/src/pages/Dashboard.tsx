import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Paper, Chip, CircularProgress,
  Button, Divider, Stack, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Select, FormControl, InputLabel,
  Rating, Tooltip, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import TaskIcon from '@mui/icons-material/Assignment';
import BidIcon from '@mui/icons-material/Gavel';
import PostIcon from '@mui/icons-material/PostAdd';
import MailIcon from '@mui/icons-material/Mail';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RateReviewIcon from '@mui/icons-material/RateReview';
import StarIcon from '@mui/icons-material/Star';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ForumIcon from '@mui/icons-material/Forum';
import PersonIcon from '@mui/icons-material/Person';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { tasksApi, bidsApi, invitationsApi, serviceOrdersApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { AnimatedAvatar } from '../components/AnimatedAvatar';
import { CaseDiscussionModal } from '../components/CaseDiscussionModal';
import { TaskAssetsModal } from '../components/TaskAssetsModal';

const VETTED_SPECIALISTS = [
  { name: 'Expert 1', email: 'expert1@aitag.com', role: 'Vetted AI Specialist' },
  { name: 'Dr. Aarav Sharma', email: 'dr.aarav@aitag.com', role: 'AI Product Photo Makeover Specialist' },
  { name: 'Priya Mukherjee', email: 'priya@aitag.com', role: 'AI E-Commerce Listing & Copy Specialist' },
  { name: 'Vikramaditya Iyer', email: 'vikram@aitag.com', role: 'AI Social Media Content Creator' },
  { name: 'Ananya Deshmukh', email: 'ananya@aitag.com', role: 'AI Website & Landing Page Builder' },
  { name: 'Maqs', email: 'l.maqsood.m@gmail.com', role: 'AI Product Visuals Lead' },
  { name: 'User1 Admin', email: 'user1@aitag.com', role: 'Senior AI Automation Specialist' },
];

const ORDER_STEPS = [
  { key: 'REQUESTED', label: '1. Brief Requested' },
  { key: 'MATCHED', label: '2. Expert Matched' },
  { key: 'ACTIVE', label: '3. Active & Paid' },
  { key: 'DRAFT_SUBMITTED', label: '4. Draft Deliverables' },
  { key: 'COMPLETED', label: '5. Approved & Complete' },
];

const TASK_STEPS = [
  { key: 'POSTED', label: '1. Task Posted' },
  { key: 'BIDDING', label: '2. Bidding Active' },
  { key: 'IN_PROGRESS', label: '3. Matched & In Progress' },
  { key: 'COMPLETED', label: '4. Approved & Complete' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [serviceOrders, setServiceOrders] = useState<any[]>([]);
  const [allCount, setAllCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modals state
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  
  // Assign Expert Modal (Dual-mode: Pilot Orders & Marketplace Tasks)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignTargetType, setAssignTargetType] = useState<'order' | 'task'>('order');
  const [activeAssignTask, setActiveAssignTask] = useState<any | null>(null);
  const [selectedExpertPreset, setSelectedExpertPreset] = useState(VETTED_SPECIALISTS[0].email);
  const [customExpertName, setCustomExpertName] = useState('');
  const [customExpertEmail, setCustomExpertEmail] = useState('');

  // Submit Draft Modal
  const [draftDialogOpen, setDraftDialogOpen] = useState(false);
  const [draftUrl, setDraftUrl] = useState('');
  const [draftLabel, setDraftLabel] = useState('');
  const [draftNotes, setDraftNotes] = useState('');

  // Request Revision Modal
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');

  // Approve Modal
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [ratingVal, setRatingVal] = useState<number | null>(5);
  const [testimonial, setTestimonial] = useState('');
  const [finalFileUrl, setFinalFileUrl] = useState('');

  // Case Discussion Modal
  const [discussionModalOpen, setDiscussionModalOpen] = useState(false);
  const [activeDiscussionOrder, setActiveDiscussionOrder] = useState<any | null>(null);
  const [activeDiscussionTask, setActiveDiscussionTask] = useState<any | null>(null);

  // Platform Oversight (Marketplace Tasks & Assets)
  const [allMarketplaceTasks, setAllMarketplaceTasks] = useState<any[]>([]);
  const [activeAssetTask, setActiveAssetTask] = useState<any | null>(null);
  const [assetsModalOpen, setAssetsModalOpen] = useState(false);

  const openDiscussionModal = (order: any) => {
    setActiveDiscussionOrder(order);
    setActiveDiscussionTask(null);
    setDiscussionModalOpen(true);
  };

  const openTaskDiscussionModal = (task: any) => {
    setActiveDiscussionTask(task);
    setActiveDiscussionOrder(null);
    setDiscussionModalOpen(true);
  };

  const openAssetsModal = (task: any) => {
    setActiveAssetTask(task);
    setAssetsModalOpen(true);
  };

  const handleTaskUpdated = (updatedTask: any) => {
    setAllMarketplaceTasks(prev => prev.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t));
    setActiveAssetTask(updatedTask);
  };

  const fetchDashboardData = () => {
    const ordersPromise = user?.role === 'admin'
      ? serviceOrdersApi.getAll()
      : serviceOrdersApi.getAll({ role: user?.role, email: user?.email });

    Promise.all([
      tasksApi.getMy().then(r => setMyTasks(r.data || [])),
      tasksApi.getAll().then(r => {
        const list = r.data || [];
        setAllCount(list.length);
        setAllMarketplaceTasks(list);
      }),
      bidsApi.getMy().then(r => setMyBids(r.data.bids || [])),
      invitationsApi.getMy().then(r => setInvitations(r.data || [])).catch(() => setInvitations([])),
      ordersPromise.then(r => setServiceOrders(r.data?.orders || [])).catch(() => setServiceOrders([])),
    ]).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const showSuccessBanner = (msg: string) => {
    setActionSuccess(msg);
    setActionError('');
    setTimeout(() => setActionSuccess(''), 5000);
  };

  const showErrorBanner = (msg: string) => {
    setActionError(msg);
    setActionSuccess('');
    setTimeout(() => setActionError(''), 5000);
  };

  const handleAcceptInvite = async (inviteId: string) => {
    setActionLoading(inviteId);
    try {
      await invitationsApi.accept(inviteId);
      showSuccessBanner('🎉 Invitation accepted! Your proposal has been submitted to the client.');
      fetchDashboardData();
    } catch (err: any) {
      showErrorBanner(err.response?.data?.error || 'Failed to accept invitation');
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
      showErrorBanner(err.response?.data?.error || 'Failed to decline invitation');
    } finally {
      setActionLoading(null);
    }
  };

  // --- Order & Task Lifecycle Actions ---

  // 1. Assign Expert (Pilot Orders & Marketplace Tasks)
  const openAssignModal = (order: any) => {
    setAssignTargetType('order');
    setActiveOrder(order);
    setActiveAssignTask(null);
    setSelectedExpertPreset(VETTED_SPECIALISTS[0].email);
    setCustomExpertName('');
    setCustomExpertEmail('');
    setAssignDialogOpen(true);
  };

  const openTaskAssignModal = (task: any) => {
    setAssignTargetType('task');
    setActiveAssignTask(task);
    setActiveOrder(null);
    setSelectedExpertPreset(VETTED_SPECIALISTS[0].email);
    setCustomExpertName('');
    setCustomExpertEmail('');
    setAssignDialogOpen(true);
  };

  const handleResetTaskAssignment = async (task: any) => {
    if (!window.confirm(`Reset assignment for Task "${task.title}"? This will return the task to the open bidding pool.`)) return;
    setActionLoading(`reset-task-${task.id}`);
    try {
      await tasksApi.resetAssignment(task.id);
      showSuccessBanner(`Task #${String(task.id).replace('task-', '').slice(-6)} returned to open bidding pool.`);
      fetchDashboardData();
    } catch (err: any) {
      showErrorBanner(err.response?.data?.error || 'Failed to reset task assignment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmAssign = async () => {
    let email = selectedExpertPreset;
    let name = VETTED_SPECIALISTS.find(e => e.email === selectedExpertPreset)?.name || 'Vetted AI Specialist';

    if (selectedExpertPreset === 'CUSTOM') {
      if (!customExpertEmail.trim()) {
        showErrorBanner('Please provide custom specialist email');
        return;
      }
      email = customExpertEmail.trim();
      name = customExpertName.trim() || 'AI Specialist';
    }

    if (assignTargetType === 'task' && activeAssignTask) {
      setActionLoading(`assign-task-${activeAssignTask.id}`);
      try {
        await tasksApi.assign(activeAssignTask.id, {
          expertEmail: email,
          expertName: name
        });
        showSuccessBanner(`✅ Vetted Expert ${name} matched to Task #${String(activeAssignTask.id).replace('task-', '').slice(-6)}! Status updated to In Progress.`);
        setAssignDialogOpen(false);
        fetchDashboardData();
      } catch (err: any) {
        showErrorBanner(err.response?.data?.error || 'Failed to assign expert to task');
      } finally {
        setActionLoading(null);
      }
    } else if (activeOrder) {
      setActionLoading(`assign-${activeOrder.id}`);
      try {
        await serviceOrdersApi.assign(activeOrder.id, {
          expertEmail: email,
          expertName: name
        });

        showSuccessBanner(`✅ Expert ${name} matched to Order ${activeOrder.order_number}!`);
        setAssignDialogOpen(false);
        fetchDashboardData();
      } catch (err: any) {
        showErrorBanner(err.response?.data?.error || 'Failed to assign expert');
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Reset Expert Assignment (Admin action)
  const handleResetAssignment = async (order: any) => {
    if (!window.confirm(`Reset assignment for Order ${order.order_number}? This will unassign the expert and return the brief to the matching queue.`)) return;
    setActionLoading(`reset-${order.id}`);
    try {
      await serviceOrdersApi.reset(order.id);
      showSuccessBanner(`🔁 Order ${order.order_number} has been reset. Status is now Pending Expert Matching.`);
      fetchDashboardData();
    } catch (err: any) {
      showErrorBanner(err.response?.data?.error || 'Failed to reset assignment');
    } finally {
      setActionLoading(null);
    }
  };

  // 2. Activate Project (Confirm Payment)
  const handleActivateProject = async (order: any) => {
    setActionLoading(`activate-${order.id}`);
    try {
      await serviceOrdersApi.activate(order.id);
      showSuccessBanner(`🚀 Order ${order.order_number} is now ACTIVE! Escrow secured & specialist notified to begin work.`);
      fetchDashboardData();
    } catch (err: any) {
      showErrorBanner(err.response?.data?.error || 'Failed to activate order');
    } finally {
      setActionLoading(null);
    }
  };

  // 3. Submit Draft Deliverables
  const openDraftModal = (order: any) => {
    setActiveOrder(order);
    setDraftUrl('');
    setDraftLabel('Draft v1 Deliverables (Cutouts & Master Files)');
    setDraftNotes('');
    setDraftDialogOpen(true);
  };

  const handleConfirmDraft = async () => {
    if (!activeOrder) return;
    if (!draftUrl.trim()) {
      showErrorBanner('Please provide a deliverable file or drive link');
      return;
    }
    setActionLoading(`draft-${activeOrder.id}`);
    try {
      const files = [
        {
          url: draftUrl.trim(),
          label: draftLabel.trim() || 'Draft Deliverable',
          notes: draftNotes.trim(),
          submitted_at: new Date().toISOString()
        }
      ];
      await serviceOrdersApi.submitDraft(activeOrder.id, { draftFiles: files });
      showSuccessBanner(`📦 Draft deliverables submitted for Order ${activeOrder.order_number}! Customer notified for review.`);
      setDraftDialogOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      showErrorBanner(err.response?.data?.error || 'Failed to submit draft');
    } finally {
      setActionLoading(null);
    }
  };

  // 4. Request Revision
  const openRevisionModal = (order: any) => {
    setActiveOrder(order);
    setRevisionNotes('');
    setRevisionDialogOpen(true);
  };

  const handleConfirmRevision = async () => {
    if (!activeOrder) return;
    if (!revisionNotes.trim()) {
      showErrorBanner('Please explain the revisions requested');
      return;
    }
    setActionLoading(`revision-${activeOrder.id}`);
    try {
      await serviceOrdersApi.requestRevision(activeOrder.id, { revisionNotes: revisionNotes.trim() });
      showSuccessBanner(`🔁 Revision request recorded for Order ${activeOrder.order_number}. Specialist assigned for corrections.`);
      setRevisionDialogOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      showErrorBanner(err.response?.data?.error || 'Failed to request revision');
    } finally {
      setActionLoading(null);
    }
  };

  // 5. Approve & Complete
  const openApproveModal = (order: any) => {
    setActiveOrder(order);
    setRatingVal(5);
    setTestimonial('Exceptional outcome delivered right on time! Perfectly optimized for our marketplace.');
    setFinalFileUrl('');
    setApproveDialogOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!activeOrder) return;
    setActionLoading(`approve-${activeOrder.id}`);
    try {
      const payload: any = {
        rating: ratingVal || 5,
        testimonial: testimonial.trim(),
      };
      if (finalFileUrl.trim()) {
        payload.finalFiles = [{ url: finalFileUrl.trim(), label: 'Final Approved Asset Pack' }];
      }
      await serviceOrdersApi.approve(activeOrder.id, payload);
      showSuccessBanner(`🎉 Order ${activeOrder.order_number} marked COMPLETED & APPROVED! Specialist payout released.`);
      setApproveDialogOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      showErrorBanner(err.response?.data?.error || 'Failed to approve order');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingInvites = invitations.filter(inv => inv.status === 'pending');
  const isAdmin = user?.role === 'admin';
  const isFreelancer = user?.role === 'freelancer';
  const isClient = user?.role === 'client';

  const stats = isAdmin ? [
    { icon: <TaskIcon sx={{ color: '#4f46e5' }} />, label: 'All Platform Tasks', value: allCount, color: '#4f46e5', bg: 'rgba(79,70,229,0.08)', link: '/all_tasks' },
    { icon: <ShoppingBagIcon sx={{ color: '#0891b2' }} />, label: 'Total Service Requests', value: serviceOrders.length, color: '#0891b2', bg: 'rgba(8,145,178,0.08)', scrollId: 'orders-section' },
    { icon: <BidIcon sx={{ color: '#10b981' }} />, label: 'Active Platform Bids', value: myBids.length, color: '#10b981', bg: 'rgba(16,185,129,0.08)', link: '/all_tasks' },
  ] : isFreelancer ? [
    { icon: <TaskIcon sx={{ color: '#4f46e5' }} />, label: 'Tasks Available to Bid', value: allCount, color: '#4f46e5', bg: 'rgba(79,70,229,0.08)', link: '/all_tasks' },
    { icon: <BidIcon sx={{ color: '#10b981' }} />, label: 'My Placed Bids', value: myBids.length, color: '#10b981', bg: 'rgba(16,185,129,0.08)', link: '/my_tasks' },
    { icon: <ShoppingBagIcon sx={{ color: '#0891b2' }} />, label: 'My Assigned Projects', value: serviceOrders.length, color: '#0891b2', bg: 'rgba(8,145,178,0.08)', scrollId: 'orders-section' },
  ] : [
    { icon: <PostIcon sx={{ color: '#0891b2' }} />, label: 'My Posted Tasks', value: myTasks.length, color: '#0891b2', bg: 'rgba(8,145,178,0.08)', link: '/my_tasks' },
    { icon: <ShoppingBagIcon sx={{ color: '#4f46e5' }} />, label: 'My Service Requests', value: serviceOrders.length, color: '#4f46e5', bg: 'rgba(79,70,229,0.08)', scrollId: 'orders-section' },
    { icon: <TaskIcon sx={{ color: '#10b981' }} />, label: 'Marketplace Tasks', value: allCount, color: '#10b981', bg: 'rgba(16,185,129,0.08)', link: '/all_tasks' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'REQUESTED':
      case 'QUALIFIED':
        return 0;
      case 'MATCHED':
      case 'SCOPE_CONFIRMED':
      case 'PAID':
        return 1;
      case 'ACTIVE':
        return 2;
      case 'DRAFT_SUBMITTED':
      case 'REVISION':
        return 3;
      case 'COMPLETED':
        return 4;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress sx={{ color: '#4f46e5' }} />
      </Box>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ pb: 6 }}>
        {/* Welcome Banner */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: '20px',
            mb: 4,
            background: 'linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(8,145,178,0.06) 100%)',
            border: '1px solid rgba(79,70,229,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <AnimatedAvatar name={user?.name || user?.email} size={64} src={user?.photo_url} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.5px' }}>
                  Welcome back, {user?.name || 'User'}!
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>{user?.email}</Typography>
                <Chip
                  label={user?.role === 'client' ? 'AI Services Customer' : user?.role}
                  size="small"
                  sx={{
                    mt: 0.5,
                    bgcolor: 'rgba(79,70,229,0.1)',
                    color: '#4f46e5',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    textTransform: 'capitalize',
                  }}
                />
              </Box>
            </Box>

            {isClient && (
              <Button
                component={Link}
                to="/add_task"
                variant="contained"
                startIcon={<PostIcon />}
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
                + Post a New Task
              </Button>
            )}
          </Box>
        </Paper>

        {actionSuccess && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: '12px', fontWeight: 600 }}>
            {actionSuccess}
          </Alert>
        )}

        {actionError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', fontWeight: 600 }}>
            {actionError}
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
          {stats.map(s => {
            const isClickable = Boolean(s.link || s.scrollId);
            const handleClick = () => {
              if (s.scrollId) {
                const el = document.getElementById(s.scrollId);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            };

            return (
              <Grid xs={12} md={4} key={s.label}>
                <Paper
                  elevation={0}
                  component={s.link ? Link : 'div'}
                  to={s.link}
                  onClick={handleClick}
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    border: '1px solid rgba(79,70,229,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    textDecoration: 'none',
                    cursor: isClickable ? 'pointer' : 'default',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': isClickable ? {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(79,70,229,0.12)',
                      borderColor: 'rgba(79,70,229,0.3)',
                    } : {}
                  }}
                >
                  <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {s.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8' }}>{s.label}</Typography>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.8rem', color: s.color, lineHeight: 1.2, fontFamily: 'Inter, sans-serif' }}>
                      {s.value}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        {/* AI Service Package Orders (Pilot Packages & Outcomes) */}
        <Paper
          id="orders-section"
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
              <Box sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBagIcon sx={{ color: '#4f46e5', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>
                  {isAdmin
                    ? 'All Pilot Service Package Requests (Admin Management)'
                    : isFreelancer
                    ? 'My Assigned Client Projects'
                    : 'My AI Service Package Requests'}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                  {isAdmin
                    ? 'Review customer briefs, assign vetted specialists, manage payment escrow, and approve deliverables'
                    : isFreelancer
                    ? 'Manage project deliverables, submit drafts for client approval, and receive escrow payouts'
                    : 'Track your requested outcome packages, status updates, and deliverables'}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={`${serviceOrders.length} ${serviceOrders.length === 1 ? 'Order' : 'Orders'}`}
              sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 800, fontSize: '0.85rem', px: 1 }}
            />
          </Box>
          <Divider sx={{ mb: 3 }} />

          {serviceOrders.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5, bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
              <Typography sx={{ color: '#64748b', fontWeight: 600, mb: 1, fontSize: '1.05rem' }}>
                {isFreelancer ? 'No Projects Assigned Yet' : 'No Service Package Requests Yet'}
              </Typography>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', mb: 2 }}>
                {isFreelancer
                  ? 'Once an Admin matches you with a client package brief, it will appear here.'
                  : 'Browse our fixed-scope pilot packages and request an outcome today.'}
              </Typography>
              {!isFreelancer && (
                <Button component={Link} to="/" variant="contained" size="small" sx={{ bgcolor: '#4f46e5', textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                  Explore Service Packages
                </Button>
              )}
            </Box>
          ) : (
            <Stack spacing={3}>
              {serviceOrders.map((ord: any) => {
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'REQUESTED': return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
                    case 'MATCHED': return { bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' };
                    case 'ACTIVE': return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
                    case 'DRAFT_SUBMITTED': return { bg: '#f3e8ff', text: '#7e22ce', border: '#e9d5ff' };
                    case 'REVISION': return { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' };
                    case 'COMPLETED': return { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' };
                    default: return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
                  }
                };
                const statusStyle = getStatusColor(ord.status);
                const currentStepIdx = getStepIndex(ord.status);

                return (
                  <Paper
                    key={ord.id}
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: '16px',
                      bgcolor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease',
                      '&:hover': { borderColor: '#818cf8', boxShadow: '0 8px 24px rgba(79,70,229,0.08)' }
                    }}
                  >
                    {/* Header Row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                            {ord.package_title}
                          </Typography>
                          <Chip
                            label={
                              ord.tier_name?.startsWith('package_')
                                ? ord.tier_name.replace('package_', 'Package ').toUpperCase()
                                : (ord.tier_name ? `${ord.tier_name.toUpperCase()} TIER` : 'PACKAGE 1')
                            }
                            size="small"
                            sx={{ bgcolor: '#ede9fe', color: '#6d28d9', fontWeight: 800, fontSize: '0.7rem' }}
                          />
                        </Stack>
                        <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                          Order: <strong>{ord.order_number}</strong> • Customer: <strong>{ord.customer_name}</strong> ({ord.customer_email})
                          {ord.customer_phone ? ` • Tel: ${ord.customer_phone}` : ''}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                        <Typography sx={{ fontWeight: 900, fontSize: '1.3rem', color: '#4f46e5' }}>
                          ₹{Number(ord.agreed_price || 0).toLocaleString('en-IN')}
                        </Typography>
                        <Chip
                          label={ord.status}
                          size="small"
                          sx={{
                            bgcolor: statusStyle.bg,
                            color: statusStyle.text,
                            border: `1px solid ${statusStyle.border}`,
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            mt: 0.5,
                            letterSpacing: '0.5px'
                          }}
                        />
                      </Box>
                    </Box>

                    {/* 5-Stage Visual Workflow Stepper Bar */}
                    <Box sx={{ mb: 2.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        {ORDER_STEPS.map((step, idx) => {
                          const isDone = idx < currentStepIdx || ord.status === 'COMPLETED';
                          const isCurrent = idx === currentStepIdx && ord.status !== 'COMPLETED';

                          let stepColor = '#94a3b8';
                          let stepBg = 'transparent';
                          let stepBorder = '#cbd5e1';

                          if (isDone) {
                            stepColor = '#047857';
                            stepBg = '#ecfdf5';
                            stepBorder = '#a7f3d0';
                          } else if (isCurrent) {
                            stepColor = '#4338ca';
                            stepBg = '#e0e7ff';
                            stepBorder = '#818cf8';
                          }

                          return (
                            <Chip
                              key={step.key}
                              label={step.label}
                              size="small"
                              sx={{
                                fontWeight: isCurrent ? 800 : 600,
                                fontSize: '0.72rem',
                                color: stepColor,
                                bgcolor: stepBg,
                                border: `1px solid ${stepBorder}`,
                                px: 0.5
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Box>

                    {/* Brief & Notes */}
                    {(ord.business_name || ord.brief_notes) && (
                      <Box sx={{ mb: 2, p: 2, bgcolor: '#fafafa', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                        {ord.business_name && (
                          <Typography sx={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 700, mb: 0.5 }}>
                            Business: {ord.business_name} {ord.business_type ? `(${ord.business_type})` : ''}
                          </Typography>
                        )}
                        {ord.brief_notes && (
                          <Typography sx={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.5 }}>
                            <strong>Brief Notes:</strong> "{ord.brief_notes}"
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Revision Notes Alert (if revision requested) */}
                    {ord.revision_notes && ord.status === 'REVISION' && (
                      <Alert severity="warning" sx={{ mb: 2, borderRadius: '10px', fontSize: '0.825rem' }}>
                        <strong>Customer Revision Request:</strong> {ord.revision_notes}
                      </Alert>
                    )}

                    {/* Deliverables Display (if draft or final files submitted) */}
                    {ord.draft_deliverables && Array.isArray(ord.draft_deliverables) && ord.draft_deliverables.length > 0 && (
                      <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f3ff', borderRadius: '10px', border: '1px solid #ddd6fe' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#6d28d9', mb: 1 }}>
                          📁 Submitted Deliverables ({ord.draft_deliverables.length}):
                        </Typography>
                        <Stack spacing={1}>
                          {ord.draft_deliverables.map((d: any, idx: number) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#ffffff', p: 1, px: 1.5, borderRadius: '8px', border: '1px solid #ede9fe' }}>
                              <Typography sx={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 600 }}>
                                {d.label || `Deliverable File #${idx + 1}`}
                              </Typography>
                              {d.url && (
                                <Button
                                  href={d.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  size="small"
                                  endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                                  sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5' }}
                                >
                                  View Deliverable
                                </Button>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* Completed Outcome Review & Rating */}
                    {ord.status === 'COMPLETED' && (ord.rating || ord.testimonial) && (
                      <Box sx={{ mb: 2, p: 2, bgcolor: '#ecfdf5', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          <Rating value={Number(ord.rating) || 5} readOnly size="small" />
                          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#065f46' }}>
                            Approved 5/5 Customer Rating
                          </Typography>
                        </Stack>
                        {ord.testimonial && (
                          <Typography sx={{ fontSize: '0.825rem', color: '#047857', fontStyle: 'italic' }}>
                            "{ord.testimonial}"
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Footer Row: Expert & Date + Interactive Actions */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', md: 'center' },
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 2,
                        mt: 2,
                        pt: 2,
                        borderTop: '1px solid #f1f5f9'
                      }}
                    >
                      {/* Left: Expert & Timestamp */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontSize: '0.775rem', color: '#94a3b8' }}>
                          Requested on {new Date(ord.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </Typography>
                        <Chip
                          icon={<PersonIcon sx={{ fontSize: '15px !important', color: ord.assigned_expert_email ? '#0284c7 !important' : '#b45309 !important' }} />}
                          label={
                            ord.assigned_expert_email
                              ? `Expert: ${ord.assigned_expert_name ? `${ord.assigned_expert_name} (${ord.assigned_expert_email})` : ord.assigned_expert_email}`
                              : 'Pending Expert Matching'
                          }
                          size="small"
                          sx={{
                            bgcolor: ord.assigned_expert_email ? '#e0f2fe' : '#fef3c7',
                            color: ord.assigned_expert_email ? '#0369a1' : '#b45309',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            px: 0.5
                          }}
                        />
                      </Box>

                      {/* Right: Interactive State Action Buttons */}
                      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                        {/* Persistent Case Discussion Button */}
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ForumIcon sx={{ fontSize: 16 }} />}
                          onClick={() => openDiscussionModal(ord)}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            borderRadius: '8px',
                            color: '#4f46e5',
                            borderColor: 'rgba(79, 70, 229, 0.35)',
                            bgcolor: 'rgba(79, 70, 229, 0.04)',
                            fontSize: '0.75rem',
                            '&:hover': {
                              bgcolor: 'rgba(79, 70, 229, 0.1)',
                              borderColor: '#4f46e5'
                            }
                          }}
                        >
                          Case Discussion
                        </Button>
                        {/* 1. REQUESTED State */}
                        {ord.status === 'REQUESTED' && (
                          isAdmin ? (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<PersonAddIcon />}
                              onClick={() => openAssignModal(ord)}
                              sx={{
                                bgcolor: '#4f46e5',
                                '&:hover': { bgcolor: '#4338ca' },
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: '8px',
                                px: 2
                              }}
                            >
                              Assign Vetted Expert
                            </Button>
                          ) : (
                            <Chip
                              label="Matching with Vetted Specialist..."
                              size="small"
                              sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 700, fontSize: '0.75rem', border: '1px solid #fde68a' }}
                            />
                          )
                        )}

                        {/* 2. MATCHED State */}
                        {ord.status === 'MATCHED' && (
                          isAdmin ? (
                            <>
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<PlayArrowIcon />}
                                disabled={actionLoading === `activate-${ord.id}`}
                                onClick={() => handleActivateProject(ord)}
                                sx={{
                                  background: 'linear-gradient(135deg, #10b981, #059669)',
                                  color: '#ffffff',
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  borderRadius: '8px',
                                  px: 2,
                                  boxShadow: '0 2px 8px rgba(16,185,129,0.3)'
                                }}
                              >
                                {actionLoading === `activate-${ord.id}` ? 'Activating...' : 'Confirm Payment & Start'}
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => openAssignModal(ord)}
                                sx={{ textTransform: 'none', borderRadius: '8px', fontSize: '0.75rem' }}
                              >
                                Change Expert
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                disabled={actionLoading === `reset-${ord.id}`}
                                onClick={() => handleResetAssignment(ord)}
                                sx={{
                                  textTransform: 'none',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  borderColor: '#fca5a5',
                                  color: '#dc2626',
                                  '&:hover': { bgcolor: '#fef2f2', borderColor: '#ef4444' }
                                }}
                              >
                                {actionLoading === `reset-${ord.id}` ? 'Resetting...' : 'Reset Assignment'}
                              </Button>
                            </>
                          ) : (
                            <Chip
                              label="Specialist Matched • Payment Escrow Processing"
                              size="small"
                              sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 700, fontSize: '0.75rem', border: '1px solid #c7d2fe' }}
                            />
                          )
                        )}

                        {/* 3. ACTIVE State */}
                        {ord.status === 'ACTIVE' && (
                          (isAdmin || isFreelancer) ? (
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<CloudUploadIcon />}
                                onClick={() => openDraftModal(ord)}
                                sx={{
                                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  borderRadius: '8px',
                                  px: 2
                                }}
                              >
                                Submit Draft Deliverables
                              </Button>
                              {isAdmin && (
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  disabled={actionLoading === `reset-${ord.id}`}
                                  onClick={() => handleResetAssignment(ord)}
                                  sx={{
                                    textTransform: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    borderColor: '#fca5a5',
                                    color: '#dc2626',
                                    '&:hover': { bgcolor: '#fef2f2', borderColor: '#ef4444' }
                                  }}
                                >
                                  {actionLoading === `reset-${ord.id}` ? 'Resetting...' : 'Reset Assignment'}
                                </Button>
                              )}
                            </Box>
                          ) : (
                            <Chip
                              label="Project Active • Deliverables in Production"
                              size="small"
                              sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.75rem', border: '1px solid #bbf7d0' }}
                            />
                          )
                        )}

                        {/* 4. DRAFT_SUBMITTED State */}
                        {ord.status === 'DRAFT_SUBMITTED' && (
                          (isAdmin || !isFreelancer) ? (
                            <>
                              <Button
                                variant="outlined"
                                color="warning"
                                size="small"
                                startIcon={<RateReviewIcon />}
                                onClick={() => openRevisionModal(ord)}
                                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                              >
                                Request Revision
                              </Button>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => openApproveModal(ord)}
                                sx={{
                                  background: 'linear-gradient(135deg, #059669, #10b981)',
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  borderRadius: '8px',
                                  px: 2
                                }}
                              >
                                Approve & Complete
                              </Button>
                            </>
                          ) : (
                            <Chip
                              label="Draft Deliverables Submitted • Awaiting Client Review"
                              size="small"
                              sx={{ bgcolor: '#f3e8ff', color: '#7e22ce', fontWeight: 700, fontSize: '0.75rem', border: '1px solid #e9d5ff' }}
                            />
                          )
                        )}

                        {/* 5. REVISION State */}
                        {ord.status === 'REVISION' && (
                          (isAdmin || isFreelancer) ? (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<CloudUploadIcon />}
                              onClick={() => openDraftModal(ord)}
                              sx={{
                                bgcolor: '#d97706',
                                '&:hover': { bgcolor: '#b45309' },
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: '8px',
                                px: 2
                              }}
                            >
                              Submit Revised Deliverables
                            </Button>
                          ) : (
                            <Chip
                              label="Revision in Progress with Specialist"
                              size="small"
                              sx={{ bgcolor: '#ffedd5', color: '#c2410c', fontWeight: 700, fontSize: '0.75rem', border: '1px solid #fed7aa' }}
                            />
                          )
                        )}

                        {/* 6. COMPLETED State */}
                        {ord.status === 'COMPLETED' && (
                          <Chip
                            icon={<CheckCircleIcon sx={{ '&&': { color: '#047857' } }} />}
                            label="Project Completed & Released"
                            sx={{
                              bgcolor: '#ecfdf5',
                              color: '#047857',
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              border: '1px solid #a7f3d0'
                            }}
                          />
                        )}
                      </Stack>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Paper>

        {/* All Marketplace Tasks & Bidding Pipeline (Platform Oversight for Admin - First Layout) */}
        {isAdmin && (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '20px',
              border: '1px solid rgba(8,145,178,0.2)',
              bgcolor: '#ffffff',
              mb: 4,
              boxShadow: '0 8px 30px rgba(8,145,178,0.05)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(8,145,178,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TaskIcon sx={{ color: '#0891b2', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
                    All Marketplace Tasks & Bidding Pipeline (Platform Oversight)
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                    Review customer briefs, assign vetted specialists, manage attached assets, and chat with clients
                  </Typography>
                </Box>
              </Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Chip
                  label={`${allMarketplaceTasks.length} Tasks`}
                  sx={{
                    bgcolor: 'rgba(8,145,178,0.08)',
                    color: '#0891b2',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                  }}
                />
                <Button
                  component={Link}
                  to="/add_task"
                  variant="contained"
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #0891b2, #4f46e5)',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(8,145,178,0.25)',
                  }}
                >
                  + Post New Task
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ my: 2.5 }} />

            {allMarketplaceTasks.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                  No custom marketplace tasks posted on the platform yet.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2.5}>
                {allMarketplaceTasks.map(task => {
                  const isDone = task.status === 'completed';
                  const isAssigned = !!task.assigned_expert_email || task.status === 'in-progress' || task.status === 'in_progress';
                  const stepIndex = isDone ? 3 : isAssigned ? 2 : (task.total_bids || 0) > 0 ? 1 : 0;

                  return (
                    <Paper
                      key={task.id}
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: '16px',
                        border: '1px solid rgba(8,145,178,0.18)',
                        bgcolor: '#ffffff',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#0891b2',
                          boxShadow: '0 4px 20px rgba(8,145,178,0.08)'
                        }
                      }}
                    >
                      {/* Top Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                            <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                              {task.title}
                            </Typography>
                            <Chip
                              label={task.category || 'General'}
                              size="small"
                              sx={{ bgcolor: 'rgba(79,70,229,0.08)', color: '#4f46e5', fontWeight: 700, fontSize: '0.72rem' }}
                            />
                          </Box>
                          <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mt: 0.5 }}>
                            Task: <strong>#{String(task.id).replace('task-', '').slice(-6)}</strong> • Customer: <strong>{task.user_name || 'Client'}</strong> ({task.user_email || 'client@aitag.com'})
                            {task.deadline && ` • Deadline: ${new Date(task.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`}
                          </Typography>
                        </Box>

                        <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                          <Typography sx={{ fontWeight: 900, fontSize: '1.3rem', color: '#0f172a', lineHeight: 1.1 }}>
                            ₹{Number(task.budget || 0).toLocaleString()}
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            {isDone ? (
                              <Chip
                                label="COMPLETED"
                                size="small"
                                sx={{ bgcolor: '#ecfdf5', color: '#047857', fontWeight: 800, fontSize: '0.72rem', border: '1px solid #a7f3d0' }}
                              />
                            ) : isAssigned ? (
                              <Chip
                                label="IN PROGRESS"
                                size="small"
                                sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 800, fontSize: '0.72rem', border: '1px solid #bfdbfe' }}
                              />
                            ) : (
                              <Chip
                                label="OPEN FOR BIDS"
                                size="small"
                                sx={{ bgcolor: '#f0fdf4', color: '#15803d', fontWeight: 800, fontSize: '0.72rem', border: '1px solid #bbf7d0' }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>

                      {/* 4-Step Pipeline Indicator */}
                      <Box sx={{ display: 'flex', gap: 1.5, my: 2, flexWrap: 'wrap' }}>
                        {TASK_STEPS.map((step, sIdx) => {
                          const isCurrent = sIdx === stepIndex;
                          const isDoneStep = sIdx < stepIndex;
                          return (
                            <Chip
                              key={step.key}
                              label={step.label}
                              size="small"
                              sx={{
                                fontWeight: isCurrent ? 800 : 600,
                                fontSize: '0.72rem',
                                bgcolor: isCurrent ? '#0891b2' : isDoneStep ? '#ecfdf5' : '#f8fafc',
                                color: isCurrent ? '#ffffff' : isDoneStep ? '#047857' : '#94a3b8',
                                border: isCurrent ? 'none' : isDoneStep ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                              }}
                            />
                          );
                        })}
                      </Box>

                      {/* Brief Notes Box */}
                      <Box sx={{ p: 1.8, bgcolor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', mb: 2 }}>
                        <Typography sx={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.5 }}>
                          <strong>Brief Notes:</strong> "{task.description || 'No additional brief notes provided.'}"
                        </Typography>
                      </Box>

                      {/* Assigned Specialist Banner (if assigned) */}
                      {task.assigned_expert_email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: 'rgba(79,70,229,0.04)', borderRadius: '10px', border: '1px solid rgba(79,70,229,0.15)', mb: 2 }}>
                          <AnimatedAvatar name={task.assigned_expert_name || task.assigned_expert_email} size={30} />
                          <Box>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                              Matched Specialist: <strong>{task.assigned_expert_name || 'Vetted AI Specialist'}</strong> ({task.assigned_expert_email})
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: '#6366f1' }}>
                              Assigned via Platform Oversight • Active in task workspace
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* Action Footer */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, pt: 1, borderTop: '1px solid #f1f5f9' }}>
                        <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {task.created_at ? `Requested on ${new Date(task.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Recent Task'} • <strong>{task.total_bids || 0} Proposals</strong>
                        </Typography>

                        <Stack direction="row" spacing={1.2} alignItems="center" flexWrap="wrap">
                          {/* Assign / Reassign Actions */}
                          {!isAssigned ? (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<PersonAddIcon />}
                              disabled={actionLoading === `assign-task-${task.id}`}
                              onClick={() => openTaskAssignModal(task)}
                              sx={{
                                bgcolor: '#0891b2',
                                '&:hover': { bgcolor: '#0e7490' },
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: '8px',
                                px: 2,
                                boxShadow: '0 2px 8px rgba(8,145,178,0.25)'
                              }}
                            >
                              {actionLoading === `assign-task-${task.id}` ? 'Assigning...' : 'Assign Vetted Expert'}
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => openTaskAssignModal(task)}
                                sx={{ textTransform: 'none', borderRadius: '8px', fontSize: '0.75rem', color: '#0891b2', borderColor: 'rgba(8,145,178,0.4)' }}
                              >
                                Change Expert
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                disabled={actionLoading === `reset-task-${task.id}`}
                                onClick={() => handleResetTaskAssignment(task)}
                                sx={{
                                  textTransform: 'none',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  borderColor: '#fca5a5',
                                  color: '#dc2626',
                                  '&:hover': { bgcolor: '#fef2f2', borderColor: '#ef4444' }
                                }}
                              >
                                {actionLoading === `reset-task-${task.id}` ? 'Resetting...' : 'Reset Assignment'}
                              </Button>
                            </>
                          )}

                          {/* Chat Client */}
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ForumIcon />}
                            onClick={() => openTaskDiscussionModal(task)}
                            sx={{
                              borderColor: '#c7d2fe',
                              color: '#4338ca',
                              fontWeight: 700,
                              textTransform: 'none',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              '&:hover': { bgcolor: '#f5f3ff', borderColor: '#818cf8' }
                            }}
                          >
                            Case Discussion
                          </Button>

                          {/* Assets */}
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AttachFileIcon sx={{ fontSize: 15 }} />}
                            onClick={() => openAssetsModal(task)}
                            sx={{
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textTransform: 'none',
                              borderColor: 'rgba(79, 70, 229, 0.3)',
                              color: '#4f46e5',
                              bgcolor: 'rgba(79, 70, 229, 0.04)',
                              '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.1)' }
                            }}
                          >
                            Assets ({(task.attachments || []).length})
                          </Button>

                          {/* Details & Proposals */}
                          <Button
                            component={Link}
                            to={`/task-details/${task.id}`}
                            variant="text"
                            size="small"
                            startIcon={<VisibilityIcon sx={{ fontSize: 15 }} />}
                            sx={{
                              color: '#4f46e5',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              textTransform: 'none'
                            }}
                          >
                            Details
                          </Button>
                        </Stack>
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Paper>
        )}

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

        {/* --- MODAL DIALOGS --- */}

        {/* 1. Assign Expert Modal (Dual-mode: Pilot Orders & Marketplace Tasks) */}
        <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
            {assignTargetType === 'task' ? 'Assign Vetted AI Specialist to Task' : 'Assign Vetted AI Specialist'}
          </DialogTitle>
          <DialogContent dividers>
            <Typography sx={{ color: '#64748b', fontSize: '0.875rem', mb: 2.5 }}>
              {assignTargetType === 'task' ? (
                <>Matching Task <strong>#{String(activeAssignTask?.id || '').replace('task-', '').slice(-6)}</strong> ({activeAssignTask?.title}). Select one of our vetted AI specialists or input a custom expert to start fulfillment immediately.</>
              ) : (
                <>Matching order <strong>{activeOrder?.order_number}</strong> ({activeOrder?.package_title}). Select one of our vetted AI specialists or input a custom expert.</>
              )}
            </Typography>

            <FormControl fullWidth sx={{ mb: 2.5 }}>
              <InputLabel id="specialist-select-label">Select Vetted Specialist</InputLabel>
              <Select
                labelId="specialist-select-label"
                value={selectedExpertPreset}
                label="Select Vetted Specialist"
                onChange={(e) => setSelectedExpertPreset(e.target.value)}
              >
                {VETTED_SPECIALISTS.map(spec => (
                  <MenuItem key={spec.email} value={spec.email}>
                    <strong>{spec.name}</strong> &nbsp;—&nbsp; {spec.role} ({spec.email})
                  </MenuItem>
                ))}
                <MenuItem value="CUSTOM">
                  <em>+ Enter Custom Specialist</em>
                </MenuItem>
              </Select>
            </FormControl>

            {selectedExpertPreset === 'CUSTOM' && (
              <Stack spacing={2} sx={{ mb: 1 }}>
                <TextField
                  label="Specialist Full Name"
                  fullWidth
                  size="small"
                  value={customExpertName}
                  onChange={(e) => setCustomExpertName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                />
                <TextField
                  label="Specialist Email"
                  type="email"
                  fullWidth
                  size="small"
                  value={customExpertEmail}
                  onChange={(e) => setCustomExpertEmail(e.target.value)}
                  placeholder="rahul@example.com"
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setAssignDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmAssign}
              disabled={actionLoading?.startsWith('assign-')}
              sx={{ bgcolor: '#4f46e5', textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
            >
              {actionLoading?.startsWith('assign-') ? 'Assigning...' : 'Confirm Assignment'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 2. Submit Draft Modal */}
        <Dialog open={draftDialogOpen} onClose={() => setDraftDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
            Submit Draft Deliverables
          </DialogTitle>
          <DialogContent dividers>
            <Typography sx={{ color: '#64748b', fontSize: '0.875rem', mb: 2 }}>
              Upload or link deliverable files for Order <strong>{activeOrder?.order_number}</strong>.
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Deliverable Title / Label"
                fullWidth
                size="small"
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                placeholder="e.g. 5 AI Product Photos (Clean Cutout & Studio Lighting)"
              />
              <TextField
                label="Deliverable File / Cloud Link (Google Drive, Dropbox, CDN)"
                fullWidth
                size="small"
                required
                value={draftUrl}
                onChange={(e) => setDraftUrl(e.target.value)}
                placeholder="https://drive.google.com/... or https://cdn.aitag.com/..."
              />
              <TextField
                label="Notes / Deliverable Description"
                fullWidth
                multiline
                rows={3}
                size="small"
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                placeholder="Highlights of the changes and how to review the deliverables..."
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDraftDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmDraft}
              disabled={actionLoading?.startsWith('draft-')}
              sx={{ bgcolor: '#4f46e5', textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
            >
              {actionLoading?.startsWith('draft-') ? 'Submitting...' : 'Submit Draft for Review'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 3. Request Revision Modal */}
        <Dialog open={revisionDialogOpen} onClose={() => setRevisionDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
            Request Revision
          </DialogTitle>
          <DialogContent dividers>
            <Typography sx={{ color: '#64748b', fontSize: '0.875rem', mb: 2 }}>
              Specify the changes needed for Order <strong>{activeOrder?.order_number}</strong>.
            </Typography>
            <TextField
              label="Revision Feedback Notes"
              fullWidth
              multiline
              rows={4}
              required
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="e.g. Please enhance the contrast on the first product angle and adjust the headline phrasing..."
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setRevisionDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={handleConfirmRevision}
              disabled={actionLoading?.startsWith('revision-')}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
            >
              {actionLoading?.startsWith('revision-') ? 'Sending...' : 'Send Revision Request'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 4. Approve & Complete Modal */}
        <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
            Approve & Complete Project
          </DialogTitle>
          <DialogContent dividers>
            <Typography sx={{ color: '#64748b', fontSize: '0.875rem', mb: 2.5 }}>
              Confirm satisfaction and complete Order <strong>{activeOrder?.order_number}</strong>.
              Funds will be released from escrow to the specialist.
            </Typography>

            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
                Overall Satisfaction Rating:
              </Typography>
              <Rating
                value={ratingVal}
                onChange={(_, newVal) => setRatingVal(newVal)}
                size="large"
              />
            </Box>

            <Stack spacing={2}>
              <TextField
                label="Customer Testimonial & Review"
                fullWidth
                multiline
                rows={3}
                value={testimonial}
                onChange={(e) => setTestimonial(e.target.value)}
                placeholder="Share your experience working with the specialist..."
              />
              <TextField
                label="Final Approved Assets URL (Optional)"
                fullWidth
                size="small"
                value={finalFileUrl}
                onChange={(e) => setFinalFileUrl(e.target.value)}
                placeholder="https://drive.google.com/final_assets.zip"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setApproveDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleConfirmApprove}
              disabled={actionLoading?.startsWith('approve-')}
              sx={{
                background: 'linear-gradient(135deg, #059669, #10b981)',
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '8px'
              }}
            >
              {actionLoading?.startsWith('approve-') ? 'Completing...' : 'Approve & Release Funds'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 5. Persistent Case Discussion Modal (Orders & Tasks) */}
        {discussionModalOpen && (
          <CaseDiscussionModal
            open={discussionModalOpen}
            onClose={() => {
              setDiscussionModalOpen(false);
              setActiveDiscussionOrder(null);
              setActiveDiscussionTask(null);
            }}
            order={activeDiscussionOrder}
            task={activeDiscussionTask}
            currentUser={user}
          />
        )}

        {/* 6. Task Assets Modal for Platform Oversight */}
        {activeAssetTask && (
          <TaskAssetsModal
            open={assetsModalOpen}
            onClose={() => {
              setAssetsModalOpen(false);
              setActiveAssetTask(null);
            }}
            task={activeAssetTask}
            onTaskUpdated={handleTaskUpdated}
            isOwner={true}
          />
        )}
      </Container>
    </DashboardLayout>
  );
};

export default Dashboard;
