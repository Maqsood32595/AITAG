/**
 * In-Memory RAM Sandbox: Bid Retrieval, Acceptance & Escrow Lifecycle Test
 * =========================================================================
 * STRICT ZERO-DISK & ZERO-CLOUD-DB PERSISTENCE MODE.
 * Everything runs inside RAM buffers.
 */

const jwt = require('jsonwebtoken');

// ── In-Memory Isolated RAM Stores ──────────────────────────────────────────
const RAM_STORE = {
  tasks: new Map(),
  bids: new Map(),
  escrowLedgers: new Map(),
  sessionCheckpoints: new Map(),
  auditLog: []
};

const JWT_SECRET = 'aitag-in-ram-sandbox-secret-2026';

// Initialize RAM Mock Data
const ownerEmail = 'l.maqsood.m@gmail.com';
const bidderEmail = 'user1@aitag.com';
const taskId = 'task-ram-8bceb883';
const bidId = 'bid-ram-u1-001';

RAM_STORE.tasks.set(taskId, {
  id: taskId,
  title: '[VERIFIED-IN-RAM] Develop Real-Time AI Agent Tagging Pipeline',
  category: 'AI & Machine Learning',
  budget: 25000,
  deadline: '2026-08-23',
  status: 'open',
  user_email: ownerEmail,
  user_name: 'Maqsood',
  total_bids: 1
});

RAM_STORE.bids.set(bidId, {
  id: bidId,
  task_id: taskId,
  task_title: '[VERIFIED-IN-RAM] Develop Real-Time AI Agent Tagging Pipeline',
  user_email: bidderEmail,
  user_name: 'User1',
  task_owner_email: ownerEmail,
  status: 'pending',
  proposed_budget: 25000,
  created_at: new Date().toISOString()
});

async function runBidAcceptanceSimulation() {
  console.log('======================================================================');
  console.log('🛡️  RAM SANDBOX: BID RETRIEVAL & ACCEPTANCE WORKFLOW SIMULATION');
  console.log('   (Zero Disk Writes | Zero Live Database Writes | 100% In-Memory)');
  console.log('======================================================================\n');

  // Checkpoint 0: Pre-Acceptance State
  RAM_STORE.sessionCheckpoints.set('pre_acceptance', {
    taskStatus: RAM_STORE.tasks.get(taskId).status,
    bidStatus: RAM_STORE.bids.get(bidId).status
  });
  console.log('📌 [RAM Checkpoint Created] "pre_acceptance"');

  // ── Step 1: Owner Authenticates & Retrieves Task Bids ──────────────────────
  console.log(`\n🔍 [Step 1] Task Owner (${ownerEmail}) retrieving bids for Task #${taskId}...`);
  const task = RAM_STORE.tasks.get(taskId);
  if (!task) throw new Error('Task not found');

  const taskBids = Array.from(RAM_STORE.bids.values()).filter(b => b.task_id === taskId);
  console.log(`  ✅ Found ${taskBids.length} bid(s) for task: "${task.title}"`);
  taskBids.forEach(b => {
    console.log(`     - Bid ID:    ${b.id}`);
    console.log(`     - Bidder:    ${b.user_name} (${b.user_email})`);
    console.log(`     - Amount:    ₹${b.proposed_budget}`);
    console.log(`     - Status:    ${b.status}`);
  });

  // ── Step 2: Owner Accepts User1's Bid in RAM ──────────────────────────────
  console.log(`\n🤝 [Step 2] Owner (${ownerEmail}) executing Bid Acceptance for User1 (${bidId})...`);
  const targetBid = RAM_STORE.bids.get(bidId);
  if (!targetBid) throw new Error('Bid not found');
  if (targetBid.task_owner_email !== ownerEmail) throw new Error('Unauthorized');

  // State Transitions in RAM
  targetBid.status = 'accepted';
  targetBid.accepted_at = new Date().toISOString();
  task.status = 'in-progress';
  task.assigned_to = targetBid.user_email;

  RAM_STORE.auditLog.push({
    action: 'BID_ACCEPTED_IN_RAM',
    bidId,
    taskId,
    by: ownerEmail,
    assignedTo: bidderEmail
  });

  console.log('  ✅ Bid Status Transition:  "pending" ──▶ "accepted"');
  console.log('  ✅ Task Status Transition: "open"    ──▶ "in-progress"');
  console.log(`  ✅ Freelancer Assigned:    ${targetBid.user_name} (${targetBid.user_email})`);

  // ── Step 3: Escrow & Section 194-O TDS Ledger Computation in RAM ──────────
  console.log('\n💰 [Step 3] Computing Escrow Funding & Tax Splits in RAM...');
  const grossAmount = task.budget;
  const platformFeePct = 0.10; // 10%
  const tdsPct = 0.01;         // 1% Section 194-O

  const platformFee = Number((grossAmount * platformFeePct).toFixed(2));
  const tdsWithheld = Number((grossAmount * tdsPct).toFixed(2));
  const netPayout = Number((grossAmount - (platformFee + tdsWithheld)).toFixed(2));

  const escrowContract = {
    contractId: 'escrow-ram-' + Math.random().toString(36).substring(2, 8),
    taskId,
    bidId,
    client: ownerEmail,
    freelancer: bidderEmail,
    grossAmount,
    splits: {
      freelancerNetPayout: netPayout,
      platformFee,
      section194OTDS: tdsWithheld
    },
    escrowStatus: 'FUNDED_IN_ESCROW_RAM',
    timestamp: new Date().toISOString()
  };

  RAM_STORE.escrowLedgers.set(escrowContract.contractId, escrowContract);

  console.log(`  ✅ Escrow Contract Created: ${escrowContract.contractId}`);
  console.log(`     - Gross Budget Locked:    ₹${grossAmount.toLocaleString()}`);
  console.log(`     - 10% Platform Fee:       ₹${platformFee.toLocaleString()}`);
  console.log(`     - 1% TDS (Sec 194-O):     ₹${tdsWithheld.toLocaleString()}`);
  console.log(`     - Net Freelancer Payout:  ₹${netPayout.toLocaleString()}`);
  console.log(`     - Status:                 ${escrowContract.escrowStatus}`);

  // Checkpoint 1: Post-Acceptance State
  RAM_STORE.sessionCheckpoints.set('post_acceptance', {
    taskStatus: RAM_STORE.tasks.get(taskId).status,
    bidStatus: RAM_STORE.bids.get(bidId).status,
    escrowContracts: RAM_STORE.escrowLedgers.size
  });
  console.log('\n📌 [RAM Checkpoint Created] "post_acceptance"');

  // ── Step 4: Verification Summary ──────────────────────────────────────────
  console.log('\n======================================================================');
  console.log('📊 RAM SIMULATION COMPLETE: READY FOR HITL REVIEW');
  console.log('======================================================================');
  console.log(`🔒 Physical Disk Writes: 0 bytes`);
  console.log(`🌐 Live Database Writes: 0 rows`);
  console.log(`⏱️ Sub-millisecond Checkpoints Available: ["pre_acceptance", "post_acceptance"]`);
  console.log('======================================================================');
}

runBidAcceptanceSimulation().catch(err => {
  console.error('\n❌ RAM Simulation Failed:', err);
  process.exit(1);
});
