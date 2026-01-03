import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCBiq-yF1PpVbRQWnIU8FjwmS_ahN76pK8",
    authDomain: "credsetu.firebaseapp.com",
    projectId: "credsetu",
    storageBucket: "credsetu.firebasestorage.app",
    messagingSenderId: "177860622308",
    appId: "1:177860622308:web:8d8904f456997b382779f1",
    measurementId: "G-2S1LM4ZYE0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Login Failed", error);
        throw error;
    }
};

export const logout = async () => {
    await signOut(auth);
};
