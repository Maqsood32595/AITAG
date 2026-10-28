import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Chip, Paper, Grid,
  CircularProgress, Alert, Divider, Card, CardContent, Stack, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment, Rating, Tooltip
} from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import GavelIcon from '@mui/icons-material/Gavel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ForumIcon from '@mui/icons-material/Forum';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VerifiedIcon from '@mui/icons-material/Verified';
import Navbar from '../components/Navbar';
import AnimatedAvatar from '../components/AnimatedAvatar';
import { tasksApi, bidsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { TaskAssetsModal } from '../components/TaskAssetsModal';
import { CaseDiscussionModal } from '../components/CaseDiscussionModal';

const TaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [hasBid, setHasBid] = useState(false);
  const [myBid, setMyBid] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [acceptingBidId, setAcceptingBidId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Proposal Modal State
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [bidAmountInput, setBidAmountInput] = useState<string>('');
  const [deliveryDaysInput, setDeliveryDaysInput] = useState<number>(3);
  const [pitchInput, setPitchInput] = useState<string>('');

  // Deliverables Modal State (Specialist)
  const [deliverModalOpen, setDeliverModalOpen] = useState(false);
  const [deliverFilesInput, setDeliverFilesInput] = useState('');
  const [completionNotesInput, setCompletionNotesInput] = useState('');
  const [delivering, setDelivering] = useState(false);

  // Revision Modal State (Client)
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionNotesInput, setRevisionNotesInput] = useState('');
  const [requestingRevision, setRequestingRevision] = useState(false);

  // Approval Modal State (Client)
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [approving, setApproving] = useState(false);

  // Escrow UPI Payment Modal State (Client)
  const [escrowModalOpen, setEscrowModalOpen] = useState(false);
  const [merchant, setMerchant] = useState<any>(null);
  const [utrInput, setUtrInput] = useState('');
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [copiedVpa, setCopiedVpa] = useState(false);

  // Modals
  const [assetsModalOpen, setAssetsModalOpen] = useState(false);
  const [discussionModalOpen, setDiscussionModalOpen] = useState(false);

  const fetchTaskAndBids = async () => {
    try {
      const taskRes = await tasksApi.getById(id!);
      setTask(taskRes.data);
      if (user && taskRes.data.user_email === user.email) {
        const bidsRes = await bidsApi.getForTask(id!);
        setBids(bidsRes.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskAndBids();
    if (user && id) {
      bidsApi.checkBid(id).then(res => {
        setHasBid(res.data.hasBid);
        if (res.data.bid) {
          setMyBid(res.data.bid);
          setBidAmountInput(String(res.data.bid.bid_amount || ''));
          setDeliveryDaysInput(res.data.bid.delivery_days || 3);
          setPitchInput(res.data.bid.proposal_pitch || '');
        }
      }).catch(() => {});
    }
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
  }, [id, user]);

  const handleCopyVpa = () => {
    if (merchant?.vpa) {
      navigator.clipboard.writeText(merchant.vpa);
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2000);
    }
  };

  const handleConfirmEscrowPayment = async (amountToPay: number) => {
    if (!utrInput || utrInput.trim().length < 6) {
      setMessage({ type: 'error', text: 'Please enter a valid 12-digit UPI UTR / Transaction Reference' });
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
          customer_email: user?.email || task?.user_email || 'client@aitag.com',
          customer_name: user?.name || task?.user_name || 'Client',
          amount: amountToPay,
          payment_method: 'upi',
          utr_reference: utrInput.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setEscrowModalOpen(false);
        setMessage({
          type: 'success',
          text: `Escrow funded successfully! ₹${amountToPay.toLocaleString()} is now safely locked in escrow.`
        });
        await fetchTaskAndBids();
      } else {
        setMessage({ type: 'error', text: data.error || 'Payment submission failed' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Payment submission failed' });
    } finally {
      setPaySubmitting(false);
    }
  };

  const handleOpenBidModal = () => {
    if (!user) return navigate('/signin');
    if (!bidAmountInput && task) {
      setBidAmountInput(String(task.budget));
    }
    setBidModalOpen(true);
  };

  const handleProposalSubmit = async () => {
    if (!bidAmountInput || Number(bidAmountInput) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid bid amount' });
      return;
    }
    setBidding(true);
    try {
      const res = await bidsApi.place(id!, {
        bid_amount: Number(bidAmountInput),
        delivery_days: Number(deliveryDaysInput) || 3,
        proposal_pitch: pitchInput.trim()
      });
      setHasBid(true);
      setMyBid(res.data.bid);
      setBidModalOpen(false);
      if (!hasBid) {
        setTask((t: any) => ({ ...t, total_bids: (t.total_bids || 0) + 1 }));
      }
      setMessage({
        type: 'success',
        text: res.data.updated
          ? 'Your proposal has been updated successfully! ✨'
          : 'Your proposal of ₹' + Number(bidAmountInput).toLocaleString() + ' has been placed successfully! 🎉'
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to place proposal' });
    } finally {
      setBidding(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    setAcceptingBidId(bidId);
    try {
      const res = await bidsApi.accept(bidId);
      setMessage({
        type: 'success',
        text: `Bid accepted! Escrow secured: Gross ₹${res.data.escrow?.grossAmount?.toLocaleString()} (1% TDS: ₹${res.data.escrow?.section194OTDS})`
      });
      await fetchTaskAndBids();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to accept bid' });
    } finally {
      setAcceptingBidId(null);
    }
  };

  const handleSubmitDeliverables = async () => {
    setDelivering(true);
    try {
      const fileUrls = deliverFilesInput.split('\n').map(s => s.trim()).filter(Boolean);
      await tasksApi.submitDeliverables(id!, {
        files: fileUrls,
        completionNotes: completionNotesInput.trim()
      });
      setDeliverModalOpen(false);
      setMessage({ type: 'success', text: 'Deliverables submitted for client inspection! 🚀' });
      await fetchTaskAndBids();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to submit deliverables' });
    } finally {
      setDelivering(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNotesInput.trim()) {
      setMessage({ type: 'error', text: 'Please specify revision feedback notes' });
      return;
    }
    setRequestingRevision(true);
    try {
      await tasksApi.requestRevision(id!, { revisionNotes: revisionNotesInput.trim() });
      setRevisionModalOpen(false);
      setMessage({ type: 'success', text: 'Revision request sent to specialist! 🔄' });
      await fetchTaskAndBids();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to request revision' });
    } finally {
      setRequestingRevision(false);
    }
  };

  const handleApproveWork = async () => {
    setApproving(true);
    try {
      const res = await tasksApi.approve(id!, { rating: ratingInput, feedback: feedbackInput.trim() });
      setApproveModalOpen(false);
      const payout = res.data?.payout;
      setMessage({
        type: 'success',
        text: `Work approved! Escrow released. Specialist Net Payout: ₹${payout?.netSpecialistPayout?.toLocaleString()} (1% TDS Withheld: ₹${payout?.section194OTDS}) 🎉`
      });
      await fetchTaskAndBids();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to approve work' });
    } finally {
      setApproving(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress sx={{ color: '#4f46e5' }} /></Box>;
  if (!task) return <Box sx={{ pt: 14, textAlign: 'center' }}><Typography>Task not found.</Typography></Box>;

  const isOwner = user?.email === task.user_email;
  const isAssignedOrAccepted = (myBid && myBid.status === 'accepted') || (user && task.assigned_expert_email === user.email);
  const deadlinePassed = new Date() > new Date(task.deadline);
  const normalizedStatus = (task.status || 'open').toLowerCase().replace('_', '-');

  // Find accepted bid if any
  const acceptedBid = bids.find(b => b.status === 'accepted') || (myBid?.status === 'accepted' ? myBid : null);
  const contractAmount = Number(task.agreed_price || acceptedBid?.bid_amount || task.budget) || 1000;
  const contractPlatformFee = Number((contractAmount * 0.10).toFixed(2));
  const contractTds = Number((contractAmount * 0.01).toFixed(2));
  const contractNetPayout = Number((contractAmount - (contractPlatformFee + contractTds)).toFixed(2));

  // Real-time calculation for Proposal Modal
  const inputAmount = Number(bidAmountInput) || 0;
  const modalPlatformFee = Number((inputAmount * 0.10).toFixed(2));
  const modalTds = Number((inputAmount * 0.01).toFixed(2));
  const modalNetPayout = Number((inputAmount - (modalPlatformFee + modalTds)).toFixed(2));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ pt: 12, pb: 6 }}>
        <Box component="img" src={task.image} alt={task.title} sx={{ width: '100%', height: 320, objectFit: 'cover', borderRadius: '20px', mb: 4 }} />

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip label={task.category} sx={{ bgcolor: 'rgba(79,70,229,0.08)', color: '#4f46e5', fontWeight: 700 }} />
              <Chip
                label={`Status: ${normalizedStatus}`}
                sx={{
                  bgcolor: normalizedStatus === 'completed' ? 'rgba(16,185,129,0.1)' : normalizedStatus === 'draft-submitted' ? 'rgba(234,179,8,0.1)' : 'rgba(79,70,229,0.1)',
                  color: normalizedStatus === 'completed' ? '#10b981' : normalizedStatus === 'draft-submitted' ? '#ca8a04' : '#4f46e5',
                  fontWeight: 700, textTransform: 'capitalize'
                }}
              />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, fontFamily: 'Inter, sans-serif', letterSpacing: '-1px' }}>{task.title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <AnimatedAvatar name={task.user_name} size={28} />
              <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>Posted by <strong>{task.user_name}</strong></Typography>
            </Box>

            <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(79,70,229,0.08)', mb: 3 }}>
              <Typography sx={{ fontWeight: 700, mb: 1.5, color: '#0f172a' }}>Task Description</Typography>
              <Typography sx={{ color: '#475569', lineHeight: 1.8 }}>{task.description}</Typography>
            </Paper>

            {/* Attached Project Assets Card */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(79,70,229,0.08)', mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>
                    Project Assets & Materials ({(task.attachments || []).length})
                  </Typography>
                </Box>
                {isOwner && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AttachFileIcon sx={{ fontSize: 16 }} />}
                    onClick={() => setAssetsModalOpen(true)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: '8px',
                      color: '#4f46e5',
                      borderColor: 'rgba(79, 70, 229, 0.3)',
                      fontSize: '0.78rem'
                    }}
                  >
                    + Upload / Manage Assets
                  </Button>
                )}
              </Box>

              {(!task.attachments || task.attachments.length === 0) ? (
                <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  No reference files or assets attached yet. {isOwner && 'Click above to upload product cutouts, briefs, or brand guidelines.'}
                </Typography>
              ) : (
                <Grid container spacing={1.5}>
                  {task.attachments.map((asset: any) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={asset.id || asset.url}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          bgcolor: '#ffffff',
                          '&:hover': { borderColor: '#cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                          <InsertDriveFileIcon sx={{ color: '#4f46e5', fontSize: 24 }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography noWrap sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                              {asset.name}
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                              {asset.size ? `${Math.round(asset.size / 1024)} KB` : 'Asset'}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          component="a"
                          href={asset.url}
                          target="_blank"
                          download={asset.name}
                          size="small"
                          sx={{ color: '#4f46e5' }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>

            {message && <Alert severity={message.type} sx={{ borderRadius: '12px', mb: 3 }}>{message.text}</Alert>}

            {/* UNIFIED WORKROOM: Deliverables & Inspection Lifecycle */}
            {(normalizedStatus === 'draft-submitted' || normalizedStatus === 'in-progress' || normalizedStatus === 'revision' || normalizedStatus === 'completed') && (
              <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #10b981', bgcolor: 'rgba(16,185,129,0.02)', mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    📦 Deliverables & Escrow Handover
                  </Typography>
                  <Chip
                    icon={<SecurityIcon sx={{ fontSize: '14px !important' }} />}
                    label={normalizedStatus === 'completed' ? 'Escrow Disbursed' : 'Escrow Secured'}
                    size="small"
                    sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700 }}
                  />
                </Box>

                {/* Submitted Deliverables List */}
                {task.draft_deliverables && task.draft_deliverables.length > 0 ? (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 1 }}>
                      Submitted Files & Links:
                    </Typography>
                    {task.draft_deliverables.map((item: string, i: number) => (
                      <Paper key={i} elevation={0} sx={{ p: 1.5, mb: 1, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#0f172a' }}>
                          🔗 <a href={item} target="_blank" rel="noreferrer" style={{ color: '#4f46e5', textDecoration: 'none' }}>{item}</a>
                        </Typography>
                      </Paper>
                    ))}
                    {task.deliverable_notes && (
                      <Typography variant="body2" sx={{ mt: 1, color: '#475569', fontStyle: 'italic' }}>
                        Note: "{task.deliverable_notes}"
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                    Contract is active. Specialist is currently executing deliverables under escrow protection.
                  </Typography>
                )}

                  {/* Client Escrow Funding Action (If contract accepted but escrow not funded) */}
                  {isOwner && !task.escrow_funded && normalizedStatus !== 'completed' && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 2,
                        width: '100%',
                        borderRadius: '12px',
                        bgcolor: 'rgba(79, 70, 229, 0.05)',
                        border: '1px dashed rgba(79, 70, 229, 0.4)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          Contract Accepted • Agreed Rate: ₹{contractAmount.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                          Fund the milestone escrow so the specialist has the verified green light to execute.
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<CurrencyRupeeIcon />}
                        onClick={() => setEscrowModalOpen(true)}
                        sx={{
                          background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                          fontWeight: 800,
                          borderRadius: '10px',
                          textTransform: 'none',
                          boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
                        }}
                      >
                        Fund Escrow (₹{contractAmount.toLocaleString()})
                      </Button>
                    </Paper>
                  )}

                  {/* Action Buttons for Specialist vs Client */}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                    {/* Specialist Action: Submit Work */}
                    {isAssignedOrAccepted && normalizedStatus !== 'completed' && (
                      <Button
                        variant="contained"
                        startIcon={<CloudUploadIcon />}
                      onClick={() => setDeliverModalOpen(true)}
                      sx={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        fontWeight: 700,
                        borderRadius: '10px',
                        textTransform: 'none'
                      }}
                    >
                      {normalizedStatus === 'draft-submitted' ? 'Resubmit Deliverables' : 'Submit Deliverables / Work'}
                    </Button>
                  )}

                  {/* Client Action: Review & Approve */}
                  {isOwner && normalizedStatus === 'draft-submitted' && (
                    <>
                      <Button
                        variant="outlined"
                        onClick={() => setRevisionModalOpen(true)}
                        sx={{
                          borderRadius: '10px',
                          color: '#ca8a04',
                          borderColor: '#eab308',
                          fontWeight: 700,
                          textTransform: 'none'
                        }}
                      >
                        Request Revision
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<VerifiedIcon />}
                        onClick={() => setApproveModalOpen(true)}
                        sx={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          fontWeight: 700,
                          borderRadius: '10px',
                          textTransform: 'none'
                        }}
                      >
                        Approve Work & Release Payout
                      </Button>
                    </>
                  )}

                  {/* Completed Badge & Payout Receipt */}
                  {normalizedStatus === 'completed' && (
                    <Box sx={{ p: 2, bgcolor: '#ffffff', borderRadius: '12px', border: '1px solid #10b981', width: '100%' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#10b981' }}>
                        ✅ Contract Completed & Escrow Released
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                        Platform Fee: 10% • Sec 194-O TDS: 1% Withheld • Net Specialist Disbursal: 89%
                      </Typography>
                      {task.client_rating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Rating value={task.client_rating} readOnly size="small" />
                          <Typography variant="caption" sx={{ color: '#475569' }}>
                            "{task.client_feedback || 'Excellent delivery!'}"
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </Paper>
            )}

            {/* Owner Proposals & Bids Section */}
            {isOwner && (
              <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(79,70,229,0.12)', mb: 3, bgcolor: '#ffffff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Proposals & Bids ({bids.length})
                  </Typography>
                  <Chip icon={<SecurityIcon sx={{ fontSize: '14px !important' }} />} label="Escrow Protected" size="small" sx={{ bgcolor: 'rgba(16,185,129,0.08)', color: '#10b981', fontWeight: 600 }} />
                </Box>
                <Divider sx={{ mb: 2.5 }} />

                {bids.length === 0 ? (
                  <Typography sx={{ color: '#94a3b8', py: 2, textAlign: 'center' }}>No proposals received yet.</Typography>
                ) : (
                  <Stack spacing={2}>
                    {bids.map((b) => (
                      <Card key={b.id} variant="outlined" sx={{ borderRadius: '12px', borderColor: b.status === 'accepted' ? '#10b981' : '#e2e8f0', bgcolor: b.status === 'accepted' ? 'rgba(16,185,129,0.03)' : '#ffffff' }}>
                        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <AnimatedAvatar name={b.user_name || 'User'} size={40} />
                              <Box>
                                <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>{b.user_name}</Typography>
                                <Typography sx={{ color: '#64748b', fontSize: '0.8rem' }}>{b.user_email}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                                  <Typography sx={{ fontWeight: 800, color: '#10b981', fontSize: '0.95rem' }}>
                                    Bid: ₹{Number(b.bid_amount || task.budget).toLocaleString()}
                                  </Typography>
                                  <Typography sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                                    • {b.delivery_days || 3} days delivery
                                  </Typography>
                                </Box>
                                {b.proposal_pitch && (
                                  <Typography sx={{ color: '#334155', fontSize: '0.85rem', mt: 1, p: 1, bgcolor: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #4f46e5' }}>
                                    "{b.proposal_pitch}"
                                  </Typography>
                                )}
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Chip
                                label={b.status.toUpperCase()}
                                size="small"
                                sx={{
                                  bgcolor: b.status === 'accepted' ? 'rgba(16,185,129,0.1)' : b.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
                                  color: b.status === 'accepted' ? '#10b981' : b.status === 'rejected' ? '#ef4444' : '#ca8a04',
                                  fontWeight: 700
                                }}
                              />
                              {b.status === 'pending' && task.status === 'open' && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleAcceptBid(b.id)}
                                  disabled={acceptingBidId === b.id}
                                  startIcon={<CheckCircleIcon />}
                                  sx={{
                                    bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' },
                                    fontWeight: 700, borderRadius: '8px', textTransform: 'none'
                                  }}
                                >
                                  {acceptingBidId === b.id ? 'Accept & Hire' : 'Accept & Hire'}
                                </Button>
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Paper>
            )}

            {/* Active Proposal Action Button for Specialist */}
            {!isOwner && !deadlinePassed && normalizedStatus === 'open' && (
              <Box sx={{ mt: 2 }}>
                {hasBid ? (
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          Your Proposal: ₹{Number(myBid?.bid_amount || task.budget).toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.3 }}>
                        Status: Pending Client Review • {myBid?.delivery_days || 3} days delivery
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={handleOpenBidModal}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: '10px',
                        borderColor: '#10b981',
                        color: '#059669',
                        '&:hover': { bgcolor: 'rgba(16,185,129,0.1)', borderColor: '#059669' }
                      }}
                    >
                      Update Bid Price / Pitch
                    </Button>
                  </Paper>
                ) : (
                  <Button
                    onClick={handleOpenBidModal}
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={bidding}
                    startIcon={<GavelIcon />}
                    sx={{
                      background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                      fontWeight: 700,
                      borderRadius: '14px',
                      py: 2,
                      fontSize: '1rem',
                      boxShadow: '0 8px 24px rgba(79,70,229,0.3)',
                    }}
                  >
                    {bidding ? 'Submitting...' : 'Place Your Bid (Set Price)'}
                  </Button>
                )}
              </Box>
            )}
            {deadlinePassed && !isOwner && <Alert severity="warning" sx={{ borderRadius: '12px' }}>This task's deadline has passed.</Alert>}
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(79,70,229,0.08)', position: 'sticky', top: 90 }}>
              <Typography sx={{ fontWeight: 700, mb: 2.5, color: '#0f172a' }}>Task Overview</Typography>
              <Divider sx={{ mb: 2 }} />
              {[
                { icon: <CurrencyRupeeIcon sx={{ color: '#10b981' }} />, label: 'Budget', value: `₹${Number(task.budget).toLocaleString()}`, color: '#10b981' },
                { icon: <CalendarMonthIcon sx={{ color: '#4f46e5' }} />, label: 'Deadline', value: new Date(task.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), color: '#4f46e5' },
                { icon: <PeopleIcon sx={{ color: '#0891b2' }} />, label: 'Total Bids', value: task.total_bids || bids.length || 0, color: '#0891b2' },
              ].map(item => (
                <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: '10px', mb: 1, bgcolor: 'rgba(248,250,252,0.8)' }}>
                  {item.icon}
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.label}</Typography>
                    <Typography sx={{ fontWeight: 800, color: item.color, fontSize: '1.1rem' }}>{item.value}</Typography>
                  </Box>
                </Box>
              ))}

              {/* Direct Workroom Communication */}
              <Box sx={{ mt: 2.5 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ForumIcon />}
                  onClick={() => setDiscussionModalOpen(true)}
                  sx={{
                    py: 1.2,
                    borderRadius: '12px',
                    borderColor: 'rgba(79, 70, 229, 0.35)',
                    color: '#4f46e5',
                    bgcolor: 'rgba(79, 70, 229, 0.04)',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    '&:hover': {
                      bgcolor: 'rgba(79, 70, 229, 0.1)',
                      borderColor: '#4f46e5'
                    }
                  }}
                >
                  {isAssignedOrAccepted ? 'Open Workroom Chat' : 'Chat with Admin'}
                </Button>
              </Box>

              {/* Escrow Breakdown Card */}
              <Box sx={{ mt: 3, p: 2, borderRadius: '12px', bgcolor: 'rgba(79,70,229,0.04)', border: '1px dashed rgba(79,70,229,0.2)' }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5', mb: 1 }}>
                  🛡️ Section 194-O Escrow Breakdown
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', mb: 0.5 }}>
                  <span>Gross Escrow:</span>
                  <strong>₹{Number(task.budget).toLocaleString()}</strong>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', mb: 0.5 }}>
                  <span>10% Platform Fee:</span>
                  <strong>₹{(Number(task.budget) * 0.10).toLocaleString()}</strong>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', mb: 0.5 }}>
                  <span>1% TDS (Sec 194-O):</span>
                  <strong>₹{(Number(task.budget) * 0.01).toLocaleString()}</strong>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>
                  <span>Net Payout:</span>
                  <span>₹{(Number(task.budget) * 0.89).toLocaleString()}</span>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Phase 1: Interactive Bid Proposal Modal */}
        <Dialog
          open={bidModalOpen}
          onClose={() => setBidModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', pb: 1 }}>
            {hasBid ? '✏️ Update Your Proposal' : '🎯 Submit Your Proposal'}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5 }}>
              Client's Estimated Budget: <strong>₹{Number(task.budget).toLocaleString()}</strong>. You can bid your desired rate.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Your Bid Price *"
                type="number"
                fullWidth
                value={bidAmountInput}
                onChange={(e) => setBidAmountInput(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                sx={fieldStyle}
              />

              <TextField
                label="Estimated Delivery (Days)"
                type="number"
                fullWidth
                value={deliveryDaysInput}
                onChange={(e) => setDeliveryDaysInput(Math.max(1, parseInt(e.target.value, 10) || 1))}
                sx={fieldStyle}
              />

              <TextField
                label="Proposal Pitch / Cover Note"
                multiline
                rows={3}
                fullWidth
                placeholder="Briefly explain your AI workflow, tools used, and deliverables..."
                value={pitchInput}
                onChange={(e) => setPitchInput(e.target.value)}
                sx={fieldStyle}
              />

              {/* Dynamic Sec 194-O Payout Preview */}
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#4f46e5', display: 'block', mb: 1 }}>
                  💰 Real-Time Escrow Payout Breakdown
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', mb: 0.5 }}>
                  <span>Bid Amount:</span>
                  <strong>₹{inputAmount.toLocaleString()}</strong>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', mb: 0.5 }}>
                  <span>10% Platform Commission:</span>
                  <span>-₹{modalPlatformFee.toLocaleString()}</span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', mb: 0.5 }}>
                  <span>1% TDS (Sec 194-O Withholding):</span>
                  <span>-₹{modalTds.toLocaleString()}</span>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 800, color: '#10b981' }}>
                  <span>Your Net Payout:</span>
                  <span>₹{modalNetPayout.toLocaleString()}</span>
                </Box>
              </Paper>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setBidModalOpen(false)} sx={{ borderRadius: '10px', color: '#64748b' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleProposalSubmit}
              disabled={bidding || !bidAmountInput || Number(bidAmountInput) <= 0}
              sx={{
                background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                fontWeight: 700,
                borderRadius: '10px',
                px: 3
              }}
            >
              {bidding ? 'Submitting...' : hasBid ? 'Save Changes' : 'Submit Proposal'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Specialist Deliverables Submission Modal */}
        <Dialog
          open={deliverModalOpen}
          onClose={() => setDeliverModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
            🚀 Submit Completed Work / Deliverables
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              Paste download URLs (Google Drive, Dropbox, GitHub, Figma, or S3 links), one per line:
            </Typography>
            <TextField
              label="Deliverable URLs (One per line) *"
              multiline
              rows={4}
              fullWidth
              placeholder="https://drive.google.com/...\nhttps://github.com/..."
              value={deliverFilesInput}
              onChange={(e) => setDeliverFilesInput(e.target.value)}
              sx={fieldStyle}
            />
            <TextField
              label="Completion Notes / Instructions *"
              multiline
              rows={3}
              fullWidth
              placeholder="Explain deliverables, revisions incorporated, and instructions..."
              value={completionNotesInput}
              onChange={(e) => setCompletionNotesInput(e.target.value)}
              sx={{ ...fieldStyle, mt: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDeliverModalOpen(false)} sx={{ borderRadius: '10px' }}>Cancel</Button>
            <Button
              variant="contained"
              disabled={delivering || !deliverFilesInput.trim()}
              onClick={handleSubmitDeliverables}
              sx={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                fontWeight: 700,
                borderRadius: '10px'
              }}
            >
              {delivering ? 'Submitting...' : 'Submit Work for Client Approval'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Client Revision Modal */}
        <Dialog
          open={revisionModalOpen}
          onClose={() => setRevisionModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
            🔄 Request Revisions
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              Specify the exact adjustments you need from the specialist:
            </Typography>
            <TextField
              label="Revision Feedback Notes *"
              multiline
              rows={4}
              fullWidth
              placeholder="e.g. Please adjust the lighting on jar #3 and correct the typo in section 2..."
              value={revisionNotesInput}
              onChange={(e) => setRevisionNotesInput(e.target.value)}
              sx={fieldStyle}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setRevisionModalOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              disabled={requestingRevision || !revisionNotesInput.trim()}
              onClick={handleRequestRevision}
              sx={{ bgcolor: '#ca8a04', fontWeight: 700, borderRadius: '10px' }}
            >
              {requestingRevision ? 'Sending...' : 'Send Revision Request'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Client Approval & Payout Modal */}
        <Dialog
          open={approveModalOpen}
          onClose={() => setApproveModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
            ✅ Approve Deliverables & Release Payout
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              By approving, you sign off on the deliverables. Escrow will disburse net payment to the specialist under Section 194-O statutory compliance.
            </Typography>

            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Rating:</Typography>
              <Rating value={ratingInput} onChange={(_, val) => setRatingInput(val || 5)} size="large" />
            </Box>

            <TextField
              label="Review / Feedback for Specialist"
              multiline
              rows={3}
              fullWidth
              placeholder="Share your experience working with this specialist..."
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              sx={fieldStyle}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setApproveModalOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              disabled={approving}
              onClick={handleApproveWork}
              sx={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                fontWeight: 700,
                borderRadius: '10px'
              }}
            >
              {approving ? 'Disbursing...' : 'Confirm Approval & Release Funds'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Client Escrow UPI Payment Modal */}
        <Dialog
          open={escrowModalOpen}
          onClose={() => setEscrowModalOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pb: 1, color: '#0f172a' }}>
            🔒 Fund Milestone Escrow
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                Scan with any UPI App (GPay, PhonePe, Paytm, BHIM)
              </Typography>

              {/* Dynamic QR Code Image */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box
                  component="img"
                  src={merchant?.qrImage || '/images/payment-qr.jpeg'}
                  alt="UPI Payment QR Code"
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
                ₹{contractAmount.toLocaleString('en-IN')}
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
                  mb: 2,
                  bgcolor: '#f1f5f9',
                  borderRadius: '10px'
                }}
              >
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {merchant?.vpa || 'mohammedmaqsoodai@oksbi'}
                </Typography>
                <Tooltip title={copiedVpa ? 'Copied!' : 'Copy UPI ID'}>
                  <IconButton size="small" onClick={handleCopyVpa} sx={{ color: '#4f46e5' }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Paper>

              {/* Section 194-O Escrow Breakdown */}
              <Box sx={{ mb: 2.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: '10px', textAlign: 'left', border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Specialist Disbursal (89%):</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>₹{contractNetPayout.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Platform Fee (10%):</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>₹{contractPlatformFee.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Sec 194-O TDS (1%):</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>₹{contractTds.toLocaleString()}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* UTR Input */}
              <TextField
                fullWidth
                label="UPI UTR / Reference Number *"
                placeholder="e.g. 428901234567"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                sx={fieldStyle}
                helperText="Enter the 12-digit transaction ID from your UPI receipt"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setEscrowModalOpen(false)} sx={{ borderRadius: '10px', color: '#64748b' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={paySubmitting || !utrInput.trim()}
              onClick={() => handleConfirmEscrowPayment(contractAmount)}
              sx={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                fontWeight: 700,
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
              }}
            >
              {paySubmitting ? 'Verifying...' : `Confirm Payment (₹${contractAmount.toLocaleString()})`}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Task Assets Modal */}
        {task && (
          <TaskAssetsModal
            open={assetsModalOpen}
            onClose={() => setAssetsModalOpen(false)}
            task={task}
            onTaskUpdated={(updatedTask) => setTask((prev: any) => ({ ...prev, ...updatedTask }))}
            isOwner={isOwner}
          />
        )}

        {/* Task Discussion Channel Modal */}
        {task && (
          <CaseDiscussionModal
            open={discussionModalOpen}
            onClose={() => setDiscussionModalOpen(false)}
            task={task}
            currentUser={user}
          />
        )}
      </Container>
    </Box>
  );
};

const fieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    '&:hover fieldset': { borderColor: '#4f46e5' },
    '&.Mui-focused fieldset': { borderColor: '#4f46e5' }
  },
  '& label.Mui-focused': { color: '#4f46e5' }
};

export default TaskDetails;
