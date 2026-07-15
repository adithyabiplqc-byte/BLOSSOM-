import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App gracefully
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();
// Request spreadsheet and drive.file access
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let cachedAccessToken: string | null = localStorage.getItem('GOOGLE_ACCESS_TOKEN');
let isSigningIn = false;

// Listen to Auth state changes
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // If logged in but no token cached in session, sign-out or require re-auth
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      localStorage.removeItem('GOOGLE_ACCESS_TOKEN');
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve Google OAuth access token.');
    }

    cachedAccessToken = credential.accessToken;
    localStorage.setItem('GOOGLE_ACCESS_TOKEN', cachedAccessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('OAuth Sign in error:', error);
    if (error.code === 'auth/unauthorized-domain' || error.message?.includes('unauthorized-domain')) {
      const hostname = window.location.hostname;
      const customErr = new Error(`Firebase Domain Authorization Required. Your current domain "${hostname}" is not authorized in your Firebase Project configuration. Please add "${hostname}" under Authentication > Settings > Authorized domains in the Firebase Console.`);
      (customErr as any).isUnauthorizedDomain = true;
      (customErr as any).hostname = hostname;
      (customErr as any).code = 'auth/unauthorized-domain';
      throw customErr;
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  localStorage.removeItem('GOOGLE_ACCESS_TOKEN');
  localStorage.removeItem('VITE_SPREADSHEET_ID');
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken || localStorage.getItem('GOOGLE_ACCESS_TOKEN');
};
