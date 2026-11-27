import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Fade,
  Grow,
  IconButton,
  Tooltip,
  Snackbar,
  useMediaQuery,
  useTheme,
  Skeleton,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ContentCopy as CopyIcon,
  ArrowBack as ArrowBackIcon,
  Payment as PaymentIcon,
  QrCode2 as QrCodeIcon,
  ReceiptLong as ReceiptIcon,
  Verified as VerifiedIcon,
  PhoneIphone as PhoneIcon,
  Shield as ShieldIcon,
  Timer as TimerIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface MerchantConfig {
  vpa: string;
  name: string;
  qrImage: string;
}

interface OrderConfig {
  order_id: string;
  order_number: string;
  package_title: string;
  tier_name: string;
  amount: number;
  original_price?: number;
  discount_amount?: number;
  payment_waived?: boolean;
  waive_reason?: string;
  currency: string;
  merchant: { vpa: string; displayName: string };
  upi_uri: string;
  payment_methods: string[];
}

const STEPS = ['Select Service', 'Make Payment', 'Confirm & Submit'];

export default function PaymentCheckout() {
  const { user } = useAuth();
  const { id: routeId, orderId: routeOrderId } = useParams<{ id?: string; orderId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const orderId = routeOrderId || routeId || searchParams.get('order') || searchParams.get('taskId');
  const packageTitle = searchParams.get('package') || '';
  const tierName = searchParams.get('tier') || '';
  const amountParam = searchParams.get('amount') || '';

  const [activeStep, setActiveStep] = useState(1);
  const [merchant, setMerchant] = useState<MerchantConfig | null>(null);
  const [orderConfig, setOrderConfig] = useState<OrderConfig | null>(null);
  const [utrReference, setUtrReference] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showContactEdit, setShowContactEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Guarantee page starts at top (0, 0) on mount without auto-scroll jumps
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Sync user credentials if loaded late
  useEffect(() => {
    if (user) {
      if (!customerName && user.name) setCustomerName(user.name);
      if (!customerEmail && user.email) setCustomerEmail(user.email);
    }
  }, [user]);

  // Fetch merchant config
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/payments/merchant-config`);
        const data = await res.json();
        if (data.success) {
          setMerchant(data.merchant);
        }
      } catch (e) {
        console.warn('Failed to fetch merchant config:', e);
        // Fallback to defaults
        setMerchant({
          vpa: 'mohammedmaqsoodai@oksbi',
          name: 'AITAG Payment Protection',
          qrImage: '/images/payment-qr.jpeg',
        });
      }
    })();
  }, []);

  // Fetch order config if orderId is provided
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/payments/config/${orderId}`);
        const data = await res.json();
        if (data.success) {
          setOrderConfig(data.config);
        }
      } catch (e) {
        console.warn('Failed to fetch order config:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  useEffect(() => {
    if (!orderId && merchant) {
      setLoading(false);
    }
  }, [orderId, merchant]);

  const isWaived = Boolean(orderConfig?.payment_waived) || (Boolean(orderConfig) && Number(orderConfig?.amount) <= 0);
  const displayAmount = isWaived ? 0 : (orderConfig?.amount ?? (Number(amountParam) || 0));
  const originalPrice = orderConfig?.original_price || displayAmount;
  const discountAmount = orderConfig?.discount_amount || 0;
  const displayPackage = orderConfig?.package_title || packageTitle || 'AITAG Service';
  const displayTier = orderConfig?.tier_name || tierName || '';
  const displayVpa = orderConfig?.merchant?.vpa || merchant?.vpa || '';

  const copyVpa = useCallback(() => {
    navigator.clipboard.writeText(displayVpa);
    setCopied(true);
    setSnackbarOpen(true);
    setTimeout(() => setCopied(false), 2000);
  }, [displayVpa]);

  const handleUpiIntent = () => {
    const upiUri =
      orderConfig?.upi_uri ||
      `upi://pay?pa=${encodeURIComponent(displayVpa)}&pn=${encodeURIComponent(merchant?.name || 'AITAG')}&am=${displayAmount}&cu=INR&tn=${encodeURIComponent(`AITAG - ${displayPackage}`)}`;
    window.location.href = upiUri;
  };

  const handleSubmitPayment = async () => {
    if (!utrReference.trim()) {
      setError('Please enter your 12-digit UPI UTR / Transaction Reference Number');
      return;
    }
    const effectiveName = customerName.trim() || user?.name || 'Customer';
    const effectiveEmail = customerEmail.trim() || user?.email || '';

    if (!effectiveEmail) {
      setError('Please provide an email address for your order confirmation');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload: Record<string, unknown> = {
        order_id: orderId || `WALK-IN-${Date.now()}`,
        customer_email: effectiveEmail,
        customer_name: effectiveName,
        customer_phone: customerPhone.trim() || undefined,
        amount: displayAmount,
        payment_method: 'upi',
        utr_reference: utrReference.trim(),
      };

      const res = await fetch(`${API_BASE}/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setActiveStep(2);
      } else {
        setError(data.error || 'Payment submission failed');
      }
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        }}
      >
        <CircularProgress sx={{ color: '#818cf8' }} size={48} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        py: { xs: 2, md: 3 },
        px: { xs: 1.5, md: 3 },
      }}
    >
      <Container maxWidth="lg">
        {/* Header - Compact Row */}
        <Fade in timeout={600}>
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{
                  color: 'rgba(255,255,255,0.85)',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px',
                  px: 2,
                  py: 0.75,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.12)' },
                }}
              >
                Back to Tasks
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(79,70,229,0.35)',
                  }}
                >
                  <PaymentIcon sx={{ color: '#fff', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: '#fff', fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1.15, fontSize: { xs: '1rem', md: '1.2rem' } }}
                  >
                    Secure Payment
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                    Direct UPI • Zero Processing Fees • Instant Activation
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* Stepper - Compact */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 2 }}>
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              sx={{
                '& .MuiStepLabel-label': {
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '0.75rem',
                  '&.Mui-active': { color: '#818cf8', fontWeight: 700 },
                  '&.Mui-completed': { color: '#10b981' },
                },
                '& .MuiStepIcon-root': {
                  color: 'rgba(255,255,255,0.15)',
                  fontSize: '1.25rem',
                  '&.Mui-active': { color: '#4f46e5' },
                  '&.Mui-completed': { color: '#10b981' },
                },
                '& .MuiStepConnector-line': {
                  borderColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </Fade>

        {/* Success or Payment Waived State */}
        {isWaived ? (
          <Grow in timeout={500}>
            <Paper
              id="payment-waived-card"
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: '20px',
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.25)',
                backdropFilter: 'blur(20px)',
                textAlign: 'center',
              }}
            >
              <CheckCircleIcon sx={{ color: '#10b981', fontSize: 56, mb: 2 }} />
              <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 800, mb: 1 }}>
                Payment Waived by Admin
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.72)', mb: 3, maxWidth: 440, mx: 'auto' }}>
                No upfront payment is required for <strong>{displayPackage}</strong>
                {orderConfig?.waive_reason ? ` (${orderConfig.waive_reason})` : ''}. Your order is active inside your dashboard.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/dashboard')}
                sx={{
                  px: { xs: 2.5, sm: 4 },
                  py: 1.5,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '12px',
                  fontWeight: 700,
                }}
              >
                Go to Dashboard
              </Button>
            </Paper>
          </Grow>
        ) : submitted ? (
          <Grow in timeout={500}>
            <Paper
              id="payment-success-card"
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: '20px',
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
                backdropFilter: 'blur(20px)',
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  boxShadow: '0 12px 40px rgba(16,185,129,0.3)',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { boxShadow: '0 0 0 0 rgba(16,185,129,0.4)' },
                    '70%': { boxShadow: '0 0 0 20px rgba(16,185,129,0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(16,185,129,0)' },
                  },
                }}
              >
                <CheckCircleIcon sx={{ color: '#fff', fontSize: 44 }} />
              </Box>
              <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 800, mb: 1 }}>
                Payment Submitted!
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', mb: 3, maxWidth: 400, mx: 'auto' }}>
                Your UTR reference <strong style={{ color: '#10b981' }}>{utrReference}</strong> has
                been recorded. Our team will verify your payment and activate your order within{' '}
                <strong>15 minutes</strong>.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Chip
                  icon={<TimerIcon />}
                  label="Verification: ~15 min"
                  sx={{
                    background: 'rgba(16,185,129,0.15)',
                    color: '#10b981',
                    fontWeight: 600,
                    border: '1px solid rgba(16,185,129,0.2)',
                  }}
                />
                <Chip
                  icon={<ShieldIcon />}
                  label="100% Secure"
                  sx={{
                    background: 'rgba(79,70,229,0.15)',
                    color: '#818cf8',
                    fontWeight: 600,
                    border: '1px solid rgba(79,70,229,0.2)',
                  }}
                />
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate('/dashboard')}
                sx={{
                  mt: 4,
                  px: { xs: 2.5, sm: 4 },
                  py: 1.5,
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4338ca, #6d28d9)',
                  },
                }}
              >
                Go to Dashboard
              </Button>
            </Paper>
          </Grow>
        ) : (
          /* Main Payment Card */
          <Grow in timeout={500}>
            <Paper
              id="payment-checkout-card"
              sx={{
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(24px)',
                overflow: 'hidden',
              }}
            >
              {/* Order Summary Header - Sleek Compact Banner */}
              {(displayPackage || displayAmount > 0) && (
                <Box
                  sx={{
                    px: { xs: 2, md: 3 },
                    py: 1.5,
                    background: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                      <Typography
                        variant="caption"
                        sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.5px' }}
                      >
                        ORDER:
                      </Typography>
                      <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
                        {displayPackage}
                      </Typography>
                      {displayTier && (
                        <Chip
                          label={displayTier.replace('package_', 'Tier ')}
                          size="small"
                          sx={{
                            background: 'rgba(79,70,229,0.25)',
                            color: '#a5b4fc',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            height: 22,
                            border: '1px solid rgba(165,180,252,0.3)',
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
                      {discountAmount > 0 && originalPrice > displayAmount && (
                        <>
                          <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', textDecoration: 'line-through' }}>
                            ₹{originalPrice.toLocaleString('en-IN')}
                          </Typography>
                          <Chip
                            label={`-₹${discountAmount.toLocaleString('en-IN')} Admin Discount`}
                            size="small"
                            sx={{ bgcolor: 'rgba(16,185,129,0.2)', color: '#6ee7b7', fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                          />
                        </>
                      )}
                      <Typography
                        variant="caption"
                        sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}
                      >
                        TOTAL:
                      </Typography>
                      <Typography
                        sx={{
                          color: '#10b981',
                          fontWeight: 800,
                          fontSize: { xs: '1.3rem', md: '1.5rem' },
                          lineHeight: 1,
                        }}
                      >
                        ₹{displayAmount.toLocaleString('en-IN')}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* 2-Column Responsive Body */}
              <Box sx={{ p: { xs: 2, md: 2.75 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 2.5, md: 3 },
                    alignItems: 'stretch',
                  }}
                >
                  {/* Left Column: QR Code & UPI Apps */}
                  <Box
                    sx={{
                      flex: { xs: '1 1 auto', md: '0 0 46%' },
                      maxWidth: { md: '46%' },
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <QrCodeIcon sx={{ color: '#818cf8', fontSize: 18 }} />
                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                          Step 1: Scan QR or Pay via App
                        </Typography>
                      </Box>
                      <Box
                        component="img"
                        src="/images/aitag-logo.png"
                        alt="AITAG Payment Protection"
                        sx={{ height: 22, objectFit: 'contain' }}
                      />
                    </Box>

                    {/* QR + Details Row */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'center' }, mb: 1.5 }}>
                      <Box
                        sx={{
                          flexShrink: 0,
                          mx: { xs: 'auto', sm: 0 },
                          width: { xs: 150, sm: 145 },
                          height: { xs: 150, sm: 145 },
                          borderRadius: '12px',
                          overflow: 'hidden',
                          background: '#fff',
                          p: 1,
                          boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                          border: '2px solid rgba(79,70,229,0.3)',
                        }}
                      >
                        {merchant?.qrImage ? (
                          <img
                            src={merchant.qrImage}
                            alt="Payment QR Code"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              borderRadius: '6px',
                            }}
                          />
                        ) : (
                          <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: '6px' }} />
                        )}
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {/* UPI ID */}
                        <Box
                          sx={{
                            p: 1.2,
                            borderRadius: '10px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', display: 'block', mb: 0.25 }}
                          >
                            UPI ID (TAP TO COPY)
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography
                              sx={{
                                color: '#a5b4fc',
                                fontWeight: 700,
                                fontFamily: 'monospace',
                                fontSize: '0.8rem',
                                wordBreak: 'break-all',
                              }}
                            >
                              {displayVpa}
                            </Typography>
                            <Tooltip title={copied ? 'Copied!' : 'Copy UPI ID'}>
                              <IconButton
                                onClick={copyVpa}
                                size="small"
                                sx={{ color: copied ? '#10b981' : 'rgba(255,255,255,0.5)', ml: 0.5, p: 0.4 }}
                              >
                                {copied ? <CheckCircleIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>

                        {/* Pay To */}
                        <Box
                          sx={{
                            p: 1.2,
                            borderRadius: '10px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', display: 'block', mb: 0.25 }}
                          >
                            PAY TO
                          </Typography>
                          <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.82rem' }}>
                            {merchant?.name || 'AITAG Services'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Pay via UPI App button */}
                    <Button
                      id="upi-intent-button"
                      variant="contained"
                      fullWidth
                      startIcon={<PhoneIcon />}
                      onClick={handleUpiIntent}
                      sx={{
                        py: 1.2,
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        boxShadow: '0 6px 20px rgba(79,70,229,0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4338ca, #6d28d9)',
                        },
                      }}
                    >
                      Pay ₹{displayAmount.toLocaleString('en-IN')} via UPI App
                    </Button>

                    {/* Accepted App Chips */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      {['GPay', 'PhonePe', 'Paytm', 'BHIM', 'Any UPI'].map((app) => (
                        <Chip
                          key={app}
                          label={app}
                          size="small"
                          sx={{
                            background: 'rgba(255,255,255,0.05)',
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '0.65rem',
                            height: 20,
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Divider between columns */}
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      display: { xs: 'none', md: 'block' },
                      borderColor: 'rgba(255,255,255,0.08)',
                    }}
                  />
                  <Divider
                    sx={{
                      display: { xs: 'block', md: 'none' },
                      borderColor: 'rgba(255,255,255,0.08)',
                    }}
                  />

                  {/* Right Column: UTR Reference Submission */}
                  <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
                      <ReceiptIcon sx={{ color: '#818cf8', fontSize: 18 }} />
                      <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                        Step 2: Submit Reference (UTR)
                      </Typography>
                    </Box>

                    <Alert
                      severity="info"
                      icon={<WalletIcon sx={{ fontSize: 17 }} />}
                      sx={{
                        mb: 1.5,
                        py: 0.4,
                        px: 1.5,
                        background: 'rgba(79,70,229,0.08)',
                        border: '1px solid rgba(79,70,229,0.15)',
                        color: 'rgba(255,255,255,0.75)',
                        borderRadius: '10px',
                        fontSize: '0.78rem',
                        '& .MuiAlert-icon': { color: '#818cf8', mr: 1, py: 0 },
                      }}
                    >
                      Enter the 12-digit UPI UTR from your payment app confirmation screen.
                    </Alert>

                    {error && (
                      <Alert
                        severity="error"
                        sx={{
                          mb: 1.5,
                          py: 0.4,
                          px: 1.5,
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.15)',
                          color: '#fca5a5',
                          borderRadius: '10px',
                          fontSize: '0.8rem',
                        }}
                        onClose={() => setError('')}
                      >
                        {error}
                      </Alert>
                    )}

                    {/* Customer Account Indicator */}
                    {user ? (
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: '10px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 1.5,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <VerifiedIcon sx={{ color: '#10b981', fontSize: 18 }} />
                          <Box>
                            <Typography sx={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 700 }}>
                              {user.name || 'Account Customer'}
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                              Order confirmation will be sent to: <strong style={{ color: '#a5b4fc' }}>{user.email}</strong>
                            </Typography>
                          </Box>
                        </Box>
                        <Button
                          size="small"
                          onClick={() => setShowContactEdit(!showContactEdit)}
                          sx={{
                            color: '#a5b4fc',
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            border: '1px solid rgba(165,180,252,0.3)',
                            borderRadius: '8px',
                            px: 1.2,
                            py: 0.3,
                            '&:hover': { bgcolor: 'rgba(165,180,252,0.1)' }
                          }}
                        >
                          {showContactEdit ? 'Hide Edit' : 'Edit Info'}
                        </Button>
                      </Box>
                    ) : null}

                    {(!user || showContactEdit) && (
                      <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <TextField
                          id="customer-name-input"
                          label="Your Name"
                          placeholder="Your Full Name"
                          size="small"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          fullWidth
                          required
                          sx={textFieldStyles}
                        />
                        <TextField
                          id="customer-email-input"
                          label="Email Address"
                          placeholder="you@example.com"
                          size="small"
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          fullWidth
                          required
                          sx={textFieldStyles}
                        />
                      </Box>
                    )}

                    {/* UTR Input (NO autoFocus!) */}
                    <Box sx={{ mb: 1.5 }}>
                      <TextField
                        id="utr-reference-input"
                        label="12-Digit UPI UTR / Transaction Reference Number *"
                        placeholder="e.g. 428901234567 or UPI-REF-XXXX"
                        value={utrReference}
                        onChange={(e) => setUtrReference(e.target.value)}
                        fullWidth
                        required
                        sx={textFieldStyles}
                        helperText="Found on your UPI app confirmation screen (GPay, PhonePe, Paytm, BHIM, Cred)"
                        FormHelperTextProps={{
                          sx: { color: 'rgba(255,255,255,0.65)', ml: 0.5, mt: 0.5, fontSize: '0.72rem', fontWeight: 500 },
                        }}
                      />
                    </Box>

                    {/* Submit CTA */}
                    <Button
                      id="submit-payment-button"
                      variant="contained"
                      fullWidth
                      size="large"
                      startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <VerifiedIcon />}
                      onClick={handleSubmitPayment}
                      disabled={submitting || !utrReference.trim()}
                      sx={{
                        py: 1.35,
                        background: submitting
                          ? 'rgba(79,70,229,0.4)'
                          : 'linear-gradient(135deg, #10b981, #059669)',
                        borderRadius: '12px',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        letterSpacing: '0.3px',
                        boxShadow: '0 6px 20px rgba(16,185,129,0.25)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #059669, #047857)',
                          boxShadow: '0 10px 28px rgba(16,185,129,0.35)',
                        },
                        '&.Mui-disabled': {
                          background: 'rgba(255,255,255,0.08)',
                          color: 'rgba(255,255,255,0.35)',
                        },
                      }}
                    >
                      {submitting ? 'Submitting Reference...' : 'Confirm & Activate Order'}
                    </Button>
                  </Box>
                </Box>
              </Box>

              {/* Security Footer - Compact */}
              <Box
                sx={{
                  px: 2,
                  py: 1.2,
                  background: 'rgba(255,255,255,0.02)',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: { xs: 2, md: 4 },
                  flexWrap: 'wrap',
                }}
              >
                {[
                  { icon: <ShieldIcon sx={{ fontSize: 14 }} />, text: 'End-to-End Encrypted' },
                  { icon: <VerifiedIcon sx={{ fontSize: 14 }} />, text: 'RBI Regulated UPI' },
                  { icon: <TimerIcon sx={{ fontSize: 14 }} />, text: 'Instant Confirmation' },
                ].map(({ icon, text }) => (
                  <Box
                    key={text}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.6,
                      color: 'rgba(255,255,255,0.35)',
                      fontSize: '0.7rem',
                    }}
                  >
                    {icon}
                    <Typography sx={{ fontSize: '0.7rem', color: 'inherit' }}>{text}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grow>
        )}

        {/* Configurable Notice */}
        <Fade in timeout={1200}>
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}
            >
              Payment account can be changed via MERCHANT_UPI_VPA, MERCHANT_NAME & MERCHANT_QR_IMAGE
              in .env
            </Typography>
          </Box>
        </Fade>
      </Container>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message="UPI ID copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

// High-contrast clean input styles for payment checkout
const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    color: '#0f172a',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    '& input': {
      color: '#0f172a',
      fontWeight: 600,
      fontSize: '0.95rem',
      padding: '14px 16px',
    },
    '& fieldset': {
      borderColor: 'rgba(255,255,255,0.4)',
      borderWidth: '1.5px',
    },
    '&:hover fieldset': {
      borderColor: '#818cf8',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#4f46e5',
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: 600,
    fontSize: '0.9rem',
    '&.Mui-focused': { color: '#a5b4fc' },
    '&.MuiInputLabel-shrink': {
      backgroundColor: '#ffffff',
      color: '#1e293b',
      fontWeight: 700,
      padding: '1px 8px',
      borderRadius: '4px',
      border: '1px solid #cbd5e1',
    },
  },
  '& .MuiInputBase-input::placeholder': {
    color: '#64748b',
    opacity: 1,
    fontWeight: 400,
  },
};
