import { Injectable, NgZone } from '@angular/core';
import { 
  Auth, 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updateProfile, 
  onAuthStateChanged, 
  UserCredential 
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  emailVerified: boolean;
  role?: 'user' | 'admin';
  lastLogin?: Date;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  currentUser$ = this.user$.pipe(take(1));

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    onAuthStateChanged(this.auth, (firebaseUser) => {
      if (firebaseUser) {
        const user = this.firebaseUserToUser(firebaseUser);
        this.userSubject.next(user);
      } else {
        this.userSubject.next(null);
      }
    });
  }

  private firebaseUserToUser(firebaseUser: FirebaseUser): User {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      role: 'user', // Default role
      lastLogin: new Date()
    };
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = this.firebaseUserToUser(userCredential.user);
      await this.updateUserData(user);
      this.ngZone.run(() => this.router.navigate(['/dashboard']));
    } catch (error) {
      console.error('Login error:', error);
      throw this.handleAuthError(error);
    }
  }

  async register(email: string, password: string, displayName: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      
      const user = this.firebaseUserToUser(userCredential.user);
      await this.setUserData(user);
      
      this.ngZone.run(() => this.router.navigate(['/dashboard']));
    } catch (error) {
      console.error('Registration error:', error);
      throw this.handleAuthError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.ngZone.run(() => this.router.navigate(['/auth/login']));
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw this.handleAuthError(error);
    }
  }

  private async setUserData(user: User): Promise<void> {
    const userRef = doc(this.firestore, `users/${user.uid}`);
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      role: user.role || 'user',
      lastLogin: user.lastLogin,
      createdAt: new Date()
    };

    await setDoc(userRef, userData, { merge: true });
  }

  private async updateUserData(user: User): Promise<void> {
    const userRef = doc(this.firestore, `users/${user.uid}`);
    const userData: Partial<User> = {
      lastLogin: new Date()
    };

    await updateDoc(userRef, userData);
  }

  private handleAuthError(error: any): Error {
    // Handle common Firebase Auth errors
    let errorMessage = 'An unexpected error occurred';
    
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage = 'Invalid email or password';
        break;
      case 'auth/email-already-in-use':
        errorMessage = 'Email already in use';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many attempts. Please try again later';
        break;
      default:
        errorMessage = error.message || 'Authentication failed';
    }

    return new Error(errorMessage);
  }

  // Helper method to get current user synchronously
  get currentUser(): User | null {
    return this.userSubject.value;
  }

  // Check if user is authenticated
  get isAuthenticated$(): Observable<boolean> {
    return this.user$.pipe(map(user => !!user));
  }

  // Check if user is admin
  get isAdmin$(): Observable<boolean> {
    return this.user$.pipe(
      map(user => user?.role === 'admin')
    );
  }
}