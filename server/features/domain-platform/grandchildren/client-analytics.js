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
    const price = ord.payment_waived ? 0 : (Number(ord.agreed_price) || 0);
    totalInvested += price;
    if (['ACTIVE', 'DRAFT_SUBMITTED', 'REVISION'].includes(ord.status)) {
      inEscrow += price;
    } else if (ord.status === 'COMPLETED') {
      completedSpend += price;
    }
  });

  tasks.forEach((t) => {
    const budget = t.payment_waived ? 0 : (Number(t.budget) || 0);
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
    'Branding & Print': { count: 0, spend: 0 },
    'Social & Marketing': { count: 0, spend: 0 },
    'Web & Digital Presence': { count: 0, spend: 0 },
    'Product Visuals': { count: 0, spend: 0 }
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
        label: 'Total Spent',
        value: `₹${totalInvested.toLocaleString('en-IN')}`,
        numeric: totalInvested,
        subtitle: `${orders.length} ${orders.length === 1 ? 'package' : 'packages'} & ${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`,
        color: '#4f46e5',
        bg: 'rgba(79,70,229,0.08)',
        trend: 'Orders & Tasks'
      },
      {
        id: 'in_escrow',
        label: 'Protected Balance',
        value: `₹${inEscrow.toLocaleString('en-IN')}`,
        numeric: inEscrow,
        subtitle: 'Held safely until your work is delivered',
        color: '#0891b2',
        bg: 'rgba(8,145,178,0.08)'
      },
      {
        id: 'completed_outcomes',
        label: 'Completed Projects',
        value: orderFunnel.COMPLETED + tasks.filter(t => t.status === 'completed').length,
        numeric: orderFunnel.COMPLETED,
        subtitle: `₹${completedSpend.toLocaleString('en-IN')} in finished work`,
        color: '#10b981',
        bg: 'rgba(16,185,129,0.08)',
        trend: 'Done'
      },
      {
        id: 'proposals_received',
        label: 'Expert Quotes',
        value: bids.length,
        numeric: bids.length,
        subtitle: `Across ${tasks.length} posted ${tasks.length === 1 ? 'task' : 'tasks'}`,
        color: '#8b5cf6',
        bg: 'rgba(139,92,246,0.08)',
        trend: 'Quotes'
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
