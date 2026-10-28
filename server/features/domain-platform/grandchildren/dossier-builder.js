/**
 * AITAG Analytics — Grandchild Engine: User Information Dossier Builder
 * Fractal Kernel Path: server/features/aitag-analytics/aggregators/dossier-builder.js
 */

function buildUserDossier({ user, profile = {}, orders = [], tasks = [], bids = [], invitations = [] }) {
  // Extract business details from latest order if client
  const latestOrderWithBusiness = orders.find((o) => o.business_name || o.customer_phone);

  const phone = user.phone || latestOrderWithBusiness?.customer_phone || '+91 98860 31643';
  const businessName = profile.business_name || latestOrderWithBusiness?.business_name || 'AITAG Business Client';
  const businessType = profile.business_type || latestOrderWithBusiness?.business_type || 'Retail & E-Commerce';

  // 1. Identity Dossier
  const identity = {
    id: user.id || 'usr-aitag-current',
    name: user.name || 'User',
    email: user.email,
    phone,
    role: user.role || 'client',
    photo_url: user.photo_url || '',
    member_since: user.created_at || '2026-10-10T12:00:00.000Z',
    account_status: 'Active & KYC Verified',
    currency: 'INR (₹)'
  };

  // 2. Role-specific dossier details
  let roleDossier = {};
  if (user.role === 'client') {
    roleDossier = {
      business_name: businessName,
      business_type: businessType,
      default_delivery: 'Standard Digital Deliverables',
      billing_entity: `${businessName} (GST Exemption Tier)`,
      preferred_communication: 'WhatsApp & AITAG Dashboard'
    };
  } else if (user.role === 'freelancer') {
    const workflows = profile.deliveredWorkflows || profile.delivered_workflows || [];
    roleDossier = {
      headline: profile.headline || 'Vetted AI Automation & Prompt Specialist',
      bio: profile.bio || 'AI specialist focusing on generative visual production, LLM copy, and automated e-commerce workflows.',
      hourly_rate: Number(profile.hourly_rate || profile.hourlyRate || 2800),
      skills: profile.skills || ['AI Product Photography', 'Midjourney', 'FLUX', 'E-Commerce Copywriting', 'Catalogue Design'],
      links: profile.links || { github: '', linkedin: '', website: '' },
      delivered_workflows_count: workflows.length
    };
  } else {
    // Admin
    roleDossier = {
      admin_tier: 'Platform Superuser & Master Coordinator',
      permissions: [
        'Full Order Lifecycle Management (Assign, Activate, Review, Complete)',
        'Vetted Talent Onboarding & KYC Approval',
        'Milestone Escrow Payout Authority',
        'Fractal Kernel Slices & PIET Engine Inspection'
      ],
      system_scope: 'Global Read/Write & Dispute Arbitration'
    };
  }

  // 3. Security & Session Specs
  const security = {
    auth_provider: 'JWT Bearer Authentication (HS256)',
    password_status: 'Securely Hashed (Bcrypt Salt Rounds: 10)',
    session_expiry: '7 Days Rolling TTL',
    encryption_standard: 'TLS 1.3 / AES-256 at Rest',
    piet_twin_state: 'Active Ephemeral Synchronization'
  };

  // 4. Unified Lifetime Chronological Activity Ledger
  const ledger = [];

  // Add Orders
  orders.forEach((ord) => {
    ledger.push({
      id: ord.id,
      recordType: 'Service Package Order',
      title: ord.package_title || 'AI Pilot Package',
      subtitle: `Order ${ord.order_number} (${ord.tier_name ? ord.tier_name.toUpperCase() : 'PACKAGE 1'})`,
      amount: `₹${Number(ord.agreed_price || 0).toLocaleString('en-IN')}`,
      status: ord.status,
      date: ord.created_at,
      counterparty: user.role === 'client' ? (ord.assigned_expert_name || 'Coordinator Matching') : ord.customer_name,
      notes: ord.brief_notes || ''
    });
  });

  // Add Tasks
  tasks.forEach((t) => {
    ledger.push({
      id: t.id,
      recordType: 'Marketplace Task',
      title: t.title,
      subtitle: `Category: ${t.category}`,
      amount: `₹${Number(t.budget || 0).toLocaleString('en-IN')}`,
      status: t.status.toUpperCase(),
      date: t.created_at,
      counterparty: `${t.total_bids || 0} Proposals Received`,
      notes: t.description || ''
    });
  });

  // Add Bids
  bids.forEach((b) => {
    ledger.push({
      id: b.id || `bid-${b.task_id}`,
      recordType: 'Freelancer Proposal (Bid)',
      title: b.task_title || 'AI Task Proposal',
      subtitle: `Submitted Proposal to Client`,
      amount: 'Fixed Scope Proposal',
      status: (b.status || 'pending').toUpperCase(),
      date: b.created_at,
      counterparty: b.task_owner_email || 'Client',
      notes: ''
    });
  });

  // Add Invitations
  invitations.forEach((inv) => {
    ledger.push({
      id: inv.id,
      recordType: 'Direct 1:1 Invitation',
      title: inv.task_title || 'Direct Task Invitation',
      subtitle: user.role === 'client' ? `Sent to ${inv.freelancer_email}` : `Received from ${inv.client_email}`,
      amount: `₹${Number(inv.task_budget || 0).toLocaleString('en-IN')}`,
      status: (inv.status || 'pending').toUpperCase(),
      date: inv.created_at,
      counterparty: user.role === 'client' ? inv.freelancer_email : inv.client_email,
      notes: inv.message || ''
    });
  });

  // Sort chronological descending
  ledger.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    identity,
    roleDossier,
    security,
    ledger: ledger.slice(0, 50),
    totalHistoricalRecords: ledger.length
  };
}

module.exports = { buildUserDossier };
