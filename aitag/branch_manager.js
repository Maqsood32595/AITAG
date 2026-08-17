#!/usr/bin/env node
/**
 * AITAG Branch & Fractal Kernel Lifecycle Manager CLI
 * ===================================================
 * Simplifies creating and verifying feature branches aligned with Fractal slices.
 *
 * Usage:
 *   node aitag/branch_manager.js status
 *   node aitag/branch_manager.js create feature/aitag-invitations
 *   node aitag/branch_manager.js verify
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const command = process.argv[2] || 'status';
const targetBranch = process.argv[3];

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch (err) {
    return null;
  }
}

console.log('======================================================================');
console.log('🌳 AITAG BRANCH & FRACTAL KERNEL MANAGER');
console.log('======================================================================');

switch (command) {
  case 'status': {
    const currentBranch = runCmd('git branch --show-current') || 'unknown';
    console.log(`📌 Current Git Branch: ${currentBranch}`);

    // Scan Fractal Slices
    const featuresDir = path.join(__dirname, '../server/features');
    if (fs.existsSync(featuresDir)) {
      const slices = fs.readdirSync(featuresDir).filter(f => fs.statSync(path.join(featuresDir, f)).isDirectory());
      console.log(`\n🧩 Active Fractal Micro-Slices (${slices.length}):`);
      slices.forEach(s => console.log(`   - server/features/${s}`));
    }
    break;
  }

  case 'create': {
    if (!targetBranch) {
      console.error('❌ Please specify a branch name: node branch_manager.js create feature/<slice-name>');
      process.exit(1);
    }
    console.log(`🚀 Creating and switching to branch: ${targetBranch}...`);
    execSync(`git checkout -b ${targetBranch}`, { stdio: 'inherit' });
    console.log(`✅ Switched to ${targetBranch}. Ready for in-memory development.`);
    break;
  }

  case 'verify': {
    console.log('🧪 Running Pre-Flight Verifications:');
    console.log('1. Checking Client Build...');
    execSync('npm run build', { cwd: path.join(__dirname, '../client'), stdio: 'inherit' });
    console.log('✅ Client compilation passed (0 errors).');

    console.log('\n2. Checking Server Fractal Kernel Bootstrap...');
    execSync('node -e "const k = require(\'./server/kernel\'); const express = require(\'express\'); k.init(express());"', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    console.log('✅ Server Kernel bootstrapped cleanly.');
    break;
  }

  default:
    console.log(`Unknown command: ${command}. Available: status, create, verify`);
}
