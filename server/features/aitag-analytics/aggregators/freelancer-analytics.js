/**
 * AITAG Analytics — Grandchild Engine: Freelancer Analytics
 * Fractal Kernel Path: server/features/aitag-analytics/aggregators/freelancer-analytics.js
 */

function computeFreelancerAnalytics({ user, orders = [], bids = [], invitations = [], profile = {} }) {
  // 1. Earnings (Net 95% payout after 5% platform fee)
  let totalNetEarnings = 0;
  let escrowPendingEarnings = 0;
  let ratingsSum = 0;
  let ratingsCount = 0;
  const testimonials = [];

  orders.forEach((ord) => {
    const payout = Number(ord.expert_payout) || Math.round((Number(ord.agreed_price) || 0) * 0.95);
    if (ord.status === 'COMPLETED') {
      totalNetEarnings += payout;
      if (ord.rating) {
        ratingsSum += Number(ord.rating);
        ratingsCount++;
      }
      if (ord.testimonial) {
        testimonials.push({
          orderNumber: ord.order_number,
          client: ord.customer_name,
          rating: ord.rating || 5,
          text: ord.testimonial,
          date: ord.updated_at || ord.created_at
        });
      }
    } else if (['ACTIVE', 'DRAFT_SUBMITTED', 'REVISION'].includes(ord.status)) {
      escrowPendingEarnings += payout;
    }
  });

  // Calculate won bids
  const acceptedBids = bids.filter((b) => b.status === 'accepted');
  const winRate = bids.length > 0 ? Math.round((acceptedBids.length / bids.length) * 100) : 0;

  // Direct Invitations
  const acceptedInvitations = invitations.filter((i) => i.status === 'accepted');
  const inviteAcceptRate = invitations.length > 0 ? Math.round((acceptedInvitations.length / invitations.length) * 100) : 100;

  // Category earnings
  const categoryMap = {
    'Product Visuals': { count: 0, earnings: 0 },
    'E-Commerce & Copy': { count: 0, earnings: 0 },
    'Social & Marketing': { count: 0, earnings: 0 },
    'Web & Funnels': { count: 0, earnings: 0 }
  };

  orders.forEach((ord) => {
    const cat = ord.category || 'Product Visuals';
    const payout = Number(ord.expert_payout) || Math.round((Number(ord.agreed_price) || 0) * 0.95);
    if (!categoryMap[cat]) categoryMap[cat] = { count: 0, earnings: 0 };
    categoryMap[cat].count++;
    categoryMap[cat].earnings += payout;
  });

  const avgRating = ratingsCount > 0 ? (ratingsSum / ratingsCount).toFixed(1) : '5.0';
  const deliveredWorkflows = profile.deliveredWorkflows || profile.delivered_workflows || [];

  return {
    role: 'freelancer',
    summaryCards: [
      {
        id: 'net_earnings',
        label: 'Lifetime Net Earnings',
        value: `₹${totalNetEarnings.toLocaleString('en-IN')}`,
        numeric: totalNetEarnings,
        subtitle: 'Direct bank payout after 5% platform fee',
        color: '#10b981',
        bg: 'rgba(16,185,129,0.08)',
        trend: '+95% Direct Payout'
      },
      {
        id: 'escrow_pending',
        label: 'Active Escrow Payouts',
        value: `₹${escrowPendingEarnings.toLocaleString('en-IN')}`,
        numeric: escrowPendingEarnings,
        subtitle: `${orders.filter(o => ['ACTIVE', 'DRAFT_SUBMITTED', 'REVISION'].includes(o.status)).length} active deliverables in review`,
        color: '#0891b2',
        bg: 'rgba(8,145,178,0.08)',
        trend: 'Secured in Escrow'
      },
      {
        id: 'win_rate',
        label: 'Proposal Win Rate',
        value: `${winRate}%`,
        numeric: winRate,
        subtitle: `${acceptedBids.length} won / ${bids.length} proposals placed`,
        color: '#4f46e5',
        bg: 'rgba(79,70,229,0.08)',
        trend: `${acceptedInvitations.length} Direct Invites`
      },
      {
        id: 'avg_rating',
        label: 'Client Satisfaction Rating',
        value: `${avgRating} ★`,
        numeric: Number(avgRating),
        subtitle: `Based on ${Math.max(1, ratingsCount)} verified client reviews`,
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.08)',
        trend: 'Top Rated Talent'
      }
    ],
    financials: {
      totalNetEarnings,
      escrowPendingEarnings,
      avgEarningsPerProject: orders.length > 0 ? Math.round(totalNetEarnings / Math.max(1, orders.filter(o => o.status === 'COMPLETED').length)) : 0
    },
    metrics: {
      winRate,
      bidsPlaced: bids.length,
      bidsWon: acceptedBids.length,
      invitationsReceived: invitations.length,
      invitationsAccepted: acceptedInvitations.length,
      inviteAcceptRate,
      avgRating: Number(avgRating),
      reviewsCount: ratingsCount,
      deliveredWorkflowsCount: deliveredWorkflows.length
    },
    categories: Object.entries(categoryMap).map(([category, data]) => ({
      category,
      count: data.count,
      earnings: data.earnings,
      percentage: totalNetEarnings > 0 ? Math.round((data.earnings / totalNetEarnings) * 100) : 0
    })),
    testimonials
  };
}

module.exports = { computeFreelancerAnalytics };
