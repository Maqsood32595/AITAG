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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5005';

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
  currency: string;
  merchant: { vpa: string; displayName: string };
  upi_uri: string;
  payment_methods: string[];
}

const STEPS = ['Select Service', 'Make Payment', 'Confirm & Submit'];

export default function PaymentCheckout() {
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
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

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
          name: 'Mohammed Maqsood',
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

  const displayAmount = orderConfig?.amount || Number(amountParam) || 0;
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
      setError('Please enter your UTR / Transaction Reference Number');
      return;
    }
    if (!customerName.trim() || !customerEmail.trim()) {
      setError('Please enter your name and email');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload: Record<string, unknown> = {
        order_id: orderId || `WALK-IN-${Date.now()}`,
        customer_email: customerEmail.trim(),
        customer_name: customerName.trim(),
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
        py: { xs: 2, md: 6 },
        px: { xs: 1.5, md: 3 },
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Fade in timeout={600}>
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{
                color: 'rgba(255,255,255,0.7)',
                mb: 2,
                '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.05)' },
              }}
            >
              Back
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(79,70,229,0.35)',
                }}
              >
                <PaymentIcon sx={{ color: '#fff', fontSize: 26 }} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{ color: '#fff', fontWeight: 800, letterSpacing: '-0.5px' }}
                >
                  Secure Payment
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  Direct UPI • Zero Processing Fees
                </Typography>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* Stepper */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 4 }}>
            <Stepper
              activeStep={activeStep}
              alternativeLabel={!isMobile}
              orientation={isMobile ? 'vertical' : 'horizontal'}
              sx={{
                '& .MuiStepLabel-label': {
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '0.8rem',
                  '&.Mui-active': { color: '#818cf8', fontWeight: 700 },
                  '&.Mui-completed': { color: '#10b981' },
                },
                '& .MuiStepIcon-root': {
                  color: 'rgba(255,255,255,0.15)',
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

        {/* Success State */}
        {submitted ? (
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
                  px: 4,
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
              {/* Order Summary Header */}
              {(displayPackage || displayAmount > 0) && (
                <Box
                  sx={{
                    p: { xs: 2.5, md: 3.5 },
                    background: 'linear-gradient(135deg, rgba(79,70,229,0.12), rgba(124,58,237,0.08))',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', mb: 0.5 }}
                      >
                        ORDER SUMMARY
                      </Typography>
                      <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                        {displayPackage}
                      </Typography>
                      {displayTier && (
                        <Chip
                          label={displayTier.replace('package_', 'Tier ')}
                          size="small"
                          sx={{
                            mt: 0.5,
                            background: 'rgba(79,70,229,0.2)',
                            color: '#a5b4fc',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: 22,
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}
                      >
                        AMOUNT
                      </Typography>
                      <Typography
                        sx={{
                          color: '#10b981',
                          fontWeight: 800,
                          fontSize: '1.8rem',
                          lineHeight: 1,
                        }}
                      >
                        ₹{displayAmount.toLocaleString('en-IN')}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* QR Code Section */}
              <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 3,
                  }}
                >
                  <QrCodeIcon sx={{ color: '#818cf8', fontSize: 22 }} />
                  <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
                    Scan QR Code to Pay
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 3,
                    alignItems: { xs: 'center', md: 'flex-start' },
                  }}
                >
                  {/* QR Image */}
                  <Box
                    sx={{
                      flexShrink: 0,
                      width: { xs: 220, md: 240 },
                      height: { xs: 220, md: 240 },
                      borderRadius: '16px',
                      overflow: 'hidden',
                      background: '#fff',
                      p: 1.5,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                      border: '2px solid rgba(79,70,229,0.3)',
                      position: 'relative',
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
                          borderRadius: '8px',
                        }}
                      />
                    ) : (
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height="100%"
                        sx={{ borderRadius: '8px' }}
                      />
                    )}
                  </Box>

                  {/* Payment Info */}
                  <Box sx={{ flex: 1, width: '100%' }}>
                    {/* UPI VPA */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255,255,255,0.4)',
                          fontSize: '0.7rem',
                          letterSpacing: '0.5px',
                          mb: 0.5,
                        }}
                      >
                        UPI ID (TAP TO COPY)
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography
                          sx={{
                            color: '#a5b4fc',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            fontSize: { xs: '0.85rem', md: '1rem' },
                            wordBreak: 'break-all',
                          }}
                        >
                          {displayVpa}
                        </Typography>
                        <Tooltip title={copied ? 'Copied!' : 'Copy UPI ID'}>
                          <IconButton
                            onClick={copyVpa}
                            size="small"
                            sx={{
                              color: copied ? '#10b981' : 'rgba(255,255,255,0.5)',
                              ml: 1,
                              flexShrink: 0,
                            }}
                          >
                            {copied ? (
                              <CheckCircleIcon fontSize="small" />
                            ) : (
                              <CopyIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Merchant Name */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255,255,255,0.4)',
                          fontSize: '0.7rem',
                          letterSpacing: '0.5px',
                          mb: 0.5,
                        }}
                      >
                        PAY TO
                      </Typography>
                      <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                        {merchant?.name || 'AITAG Services'}
                      </Typography>
                    </Box>

                    {/* Pay via App Button (Mobile) */}
                    <Button
                      id="upi-intent-button"
                      variant="contained"
                      fullWidth
                      startIcon={<PhoneIcon />}
                      onClick={handleUpiIntent}
                      sx={{
                        py: 1.5,
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        boxShadow: '0 8px 24px rgba(79,70,229,0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4338ca, #6d28d9)',
                          boxShadow: '0 12px 32px rgba(79,70,229,0.4)',
                        },
                      }}
                    >
                      Pay ₹{displayAmount.toLocaleString('en-IN')} via UPI App
                    </Button>

                    {/* Accepted Apps */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 1.5,
                        mt: 1.5,
                        flexWrap: 'wrap',
                      }}
                    >
                      {['GPay', 'PhonePe', 'Paytm', 'BHIM', 'Any UPI'].map((app) => (
                        <Chip
                          key={app}
                          label={app}
                          size="small"
                          sx={{
                            background: 'rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '0.7rem',
                            height: 24,
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>

                <Divider
                  sx={{ my: 3, borderColor: 'rgba(255,255,255,0.06)' }}
                />

                {/* UTR Submission Form */}
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      mb: 2.5,
                    }}
                  >
                    <ReceiptIcon sx={{ color: '#818cf8', fontSize: 22 }} />
                    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
                      After Payment — Submit Reference
                    </Typography>
                  </Box>

                  <Alert
                    severity="info"
                    icon={<WalletIcon />}
                    sx={{
                      mb: 2.5,
                      background: 'rgba(79,70,229,0.08)',
                      border: '1px solid rgba(79,70,229,0.15)',
                      color: 'rgba(255,255,255,0.7)',
                      borderRadius: '12px',
                      '& .MuiAlert-icon': { color: '#818cf8' },
                    }}
                  >
                    After completing your UPI payment, enter the{' '}
                    <strong>UTR / Transaction Reference Number</strong> from your payment app
                    confirmation screen.
                  </Alert>

                  {error && (
                    <Alert
                      severity="error"
                      sx={{
                        mb: 2,
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.15)',
                        color: '#fca5a5',
                        borderRadius: '12px',
                      }}
                      onClose={() => setError('')}
                    >
                      {error}
                    </Alert>
                  )}

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <TextField
                        id="customer-name-input"
                        label="Your Name"
                        placeholder="Mohammed Maqsood"
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
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        fullWidth
                        required
                        sx={textFieldStyles}
                      />
                    </Box>
                    <TextField
                      id="customer-phone-input"
                      label="Phone Number (Optional)"
                      placeholder="+91 98765 43210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      fullWidth
                      sx={textFieldStyles}
                    />
                    <TextField
                      id="utr-reference-input"
                      label="UTR / Transaction Reference Number"
                      placeholder="e.g. 123456789012 or AXXXXXXXXXXX"
                      value={utrReference}
                      onChange={(e) => setUtrReference(e.target.value)}
                      fullWidth
                      required
                      sx={textFieldStyles}
                      helperText="Find this in your UPI app's payment confirmation screen"
                      FormHelperTextProps={{
                        sx: { color: 'rgba(255,255,255,0.3)', ml: 0 },
                      }}
                    />

                    <Button
                      id="submit-payment-button"
                      variant="contained"
                      fullWidth
                      size="large"
                      startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <VerifiedIcon />}
                      onClick={handleSubmitPayment}
                      disabled={submitting || !utrReference.trim() || !customerName.trim() || !customerEmail.trim()}
                      sx={{
                        py: 1.8,
                        mt: 1,
                        background: submitting
                          ? 'rgba(79,70,229,0.4)'
                          : 'linear-gradient(135deg, #10b981, #059669)',
                        borderRadius: '14px',
                        fontWeight: 800,
                        fontSize: '1rem',
                        letterSpacing: '0.3px',
                        boxShadow: '0 8px 24px rgba(16,185,129,0.25)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #059669, #047857)',
                          boxShadow: '0 12px 32px rgba(16,185,129,0.35)',
                          transform: 'translateY(-1px)',
                        },
                        '&.Mui-disabled': {
                          background: 'rgba(255,255,255,0.06)',
                          color: 'rgba(255,255,255,0.25)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      {submitting ? 'Submitting...' : 'Confirm Payment'}
                    </Button>
                  </Box>
                </Box>
              </Box>

              {/* Security Footer */}
              <Box
                sx={{
                  p: 2.5,
                  background: 'rgba(255,255,255,0.02)',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: { xs: 2, md: 4 },
                  flexWrap: 'wrap',
                }}
              >
                {[
                  { icon: <ShieldIcon sx={{ fontSize: 16 }} />, text: 'End-to-End Encrypted' },
                  { icon: <VerifiedIcon sx={{ fontSize: 16 }} />, text: 'RBI Regulated UPI' },
                  { icon: <TimerIcon sx={{ fontSize: 16 }} />, text: 'Instant Confirmation' },
                ].map(({ icon, text }) => (
                  <Box
                    key={text}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      color: 'rgba(255,255,255,0.3)',
                      fontSize: '0.72rem',
                    }}
                  >
                    {icon}
                    <Typography sx={{ fontSize: '0.72rem', color: 'inherit' }}>{text}</Typography>
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

// Shared TextField styles for dark theme
const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    color: '#fff',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.04)',
    '& fieldset': {
      borderColor: 'rgba(255,255,255,0.1)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(79,70,229,0.4)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#4f46e5',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255,255,255,0.4)',
    '&.Mui-focused': { color: '#818cf8' },
  },
  '& .MuiInputBase-input::placeholder': {
    color: 'rgba(255,255,255,0.2)',
  },
};
