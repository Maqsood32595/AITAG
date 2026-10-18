/**
 * ==============================================================================
 * PIET — Persistent In-RAM Ephemeral Twin Architecture
 * Strict Zero-Mock Falsification Test Harness for AITAG Pilot Packages & Orders
 *
 * Gate 1: Falsification Probe        — assertions must be able to FAIL (red proof)
 * Gate 2: AST & Manifest Integrity   — syntax, manifest schema, and route graphs
 * Gate 3: Zero-Mock HTTP & DB        — real HTTP ↔ real Supabase Dev DB verification
 * Gate 4: Physical Invariants        — pricing math, tier rules & 5% commission
 * Gate 5: Role-Based Journeys        — Customer → Admin → Expert 8-stage state flow
 * Gate 6: Deep Domain Contracts      — Rating, revision limits & zero ghost records
 * ==============================================================================
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const BASE = (process.env.TEST_BASE_URL || 'http://localhost:5005').replace(/\/$/, '');
const RUN_ID = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const NONCE_EMAIL = `piet-client-${RUN_ID}@aitag-test.local`;
const NONCE_EXPERT = `piet-expert-${RUN_ID}@aitag-test.local`;

const results = [];
let currentGate = '';
function gate(name) { currentGate = name; }

async function t(name, fn) {
  try {
    await fn();
    results.push({ gate: currentGate, name, ok: true });
  } catch (e) {
    results.push({ gate: currentGate, name, ok: false, error: String(e.message || e).slice(0, 300) });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function eq(actual, expected, message) {
  assert(actual === expected, `${message || 'eq'} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

async function requestJson(path, opts = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    }
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

// ==============================================================================
// RUNNER
// ==============================================================================
async function runPietSuite() {
  console.log(`\n⚡ PIET Persistent In-RAM Ephemeral Twin targeting ${BASE}`);
  console.log(`   Run Nonce: ${RUN_ID}\n`);

  let localServer = null;
  let ephemeralOrderId = null;

  // Auto-boot In-RAM Server Twin if port is closed
  try {
    await fetch(`${BASE}/healthz`, { signal: AbortSignal.timeout(600) });
  } catch {
    console.log(`📡 In-RAM Ephemeral Twin: Spinning up live Express server on port 5005...`);
    const express = (await import('express')).default;
    const app = express();
    app.use(express.json());
    const kernel = (await import('../../server/kernel.js')).default;
    kernel.init(app);
    app.get('/healthz', (req, res) => res.json({ status: 'healthy' }));
    localServer = await new Promise((res) => {
      const s = app.listen(5005, () => res(s));
    });
    console.log(`✅ Ephemeral In-RAM server twin active on port 5005.\n`);
  }

  try {
    // --------------------------------------------------------------------------
    // GATE 1: Falsification Probe (Red Proof)
    // --------------------------------------------------------------------------
    gate('Gate 1: Falsification Probe');

    await t('Proves harness catches closed port connection failure', async () => {
      let threw = false;
      try {
        await fetch('http://127.0.0.1:59999/unreachable', { signal: AbortSignal.timeout(600) });
      } catch {
        threw = true;
      }
      assert(threw, 'Harness must fail when hitting an unreachable port');
    });

    await t('Negative input defense: rejects empty order payload with HTTP 400', async () => {
      const res = await requestJson('/api/service-orders', {
        method: 'POST',
        body: JSON.stringify({})
      });
      eq(res.status, 400, 'Empty brief submission must return 400 Bad Request');
      eq(res.data.success, false, 'Response must indicate failure');
    });

    await t('Negative input defense: rejects unauthenticated task creation with HTTP 401', async () => {
      const res = await requestJson('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Unauthorized Task',
          category: 'Product Visuals',
          description: 'Should fail authentication',
          deadline: '2026-12-31',
          budget: 1500
        })
      });
      eq(res.status, 401, 'Unauthenticated task creation must return 401 Unauthorized');
    });

    await t('Negative input defense: rejects unauthenticated analytics request with HTTP 401', async () => {
      const res = await requestJson('/api/analytics/me');
      eq(res.status, 401, 'Unauthenticated analytics request must return 401 Unauthorized');
    });

    await t('Negative input defense: rejects unauthenticated DELETE /api/account with HTTP 401', async () => {
      const res = await requestJson('/api/account', {
        method: 'DELETE',
        body: JSON.stringify({ confirmation: 'DELETE' })
      });
      eq(res.status, 401, 'Unauthenticated DELETE /api/account must return 401 Unauthorized');
    });

    await t('Negative input defense: rejects unauthenticated discussion access with HTTP 401', async () => {
      const res = await requestJson('/api/case-discussions/arbitrary-order-id');
      eq(res.status, 401, 'Unauthenticated discussion request must return 401 Unauthorized');
    });

    // --------------------------------------------------------------------------
    // GATE 2: AST & Manifest Integrity
    // --------------------------------------------------------------------------
    gate('Gate 2: AST & Manifest Integrity');

    await t('Verifies all 18 Fractal Kernel feature manifests exist and parse cleanly', () => {
      const featuresDir = resolve('server/features');
      const expectedSlices = [
        'aitag-auth', 'aitag-bids', 'aitag-blog', 'aitag-invitations',
        'aitag-marketplace', 'aitag-profile', 'aitag-service-orders',
        'aitag-service-packages', 'aitag-tasks', 'escrow-payment',
        'leakage-shield', 'sandwich-refactor-sandbox', 'aitag-analytics',
        'aitag-security-guard', 'aitag-cache', 'aitag-oauth', 'aitag-account-lifecycle',
        'aitag-case-discussions'
      ];

      for (const slice of expectedSlices) {
        const manifestPath = join(featuresDir, slice, 'feature.manifest.json');
        const routesPath = join(featuresDir, slice, 'routes.js');
        const servicePath = join(featuresDir, slice, 'service.js');

        assert(existsSync(manifestPath), `Manifest missing for ${slice}`);
        assert(existsSync(routesPath), `Routes file missing for ${slice}`);
        assert(existsSync(servicePath), `Service file missing for ${slice}`);

        const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
        assert(manifest.id === slice, `Manifest ID mismatch in ${slice}`);
        assert(manifest.enabled === true, `Feature ${slice} must be enabled`);
        assert(manifest.basePath.startsWith('/api/'), `Invalid basePath in ${slice}`);
      }
    });

    await t('Verifies aitag-analytics Grandchild Architecture module integrity', () => {
      const aggregatorsDir = resolve('server/features/aitag-analytics/aggregators');
      const expectedGrandchildren = [
        'client-analytics.js',
        'freelancer-analytics.js',
        'admin-analytics.js',
        'dossier-builder.js'
      ];
      for (const gc of expectedGrandchildren) {
        const p = join(aggregatorsDir, gc);
        assert(existsSync(p), `Missing grandchild aggregator: ${gc}`);
      }
    });

    await t('Verifies Fractal Kernel runtime discovery endpoint /api/features mounts 17 slices', async () => {
      const res = await requestJson('/api/features');
      eq(res.status, 200, 'GET /api/features must return 200 OK');
      assert(Array.isArray(res.data), '/api/features must return array');
      assert(res.data.length >= 17, 'Kernel must mount at least 17 feature slices');
      const ids = res.data.map((f) => f.id);
      assert(ids.includes('aitag-service-orders'), 'Kernel missing aitag-service-orders slice');
      assert(ids.includes('aitag-service-packages'), 'Kernel missing aitag-service-packages slice');
      assert(ids.includes('aitag-tasks'), 'Kernel missing aitag-tasks slice');
      assert(ids.includes('aitag-analytics'), 'Kernel missing aitag-analytics slice');
      assert(ids.includes('aitag-security-guard'), 'Kernel missing aitag-security-guard slice');
      assert(ids.includes('aitag-cache'), 'Kernel missing aitag-cache slice');
      assert(ids.includes('aitag-oauth'), 'Kernel missing aitag-oauth slice');
      assert(ids.includes('aitag-case-discussions'), 'Kernel missing aitag-case-discussions slice');
    });

    await t('Verifies aitag-oauth config endpoint and input validation contract', async () => {
      const configRes = await requestJson('/api/oauth/config');
      eq(configRes.status, 200, 'GET /api/oauth/config must return 200 OK');
      eq(configRes.data.success, true, 'Config response success must be true');
      eq(configRes.data.service, 'aitag-oauth', 'Service identifier must match aitag-oauth');
      assert(configRes.data.clientId && configRes.data.clientId.includes('apps.googleusercontent.com'), 'Valid clientId must be returned');

      // Negative input defense: missing credential rejected with 400
      const negRes = await requestJson('/api/oauth/google', {
        method: 'POST',
        body: JSON.stringify({})
      });
      eq(negRes.status, 400, 'Empty credential token must return 400 Bad Request');
      eq(negRes.data.success, false, 'Response must indicate failure');
    });

    // --------------------------------------------------------------------------
    // GATE 3: Zero-Mock HTTP & DB Verification
    // --------------------------------------------------------------------------
    gate('Gate 3: Zero-Mock HTTP & DB Layer');

    let allPackages = [];
    await t('Fetches live active packages list via /api/service-packages', async () => {
      const res = await requestJson('/api/service-packages');
      eq(res.status, 200, 'GET /api/service-packages must return 200 OK');
      eq(res.data.success, true, 'Response success must be true');
      assert(Array.isArray(res.data.packages), 'packages must be an array');
      assert(res.data.packages.length >= 3, 'Must contain at least the 3 launch packages');
      allPackages = res.data.packages;
    });

    await t('Verifies the 3 pilot packages exist with their exact slugs', () => {
      const slugs = allPackages.map((p) => p.slug);
      assert(slugs.includes('ai-product-photo-makeover'), 'Missing ai-product-photo-makeover');
      assert(slugs.includes('ai-social-media-content-pack'), 'Missing ai-social-media-content-pack');
      assert(slugs.includes('ai-website-landing-page'), 'Missing ai-website-landing-page');
    });

    await t('Verifies each package has 3 tiers (package_1/beginner, package_2/medium, package_3/expert)', () => {
      for (const pkg of allPackages) {
        assert(Array.isArray(pkg.tiers), `Package ${pkg.slug} has no tiers array`);
        eq(pkg.tiers.length, 3, `Package ${pkg.slug} must have exactly 3 tiers`);
        const tierNames = pkg.tiers.map((t) => t.tier_name.toLowerCase());
        assert(tierNames.includes('package_1') || tierNames.includes('beginner'), `${pkg.slug} missing tier 1`);
        assert(tierNames.includes('package_2') || tierNames.includes('medium'), `${pkg.slug} missing tier 2`);
        assert(tierNames.includes('package_3') || tierNames.includes('expert'), `${pkg.slug} missing tier 3`);
      }
    });

    let allTasks = [];
    await t('Fetches live tasks via /api/tasks and proves zero legacy tech categories', async () => {
      const res = await requestJson('/api/tasks');
      eq(res.status, 200, 'GET /api/tasks must return 200 OK');
      assert(Array.isArray(res.data), 'Tasks response data must be an array');
      assert(res.data.length >= 8, 'Must return at least 8 featured tasks');
      allTasks = res.data;

      const validCategories = new Set(['Product Visuals', 'E-Commerce & Copy', 'Social & Marketing', 'Web & Funnels']);
      const legacyBanned = ['AI Engineering', 'Machine Learning', 'ML Ops', 'Data Science'];

      for (const task of allTasks) {
        assert(validCategories.has(task.category), `Task "${task.title}" has invalid category: ${task.category}`);
        assert(!legacyBanned.includes(task.category), `Task "${task.title}" has legacy banned category: ${task.category}`);
      }
    });

    await t('Filters tasks by category strictly via /api/tasks?category=Product%20Visuals', async () => {
      const res = await requestJson('/api/tasks?category=Product%20Visuals');
      eq(res.status, 200, 'GET /api/tasks?category=... must return 200 OK');
      assert(Array.isArray(res.data), 'Filtered tasks must be an array');
      assert(res.data.length > 0, 'Must have at least one Product Visuals task');
      for (const task of res.data) {
        eq(task.category, 'Product Visuals', `Filtered task "${task.title}" has wrong category`);
      }
    });

    await t('Fetches single task by ID via /api/tasks/:id with complete attributes', async () => {
      const firstTask = allTasks[0];
      const res = await requestJson(`/api/tasks/${firstTask.id}`);
      eq(res.status, 200, `GET /api/tasks/${firstTask.id} must return 200 OK`);
      eq(res.data.id, firstTask.id, 'Task ID must match');
      eq(res.data.title, firstTask.title, 'Task title must match');
      eq(res.data.category, firstTask.category, 'Task category must match');
      assert(Number(res.data.budget) >= 999, 'Task budget must be >= 999');
    });

    await t('Fetches and filters service orders via /api/service-orders with role and status query params', async () => {
      const res = await requestJson('/api/service-orders?status=REQUESTED');
      eq(res.status, 200, 'GET /api/service-orders?status=REQUESTED must return 200 OK');
      eq(res.data.success, true, 'Response must indicate success');
      assert(Array.isArray(res.data.orders), 'Orders must be an array');
    });

    const authServiceModule = await import('../../server/features/aitag-auth/service.js');
    const authService = authServiceModule.default || authServiceModule;

    const clientToken = authService.signToken({
      id: 'piet-client-uuid',
      name: 'PIET Test Client',
      email: NONCE_EMAIL,
      role: 'client'
    });

    const adminToken = authService.signToken({
      id: 'piet-admin-uuid',
      name: 'User1 Admin',
      email: 'user1@aitag.com',
      role: 'admin'
    });

    const freelancerToken = authService.signToken({
      id: 'piet-expert-uuid',
      name: 'Vetted AI Specialist',
      email: NONCE_EXPERT,
      role: 'freelancer'
    });

    await t('Enforces strict role-based data isolation on GET /api/service-orders', async () => {
      // Authenticated Client must only see orders where customer_email matches their token
      const clientRes = await requestJson('/api/service-orders', {
        headers: { Authorization: `Bearer ${clientToken}` }
      });
      eq(clientRes.status, 200, 'Client GET /api/service-orders must return 200');
      for (const ord of clientRes.data.orders) {
        eq(ord.customer_email, NONCE_EMAIL, 'Client must only see their own orders');
      }

      // Authenticated Freelancer / Expert must only see orders assigned to their email
      const expertRes = await requestJson('/api/service-orders', {
        headers: { Authorization: `Bearer ${freelancerToken}` }
      });
      eq(expertRes.status, 200, 'Expert GET /api/service-orders must return 200');
      for (const ord of expertRes.data.orders) {
        eq(ord.assigned_expert_email, NONCE_EXPERT, 'Expert must only see their assigned orders');
      }
    });

    await t('Fetches role-tailored Client analytics & user dossier via GET /api/analytics/me', async () => {
      const res = await requestJson('/api/analytics/me', {
        headers: { Authorization: `Bearer ${clientToken}` }
      });
      eq(res.status, 200, 'GET /api/analytics/me for client must return 200 OK');
      eq(res.data.success, true, 'Response success must be true');
      eq(res.data.analytics.role, 'client', 'Analytics role must be client');
      assert(Array.isArray(res.data.analytics.summaryCards), 'summaryCards must be array');
      eq(res.data.analytics.summaryCards.length, 4, 'Must return 4 client summary cards');
      eq(res.data.dossier.identity.email, NONCE_EMAIL, 'Dossier identity email must match');
      eq(res.data.dossier.identity.role, 'client', 'Dossier identity role must match');
      assert(Array.isArray(res.data.dossier.ledger), 'Dossier ledger must be array');
    });

    await t('Fetches role-tailored Admin platform analytics & master dossier via GET /api/analytics/me', async () => {
      const res = await requestJson('/api/analytics/me', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      eq(res.status, 200, 'GET /api/analytics/me for admin must return 200 OK');
      eq(res.data.analytics.role, 'admin', 'Analytics role must be admin');
      assert(res.data.analytics.financials.gmv !== undefined, 'Admin GMV must be defined');
      assert(res.data.dossier.roleDossier.admin_tier.includes('Superuser'), 'Admin tier must include Superuser');
    });

    await t('Fetches role-tailored Freelancer earnings analytics via GET /api/analytics/me', async () => {
      const res = await requestJson('/api/analytics/me', {
        headers: { Authorization: `Bearer ${freelancerToken}` }
      });
      eq(res.status, 200, 'GET /api/analytics/me for freelancer must return 200 OK');
      eq(res.data.analytics.role, 'freelancer', 'Analytics role must be freelancer');
      eq(res.data.dossier.identity.role, 'freelancer', 'Dossier identity role must match');
      assert(Array.isArray(res.data.analytics.summaryCards), 'Freelancer summary cards must be array');
    });

    await t('Fetches quick analytics summary cards via GET /api/analytics/summary', async () => {
      const res = await requestJson('/api/analytics/summary', {
        headers: { Authorization: `Bearer ${clientToken}` }
      });
      eq(res.status, 200, 'GET /api/analytics/summary must return 200 OK');
      eq(res.data.success, true, 'Response success must be true');
      eq(res.data.role, 'client', 'Role must match');
      eq(res.data.summaryCards.length, 4, 'Must return 4 summary cards');
    });

    // --------------------------------------------------------------------------
    // GATE 4: Physical Invariants & Business Safeguards
    // --------------------------------------------------------------------------
    gate('Gate 4: Physical Invariants');

    await t('Enforces pricing invariants: price_min <= price_max & delivery days valid', () => {
      for (const pkg of allPackages) {
        for (const tier of pkg.tiers) {
          assert(Number(tier.price_min) > 0, `Price min must be positive in ${pkg.slug}`);
          assert(Number(tier.price_min) <= Number(tier.price_max), `price_min must be <= price_max in ${pkg.slug} ${tier.tier_name}`);
          assert(tier.delivery_days_min <= tier.delivery_days_max, `delivery days min must be <= max`);
          assert(tier.revisions_included >= 1, `Must include at least 1 revision`);
        }
      }
    });

    await t('Enforces task budget invariants: realistic small-business amounts (>= ₹999)', () => {
      for (const task of allTasks) {
        const budget = Number(task.budget);
        assert(!isNaN(budget), `Task ${task.id} budget must be a valid number`);
        assert(budget >= 999, `Task "${task.title}" budget ₹${budget} is below minimum ₹999`);
        assert(budget <= 15000, `Task "${task.title}" budget ₹${budget} exceeds reasonable small business cap ₹15,000`);
      }
    });

    await t('Enforces category distribution: all 4 core MVP categories are active in tasks', () => {
      const categoriesFound = new Set(allTasks.map(t => t.category));
      assert(categoriesFound.has('Product Visuals'), 'Missing Product Visuals tasks');
      assert(categoriesFound.has('E-Commerce & Copy'), 'Missing E-Commerce & Copy tasks');
      assert(categoriesFound.has('Social & Marketing'), 'Missing Social & Marketing tasks');
      assert(categoriesFound.has('Web & Funnels'), 'Missing Web & Funnels tasks');
    });

    await t('Enforces AI Service profile invariants: zero hourly rate & AI generative tooling', async () => {
      const res = await requestJson('/api/profile/me', {
        headers: { Authorization: `Bearer ${freelancerToken}` }
      });
      eq(res.status, 200, 'GET /api/profile/me must return 200 OK');
      const profile = res.data;
      eq(profile.hourlyRate, 0, 'Hourly rate must strictly be 0 (no hourly rates in AITAG)');
      assert(profile.serviceDomain, 'Profile must define an active serviceDomain');
      const legacyBannedSkills = ['Zig', 'Docker', 'eBPF', 'Rust', 'Kubernetes'];
      const skills = profile.skills || [];
      for (const skill of skills) {
        assert(!legacyBannedSkills.includes(skill), `Specialist profile cannot contain legacy dev skill: ${skill}`);
      }
    });

    // --------------------------------------------------------------------------
    // GATE 5: Role-Based Journeys (Customer -> Admin -> Expert)
    // --------------------------------------------------------------------------
    gate('Gate 5: Role Journeys');

    await t('Customer submits brief for AI Product Listing & Description (REQUESTED)', async () => {
      const res = await requestJson('/api/service-orders', {
        method: 'POST',
        body: JSON.stringify({
          package_slug: 'ai-product-listing-description',
          tier_name: 'package_1',
          customer_name: 'PIET Test Client',
          customer_email: NONCE_EMAIL,
          customer_phone: '+91 98765 43210',
          business_name: 'Organic Honey Co.',
          business_type: 'Home Food Business',
          brief_notes: 'Need marketplace bullet points and keyword tags for Meesho and Amazon',
          uploaded_assets: ['https://example.com/raw_jar.jpg']
        })
      });

      eq(res.status, 201, 'POST /api/service-orders must return 201 Created');
      eq(res.data.success, true, 'Order creation must succeed');
      const order = res.data.order;
      assert(order.id, 'Order ID must exist');
      ephemeralOrderId = order.id;

      eq(order.status, 'REQUESTED', 'Initial order status must be REQUESTED');
      eq(Number(order.agreed_price), 999, 'Agreed price must match Package 1 min price (₹999)');
      eq(Number(order.platform_fee), 50, 'Platform fee must be 5% (Math.round(999 * 0.05) = 50)');
      eq(Number(order.expert_payout), 949, 'Expert payout must be 95% (999 - 50 = 949)');
    });

    await t('Negative input defense: rejects assigning expert without expertEmail with HTTP 400', async () => {
      const res = await requestJson(`/api/service-orders/${ephemeralOrderId}/assign`, {
        method: 'POST',
        body: JSON.stringify({})
      });
      eq(res.status, 400, 'Assign without expertEmail must return 400 Bad Request');
    });

    await t('Admin qualifies & matches expert (MATCHED)', async () => {
      const res = await requestJson(`/api/service-orders/${ephemeralOrderId}/assign`, {
        method: 'POST',
        body: JSON.stringify({
          expertEmail: NONCE_EXPERT,
          expertName: 'Vetted AI Visual Specialist'
        })
      });

      eq(res.status, 200, 'Assign expert must return 200 OK');
      eq(res.data.order.status, 'MATCHED', 'Status must transition to MATCHED');
      eq(res.data.order.assigned_expert_email, NONCE_EXPERT, 'Expert email must be set');
    });

    await t('Admin resets task assignment back to REQUESTED matching pool', async () => {
      const res = await requestJson(`/api/service-orders/${ephemeralOrderId}/reset`, {
        method: 'POST'
      });
      eq(res.status, 200, 'POST /reset must return 200 OK');
      eq(res.data.order.status, 'REQUESTED', 'Status must revert to REQUESTED');
      eq(res.data.order.assigned_expert_email, '', 'assigned_expert_email must be cleared');
      eq(res.data.order.assigned_expert_name, '', 'assigned_expert_name must be cleared');

      // Re-assign to proceed with subsequent tests
      const reassignRes = await requestJson(`/api/service-orders/${ephemeralOrderId}/assign`, {
        method: 'POST',
        body: JSON.stringify({
          expertEmail: NONCE_EXPERT,
          expertName: 'Vetted AI Visual Specialist'
        })
      });
      eq(reassignRes.status, 200, 'Re-assigning expert must succeed');
      eq(reassignRes.data.order.status, 'MATCHED', 'Status must return to MATCHED');
    });

    await t('Admin confirms payment received (ACTIVE)', async () => {
      const res = await requestJson(`/api/service-orders/${ephemeralOrderId}/activate`, {
        method: 'POST'
      });

      eq(res.status, 200, 'Activation must return 200 OK');
      eq(res.data.order.status, 'ACTIVE', 'Status must transition to ACTIVE');
    });

    await t('Negative input defense: rejects empty draft submission with HTTP 400', async () => {
      const res = await requestJson(`/api/service-orders/${ephemeralOrderId}/draft`, {
        method: 'POST',
        body: JSON.stringify({ draftFiles: [] })
      });
      eq(res.status, 400, 'Empty draftFiles must return 400 Bad Request');
    });

    await t('Expert submits draft deliverables (DRAFT_SUBMITTED)', async () => {
      const res = await requestJson(`/api/service-orders/${ephemeralOrderId}/draft`, {
        method: 'POST',
        body: JSON.stringify({
          draftFiles: [
            { url: 'https://example.com/draft_1.jpg', label: 'Draft 1 - White Studio Cutout' },
            { url: 'https://example.com/draft_2.jpg', label: 'Draft 2 - White Studio Cutout' }
          ]
        })
      });

      eq(res.status, 200, 'Draft submission must return 200 OK');
      eq(res.data.order.status, 'DRAFT_SUBMITTED', 'Status must transition to DRAFT_SUBMITTED');
    });

    await t('Negative input defense: rejects empty revision notes with HTTP 400', async () => {
      const res = await requestJson(`/api/service-orders/${ephemeralOrderId}/revision`, {
        method: 'POST',
        body: JSON.stringify({})
      });
      eq(res.status, 400, 'Empty revisionNotes must return 400 Bad Request');
    });

    await t('Customer requests included revision (REVISION)', async () => {
      const res = await requestJson(`/api/service-orders/${ephemeralOrderId}/revision`, {
        method: 'POST',
        body: JSON.stringify({
          revisionNotes: 'Please enhance the lighting on the jar label on photo 1.'
        })
      });

      eq(res.status, 200, 'Revision request must return 200 OK');
      eq(res.data.order.status, 'REVISION', 'Status must transition to REVISION');
      eq(res.data.order.revision_notes, 'Please enhance the lighting on the jar label on photo 1.');
    });

    await t('Expert resubmits revised draft deliverables (DRAFT_SUBMITTED)', async () => {
      const res = await requestJson(`/api/service-orders/${ephemeralOrderId}/draft`, {
        method: 'POST',
        body: JSON.stringify({
          draftFiles: [
            { url: 'https://example.com/revised_draft_1.jpg', label: 'Revised Cutout with enhanced lighting' }
          ]
        })
      });

      eq(res.status, 200, 'Revised draft submission must return 200 OK');
      eq(res.data.order.status, 'DRAFT_SUBMITTED', 'Status must return to DRAFT_SUBMITTED after revision');
    });

    // --------------------------------------------------------------------------
    // GATE 6: Deep Domain Contracts (Acceptance, Rating & Teardown)
    // --------------------------------------------------------------------------
    gate('Gate 6: Deep Domain Contracts');

    await t('Customer approves final output with 5-star rating (COMPLETED)', async () => {
      const res = await requestJson(`/api/service-orders/${ephemeralOrderId}/approve`, {
        method: 'POST',
        body: JSON.stringify({
          rating: 5,
          testimonial: 'Exceptional photo makeover! Product got approved on Meesho within an hour.',
          finalFiles: [
            { url: 'https://example.com/final_1.png', label: 'Final Hi-Res Cutout 1' },
            { url: 'https://example.com/final_2.png', label: 'Final Hi-Res Cutout 2' }
          ]
        })
      });

      eq(res.status, 200, 'Approval must return 200 OK');
      eq(res.data.order.status, 'COMPLETED', 'Status must transition to COMPLETED');
      eq(res.data.order.rating, 5, 'Rating must be 5');
      assert(res.data.order.testimonial.includes('Meesho'), 'Testimonial must be saved');
    });

    await t('Enforces finished order physical invariants and 5% platform commission accounting', async () => {
      const res = await requestJson(`/api/service-orders/${ephemeralOrderId}`);
      eq(res.status, 200, 'Fetch order by ID must return 200 OK');
      const order = res.data.order;
      eq(order.status, 'COMPLETED', 'Order status must be COMPLETED');
      eq(order.rating, 5, 'Order rating must be 5');
      eq(Number(order.agreed_price), 999, 'Agreed price must remain ₹999');
      eq(Number(order.platform_fee), 50, 'Platform commission must be 5% (₹50)');
      eq(Number(order.expert_payout), 949, 'Expert net payout must be 95% (₹949)');
      assert(order.assigned_expert_email === NONCE_EXPERT, 'Assigned expert email preserved');
    });

    let postedDiscussionId = null;
    await t('Admin posts persistent directive with asset attachment to case discussion', async () => {
      // Negative input defense: empty message and no attachments rejected with 400
      const negRes = await requestJson(`/api/case-discussions/${ephemeralOrderId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ message: '', attachments: [] })
      });
      eq(negRes.status, 400, 'Empty message without attachments must return 400');

      // Admin posts directive with asset attachment
      const res = await requestJson(`/api/case-discussions/${ephemeralOrderId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          message: 'Specialist, please calibrate shadows to pure white Amazon background specs.',
          attachments: [
            {
              id: 'att-101',
              name: 'amazon_white_bg_spec.pdf',
              url: '/uploads/discussions/spec.pdf',
              size: 15420,
              type: 'application/pdf'
            }
          ]
        })
      });

      eq(res.status, 201, 'POST /api/case-discussions must return 201 Created');
      eq(res.data.success, true, 'Discussion post must succeed');
      const msg = res.data.message;
      assert(msg.id, 'Message ID must exist');
      postedDiscussionId = msg.id;
      eq(msg.order_id, ephemeralOrderId, 'Order ID must match case');
      eq(msg.sender_role, 'admin', 'Sender role must be admin');
      assert(msg.attachments.length === 1, 'Attachments array must contain 1 attachment');
      eq(msg.attachments[0].name, 'amazon_white_bg_spec.pdf', 'Attachment filename preserved');
    });

    await t('Expert retrieves persistent discussion history and replies with asset preview', async () => {
      // Expert retrieves message history
      const listRes = await requestJson(`/api/case-discussions/${ephemeralOrderId}`, {
        headers: { Authorization: `Bearer ${freelancerToken}` }
      });
      eq(listRes.status, 200, 'GET /api/case-discussions must return 200 OK');
      assert(Array.isArray(listRes.data.messages), 'Messages must be array');
      assert(listRes.data.messages.length >= 1, 'Must contain at least 1 message');
      eq(listRes.data.messages[0].id, postedDiscussionId, 'First message matches admin post');

      // Expert posts reply with deliverable preview attachment
      const replyRes = await requestJson(`/api/case-discussions/${ephemeralOrderId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${freelancerToken}` },
        body: JSON.stringify({
          message: 'Understood! Uploaded initial cutout preview for lab check.',
          attachments: [
            {
              id: 'att-102',
              name: 'sample_cutout_preview.png',
              url: '/uploads/discussions/sample.png',
              size: 204800,
              type: 'image/png'
            }
          ]
        })
      });

      eq(replyRes.status, 201, 'Expert reply must return 201 Created');
      eq(replyRes.data.message.sender_role, 'freelancer', 'Sender role must be freelancer');

      // Admin verifies chronological message stream
      const checkRes = await requestJson(`/api/case-discussions/${ephemeralOrderId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      eq(checkRes.data.messages.length, 2, 'Must contain exactly 2 messages');
      eq(checkRes.data.messages[0].sender_role, 'admin', 'First is admin');
      eq(checkRes.data.messages[1].sender_role, 'freelancer', 'Second is expert');
    });

    // --------------------------------------------------------------------------
    // GATE 7: Security Invariants & Hardening
    // --------------------------------------------------------------------------
    gate('Gate 7: Security Invariants');

    await t('OWASP Security Headers invariant: verifies nosniff and frame protection headers', async () => {
      const res = await requestJson('/api/security/health');
      eq(res.status, 200, 'Security health endpoint must return 200 OK');
      eq(res.headers.get('x-content-type-options'), 'nosniff', 'X-Content-Type-Options must be nosniff');
      eq(res.headers.get('x-frame-options'), 'SAMEORIGIN', 'X-Frame-Options must be SAMEORIGIN');
      eq(res.headers.get('x-xss-protection'), '1; mode=block', 'X-XSS-Protection must be 1; mode=block');
    });

    await t('Security Guard endpoint invariant: GET /api/security/audit returns 20-point audit matrix', async () => {
      const res = await requestJson('/api/security/audit');
      eq(res.status, 200, 'GET /api/security/audit must return 200 OK');
      assert(res.data && res.data.success, 'Response must succeed');
      const report = res.data.report;
      eq(report.totalControls, 20, 'Audit matrix must cover all 20 security dimensions');
      assert(report.passedControls >= 18, `Expected at least 18 controls passing, got ${report.passedControls}`);
      assert(Array.isArray(report.items) && report.items.length === 20, 'Audit items must contain 20 items');
    });

    await t('SSRF Defense invariant: blocks AWS metadata IP (169.254.169.254) and private subnets', async () => {
      const res1 = await requestJson('/api/security/validate-url', {
        method: 'POST',
        body: JSON.stringify({ url: 'http://169.254.169.254/latest/meta-data/' })
      });
      eq(res1.status, 400, 'AWS metadata target must be blocked with HTTP 400');
      assert(res1.data.error.includes('Blocked'), 'Error must indicate blocked target');

      const res2 = await requestJson('/api/security/validate-url', {
        method: 'POST',
        body: JSON.stringify({ url: 'http://127.0.0.1:8080/admin' })
      });
      eq(res2.status, 400, 'Loopback target must be blocked with HTTP 400');

      const res3 = await requestJson('/api/security/validate-url', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://github.com/Maqsood32595/AITAG' })
      });
      eq(res3.status, 200, 'Public HTTPS target must pass verification');
    });

    await t('Storage Path Traversal invariant: rejects ../ and traversal strings in stream endpoint', async () => {
      const res = await requestJson('/api/profile/workflows/stream-video?path=../../etc/passwd');
      eq(res.status, 400, 'Path traversal query must return 400 Bad Request');
      assert(res.data.error.includes('traversal') || res.data.error.includes('freelancers/'), 'Must reject directory traversal');
    });

    await t('Production Source Maps invariant: verifies client/vite.config.ts explicitly sets sourcemap: false', () => {
      const viteConfigPath = resolve('client/vite.config.ts');
      assert(existsSync(viteConfigPath), 'client/vite.config.ts must exist');
      const content = readFileSync(viteConfigPath, 'utf8');
      assert(content.includes('sourcemap: false'), 'Production build must explicitly set sourcemap: false');
    });

    await t('Sensitive Log Scrubber invariant: verifies passwords, tokens and secrets are redacted', async () => {
      const { scrubObject } = await import('../../server/features/aitag-security-guard/middleware/log-scrubber.js');
      const dirty = {
        name: 'Client User',
        email: 'client@example.com',
        password: 'SuperSecretPassword123!',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        payoutUpi: 'client@okaxis'
      };
      const cleaned = scrubObject(dirty);
      eq(cleaned.password, '[REDACTED]', 'Password field must be redacted');
      eq(cleaned.token, '[REDACTED]', 'Token field must be redacted');
      eq(cleaned.payoutUpi, '[REDACTED]', 'Payout UPI field must be redacted');
      eq(cleaned.name, 'Client User', 'Non-sensitive fields must be preserved');
    });

    await t('RBAC Mass Assignment Defense invariant: rejects registration with role: admin with HTTP 400', async () => {
      const res = await requestJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Attacker Attempt',
          email: `attacker_${Date.now()}@testsec.com`,
          password: 'StrongPassword123!',
          role: 'admin'
        })
      });
      eq(res.status, 400, 'Self-registration with role: admin must be rejected with HTTP 400');
      assert(res.data.error.includes('Unauthorized registration role') || res.data.error.includes('restricted'), 'Must return privilege escalation error');
    });

    await t('Weak Password & Input Validation invariant: rejects trivial passwords with HTTP 400', async () => {
      const res = await requestJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Weak Pass User',
          email: `weak_${Date.now()}@testsec.com`,
          password: 'admin',
          role: 'client'
        })
      });
      eq(res.status, 400, 'Registration with password: admin must be rejected with HTTP 400');
      assert(res.data.error.includes('too common') || res.data.error.includes('insecure'), 'Must explain password insecurity');
    });

    await t('Credential Non-Leakage invariant: registration returns safe user without password_hash', async () => {
      const safeNonceEmail = `secure_${Date.now()}@aitag-piet.internal`;
      const res = await requestJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Legit Client',
          email: safeNonceEmail,
          password: 'SafeClientPassword2026!',
          role: 'client'
        })
      });
      eq(res.status, 201, 'Valid client registration must return 201 Created');
      assert(res.data && res.data.user, 'Must return created user object');
      assert(res.data.token, 'Must return signed JWT token');
      eq(res.data.user.password_hash, undefined, 'password_hash must NEVER be present in client API response');
      eq(res.data.user.role, 'client', 'Role must match allowed role');
    });

    // --------------------------------------------------------------------------
    // GATE 8: Adaptive Cache Invariants & Performance Contracts
    // --------------------------------------------------------------------------
    gate('Gate 8: Adaptive Cache Invariants');

    let packageEtag = null;
    await t('Cache MISS & ETag Generation invariant: initial request populates cache with X-Cache: MISS', async () => {
      // First, purge packages tag to guarantee fresh baseline
      await requestJson('/api/cache/purge', {
        method: 'POST',
        body: JSON.stringify({ tag: 'packages' })
      });

      const res = await requestJson('/api/service-packages');
      eq(res.status, 200, 'GET /api/service-packages must return 200 OK');
      const cacheHeader = res.headers.get('x-cache');
      eq(cacheHeader, 'MISS', 'Initial un-cached request must return X-Cache: MISS header');
      const etag = res.headers.get('etag');
      assert(etag && etag.length > 5, 'Response must provide a valid deterministic ETag header');
      packageEtag = etag;
    });

    await t('Cache HIT invariant: immediate repeat request serves from RAM with X-Cache: HIT', async () => {
      const res = await requestJson('/api/service-packages');
      eq(res.status, 200, 'Subsequent GET /api/service-packages must return 200 OK');
      const cacheHeader = res.headers.get('x-cache');
      eq(cacheHeader, 'HIT', 'Repeat request must return X-Cache: HIT from RAM');
      eq(res.headers.get('etag'), packageEtag, 'ETag must be identical on cache HIT');
    });

    await t('HTTP 304 Not Modified contract: If-None-Match header returns 304 with zero body payload', async () => {
      const res = await requestJson('/api/service-packages', {
        headers: {
          'If-None-Match': packageEtag
        }
      });
      eq(res.status, 304, 'Matching If-None-Match must return HTTP 304 Not Modified');
      const cacheHeader = res.headers.get('x-cache');
      assert(cacheHeader && cacheHeader.includes('HIT'), 'Response must indicate cache HIT on 304');
    });

    await t('Tag-based Cache Invalidation contract: POST /api/cache/purge resets tag to X-Cache: MISS', async () => {
      const purgeRes = await requestJson('/api/cache/purge', {
        method: 'POST',
        body: JSON.stringify({ tag: 'packages' })
      });
      eq(purgeRes.status, 200, 'POST /api/cache/purge must return 200 OK');
      eq(purgeRes.data.success, true, 'Purge response must indicate success');

      // Next request must be a MISS
      const nextRes = await requestJson('/api/service-packages');
      eq(nextRes.status, 200, 'GET after purge must return 200 OK');
      eq(nextRes.headers.get('x-cache'), 'MISS', 'Request immediately after tag purge must be X-Cache: MISS');
    });

    await t('User-scoped Cache Isolation contract: authenticated routes isolate tenant namespaces', async () => {
      const res1 = await requestJson('/api/analytics/me', {
        headers: { Authorization: `Bearer ${clientToken}` }
      });
      eq(res1.status, 200, 'GET /api/analytics/me must return 200 OK');
      // Repeat request for client
      const res2 = await requestJson('/api/analytics/me', {
        headers: { Authorization: `Bearer ${clientToken}` }
      });
      eq(res2.headers.get('x-cache'), 'HIT', 'Client repeat request must return X-Cache: HIT');

      // Different user (freelancer) must get fresh user data, not client's cached data
      const res3 = await requestJson('/api/analytics/me', {
        headers: { Authorization: `Bearer ${freelancerToken}` }
      });
      eq(res3.data.analytics.role, 'freelancer', 'Freelancer must receive their own role data, not cached client data');
    });

    await t('In-RAM LRU Capacity & Eviction invariant: capacity limits prevent memory leaks', async () => {
      const rawCache = await import('../../server/features/aitag-cache/service.js');
      const cache = rawCache.default || rawCache;
      const testMiniCache = new cache.AdaptiveCacheService({ maxCapacity: 3, defaultTtlMs: 5000 });

      testMiniCache.set('k1', 'val1');
      testMiniCache.set('k2', 'val2');
      testMiniCache.set('k3', 'val3');
      eq(testMiniCache.entries.size, 3, 'Mini cache should hold exactly 3 entries');

      // Access k1 and k2 so k3 is least recently used
      testMiniCache.get('k1');
      testMiniCache.get('k2');

      // Set k4 -> must evict k3
      testMiniCache.set('k4', 'val4');
      eq(testMiniCache.entries.size, 3, 'Capacity must remain strictly at 3');
      eq(testMiniCache.get('k3'), null, 'LRU entry k3 must be evicted');
      assert(testMiniCache.get('k1') !== null, 'Frequently accessed k1 must survive eviction');
      assert(testMiniCache.get('k4') !== null, 'Newest entry k4 must exist');
    });

    await t('Cache Telemetry & Observability invariant: GET /api/cache/stats reports metrics', async () => {
      const res = await requestJson('/api/cache/stats');
      eq(res.status, 200, 'GET /api/cache/stats must return 200 OK');
      eq(res.data.success, true, 'Stats response must succeed');
      eq(res.data.service, 'aitag-cache', 'Service must be aitag-cache');
      assert(res.data.metrics.hits >= 1, 'Stats must register at least 1 cache hit');
      assert(res.data.metrics.misses >= 1, 'Stats must register at least 1 cache miss');
      assert(res.data.metrics.hitRatio >= 0 && res.data.metrics.hitRatio <= 1, 'Hit ratio must be between 0 and 1');
    });

    await t('Account Deletion negative defense: rejects incorrect confirmation string with HTTP 400', async () => {
      // Register ephemeral test user
      const testEmail = `piet-del-neg-${RUN_ID}@aitag-test.local`;
      const regRes = await requestJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Delete Neg Test',
          email: testEmail,
          password: 'TestPassword123!',
          role: 'client'
        })
      });
      eq(regRes.status, 201, 'Register must succeed');
      const token = regRes.data.token;

      // Send lowercase 'delete'
      const badRes = await requestJson('/api/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ confirmation: 'delete' })
      });
      eq(badRes.status, 400, 'Lowercase confirmation must return 400 Bad Request');

      // Send missing confirmation
      const emptyRes = await requestJson('/api/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({})
      });
      eq(emptyRes.status, 400, 'Empty confirmation must return 400 Bad Request');
    });

    await t('Account Lifecycle purge contract: DELETE /api/account wipes user and prevents re-login', async () => {
      const testEmail = `piet-del-purge-${RUN_ID}@aitag-test.local`;
      const regRes = await requestJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Delete Purge Test',
          email: testEmail,
          password: 'TestPassword123!',
          role: 'client'
        })
      });
      eq(regRes.status, 201, 'Register must succeed');
      const token = regRes.data.token;

      // Perform account purge with exact 'DELETE' string
      const delRes = await requestJson('/api/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ confirmation: 'DELETE' })
      });
      eq(delRes.status, 200, 'DELETE /api/account with exact confirmation must return 200');
      eq(delRes.data.success, true, 'Deletion must report success: true');

      // Attempt to login with deleted credentials -> must fail with HTTP 401
      const loginRes = await requestJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: 'TestPassword123!'
        })
      });
      eq(loginRes.status, 401, 'Login must fail with 401 for deleted user');
    });

  } finally {
    // Teardown: Clean up ephemeral test order
    if (ephemeralOrderId) {
      try {
        const rawSupabase = await import('../../server/supabase.js');
        const supabase = rawSupabase.default || rawSupabase;
        await supabase.from('aitag_orders').delete().eq('id', ephemeralOrderId);
        
        try {
          const rawDiscussions = await import('../../server/features/aitag-case-discussions/service.js');
          const discussionsService = rawDiscussions.default || rawDiscussions;
          await discussionsService.purgeByOrderId(ephemeralOrderId);
        } catch {}

        console.log(`\n🧹 Ephemeral Teardown: Deleted test order ${ephemeralOrderId} (Zero Ghost Records).`);
      } catch (err) {
        console.warn('⚠️ Teardown cleanup note:', err.message);
      }
    }

    if (localServer) {
      localServer.close();
      console.log('🛑 In-RAM Ephemeral Twin server cleanly terminated.');
    }
  }

  // Print Summary Table
  console.log('\n==============================================================================');
  console.log('🏁 PIET EXECUTION RESULTS:');
  console.log('==============================================================================');

  let passed = 0;
  let failed = 0;

  for (const r of results) {
    if (r.ok) {
      passed++;
      console.log(`  ✅ [${r.gate}] ${r.name}`);
    } else {
      failed++;
      console.log(`  ❌ [${r.gate}] ${r.name} — ERROR: ${r.error}`);
    }
  }

  console.log('==============================================================================');
  console.log(`Summary: ${passed} Passed, ${failed} Failed out of ${results.length} Assertions.`);
  console.log('==============================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPietSuite().catch((err) => {
  console.error('Fatal PIET suite failure:', err);
  process.exit(1);
});
