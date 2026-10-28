import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box,
  Typography, TextField, Button, MenuItem, Stack, Chip,
  Alert, CircularProgress, IconButton, Paper, Divider, Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PaymentIcon from '@mui/icons-material/Payment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { serviceOrdersApi } from '../api';
import { useAuth } from '../context/AuthContext';

interface OrderBriefModalProps {
  open: boolean;
  onClose: () => void;
  selectedPackage: any;
  selectedTier: string;
  onOrderCreated?: (order: any) => void;
}

const BUSINESS_TYPES = [
  'Clothing & Apparel Boutique',
  'Food, Bakery & Cloud Kitchen',
  'Jewellery & Accessories',
  'Health, Clinic & Wellness',
  'Local Retail & Grocery',
  'Home Entrepreneur / Handmade',
  'Real Estate & Professional Services',
  'Early-Stage Tech / Startup',
  'Other Business'
];

export const OrderBriefModal: React.FC<OrderBriefModalProps> = ({
  open,
  onClose,
  selectedPackage,
  selectedTier,
  onOrderCreated
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);
  const [briefNotes, setBriefNotes] = useState('');
  const [externalDriveLinks, setExternalDriveLinks] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<Array<{ originalName: string; url: string; size?: number }>>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  if (!selectedPackage) return null;

  const tier = (selectedPackage.tiers || []).find(
    (t: any) => t.tier_name.toLowerCase() === selectedTier.toLowerCase()
  ) || selectedPackage.tiers?.[0];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    setError(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const res = await fetch('/api/service-orders/upload-assets', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.files)) {
        setAttachedFiles(prev => [...prev, ...data.files]);
      } else {
        setError(data.error || 'Failed to upload files.');
      }
    } catch (err: any) {
      setError(err.message || 'Error uploading files');
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail) {
      setError('Please provide your name and email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const driveList = externalDriveLinks
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const allUploadedAssets = [
        ...attachedFiles.map(f => f.url),
        ...driveList
      ];

      const payload = {
        package_slug: selectedPackage.slug,
        tier_name: tier?.tier_name || 'starter',
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        business_name: businessName,
        business_type: businessType,
        brief_notes: briefNotes,
        uploaded_assets: allUploadedAssets
      };

      const res = await serviceOrdersApi.create(payload);
      if (res.data?.success && res.data?.order) {
        setCreatedOrder(res.data.order);
        if (onOrderCreated) onOrderCreated(res.data.order);
      } else {
        setError('Failed to create order. Please try again.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error submitting order');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setCreatedOrder(null);
    setError(null);
    setAttachedFiles([]);
    onClose();
  };

  // Delivery SLA calculation
  const isPro = (tier?.tier_name || '').toLowerCase() === 'pro';
  const deliverySla = tier?.delivery_days_min && tier?.delivery_days_max
    ? `${tier.delivery_days_min}–${tier.delivery_days_max} Days`
    : (isPro ? '4–6 Days' : '2–4 Days');

  return (
    <Dialog
      open={open}
      onClose={handleResetAndClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: { xs: 1, sm: 2 },
          bgcolor: '#ffffff'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <AutoAwesomeIcon sx={{ color: '#4f46e5' }} />
          <Typography variant="h6" fontWeight={700} color="#0f172a">
            {createdOrder ? 'Order Confirmed!' : 'Request AI Service Package'}
          </Typography>
        </Stack>
        <IconButton onClick={handleResetAndClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: '#f1f5f9' }}>
        {createdOrder ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: '#10b981', mb: 1.5 }} />
            <Typography variant="h5" fontWeight={800} color="#0f172a" gutterBottom>
              Your Request is Locked In!
            </Typography>
            <Chip
              label={`Order ID: ${createdOrder.order_number}`}
              sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 700, fontSize: '0.9rem', mb: 2.5 }}
            />

            <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2, mb: 3, textAlign: 'left' }}>
              <Typography variant="body2" color="#64748b" gutterBottom>
                <strong>Service:</strong> {createdOrder.package_title} ({
                  createdOrder.tier_name?.toLowerCase() === 'starter' ? 'Starter' :
                  createdOrder.tier_name?.toLowerCase() === 'pro' ? 'Pro' :
                  createdOrder.tier_name?.toUpperCase()
                })
              </Typography>
              <Typography variant="body2" color="#64748b" gutterBottom>
                <strong>Agreed Fixed Price:</strong> <span style={{ color: '#0f172a', fontWeight: 800 }}>₹{createdOrder.agreed_price.toLocaleString('en-IN')}</span>
              </Typography>
              <Typography variant="body2" color="#64748b" gutterBottom>
                <strong>Delivery Turnaround:</strong> <span style={{ color: '#4f46e5', fontWeight: 700 }}>{deliverySla} (from asset receipt)</span>
              </Typography>
              <Typography variant="body2" color="#64748b">
                <strong>Current Status:</strong> <span style={{ color: '#d97706', fontWeight: 700 }}>REQUESTED</span> (Matching Vetted Expert)
              </Typography>
            </Paper>

            <Typography variant="body2" color="#475569" sx={{ mb: 3, px: 1 }}>
              Complete instant UPI payment to confirm your order slot and initiate {deliverySla} automated pipeline delivery.
            </Typography>

            {/* 2-Tile Action Decision Cards */}
            <Grid container spacing={2} sx={{ mb: 1 }}>
              <Grid item xs={12} sm={6}>
                <Paper
                  elevation={0}
                  onClick={() => {
                    handleResetAndClose();
                    navigate(`/checkout/${createdOrder.id}`);
                  }}
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: '2px solid #4f46e5',
                    bgcolor: 'rgba(79, 70, 229, 0.04)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: '#4f46e5',
                      color: '#ffffff',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(79, 70, 229, 0.25)',
                      '& .MuiTypography-root': { color: '#ffffff' },
                      '& .MuiSvgIcon-root': { color: '#ffffff' }
                    }
                  }}
                >
                  <PaymentIcon sx={{ fontSize: 32, color: '#4f46e5', mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                    Proceed to Payment
                  </Typography>
                  <Typography variant="caption" color="#64748b" display="block">
                    UPI Instant • ₹{createdOrder.agreed_price.toLocaleString('en-IN')}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper
                  elevation={0}
                  onClick={() => {
                    handleResetAndClose();
                    navigate('/dashboard');
                  }}
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: '1px solid #cbd5e1',
                    bgcolor: '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#4f46e5',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.06)'
                    }
                  }}
                >
                  <DashboardIcon sx={{ fontSize: 32, color: '#64748b', mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                    View My Orders
                  </Typography>
                  <Typography variant="caption" color="#64748b" display="block">
                    Customer Dashboard
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <form onSubmit={handleSubmit} id="order-brief-form">
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Selected Package Summary Card */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2.5,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 2
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="#0f172a">
                    {selectedPackage.title}
                  </Typography>
                  <Typography variant="caption" color="#64748b" display="block">
                    {tier?.deliverable_summary}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    <Chip
                      icon={<AccessTimeIcon sx={{ fontSize: 13, color: '#0891b2 !important' }} />}
                      label={deliverySla}
                      size="small"
                      sx={{ bgcolor: '#ecfeff', color: '#0e7490', fontWeight: 700, fontSize: '0.65rem', height: 20 }}
                    />
                  </Stack>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" fontWeight={800} color="#4f46e5">
                    ₹{tier ? Number(tier.price_min).toLocaleString('en-IN') : '—'}
                  </Typography>
                  <Chip
                    label={tier?.display_name ? `${tier.display_name.toUpperCase()} TIER` : (tier?.tier_name === 'pro' ? 'PRO TIER' : 'STARTER TIER')}
                    size="small"
                    sx={{ bgcolor: '#ede9fe', color: '#6d28d9', fontWeight: 700, fontSize: '0.65rem' }}
                  />
                </Box>
              </Stack>
            </Paper>

            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Your Full Name"
                  size="small"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  size="small"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="WhatsApp / Phone Number"
                  placeholder="+91 98765 43210"
                  size="small"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  InputProps={{
                    startAdornment: <WhatsAppIcon sx={{ color: '#10b981', mr: 1, fontSize: 18 }} />
                  }}
                />
                <TextField
                  fullWidth
                  label="Business Name"
                  placeholder="e.g. Maya Boutique"
                  size="small"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </Stack>

              <TextField
                select
                fullWidth
                label="Business Type / Industry"
                size="small"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
              >
                {BUSINESS_TYPES.map((bt) => (
                  <MenuItem key={bt} value={bt}>
                    {bt}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Project Brief & Requirements"
                placeholder="Describe your products, design preferences, colors, target audience, or specific requirements..."
                value={briefNotes}
                onChange={(e) => setBriefNotes(e.target.value)}
              />

              {/* Native Multi-File Upload Section */}
              <Box sx={{ p: 2, bgcolor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="#0f172a">
                    Upload Assets & Images
                  </Typography>
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={uploadingFiles ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                    disabled={uploadingFiles}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ textTransform: 'none', fontWeight: 600, borderColor: '#4f46e5', color: '#4f46e5' }}
                  >
                    {uploadingFiles ? 'Uploading...' : 'Choose Files'}
                  </Button>
                </Stack>

                {attachedFiles.length > 0 && (
                  <Stack spacing={1} sx={{ mb: 1.5 }}>
                    {attachedFiles.map((file, idx) => (
                      <Paper
                        key={idx}
                        elevation={0}
                        sx={{
                          p: 1,
                          px: 1.5,
                          bgcolor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ overflow: 'hidden' }}>
                          <InsertDriveFileIcon sx={{ fontSize: 18, color: '#4f46e5' }} />
                          <Typography variant="caption" fontWeight={600} noWrap sx={{ maxWidth: 280 }}>
                            {file.originalName}
                          </Typography>
                        </Stack>
                        <IconButton size="small" onClick={() => handleRemoveFile(idx)} sx={{ color: '#ef4444' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Paper>
                    ))}
                  </Stack>
                )}

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  label="Or Paste Google Drive / Cloud Links (Optional)"
                  placeholder="Paste links to your raw product photos, logo, or reference images (one per line)..."
                  value={externalDriveLinks}
                  onChange={(e) => setExternalDriveLinks(e.target.value)}
                  helperText="Turnaround timer starts once required reference materials are confirmed."
                />
              </Box>
            </Stack>
          </form>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {createdOrder ? (
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              handleResetAndClose();
              navigate(`/checkout/${createdOrder.id}`);
            }}
            sx={{
              bgcolor: '#4f46e5',
              '&:hover': { bgcolor: '#4338ca' },
              py: 1.2,
              fontWeight: 700
            }}
          >
            Proceed to Payment & Activate Order
          </Button>
        ) : (
          <>
            <Button onClick={handleResetAndClose} disabled={loading} sx={{ color: '#64748b' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="order-brief-form"
              variant="contained"
              disabled={loading || uploadingFiles}
              sx={{
                bgcolor: '#4f46e5',
                '&:hover': { bgcolor: '#4338ca' },
                px: 3,
                py: 1,
                fontWeight: 700
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Lock Scope & Request Package'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OrderBriefModal;
