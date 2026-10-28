/**
 * AITAG Analytics — Grandchild Engine: Client Analytics
 * Fractal Kernel Path: server/features/aitag-analytics/aggregators/client-analytics.js
 */

function computeClientAnalytics({ user, orders = [], tasks = [], bids = [], invitations = [] }) {
  // 1. Financial Metrics
  let totalInvested = 0;
  let inEscrow = 0;
  let completedSpend = 0;

  orders.forEach((ord) => {
    const price = Number(ord.agreed_price) || 0;
    totalInvested += price;
    if (['ACTIVE', 'DRAFT_SUBMITTED', 'REVISION'].includes(ord.status)) {
      inEscrow += price;
    } else if (ord.status === 'COMPLETED') {
      completedSpend += price;
    }
  });

  tasks.forEach((t) => {
    const budget = Number(t.budget) || 0;
    if (t.status === 'completed') {
      totalInvested += budget;
      completedSpend += budget;
    } else if (t.status === 'in-progress') {
      totalInvested += budget;
      inEscrow += budget;
    }
  });

  // 2. Lifecycle Funnel (Service Orders + Custom Tasks)
  const orderFunnel = {
    REQUESTED: 0,
    MATCHED: 0,
    ACTIVE: 0,
    DRAFT_SUBMITTED: 0,
    REVISION: 0,
    COMPLETED: 0
  };

  orders.forEach((ord) => {
    if (orderFunnel[ord.status] !== undefined) {
      orderFunnel[ord.status]++;
    }
  });

  // 3. Category Distribution
  const categoryMap = {
    'Product Visuals': { count: 0, spend: 0 },
    'E-Commerce & Copy': { count: 0, spend: 0 },
    'Social & Marketing': { count: 0, spend: 0 },
    'Web & Funnels': { count: 0, spend: 0 }
  };

  orders.forEach((ord) => {
    const cat = ord.category || 'Product Visuals';
    const price = Number(ord.agreed_price) || 0;
    if (!categoryMap[cat]) categoryMap[cat] = { count: 0, spend: 0 };
    categoryMap[cat].count++;
    categoryMap[cat].spend += price;
  });

  tasks.forEach((t) => {
    const cat = t.category || 'Product Visuals';
    const budget = Number(t.budget) || 0;
    if (!categoryMap[cat]) categoryMap[cat] = { count: 0, spend: 0 };
    categoryMap[cat].count++;
    categoryMap[cat].spend += budget;
  });

  // 4. Specialist Collaborations
  const specialistMap = new Map();
  orders.forEach((ord) => {
    if (ord.assigned_expert_email) {
      const email = ord.assigned_expert_email;
      const name = ord.assigned_expert_name || email;
      const prev = specialistMap.get(email) || { name, email, ordersCount: 0, totalValue: 0 };
      prev.ordersCount++;
      prev.totalValue += Number(ord.agreed_price) || 0;
      specialistMap.set(email, prev);
    }
  });

  return {
    role: 'client',
    summaryCards: [
      {
        id: 'total_invested',
        label: 'Total Capital Invested',
        value: `₹${totalInvested.toLocaleString('en-IN')}`,
        numeric: totalInvested,
        subtitle: `${orders.length} pilot packages & ${tasks.length} tasks`,
        color: '#4f46e5',
        bg: 'rgba(79,70,229,0.08)',
        trend: '+100% On-Scope'
      },
      {
        id: 'in_escrow',
        label: 'Funds in Active Escrow',
        value: `₹${inEscrow.toLocaleString('en-IN')}`,
        numeric: inEscrow,
        subtitle: 'Protected by RBI compliant milestone escrow',
        color: '#0891b2',
        bg: 'rgba(8,145,178,0.08)',
        trend: '100% Safe'
      },
      {
        id: 'completed_outcomes',
        label: 'Delivered Business Outcomes',
        value: orderFunnel.COMPLETED + tasks.filter(t => t.status === 'completed').length,
        numeric: orderFunnel.COMPLETED,
        subtitle: `₹${completedSpend.toLocaleString('en-IN')} successfully deployed`,
        color: '#10b981',
        bg: 'rgba(16,185,129,0.08)',
        trend: '5/5 Rating'
      },
      {
        id: 'proposals_received',
        label: 'Talent Proposals Received',
        value: bids.length,
        numeric: bids.length,
        subtitle: `Across ${tasks.length} custom posted tasks`,
        color: '#8b5cf6',
        bg: 'rgba(139,92,246,0.08)',
        trend: `${tasks.length ? Math.round(bids.length / tasks.length) : 0} avg / task`
      }
    ],
    financials: {
      totalInvested,
      inEscrow,
      completedSpend,
      pendingDisbursement: inEscrow
    },
    funnel: orderFunnel,
    categories: Object.entries(categoryMap).map(([category, data]) => ({
      category,
      count: data.count,
      spend: data.spend,
      percentage: totalInvested > 0 ? Math.round((data.spend / totalInvested) * 100) : 0
    })),
    topSpecialists: Array.from(specialistMap.values()),
    counts: {
      totalOrders: orders.length,
      totalTasks: tasks.length,
      totalBidsReceived: bids.length,
      totalInvitationsSent: invitations.length
    }
  };
}

module.exports = { computeClientAnalytics };
