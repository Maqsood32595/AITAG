import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box,
  Typography, TextField, Button, MenuItem, Stack, Chip,
  Alert, CircularProgress, IconButton, Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
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

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);
  const [briefNotes, setBriefNotes] = useState('');
  const [uploadedAssets, setUploadedAssets] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  if (!selectedPackage) return null;

  const tier = (selectedPackage.tiers || []).find(
    (t: any) => t.tier_name.toLowerCase() === selectedTier.toLowerCase()
  ) || selectedPackage.tiers?.[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail) {
      setError('Please provide your name and email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const assetList = uploadedAssets
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        package_slug: selectedPackage.slug,
        tier_name: tier?.tier_name || 'beginner',
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        business_name: businessName,
        business_type: businessType,
        brief_notes: briefNotes,
        uploaded_assets: assetList
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
    onClose();
  };

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
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: '#10b981', mb: 2 }} />
            <Typography variant="h5" fontWeight={800} color="#0f172a" gutterBottom>
              Your Request is Locked In!
            </Typography>
            <Chip
              label={`Order ID: ${createdOrder.order_number}`}
              sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 700, fontSize: '0.9rem', mb: 2 }}
            />
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2, mb: 3, textAlign: 'left' }}>
              <Typography variant="body2" color="#64748b" gutterBottom>
                <strong>Package:</strong> {createdOrder.package_title} ({
                  createdOrder.tier_name?.startsWith('package_')
                    ? createdOrder.tier_name.replace('package_', 'Package ').toUpperCase()
                    : createdOrder.tier_name?.toUpperCase()
                })
              </Typography>
              <Typography variant="body2" color="#64748b" gutterBottom>
                <strong>Fixed Price:</strong> ₹{createdOrder.agreed_price.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="body2" color="#64748b">
                <strong>Status:</strong> <span style={{ color: '#d97706', fontWeight: 700 }}>REQUESTED</span> (Under Review)
              </Typography>
            </Paper>

            <Typography variant="body2" color="#475569" sx={{ mb: 2 }}>
              An AITAG coordinator is currently qualifying your requirements and matching the best vetted AI expert for your business. You will receive an update shortly!
            </Typography>
          </Box>
        ) : (
          <form onSubmit={handleSubmit} id="order-brief-form">
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Selected Package Summary Card */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
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
                  <Typography variant="caption" color="#64748b">
                    {tier?.deliverable_summary}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" fontWeight={800} color="#4f46e5">
                    ₹{tier ? Number(tier.price_min).toLocaleString('en-IN') : '—'}
                  </Typography>
                  <Chip
                    label={
                      tier?.tier_name?.startsWith('package_')
                        ? tier.tier_name.replace('package_', 'Package ').toUpperCase()
                        : (tier?.tier_name ? `${tier.tier_name.toUpperCase()} TIER` : 'PACKAGE 1')
                    }
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

              <TextField
                fullWidth
                multiline
                rows={2}
                label="File & Asset Links (Google Drive / Photos)"
                placeholder="Paste links to your raw product photos, logo, or reference images (one per line)..."
                value={uploadedAssets}
                onChange={(e) => setUploadedAssets(e.target.value)}
                helperText="Turnaround time begins once required reference materials are confirmed."
              />
            </Stack>
          </form>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {createdOrder ? (
          <Button
            variant="contained"
            fullWidth
            onClick={handleResetAndClose}
            sx={{
              bgcolor: '#4f46e5',
              '&:hover': { bgcolor: '#4338ca' },
              py: 1,
              fontWeight: 700
            }}
          >
            Done
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
              disabled={loading}
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
