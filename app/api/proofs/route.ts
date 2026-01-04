import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

function getFirestore() {
    if (admin.apps.length) {
        return admin.firestore();
    }

    try {
        const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');

        if (!fs.existsSync(serviceAccountPath)) {
            console.warn('⚠️ serviceAccountKey.json not found');
            return null;
        }

        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

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

        const proofs = snapshot.docs.map((doc: any) => doc.data());

        return NextResponse.json({ proofs });
    } catch (error: any) {
        console.error('Error fetching proofs:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
