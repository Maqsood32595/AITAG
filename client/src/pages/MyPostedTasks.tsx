import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Container, Typography, Table, TableBody, TableCell, TableHead,
  TableRow, Paper, Chip, Button, CircularProgress, IconButton, Tooltip, Stack,
  Tabs, Tab
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ForumIcon from '@mui/icons-material/Forum';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentIcon from '@mui/icons-material/Payment';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { tasksApi, serviceOrdersApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { TaskAssetsModal } from '../components/TaskAssetsModal';
import { CaseDiscussionModal } from '../components/CaseDiscussionModal';

const MyPostedTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [packageOrders, setPackageOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'packages' | 'tasks'>('packages');

  // Modals state
  const [activeAssetTask, setActiveAssetTask] = useState<any | null>(null);
  const [assetsModalOpen, setAssetsModalOpen] = useState(false);
  const [activeDiscussionTask, setActiveDiscussionTask] = useState<any | null>(null);
  const [discussionModalOpen, setDiscussionModalOpen] = useState(false);

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
      <Container maxWidth="xl" sx={{ pb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'Inter, sans-serif', letterSpacing: '-1px' }}>
              My Orders & Tasks
            </Typography>
            <Typography sx={{ color: '#64748b', mt: 0.5, fontSize: '0.95rem' }}>
              Track your purchased AI service packages, custom posted tasks, and deliverables
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button component={Link} to="/#packages" variant="outlined"
              sx={{ borderColor: 'rgba(79,70,229,0.3)', color: '#4f46e5', fontWeight: 700, borderRadius: '10px' }}>
              Explore Packages
            </Button>
            <Button component={Link} to="/add_task" variant="contained"
              sx={{ background: 'linear-gradient(135deg, #4f46e5, #0891b2)', fontWeight: 700, borderRadius: '10px', boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}>
              + Post Custom Task
            </Button>
          </Box>
        </Box>

        {/* Tab Selection: Packages vs Custom Tasks */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
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
          <Box display="flex" justifyContent="center" py={8}><CircularProgress sx={{ color: '#4f46e5' }} /></Box>
        ) : activeTab === 'packages' ? (
          /* Package Orders View */
          <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid rgba(79,70,229,0.1)', overflow: 'hidden' }}>
            {packageOrders.length > 0 ? (
              <Table>
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

                    return (
                      <TableRow key={ord.id} sx={{ '&:hover': { bgcolor: 'rgba(79,70,229,0.02)' } }}>
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
                          ₹{Number(ord.agreed_price || 0).toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              isCompleted ? '✓ Completed' :
                              isDraft ? 'Review Draft' :
                              isActive ? '● In Progress' :
                              isRequested ? 'Payment Needed' : ord.status
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
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {isRequested ? (
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
                                component={Link}
                                to="/dashboard#orders-section"
                                variant="outlined"
                                size="small"
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
            ) : (
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
            )}
          </Paper>
        ) : (
          /* Custom Tasks View */
          <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid rgba(79,70,229,0.08)', overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  {['Task Title', 'Category', 'Deadline', 'Budget', 'Bids', 'Status', 'Assets & Chat', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem', py: 2 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map(task => (
                  <TableRow key={task.id} sx={{ '&:hover': { bgcolor: 'rgba(79,70,229,0.02)' } }}>
                    <TableCell sx={{ fontWeight: 600, color: '#0f172a', maxWidth: 220 }}>{task.title}</TableCell>
                    <TableCell><Chip label={task.category} size="small" sx={{ bgcolor: 'rgba(79,70,229,0.08)', color: '#4f46e5', fontWeight: 600, fontSize: '0.72rem' }} /></TableCell>
                    <TableCell sx={{ color: '#64748b', fontSize: '0.85rem' }}>{new Date(task.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#10b981' }}>₹{Number(task.budget).toLocaleString()}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
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
                    <TableCell>
                      <Stack direction="row" spacing={1}>
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
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View"><IconButton size="small" component={Link} to={`/task-details/${task.id}`} sx={{ color: '#4f46e5' }}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Edit"><IconButton size="small" component={Link} to={`/update-task/${task.id}`} sx={{ color: '#0891b2' }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(task.id)} sx={{ color: '#ef4444' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {tasks.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography sx={{ color: '#94a3b8' }}>No custom tasks posted yet.</Typography>
                <Button component={Link} to="/add_task" variant="outlined" sx={{ mt: 2, borderRadius: '10px', color: '#4f46e5', borderColor: '#4f46e5' }}>Post your first task</Button>
              </Box>
            )}
          </Paper>
        )}

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
