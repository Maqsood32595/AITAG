import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Grid, Chip, TextField, InputAdornment, Avatar } from '@mui/material';


export const FreelancerDashboard = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{text: string, warning?: boolean}[]>([
    { text: 'Hello! Are you available to start working on the React project?' }
  ]);

  useEffect(() => {
    fetch('/api/marketplace/jobs').then(r => r.json()).then(setJobs);
  }, []);

  const handleSendChat = async () => {
    if(!chatInput) return;
    const msg = chatInput;
    setMessages(prev => [...prev, { text: msg }]);
    setChatInput('');
    
    // Check PII Shield
    const res = await fetch('/api/shield/filter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    if(data.leaked) {
      setMessages(prev => [...prev, { text: `System blocked message containing PII: "${data.cleanText}". Please communicate securely on platform.`, warning: true }]);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }} className="fade-in-up">
        <Typography variant="h5" sx={{ mb: 1, color: 'text.primary' }}>Find Work</Typography>
        <Typography variant="body2" color="text.secondary">Browse jobs that match your skills and submit proposals.</Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid xs={12} md={7}>
          <Paper className="fade-in-up stagger-1" sx={{ p: 3, mb: 3, borderRadius: '16px', display: 'flex', gap: 2 }}>
            <TextField fullWidth placeholder="Search for jobs..." InputProps={{ startAdornment: <InputAdornment position="start"><span>🔍</span></InputAdornment>, sx: { borderRadius: '10px' } }} />
            <Button variant="outlined" sx={{ minWidth: 100 }} startIcon={<span>⚙️</span>}>Filters</Button>
          </Paper>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {jobs.map((j: any, i) => (
              <Paper key={j.id} className="fade-in-up" sx={{ animationDelay: `${0.15 + (i * 0.05)}s`, p: 4, borderRadius: '16px', transition: 'all 0.2s', border: '1px solid transparent', '&:hover': { borderColor: 'primary.main', boxShadow: '0 8px 32px rgba(79,70,229,0.08)' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, cursor: 'pointer', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}>{j.title}</Typography>
                    <Typography variant="body2" color="text.secondary">Fixed-price - Expert Level - Est. Time: 1 month</Typography>
                  </Box>
                </Box>
                <Typography variant="body1" color="text.primary" sx={{ my: 2, lineHeight: 1.6 }}>{j.description}</Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  <Chip size="small" label="React" sx={{ bgcolor: '#f1f5f9', fontWeight: 600 }} />
                  <Chip size="small" label="Node.js" sx={{ bgcolor: '#f1f5f9', fontWeight: 600 }} />
                  <Chip size="small" label="TypeScript" sx={{ bgcolor: '#f1f5f9', fontWeight: 600 }} />
                  <Chip size="small" label={j.category} sx={{ bgcolor: '#f1f5f9', fontWeight: 600 }} />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid #e2e8f0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6" color="text.primary" fontWeight={800}>₹{j.budget.toLocaleString()}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main', ml: 1 }}>
                      <span style={{ fontSize: '14px' }}>✅</span>
                      <Typography variant="caption" fontWeight={600}>Payment Verified</Typography>
                    </Box>
                  </Box>
                  <Button variant="contained" color="primary" sx={{ px: 3 }}>Apply Now</Button>
                </Box>
              </Paper>
            ))}
          </Box>
        </Grid>

        <Grid xs={12} md={5}>
          <Paper className="fade-in-up stagger-2" sx={{ height: '550px', display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src="https://ui-avatars.com/api/?name=Enterprise+Client&background=0D8ABC&color=fff" />
              <Box>
                <Typography fontWeight={700}>Enterprise Client</Typography>
                <Typography variant="caption" color="success.main" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <span>🛡️</span> Secure Escrow Chat
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, p: 3, bgcolor: '#ffffff' }}>
              <Typography variant="caption" align="center" color="text.secondary" sx={{ mb: 2 }}>Today</Typography>
              {messages.map((m, i) => {
                const isSystem = m.warning;
                const isMe = !isSystem && i > 0;
                
                if (isSystem) {
                  return (
                    <Box key={i} sx={{ alignSelf: 'center', maxWidth: '90%', p: 1.5, borderRadius: '8px', bgcolor: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', fontSize: '12px', fontWeight: 600, textAlign: 'center' }}>
                      {m.text}
                    </Box>
                  );
                }
                
                return (
                  <Box key={i} sx={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%', p: 2, borderRadius: '16px', borderBottomRightRadius: isMe ? '4px' : '16px', borderBottomLeftRadius: isMe ? '16px' : '4px', bgcolor: isMe ? 'primary.main' : '#f1f5f9', color: isMe ? 'white' : 'text.primary', fontSize: '14px', boxShadow: isMe ? '0 4px 12px rgba(79,70,229,0.2)' : 'none' }}>
                    {m.text}
                  </Box>
                );
              })}
            </Box>
            
            <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
              <Box sx={{ display: 'flex', gap: 1, bgcolor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', p: 0.5 }}>
                <TextField size="small" fullWidth placeholder="Write a message..." variant="standard" InputProps={{ disableUnderline: true, sx: { px: 2, py: 1 } }} value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChat()} />
                <Button variant="contained" color="primary" onClick={handleSendChat} sx={{ minWidth: '80px', borderRadius: '8px' }}>Send</Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                Keep contact inside the platform. Sharing phone/WhatsApp is disabled.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
