import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Container, Typography, Table, TableBody, TableCell, TableHead,
  TableRow, Paper, Chip, Button, CircularProgress, IconButton, Tooltip, Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ForumIcon from '@mui/icons-material/Forum';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { tasksApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { TaskAssetsModal } from '../components/TaskAssetsModal';
import { CaseDiscussionModal } from '../components/CaseDiscussionModal';

const MyPostedTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [activeAssetTask, setActiveAssetTask] = useState<any | null>(null);
  const [assetsModalOpen, setAssetsModalOpen] = useState(false);
  const [activeDiscussionTask, setActiveDiscussionTask] = useState<any | null>(null);
  const [discussionModalOpen, setDiscussionModalOpen] = useState(false);

  useEffect(() => {
    tasksApi.getMy().then(res => setTasks(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'Inter, sans-serif', letterSpacing: '-1px' }}>My Posted Tasks</Typography>
            <Typography sx={{ color: '#64748b', mt: 0.5 }}>Manage, track, upload assets, and communicate with admin on your tasks</Typography>
          </Box>
          <Button component={Link} to="/add_task" variant="contained"
            sx={{ background: 'linear-gradient(135deg, #4f46e5, #0891b2)', fontWeight: 700, borderRadius: '10px', boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}>
            + Post New Task
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}><CircularProgress sx={{ color: '#4f46e5' }} /></Box>
        ) : (
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
                <Typography sx={{ color: '#94a3b8' }}>No tasks posted yet.</Typography>
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
