import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, Chip, Button, CircularProgress, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Navbar from '../components/Navbar';
import { tasksApi } from '../api';

const MyPostedTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ pt: 12, pb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'Inter, sans-serif', letterSpacing: '-1px' }}>My Posted Tasks</Typography>
            <Typography sx={{ color: '#64748b', mt: 0.5 }}>Manage and track your posted AI tasks</Typography>
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
                  {['Task Title', 'Category', 'Deadline', 'Budget', 'Bids', 'Status', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem', py: 2 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map(task => (
                  <TableRow key={task.id} sx={{ '&:hover': { bgcolor: 'rgba(79,70,229,0.02)' } }}>
                    <TableCell sx={{ fontWeight: 600, color: '#0f172a', maxWidth: 200 }}>{task.title}</TableCell>
                    <TableCell><Chip label={task.category} size="small" sx={{ bgcolor: 'rgba(79,70,229,0.08)', color: '#4f46e5', fontWeight: 600, fontSize: '0.72rem' }} /></TableCell>
                    <TableCell sx={{ color: '#64748b', fontSize: '0.85rem' }}>{new Date(task.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#10b981' }}>${task.budget}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#0891b2' }}>{task.total_bids || 0}</TableCell>
                    <TableCell>
                      <Chip label={task.status || 'open'} size="small"
                        sx={{ bgcolor: task.status === 'completed' ? 'rgba(16,185,129,0.1)' : task.status === 'in-progress' ? 'rgba(79,70,229,0.1)' : 'rgba(100,116,139,0.1)', color: task.status === 'completed' ? '#10b981' : task.status === 'in-progress' ? '#4f46e5' : '#64748b', fontWeight: 600, textTransform: 'capitalize' }} />
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
      </Container>
    </Box>
  );
};

export default MyPostedTasks;
