// services/firebase.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Firebase v9+ imports
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  User,
  onAuthStateChanged,
  signOut,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';

// Interfaces
export interface ProfileData {
  devices: number;
  activeDays: number;
  dataUsage: string;
  displayName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeviceData {
  id: string;
  userId: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  lastUpdate: string;
  sensorType: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app!: FirebaseApp;
  private auth!: Auth;
  private firestore!: Firestore;
  
  private userSubject = new BehaviorSubject<User | null>(null);
  private profileSubject = new BehaviorSubject<ProfileData | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  constructor() {
    this.initializeFirebase();
    this.setupAuthListener();
  }

  private initializeFirebase() {
    try {
      this.app = initializeApp(environment.firebase);
      this.auth = getAuth(this.app);
      this.firestore = getFirestore(this.app);
      console.log('✅ Firebase initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
      this.initializeMockMode();
    }
  }

  private setupAuthListener() {
    if (this.auth) {
      onAuthStateChanged(this.auth, async (user) => {
        this.userSubject.next(user);
        if (user) {
          await this.loadProfileData(user.uid);
        } else {
          this.profileSubject.next(null);
        }
        this.loadingSubject.next(false);
      });
    }
  }

  private initializeMockMode() {
    console.warn('⚠️ Running in mock mode - Firebase not configured');
    setTimeout(() => {
      const mockUser = {
        uid: 'mock-user-123',
        displayName: 'John Smith',
        email: 'john.smith@email.com',
        photoURL: null
      } as User;
      
      this.userSubject.next(mockUser);
      this.profileSubject.next({
        devices: 3,
        activeDays: 156,
        dataUsage: '2.3GB',
        displayName: 'John Smith',
        createdAt: new Date().toISOString()
      });
    }, 1000);
  }

  // 🔹 Login User
  async login(email: string, password: string): Promise<User | null> {
    if (!this.auth) throw new Error('Auth not initialized');
    const userCredential: UserCredential = await signInWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;
    this.userSubject.next(user);
    return user;
  }

  // 🔹 Register User
  async register(email: string, password: string, name: string): Promise<User | null> {
    if (!this.auth) throw new Error('Auth not initialized');
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;

    if (user) {
      await updateProfile(user, { displayName: name });
      await this.createInitialProfile(user.uid);
      this.userSubject.next(user);
    }
    return user;
  }

  // 🔹 Reset Password
  async resetPassword(email: string): Promise<void> {
    if (!this.auth) throw new Error('Auth not initialized');
    await sendPasswordResetEmail(this.auth, email);
  }

  // Observables
  get user$(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  get profile$(): Observable<ProfileData | null> {
    return this.profileSubject.asObservable();
  }

  get loading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  // 🔹 Logout
  async signOut(): Promise<void> {
    this.loadingSubject.next(true);
    try {
      if (this.auth) {
        await signOut(this.auth);
      } else {
        this.userSubject.next(null);
        this.profileSubject.next(null);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  // 🔹 Update Profile
  async updateUserProfile(data: { displayName: string }): Promise<void> {
    this.loadingSubject.next(true);
    try {
      const user = this.currentUser;
      if (!user) throw new Error('No authenticated user');

      await updateProfile(user, { displayName: data.displayName });
      await this.updateFirestoreProfile(user.uid, {
        displayName: data.displayName,
        updatedAt: new Date().toISOString()
      });
      await this.loadProfileData(user.uid);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  // 🔹 Change Password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    this.loadingSubject.next(true);
    try {
      const user = this.currentUser;
      if (!user || !user.email) throw new Error('No authenticated user');

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      await this.logSecurityEvent(user.uid, 'password_changed');
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  // 🔹 Firestore Methods
  private async loadProfileData(userId: string): Promise<void> {
    try {
      const profileDoc = await getDoc(doc(this.firestore, 'users', userId));
      if (profileDoc.exists()) {
        this.profileSubject.next(profileDoc.data() as ProfileData);
      } else {
        await this.createInitialProfile(userId);
      }
      await this.updateDeviceCount(userId);
    } catch (error) {
      console.error('Load profile data error:', error);
    }
  }

  private async createInitialProfile(userId: string): Promise<void> {
    const initialProfile: ProfileData = {
      devices: 0,
      activeDays: 1,
      dataUsage: '0MB',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(this.firestore, 'users', userId), initialProfile);
    this.profileSubject.next(initialProfile);
  }

  private async updateFirestoreProfile(userId: string, data: Partial<ProfileData>): Promise<void> {
    await updateDoc(doc(this.firestore, 'users', userId), data);
  }

  private async updateDeviceCount(userId: string): Promise<void> {
    const devicesQuery = query(collection(this.firestore, 'devices'), where('userId', '==', userId));
    const devicesSnapshot = await getDocs(devicesQuery);
    const deviceCount = devicesSnapshot.size;

    await updateDoc(doc(this.firestore, 'users', userId), {
      devices: deviceCount,
      lastDeviceSync: new Date().toISOString()
    });

    const currentProfile = this.profileSubject.value;
    if (currentProfile) {
      this.profileSubject.next({ ...currentProfile, devices: deviceCount });
    }
  }

  private async logSecurityEvent(userId: string, event: string): Promise<void> {
    await setDoc(doc(this.firestore, 'security_logs', `${userId}_${Date.now()}`), {
      userId,
      event,
      timestamp: Timestamp.now(),
      userAgent: navigator.userAgent,
      ip: 'client-side'
    });
  }

  // 🔹 Device Management
  async getUserDevices(): Promise<DeviceData[]> {
    const user = this.currentUser;
    if (!user) return [];
    try {
      const devicesQuery = query(collection(this.firestore, 'devices'), where('userId', '==', user.uid));
      const devicesSnapshot = await getDocs(devicesQuery);
      return devicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DeviceData[];
    } catch (error) {
      console.error('Get user devices error:', error);
      return [];
    }
  }

  async addDevice(deviceData: Omit<DeviceData, 'id' | 'userId'>): Promise<string> {
    const user = this.currentUser;
    if (!user) throw new Error('No authenticated user');
    try {
      const newDeviceRef = doc(collection(this.firestore, 'devices'));
      const deviceWithUser = { ...deviceData, userId: user.uid, createdAt: new Date().toISOString() };
      await setDoc(newDeviceRef, deviceWithUser);
      await this.updateDeviceCount(user.uid);
      return newDeviceRef.id;
    } catch (error) {
      console.error('Add device error:', error);
      throw error;
    }
  }

  // 🔹 Utility
  isFirebaseConfigured(): boolean {
    return !!(this.app && this.auth && this.firestore);
  }

  getFirebaseConfig() {
    return {
      isConfigured: this.isFirebaseConfigured(),
      projectId: environment.firebase.projectId,
      authDomain: environment.firebase.authDomain
    };
  }
}