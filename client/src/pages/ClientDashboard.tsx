import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid, Chip, InputAdornment } from '@mui/material';


export const ClientDashboard = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');

  const loadJobs = async () => {
    try {
      const res = await fetch('/api/marketplace/jobs');
      const data = await res.json();
      setJobs(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/marketplace/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, budget: Number(budget), clientName: 'Enterprise Client', description })
    });
    setTitle(''); setBudget(''); setDescription('');
    loadJobs();
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box className="fade-in-up">
          <Typography variant="h5" sx={{ mb: 1, color: 'text.primary' }}>Client Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Manage your job postings, proposals, and escrow payments.</Typography>
        </Box>
        <Button className="fade-in-up" variant="contained" color="primary" startIcon={<span style={{fontSize: '16px'}}>➕</span>} sx={{ px: 3 }}>Browse Talent</Button>
      </Box>

      <Grid container spacing={4}>
        <Grid xs={12} md={4}>
          <Paper className="fade-in-up stagger-1" sx={{ p: 3, borderRadius: '16px' }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>💼</span> Post a Job
            </Typography>
            <Box component="form" onSubmit={handlePost} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField label="Job Title" placeholder="e.g. Fullstack Developer Needed" size="small" value={title} onChange={e => setTitle(e.target.value)} required InputProps={{ sx: { borderRadius: '10px' } }} />
              <TextField label="Budget (Fixed Price)" placeholder="65000" type="number" size="small" value={budget} onChange={e => setBudget(e.target.value)} required InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment>, sx: { borderRadius: '10px' } }} />
              <TextField label="Job Description" placeholder="Describe the scope of work..." multiline rows={4} size="small" value={description} onChange={e => setDescription(e.target.value)} required InputProps={{ sx: { borderRadius: '10px' } }} />
              <Button type="submit" variant="contained" color="primary" sx={{ mt: 1, py: 1.2 }}>Publish Job</Button>
            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} md={8}>
          <Paper className="fade-in-up stagger-2" sx={{ p: 0, borderRadius: '16px', overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Your Active Postings</Typography>
              <TextField size="small" placeholder="Search postings..." InputProps={{ startAdornment: <span style={{marginRight: '8px', opacity: 0.5}}>🔍</span>, sx: { borderRadius: '20px', bgcolor: '#f8fafc', '& fieldset': { border: 'none' } } }} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {jobs.map((j: any) => (
                <Box key={j.id} sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', borderBottom: '1px solid #e2e8f0', '&:hover': { bgcolor: '#f8fafc' } }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700} sx={{ mb: 0.5, fontSize: '16px' }}>{j.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{j.description}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip size="small" label={j.category} sx={{ bgcolor: 'primary.50', color: 'primary.main', fontWeight: 600, fontSize: '12px' }} />
                      <Chip size="small" label={j.escrowStatus} sx={{ bgcolor: '#ecfdf5', color: '#10b981', fontWeight: 600, fontSize: '12px' }} />
                    </Box>
                  </Box>
                  <Box sx={{ ml: 4, textAlign: 'right' }}>
                    <Typography variant="h6" color="text.primary" fontWeight={800} sx={{ mb: 1 }}>₹{j.budget.toLocaleString()}</Typography>
                    <Button variant="outlined" size="small" sx={{ borderRadius: '8px' }}>View Proposals (0)</Button>
                  </Box>
                </Box>
              ))}
              {jobs.length === 0 && <Box sx={{ p: 6, textAlign: 'center' }}><Typography color="text.secondary">You haven't posted any jobs yet.</Typography></Box>}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
