const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
// Supports both environment variable (Railway) and file-based (local) configurations
let db = null;

function initializeFirebase() {
    if (admin.apps.length) {
        return admin.firestore();
    }

    try {
        let serviceAccount = null;

        // Option 1: Load from environment variable (for Railway/production)
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            console.log('📦 Loading Firebase credentials from environment variable...');
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } else {
            // Option 2: Load from file (for local development)
            // Try multiple possible file locations
            const possiblePaths = [
                path.join(process.cwd(), 'serviceAccountKey.json'),
                path.join(process.cwd(), 'credsetu-firebase-adminsdk-fbsvc-4f558f97cc.json')
            ];

            for (const filePath of possiblePaths) {
                if (fs.existsSync(filePath)) {
                    console.log(`📁 Loading Firebase credentials from: ${path.basename(filePath)}`);
                    serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    break;
                }
            }
        }

        if (!serviceAccount) {
            console.warn('⚠️ Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT env var or provide serviceAccountKey.json');
            return null;
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        console.log('✅ Firebase Admin initialized successfully');
        return admin.firestore();
    } catch (error) {
        console.warn('⚠️ Firebase Admin not initialized:', error.message);
        return null;
    }
}

db = initializeFirebase();

module.exports = { admin, db };
