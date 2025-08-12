#!/usr/bin/env node

// This script helps deploy Firebase rules
// Run: npm run deploy-rules or node deploy-rules.js

const { exec } = require('child_process');
const fs = require('fs');

console.log('🔥 Firebase Rules Deployment Helper');
console.log('====================================');

// Check if Firebase CLI is installed
exec('firebase --version', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Firebase CLI not found. Please install it first:');
    console.error('npm install -g firebase-tools');
    console.error('Then run: firebase login');
    return;
  }

  console.log(`✅ Firebase CLI version: ${stdout.trim()}`);
  
  // Check if rules files exist
  const rulesFiles = [
    'firestore.rules',
    'firestore.indexes.json',
    'database.rules.json',
    'storage.rules'
  ];

  const missingFiles = rulesFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    console.error('❌ Missing rules files:', missingFiles);
    return;
  }

  console.log('✅ All rules files found');
  console.log('\n📋 Rules files to deploy:');
  rulesFiles.forEach(file => {
    console.log(`  - ${file}`);
  });

  console.log('\n🚀 To deploy rules, run:');
  console.log('firebase deploy --only firestore:rules,firestore:indexes,database,storage');
  console.log('\n💡 Make sure you are logged in with: firebase login');
  console.log('💡 Make sure you have selected the right project: firebase use <project-id>');
});
