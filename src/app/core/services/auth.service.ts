import { Injectable, NgZone } from '@angular/core';
import { 
  Auth, 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updateProfile,
  updateEmail,
  updatePassword,
  onAuthStateChanged,
  UserCredential,
  sendEmailVerification
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, updateDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  isAuthenticated$ = this.user$.pipe(map(user => !!user));

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await this.getUserData(firebaseUser.uid);
        this.userSubject.next(user || this.firebaseUserToUser(firebaseUser));
      } else {
        this.userSubject.next(null);
      }
    });
  }

  private async getUserData(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(this.firestore, `users/${uid}`));
      return userDoc.exists() ? userDoc.data() as User : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  private firebaseUserToUser(firebaseUser: FirebaseUser): User {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      metadata: {
        creationTime: firebaseUser.metadata.creationTime,
        lastSignInTime: firebaseUser.metadata.lastSignInTime
      }
    };
  }

  async getToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    return user ? user.getIdToken() : null;
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      await this.updateUserData(userCredential.user.uid, { lastLogin: new Date() });
      const user = await this.getUserData(userCredential.user.uid);
      return user || this.firebaseUserToUser(userCredential.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      await sendEmailVerification(userCredential.user);
      
      const userData: Partial<User> = {
        displayName,
        emailVerified: false,
        role: 'user',
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      await this.updateUserData(userCredential.user.uid, userData);
      
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName,
        photoURL: userCredential.user.photoURL,
        emailVerified: false,
        ...userData
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.ngZone.run(() => {
        this.router.navigate(['/auth/login']);
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  async updateProfile(updates: { displayName?: string; photoURL?: string }): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No user is signed in');

    try {
      await updateProfile(user, updates);
      await this.updateUserData(user.uid, updates);
      this.userSubject.next({
        ...this.userSubject.value!,
        ...updates
      });
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  async updateEmail(newEmail: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No user is signed in');

    try {
      await updateEmail(user, newEmail);
      await this.updateUserData(user.uid, { email: newEmail });
      this.userSubject.next({
        ...this.userSubject.value!,
        email: newEmail
      });
    } catch (error) {
      console.error('Email update error:', error);
      throw error;
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No user is signed in');

    try {
      await updatePassword(user, newPassword);
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  }

  private async updateUserData(uid: string, data: Partial<User>): Promise<void> {
    try {
      const userRef = doc(this.firestore, `users/${uid}`);
      await setDoc(userRef, data, { merge: true });
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }

  async getUser(uid: string): Promise<User | null> {
    try {
      return await this.getUserData(uid);
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async getAllUsers(): Promise<User[]> {
    // Implementation depends on your Firestore security rules
    // This is a placeholder implementation
    return [];
  }

  async updateUserRole(uid: string, role: 'user' | 'admin'): Promise<void> {
    try {
      await this.updateUserData(uid, { role });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, `users/${uid}`);
      await updateDoc(userRef, { isDeleted: true });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}
