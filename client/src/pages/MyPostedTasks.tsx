import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Button, CircularProgress, IconButton, Tooltip, Stack,
  Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Divider, useTheme, useMediaQuery
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ForumIcon from '@mui/icons-material/Forum';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentIcon from '@mui/icons-material/Payment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { tasksApi, serviceOrdersApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { TaskAssetsModal } from '../components/TaskAssetsModal';
import { CaseDiscussionModal } from '../components/CaseDiscussionModal';
import { DeliverablePreview } from '../components/DeliverablePreview';

const MyPostedTasks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tasks, setTasks] = useState<any[]>([]);
  const [packageOrders, setPackageOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'packages' | 'tasks'>('packages');

  // Modals state
  const [activeAssetTask, setActiveAssetTask] = useState<any | null>(null);
  const [assetsModalOpen, setAssetsModalOpen] = useState(false);
  const [activeDiscussionTask, setActiveDiscussionTask] = useState<any | null>(null);
  const [discussionModalOpen, setDiscussionModalOpen] = useState(false);
  const [activeOrderDetail, setActiveOrderDetail] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    const ordersPromise = user?.role === 'admin'
      ? serviceOrdersApi.getAll()
      : serviceOrdersApi.getAll({ role: user?.role || 'client', email: user?.email });

    Promise.all([
      tasksApi.getMy().then(res => setTasks(res.data || [])).catch(() => setTasks([])),
      ordersPromise.then(res => {
        const list = res.data?.orders || [];
        setPackageOrders(list);
        if (list.length > 0) {
          setActiveTab('packages');
        } else {
          setActiveTab('tasks');
        }
      }).catch(() => setPackageOrders([]))
    ]).finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksApi.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  const handleOpenAssets = (task: any) => {
    setActiveAssetTask(task);
    setAssetsModalOpen(true);
  };

  const handleOpenDiscussion = (task: any) => {
    setActiveDiscussionTask(task);
    setDiscussionModalOpen(true);
  };

  const handleTaskUpdated = (updatedTask: any) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t));
    setActiveAssetTask(updatedTask);
  };

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ pb: 6, px: { xs: 0.5, sm: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.5px', fontSize: { xs: '1.35rem', sm: '1.75rem' } }}>
              My Orders & Tasks
            </Typography>
            <Typography sx={{ color: '#64748b', mt: 0.5, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
              Track your purchased AI service packages, custom posted tasks, and deliverables
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
            <Button component={Link} to="/#packages" variant="outlined"
              sx={{ flexGrow: { xs: 1, sm: 0 }, borderColor: 'rgba(79,70,229,0.3)', color: '#4f46e5', fontWeight: 700, borderRadius: '10px', textTransform: 'none' }}>
              Explore Packages
            </Button>
            <Button component={Link} to="/add_task" variant="contained"
              sx={{ flexGrow: { xs: 1, sm: 0 }, background: 'linear-gradient(135deg, #4f46e5, #0891b2)', fontWeight: 700, borderRadius: '10px', textTransform: 'none', boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}>
              + Post Custom Task
            </Button>
          </Box>
        </Box>

        {/* Tab Selection: Packages vs Custom Tasks */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '0.92rem',
                textTransform: 'none',
                minHeight: 48,
              },
              '& .Mui-selected': {
                color: '#4f46e5 !important',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#4f46e5',
                height: 3,
                borderRadius: '3px 3px 0 0',
              }
            }}
          >
            <Tab
              value="packages"
              icon={<ShoppingBagIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label={`AI Service Packages (${packageOrders.length})`}
            />
            <Tab
              value="tasks"
              icon={<AssignmentIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label={`Custom Posted Tasks (${tasks.length})`}
            />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#4f46e5' }} /></Box>
        ) : activeTab === 'packages' ? (
          /* Package Orders View */
          packageOrders.length > 0 ? (
            isMobile ? (
              <Stack spacing={2}>
                {packageOrders.map(ord => {
                  const isCompleted = ord.status === 'COMPLETED';
                  const isDraft = ord.status === 'DRAFT_SUBMITTED';
                  const isActive = ord.status === 'ACTIVE' || ord.status === 'PAID';
                  const isRequested = ord.status === 'REQUESTED';
                  const isWaived = Boolean(ord.payment_waived);
                  const displayPrice = isWaived ? 0 : Number(ord.agreed_price || 0);

                  return (
                    <Paper
                      key={ord.id}
                      elevation={0}
                      onClick={() => setActiveOrderDetail(ord)}
                      sx={{
                        p: 2,
                        borderRadius: '14px',
                        border: '1px solid rgba(79,70,229,0.16)',
                        bgcolor: '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': { borderColor: '#4f46e5', boxShadow: '0 6px 20px rgba(79,70,229,0.08)' },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#4f46e5', fontSize: '0.76rem' }}>
                            {ord.order_number || ord.id.slice(0, 8)}
                          </Typography>
                          <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', lineHeight: 1.3 }}>
                            {ord.package_title || 'AI Service Package'}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                          <Typography sx={{ fontWeight: 900, color: isWaived ? '#059669' : '#10b981', fontSize: '1.05rem' }}>
                            ₹{displayPrice.toLocaleString('en-IN')}
                          </Typography>
                          {isWaived && (
                            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#059669' }}>
                              PAYMENT WAIVED
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, alignItems: 'center', mb: 1.2 }}>
                        <Chip
                          label={(ord.tier_name || 'starter').toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: ord.tier_name === 'pro' ? 'rgba(124,58,237,0.1)' : 'rgba(79,70,229,0.08)',
                            color: ord.tier_name === 'pro' ? '#7c3aed' : '#4f46e5',
                            fontWeight: 700,
                            fontSize: '0.7rem'
                          }}
                        />
                        <Chip
                          label={
                            isCompleted ? '✓ Completed' :
                            isDraft ? 'Review Draft' :
                            isActive ? '● In Progress' :
                            isRequested && !isWaived ? 'Payment Needed' : ord.status
                          }
                          size="small"
                          sx={{
                            bgcolor: isCompleted ? 'rgba(16,185,129,0.12)' :
                                     isDraft ? 'rgba(124,58,237,0.12)' :
                                     isActive ? 'rgba(79,70,229,0.12)' : 'rgba(234,179,8,0.15)',
                            color: isCompleted ? '#059669' :
                                   isDraft ? '#7c3aed' :
                                   isActive ? '#4338ca' : '#b45309',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                          }}
                        />
                        <Typography sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                          {ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent'}
                        </Typography>
                      </Box>

                      {ord.brief_notes && (
                        <Typography sx={{ color: '#475569', fontSize: '0.82rem', bgcolor: '#f8fafc', p: 1.2, borderRadius: '8px', border: '1px solid #e2e8f0', mb: 1.4, overflowWrap: 'anywhere' }}>
                          "{ord.brief_notes}"
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 1.2, borderTop: '1px solid #f1f5f9' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon sx={{ fontSize: 15 }} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveOrderDetail(ord);
                          }}
                          sx={{ flexGrow: 1, borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'none', color: '#4f46e5', borderColor: 'rgba(79,70,229,0.35)' }}
                        >
                          View Details
                        </Button>
                        {isRequested && !isWaived && (
                          <Button
                            component={Link}
                            to={`/checkout?order=${ord.id}`}
                            variant="contained"
                            size="small"
                            startIcon={<PaymentIcon sx={{ fontSize: 15 }} />}
                            onClick={(e) => e.stopPropagation()}
                            sx={{ flexGrow: 1, bgcolor: '#10b981', fontSize: '0.75rem', fontWeight: 700, borderRadius: '8px', textTransform: 'none', '&:hover': { bgcolor: '#059669' } }}
                          >
                            Pay / Submit UTR
                          </Button>
                        )}
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>
            ) : (
              <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid rgba(79,70,229,0.1)', overflow: 'hidden' }}>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 680 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      {['Order ID', 'Service Package', 'Tier', 'Price', 'Status', 'Ordered On', 'Actions'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem', py: 2 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {packageOrders.map(ord => {
                      const isCompleted = ord.status === 'COMPLETED';
                      const isDraft = ord.status === 'DRAFT_SUBMITTED';
                      const isActive = ord.status === 'ACTIVE' || ord.status === 'PAID';
                      const isRequested = ord.status === 'REQUESTED';
                      const isWaived = Boolean(ord.payment_waived);

                      return (
                        <TableRow
                          key={ord.id}
                          onClick={() => setActiveOrderDetail(ord)}
                          sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(79,70,229,0.03)' } }}
                        >
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#4f46e5', fontSize: '0.85rem' }}>
                            {ord.order_number || ord.id.slice(0, 8)}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#0f172a', maxWidth: 260 }}>
                            {ord.package_title || 'AI Service Package'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={(ord.tier_name || 'starter').toUpperCase()}
                              size="small"
                              sx={{
                                bgcolor: ord.tier_name === 'pro' ? 'rgba(124,58,237,0.1)' : 'rgba(79,70,229,0.08)',
                                color: ord.tier_name === 'pro' ? '#7c3aed' : '#4f46e5',
                                fontWeight: 700,
                                fontSize: '0.72rem'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#10b981', fontSize: '0.95rem' }}>
                            ₹{(isWaived ? 0 : Number(ord.agreed_price || 0)).toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                isCompleted ? '✓ Completed' :
                                isDraft ? 'Review Draft' :
                                isActive ? '● In Progress' :
                                isRequested && !isWaived ? 'Payment Needed' : ord.status
                              }
                              size="small"
                              sx={{
                                bgcolor: isCompleted ? 'rgba(16,185,129,0.12)' :
                                         isDraft ? 'rgba(124,58,237,0.12)' :
                                         isActive ? 'rgba(79,70,229,0.12)' : 'rgba(234,179,8,0.15)',
                                color: isCompleted ? '#059669' :
                                       isDraft ? '#7c3aed' :
                                       isActive ? '#4338ca' : '#b45309',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                border: '1px solid',
                                borderColor: isCompleted ? 'rgba(16,185,129,0.2)' :
                                             isDraft ? 'rgba(124,58,237,0.2)' :
                                             isActive ? 'rgba(79,70,229,0.2)' : 'rgba(234,179,8,0.3)',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                            {ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent'}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {isRequested && !isWaived ? (
                                <Button
                                  component={Link}
                                  to={`/checkout?order=${ord.id}`}
                                  variant="contained"
                                  size="small"
                                  startIcon={<PaymentIcon sx={{ fontSize: 16 }} />}
                                  sx={{
                                    bgcolor: '#10b981',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: '#059669' }
                                  }}
                                >
                                  Pay / Submit UTR
                                </Button>
                              ) : (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => setActiveOrderDetail(ord)}
                                  sx={{
                                    borderColor: 'rgba(79,70,229,0.3)',
                                    color: '#4f46e5',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: 'rgba(79,70,229,0.06)' }
                                  }}
                                >
                                  View Order Details
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                </TableContainer>
              </Paper>
            )
          ) : (
            <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid rgba(79,70,229,0.1)', overflow: 'hidden' }}>
              <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
                <ShoppingBagIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1.5 }} />
                <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700 }}>No service package orders yet</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.9rem', maxWidth: 440, mx: 'auto', mt: 0.5, mb: 3 }}>
                  Browse our curated AI packages starting at just ₹499. Outcome delivered in 2–6 days with 100% payment safety.
                </Typography>
                <Button component={Link} to="/#packages" variant="contained"
                  sx={{ background: 'linear-gradient(135deg, #4f46e5, #0891b2)', fontWeight: 700, borderRadius: '10px' }}>
                  Explore AI Packages
                </Button>
              </Box>
            </Paper>
          )
        ) : (
          /* Custom Tasks View */
          tasks.length === 0 ? (
            <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid rgba(79,70,229,0.08)', overflow: 'hidden' }}>
              <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
                <Typography sx={{ color: '#94a3b8' }}>No custom tasks posted yet.</Typography>
                <Button component={Link} to="/add_task" variant="outlined" sx={{ mt: 2, borderRadius: '10px', color: '#4f46e5', borderColor: '#4f46e5' }}>Post your first task</Button>
              </Box>
            </Paper>
          ) : isMobile ? (
            /* Mobile-First Clickable Cards (All Task Info & Actions Visible Without Horizontal Overflow) */
            <Stack spacing={2}>
              {tasks.map(task => {
                const isWaived = Boolean(task.payment_waived);
                const budgetVal = isWaived ? 0 : Number(task.agreed_price ?? task.budget ?? 0);
                const statusLabel = (task.status || 'open').replace(/[_-]/g, ' ');
                const assetCount = (task.attachments || []).length;

                return (
                  <Paper
                    key={task.id}
                    elevation={0}
                    onClick={() => navigate(`/task-details/${task.id}`)}
                    sx={{
                      p: 2,
                      borderRadius: '14px',
                      border: '1px solid rgba(79,70,229,0.16)',
                      bgcolor: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': { borderColor: '#4f46e5', boxShadow: '0 6px 20px rgba(79,70,229,0.08)' },
                    }}
                  >
                    {/* Header: Title, Category, Status & Budget */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.02rem', lineHeight: 1.3, overflowWrap: 'anywhere' }}>
                          {task.title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.74rem', color: '#64748b', mt: 0.3 }}>
                          Task <strong>#{String(task.id).replace('task-', '').slice(-6)}</strong>
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography sx={{ fontWeight: 900, color: '#10b981', fontSize: '1.08rem', lineHeight: 1.1 }}>
                          ₹{budgetVal.toLocaleString('en-IN')}
                        </Typography>
                        {isWaived ? (
                          <Chip label="WAIVED" size="small" sx={{ mt: 0.4, height: 18, fontSize: '0.64rem', fontWeight: 800, bgcolor: '#ecfdf5', color: '#059669' }} />
                        ) : task.escrow_funded ? (
                          <Typography sx={{ fontSize: '0.66rem', fontWeight: 700, color: '#059669', mt: 0.2 }}>
                            ✓ Paid Safe
                          </Typography>
                        ) : null}
                      </Box>
                    </Box>

                    {/* Badges Row: Category, Status, Deadline, Bids */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, alignItems: 'center', mb: 1.2 }}>
                      <Chip
                        label={task.category}
                        size="small"
                        sx={{ bgcolor: 'rgba(79,70,229,0.08)', color: '#4f46e5', fontWeight: 700, fontSize: '0.72rem' }}
                      />
                      <Chip
                        label={statusLabel}
                        size="small"
                        sx={{
                          bgcolor: task.status === 'completed' ? 'rgba(16,185,129,0.12)' : task.status === 'in-progress' ? 'rgba(79,70,229,0.12)' : 'rgba(100,116,139,0.1)',
                          color: task.status === 'completed' ? '#047857' : task.status === 'in-progress' ? '#4f46e5' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          textTransform: 'capitalize'
                        }}
                      />
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>
                        <CalendarMonthIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                        {task.deadline ? new Date(task.deadline).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Flexible'}
                      </Box>
                      <Chip
                        label={`${task.total_bids || 0} ${(task.total_bids || 0) === 1 ? 'Bid' : 'Bids'}`}
                        size="small"
                        sx={{
                          bgcolor: (task.total_bids || 0) > 0 ? 'rgba(79,70,229,0.12)' : '#f8fafc',
                          color: (task.total_bids || 0) > 0 ? '#4f46e5' : '#64748b',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          border: '1px solid #e2e8f0'
                        }}
                      />
                    </Box>

                    {/* Description Preview */}
                    {task.description && (
                      <Typography sx={{ color: '#475569', fontSize: '0.82rem', bgcolor: '#f8fafc', p: 1.2, borderRadius: '8px', border: '1px solid #e2e8f0', mb: 1.2, overflowWrap: 'anywhere' }}>
                        {task.description}
                      </Typography>
                    )}

                    {/* Assigned Specialist Summary (if assigned) */}
                    {task.assigned_expert_email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.2, px: 1.2, py: 0.8, bgcolor: 'rgba(8,145,178,0.06)', borderRadius: '8px', border: '1px solid rgba(8,145,178,0.2)' }}>
                        <PersonIcon sx={{ fontSize: 16, color: '#0891b2' }} />
                        <Typography sx={{ fontSize: '0.76rem', color: '#0e7490', fontWeight: 700, overflowWrap: 'anywhere' }}>
                          Specialist: {task.assigned_expert_name || 'Verified AI Specialist'}
                        </Typography>
                      </Box>
                    )}

                    {/* Individual Action Buttons (All Visible & Wrapped cleanly) */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.9, pt: 1.2, borderTop: '1px solid #f1f5f9' }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<VisibilityIcon sx={{ fontSize: 15 }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/task-details/${task.id}`);
                        }}
                        sx={{
                          flexGrow: 1,
                          bgcolor: '#4f46e5',
                          '&:hover': { bgcolor: '#4338ca' },
                          borderRadius: '8px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Full Details
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AttachFileIcon sx={{ fontSize: 15 }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAssets(task);
                        }}
                        sx={{
                          flexGrow: 1,
                          borderRadius: '8px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                          borderColor: 'rgba(79, 70, 229, 0.35)',
                          color: '#4f46e5',
                          bgcolor: 'rgba(79, 70, 229, 0.04)',
                        }}
                      >
                        Assets ({assetCount})
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ForumIcon sx={{ fontSize: 15 }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDiscussion(task);
                        }}
                        sx={{
                          flexGrow: 1,
                          borderRadius: '8px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                          borderColor: 'rgba(8, 145, 178, 0.35)',
                          color: '#0891b2',
                          bgcolor: 'rgba(8, 145, 178, 0.04)',
                        }}
                      >
                        Chat Admin
                      </Button>
                      {!task.escrow_funded && !task.payment_waived && task.status !== 'completed' && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PaymentIcon sx={{ fontSize: 15 }} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tasks/${task.id}/pay`);
                          }}
                          sx={{
                            flexGrow: 1,
                            bgcolor: '#10b981',
                            '&:hover': { bgcolor: '#059669' },
                            borderRadius: '8px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Pay Escrow
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon sx={{ fontSize: 15 }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/update-task/${task.id}`);
                        }}
                        sx={{
                          flexGrow: 1,
                          borderRadius: '8px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                          borderColor: '#cbd5e1',
                          color: '#334155',
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon sx={{ fontSize: 15 }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(task.id);
                        }}
                        sx={{
                          flexGrow: 1,
                          borderRadius: '8px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                          borderColor: '#fca5a5',
                          color: '#dc2626',
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          ) : (
            <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid rgba(79,70,229,0.08)', overflow: 'hidden' }}>
              <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 720 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    {['Task Title', 'Category', 'Deadline', 'Budget', 'Bids', 'Status', 'Assets & Chat', 'Actions'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem', py: 2 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map(task => (
                    <TableRow
                      key={task.id}
                      onClick={() => navigate(`/task-details/${task.id}`)}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(79,70,229,0.03)' } }}
                    >
                      <TableCell sx={{ fontWeight: 700, color: '#4f46e5', maxWidth: 220 }}>{task.title}</TableCell>
                      <TableCell><Chip label={task.category} size="small" sx={{ bgcolor: 'rgba(79,70,229,0.08)', color: '#4f46e5', fontWeight: 600, fontSize: '0.72rem' }} /></TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.85rem' }}>{new Date(task.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#10b981' }}>₹{Number(task.payment_waived ? 0 : (task.agreed_price ?? task.budget ?? 0)).toLocaleString('en-IN')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} onClick={(e) => e.stopPropagation()}>
                        {(task.total_bids || 0) > 0 ? (
                          <Tooltip title="View proposals & hire specialist">
                            <Chip
                              component={Link}
                              to={`/task-details/${task.id}`}
                              label={`${task.total_bids} ${task.total_bids === 1 ? 'Bid' : 'Bids'} →`}
                              size="small"
                              clickable
                              sx={{
                                bgcolor: 'rgba(79, 70, 229, 0.12)',
                                color: '#4f46e5',
                                fontWeight: 800,
                                fontSize: '0.75rem',
                                border: '1px solid rgba(79, 70, 229, 0.3)',
                                cursor: 'pointer',
                                '&:hover': {
                                  bgcolor: '#4f46e5',
                                  color: '#ffffff',
                                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
                                }
                              }}
                            />
                          </Tooltip>
                        ) : (
                          <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>0</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label={task.status || 'open'} size="small"
                          sx={{ bgcolor: task.status === 'completed' ? 'rgba(16,185,129,0.1)' : task.status === 'in-progress' ? 'rgba(79,70,229,0.1)' : 'rgba(100,116,139,0.1)', color: task.status === 'completed' ? '#10b981' : task.status === 'in-progress' ? '#4f46e5' : '#64748b', fontWeight: 600, textTransform: 'capitalize' }} />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AttachFileIcon sx={{ fontSize: 14 }} />}
                            onClick={() => handleOpenAssets(task)}
                            sx={{
                              borderRadius: '8px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'none',
                              borderColor: 'rgba(79, 70, 229, 0.3)',
                              color: '#4f46e5',
                              bgcolor: 'rgba(79, 70, 229, 0.04)',
                              py: 0.3,
                              px: 1,
                              '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.1)' }
                            }}
                          >
                            Assets ({(task.attachments || []).length})
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ForumIcon sx={{ fontSize: 14 }} />}
                            onClick={() => handleOpenDiscussion(task)}
                            sx={{
                              borderRadius: '8px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'none',
                              borderColor: 'rgba(8, 145, 178, 0.3)',
                              color: '#0891b2',
                              bgcolor: 'rgba(8, 145, 178, 0.04)',
                              py: 0.3,
                              px: 1,
                              '&:hover': { bgcolor: 'rgba(8, 145, 178, 0.1)' }
                            }}
                          >
                            Chat Admin
                          </Button>
                        </Stack>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Details"><IconButton size="small" component={Link} to={`/task-details/${task.id}`} sx={{ color: '#4f46e5' }}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Edit"><IconButton size="small" component={Link} to={`/update-task/${task.id}`} sx={{ color: '#0891b2' }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(task.id)} sx={{ color: '#ef4444' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </TableContainer>
            </Paper>
          )
        )}

        {/* Service Order Full Details Modal */}
        <Dialog open={Boolean(activeOrderDetail)} onClose={() => setActiveOrderDetail(null)} fullScreen={isMobile} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
            {activeOrderDetail?.package_title || 'Service Order Details'}
          </DialogTitle>
          <DialogContent dividers>
            {activeOrderDetail && (
              <Stack spacing={2}>
                <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#4f46e5', fontSize: '0.82rem' }}>
                    {activeOrderDetail.order_number || activeOrderDetail.id}
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', mt: 0.3 }}>
                    ₹{Number(activeOrderDetail.payment_waived ? 0 : (activeOrderDetail.agreed_price || 0)).toLocaleString('en-IN')}
                    {activeOrderDetail.payment_waived && ' (Payment Waived)'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: '#475569', mt: 0.4 }}>
                    Status: <strong>{activeOrderDetail.status}</strong> • Tier: <strong>{(activeOrderDetail.tier_name || 'starter').toUpperCase()}</strong>
                  </Typography>
                  {activeOrderDetail.assigned_expert_email && (
                    <Typography sx={{ fontSize: '0.82rem', color: '#0369a1', mt: 0.5, fontWeight: 700, overflowWrap: 'anywhere' }}>
                      Assigned Expert: {activeOrderDetail.assigned_expert_name || 'Verified Specialist'} ({activeOrderDetail.assigned_expert_email})
                    </Typography>
                  )}
                </Box>

                {(activeOrderDetail.business_name || activeOrderDetail.brief_notes) && (
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', mb: 0.5 }}>
                      Order Brief
                    </Typography>
                    {activeOrderDetail.business_name && (
                      <Typography sx={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
                        Business: {activeOrderDetail.business_name} {activeOrderDetail.business_type ? `(${activeOrderDetail.business_type})` : ''}
                      </Typography>
                    )}
                    {activeOrderDetail.brief_notes && (
                      <Typography sx={{ fontSize: '0.82rem', color: '#475569', mt: 0.5, overflowWrap: 'anywhere' }}>
                        {activeOrderDetail.brief_notes}
                      </Typography>
                    )}
                  </Box>
                )}

                {Array.isArray(activeOrderDetail.draft_deliverables) && activeOrderDetail.draft_deliverables.length > 0 && (
                  <Box>
                    <Divider sx={{ mb: 1.5 }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#6d28d9', mb: 1 }}>
                      Deliverables ({activeOrderDetail.draft_deliverables.length})
                    </Typography>
                    <Stack spacing={1.5}>
                      {activeOrderDetail.draft_deliverables.map((d: any, idx: number) => d.url && (
                        <DeliverablePreview
                          key={idx}
                          url={d.url}
                          posterUrl={d.thumbnailUrl || d.posterUrl}
                          title={d.label || `Deliverable #${idx + 1}`}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, flexWrap: 'wrap', gap: 1 }}>
            {activeOrderDetail?.status === 'REQUESTED' && !activeOrderDetail?.payment_waived && (
              <Button
                component={Link}
                to={`/checkout?order=${activeOrderDetail.id}`}
                variant="contained"
                startIcon={<PaymentIcon />}
                sx={{ bgcolor: '#10b981', textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
              >
                Pay / Submit UTR
              </Button>
            )}
            <Button
              component={Link}
              to="/dashboard#orders-section"
              variant="outlined"
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
            >
              Manage in Dashboard
            </Button>
            <Button onClick={() => setActiveOrderDetail(null)} variant="contained" sx={{ bgcolor: '#4f46e5', textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Task Assets Modal */}
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

        {/* Task Discussion Channel Modal */}
        {activeDiscussionTask && (
          <CaseDiscussionModal
            open={discussionModalOpen}
            onClose={() => {
              setDiscussionModalOpen(false);
              setActiveDiscussionTask(null);
            }}
            task={activeDiscussionTask}
            currentUser={user}
          />
        )}
      </Container>
    </DashboardLayout>
  );
};

export default MyPostedTasks;
