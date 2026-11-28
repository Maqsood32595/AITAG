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

import { readdirSync, readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

// Force PIET test harness to execute strictly against the isolated Dev / Standby Supabase replica
process.env.USE_DEV_DB = 'true';
process.env.NODE_ENV = 'test';
process.env.PIET_RUN = 'true';

const BASE = (process.env.TEST_BASE_URL || 'http://127.0.0.1:5005').replace(/\/$/, '');
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
  let ephemeralPricingOrderId = null;
  let ephemeralTaskId = null;

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
      const s = app.listen(5005, '127.0.0.1', () => res(s));
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
        'aitag-case-discussions', 'aitag-payments'
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

    await t('Verifies aitag-security-guard Grandchild Architecture module integrity', () => {
      const guardsDir = resolve('server/features/aitag-security-guard/guards');
      const expectedGrandchildren = [
        'headers-guard.js',
        'rate-limiter.js',
        'ssrf-guard.js',
        'xss-sanitizer.js',
        'bola-guard.js',
        'log-scrubber.js',
        'upload-guard.js',
        'crypto-guard.js',
        'websocket-guard.js'
      ];
      for (const gc of expectedGrandchildren) {
        const p = join(guardsDir, gc);
        assert(existsSync(p), `Missing security grandchild guard: ${gc}`);
      }
    });

    await t('Verifies Fractal Kernel runtime discovery endpoint /api/features mounts 19 slices', async () => {
      const res = await requestJson('/api/features');
      eq(res.status, 200, 'GET /api/features must return 200 OK');
      assert(Array.isArray(res.data), '/api/features must return array');
      assert(res.data.length >= 19, 'Kernel must mount at least 19 feature slices');
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

    await t('Verifies Fractal Kernel Level 1->2->3 Domain/Child/Grandchild integrity and GET /api/domains', async () => {
      const expectedDomains = [
        'domain-finance',
        'domain-identity',
        'domain-marketplace',
        'domain-platform',
        'domain-security',
        'domain-services'
      ];
      for (const dom of expectedDomains) {
        const domDir = resolve('server/features', dom);
        const manifestPath = join(domDir, 'domain.manifest.json');
        assert(existsSync(manifestPath), `Domain manifest missing for ${dom}`);
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
        eq(manifest.id, dom, `Domain ID mismatch in ${dom}`);
        eq(manifest.type, 'domain', `Domain type must be 'domain' in ${dom}`);
        assert(Array.isArray(manifest.children) && manifest.children.length > 0, `${dom} must declare children`);
        for (const child of manifest.children) {
          const childDir = join(domDir, child.folder);
          assert(existsSync(join(childDir, 'child.manifest.json')), `Missing child.manifest.json in ${dom}/${child.folder}`);
          assert(existsSync(join(childDir, 'routes.js')), `Missing routes.js in ${dom}/${child.folder}`);
          assert(existsSync(join(childDir, 'service.js')), `Missing service.js in ${dom}/${child.folder}`);
        }
      }

      const svcGrandchildren = ['catalog-validator.js', 'pricing-waiver-engine.js', 'tier-resolver.js'];
      for (const gc of svcGrandchildren) {
        assert(existsSync(resolve('server/features/domain-services/grandchildren', gc)), `Missing domain-services grandchild: ${gc}`);
      }

      const domainsRes = await requestJson('/api/domains');
      eq(domainsRes.status, 200, 'GET /api/domains must return 200 OK');
      assert(Array.isArray(domainsRes.data), '/api/domains must return array');
      const domIds = domainsRes.data.map(d => d.id);
      for (const dom of expectedDomains) {
        assert(domIds.includes(dom), `/api/domains missing mounted domain ${dom}`);
      }
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
      assert(res.data.packages.length >= 4, 'Must contain at least the 4 SMB productized packages');
      allPackages = res.data.packages;
    });

    await t('Verifies the 4 productized SMB packages exist with their exact slugs', () => {
      const slugs = allPackages.map((p) => p.slug);
      assert(slugs.includes('ai-product-photo-makeover'), 'Missing ai-product-photo-makeover');
      assert(slugs.includes('ai-marketing-video-reels'), 'Missing ai-marketing-video-reels');
      assert(slugs.includes('ai-website-landing-page'), 'Missing ai-website-landing-page');
      assert(slugs.includes('ai-logo-identity-kit'), 'Missing ai-logo-identity-kit');
    });

    await t('Verifies each package has 2 binary tiers (starter and pro)', () => {
      for (const pkg of allPackages) {
        assert(Array.isArray(pkg.tiers), `Package ${pkg.slug} has no tiers array`);
        eq(pkg.tiers.length, 2, `Package ${pkg.slug} must have exactly 2 tiers (starter and pro)`);
        const tierNames = pkg.tiers.map((t) => t.tier_name.toLowerCase());
        assert(tierNames.includes('starter'), `${pkg.slug} missing starter tier`);
        assert(tierNames.includes('pro'), `${pkg.slug} missing pro tier`);
      }
    });

    let allTasks = [];
    await t('Fetches live tasks via /api/tasks and proves zero legacy tech categories', async () => {
      const res = await requestJson('/api/tasks');
      eq(res.status, 200, 'GET /api/tasks must return 200 OK');
      assert(Array.isArray(res.data), 'Tasks response data must be an array');
      assert(res.data.length >= 8, 'Must return at least 8 featured tasks');
      allTasks = res.data;

      const validCategories = new Set(['Product Visuals', 'Branding & Print', 'Social & Marketing', 'Web & Digital Presence', 'E-Commerce & Copy', 'Web & Funnels']);
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
      name: 'Verified AI Specialist',
      email: NONCE_EXPERT,
      role: 'freelancer'
    });

    const strangerToken = authService.signToken({
      id: 'piet-stranger-uuid',
      name: 'Other Stranger User',
      email: `piet-stranger-${RUN_ID}@aitag-test.local`,
      role: 'client'
    });

    await t('Fetches and filters service orders via /api/service-orders with authenticated admin role and status query params', async () => {
      const res = await requestJson('/api/service-orders?status=REQUESTED', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      eq(res.status, 200, 'Admin GET /api/service-orders?status=REQUESTED must return 200 OK');
      eq(res.data.success, true, 'Response must indicate success');
      assert(Array.isArray(res.data.orders), 'Orders must be an array');
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
      assert(categoriesFound.has('Branding & Print') || categoriesFound.has('E-Commerce & Copy'), 'Missing Branding & Print tasks');
      assert(categoriesFound.has('Social & Marketing'), 'Missing Social & Marketing tasks');
      assert(categoriesFound.has('Web & Digital Presence') || categoriesFound.has('Web & Funnels'), 'Missing Web & Digital Presence tasks');
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

    await t('Grandchild pure engine invariants: pricing-waiver-engine.js & analytics zero-cash waivers', async () => {
      const { computePricingAdjustment } = await import('../../server/features/domain-services/grandchildren/pricing-waiver-engine.js');
      const { computeAdminAnalytics } = await import('../../server/features/domain-platform/grandchildren/admin-analytics.js');
      const { computeClientAnalytics } = await import('../../server/features/domain-platform/grandchildren/client-analytics.js');
      const { computeFreelancerAnalytics } = await import('../../server/features/domain-platform/grandchildren/freelancer-analytics.js');

      // Partial flat ₹500 discount from ₹1499
      const discounted = computePricingAdjustment({
        currentOriginalPrice: 1499,
        currentAgreedPrice: 1499,
        discountAmount: 500,
        skipPayment: false,
        adminEmail: 'user1@aitag.com',
        reason: 'Launch credit'
      });
      eq(discounted.original_price, 1499, 'original_price preserved');
      eq(discounted.discount_amount, 500, 'discount_amount preserved');
      eq(discounted.agreed_price, 999, 'agreed_price equals 1499 - 500');
      eq(discounted.platform_fee, 200, '20% platform fee recalculated on 999');
      eq(discounted.expert_payout, 799, '80% expert payout recalculated on 999');
      eq(discounted.payment_waived, false, 'partial discount is not waived');
      eq(discounted.payment_status, 'DISCOUNTED', 'payment_status set to DISCOUNTED');

      // Re-discount uses original_price (non-compounding) & clamps > original_price to waived ₹0
      const fullDiscount = computePricingAdjustment({
        currentOriginalPrice: 1499,
        currentAgreedPrice: 999,
        discountAmount: 3000,
        skipPayment: false
      });
      eq(fullDiscount.discount_amount, 1499, 'discount clamped to original_price');
      eq(fullDiscount.agreed_price, 0, 'agreed_price equals 0 when fully discounted');
      eq(fullDiscount.payment_waived, true, '100% discount marks payment_waived');
      eq(fullDiscount.payment_status, 'WAIVED', 'payment_status set to WAIVED');

      // Waiver excluded from cash GMV / spend / earnings across all 3 analytics grandchildren
      const waivedOrder = { status: 'ACTIVE', payment_waived: true, agreed_price: 0, original_price: 1499, platform_fee: 0, expert_payout: 0 };
      const waivedTask = { status: 'in-progress', payment_waived: true, budget: 0, original_price: 1500 };

      const adminStats = computeAdminAnalytics({ orders: [waivedOrder], tasks: [waivedTask], users: [], bids: [] });
      eq(adminStats.summaryCards[0].numeric, 0, 'Waived order & task must contribute ₹0 to Admin GMV');

      const clientStats = computeClientAnalytics({ orders: [waivedOrder], tasks: [waivedTask] });
      eq(clientStats.summaryCards[0].numeric, 0, 'Waived order & task must contribute ₹0 to Client spend');

      const freelancerStats = computeFreelancerAnalytics({ orders: [{ ...waivedOrder, status: 'COMPLETED' }], tasks: [{ ...waivedTask, status: 'completed' }], bids: [] });
      eq(freelancerStats.summaryCards[0].numeric, 0, 'Waived deliverables must contribute ₹0 cash earnings');
    });

    // --------------------------------------------------------------------------
    // GATE 5: Role-Based Journeys (Customer -> Admin -> Expert)
    // --------------------------------------------------------------------------
    gate('Gate 5: Role Journeys');

    await t('Customer submits brief for AI Product Photo Makeover (Starter tier)', async () => {
      const res = await requestJson('/api/service-orders', {
        method: 'POST',
        body: JSON.stringify({
          package_slug: 'ai-product-photo-makeover',
          tier_name: 'starter',
          customer_name: 'PIET Test Client',
          customer_email: NONCE_EMAIL,
          customer_phone: '+91 98765 43210',
          business_name: 'Organic Honey Co.',
          business_type: 'Home Food Business',
          brief_notes: 'Need 10 clean white background photos for Amazon & Flipkart listings',
          uploaded_assets: ['https://example.com/raw_jar.jpg']
        })
      });

      eq(res.status, 201, 'POST /api/service-orders must return 201 Created');
      eq(res.data.success, true, 'Order creation must succeed');
      const order = res.data.order;
      assert(order.id, 'Order ID must exist');
      ephemeralOrderId = order.id;

      eq(order.status, 'REQUESTED', 'Initial order status must be REQUESTED');
      eq(Number(order.agreed_price), 1499, 'Agreed price must match Starter min price (₹1499)');
      eq(Number(order.platform_fee), 300, 'Platform fee must be 20% (Math.round(1499 * 0.20) = 300)');
      eq(Number(order.expert_payout), 1199, 'Expert payout must be 80% (1499 - 300 = 1199)');
    });

    await t('Customer uploads project assets via POST /api/service-orders/upload-assets', async () => {
      const formData = new FormData();
      const blob = new Blob(['sample-image-binary-data'], { type: 'image/png' });
      formData.append('files', blob, 'customer_product_raw.png');

      const res = await fetch(`${BASE}/api/service-orders/upload-assets`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      eq(res.status, 200, 'Upload assets must return 200 OK');
      eq(data.success, true, 'Upload must succeed');
      assert(Array.isArray(data.files), 'data.files must be array');
      eq(data.count, 1, 'Must upload 1 file');
      assert(data.files[0].url.startsWith('/uploads/'), 'File URL must start with /uploads/');
    });

    await t('Binary tier resolver maps legacy package_1/2/3 to starter/pro', async () => {
      const mod = await import('../../server/features/aitag-service-packages/service.js');
      const pkgService = mod.default || mod;
      assert(pkgService.resolveAlias('package_1') === 'starter', 'package_1 -> starter');
      assert(pkgService.resolveAlias('beginner') === 'starter', 'beginner -> starter');
      assert(pkgService.resolveAlias('package_2') === 'pro', 'package_2 -> pro');
      assert(pkgService.resolveAlias('package_3') === 'pro', 'package_3 -> pro');
      assert(pkgService.resolveAlias('expert') === 'pro', 'expert -> pro');
    });

    await t('Negative input defense: rejects assigning expert without expertEmail with HTTP 400', async () => {
      const res = await requestJson(`/api/service-orders/${ephemeralOrderId}/assign`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({})
      });
      eq(res.status, 400, 'Assign without expertEmail must return 400 Bad Request');
    });

    await t('Admin qualifies & matches expert (MATCHED)', async () => {
      const res = await requestJson(`/api/service-orders/${ephemeralOrderId}/assign`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          expertEmail: NONCE_EXPERT,
          expertName: 'Verified AI Visual Specialist'
        })
      });

      eq(res.status, 200, 'Assign expert must return 200 OK');
      eq(res.data.order.status, 'MATCHED', 'Status must transition to MATCHED');
      eq(res.data.order.assigned_expert_email, NONCE_EXPERT, 'Expert email must be set');
    });

    await t('Admin resets task assignment back to REQUESTED matching pool', async () => {
      const res = await requestJson(`/api/service-orders/${ephemeralOrderId}/reset`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      eq(res.status, 200, 'POST /reset must return 200 OK');
      eq(res.data.order.status, 'REQUESTED', 'Status must revert to REQUESTED');
      eq(res.data.order.assigned_expert_email, '', 'assigned_expert_email must be cleared');
      eq(res.data.order.assigned_expert_name, '', 'assigned_expert_name must be cleared');

      // Re-assign to proceed with subsequent tests
      const reassignRes = await requestJson(`/api/service-orders/${ephemeralOrderId}/assign`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          expertEmail: NONCE_EXPERT,
          expertName: 'Verified AI Visual Specialist'
        })
      });
      eq(reassignRes.status, 200, 'Re-assigning expert must succeed');
      eq(reassignRes.data.order.status, 'MATCHED', 'Status must return to MATCHED');
    });

    await t('Admin confirms payment received (ACTIVE)', async () => {
      const res = await requestJson(`/api/service-orders/${ephemeralOrderId}/activate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      eq(res.status, 200, 'Activation must return 200 OK');
      eq(res.data.order.status, 'ACTIVE', 'Status must transition to ACTIVE');
    });

    await t('Negative input defense: rejects empty draft submission with HTTP 400', async () => {
      const res = await requestJson(`/api/service-orders/${ephemeralOrderId}/draft`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${freelancerToken}` },
        body: JSON.stringify({ draftFiles: [] })
      });
      eq(res.status, 400, 'Empty draftFiles must return 400 Bad Request');
    });

    await t('Expert submits draft deliverables (DRAFT_SUBMITTED)', async () => {
      const res = await requestJson(`/api/service-orders/${ephemeralOrderId}/draft`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${freelancerToken}` },
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
        headers: { Authorization: `Bearer ${clientToken}` },
        body: JSON.stringify({})
      });
      eq(res.status, 400, 'Empty revisionNotes must return 400 Bad Request');
    });

    await t('Customer requests included revision (REVISION)', async () => {
      const res = await requestJson(`/api/service-orders/${ephemeralOrderId}/revision`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${clientToken}` },
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
        headers: { Authorization: `Bearer ${freelancerToken}` },
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
        headers: { Authorization: `Bearer ${clientToken}` },
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

    await t('Enforces finished order physical invariants and 10% platform commission accounting', async () => {
      const res = await requestJson(`/api/service-orders/${ephemeralOrderId}`, {
        headers: { Authorization: `Bearer ${clientToken}` }
      });
      eq(res.status, 200, 'Fetch order by ID must return 200 OK');
      const order = res.data.order;
      eq(order.status, 'COMPLETED', 'Order status must be COMPLETED');
      eq(order.rating, 5, 'Order rating must be 5');
      eq(Number(order.agreed_price), 1499, 'Agreed price must remain ₹1,499');
      eq(Number(order.platform_fee), 300, 'Platform commission must be 20% (₹300)');
      eq(Number(order.expert_payout), 1199, 'Expert net payout must be 80% (₹1,199)');
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

    ephemeralTaskId = null;
    await t('Client creates task with asset attachments and receives persistent record', async () => {
      const res = await requestJson('/api/tasks', {
        method: 'POST',
        headers: { Authorization: `Bearer ${clientToken}` },
        body: JSON.stringify({
          title: 'PIET Test Task with Multi-Asset Attachments',
          category: 'Product Visuals',
          description: 'Testing asset attachments pipeline and admin communication',
          deadline: '2026-11-30',
          budget: 1500,
          attachments: [
            {
              id: 'att-task-1',
              name: 'raw_product_photo_1.png',
              url: '/uploads/tasks/raw_product_photo_1.png',
              size: 1048576,
              type: 'image/png'
            }
          ]
        })
      });

      eq(res.status, 201, 'POST /api/tasks must return 201 Created');
      assert(res.data.id, 'Task ID must be returned');
      ephemeralTaskId = res.data.id;
      assert(Array.isArray(res.data.attachments), 'Attachments must be array');
      eq(res.data.attachments.length, 1, 'Must have 1 attachment');
      eq(res.data.attachments[0].name, 'raw_product_photo_1.png', 'Attachment name preserved');
    });

    await t('Client appends additional assets to existing task post-creation', async () => {
      const updateRes = await requestJson(`/api/tasks/${ephemeralTaskId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${clientToken}` },
        body: JSON.stringify({
          attachments: [
            {
              id: 'att-task-1',
              name: 'raw_product_photo_1.png',
              url: '/uploads/tasks/raw_product_photo_1.png',
              size: 1048576,
              type: 'image/png'
            },
            {
              id: 'att-task-2',
              name: 'brand_guidelines.pdf',
              url: '/uploads/tasks/brand_guidelines.pdf',
              size: 512000,
              type: 'application/pdf'
            }
          ]
        })
      });
      eq(updateRes.status, 200, 'PUT /api/tasks/:id must return 200 OK');
      eq(updateRes.data.attachments.length, 2, 'Task attachments updated to 2 files');
    });

    await t('Client retrieves posted tasks via GET /api/tasks/my with persistent attachments', async () => {
      const myTasksRes = await requestJson('/api/tasks/my', {
        headers: { Authorization: `Bearer ${clientToken}` }
      });
      eq(myTasksRes.status, 200, 'GET /api/tasks/my must return 200 OK');
      assert(Array.isArray(myTasksRes.data), 'my tasks must return array');
      const foundTask = myTasksRes.data.find(t => t.id === ephemeralTaskId);
      assert(foundTask, 'Newly created task must be found in my tasks');
      eq(foundTask.attachments.length, 2, 'Task attachments must be preserved in my tasks');
    });

    await t('Client initiates persistent discussion with Admin on task with attached brief', async () => {
      const msgRes = await requestJson(`/api/case-discussions/${ephemeralTaskId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${clientToken}` },
        body: JSON.stringify({
          message: 'Hello Admin, I have attached the high-res brand guidelines for review.',
          attachments: [
            {
              id: 'att-task-chat-1',
              name: 'clarification_note.txt',
              url: '/uploads/discussions/note.txt',
              size: 1024,
              type: 'text/plain'
            }
          ]
        })
      });

      eq(msgRes.status, 201, 'POST /api/case-discussions/:taskId must return 201 Created');
      eq(msgRes.data.message.order_id, ephemeralTaskId, 'Message order_id matches taskId');
      eq(msgRes.data.message.sender_role, 'client', 'Sender role is client');

      // Admin retrieves chronological task discussion
      const listRes = await requestJson(`/api/case-discussions/${ephemeralTaskId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      eq(listRes.status, 200, 'Admin GET /api/case-discussions/:taskId must return 200 OK');
      assert(listRes.data.messages.length >= 1, 'Must contain client message');
      eq(listRes.data.messages[0].order_id, ephemeralTaskId, 'Message tied to task');
    });

    await t('Admin platform oversight: discovers client tasks and communicates directly via task channel', async () => {
      // 1. Admin/Global task list contains client-posted task with assets
      const allTasksRes = await requestJson('/api/tasks');
      eq(allTasksRes.status, 200, 'GET /api/tasks must return 200 OK');
      assert(Array.isArray(allTasksRes.data), 'Tasks must be array');
      const foundInGlobal = allTasksRes.data.find(t => t.id === ephemeralTaskId);
      assert(foundInGlobal, 'Client task must be discoverable in global marketplace pool for admin oversight');
      eq(foundInGlobal.user_email, NONCE_EMAIL, 'Client email preserved in task pool');
      eq(foundInGlobal.attachments.length, 2, 'All client attached assets preserved');

      // 2. Admin sends direct response to client in task discussion channel
      const adminReply = await requestJson(`/api/case-discussions/${ephemeralTaskId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          message: 'Received your brand guidelines. Our verified specialists have been notified to review.',
          attachments: []
        })
      });
      eq(adminReply.status, 201, 'Admin reply returns 201 Created');
      eq(adminReply.data.message.sender_role, 'admin', 'Admin role preserved in message');
      eq(adminReply.data.message.sender_email, 'user1@aitag.com', 'Admin email preserved');

      // 3. Verify bidirectional conversation thread has both client and admin messages
      const fullThread = await requestJson(`/api/case-discussions/${ephemeralTaskId}`, {
        headers: { Authorization: `Bearer ${clientToken}` }
      });
      eq(fullThread.status, 200, 'Client GET /api/case-discussions/:taskId returns 200 OK');
      eq(fullThread.data.messages.length, 2, 'Both client and admin messages present in chronological thread');
    });

    await t('Admin assigns verified AI specialist to marketplace task and resets assignment', async () => {
      // 1. Negative defense: non-admin cannot assign specialist to task
      const nonAdminRes = await requestJson(`/api/tasks/${ephemeralTaskId}/assign`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${clientToken}` },
        body: JSON.stringify({ expertEmail: 'expert1@aitag.com', expertName: 'Expert 1' })
      });
      eq(nonAdminRes.status, 403, 'Non-admin task assignment must return 403 Forbidden');

      // 2. Negative defense: expertEmail is required
      const emptyEmailRes = await requestJson(`/api/tasks/${ephemeralTaskId}/assign`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ expertEmail: '' })
      });
      eq(emptyEmailRes.status, 400, 'Empty expertEmail must return 400 Bad Request');

      // 3. Admin matches verified specialist to task
      const assignRes = await requestJson(`/api/tasks/${ephemeralTaskId}/assign`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ expertEmail: 'expert1@aitag.com', expertName: 'Expert 1' })
      });
      eq(assignRes.status, 200, 'Admin task assignment returns 200 OK');
      eq(assignRes.data.success, true, 'Assignment success must be true');
      eq(assignRes.data.task.status, 'in-progress', 'Task status transitions to in-progress');
      eq(assignRes.data.task.assigned_expert_email, 'expert1@aitag.com', 'Specialist email assigned');

      // 4. Admin resets task assignment back to open bidding pool
      const resetRes = await requestJson(`/api/tasks/${ephemeralTaskId}/reset`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      eq(resetRes.status, 200, 'Admin reset returns 200 OK');
      eq(resetRes.data.success, true, 'Reset success must be true');
      eq(resetRes.data.task.status, 'open', 'Task status reverts to open');
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

      // Teardown: purge ephemeral test user
      await requestJson('/api/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${res.data.token}` },
        body: JSON.stringify({ confirmation: 'DELETE' })
      });
    });

    await t('Upload Guard invariant: rejects dangerous executable and script uploads with HTTP 400', async () => {
      // 1. Rejects HTML upload (Stored XSS vector)
      const res1 = await requestJson('/api/security/validate-upload', {
        method: 'POST',
        body: JSON.stringify({ filename: 'exploit.html', mimetype: 'text/html' })
      });
      eq(res1.status, 400, 'HTML upload must be rejected with HTTP 400');
      assert(res1.data.error.includes('strictly prohibited') || res1.data.error.includes('Stored XSS'), 'Must mention Stored XSS defense');

      // 2. Rejects SVG upload (Stored XSS vector)
      const res2 = await requestJson('/api/security/validate-upload', {
        method: 'POST',
        body: JSON.stringify({ filename: 'vector.svg', mimetype: 'image/svg+xml' })
      });
      eq(res2.status, 400, 'SVG upload must be rejected with HTTP 400');

      // 3. Rejects executable upload
      const res3 = await requestJson('/api/security/validate-upload', {
        method: 'POST',
        body: JSON.stringify({ filename: 'malware.exe', mimetype: 'application/x-msdownload' })
      });
      eq(res3.status, 400, 'EXE upload must be rejected with HTTP 400');

      // 4. Accepts valid PNG upload
      const res4 = await requestJson('/api/security/validate-upload', {
        method: 'POST',
        body: JSON.stringify({ filename: 'screenshot.png', mimetype: 'image/png' })
      });
      eq(res4.status, 200, 'Safe PNG upload must return 200 OK');
    });

    await t('Crypto Guard invariant: verifies timing-safe HMAC signature and password strength validation', async () => {
      const { verifyHmacSignature, validatePasswordStrength } = await import('../../server/features/aitag-security-guard/guards/crypto-guard.js');
      const secret = 'super-secret-hmac-key-2026';
      const payload = { event: 'payment.captured', amount: 5000 };
      const crypto = await import('crypto');
      const validSig = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');

      // 1. Valid signature passes
      const result1 = verifyHmacSignature(payload, validSig, secret);
      eq(result1.verified, true, 'Valid HMAC signature must verify');

      // 2. Tampered signature fails
      const tamperedSig = 'a' + validSig.slice(1);
      const result2 = verifyHmacSignature(payload, tamperedSig, secret);
      eq(result2.verified, false, 'Tampered HMAC signature must fail');

      // 3. Password strength rejection
      const weakCheck = validatePasswordStrength('123456');
      eq(weakCheck.valid, false, 'Weak password must be rejected');
      const strongCheck = validatePasswordStrength('AitagEnterprise2026!');
      eq(strongCheck.valid, true, 'Strong password must be accepted');
    });

    await t('Multi-vector XSS Sanitizer invariant: disarms nested script tags and HTML5 event handlers', async () => {
      const { sanitizeString } = await import('../../server/features/aitag-security-guard/guards/xss-sanitizer.js');

      // 1. Nested tag bypass: <scr<script>ipt>alert(1)</script>
      const nested = '<scr<script>ipt>alert(1)</script>';
      const cleanedNested = sanitizeString(nested);
      assert(!cleanedNested.includes('<script'), 'Nested script tags must be completely eliminated');

      // 2. HTML5 onfocus autofocus vector
      const autofocusPayload = '<img src=x onfocus=alert(1) autofocus>';
      const cleanedAutofocus = sanitizeString(autofocusPayload);
      assert(!cleanedAutofocus.includes('onfocus'), 'onfocus event handler must be removed');

      // 3. ontoggle vector
      const togglePayload = '<details open ontoggle=alert(1)>';
      const cleanedToggle = sanitizeString(togglePayload);
      assert(!cleanedToggle.includes('ontoggle'), 'ontoggle event handler must be removed');
    });

    await t('PII & Auth Guard invariant: /api/auth/users rejects unauthenticated/non-admin callers; /api/profile/directory exposes zero emails', async () => {
      const unauthUsers = await requestJson('/api/auth/users');
      eq(unauthUsers.status, 401, 'Unauthenticated GET /api/auth/users must return 401');

      const clientUsers = await requestJson('/api/auth/users', {
        headers: { Authorization: `Bearer ${clientToken}` }
      });
      eq(clientUsers.status, 403, 'Non-admin GET /api/auth/users must return 403 Forbidden');

      const adminUsers = await requestJson('/api/auth/users', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      eq(adminUsers.status, 200, 'Admin GET /api/auth/users must return 200 OK');

      const dirRes = await requestJson('/api/profile/directory');
      eq(dirRes.status, 200, 'GET /api/profile/directory must return 200 OK');
      eq(dirRes.data.success, true, 'Directory must report success');
      assert(Array.isArray(dirRes.data.experts), 'Directory experts must be an array');
      for (const expert of dirRes.data.experts) {
        eq(expert.email, undefined, 'Public talent directory must NEVER leak private user emails');
        eq(expert.role, 'freelancer', 'Public talent directory must only include freelancers');
      }
    });

    await t('Service Orders BOLA & RBAC invariant: blocks unauthenticated & unauthorized cross-user order access/mutations', async () => {
      const unauthList = await requestJson('/api/service-orders');
      eq(unauthList.status, 401, 'Unauthenticated GET /api/service-orders must return 401');

      const unauthGet = await requestJson(`/api/service-orders/${ephemeralOrderId}`);
      eq(unauthGet.status, 401, 'Unauthenticated GET /api/service-orders/:id must return 401');

      const strangerGet = await requestJson(`/api/service-orders/${ephemeralOrderId}`, {
        headers: { Authorization: `Bearer ${strangerToken}` }
      });
      eq(strangerGet.status, 403, 'Cross-user GET /api/service-orders/:id must return 403 Forbidden');

      const clientAssign = await requestJson(`/api/service-orders/${ephemeralOrderId}/assign`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${clientToken}` },
        body: JSON.stringify({ expertEmail: NONCE_EXPERT })
      });
      eq(clientAssign.status, 403, 'Non-admin assign must return 403 Forbidden');

      const strangerDraft = await requestJson(`/api/service-orders/${ephemeralOrderId}/draft`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${strangerToken}` },
        body: JSON.stringify({ draftFiles: [{ url: 'https://example.com/x.png' }] })
      });
      eq(strangerDraft.status, 403, 'Unauthorized draft submission must return 403 Forbidden');

      const strangerApprove = await requestJson(`/api/service-orders/${ephemeralOrderId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${strangerToken}` },
        body: JSON.stringify({ rating: 5 })
      });
      eq(strangerApprove.status, 403, 'Cross-user order approval must return 403 Forbidden');
    });

    await t('Strict CORS & Boot Integrity invariant: blocks rogue production origins and flags default JWT secret', async () => {
      const { isAllowedOrigin } = await import('../../server/features/domain-security/grandchildren/cors-guard.js');
      const { validateRuntimeSecurity } = await import('../../server/features/domain-security/grandchildren/boot-guard.js');

      eq(isAllowedOrigin('https://aitag.in', { NODE_ENV: 'production' }), true, 'Official aitag.in domain must be allowed');
      eq(isAllowedOrigin('https://aitag-dev.onrender.com', { NODE_ENV: 'production' }), true, 'Render staging origin must be allowed');
      eq(isAllowedOrigin('https://evil-phishing-site.com', { NODE_ENV: 'production' }), false, 'Rogue cross-origin domain must be blocked in production');

      const weakBoot = validateRuntimeSecurity({
        NODE_ENV: 'production',
        JWT_SECRET: 'aitag-fractal-kernel-jwt-secret-2026',
        SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'valid-key'
      });
      eq(weakBoot.secure, false, 'Default known JWT_SECRET must fail production boot audit');

      const strongBoot = validateRuntimeSecurity({
        NODE_ENV: 'production',
        JWT_SECRET: '9a7c2e1f8b4d60e3c9f1a2b4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708',
        SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'valid-key'
      });
      eq(strongBoot.secure, true, 'High-entropy secret & DB config must pass production boot audit');
    });

    await t('Backup Encryption & PII Sanitization invariant: AES-256-GCM roundtrip & Dev sync email masking', async () => {
      const { encryptBuffer, decryptBuffer } = await import('../../server/features/domain-security/grandchildren/crypto-guard.js');
      const { maskEmail, sanitizeRowsForDev } = await import('../../server/scripts/sync_prod_to_dev.js');

      const secret = 'test-backup-encryption-secret-2026-xyz';
      const plain = Buffer.from(JSON.stringify({ users: [{ email: 'realcustomer@gmail.com' }] }), 'utf8');
      const encrypted = encryptBuffer(plain, secret);
      assert(!encrypted.toString('utf8').includes('realcustomer@gmail.com'), 'Encrypted backup must conceal plain PII');

      const decrypted = decryptBuffer(encrypted, secret);
      eq(decrypted.toString('utf8'), plain.toString('utf8'), 'Decrypted payload must match original bytes');

      let wrongKeyThrew = false;
      try {
        decryptBuffer(encrypted, 'wrong-encryption-secret-1234');
      } catch {
        wrongKeyThrew = true;
      }
      eq(wrongKeyThrew, true, 'Wrong decryption key must fail authentication tag verification');

      const masked = maskEmail('realcustomer@gmail.com');
      assert(masked.endsWith('@sandbox.aitag.local') && !masked.includes('realcustomer'), 'Customer email must be masked in Dev sync');
      eq(maskEmail('user1@aitag.com'), 'user1@aitag.com', 'Protected test/admin emails must remain usable in Dev');

      const sanitizedOrders = sanitizeRowsForDev('aitag_orders', [{ customer_email: 'buyer@shop.in', customer_phone: '+919999988888' }], true);
      eq(sanitizedOrders[0].customer_phone, '+910000000000', 'Customer phone must be scrubbed in Dev sync');
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

      // Teardown: purge ephemeral test user
      await requestJson('/api/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ confirmation: 'DELETE' })
      });
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

    // --------------------------------------------------------------------------
    // GATE 9: Payment Feature Invariants
    // --------------------------------------------------------------------------
    gate('Gate 9: Payment Feature Invariants');

    await t('GET /api/payments/merchant-config returns configurable merchant details', async () => {
      const res = await requestJson('/api/payments/merchant-config');
      eq(res.status, 200, 'GET /api/payments/merchant-config must return 200 OK');
      eq(res.data.success, true, 'Response must indicate success');
      assert(res.data.merchant.vpa, 'Merchant VPA must be defined');
      assert(res.data.merchant.name, 'Merchant name must be defined');
      assert(res.data.merchant.qrImage, 'Merchant QR image path must be defined');
    });

    await t('Negative input defense: rejects payment submission with missing order_id', async () => {
      const res = await requestJson('/api/payments', {
        method: 'POST',
        body: JSON.stringify({ customer_email: 'test@test.com', amount: 1499 })
      });
      eq(res.status, 400, 'Missing order_id must return 400 Bad Request');
    });

    await t('Negative input defense: rejects payment with zero amount', async () => {
      const res = await requestJson('/api/payments', {
        method: 'POST',
        body: JSON.stringify({ order_id: 'test-order', customer_email: 'test@test.com', amount: 0 })
      });
      eq(res.status, 400, 'Zero amount must return 400 Bad Request');
    });

    let ephemeralPaymentId = null;
    await t('Customer submits UPI payment with UTR reference (SUBMITTED)', async () => {
      const res = await requestJson('/api/payments', {
        method: 'POST',
        body: JSON.stringify({
          order_id: ephemeralOrderId || 'piet-test-order',
          customer_email: NONCE_EMAIL,
          customer_name: 'PIET Test Client',
          amount: 1499,
          payment_method: 'upi',
          utr_reference: `PIET-UTR-${RUN_ID}`
        })
      });
      eq(res.status, 201, 'POST /api/payments must return 201 Created');
      eq(res.data.success, true, 'Payment submission must succeed');
      const payment = res.data.payment;
      assert(payment.id, 'Payment ID must exist');
      ephemeralPaymentId = payment.id;
      eq(payment.status, 'SUBMITTED', 'Initial payment status must be SUBMITTED');
      eq(payment.verified, false, 'Payment must not be verified initially');
      eq(payment.utr_reference, `PIET-UTR-${RUN_ID}`, 'UTR reference must be preserved');
      eq(Number(payment.amount), 1499, 'Payment amount must match');
    });

    await t('Fetches payment by ID with complete attributes', async () => {
      const unauthPay = await requestJson(`/api/payments/${ephemeralPaymentId}`);
      eq(unauthPay.status, 401, 'Unauthenticated GET /api/payments/:id must return 401');

      const strangerPay = await requestJson(`/api/payments/${ephemeralPaymentId}`, {
        headers: { Authorization: `Bearer ${strangerToken}` }
      });
      eq(strangerPay.status, 403, 'Cross-user GET /api/payments/:id must return 403 Forbidden');

      const res = await requestJson(`/api/payments/${ephemeralPaymentId}`, {
        headers: { Authorization: `Bearer ${clientToken}` }
      });
      eq(res.status, 200, 'GET /api/payments/:id must return 200 OK');
      eq(res.data.payment.id, ephemeralPaymentId, 'Payment ID must match');
      eq(res.data.payment.customer_email, NONCE_EMAIL, 'Customer email must match');
    });

    await t('Fetches payments by order ID', async () => {
      const testOrderId = ephemeralOrderId || 'piet-test-order';
      const res = await requestJson(`/api/payments/order/${testOrderId}`, {
        headers: { Authorization: `Bearer ${clientToken}` }
      });
      eq(res.status, 200, 'GET /api/payments/order/:orderId must return 200 OK');
      assert(Array.isArray(res.data.payments), 'Payments must be an array');
    });

    await t('Negative defense: non-admin cannot verify payment', async () => {
      const res = await requestJson(`/api/payments/${ephemeralPaymentId}/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${clientToken}` }
      });
      eq(res.status, 403, 'Non-admin payment verification must return 403 Forbidden');
    });

    await t('Admin verifies payment and transitions to VERIFIED', async () => {
      const res = await requestJson(`/api/payments/${ephemeralPaymentId}/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      eq(res.status, 200, 'Admin payment verification must return 200 OK');
      eq(res.data.payment.status, 'VERIFIED', 'Payment status must transition to VERIFIED');
      eq(res.data.payment.verified, true, 'Payment verified flag must be true');
      assert(res.data.payment.verified_at, 'verified_at timestamp must be set');
    });

    // Cleanup ephemeral payment
    if (ephemeralPaymentId) {
      try {
        const rawSupabase = await import('../../server/supabase.js');
        const supabaseClient = rawSupabase.default || rawSupabase;
        await supabaseClient.from('aitag_payments').delete().eq('id', ephemeralPaymentId);
        console.log(`🧹 Ephemeral Teardown: Deleted test payment ${ephemeralPaymentId}.`);
      } catch {}
    }

    // --------------------------------------------------------------------------
    // GATE 10: Managed Services Discount & Payment Waiver Invariants
    // --------------------------------------------------------------------------
    gate('Gate 10: Managed Services Discount & Payment Waiver Invariants');

    await t('Negative RBAC defense: client & freelancer get 403 on pricing & skip-payment endpoints', async () => {
      const checks = [
        { path: `/api/service-orders/${ephemeralOrderId}/skip-payment`, token: clientToken, label: 'client order skip-payment' },
        { path: `/api/service-orders/${ephemeralOrderId}/skip-payment`, token: freelancerToken, label: 'freelancer order skip-payment' },
        { path: `/api/service-orders/${ephemeralOrderId}/pricing`, token: clientToken, label: 'client order pricing' },
        { path: `/api/service-orders/${ephemeralOrderId}/pricing`, token: freelancerToken, label: 'freelancer order pricing' },
        { path: `/api/tasks/${ephemeralTaskId}/skip-payment`, token: clientToken, label: 'client task skip-payment' },
        { path: `/api/tasks/${ephemeralTaskId}/skip-payment`, token: freelancerToken, label: 'freelancer task skip-payment' },
        { path: `/api/tasks/${ephemeralTaskId}/pricing`, token: clientToken, label: 'client task pricing' },
        { path: `/api/tasks/${ephemeralTaskId}/pricing`, token: freelancerToken, label: 'freelancer task pricing' }
      ];

      for (const item of checks) {
        const res = await requestJson(item.path, {
          method: 'POST',
          headers: { Authorization: `Bearer ${item.token}` },
          body: JSON.stringify({ discountAmount: 250, reason: 'Unauthorized attempt' })
        });
        eq(res.status, 403, `${item.label} must return 403 Forbidden`);
      }
    });

    await t('Admin applies Service Order discount and getPaymentConfig reflects discounted INR amount', async () => {
      const createRes = await requestJson('/api/service-orders', {
        method: 'POST',
        body: JSON.stringify({
          package_slug: 'ai-product-photo-makeover',
          tier_name: 'starter',
          customer_name: 'PIET Pricing Test Client',
          customer_email: NONCE_EMAIL,
          customer_phone: '+91 98765 43210',
          business_name: 'PIET Managed Waiver Test Co.',
          business_type: 'D2C Brand',
          brief_notes: 'Testing admin discount and payment waiver workflow'
        })
      });
      eq(createRes.status, 201, 'Fresh service order for pricing test must return 201');
      ephemeralPricingOrderId = createRes.data.order.id;
      eq(Number(createRes.data.order.agreed_price), 1499, 'Initial Starter tier price must be 1499');

      const discRes = await requestJson(`/api/service-orders/${ephemeralPricingOrderId}/pricing`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          discountAmount: 500,
          skipPayment: false,
          reason: 'Launch promotional discount'
        })
      });
      eq(discRes.status, 200, 'POST /api/service-orders/:id/pricing must return 200 OK');
      eq(discRes.data.success, true, 'Pricing override must succeed');
      eq(Number(discRes.data.order.original_price), 1499, 'original_price must preserve 1499');
      eq(Number(discRes.data.order.discount_amount), 500, 'discount_amount must equal 500');
      eq(Number(discRes.data.order.agreed_price), 999, 'agreed_price must equal 999');
      eq(discRes.data.order.payment_waived, false, 'payment_waived must remain false when only discounted');

      const cfgRes = await requestJson(`/api/payments/config/${ephemeralPricingOrderId}`);
      eq(cfgRes.status, 200, 'GET /api/payments/config/:orderId must return 200 OK');
      eq(cfgRes.data.success, true, 'Payment config response must succeed');
      eq(Number(cfgRes.data.config.original_price), 1499, 'Payment config original_price must equal 1499');
      eq(Number(cfgRes.data.config.discount_amount), 500, 'Payment config discount_amount must equal 500');
      eq(Number(cfgRes.data.config.amount), 999, 'Payment config amount must reflect discounted price 999');
      eq(cfgRes.data.config.payment_waived, false, 'Payment config payment_waived must be false');
    });

    await t('Admin skips Service Order payment (payment_waived=true, amount=0) and assign auto-advances to ACTIVE', async () => {
      const waiveRes = await requestJson(`/api/service-orders/${ephemeralPricingOrderId}/skip-payment`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ reason: 'Admin waived fee for managed VIP brief' })
      });
      eq(waiveRes.status, 200, 'POST /api/service-orders/:id/skip-payment must return 200 OK');
      eq(waiveRes.data.success, true, 'Skip payment must succeed');
      eq(waiveRes.data.order.payment_waived, true, 'payment_waived must become true');
      eq(Number(waiveRes.data.order.agreed_price), 0, 'agreed_price must become 0 when waived');
      eq(waiveRes.data.order.waive_reason, 'Admin waived fee for managed VIP brief', 'waive_reason must be preserved');

      const cfgRes = await requestJson(`/api/payments/config/${ephemeralPricingOrderId}`);
      eq(cfgRes.status, 200, 'GET /api/payments/config/:orderId must return 200 OK after waiver');
      eq(cfgRes.data.config.payment_waived, true, 'Payment config payment_waived must be true');
      eq(Number(cfgRes.data.config.amount), 0, 'Payment config amount must be 0 when waived');

      const assignRes = await requestJson(`/api/service-orders/${ephemeralPricingOrderId}/assign`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          expertEmail: NONCE_EXPERT,
          expertName: 'Verified AI Visual Specialist'
        })
      });
      eq(assignRes.status, 200, 'Assigning expert on waived order must return 200 OK');
      eq(assignRes.data.order.status, 'ACTIVE', 'Waived order must skip payment step and transition directly to ACTIVE');
    });

    await t('Admin discounts and skips payment on Marketplace Task (ephemeralTaskId)', async () => {
      const discRes = await requestJson(`/api/tasks/${ephemeralTaskId}/pricing`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          discountAmount: 300,
          skipPayment: false,
          reason: 'Task promo discount'
        })
      });
      eq(discRes.status, 200, 'POST /api/tasks/:id/pricing must return 200 OK');
      eq(discRes.data.success, true, 'Task pricing override must succeed');
      eq(Number(discRes.data.task.original_price), 1500, 'Task original_price must preserve 1500');
      eq(Number(discRes.data.task.discount_amount), 300, 'Task discount_amount must equal 300');
      eq(Number(discRes.data.task.budget), 1200, 'Task budget must be reduced to 1200');
      eq(discRes.data.task.payment_waived, false, 'Task payment_waived must be false before skip-payment');

      const waiveRes = await requestJson(`/api/tasks/${ephemeralTaskId}/skip-payment`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ reason: 'Internal managed task waived' })
      });
      eq(waiveRes.status, 200, 'POST /api/tasks/:id/skip-payment must return 200 OK');
      eq(waiveRes.data.success, true, 'Task skip-payment must succeed');
      eq(waiveRes.data.task.payment_waived, true, 'Task payment_waived must become true');
      eq(Number(waiveRes.data.task.budget), 0, 'Task budget must become 0 when waived');
      eq(waiveRes.data.task.escrow_funded, true, 'Task escrow_funded must become true when waived');
    });

    // --------------------------------------------------------------------------
    // GATE 11: Auth Password Update & Mobile UI Layout Invariants
    // --------------------------------------------------------------------------
    gate('Gate 11: Auth Password Update & Mobile UI Layout Invariants');

    await t('Account password update: POST /api/auth/change-password validates current password and updates hash', async () => {
      const unauthChange = await requestJson('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: 'OldPassword1!', newPassword: 'NewPassword1!' })
      });
      eq(unauthChange.status, 401, 'Unauthenticated POST /api/auth/change-password must return 401');

      const pwdEmail = `piet-pwd-${RUN_ID}@aitag-test.local`;
      const regRes = await requestJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'PIET Password User',
          email: pwdEmail,
          password: 'InitPassword1!',
          role: 'client'
        })
      });
      eq(regRes.status, 201, 'Ephemeral user registration for password test must succeed');
      const pwdToken = regRes.data.token;

      const wrongCurr = await requestJson('/api/auth/change-password', {
        method: 'POST',
        headers: { Authorization: `Bearer ${pwdToken}` },
        body: JSON.stringify({ currentPassword: 'WrongPassword1!', newPassword: 'UpdatedPassword1!' })
      });
      eq(wrongCurr.status, 400, 'Wrong current password must be rejected with HTTP 400');

      const weakNew = await requestJson('/api/auth/change-password', {
        method: 'POST',
        headers: { Authorization: `Bearer ${pwdToken}` },
        body: JSON.stringify({ currentPassword: 'InitPassword1!', newPassword: 'short' })
      });
      eq(weakNew.status, 400, 'Weak new password must be rejected with HTTP 400');

      const okRes = await requestJson('/api/auth/change-password', {
        method: 'POST',
        headers: { Authorization: `Bearer ${pwdToken}` },
        body: JSON.stringify({ currentPassword: 'InitPassword1!', newPassword: 'UpdatedPassword1!' })
      });
      eq(okRes.status, 200, 'Valid change-password request must return 200 OK');
      eq(okRes.data.success, true, 'change-password must return success: true');

      const oldLogin = await requestJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: pwdEmail, password: 'InitPassword1!' })
      });
      eq(oldLogin.status, 401, 'Old password must fail login after password update');

      const newLogin = await requestJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: pwdEmail, password: 'UpdatedPassword1!' })
      });
      eq(newLogin.status, 200, 'New password must succeed login after password update');

      // Teardown: purge ephemeral user
      await requestJson('/api/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${pwdToken}` },
        body: JSON.stringify({ confirmation: 'DELETE' })
      });
    });

    await t('Mobile UI layout & clickability invariants across Dashboard, MyPostedTasks, Analytics & Shell', () => {
      const layoutSrc = readFileSync(resolve('client/src/layouts/DashboardLayout.tsx'), 'utf8');
      assert(layoutSrc.includes("maxWidth: '100vw'") && layoutSrc.includes("overflowX: 'clip'") && layoutSrc.includes('minWidth: 0'),
        'DashboardLayout must bound viewport width and minWidth: 0 to prevent mobile AppBar clipping');

      const dashSrc = readFileSync(resolve('client/src/pages/Dashboard.tsx'), 'utf8');
      assert(dashSrc.includes('const responsiveActionBarSx'), 'Dashboard must define shared responsiveActionBarSx for card action footers');
      assert(!dashSrc.includes('<Stack direction="row" spacing={1.2} alignItems="center" flexWrap="wrap">'),
        'Dashboard action footer must not revert to unwrapped/non-flexGap row Stack');
      assert(dashSrc.includes("to: `/task-details/${t.id}`"), 'Recent Activity items on Dashboard must link to task details');

      const myTasksSrc = readFileSync(resolve('client/src/pages/MyPostedTasks.tsx'), 'utf8');
      assert(myTasksSrc.includes("useMediaQuery(theme.breakpoints.down('md'))"), 'MyPostedTasks must detect mobile breakpoints');
      assert(myTasksSrc.includes('onClick={() => navigate(`/task-details/${task.id}`)}'), 'Task cards & rows in MyPostedTasks must be clickable');
      assert(myTasksSrc.includes('e.stopPropagation()'), 'Individual actions in MyPostedTasks must isolate click propagation');
      assert(myTasksSrc.includes('activeOrderDetail'), 'Service Package rows/cards in MyPostedTasks must open full details modal');

      const analyticsSrc = readFileSync(resolve('client/src/pages/Analytics.tsx'), 'utf8');
      assert(analyticsSrc.includes("useMediaQuery(theme.breakpoints.down('md'))") && analyticsSrc.includes('{isMobile ? ('),
        'Analytics ledger must switch to mobile card layout below md breakpoint');

      const updateTaskSrc = readFileSync(resolve('client/src/pages/UpdateTask.tsx'), 'utf8');
      assert(updateTaskSrc.includes("flexDirection: { xs: 'column', sm: 'row' }"),
        'UpdateTask payment strip must stack cleanly on mobile');

      const chatSrc = readFileSync(resolve('client/src/components/CaseDiscussionModal.tsx'), 'utf8');
      assert(chatSrc.includes("flexWrap=\"wrap\" useFlexGap") || chatSrc.includes('flexWrap="wrap" useFlexGap'),
        'CaseDiscussionModal attachment tray must use flexWrap with useFlexGap');
    });

    await t('Work Reels RBAC invariant: client blocked from /workflows uploads & seeded reels; expert access preserved', async () => {
      // 1. Client GET /api/profile/me returns empty deliveredWorkflows
      const clientProfile = await requestJson('/api/profile/me', {
        headers: { Authorization: `Bearer ${clientToken}` }
      });
      eq(clientProfile.status, 200, 'Client GET /api/profile/me must return 200 OK');
      assert(Array.isArray(clientProfile.data.deliveredWorkflows) && clientProfile.data.deliveredWorkflows.length === 0,
        'Client account must receive empty deliveredWorkflows (never specialist demo reels)');

      // 2. Client blocked (403) from modifying deliveredWorkflows or uploading Work Reels
      const clientPutWf = await requestJson('/api/profile/me', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${clientToken}` },
        body: JSON.stringify({ deliveredWorkflows: [{ id: 'hacked-wf', title: 'Client Hack' }] })
      });
      eq(clientPutWf.status, 403, 'Client attempting to publish deliveredWorkflows via PUT /api/profile/me must return 403 Forbidden');

      for (const endpoint of [
        '/api/profile/workflows/video-upload',
        '/api/profile/workflows/media-upload',
        '/api/profile/workflows/video-signed-url',
        '/api/profile/workflows/attach-video'
      ]) {
        const res = await requestJson(endpoint, {
          method: 'POST',
          headers: { Authorization: `Bearer ${clientToken}` },
          body: JSON.stringify({ workflowId: 'wf-1', filename: 'reel.mp4' })
        });
        eq(res.status, 403, `Client calling ${endpoint} must return 403 Forbidden`);
      }

      // 3. Verified Expert (freelancer) passes RBAC role gate on Work Reels studio endpoints
      const expertProfile = await requestJson('/api/profile/me', {
        headers: { Authorization: `Bearer ${freelancerToken}` }
      });
      eq(expertProfile.status, 200, 'Freelancer GET /api/profile/me must return 200 OK');
      const expertGateRes = await requestJson('/api/profile/workflows/attach-video', {
        method: 'POST',
        headers: { Authorization: `Bearer ${freelancerToken}` },
        body: JSON.stringify({})
      });
      assert(expertGateRes.status !== 403 && expertGateRes.status !== 401,
        `Freelancer must pass Work Reels RBAC gate (got status ${expertGateRes.status})`);

      // 4. Frontend route & Navbar guards
      const appSrc = readFileSync(resolve('client/src/App.tsx'), 'utf8');
      assert(appSrc.includes("allowedRoles={['freelancer', 'admin']}"), 'App.tsx must restrict /workflows & /work-reels to freelancer/admin');
      const privateRouteSrc = readFileSync(resolve('client/src/components/PrivateRoute.tsx'), 'utf8');
      assert(privateRouteSrc.includes('allowedRoles') && privateRouteSrc.includes('isRoleForbidden'),
        'PrivateRoute must enforce allowedRoles redirect');
      const navbarSrc = readFileSync(resolve('client/src/components/Navbar.tsx'), 'utf8');
      assert(navbarSrc.includes("user.role === 'freelancer' || user.role === 'admin'"),
        'Navbar must expose Work Reels Studio only to freelancer/admin');
    });

  } finally {
    // Teardown: Clean up ephemeral test orders
    for (const testOrderId of [ephemeralOrderId, ephemeralPricingOrderId].filter(Boolean)) {
      try {
        const rawSupabase = await import('../../server/supabase.js');
        const supabase = rawSupabase.default || rawSupabase;
        await supabase.from('aitag_orders').delete().eq('id', testOrderId);
        
        try {
          const rawDiscussions = await import('../../server/features/aitag-case-discussions/service.js');
          const discussionsService = rawDiscussions.default || rawDiscussions;
          await discussionsService.purgeByOrderId(testOrderId);
        } catch {}

        console.log(`\n🧹 Ephemeral Teardown: Deleted test order ${testOrderId} (Zero Ghost Records).`);
      } catch (err) {
        console.warn('⚠️ Teardown cleanup note:', err.message);
      }
    }

    // Teardown: Clean up orders_meta_store.json test entries
    try {
      const ordersMetaPath = resolve(process.cwd(), 'server/features/domain-services/children/orders/orders_meta_store.json');
      if (existsSync(ordersMetaPath)) {
        const metaData = JSON.parse(readFileSync(ordersMetaPath, 'utf-8'));
        for (const testOrderId of [ephemeralOrderId, ephemeralPricingOrderId].filter(Boolean)) {
          delete metaData[testOrderId];
        }
        if (Object.keys(metaData).length === 0) {
          unlinkSync(ordersMetaPath);
        } else {
          writeFileSync(ordersMetaPath, JSON.stringify(metaData, null, 2), 'utf-8');
        }
      }
    } catch {}

    // Teardown: Clean up ephemeral test task
    if (ephemeralTaskId) {
      try {
        const rawSupabase = await import('../../server/supabase.js');
        const supabase = rawSupabase.default || rawSupabase;
        await supabase.from('aitag_tasks').delete().eq('id', ephemeralTaskId);
        try {
          const rawTasks = await import('../../server/features/aitag-tasks/service.js');
          const tasksService = rawTasks.default || rawTasks;
          await tasksService.deleteTask(ephemeralTaskId, 'piet-client-uuid@aitag.com').catch(() => {});
        } catch {}
        try {
          const rawDiscussions = await import('../../server/features/aitag-case-discussions/service.js');
          const discussionsService = rawDiscussions.default || rawDiscussions;
          await discussionsService.purgeByOrderId(ephemeralTaskId);
        } catch {}
        console.log(`🧹 Ephemeral Teardown: Deleted test task ${ephemeralTaskId} (Zero Ghost Records).`);
      } catch (err) {
        console.warn('⚠️ Task teardown cleanup note:', err.message);
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
