const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
// Expects serviceAccountKey.json in the project root
let db = null;

function initializeFirebase() {
    if (admin.apps.length) {
        return admin.firestore();
    }

    try {
        const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');

        if (!fs.existsSync(serviceAccountPath)) {
            console.warn('⚠️ serviceAccountKey.json not found at:', serviceAccountPath);
            return null;
        }

        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

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

