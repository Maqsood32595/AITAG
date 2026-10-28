import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import Navbar from '../components/Navbar';
import { tasksApi } from '../api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Product Visuals', 'E-Commerce & Copy', 'Social & Marketing', 'Web & Funnels'];

const UpdateTask = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Escrow Payment Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [merchant, setMerchant] = useState<any>(null);
  const [utrInput, setUtrInput] = useState('');
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    tasksApi.getById(id!).then(res => {
      const t = res.data;
      setForm({
        title: t.title,
        category: t.category,
        description: t.description,
        deadline: t.deadline?.split('T')[0] || t.deadline,
        budget: t.budget,
        image: t.image || '',
        escrow_funded: t.escrow_funded || false
      });
    }).catch(console.error);

    // Fetch merchant details for UPI QR
    fetch('/api/payments/merchant-config')
      .then(r => r.json())
      .then(d => {
        if (d.success) setMerchant(d.merchant);
      })
      .catch(() => {
        setMerchant({
          vpa: 'mohammedmaqsoodai@oksbi',
          name: 'Mohammed Maqsood',
          qrImage: '/images/payment-qr.jpeg'
        });
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await tasksApi.update(id!, form);
      navigate('/my_tasks');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyVpa = () => {
    if (merchant?.vpa) {
      navigator.clipboard.writeText(merchant.vpa);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmEscrowPayment = async () => {
    if (!utrInput || utrInput.trim().length < 6) {
      setError('Please provide a valid UTR / transaction reference number.');
      return;
    }
    setPaySubmitting(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: id,
          order_id: id,
          customer_email: user?.email || 'client@aitag.com',
          customer_name: user?.name || 'AITAG Client',
          amount: Number(form.budget) || 1499,
          payment_method: 'upi',
          utr_reference: utrInput.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setPaySuccess(true);
        setForm((prev: any) => ({ ...prev, escrow_funded: true }));
      } else {
        setError(data.error || 'Failed to record payment');
      }
    } catch (e: any) {
      setError(e.message || 'Payment submission failed');
    } finally {
      setPaySubmitting(false);
    }
  };

  if (!form) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress sx={{ color: '#4f46e5' }} /></Box>;

  const grossBudget = Number(form.budget) || 0;
  const platformFee = Number((grossBudget * 0.10).toFixed(2));
  const tdsFee = Number((grossBudget * 0.01).toFixed(2));
  const netSpecialist = Number((grossBudget - (platformFee + tdsFee)).toFixed(2));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />
      <Container maxWidth="sm" sx={{ pt: 14, pb: 6 }}>
        <Paper elevation={0} sx={{ p: 5, borderRadius: '20px', border: '1px solid rgba(79,70,229,0.1)', boxShadow: '0 8px 40px rgba(79,70,229,0.08)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'Inter, sans-serif', letterSpacing: '-1px' }}>
              Update Task
            </Typography>
            <Chip
              icon={form.escrow_funded ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <LockIcon sx={{ fontSize: 14 }} />}
              label={form.escrow_funded ? 'Escrow Funded' : 'Escrow Pending'}
              color={form.escrow_funded ? 'success' : 'warning'}
              size="small"
              sx={{ fontWeight: 700, borderRadius: '8px' }}
            />
          </Box>
          <Typography sx={{ color: '#64748b', mb: 3, fontSize: '0.95rem' }}>Edit your task details & fund escrow protection below</Typography>
          
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}
          
          {/* Escrow Quick Action Card */}
          <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: '14px', bgcolor: 'rgba(79,70,229,0.04)', border: '1px dashed rgba(79,70,229,0.3)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Milestone Escrow Protection
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  Budget: ₹{form.budget || 0} • 100% money-back safe until review
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                startIcon={<QrCode2Icon />}
                onClick={() => setPayModalOpen(true)}
                sx={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  fontWeight: 700,
                  borderRadius: '10px',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                }}
              >
                {form.escrow_funded ? 'View Payment' : 'Pay & Lock Escrow'}
              </Button>
            </Box>
          </Paper>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Task Title *" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} sx={fieldStyle} />
            <FormControl sx={fieldStyle}>
              <InputLabel>Category</InputLabel>
              <Select value={form.category} label="Category" onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Description *" required multiline rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} sx={fieldStyle} />
            <TextField
              label="Deadline *"
              type="date"
              required
              value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              sx={{
                ...fieldStyle,
                '& .MuiInputLabel-root': {
                  transform: 'translate(14px, -9px) scale(0.75) !important',
                  bgcolor: '#ffffff',
                  px: 0.8,
                  borderRadius: '4px',
                  fontWeight: 600,
                  zIndex: 2,
                }
              }}
            />
            <TextField label="Budget (₹) *" type="number" required value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} sx={fieldStyle} />
            <TextField label="Image URL" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} sx={fieldStyle} />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button type="button" variant="outlined" fullWidth onClick={() => navigate('/my_tasks')}
                sx={{ borderRadius: '12px', color: '#64748b', borderColor: '#e2e8f0', fontWeight: 600 }}>Cancel</Button>
              <Button type="submit" variant="contained" fullWidth disabled={loading}
                sx={{ background: 'linear-gradient(135deg, #4f46e5, #0891b2)', fontWeight: 700, borderRadius: '12px', boxShadow: '0 6px 20px rgba(79,70,229,0.3)' }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Escrow UPI Payment Modal */}
      <Dialog
        open={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '20px', p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pb: 1 }}>
          🔒 Fund Task Escrow
        </DialogTitle>
        <DialogContent>
          {paySuccess ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 60, color: '#10b981', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Payment Reference Submitted!</Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 1, mb: 2 }}>
                Your payment reference has been recorded. Escrow is now processing for this task.
              </Typography>
              <Chip label={`Reference: ${utrInput}`} color="primary" sx={{ fontWeight: 600 }} />
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                Scan with any UPI App (GPay, PhonePe, Paytm, BHIM)
              </Typography>

              {/* QR Image */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box
                  component="img"
                  src={merchant?.qrImage || '/images/payment-qr.jpeg'}
                  alt="UPI QR Code"
                  sx={{
                    width: 220,
                    height: 220,
                    borderRadius: '16px',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
                  }}
                />
              </Box>

              {/* Amount Display */}
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#4f46e5', mb: 0.5 }}>
                ₹{grossBudget.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2 }}>
                Payee: {merchant?.name || 'Mohammed Maqsood'}
              </Typography>

              {/* VPA Copy Bar */}
              <Paper
                elevation={0}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  mb: 2.5,
                  bgcolor: '#f1f5f9',
                  borderRadius: '10px'
                }}
              >
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {merchant?.vpa || 'mohammedmaqsoodai@oksbi'}
                </Typography>
                <Tooltip title={copied ? 'Copied!' : 'Copy UPI ID'}>
                  <IconButton size="small" onClick={handleCopyVpa} sx={{ color: '#4f46e5' }}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Paper>

              {/* Escrow Splits Breakdown */}
              <Box sx={{ mb: 3, p: 1.5, bgcolor: '#f8fafc', borderRadius: '10px', textAlign: 'left' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Specialist Payout (89%):</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>₹{netSpecialist}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Platform Fee (10%):</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>₹{platformFee}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Sec 194-O TDS (1%):</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>₹{tdsFee}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* UTR Reference Input */}
              <TextField
                fullWidth
                label="UPI UTR / Reference Number *"
                placeholder="e.g. 428901234567"
                value={utrInput}
                onChange={e => setUtrInput(e.target.value)}
                sx={fieldStyle}
                helperText="Enter the 12-digit transaction ID from your UPI receipt"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {paySuccess ? (
            <Button fullWidth variant="contained" onClick={() => setPayModalOpen(false)} sx={{ borderRadius: '12px' }}>
              Done
            </Button>
          ) : (
            <>
              <Button onClick={() => setPayModalOpen(false)} sx={{ borderRadius: '12px', color: '#64748b' }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={paySubmitting || !utrInput.trim()}
                onClick={handleConfirmEscrowPayment}
                sx={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  fontWeight: 700,
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                }}
              >
                {paySubmitting ? 'Verifying...' : 'Submit Payment Reference'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const fieldStyle = { '& .MuiOutlinedInput-root': { borderRadius: '10px', '&:hover fieldset': { borderColor: '#4f46e5' }, '&.Mui-focused fieldset': { borderColor: '#4f46e5' } }, '& label.Mui-focused': { color: '#4f46e5' } };

export default UpdateTask;
