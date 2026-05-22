import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged as firebaseOnAuthStateChanged,
  createUserWithEmailAndPassword,
  getAuth
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { initializeApp, deleteApp } from "firebase/app";
import { auth, db, isMock } from "./config";
import firebaseConfig from "./config";

// Mock Users seed
const DEFAULT_MOCK_USERS = [
  {
    uid: "mock-admin-uid",
    email: "admin@restaurant.com",
    password: "admin123",
    role: "admin",
    displayName: "Admin Manager"
  },
  {
    uid: "mock-manager-uid",
    email: "manager@restaurant.com",
    password: "manager123",
    role: "manager",
    displayName: "Shift Manager"
  },
  {
    uid: "mock-customer-uid",
    email: "customer@restaurant.com",
    password: "customer123",
    role: "customer",
    displayName: "John Doe"
  }
];

if (isMock && !localStorage.getItem("mock_users")) {
  localStorage.setItem("mock_users", JSON.stringify(DEFAULT_MOCK_USERS));
}

// Store callbacks for mock state changes
const authCallbacks = new Set();
let mockCurrentUser = JSON.parse(localStorage.getItem("mock_user")) || null;

const triggerCallbacks = (user) => {
  authCallbacks.forEach(cb => cb(user));
};

export const authService = {
  login: async (email, password) => {
    if (isMock) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
          const found = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
          if (found) {
            mockCurrentUser = found;
            localStorage.setItem("mock_user", JSON.stringify(found));
            triggerCallbacks(found);
            resolve(found);
          } else {
            reject(new Error("Invalid credentials. Try guest/manager/admin accounts."));
          }
        }, 800);
      });
    } else {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    }
  },

  register: async (name, email, password, role = "customer") => {
    if (isMock) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
          if (mockUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            reject(new Error("Email already registered."));
            return;
          }
          const newUser = {
            uid: "mock-" + Date.now(),
            email: email.toLowerCase(),
            password,
            role,
            displayName: name
          };
          mockUsers.push(newUser);
          localStorage.setItem("mock_users", JSON.stringify(mockUsers));
          
          if (role === "customer") {
            mockCurrentUser = newUser;
            localStorage.setItem("mock_user", JSON.stringify(newUser));
            triggerCallbacks(newUser);
          }
          resolve(newUser);
        }, 800);
      });
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const profile = {
        uid: user.uid,
        email: email.toLowerCase(),
        displayName: name,
        role,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "users", user.uid), profile);
      return { ...user, ...profile };
    }
  },

  registerSecondary: async (name, email, password, role) => {
    if (isMock) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
          if (mockUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            reject(new Error("Email already registered."));
            return;
          }
          const newUser = {
            uid: "mock-" + Date.now(),
            email: email.toLowerCase(),
            password,
            role,
            displayName: name
          };
          mockUsers.push(newUser);
          localStorage.setItem("mock_users", JSON.stringify(mockUsers));
          resolve(newUser);
        }, 800);
      });
    } else {
      const tempAppName = "SecondaryApp-" + Date.now();
      const tempApp = initializeApp(firebaseConfig, tempAppName);
      const tempAuth = getAuth(tempApp);
      
      try {
        const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
        const user = userCredential.user;
        
        const profile = {
          uid: user.uid,
          email: email.toLowerCase(),
          displayName: name,
          role,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, "users", user.uid), profile);
        await signOut(tempAuth);
        return profile;
      } finally {
        await deleteApp(tempApp);
      }
    }
  },

  logout: async () => {
    if (isMock) {
      return new Promise((resolve) => {
        setTimeout(() => {
          mockCurrentUser = null;
          localStorage.removeItem("mock_user");
          triggerCallbacks(null);
          resolve();
        }, 500);
      });
    } else {
      await signOut(auth);
    }
  },

  getCurrentUser: () => {
    if (isMock) {
      return mockCurrentUser;
    }
    return auth?.currentUser || null;
  },

  getUserProfile: async (uid) => {
    if (isMock) {
      const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
      const user = mockUsers.find(u => u.uid === uid);
      return user || null;
    } else {
      const userDoc = await getDoc(doc(db, "users", uid));
      return userDoc.exists() ? userDoc.data() : null;
    }
  },

  onAuthStateChanged: (callback) => {
    if (isMock) {
      authCallbacks.add(callback);
      callback(mockCurrentUser);
      return () => {
        authCallbacks.delete(callback);
      };
    } else {
      return firebaseOnAuthStateChanged(auth, callback);
    }
  }
};
