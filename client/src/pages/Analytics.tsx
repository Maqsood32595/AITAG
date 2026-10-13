import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Paper, Chip, CircularProgress,
  Button, Divider, Stack, Alert, Tabs, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, LinearProgress,
  TextField, InputAdornment, Tooltip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import SecurityIcon from '@mui/icons-material/Security';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShieldIcon from '@mui/icons-material/Shield';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { analyticsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { AnimatedAvatar } from '../components/AnimatedAvatar';

export const Analytics: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [ledgerSearch, setLedgerSearch] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await analyticsApi.getMyAnalytics();
      setAnalyticsData(res.data);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setError(err.response?.data?.error || 'Unable to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="70vh" gap={2}>
          <CircularProgress sx={{ color: '#4f46e5' }} />
          <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.95rem' }}>
            Compiling real-time performance analytics & account dossier...
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  const role = user?.role || 'client';
  const analytics = analyticsData?.analytics || {};
  const dossier = analyticsData?.dossier || {};
  const summaryCards = analytics.summaryCards || [];
  const categories = analytics.categories || [];
  const funnel = analytics.funnel || {};
  const ledger = dossier.ledger || [];

  const filteredLedger = ledger.filter((item: any) => {
    const q = ledgerSearch.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      (item.status && item.status.toLowerCase().includes(q)) ||
      (item.recordType && item.recordType.toLowerCase().includes(q)) ||
      (item.counterparty && item.counterparty.toLowerCase().includes(q))
    );
  });

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        {/* Top Header Banner */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: '24px',
            mb: 4,
            background: 'linear-gradient(135deg, rgba(79,70,229,0.1) 0%, rgba(8,145,178,0.08) 100%)',
            border: '1px solid rgba(79,70,229,0.15)',
            boxShadow: '0 8px 32px rgba(79,70,229,0.04)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2.5
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <AnimatedAvatar
                name={user?.name || user?.email}
                size={68}
                src={user?.photo_url}
              />
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
                    {user?.name || 'User'}
                  </Typography>
                  <Chip
                    label={role === 'admin' ? 'Master Admin' : role === 'freelancer' ? 'AI Talent Specialist' : 'Business Client'}
                    size="small"
                    sx={{
                      bgcolor: role === 'admin' ? '#ede9fe' : role === 'freelancer' ? '#ecfdf5' : '#eff6ff',
                      color: role === 'admin' ? '#6d28d9' : role === 'freelancer' ? '#047857' : '#1d4ed8',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      textTransform: 'uppercase'
                    }}
                  />
                </Stack>
                <Typography sx={{ color: '#64748b', fontSize: '0.875rem', mt: 0.25 }}>
                  {user?.email} • Member ID: <code>{dossier.identity?.id?.slice(0, 13)}...</code>
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={fetchAnalytics}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, color: '#475569' }}
              >
                Refresh Data
              </Button>
              <Button
                component={Link}
                to="/account"
                variant="contained"
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                  borderRadius: '10px',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 2.5
                }}
              >
                Account Dossier
              </Button>
            </Stack>
          </Box>

          {/* Navigation Tabs */}
          <Divider sx={{ my: 3, borderColor: 'rgba(79,70,229,0.12)' }} />
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{
              minHeight: 44,
              '& .MuiTab-root': {
                minHeight: 44,
                py: 1,
                fontWeight: 800,
                fontSize: '0.925rem',
                textTransform: 'none',
                color: '#64748b',
                mr: 3,
                '&.Mui-selected': { color: '#4f46e5' }
              },
              '& .MuiTabs-indicator': { bgcolor: '#4f46e5', height: 3, borderRadius: 2 }
            }}
          >
            <Tab icon={<TrendingUpIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Performance & Financial Analytics" />
            <Tab
              icon={<AccountCircleIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label="Lifetime Activity Ledger"
            />
          </Tabs>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: ROLE-AWARE PERFORMANCE & FINANCIAL ANALYTICS */}
        {/* ========================================================================= */}
        {activeTab === 0 && (
          <Box>
            {/* 4 Summary Stat Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {summaryCards.map((card: any) => (
                <Grid item xs={12} sm={6} md={3} key={card.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: '18px',
                      bgcolor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease',
                      '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 10px 25px rgba(79,70,229,0.08)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Typography sx={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 600 }}>
                        {card.label}
                      </Typography>
                      {card.trend && (
                        <Chip
                          label={card.trend}
                          size="small"
                          sx={{
                            bgcolor: card.bg,
                            color: card.color,
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            height: 22
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: '2rem',
                        color: card.color,
                        lineHeight: 1.1,
                        fontFamily: 'Inter, sans-serif',
                        mb: 1
                      }}
                    >
                      {card.value}
                    </Typography>
                    <Typography sx={{ fontSize: '0.775rem', color: '#94a3b8', lineHeight: 1.4 }}>
                      {card.subtitle}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Middle Row: Lifecycle Funnel & Category Distribution */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Left: Project Lifecycle Funnel */}
              <Grid item xs={12} md={7}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3.5,
                    borderRadius: '20px',
                    bgcolor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    height: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                        {role === 'admin' ? 'Platform Order Fulfillment Pipeline' : 'Project Lifecycle Pipeline'}
                      </Typography>
                      <Typography sx={{ color: '#64748b', fontSize: '0.825rem' }}>
                        Real-time status tracking through our 5 milestone verification stages
                      </Typography>
                    </Box>
                    <Chip label="Milestone Escrow" size="small" sx={{ bgcolor: '#ecfeff', color: '#0891b2', fontWeight: 700, fontSize: '0.7rem' }} />
                  </Box>
                  <Divider sx={{ mb: 3 }} />

                  <Stack spacing={2.5}>
                    {[
                      { key: 'REQUESTED', label: '1. Brief Requested & Matching', count: funnel.REQUESTED || 0, color: '#f59e0b' },
                      { key: 'MATCHED', label: '2. Specialist Matched & Scope Locked', count: funnel.MATCHED || 0, color: '#6366f1' },
                      { key: 'ACTIVE', label: '3. Active & Production in Progress', count: funnel.ACTIVE || 0, color: '#10b981' },
                      { key: 'DRAFT_SUBMITTED', label: '4. Draft Deliverables Under Review', count: funnel.DRAFT_SUBMITTED || 0, color: '#8b5cf6' },
                      { key: 'COMPLETED', label: '5. Approved & Completed Outcome', count: funnel.COMPLETED || 0, color: '#059669' },
                    ].map((step) => {
                      const total = Object.values(funnel).reduce((a: number, b: any) => a + Number(b), 0) || 1;
                      const percent = Math.round((step.count / Number(total)) * 100);
                      return (
                        <Box key={step.key}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                              {step.label}
                            </Typography>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: step.color }}>
                              {step.count} {step.count === 1 ? 'Order' : 'Orders'} ({percent}%)
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.max(6, percent)}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: '#f1f5f9',
                              '& .MuiLinearProgress-bar': { bgcolor: step.color, borderRadius: 4 }
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                </Paper>
              </Grid>

              {/* Right: Domain Category Distribution */}
              <Grid item xs={12} md={5}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3.5,
                    borderRadius: '20px',
                    bgcolor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    height: '100%'
                  }}
                >
                  <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', mb: 0.5 }}>
                    Domain Category Breakdown
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.825rem', mb: 2.5 }}>
                    Distribution across our 4 launch outcome categories
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Stack spacing={2.5}>
                    {categories.map((c: any) => (
                      <Box key={c.category}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                            {c.category}
                          </Typography>
                          <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                            {c.count} items {c.spend ? `• ₹${c.spend.toLocaleString('en-IN')}` : c.earnings ? `• ₹${c.earnings.toLocaleString('en-IN')}` : ''}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={c.percentage || (c.count > 0 ? 25 : 5)}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: '#f1f5f9',
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(90deg, #4f46e5, #0891b2)',
                              borderRadius: 4
                            }
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>

            {/* Bottom Row: Trust, Safeguards & Testimonials */}
            {role === 'admin' ? (
              <Paper elevation={0} sx={{ p: 3.5, borderRadius: '20px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <ShieldIcon sx={{ color: '#10b981' }} />
                  <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                    AITAG Platform Regulatory & Compliance Safeguards
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  {Object.entries(analytics.systemHealth || {}).map(([key, val]: any) => (
                    <Grid item xs={12} sm={6} md={3} key={key}>
                      <Box sx={{ p: 2, bgcolor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                          {key.replace(/([A-Z])/g, ' $1')}
                        </Typography>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', mt: 0.5 }}>
                          {val}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            ) : role === 'freelancer' && analytics.testimonials?.length > 0 ? (
              <Paper elevation={0} sx={{ p: 3.5, borderRadius: '20px', bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', mb: 2 }}>
                  Recent Client Testimonials & Reviews
                </Typography>
                <Stack spacing={2}>
                  {analytics.testimonials.map((t: any, idx: number) => (
                    <Box key={idx} sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <StarIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#166534' }}>
                          {t.rating}/5 Rating from {t.client} (Order {t.orderNumber})
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontSize: '0.85rem', color: '#15803d', fontStyle: 'italic' }}>
                        "{t.text}"
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            ) : null}
          </Box>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LIFETIME ACTIVITY LEDGER */}
        {/* ========================================================================= */}
        {activeTab === 1 && (
          <Box>

            {/* Lifetime Chronological Activity Ledger */}
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                borderRadius: '20px',
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                mb: 4
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                    Lifetime Chronological Activity Ledger ({dossier.totalHistoricalRecords || ledger.length})
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.825rem' }}>
                    Every task created, proposal submitted, pilot package ordered, and milestone delivered
                  </Typography>
                </Box>
                <TextField
                  size="small"
                  placeholder="Filter records..."
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{ width: { xs: '100%', sm: 260 } }}
                />
              </Box>

              <TableContainer sx={{ borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>Record Type</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>Title / Project</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>Counterparty / Specialist</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredLedger.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#94a3b8' }}>
                          No activity records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLedger.map((item: any, idx: number) => {
                        const isCompleted = item.status === 'COMPLETED';
                        const isActive = item.status === 'ACTIVE';
                        return (
                          <TableRow key={idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell sx={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                              {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={item.recordType}
                                size="small"
                                sx={{
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  bgcolor: item.recordType.includes('Order') ? '#ede9fe' : item.recordType.includes('Proposal') ? '#e0f2fe' : '#f1f5f9',
                                  color: item.recordType.includes('Order') ? '#6d28d9' : item.recordType.includes('Proposal') ? '#0369a1' : '#334155'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                                {item.title}
                              </Typography>
                              <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                {item.subtitle}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.825rem', color: '#475569' }}>
                              {item.counterparty}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>
                              {item.amount}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={item.status}
                                size="small"
                                sx={{
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  bgcolor: isCompleted ? '#ecfdf5' : isActive ? '#dcfce7' : '#fef3c7',
                                  color: isCompleted ? '#047857' : isActive ? '#15803d' : '#b45309',
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}
      </Container>
    </DashboardLayout>
  );
};

export default Analytics;
