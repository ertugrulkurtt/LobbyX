#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function deployRules() {
  try {
    console.log('Deploying Firebase rules...');
    
    // Check if firebase CLI is available
    try {
      await execAsync('which firebase');
    } catch (error) {
      console.error('Firebase CLI not found. Please install it with: npm install -g firebase-tools');
      process.exit(1);
    }

    // Deploy Firestore rules
    console.log('Deploying Firestore rules...');
    await execAsync('firebase deploy --only firestore:rules');
    
    // Deploy Storage rules
    console.log('Deploying Storage rules...');
    await execAsync('firebase deploy --only storage');
    
    console.log('Rules deployed successfully!');
  } catch (error) {
    console.error('Error deploying rules:', error.message);
    console.log('If you haven\'t logged in to Firebase CLI, run: firebase login');
    console.log('If you haven\'t initialized the project, run: firebase init');
  }
}

deployRules();
