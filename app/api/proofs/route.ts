import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

function getFirestore() {
    if (admin.apps.length) {
        return admin.firestore();
    }

    try {
        let serviceAccount = null;

        // Load from environment variable (for Vercel/production)
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            console.log('📦 Loading Firebase credentials from environment variable...');
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        }

        if (!serviceAccount) {
            console.warn('⚠️ Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT env var');
            return null;
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        return admin.firestore();
    } catch (error) {
        console.warn('⚠️ Firebase Admin not initialized:', error);
        return null;
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
        return NextResponse.json({ error: 'Missing uid parameter' }, { status: 400 });
    }

    const db = getFirestore();
    if (!db) {
        return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    try {
        const snapshot = await db.collection('verifications')
            .where('firebaseUid', '==', uid)
            .where('status', '==', 'verified')
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();

        const proofs = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => doc.data());

        return NextResponse.json({ proofs });
    } catch (error: unknown) {
        console.error('Error fetching proofs:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
