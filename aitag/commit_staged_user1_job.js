/**
 * Commit Staged RAM Changes: User1 Admin & Website Building Job
 * =============================================================
 * Executes HITL-Approved persistent sync.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const authService = require('../server/features/aitag-auth/service');
const tasksService = require('../server/features/aitag-tasks/service');

async function commitStagedChanges() {
  console.log('======================================================================');
  console.log('🚀 COMMITTING HITL-APPROVED USER1 & JOB POSTING TO LIVE SYSTEM');
  console.log('======================================================================\n');

  // 1. Provision / Register User1 (Admin)
  console.log('👤 [1/2] Creating User1 (Role: Admin)...');
  let userRecord = null;
  let authToken = null;

  try {
    const regResult = await authService.register({
      name: 'User1',
      email: 'user1@aitag.com',
      password: 'admin',
      role: 'admin',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User1'
    });
    userRecord = regResult.user;
    authToken = regResult.token;
    console.log(`  ✅ User1 created successfully (ID: ${userRecord.id})`);
  } catch (err) {
    if (err.message.includes('already registered')) {
      console.log('  ℹ️ User1 already exists, logging in...');
      const loginResult = await authService.login({
        email: 'user1@aitag.com',
        password: 'admin'
      });
      userRecord = loginResult.user;
      authToken = loginResult.token;
      console.log(`  ✅ User1 logged in successfully (ID: ${userRecord.id})`);
    } else {
      throw err;
    }
  }

  // 2. Post Website Building Job
  console.log('\n📝 [2/2] Posting "Full-Stack Responsive Website Building for E-Commerce"...');
  const deadlineDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const task = await tasksService.createTask({
    title: 'Full-Stack Responsive Website Building for E-Commerce',
    category: 'Web Development',
    description: 'Looking for a seasoned developer to build a modern, high-performance website with Next.js, React, TailwindCSS, and Stripe checkout integration.',
    deadline: deadlineDate,
    budget: 35000,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    userEmail: userRecord.email,
    userName: userRecord.name
  });

  console.log('  ✅ Job posted successfully!');
  console.log(`  📌 Task ID:  ${task.id}`);
  console.log(`  📄 Title:    "${task.title}"`);
  console.log(`  🏷️  Category: ${task.category}`);
  console.log(`  💰 Budget:   ₹${task.budget}`);
  console.log(`  📅 Deadline: ${task.deadline}`);
  console.log(`  👤 Posted By:${task.user_name} (${task.user_email})`);

  console.log('\n======================================================================');
  console.log('🎉 HITL COMMIT SUCCESSFUL: User1 & Job are live in the database and UI!');
  console.log('======================================================================');
}

commitStagedChanges().catch(err => {
  console.error('\n❌ Commit failed:', err.message);
  process.exit(1);
});
