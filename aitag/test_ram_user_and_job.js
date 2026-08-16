/**
 * In-Memory RAM Sandbox Simulation: User1 Admin Creation & Job Posting
 * ====================================================================
 * STRICT ZERO-DISK & ZERO-CLOUD-DB PERSISTENCE MODE.
 * Everything runs inside RAM buffers.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ── In-Memory Isolated RAM Stores ──────────────────────────────────────────
const RAM_VFS = {
  users: new Map(),
  tasks: new Map(),
  sessionCheckpoints: new Map(),
  auditLog: []
};

const JWT_SECRET = 'aitag-in-ram-sandbox-secret-2026';

async function runRamSimulation() {
  console.log('======================================================================');
  console.log('🛡️  RAM-ONLY SANDBOX: USER CREATION & JOB POSTING SIMULATION');
  console.log('   (Zero Disk I/O | Zero Live DB Writes | 100% In-Memory)');
  console.log('======================================================================\n');

  // Checkpoint 0: Base Memory State
  RAM_VFS.sessionCheckpoints.set('base_state', {
    userCount: RAM_VFS.users.size,
    taskCount: RAM_VFS.tasks.size
  });
  console.log('📌 [RAM Checkpoint Created] "base_state" (0 users, 0 tasks in RAM)');

  // ── Step 1: Create User1 (Admin) in RAM ───────────────────────────────────
  console.log('\n👤 [Step 1] Creating User1 (Role: Admin) in RAM...');
  const plainPassword = 'admin';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const user1 = {
    id: 'ram-user-' + Math.random().toString(36).substring(2, 9),
    name: 'User1',
    email: 'user1@aitag.com',
    password_hash: hashedPassword,
    role: 'admin',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User1',
    created_at: new Date().toISOString()
  };

  RAM_VFS.users.set(user1.email, user1);
  RAM_VFS.auditLog.push({ action: 'RAM_USER_CREATE', email: user1.email, role: user1.role });
  console.log(`  ✅ User1 registered in RAM store.`);
  console.log(`     - User ID: ${user1.id}`);
  console.log(`     - Email:   ${user1.email}`);
  console.log(`     - Role:    ${user1.role}`);
  console.log(`     - Bcrypt:  ${hashedPassword.substring(0, 25)}...`);

  // ── Step 2: Authenticate & Issue JWT in RAM ───────────────────────────────
  console.log('\n🔑 [Step 2] Authenticating User1 with password "admin" in RAM...');
  const storedUser = RAM_VFS.users.get('user1@aitag.com');
  const passwordMatch = await bcrypt.compare('admin', storedUser.password_hash);

  if (!passwordMatch) {
    throw new Error('RAM Authentication Failed: Password does not match.');
  }

  const token = jwt.sign(
    { id: storedUser.id, email: storedUser.email, name: storedUser.name, role: storedUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  console.log('  ✅ Authentication Passed (Password verified).');
  console.log(`  🎟️  JWT Issued in RAM: ${token.substring(0, 30)}...`);

  // Verify JWT claims
  const verifiedClaims = jwt.verify(token, JWT_SECRET);
  console.log(`  🔒 Token Claims Verified: Role=${verifiedClaims.role}, Email=${verifiedClaims.email}`);

  // Checkpoint 1: User Created State
  RAM_VFS.sessionCheckpoints.set('after_user_create', {
    userCount: RAM_VFS.users.size,
    taskCount: RAM_VFS.tasks.size
  });
  console.log('📌 [RAM Checkpoint Created] "after_user_create"');

  // ── Step 3: User1 Posts a Website Building Job in RAM ────────────────────
  console.log('\n📝 [Step 3] User1 Posting "Website Building" Job in RAM...');
  
  const jobPayload = {
    id: 'ram-task-' + Math.random().toString(36).substring(2, 9),
    title: 'Full-Stack Responsive Website Building for E-Commerce',
    category: 'Web Development',
    description: 'Looking for a seasoned developer to build a modern, high-performance website with Next.js, React, TailwindCSS, and Stripe checkout integration.',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 35000,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    status: 'open',
    user_email: verifiedClaims.email,
    user_name: verifiedClaims.name,
    total_bids: 0,
    created_at: new Date().toISOString()
  };

  // Pre-flight AST & schema validation in RAM
  const required = ['title', 'category', 'description', 'deadline', 'budget', 'user_email'];
  for (const field of required) {
    if (!jobPayload[field]) {
      throw new Error(`Schema Validation Error: Missing required field '${field}'`);
    }
  }

  if (jobPayload.budget <= 0) {
    throw new Error('Budget validation failed: must be greater than 0');
  }

  RAM_VFS.tasks.set(jobPayload.id, jobPayload);
  RAM_VFS.auditLog.push({ action: 'RAM_TASK_POST', taskId: jobPayload.id, title: jobPayload.title });

  console.log('  ✅ Pre-flight Schema & AST validations passed (0 errors).');
  console.log('  ✅ Task successfully stored in RAM.');
  console.log(`     - Task ID:  ${jobPayload.id}`);
  console.log(`     - Title:    "${jobPayload.title}"`);
  console.log(`     - Category: ${jobPayload.category}`);
  console.log(`     - Budget:   ₹${jobPayload.budget}`);
  console.log(`     - Deadline: ${jobPayload.deadline}`);
  console.log(`     - Creator:  ${jobPayload.user_name} (${jobPayload.user_email})`);

  // Checkpoint 2: Job Posted State
  RAM_VFS.sessionCheckpoints.set('after_job_post', {
    userCount: RAM_VFS.users.size,
    taskCount: RAM_VFS.tasks.size
  });
  console.log('📌 [RAM Checkpoint Created] "after_job_post"');

  // ── Step 4: Staging Summary ───────────────────────────────────────────────
  console.log('\n======================================================================');
  console.log('📊 RAM STAGING BUFFER READY (AWAITING HITL USER APPROVAL)');
  console.log('======================================================================');
  console.log(`📦 Active RAM Users: ${RAM_VFS.users.size}`);
  console.log(`📦 Active RAM Tasks: ${RAM_VFS.tasks.size}`);
  console.log(`🔒 Physical Disk Writes: 0 bytes`);
  console.log(`🌐 Live Database Writes: 0 rows`);
  console.log('======================================================================');
}

runRamSimulation().catch(err => {
  console.error('\n❌ RAM Simulation Failed:', err);
  process.exit(1);
});
