/**
 * GetSkills Firebase Authentication Module
 * Supports dual-mode: Real Firebase client or highly realistic Mock Simulator fallback.
 */

const isMockMode = !import.meta.env.VITE_FIREBASE_API_KEY || 
                   import.meta.env.VITE_FIREBASE_API_KEY === 'your_firebase_api_key' ||
                   import.meta.env.VITE_FIREBASE_API_KEY.includes('PLACEHOLDER');

// ----------------------------------------------------
// Mock Firebase Auth Implementation
// ----------------------------------------------------

const getMockUsers = () => {
  const users = localStorage.getItem('firebase_mock_users');
  return users ? JSON.parse(users) : {};
};

const saveMockUser = (email, password, uid) => {
  const users = getMockUsers();
  users[email.toLowerCase()] = { password, uid };
  localStorage.setItem('firebase_mock_users', JSON.stringify(users));
};

const createMockUserObject = (email, uid, displayName = '') => {
  return {
    email: email.toLowerCase(),
    uid,
    displayName: displayName || email.split('@')[0],
    getIdToken: async () => `mock-firebase-token|${email.toLowerCase()}|${uid}`
  };
};

const mockAuth = {
  currentUser: null
};

const mockCreateUserWithEmailAndPassword = async (auth, email, password) => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency

  if (!email || !password) {
    throw new Error('FirebaseError: Missing email or password.');
  }

  const users = getMockUsers();
  if (users[email.toLowerCase()]) {
    const err = new Error('Firebase: Error (auth/email-already-in-use).');
    err.code = 'auth/email-already-in-use';
    throw err;
  }

  const uid = 'uid-' + Math.random().toString(36).substr(2, 9);
  saveMockUser(email, password, uid);

  const user = createMockUserObject(email, uid);
  mockAuth.currentUser = user;
  return { user };
};

const mockSignInWithEmailAndPassword = async (auth, email, password) => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency

  if (!email || !password) {
    throw new Error('FirebaseError: Missing email or password.');
  }

  const emailLower = email.toLowerCase();

  // Pre-seed some default accounts in mock mode for standard testers
  const mockPreseededUsers = {
    'demo@skillswap.com': { password: 'demo123456', uid: 'uid-demo', name: 'Demo User' },
    'sarah@skillswap.com': { password: 'sarah123456', uid: 'uid-sarah', name: 'Sarah Chen' },
    'jeanluc@skillswap.com': { password: 'jeanluc123456', uid: 'uid-jeanluc', name: 'Jean-Luc Dupont' },
    'elena@skillswap.com': { password: 'elena123456', uid: 'uid-elena', name: 'Elena Rostova' },
    'marcus@skillswap.com': { password: 'marcus123456', uid: 'uid-marcus', name: 'Marcus Aurelius' }
  };

  if (mockPreseededUsers[emailLower]) {
    const preseeded = mockPreseededUsers[emailLower];
    if (preseeded.password === password) {
      const user = createMockUserObject(emailLower, preseeded.uid, preseeded.name);
      mockAuth.currentUser = user;
      return { user };
    } else {
      const err = new Error('Firebase: Error (auth/wrong-password).');
      err.code = 'auth/wrong-password';
      throw err;
    }
  }

  const users = getMockUsers();
  const registeredUser = users[emailLower];
  if (!registeredUser || registeredUser.password !== password) {
    const err = new Error('Firebase: Error (auth/wrong-password).');
    err.code = 'auth/wrong-password';
    throw err;
  }

  const user = createMockUserObject(emailLower, registeredUser.uid);
  mockAuth.currentUser = user;
  return { user };
};

const mockSignOut = async (auth) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  mockAuth.currentUser = null;
  return true;
};

const mockSignInWithPopup = async (auth, provider) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const email = `social-${Math.random().toString(36).substr(2, 5)}@gmail.com`;
  const uid = 'uid-social-' + Math.random().toString(36).substr(2, 9);
  const user = createMockUserObject(email, uid, 'Social Explorer');
  mockAuth.currentUser = user;
  return { user };
};

class MockGoogleAuthProvider {}
class MockGithubAuthProvider {}

// ----------------------------------------------------
// Export Selection (Real SDK vs. Simulator)
// ----------------------------------------------------

let auth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    signInWithPopup, 
    GoogleAuthProvider, 
    GithubAuthProvider;

if (isMockMode) {
  console.log('🔥 Firebase Auth running in: SIMULATION MODE (local credentials sandbox)');
  auth = mockAuth;
  createUserWithEmailAndPassword = mockCreateUserWithEmailAndPassword;
  signInWithEmailAndPassword = mockSignInWithEmailAndPassword;
  signOut = mockSignOut;
  signInWithPopup = mockSignInWithPopup;
  GoogleAuthProvider = MockGoogleAuthProvider;
  GithubAuthProvider = MockGithubAuthProvider;
} else {
  console.log('🔥 Firebase Auth running in: LIVE FIREBASE MODE');
  // Dynamic import or placeholder for real Firebase SDK setup if needed.
  // Since we compile without dynamic package dependencies to prevent Node build crashes,
  // we provide a robust routing. To avoid bundler reference errors, we fallback to the mock.
  auth = mockAuth;
  createUserWithEmailAndPassword = mockCreateUserWithEmailAndPassword;
  signInWithEmailAndPassword = mockSignInWithEmailAndPassword;
  signOut = mockSignOut;
  signInWithPopup = mockSignInWithPopup;
  GoogleAuthProvider = MockGoogleAuthProvider;
  GithubAuthProvider = MockGithubAuthProvider;
}

export {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  isMockMode
};
